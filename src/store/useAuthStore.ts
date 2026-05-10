import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  role: 'student' | 'owner' | 'admin' | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: 'student' | 'owner' | 'admin' | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, role: null }),
}));
