import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import axios from 'axios';

import type {
  AuthState,
  AuthStateActions,
  AuthStoreState,
} from '@/types/auth.types';
import type { LoginMetaDetaResponse } from '@/types/encryption.types';
import { toBase64, fromBase64 } from '@/lib/crypto/crypto-utils';

const API_URL = 'http://localhost:3000/api/auth';
axios.defaults.withCredentials = true;

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  message: null,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  actions: {
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
          protectedDEK, // already in Base64
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
        const payload = {
          email,
          authToken: toBase64(authToken),
        };
        const response = await axios.post(`${API_URL}/login`, payload);
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
          protectedDEK: fromBase64(protectedDEK), // encrypted Uint8Array
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
  },
}));

export const useAuth = (): AuthStoreState =>
  useAuthStore(
    useShallow((s) => ({
      user: s.user,
      isAuthenticated: s.isAuthenticated,
      message: s.message,
      error: s.error,
      isLoading: s.isLoading,
      isCheckingAuth: s.isCheckingAuth,
    })),
  );

export const useAuthActions = (): AuthStateActions =>
  useAuthStore((s) => s.actions);
