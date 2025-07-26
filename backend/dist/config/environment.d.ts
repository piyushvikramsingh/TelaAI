export declare const config: {
    port: number;
    nodeEnv: string;
    corsOrigin: string;
    mongodb: {
        uri: string;
    };
    redis: {
        url: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    bcrypt: {
        rounds: number;
    };
    openai: {
        apiKey: string;
        model: string;
        maxTokens: number;
    };
    firebase: {
        projectId: string | undefined;
        privateKeyId: string | undefined;
        privateKey: string | undefined;
        clientEmail: string | undefined;
        clientId: string | undefined;
        authUri: string | undefined;
        tokenUri: string | undefined;
    };
    upload: {
        maxSize: number;
        allowedTypes: string[];
        destination: string;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
        aiMaxRequests: number;
    };
    logging: {
        level: string;
        file: string;
    };
    planLimits: {
        free: {
            monthlyCredits: number;
            maxConversations: number;
            maxFiles: number;
            maxMemoryEntries: number;
            maxTasksPerMonth: number;
            prioritySupport: boolean;
            advancedFeatures: boolean;
        };
        pro: {
            monthlyCredits: number;
            maxConversations: number;
            maxFiles: number;
            maxMemoryEntries: number;
            maxTasksPerMonth: number;
            prioritySupport: boolean;
            advancedFeatures: boolean;
        };
        enterprise: {
            monthlyCredits: number;
            maxConversations: number;
            maxFiles: number;
            maxMemoryEntries: number;
            maxTasksPerMonth: number;
            prioritySupport: boolean;
            advancedFeatures: boolean;
        };
    };
};
export declare const isDevelopment: () => boolean;
export declare const isProduction: () => boolean;
export declare const isTest: () => boolean;
//# sourceMappingURL=environment.d.ts.map