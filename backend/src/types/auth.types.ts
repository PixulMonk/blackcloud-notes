import { Request } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
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
  protectedDEK: string; // base64 — IV ‖ ciphertext ‖ tag
  argon2Salt: string; // base64
  argon2Params: Argon2Params;
}

export interface LoginMetadataRequest {
  email: string;
}

export interface LoginMetaDataResponse extends AuthResponse {
  argon2Salt: string; // base64
  argon2Params: Argon2Params;
  protectedDEK: string; // base64 — IV ‖ ciphertext ‖ tag
}

export interface LoginRequest {
  email: string;
  authToken: string;
}

export interface VerifyEmailRequest {
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordParams {
  token: string;
}

export interface ResetPasswordRequest {
  newAuthToken: string;
  newProtectedDEK: string; // base64 — IV ‖ ciphertext ‖ tag
  newArgon2Salt: string;
  argon2Params: Argon2Params;
}
