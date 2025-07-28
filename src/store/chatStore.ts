import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  reactions: Array<{ emoji: string; userId: string; userName: string }>;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location';
  fileData?: {
    name: string;
    size: number;
    type: string;
    url: string;
    duration?: number;
    thumbnail?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  replyTo?: string;
  forwarded: boolean;
  starred: boolean;
  edited: boolean;
  editedAt?: string;
}

export interface Chat {
  id: string;
  name: string;
  type: 'individual' | 'group';
  participants: string[];
  avatar: string;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  pinned: boolean;
  archived: boolean;
  muted: boolean;
  description?: string;
  createdBy?: string;
  createdAt?: string;
  groupAdmins?: string[];
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  status?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Status {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'text' | 'image' | 'video';
  content: string;
  text?: string;
  backgroundColor?: string;
  timestamp: string;
  views: Array<{ userId: string; viewedAt: string }>;
  expiresAt: string;
}

interface ChatState {
  chats: Chat[];
  contacts: Contact[];
  statuses: Status[];
  selectedChat: Chat | null;
  isTyping: Record<string, boolean>;
  onlineUsers: Set<string>;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  
  // Actions
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  setSelectedChat: (chat: Chat | null) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  addReaction: (chatId: string, messageId: string, reaction: { emoji: string; userId: string; userName: string }) => void;
  removeReaction: (chatId: string, messageId: string, userId: string, emoji: string) => void;
  markMessagesAsRead: (chatId: string) => void;
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
  setOnlineUsers: (users: Set<string>) => void;
  setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected') => void;
  addContact: (contact: Contact) => void;
  updateContact: (contactId: string, updates: Partial<Contact>) => void;
  addStatus: (status: Status) => void;
  markStatusAsViewed: (statusId: string, userId: string) => void;
  deleteExpiredStatuses: () => void;
  createGroupChat: (name: string, participants: string[], createdBy: string) => void;
  starMessage: (chatId: string, messageId: string) => void;
  forwardMessage: (message: Message, toChatIds: string[]) => void;
}

export const useChatStore = create<ChatState>()(
  subscribeWithSelector((set, get) => ({
    chats: [],
      contacts: [
    { id: 'jarvy', name: 'Jarvy AI Assistant', phone: '+1-AI-JARVY', avatar: '🤖', isOnline: true, status: 'AI Assistant - Always here to help!' },
    { id: 'user2', name: 'Sarah Johnson', phone: '+1234567891', avatar: '👩‍💼', isOnline: true },
    { id: 'user3', name: 'Alex Chen', phone: '+1234567892', avatar: '👨‍💻', isOnline: false },
    { id: 'user4', name: 'Maria Garcia', phone: '+1234567893', avatar: '👩‍🎨', isOnline: true },
    { id: 'user5', name: 'John Smith', phone: '+1234567894', avatar: '👨‍💼', isOnline: false },
    { id: 'user6', name: 'Emma Wilson', phone: '+1234567895', avatar: '👩‍🔬', isOnline: true },
  ],
    statuses: [],
    selectedChat: null,
    isTyping: {},
    onlineUsers: new Set(['jarvy', 'user2', 'user4', 'user6']),
    connectionStatus: 'connecting',

    setChats: (chats) => set({ chats }),
    
    addChat: (chat) => set((state) => ({ 
      chats: [...state.chats, chat] 
    })),
    
    updateChat: (chatId, updates) => set((state) => ({
      chats: state.chats.map(chat => 
        chat.id === chatId ? { ...chat, ...updates } : chat
      )
    })),
    
    setSelectedChat: (chat) => set({ selectedChat: chat }),
    
    addMessage: (chatId, message) => set((state) => ({
      chats: state.chats.map(chat => 
        chat.id === chatId 
          ? { 
              ...chat, 
              messages: [...chat.messages, message],
              lastMessage: message.text || getMessagePreview(message),
              lastMessageTime: message.timestamp
            }
          : chat
      )
    })),
    
    updateMessage: (chatId, messageId, updates) => set((state) => ({
      chats: state.chats.map(chat => 
        chat.id === chatId 
          ? {
              ...chat,
              messages: chat.messages.map(msg => 
                msg.id === messageId ? { ...msg, ...updates } : msg
              )
            }
          : chat
      )
    })),
    
    deleteMessage: (chatId, messageId) => set((state) => ({
      chats: state.chats.map(chat => 
        chat.id === chatId 
          ? {
              ...chat,
              messages: chat.messages.filter(msg => msg.id !== messageId)
            }
          : chat
      )
    })),
    
    addReaction: (chatId, messageId, reaction) => set((state) => ({
      chats: state.chats.map(chat => 
        chat.id === chatId 
          ? {
              ...chat,
              messages: chat.messages.map(msg => 
                msg.id === messageId 
                  ? {
                      ...msg,
                      reactions: msg.reactions.some(r => r.emoji === reaction.emoji && r.userId === reaction.userId)
                        ? msg.reactions.filter(r => !(r.emoji === reaction.emoji && r.userId === reaction.userId))
                        : [...msg.reactions, reaction]
                    }
                  : msg
              )
            }
          : chat
      )
    })),
    
    removeReaction: (chatId, messageId, userId, emoji) => set((state) => ({
      chats: state.chats.map(chat => 
        chat.id === chatId 
          ? {
              ...chat,
              messages: chat.messages.map(msg => 
                msg.id === messageId 
                  ? {
                      ...msg,
                      reactions: msg.reactions.filter(r => !(r.emoji === emoji && r.userId === userId))
                    }
                  : msg
              )
            }
          : chat
      )
    })),
    
    markMessagesAsRead: (chatId) => set((state) => ({
      chats: state.chats.map(chat => 
        chat.id === chatId 
          ? { ...chat, unreadCount: 0 }
          : chat
      )
    })),
    
    setTyping: (chatId, userId, isTyping) => set((state) => ({
      isTyping: {
        ...state.isTyping,
        [`${chatId}-${userId}`]: isTyping
      }
    })),
    
    setOnlineUsers: (users) => set({ onlineUsers: users }),
    
    setConnectionStatus: (status) => set({ connectionStatus: status }),
    
    addContact: (contact) => set((state) => ({
      contacts: [...state.contacts, contact]
    })),
    
    updateContact: (contactId, updates) => set((state) => ({
      contacts: state.contacts.map(contact => 
        contact.id === contactId ? { ...contact, ...updates } : contact
      )
    })),
    
    addStatus: (status) => set((state) => ({
      statuses: [...state.statuses, status]
    })),
    
    markStatusAsViewed: (statusId, userId) => set((state) => ({
      statuses: state.statuses.map(status => 
        status.id === statusId 
          ? {
              ...status,
              views: status.views.some(v => v.userId === userId)
                ? status.views
                : [...status.views, { userId, viewedAt: new Date().toISOString() }]
            }
          : status
      )
    })),
    
    deleteExpiredStatuses: () => set((state) => ({
      statuses: state.statuses.filter(status => 
        new Date(status.expiresAt) > new Date()
      )
    })),
    
    createGroupChat: (name, participants, createdBy) => {
      const newChat: Chat = {
        id: `chat_${Date.now()}`,
        name,
        type: 'group',
        participants: [createdBy, ...participants],
        avatar: '👥',
        messages: [],
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        pinned: false,
        archived: false,
        muted: false,
        createdBy,
        createdAt: new Date().toISOString(),
        groupAdmins: [createdBy]
      };
      
      set((state) => ({
        chats: [...state.chats, newChat]
      }));
    },
    
    starMessage: (chatId, messageId) => set((state) => ({
      chats: state.chats.map(chat => 
        chat.id === chatId 
          ? {
              ...chat,
              messages: chat.messages.map(msg => 
                msg.id === messageId 
                  ? { ...msg, starred: !msg.starred }
                  : msg
              )
            }
          : chat
      )
    })),
    
    forwardMessage: (message, toChatIds) => {
      const { chats } = get();
      const forwardedMessage = {
        ...message,
        id: `msg_${Date.now()}_${Math.random()}`,
        timestamp: new Date().toISOString(),
        forwarded: true,
        status: 'sent' as const
      };
      
      set({
        chats: chats.map(chat => 
          toChatIds.includes(chat.id)
            ? {
                ...chat,
                messages: [...chat.messages, forwardedMessage],
                lastMessage: message.text || getMessagePreview(message),
                lastMessageTime: forwardedMessage.timestamp
              }
            : chat
        )
      });
    }
  }))
);

function getMessagePreview(message: Message): string {
  switch (message.messageType) {
    case 'image': return '📷 Photo';
    case 'video': return '🎥 Video';
    case 'audio': return '🎤 Voice message';
    case 'file': return `📎 ${message.fileData?.name || 'File'}`;
    case 'location': return '📍 Location';
    default: return message.text;
  }
}