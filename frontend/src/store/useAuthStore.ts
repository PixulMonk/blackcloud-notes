import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import axios from 'axios';
import { axiosInstance } from '@/lib/axios';

import type {
  AuthState,
  AuthStateActions,
  AuthStoreState,
} from '@/types/auth.types';
import type { LoginMetaDetaResponse } from '@/types/encryption.types';
import { toBase64 } from '@/lib/crypto/crypto-utils';

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

        const response = await axiosInstance.post(`auth/signup`, payload);

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
        const response = await axiosInstance.post(`auth/login`, payload);
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
        const response = await axiosInstance.post<LoginMetaDetaResponse>(
          `auth/getLoginMetadata`,
          {
            email,
          },
        );
        const { argon2Salt, protectedDEK, argon2Params } = response.data;
        set({ isLoading: false, error: null });

        return {
          argon2Salt,
          protectedDEK,
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
        const response = await axiosInstance.post(`auth/verify-email`, {
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
    resendVerificationEmail: async (email) => {
      set({ isLoading: true, error: null });

      try {
        const response = await axiosInstance.post('auth/resend-verification', {
          email,
        });

        set({
          message: response.data.message,
          isLoading: false,
        });

        return {
          success: true,
          retryAfter: response.data.retryAfter,
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const retryAfter = error.response?.data?.retryAfter;

          set({
            error:
              error.response?.data?.message ||
              'Error sending verification email',
            isLoading: false,
          });

          return {
            success: false,
            retryAfter: retryAfter,
          };
        } else {
          set({
            error: 'An unexpected error occurred',
            isLoading: false,
          });

          return { success: false };
        }
      }
    },
    checkAuth: async () => {
      const state = useAuthStore.getState();
      if (state.isAuthenticated) return;
      set({ isCheckingAuth: true, error: null });
      try {
        const response = await axiosInstance.get(`auth/check-auth`);
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
        await axiosInstance.post(`auth/logout`);
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
        const response = await axiosInstance.post('auth/forgot-password', {
          email,
        });

        set({
          message: response.data.message,
          isLoading: false,
        });

        return {
          success: true,
          retryAfter: response.data.retryAfter, // may be undefined
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const retryAfter = error.response?.data?.retryAfter;

          set({
            error:
              error.response?.data?.message ||
              'Error sending password reset email',
            isLoading: false,
          });

          return {
            success: false,
            retryAfter,
          };
        } else {
          set({
            error: 'An unexpected error occurred',
            isLoading: false,
          });

          return {
            success: false,
            retryAfter: undefined,
          };
        }
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
        await axiosInstance.post(`auth/reset-password/${token}`, {
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
