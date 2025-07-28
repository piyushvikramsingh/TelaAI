import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  status?: string;
  lastSeen?: string;
  isOnline?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  updateUserStatus: (status: string) => void;
  setOnlineStatus: (isOnline: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },
      
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
      
      updateUserStatus: (status: string) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, status }
          });
        }
      },
      
      setOnlineStatus: (isOnline: boolean) => {
        const { user } = get();
        if (user) {
          set({
            user: { 
              ...user, 
              isOnline,
              lastSeen: isOnline ? undefined : new Date().toISOString()
            }
          });
        }
      },
    }),
    {
      name: 'chattyy-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);