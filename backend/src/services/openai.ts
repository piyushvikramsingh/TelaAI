import OpenAI from 'openai';
import { logger, logAiOperation } from '../utils/logger';
import { cacheGet, cacheSet } from '../config/redis';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  userId?: string;
}

export interface ChatCompletionResult {
  content: string;
  model: string;
  tokensUsed: number;
  cost: number;
  processingTime: number;
}

// Token pricing per model (per 1K tokens)
const TOKEN_PRICING = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
} as const;

// Calculate cost based on tokens and model
const calculateCost = (model: string, inputTokens: number, outputTokens: number): number => {
  const pricing = TOKEN_PRICING[model as keyof typeof TOKEN_PRICING];
  if (!pricing) return 0;
  
  return (inputTokens / 1000 * pricing.input) + (outputTokens / 1000 * pricing.output);
};

// Generate cache key for chat completion
const generateCacheKey = (messages: ChatMessage[], options: ChatCompletionOptions): string => {
  const content = JSON.stringify({ messages, options });
  const crypto = require('crypto');
  return `chat:${crypto.createHash('md5').update(content).digest('hex')}`;
};

// Main chat completion function
export const getChatCompletion = async (
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<ChatCompletionResult> => {
  const startTime = Date.now();
  
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    maxTokens = 1000,
    stream = false,
    userId
  } = options;

  try {
    // Check cache for non-streaming requests
    if (!stream) {
      const cacheKey = generateCacheKey(messages, options);
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        const result = JSON.parse(cached);
        logger.info('Chat completion served from cache', { userId, model });
        return result;
      }
    }

    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false, // We'll handle streaming separately
    });

    const choice = completion.choices[0];
    if (!choice || !choice.message) {
      throw new Error('No response from OpenAI');
    }

    const content = choice.message.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;
    const cost = calculateCost(model, inputTokens, outputTokens);
    const processingTime = Date.now() - startTime;

    const result: ChatCompletionResult = {
      content,
      model,
      tokensUsed,
      cost,
      processingTime
    };

    // Cache the result for 1 hour
    if (!stream) {
      const cacheKey = generateCacheKey(messages, options);
      await cacheSet(cacheKey, JSON.stringify(result), 3600);
    }

    // Log the operation
    if (userId) {
      logAiOperation('chat_completion', userId, model, tokensUsed, cost);
    }

    logger.info('Chat completion successful', {
      userId,
      model,
      tokensUsed,
      cost,
      processingTime
    });

    return result;

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    
    logger.error('Chat completion failed', {
      error: error.message,
      userId,
      model,
      processingTime
    });

    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please check your billing.');
    }
    
    if (error.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key configuration.');
    }
    
    if (error.code === 'rate_limit_exceeded') {
      throw new Error('OpenAI rate limit exceeded. Please try again later.');
    }

    throw new Error(`AI service error: ${error.message}`);
  }
};

// Streaming chat completion
export const getChatCompletionStream = async (
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<ReadableStream> => {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    maxTokens = 1000,
    userId
  } = options;

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            if (delta?.content) {
              controller.enqueue(new TextEncoder().encode(delta.content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    if (userId) {
      logAiOperation('chat_completion_stream', userId, model);
    }

    return readable;

  } catch (error: any) {
    logger.error('Streaming chat completion failed', {
      error: error.message,
      userId,
      model
    });
    
    throw new Error(`AI streaming error: ${error.message}`);
  }
};

// Generate embeddings for text
export const generateEmbeddings = async (
  text: string,
  userId?: string
): Promise<number[]> => {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    const embedding = response.data[0]?.embedding;
    if (!embedding) {
      throw new Error('No embedding generated');
    }

    if (userId) {
      logAiOperation('generate_embeddings', userId, 'text-embedding-ada-002');
    }

    return embedding;

  } catch (error: any) {
    logger.error('Embedding generation failed', {
      error: error.message,
      userId
    });
    
    throw new Error(`Embedding generation error: ${error.message}`);
  }
};

// Generate code completion
export const generateCode = async (
  prompt: string,
  language: string = 'javascript',
  userId?: string
): Promise<ChatCompletionResult> => {
  const codePrompt: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an expert ${language} developer. Generate clean, well-commented, and efficient code based on the user's request. Follow best practices and include proper error handling where appropriate.`
    },
    {
      role: 'user',
      content: prompt
    }
  ];

  return getChatCompletion(codePrompt, {
    model: 'gpt-4',
    temperature: 0.3,
    maxTokens: 2000,
    userId
  });
};

// Analyze and summarize text
export const analyzeText = async (
  text: string,
  analysisType: 'summary' | 'sentiment' | 'keywords' | 'entities' = 'summary',
  userId?: string
): Promise<ChatCompletionResult> => {
  const analysisPrompts = {
    summary: 'Provide a concise summary of the following text:',
    sentiment: 'Analyze the sentiment of the following text and provide a detailed assessment:',
    keywords: 'Extract the key topics and keywords from the following text:',
    entities: 'Identify and extract named entities (people, places, organizations, etc.) from the following text:'
  };

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'You are an expert text analyst. Provide accurate and insightful analysis based on the user\'s request.'
    },
    {
      role: 'user',
      content: `${analysisPrompts[analysisType]}\n\n${text}`
    }
  ];

  return getChatCompletion(messages, {
    model: 'gpt-4o-mini',
    temperature: 0.3,
    maxTokens: 1000,
    userId
  });
};

// Generate creative content
export const generateCreativeContent = async (
  prompt: string,
  contentType: 'story' | 'poem' | 'script' | 'article' | 'social_post' = 'article',
  userId?: string
): Promise<ChatCompletionResult> => {
  const contentPrompts = {
    story: 'Write an engaging short story based on the following prompt:',
    poem: 'Write a creative and expressive poem based on the following theme:',
    script: 'Write a compelling script or dialogue based on the following scenario:',
    article: 'Write an informative and well-structured article about:',
    social_post: 'Write an engaging social media post about:'
  };

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a creative writer specializing in ${contentType.replace('_', ' ')}s. Create engaging, original content that captures the reader's attention.`
    },
    {
      role: 'user',
      content: `${contentPrompts[contentType]} ${prompt}`
    }
  ];

  return getChatCompletion(messages, {
    model: 'gpt-4',
    temperature: 0.8,
    maxTokens: 2000,
    userId
  });
};

// Check if OpenAI API is configured and working
export const checkOpenAIHealth = async (): Promise<boolean> => {
  try {
    const response = await openai.models.list();
    return response.data.length > 0;
  } catch (error) {
    logger.error('OpenAI health check failed:', error);
    return false;
  }
};

// Get available models
export const getAvailableModels = async (): Promise<string[]> => {
  try {
    const response = await openai.models.list();
    return response.data
      .filter(model => model.id.includes('gpt'))
      .map(model => model.id)
      .sort();
  } catch (error) {
    logger.error('Failed to get available models:', error);
    return ['gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4'];
  }
};