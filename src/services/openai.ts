import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

export interface ApiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const getChatCompletion = async (messages: ApiMessage[]): Promise<string> => {
  if (!API_KEY || API_KEY.startsWith("sk-proj-...")) {
    const errorMessage = "OpenAI API key is not configured. Please create a `.env` file by copying `.env.example` and add your key. The AI chat functionality will be disabled until the key is provided.";
    console.error(errorMessage);
    return "I can't respond right now. The OpenAI API key is missing or is a placeholder. Please configure it in the `.env` file to enable chat.";
  }

  try {
    const response = await axios.post(
      API_URL,
      {
        model: 'gpt-4o-mini', // Using a cost-effective and capable model
        messages: messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );

    const aiMessage = response.data.choices[0]?.message?.content;
    if (aiMessage) {
      return aiMessage.trim();
    } else {
      throw new Error("Invalid response structure from OpenAI API.");
    }
  } catch (error) {
    console.error('Error fetching chat completion:', error);
    if (axios.isAxiosError(error) && error.response) {
        console.error('Error response data:', error.response.data);
        if (error.response.status === 401) {
            return "Authentication Error: The provided OpenAI API key is incorrect or has expired. Please verify it in your `.env` file.";
        }
        if (error.response.status === 429) {
            return "Rate Limit Exceeded: You have exceeded your current quota. Please check your plan and billing details on the OpenAI platform.";
        }
    }
    return 'An unexpected error occurred while communicating with the AI. Please check the console for details and try again later.';
  }
};
