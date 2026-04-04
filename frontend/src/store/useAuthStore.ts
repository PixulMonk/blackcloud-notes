import { create } from 'zustand';
import axios from 'axios';

import {
  type Argon2Params,
  type RawProtectedDEK,
  type ProtectedDEK,
  type LoginMetaData,
  type LoginMetaDetaResponse,
} from '@/types/encryption';
import { toBase64, fromBase64 } from '@/lib/crypto/crypto-utils';

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
  signup: (
    // TODO: authToken, protectedDEK, argon2Salt, should all be strings
    // TODO: decide whether to handle the string conversion here in the store or in the components
    name: string,
    email: string,
    authToken: Uint8Array,
    protectedDEK: RawProtectedDEK,
    argon2Salt: Uint8Array,
    argon2Params: Argon2Params,
  ) => Promise<boolean>;
  login: (email: string, authToken: string) => Promise<boolean>;
  getLoginMetadata: (email: string) => Promise<LoginMetaData | undefined>;
  verifyEmail: (verificationCode: string) => Promise<boolean>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (
    token: string,
    newAuthToken: string,
    newProtectedDEK: ProtectedDEK,
    newArgon2Salt: string,
    Argon2Params: Argon2Params,
  ) => Promise<boolean>;
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
  signup: async (
    name,
    email,
    authToken,
    protectedDEK,
    argon2Salt,
    argon2Params,
  ) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        name,
        email,
        authToken: toBase64(authToken),
        protectedDEK: {
          iv: toBase64(protectedDEK.iv),
          ciphertext: toBase64(protectedDEK.ciphertext),
          authTag: toBase64(protectedDEK.authTag),
        },
        argon2Salt: toBase64(argon2Salt),
        argon2Params,
      };

      const response = await axios.post(`${API_URL}/signup`, payload);

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
      } else {
        set({ error: 'An unexpected error occurred', isLoading: false });
      }
      return false;
    }
  },
  login: async (email, authToken) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        authToken,
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
      } else {
        set({ error: 'An unexpected error occurred', isLoading: false });
      }
      return false;
    }
  },

  getLoginMetadata: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<LoginMetaDetaResponse>(
        `${API_URL}/getLoginMetadata`,
        {
          email,
        },
      );
      const { argon2Salt, protectedDEK, argon2Params } = response.data;
      set({ isLoading: false, error: null });

      return {
        argon2Salt: fromBase64(argon2Salt),
        protectedDEK: {
          ciphertext: fromBase64(protectedDEK.ciphertext),
          iv: fromBase64(protectedDEK.iv),
          authTag: fromBase64(protectedDEK.authTag),
        },
        argon2Params,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        set({
          error: error.response?.data?.message || 'Error signing in',
          isLoading: false,
        });
      } else {
        set({ error: 'An unexpected error occurred', isLoading: false });
      }
      return;
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
      } else {
        set({ error: 'An unexpected error occurred', isLoading: false });
      }
      return false;
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
      } else {
        set({ error: 'An unexpected error occurred', isLoading: false });
      }
      return false;
    }
  },
  resetPassword: async (
    token,
    newAuthToken,
    newProtectedDEK,
    newArgon2Salt,
    argon2Params,
  ) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${API_URL}/reset-password/${token}`, {
        newAuthToken,
        newProtectedDEK,
        newArgon2Salt,
        argon2Params,
      });
      set({ isLoading: false });
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        set({
          error: error.response?.data?.message || 'Error resetting password',
          isLoading: false,
        });
      } else {
        set({ error: 'An unexpected error occurred', isLoading: false });
      }
      return false;
    }
  },
}));
