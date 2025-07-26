import { OpenAIMessage, OpenAICompletionOptions } from '../types';
declare class OpenAIService {
    /**
     * Get chat completion from OpenAI
     */
    static getChatCompletion(messages: OpenAIMessage[], options?: OpenAICompletionOptions): Promise<string>;
    /**
     * Get streaming chat completion
     */
    static getStreamingChatCompletion(messages: OpenAIMessage[], onChunk: (chunk: string) => void, options?: OpenAICompletionOptions): Promise<void>;
    /**
     * Generate task suggestions based on user context
     */
    static generateTaskSuggestions(userContext: string, existingTasks?: string[], category?: string): Promise<string[]>;
    /**
     * Generate design concepts
     */
    static generateDesignConcept(prompt: string, type: string, style?: string): Promise<{
        description: string;
        code?: string;
        suggestions: string[];
    }>;
    /**
     * Analyze and extract insights from user data
     */
    static analyzeUserData(data: any, analysisType?: string): Promise<{
        insights: string[];
        recommendations: string[];
        summary: string;
    }>;
    /**
     * Generate code based on description
     */
    static generateCode(description: string, language: string, context?: string): Promise<{
        code: string;
        explanation: string;
        improvements: string[];
    }>;
    /**
     * Summarize conversation for memory storage
     */
    static summarizeConversation(messages: OpenAIMessage[], maxLength?: number): Promise<string>;
    /**
     * Extract important information for memory
     */
    static extractMemoryKeyValue(content: string, type: 'preference' | 'context' | 'skill' | 'project' | 'note'): Promise<{
        key: string;
        value: any;
        importance: number;
        tags: string[];
    } | null>;
    /**
     * Count tokens in messages (approximate)
     */
    static estimateTokenCount(messages: OpenAIMessage[]): number;
}
export { OpenAIService };
//# sourceMappingURL=openai.d.ts.map