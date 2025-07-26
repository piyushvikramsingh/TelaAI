import OpenAI from 'openai';
import { config } from '../config/environment';
import { logger } from '../utils/logger';
import { OpenAIMessage, OpenAICompletionOptions } from '../types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

class OpenAIService {
  /**
   * Get chat completion from OpenAI
   */
  static async getChatCompletion(
    messages: OpenAIMessage[],
    options: OpenAICompletionOptions = {}
  ): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: options.model || config.openai.model,
        messages: messages,
        max_tokens: options.maxTokens || config.openai.maxTokens,
        temperature: options.temperature || 0.7,
        stream: false,
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response received from OpenAI');
      }

      logger.info('OpenAI chat completion successful', {
        model: completion.model,
        usage: completion.usage,
        messageCount: messages.length,
      });

      return response.trim();
    } catch (error) {
      logger.error('OpenAI chat completion failed', { error });
      
      if (error instanceof OpenAI.APIError) {
        if (error.status === 401) {
          throw new Error('Invalid OpenAI API key');
        } else if (error.status === 429) {
          throw new Error('OpenAI rate limit exceeded');
        } else if (error.status === 400) {
          throw new Error('Invalid request to OpenAI API');
        }
      }
      
      throw new Error('Failed to get AI response');
    }
  }

  /**
   * Get streaming chat completion
   */
  static async getStreamingChatCompletion(
    messages: OpenAIMessage[],
    onChunk: (chunk: string) => void,
    options: OpenAICompletionOptions = {}
  ): Promise<void> {
    try {
      const stream = await openai.chat.completions.create({
        model: options.model || config.openai.model,
        messages: messages,
        max_tokens: options.maxTokens || config.openai.maxTokens,
        temperature: options.temperature || 0.7,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          onChunk(content);
        }
      }

      logger.info('OpenAI streaming completion successful', {
        messageCount: messages.length,
      });
    } catch (error) {
      logger.error('OpenAI streaming completion failed', { error });
      throw new Error('Failed to get streaming AI response');
    }
  }

  /**
   * Generate task suggestions based on user context
   */
  static async generateTaskSuggestions(
    userContext: string,
    existingTasks: string[] = [],
    category?: string
  ): Promise<string[]> {
    const systemPrompt = `You are a productivity AI assistant. Generate 3-5 relevant, actionable task suggestions based on the user's context and needs. 
    Make tasks specific, achievable, and valuable. Avoid suggesting tasks that already exist.
    
    ${category ? `Focus on tasks related to: ${category}` : ''}
    
    Return only a JSON array of task titles, nothing else.`;

    const userPrompt = `User context: ${userContext}
    
    Existing tasks to avoid duplicating:
    ${existingTasks.join('\n')}
    
    Generate new task suggestions:`;

    try {
      const response = await this.getChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { temperature: 0.8 });

      const suggestions = JSON.parse(response);
      return Array.isArray(suggestions) ? suggestions.slice(0, 5) : [];
    } catch (error) {
      logger.error('Failed to generate task suggestions', { error });
      return [];
    }
  }

  /**
   * Generate design concepts
   */
  static async generateDesignConcept(
    prompt: string,
    type: string,
    style?: string
  ): Promise<{ description: string; code?: string; suggestions: string[] }> {
    const systemPrompt = `You are a creative design AI assistant specialized in ${type} design. 
    Generate a detailed design concept description and if applicable, provide HTML/CSS code for implementation.
    Also suggest 3 variations or improvements.
    
    Return response in JSON format:
    {
      "description": "Detailed design description",
      "code": "HTML/CSS code if applicable (optional)",
      "suggestions": ["variation 1", "variation 2", "variation 3"]
    }`;

    const userPrompt = `Design type: ${type}
    ${style ? `Style preference: ${style}` : ''}
    
    Design prompt: ${prompt}`;

    try {
      const response = await this.getChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { temperature: 0.8 });

      return JSON.parse(response);
    } catch (error) {
      logger.error('Failed to generate design concept', { error });
      return {
        description: 'Unable to generate design concept at this time.',
        suggestions: []
      };
    }
  }

  /**
   * Analyze and extract insights from user data
   */
  static async analyzeUserData(
    data: any,
    analysisType: string = 'general'
  ): Promise<{ insights: string[]; recommendations: string[]; summary: string }> {
    const systemPrompt = `You are a data analysis AI assistant. Analyze the provided user data and extract meaningful insights.
    Focus on patterns, trends, and actionable recommendations.
    
    Return response in JSON format:
    {
      "insights": ["insight 1", "insight 2", "insight 3"],
      "recommendations": ["recommendation 1", "recommendation 2"],
      "summary": "Overall summary of the analysis"
    }`;

    const userPrompt = `Analysis type: ${analysisType}
    
    Data to analyze:
    ${JSON.stringify(data, null, 2)}`;

    try {
      const response = await this.getChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { temperature: 0.5 });

      return JSON.parse(response);
    } catch (error) {
      logger.error('Failed to analyze user data', { error });
      return {
        insights: [],
        recommendations: [],
        summary: 'Unable to analyze data at this time.'
      };
    }
  }

  /**
   * Generate code based on description
   */
  static async generateCode(
    description: string,
    language: string,
    context?: string
  ): Promise<{ code: string; explanation: string; improvements: string[] }> {
    const systemPrompt = `You are a coding AI assistant. Generate clean, efficient ${language} code based on the description.
    Provide explanation and suggest improvements.
    
    Return response in JSON format:
    {
      "code": "Generated code",
      "explanation": "Explanation of the code",
      "improvements": ["improvement 1", "improvement 2"]
    }`;

    const userPrompt = `Language: ${language}
    ${context ? `Context: ${context}` : ''}
    
    Description: ${description}`;

    try {
      const response = await this.getChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { temperature: 0.3 });

      return JSON.parse(response);
    } catch (error) {
      logger.error('Failed to generate code', { error });
      return {
        code: '// Unable to generate code at this time',
        explanation: 'Code generation failed',
        improvements: []
      };
    }
  }

  /**
   * Summarize conversation for memory storage
   */
  static async summarizeConversation(
    messages: OpenAIMessage[],
    maxLength: number = 200
  ): Promise<string> {
    if (messages.length < 3) return '';

    const systemPrompt = `Summarize this conversation in ${maxLength} characters or less. 
    Focus on key topics, decisions, and important information that should be remembered.`;

    const conversationText = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    try {
      const response = await this.getChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: conversationText }
      ], { temperature: 0.3, maxTokens: 100 });

      return response.slice(0, maxLength);
    } catch (error) {
      logger.error('Failed to summarize conversation', { error });
      return '';
    }
  }

  /**
   * Extract important information for memory
   */
  static async extractMemoryKeyValue(
    content: string,
    type: 'preference' | 'context' | 'skill' | 'project' | 'note'
  ): Promise<{ key: string; value: any; importance: number; tags: string[] } | null> {
    const systemPrompt = `Extract key information from the content for memory storage.
    
    Return response in JSON format:
    {
      "key": "A short, descriptive key",
      "value": "The important information",
      "importance": 1-10,
      "tags": ["tag1", "tag2"]
    }
    
    Return null if no important information to store.`;

    const userPrompt = `Memory type: ${type}
    Content: ${content}`;

    try {
      const response = await this.getChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { temperature: 0.3 });

      const result = JSON.parse(response);
      return result === null ? null : result;
    } catch (error) {
      logger.error('Failed to extract memory information', { error });
      return null;
    }
  }

  /**
   * Count tokens in messages (approximate)
   */
  static estimateTokenCount(messages: OpenAIMessage[]): number {
    const text = messages.map(msg => msg.content).join(' ');
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }
}

export { OpenAIService };