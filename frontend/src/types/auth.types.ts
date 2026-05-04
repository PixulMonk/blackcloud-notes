import type { Argon2Params } from '@blackcloud/shared';
import type { LoginMetaDetaResponse } from '@/types/encryption.types';

// TODO: check if matches SanitizedUser returned by backend
export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
}

export interface AuthStateActions {
  setMessage: (message: string | null) => void;
  setError: (error: string | null) => void;
  signup: (
    name: string,
    email: string,
    authToken: Uint8Array,
    protectedDEK: string,
    argon2Salt: Uint8Array,
    argon2Params: Argon2Params,
  ) => Promise<boolean>;

  login: (email: string, authToken: Uint8Array) => Promise<boolean>;
  getLoginMetadata: (
    email: string,
  ) => Promise<LoginMetaDetaResponse | undefined>;
  verifyEmail: (verificationCode: string) => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<boolean>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (
    token: string,
    newAuthToken: string,
    newProtectedDEK: string,
    newArgon2Salt: string,
    Argon2Params: Argon2Params,
  ) => Promise<boolean>;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  // Delete message later if unused. Leaving it here for now just in case
  message: string | null;
  error: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  actions: AuthStateActions;
}

export type AuthStoreState = Omit<AuthState, 'actions'>;
