import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { User } from '../models/User';

interface AuthenticatedSocket {
  id: string;
  userId: string;
  user: any;
  join: (room: string) => void;
  leave: (room: string) => void;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: Function) => void;
}

interface ConnectedUsers {
  [socketId: string]: {
    userId: string;
    username: string;
    rooms: string[];
  };
}

const connectedUsers: ConnectedUsers = {};

export const setupSocketIO = (io: SocketServer): void => {
  // Authentication middleware
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    const user = socket.user;
    
    logger.info(`User ${user.username} connected with socket ${socket.id}`);

    // Store connected user info
    connectedUsers[socket.id] = {
      userId,
      username: user.username,
      rooms: []
    };

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Handle joining chat rooms
    socket.on('join_chat', (chatId: string) => {
      socket.join(`chat:${chatId}`);
      connectedUsers[socket.id].rooms.push(`chat:${chatId}`);
      
      // Notify others in the chat that user joined
      socket.to(`chat:${chatId}`).emit('user_joined_chat', {
        userId,
        username: user.username,
        chatId
      });
      
      logger.info(`User ${user.username} joined chat ${chatId}`);
    });

    // Handle leaving chat rooms
    socket.on('leave_chat', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
      connectedUsers[socket.id].rooms = connectedUsers[socket.id].rooms.filter(
        room => room !== `chat:${chatId}`
      );
      
      // Notify others in the chat that user left
      socket.to(`chat:${chatId}`).emit('user_left_chat', {
        userId,
        username: user.username,
        chatId
      });
      
      logger.info(`User ${user.username} left chat ${chatId}`);
    });

    // Handle new chat messages
    socket.on('send_message', (data: {
      chatId: string;
      content: string;
      type: 'text' | 'file' | 'image';
      metadata?: any;
    }) => {
      // Broadcast message to all users in the chat
      io.to(`chat:${data.chatId}`).emit('new_message', {
        chatId: data.chatId,
        content: data.content,
        type: data.type,
        metadata: data.metadata,
        sender: {
          id: userId,
          username: user.username,
          avatar: user.avatar
        },
        timestamp: new Date().toISOString()
      });
      
      logger.info(`Message sent in chat ${data.chatId} by ${user.username}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (chatId: string) => {
      socket.to(`chat:${chatId}`).emit('user_typing', {
        userId,
        username: user.username,
        chatId
      });
    });

    socket.on('typing_stop', (chatId: string) => {
      socket.to(`chat:${chatId}`).emit('user_stopped_typing', {
        userId,
        username: user.username,
        chatId
      });
    });

    // Handle collaborative editing
    socket.on('join_document', (documentId: string) => {
      socket.join(`doc:${documentId}`);
      connectedUsers[socket.id].rooms.push(`doc:${documentId}`);
      
      // Notify others that user joined document
      socket.to(`doc:${documentId}`).emit('user_joined_document', {
        userId,
        username: user.username,
        documentId
      });
      
      logger.info(`User ${user.username} joined document ${documentId}`);
    });

    socket.on('document_change', (data: {
      documentId: string;
      changes: any;
      version: number;
    }) => {
      // Broadcast document changes to all users editing the document
      socket.to(`doc:${data.documentId}`).emit('document_updated', {
        documentId: data.documentId,
        changes: data.changes,
        version: data.version,
        userId,
        username: user.username
      });
    });

    // Handle AI processing status
    socket.on('ai_processing_start', (taskId: string) => {
      socket.emit('ai_status', {
        taskId,
        status: 'processing',
        message: 'AI is processing your request...'
      });
    });

    // Handle task updates
    socket.on('subscribe_task_updates', (taskId: string) => {
      socket.join(`task:${taskId}`);
      connectedUsers[socket.id].rooms.push(`task:${taskId}`);
    });

    // Handle file upload progress
    socket.on('file_upload_progress', (data: {
      uploadId: string;
      progress: number;
      filename: string;
    }) => {
      socket.emit('upload_progress', data);
    });

    // Handle presence updates
    socket.on('update_presence', (status: 'online' | 'away' | 'busy') => {
      // Update user's presence status
      socket.broadcast.emit('user_presence_updated', {
        userId,
        username: user.username,
        status
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`User ${user.username} disconnected: ${reason}`);
      
      // Notify all rooms that user left
      const userRooms = connectedUsers[socket.id]?.rooms || [];
      userRooms.forEach(room => {
        socket.to(room).emit('user_disconnected', {
          userId,
          username: user.username,
          room
        });
      });

      // Clean up connected users
      delete connectedUsers[socket.id];
      
      // Broadcast user offline status
      socket.broadcast.emit('user_presence_updated', {
        userId,
        username: user.username,
        status: 'offline'
      });
    });

    // Send initial connection success
    socket.emit('connected', {
      message: 'Successfully connected to Tela AI Neural Interface',
      userId,
      username: user.username
    });
  });

  logger.info('Socket.IO server configured successfully');
};

// Helper function to emit to specific user
export const emitToUser = (io: SocketServer, userId: string, event: string, data: any): void => {
  io.to(`user:${userId}`).emit(event, data);
};

// Helper function to emit to specific chat
export const emitToChat = (io: SocketServer, chatId: string, event: string, data: any): void => {
  io.to(`chat:${chatId}`).emit(event, data);
};

// Helper function to emit to specific task
export const emitToTask = (io: SocketServer, taskId: string, event: string, data: any): void => {
  io.to(`task:${taskId}`).emit(event, data);
};

// Helper function to get connected users count
export const getConnectedUsersCount = (): number => {
  return Object.keys(connectedUsers).length;
};

// Helper function to get users in a specific room
export const getUsersInRoom = (roomName: string): any[] => {
  return Object.values(connectedUsers).filter(user => 
    user.rooms.includes(roomName)
  );
};