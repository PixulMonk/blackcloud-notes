import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';
axios.defaults.withCredentials = true;

interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  // Delete message later if unused. Leaving it here for now just in case
  message: string | null;
  error: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  setMessage: (message: string | null) => void;
  setError: (error: string | null) => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  verifyEmail: (verificationCode: string) => Promise<boolean>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (password: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  message: null,
  error: null,
  isLoading: false,
  isCheckingAuth: true,

  setMessage: (message) => set({ message }),
  setError: (error) => set({ error }),
  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        name,
        email,
        password,
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        set({
          error: error.response?.data?.message || 'Error signing up',
          isLoading: false,
        });
        return false;
      } else {
        set({ error: 'An unexpected error occurred', isLoading: false });
        return false;
      }
    }
  },
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        set({
          error: error.response?.data?.message || 'Error signing in',
          isLoading: false,
        });
        return false;
      } else {
        set({ error: 'An unexpected error occurred', isLoading: false });
        return false;
      }
    }
  },
  verifyEmail: async (verificationCode) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/verify-email`, {
        code: verificationCode,
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        set({
          error: error.response?.data?.message || 'Error verifying email',
          isLoading: false,
        });
        return false;
      } else {
        set({ error: 'An unexpected error occurred', isLoading: false });
        return false;
      }
    }
  },
  checkAuth: async () => {
    const state = useAuthStore.getState();
    if (state.isAuthenticated) return;
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/check-auth`);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (error) {
      set({ error: null, isCheckingAuth: false, isAuthenticated: false });
    }
  },
  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      await axios.post(`${API_URL}/logout`);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        set({
          error: error.response?.data?.message || 'Error logging out',
          isLoading: false,
        });
        throw error;
      } else {
        set({ error: 'An unexpected error occurred', isLoading: false });
        throw error;
      }
    }
  },
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, {
        email,
      });
      set({
        message: response.data.message,
        isLoading: false,
      });
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        set({
          error:
            error.response?.data?.message ||
            'Error sending password reset email',
          isLoading: false,
        });
        return false;
      } else {
        set({ error: 'An unexpected error occurred', isLoading: false });
        return false;
      }
    }
  },
  resetPassword: async (password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/reset-password/:token`);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        set({
          error: error.response?.data?.message || 'Error resetting password',
          isLoading: false,
        });
        return false;
      } else {
        set({ error: 'An unexpected error occurred', isLoading: false });
        return false;
      }
    }
  },
}));
