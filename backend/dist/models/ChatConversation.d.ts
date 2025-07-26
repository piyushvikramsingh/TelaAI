import mongoose from 'mongoose';
import { IChatConversation } from '../types';
interface IChatConversationModel extends mongoose.Model<IChatConversation> {
    getUserConversations(userId: string, page?: number, limit?: number): Promise<IChatConversation[]>;
    getUserStats(userId: string): Promise<any>;
}
export declare const ChatConversation: IChatConversationModel;
export {};
//# sourceMappingURL=ChatConversation.d.ts.map