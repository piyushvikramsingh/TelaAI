import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tela_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tela_auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  async register(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const response = await api.post('/auth/register', userData);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('tela_auth_token', response.data.data.token);
    }
    return response.data;
  },

  async login(credentials: { email: string; password: string }) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('tela_auth_token', response.data.data.token);
    }
    return response.data;
  },

  async logout() {
    localStorage.removeItem('tela_auth_token');
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(profileData: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }) {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  async sendMessage(message: string, conversationId?: string) {
    const response = await api.post('/chat/message', {
      message,
      conversationId,
    });
    return response.data;
  },

  async getConversations(page: number = 1, limit: number = 20) {
    const response = await api.get('/chat/conversations', {
      params: { page, limit },
    });
    return response.data;
  },

  async getConversation(conversationId: string) {
    const response = await api.get(`/chat/conversations/${conversationId}`);
    return response.data;
  },

  async updateConversation(conversationId: string, updates: { title?: string }) {
    const response = await api.put(`/chat/conversations/${conversationId}`, updates);
    return response.data;
  },

  async deleteConversation(conversationId: string) {
    const response = await api.delete(`/chat/conversations/${conversationId}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/chat/stats');
    return response.data;
  },
};

// Task API
export const taskAPI = {
  async createTask(taskData: {
    title: string;
    description?: string;
    category?: string;
    priority?: string;
    dueDate?: string;
  }) {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  async getTasks(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    priority?: string;
    overdue?: boolean;
  }) {
    const response = await api.get('/tasks', { params: filters });
    return response.data;
  },

  async getTask(taskId: string) {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  async updateTask(taskId: string, updates: any) {
    const response = await api.put(`/tasks/${taskId}`, updates);
    return response.data;
  },

  async deleteTask(taskId: string) {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  async completeTask(taskId: string) {
    const response = await api.post(`/tasks/${taskId}/complete`);
    return response.data;
  },

  async generateTasks(context: string, category?: string, count?: number) {
    const response = await api.post('/tasks/generate', {
      context,
      category,
      count,
    });
    return response.data;
  },

  async getStats() {
    const response = await api.get('/tasks/stats');
    return response.data;
  },
};

// Health API
export const healthAPI = {
  async checkHealth() {
    const response = await api.get('/health');
    return response.data;
  },

  async getDetailedHealth() {
    const response = await api.get('/health/detailed');
    return response.data;
  },
};

export default api;