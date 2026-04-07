import { Argon2Params } from '@blackcloud/shared';
import { IUser } from '../models/user.model';
import { SimpleResponse } from './common.types';

export type SanitizedUser = Omit<
  IUser,
  | 'hashedAuthToken'
  | 'protectedDEK'
  | 'argon2Salt'
  | 'argon2Params'
  | 'resetPasswordToken'
  | 'resetPasswordExpiresAt'
  | 'verificationToken'
  | 'verificationTokenExpiresAt'
>;

export interface AuthResponse extends SimpleResponse {
  user?: SanitizedUser;
}

export interface SignupRequest {
  name: string;
  email: string;
  authToken: string; // base64
  protectedDEK: {
    ciphertext: string;
    iv: string;
    authTag: string;
  };
  argon2Salt: string; // base64
  argon2Params: Argon2Params;
}

export interface LoginRequest {
  email: string;
  authToken: string;
}

export interface LoginMetadataRequest {
  email: string;
}

export interface VerifyEmailRequest {
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  newAuthToken: string;
  newProtectedDEK: {
    ciphertext: string;
    iv: string;
    authTag: string;
  };
  newArgon2Salt: string;
  argon2Params: Argon2Params;
}
