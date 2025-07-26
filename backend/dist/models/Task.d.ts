import mongoose from 'mongoose';
import { ITask } from '../types';
interface ITaskModel extends mongoose.Model<ITask> {
    getUserTasks(userId: string, filters?: any, page?: number, limit?: number): Promise<ITask[]>;
    getUserTaskStats(userId: string): Promise<any>;
    getUpcomingDeadlines(userId: string, days?: number): Promise<ITask[]>;
}
export declare const Task: ITaskModel;
export {};
//# sourceMappingURL=Task.d.ts.map