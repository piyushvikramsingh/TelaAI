import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

export interface ApiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const getChatCompletion = async (messages: ApiMessage[]): Promise<string> => {
  if (!API_KEY || API_KEY.startsWith("sk-proj-...")) {
    console.error("OpenAI API key not found or is a placeholder. Please add it to your .env file.");
    return "I can't respond right now. The OpenAI API key is missing or invalid. Please ask the developer to configure it correctly in the `.env` file.";
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
            return "Authentication Error: The provided OpenAI API key is incorrect or has expired. Please verify it in the `.env` file.";
        }
        if (error.response.status === 429) {
            return "Rate Limit Exceeded: You have exceeded your current quota. Please check your plan and billing details on the OpenAI platform.";
        }
    }
    return 'An unexpected error occurred while communicating with the AI. Please check the console for details and try again later.';
  }
};
