// Auto-Trainer for Jarvy AI - Continuous Learning System
// Automatically trains Jarvy with comprehensive datasets

import { jarvy } from './jarvy';
import { allTrainingData, TrainingConversation } from './trainingData';
import { AdvancedJarvyUtils } from './advancedJarvy';

interface TrainingProgress {
  totalConversations: number;
  processedConversations: number;
  categoriesAdded: string[];
  averageRating: number;
  trainingStartTime: Date;
  trainingEndTime?: Date;
  status: 'running' | 'completed' | 'error';
  errors: string[];
}

interface AutoTrainingConfig {
  batchSize: number;
  delayBetweenBatches: number; // milliseconds
  enableProgressLogging: boolean;
  filterByComplexity?: ('simple' | 'moderate' | 'complex' | 'expert')[];
  filterByCategory?: string[];
  minimumRating?: number;
}

class AutoTrainer {
  private config: AutoTrainingConfig;
  private progress: TrainingProgress;

  constructor(config: Partial<AutoTrainingConfig> = {}) {
    this.config = {
      batchSize: 10,
      delayBetweenBatches: 100,
      enableProgressLogging: true,
      minimumRating: 4,
      ...config
    };

    this.progress = {
      totalConversations: 0,
      processedConversations: 0,
      categoriesAdded: [],
      averageRating: 0,
      trainingStartTime: new Date(),
      status: 'running',
      errors: []
    };
  }

  // Main training function
  async trainJarvyWithDataset(dataset: TrainingConversation[] = allTrainingData): Promise<TrainingProgress> {
    try {
      this.progress.trainingStartTime = new Date();
      this.progress.status = 'running';
      
      // Filter dataset based on config
      const filteredDataset = this.filterDataset(dataset);
      this.progress.totalConversations = filteredDataset.length;

      if (this.config.enableProgressLogging) {
        console.log(`🤖 Starting Jarvy Auto-Training with ${filteredDataset.length} conversations`);
      }

      // Process in batches
      const batches = this.createBatches(filteredDataset, this.config.batchSize);
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        await this.processBatch(batch, i + 1, batches.length);
        
        // Delay between batches to prevent overwhelming the system
        if (i < batches.length - 1) {
          await this.delay(this.config.delayBetweenBatches);
        }
      }

      // Add domain knowledge
      await this.addDomainKnowledge(filteredDataset);

      // Finalize training
      this.progress.status = 'completed';
      this.progress.trainingEndTime = new Date();
      this.progress.averageRating = this.calculateAverageRating(filteredDataset);

      if (this.config.enableProgressLogging) {
        console.log(`✅ Jarvy Auto-Training Completed!`);
        console.log(`📊 Processed: ${this.progress.processedConversations}/${this.progress.totalConversations}`);
        console.log(`⭐ Average Rating: ${this.progress.averageRating.toFixed(2)}`);
        console.log(`🏷️ Categories: ${this.progress.categoriesAdded.join(', ')}`);
        console.log(`⏱️ Duration: ${this.getTrainingDuration()}ms`);
      }

      return this.progress;

    } catch (error) {
      this.progress.status = 'error';
      this.progress.errors.push(error instanceof Error ? error.message : String(error));
      console.error('❌ Auto-training failed:', error);
      throw error;
    }
  }

  // Filter dataset based on configuration
  private filterDataset(dataset: TrainingConversation[]): TrainingConversation[] {
    return dataset.filter(conversation => {
      // Filter by minimum rating
      if (this.config.minimumRating && conversation.rating < this.config.minimumRating) {
        return false;
      }

      // Filter by complexity
      if (this.config.filterByComplexity && 
          !this.config.filterByComplexity.includes(conversation.complexity)) {
        return false;
      }

      // Filter by category
      if (this.config.filterByCategory && 
          !this.config.filterByCategory.includes(conversation.category)) {
        return false;
      }

      return true;
    });
  }

  // Create batches for processing
  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  // Process a batch of conversations
  private async processBatch(
    batch: TrainingConversation[], 
    batchNumber: number, 
    totalBatches: number
  ): Promise<void> {
    try {
      // Convert to format expected by jarvy
      const conversationData = batch.map(conv => ({
        query: conv.query,
        response: conv.response,
        rating: conv.rating / 5 // Convert 1-5 scale to 0-1 scale
      }));

      // Train with advanced system
      await (jarvy as any).trainWithAdvancedData(conversationData);

      // Update progress
      this.progress.processedConversations += batch.length;
      
      // Track categories
      batch.forEach(conv => {
        if (!this.progress.categoriesAdded.includes(conv.category)) {
          this.progress.categoriesAdded.push(conv.category);
        }
      });

      if (this.config.enableProgressLogging) {
        const progress = Math.round((this.progress.processedConversations / this.progress.totalConversations) * 100);
        console.log(`🔄 Batch ${batchNumber}/${totalBatches} completed (${progress}%)`);
      }

    } catch (error) {
      const errorMsg = `Batch ${batchNumber} failed: ${error instanceof Error ? error.message : String(error)}`;
      this.progress.errors.push(errorMsg);
      console.warn(`⚠️ ${errorMsg}`);
    }
  }

  // Add domain-specific knowledge
  private async addDomainKnowledge(dataset: TrainingConversation[]): Promise<void> {
    const domainKnowledge = this.extractDomainKnowledge(dataset);
    
    for (const [domain, knowledge] of Object.entries(domainKnowledge)) {
      try {
        (jarvy as any).addDomainKnowledge(domain, knowledge);
        
        if (this.config.enableProgressLogging) {
          console.log(`📚 Added ${knowledge.length} concepts to ${domain} domain`);
        }
      } catch (error) {
        const errorMsg = `Failed to add ${domain} knowledge: ${error instanceof Error ? error.message : String(error)}`;
        this.progress.errors.push(errorMsg);
        console.warn(`⚠️ ${errorMsg}`);
      }
    }
  }

  // Extract domain knowledge from conversations
  private extractDomainKnowledge(dataset: TrainingConversation[]): Record<string, Array<{concept: string, facts: string[], examples: string[]}>> {
    const domainKnowledge: Record<string, Array<{concept: string, facts: string[], examples: string[]}>> = {};

    dataset.forEach(conv => {
      const category = conv.category;
      
      if (!domainKnowledge[category]) {
        domainKnowledge[category] = [];
      }

      // Extract key concepts from the query
      const concepts = this.extractConcepts(conv.query);
      
      concepts.forEach(concept => {
        // Extract facts and examples from response
        const facts = this.extractFacts(conv.response);
        const examples = this.extractExamples(conv.response);

        if (facts.length > 0) {
          domainKnowledge[category].push({
            concept,
            facts: facts.slice(0, 3), // Limit to top 3 facts
            examples: examples.slice(0, 2) // Limit to top 2 examples
          });
        }
      });
    });

    return domainKnowledge;
  }

  // Extract key concepts from text
  private extractConcepts(text: string): string[] {
    // Simple concept extraction - look for key nouns and phrases
    const concepts: string[] = [];
    const words = text.toLowerCase().split(/\s+/);
    
    // Look for important keywords
    const importantWords = words.filter(word => 
      word.length > 4 && 
      !['what', 'how', 'why', 'when', 'where', 'which', 'should', 'would', 'could'].includes(word)
    );

    // Take first few important words as concepts
    concepts.push(...importantWords.slice(0, 2));
    
    return concepts.filter((concept, index, self) => self.indexOf(concept) === index);
  }

  // Extract facts from response text
  private extractFacts(text: string): string[] {
    const facts: string[] = [];
    
    // Split by bullet points or line breaks
    const lines = text.split(/[•\n]/).map(line => line.trim()).filter(line => line.length > 10);
    
    // Take lines that look like facts (not questions or commands)
    const factLines = lines.filter(line => 
      !line.includes('?') && 
      !line.startsWith('**') && 
      line.length < 200 &&
      (line.includes('is') || line.includes('are') || line.includes('can') || line.includes('will'))
    );

    facts.push(...factLines.slice(0, 5));
    
    return facts;
  }

  // Extract examples from response text
  private extractExamples(text: string): string[] {
    const examples: string[] = [];
    
    // Look for example patterns
    const examplePatterns = [
      /example[s]?[:\s]+([^•\n]*)/gi,
      /such as[:\s]+([^•\n]*)/gi,
      /like[:\s]+([^•\n]*)/gi,
      /including[:\s]+([^•\n]*)/gi
    ];

    examplePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const example = match.replace(/^(example[s]?|such as|like|including)[:\s]+/i, '').trim();
          if (example.length > 5 && example.length < 100) {
            examples.push(example);
          }
        });
      }
    });

    return examples.slice(0, 3);
  }

  // Utility functions
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateAverageRating(dataset: TrainingConversation[]): number {
    const totalRating = dataset.reduce((sum, conv) => sum + conv.rating, 0);
    return totalRating / dataset.length;
  }

  private getTrainingDuration(): number {
    if (!this.progress.trainingEndTime) return 0;
    return this.progress.trainingEndTime.getTime() - this.progress.trainingStartTime.getTime();
  }

  // Get current progress
  getProgress(): TrainingProgress {
    return { ...this.progress };
  }
}

// Pre-configured trainers for different scenarios
export const trainers = {
  // Full comprehensive training
  comprehensive: new AutoTrainer({
    batchSize: 15,
    delayBetweenBatches: 50,
    enableProgressLogging: true,
    minimumRating: 4
  }),

  // Fast training for development
  quick: new AutoTrainer({
    batchSize: 20,
    delayBetweenBatches: 10,
    enableProgressLogging: false,
    filterByComplexity: ['simple', 'moderate'],
    minimumRating: 4
  }),

  // Expert-level training only
  expert: new AutoTrainer({
    batchSize: 5,
    delayBetweenBatches: 200,
    enableProgressLogging: true,
    filterByComplexity: ['complex', 'expert'],
    minimumRating: 5
  }),

  // Category-specific trainers
  technology: new AutoTrainer({
    batchSize: 10,
    delayBetweenBatches: 100,
    filterByCategory: ['technology'],
    minimumRating: 4
  }),

  business: new AutoTrainer({
    batchSize: 10,
    delayBetweenBatches: 100,
    filterByCategory: ['business'],
    minimumRating: 4
  }),

  health: new AutoTrainer({
    batchSize: 8,
    delayBetweenBatches: 150,
    filterByCategory: ['health'],
    minimumRating: 4
  })
};

// Auto-training initialization function
export async function initializeJarvyTraining(
  trainerType: keyof typeof trainers = 'comprehensive'
): Promise<TrainingProgress> {
  const trainer = trainers[trainerType];
  return await trainer.trainJarvyWithDataset();
}

// Export individual trainer for custom use
export { AutoTrainer };

// Training status checker
export function getTrainingStatus(): { isTraining: boolean; progress?: TrainingProgress } {
  // This would be enhanced with actual status tracking in a real implementation
  return {
    isTraining: false, // Would check actual training state
    progress: trainers.comprehensive.getProgress()
  };
}