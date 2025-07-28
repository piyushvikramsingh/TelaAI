// Jarvy AI Chatbot Service
// A comprehensive AI assistant for Chattyy

export interface JarvyResponse {
  text: string;
  type: 'text' | 'suggestion' | 'command' | 'help';
  suggestions?: string[];
  action?: string;
  confidence: number;
}

export interface TrainingData {
  patterns: string[];
  responses: string[];
  tag: string;
  context?: string[];
}

// Comprehensive training data for Jarvy
const trainingData: TrainingData[] = [
  // Greetings
  {
    tag: "greeting",
    patterns: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "howdy", "what's up", "sup"],
    responses: [
      "Hello! I'm Jarvy, your AI assistant. How can I help you today?",
      "Hi there! I'm here to assist you with anything you need.",
      "Hey! Great to see you. What can I do for you?",
      "Hello! I'm Jarvy, ready to help with your questions.",
      "Hi! I'm your personal AI assistant. How may I assist you?"
    ]
  },
  
  // App Help
  {
    tag: "app_help",
    patterns: ["help", "how to use", "guide", "tutorial", "instructions", "how does this work", "what can I do"],
    responses: [
      "I can help you with Chattyy! You can:\n• Send messages and files\n• Make video/voice calls\n• Create status updates\n• Use voice messages\n• React to messages\nWhat would you like to know more about?",
      "Here's what you can do in Chattyy:\n📱 Chat with friends\n📞 Make calls\n📊 Share status\n📎 Send files\n🎤 Voice messages\nNeed help with any specific feature?",
      "Welcome to Chattyy! This app lets you:\n• Send encrypted messages\n• Make HD video calls\n• Share disappearing status\n• Send all types of media\nWhat feature interests you most?"
    ],
    suggestions: ["How to make calls", "How to send files", "How to create status", "Message features"]
  },

  // Video Calls
  {
    tag: "video_calls",
    patterns: ["video call", "how to call", "make a call", "start video call", "video chat", "calling"],
    responses: [
      "To make a video call:\n1. Open any chat\n2. Click the video camera icon in the top right\n3. Allow camera/microphone access\n4. Enjoy your call!\n\nDuring calls you can mute, turn off camera, share screen, or end the call.",
      "Video calling is easy! Just click the 📹 icon in any chat header. You can also share your screen during calls!",
      "For video calls:\n• Click video icon in chat\n• Grant camera permissions\n• Use controls to mute/unmute\n• Share screen if needed\n• Click red phone to end"
    ],
    suggestions: ["Screen sharing help", "Audio problems", "Video quality issues"]
  },

  // Status Updates
  {
    tag: "status_updates",
    patterns: ["status", "story", "how to post status", "create status", "status update", "share status"],
    responses: [
      "Creating status updates:\n1. Click the 'Status' tab or eye icon\n2. Choose text, photo, or video\n3. Customize with colors/text\n4. Post to share with contacts\n\nStatus disappears after 24 hours!",
      "Status features:\n📝 Text with custom backgrounds\n📷 Photo status\n🎥 Video status\n⏰ Auto-disappears in 24h\n👀 See who viewed your status",
      "To create status:\n• Go to Status section\n• Choose content type\n• Add text/media\n• Select background (for text)\n• Share with all contacts"
    ],
    suggestions: ["Status privacy", "View status viewers", "Delete status"]
  },

  // File Sharing
  {
    tag: "file_sharing",
    patterns: ["send file", "share file", "upload", "attach", "send photo", "send video", "send document"],
    responses: [
      "File sharing in Chattyy:\n📎 Click paperclip icon in chat\n📷 Choose photos, videos, documents\n🎤 Record voice messages\n📍 Share your location\n\nSupported: Images, videos, audio, PDFs, documents",
      "To share files:\n1. Click the 📎 icon in message input\n2. Select file type from your device\n3. Add caption if desired\n4. Send!\n\nAll file types are supported!",
      "File sharing options:\n• Photos & Videos\n• Documents (PDF, DOC, etc)\n• Audio files\n• Voice messages (hold mic)\n• Location sharing"
    ],
    suggestions: ["Voice messages", "Location sharing", "File size limits"]
  },

  // Voice Messages
  {
    tag: "voice_messages",
    patterns: ["voice message", "record voice", "audio message", "voice note", "how to record"],
    responses: [
      "Voice messages:\n🎤 Hold the microphone button to record\n⏱️ Release to send (or slide to cancel)\n🔊 Recipients can play instantly\n⏰ Shows recording duration",
      "Recording voice messages:\n1. Hold down the mic button\n2. Speak your message\n3. Release to send\n4. Slide left to cancel\n\nPerfect for quick messages!",
      "Voice message tips:\n• Hold mic button to record\n• Clear audio in quiet environment\n• Keep messages under 2 minutes\n• Great for when typing is inconvenient"
    ]
  },

  // Message Features
  {
    tag: "message_features",
    patterns: ["react to message", "reply", "forward", "star message", "message options", "emoji reaction"],
    responses: [
      "Message features:\n❤️ Double-tap to react with heart\n💬 Long-press for more reactions\n↩️ Reply to specific messages\n⭐ Star important messages\n📤 Forward to other chats",
      "Interactive messaging:\n• Double-click for quick heart reaction\n• Right-click for message options\n• Reply feature for context\n• Star messages to save them\n• Forward messages to other contacts",
      "Message actions:\n🔄 Reply to messages\n⭐ Star for later\n📨 Forward to others\n😍 React with emojis\n🗑️ Delete messages"
    ],
    suggestions: ["How to reply", "Star messages", "Forward messages", "Delete messages"]
  },

  // Technical Help
  {
    tag: "technical_help",
    patterns: ["not working", "error", "bug", "problem", "issue", "troubleshoot", "fix"],
    responses: [
      "Technical issues? Try these steps:\n1. Refresh the page\n2. Check internet connection\n3. Clear browser cache\n4. Allow camera/microphone permissions\n5. Update your browser\n\nStill having issues? Let me know the specific problem!",
      "Common fixes:\n🔄 Refresh the app\n🌐 Check internet connection\n🎥 Allow camera/mic permissions\n🧹 Clear browser data\n📱 Try different browser",
      "Troubleshooting:\n• Refresh page (Ctrl+R)\n• Check permissions\n• Stable internet needed\n• Modern browser required\n• Clear cache if needed"
    ],
    suggestions: ["Permission issues", "Connection problems", "Audio not working", "Video not working"]
  },

  // Privacy & Security
  {
    tag: "privacy_security",
    patterns: ["privacy", "security", "encryption", "safe", "secure", "data protection", "end to end"],
    responses: [
      "Chattyy Security Features:\n🔒 End-to-end encryption indicators\n👤 Private messaging\n🛡️ Secure file sharing\n🔐 No message storage on servers\n📱 Local data only",
      "Your privacy matters:\n• Messages encrypted in transit\n• No server-side message storage\n• Secure file uploads\n• Private video calls\n• Local data storage only",
      "Security & Privacy:\n🔐 Messages are encrypted\n🚫 No data collection\n💻 Local storage only\n🔒 Secure connections\n👁️ No message reading by others"
    ]
  },

  // App Features
  {
    tag: "app_features",
    patterns: ["features", "what can this app do", "capabilities", "functions", "about app"],
    responses: [
      "Chattyy Features:\n📱 Phone number authentication\n💬 Real-time messaging\n📞 Video/Voice calls\n📊 24h status updates\n📎 File sharing\n🎤 Voice messages\n😍 Message reactions\n🌙 Dark/Light theme\n📱 Mobile responsive",
      "Complete WhatsApp-like experience:\n• Secure messaging\n• HD video calls\n• Status stories\n• File & media sharing\n• Voice messages\n• Group chats\n• Message reactions\n• Modern UI/UX",
      "All the features you need:\n✅ Real-time chat\n✅ Video calling\n✅ Status updates\n✅ File sharing\n✅ Voice notes\n✅ Reactions\n✅ Dark mode\n✅ Responsive design"
    ]
  },

  // General Questions
  {
    tag: "general_qa",
    patterns: ["what is", "how", "why", "when", "where", "explain", "tell me about"],
    responses: [
      "I'm here to help with any questions! I can explain features, provide guidance, or help troubleshoot issues.",
      "Feel free to ask me anything about Chattyy or general questions. I'm here to assist!",
      "I can help with app features, technical issues, or general questions. What would you like to know?"
    ]
  },

  // Weather
  {
    tag: "weather",
    patterns: ["weather", "temperature", "climate", "forecast", "rain", "sunny", "cloudy"],
    responses: [
      "I can't check current weather, but you can:\n🌐 Check weather apps\n📱 Ask your phone's assistant\n🔍 Search online for '[your city] weather'\n☀️ Look outside your window!",
      "For weather information, I recommend checking your local weather app or website. Stay safe and dress appropriately!",
      "Weather updates aren't available in Chattyy, but you can check weather apps or websites for accurate forecasts!"
    ]
  },

  // Time
  {
    tag: "time",
    patterns: ["time", "what time", "clock", "hour", "minute", "current time"],
    responses: [
      `Current time: ${new Date().toLocaleTimeString()}\nDate: ${new Date().toLocaleDateString()}`,
      `It's ${new Date().toLocaleTimeString()} right now.\nToday is ${new Date().toLocaleDateString()}`,
      `Time: ${new Date().toLocaleTimeString()}\nHave a great day!`
    ]
  },

  // Farewell
  {
    tag: "goodbye",
    patterns: ["bye", "goodbye", "see you", "talk later", "exit", "quit", "farewell", "take care"],
    responses: [
      "Goodbye! Feel free to ask me anything anytime. Have a great day!",
      "See you later! I'm always here when you need help with Chattyy.",
      "Take care! Remember, I'm just a message away if you need assistance.",
      "Bye! Enjoy using Chattyy and don't hesitate to reach out if you need help!"
    ]
  },

  // Thanks
  {
    tag: "thanks",
    patterns: ["thanks", "thank you", "appreciate", "grateful", "helpful"],
    responses: [
      "You're welcome! Happy to help anytime.",
      "Glad I could assist! Feel free to ask if you need anything else.",
      "My pleasure! That's what I'm here for.",
      "You're very welcome! Enjoy using Chattyy!"
    ]
  }
];

class JarvyAI {
  private trainingData: TrainingData[];
  private responses: Map<string, string[]>;

  constructor() {
    this.trainingData = trainingData;
    this.responses = new Map();
    this.initializeResponses();
  }

  private initializeResponses() {
    this.trainingData.forEach(data => {
      this.responses.set(data.tag, data.responses);
    });
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  private calculateSimilarity(input: string, pattern: string): number {
    const inputTokens = this.tokenize(input);
    const patternTokens = this.tokenize(pattern);
    
    let matches = 0;
    const totalTokens = Math.max(inputTokens.length, patternTokens.length);
    
    for (const token of inputTokens) {
      if (patternTokens.some(pToken => 
        pToken.includes(token) || token.includes(pToken) || 
        this.levenshteinDistance(token, pToken) <= 1
      )) {
        matches++;
      }
    }
    
    return matches / totalTokens;
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[b.length][a.length];
  }

  private findBestMatch(input: string): { tag: string; confidence: number; data: TrainingData } | null {
    let bestMatch = null;
    let highestConfidence = 0;

    for (const data of this.trainingData) {
      for (const pattern of data.patterns) {
        const confidence = this.calculateSimilarity(input, pattern);
        if (confidence > highestConfidence && confidence > 0.3) {
          highestConfidence = confidence;
          bestMatch = { tag: data.tag, confidence, data };
        }
      }
    }

    return bestMatch;
  }

  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getSuggestions(tag: string): string[] {
    const suggestionMap: Record<string, string[]> = {
      greeting: ["How to use Chattyy", "App features", "Make a video call", "Send files"],
      app_help: ["Video calls", "Status updates", "File sharing", "Voice messages"],
      video_calls: ["Audio problems", "Screen sharing", "Call quality", "Permission issues"],
      status_updates: ["Status privacy", "Delete status", "View status", "Status types"],
      file_sharing: ["Voice messages", "Location sharing", "File limits", "Supported formats"],
      technical_help: ["Clear cache", "Check permissions", "Update browser", "Internet connection"],
      general_qa: ["App features", "How to call", "Send files", "Create status"]
    };

    return suggestionMap[tag] || [];
  }

  public async getResponse(input: string): Promise<JarvyResponse> {
    if (!input.trim()) {
      return {
        text: "I'm here to help! What would you like to know about Chattyy?",
        type: 'help',
        suggestions: ["App features", "How to make calls", "Send files", "Create status"],
        confidence: 1.0
      };
    }

    const match = this.findBestMatch(input);
    
    if (match && match.confidence > 0.5) {
      const response = this.getRandomResponse(this.responses.get(match.tag) || []);
      const suggestions = this.getSuggestions(match.tag);
      
      return {
        text: response,
        type: match.tag.includes('help') ? 'help' : 'text',
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        confidence: match.confidence
      };
    } else if (match && match.confidence > 0.3) {
      return {
        text: `I think you're asking about ${match.tag.replace('_', ' ')}. ${this.getRandomResponse(this.responses.get(match.tag) || [])}`,
        type: 'suggestion',
        suggestions: this.getSuggestions(match.tag),
        confidence: match.confidence
      };
    } else {
      return {
        text: "I'm not sure I understand that. I can help you with:\n• App features and how-to guides\n• Video calling assistance\n• File sharing help\n• Status updates\n• Technical troubleshooting\n\nWhat would you like to know more about?",
        type: 'help',
        suggestions: ["App help", "Video calls", "File sharing", "Status updates", "Technical help"],
        confidence: 0.1
      };
    }
  }

  public async getQuickSuggestions(): Promise<string[]> {
    return [
      "How do I make a video call?",
      "How to send files?",
      "Create status update",
      "Voice message help",
      "App features",
      "Technical support"
    ];
  }

  public async trainWithNewData(patterns: string[], responses: string[], tag: string): Promise<void> {
    const existingDataIndex = this.trainingData.findIndex(data => data.tag === tag);
    
    if (existingDataIndex >= 0) {
      this.trainingData[existingDataIndex].patterns.push(...patterns);
      this.trainingData[existingDataIndex].responses.push(...responses);
    } else {
      this.trainingData.push({ patterns, responses, tag });
    }
    
    this.responses.set(tag, responses);
  }
}

// Export singleton instance
export const jarvy = new JarvyAI();

// Export utility functions
export const JarvyUtils = {
  formatResponse: (response: JarvyResponse): string => {
    return response.text;
  },
  
  isQuestion: (text: string): boolean => {
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'can', 'is', 'are', 'do', 'does'];
    const words = text.toLowerCase().split(' ');
    return questionWords.some(qw => words.includes(qw)) || text.includes('?');
  },
  
  extractKeywords: (text: string): string[] => {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
  }
};