// TODO: typing and checking if sensitive data is being leaked in the responses
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { ENCRYPTION_CONFIG } from '@blackcloud/shared';
import asyncHandler from '../utils/asyncHandler';
import { generateSixDigitCode } from '../utils/generateVerificationCode';
import deleteUserData from '../utils/deleteUserData';
import { User } from '../models/user.model';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie';
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetSuccessEmail,
} from '../mailer/emails';
import {
  AuthResponse,
  ForgotPasswordRequest,
  LoginMetadataRequest,
  LoginMetaDataResponse,
  LoginRequest,
  ResendVerificationEmailRequest,
  ResendEmailResponse,
  ResetPasswordParams,
  ResetPasswordRequest,
  SignupRequest,
  VerifyEmailRequest,
} from '../types';
import { SimpleResponse } from '../types/common.types';
import {
  checkCooldown,
  getProgressiveCooldown,
  shouldResetAttempts,
} from '../utils/cooldownHelpers';

dotenv.config();

export const checkAuth = asyncHandler(
  async (
    req: Request<{}, AuthResponse, {}>,
    res: Response<AuthResponse>,
  ): Promise<void> => {
    const user = await User.findById(req.user);

    if (!user) {
      throw new Error('User not found');
    }

    // TODO: extract this process to helper
    // Remove sensitive crypto data before sending to client
    const {
      hashedAuthToken: _removed,
      protectedDEK: _dekRemoved,
      argon2Salt: _saltRemoved,
      argon2Params: _paramsRemoved,
      resetPasswordToken: _resetRemoved,
      resetPasswordExpiresAt: _resetExpiryRemoved,
      verificationToken: _verifyRemoved,
      verificationTokenExpiresAt: _verifyExpiryRemoved,
      ...sanitizedUser
    } = user.toObject();

    res.status(200).json({ success: true, user: sanitizedUser });
  },
);

export const signup = asyncHandler(
  async (
    req: Request<{}, AuthResponse, SignupRequest>,
    res: Response<AuthResponse>,
  ): Promise<void> => {
    const {
      name,
      email,
      authToken, // bytes 32-63 from client-side Argon2id
      protectedDEK, // base64 — IV ‖ ciphertext ‖ tag
      argon2Salt, // base64 — CSPRNG generated client-side
      argon2Params, // { memoryCost, timeCost, parallelism, hashLength, type }
    } = req.body;

    if (
      !name ||
      !email ||
      !authToken ||
      !protectedDEK ||
      !argon2Salt ||
      !argon2Params
    ) {
      throw new Error('All fields are required');
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      throw new Error(
        'Unable to create account. Please check your details or try logging in',
      );
    }

    const hashedAuthToken: string = await bcrypt.hash(authToken, 12);

    const newUser = new User({
      name,
      email,
      hashedAuthToken: hashedAuthToken,
      protectedDEK,
      argon2Salt,
      argon2Params,
      schemaVersion: ENCRYPTION_CONFIG.schemaVersion,
      verificationToken: generateSixDigitCode(),
      verificationTokenExpiresAt: Date.now() + 5 * 60 * 1000, // expires in 5 minutes
    });

    await newUser.save();

    // jwt
    const userId = newUser._id as mongoose.Types.ObjectId;
    generateTokenAndSetCookie(res, userId.toString());

    // verification email
    await sendVerificationEmail(
      newUser.name,
      newUser.email,
      newUser.verificationToken!,
    );

    // remove sensitive info for return response
    const {
      hashedAuthToken: _removed,
      protectedDEK: _dekRemoved,
      argon2Salt: _saltRemoved,
      argon2Params: _paramsRemoved,
      verificationToken: _verifyRemoved,
      verificationTokenExpiresAt: _verifyExpiryRemoved,
      ...sanitizedUser
    } = newUser.toObject();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: sanitizedUser,
    });
  },
);

export const getLoginMetadata = asyncHandler(
  async (
    req: Request<{}, LoginMetaDataResponse, LoginMetadataRequest>,
    res: Response<LoginMetaDataResponse>,
  ): Promise<void> => {
    const { email } = req.body;

    if (!email) {
      throw new Error('All fields are required');
    }

    const user = await User.findOne({ email });

    if (!user) {
      const fakeSalt = crypto
        .createHmac('sha256', process.env.SALT_HMAC_SECRET!)
        .update(email)
        .digest('base64');

      const fakeBinaryBlob = crypto.randomBytes(12 + 32 + 16);
      const fakeBlobBase64 = fakeBinaryBlob.toString('base64');

      res.status(200).json({
        success: true,
        argon2Salt: fakeSalt,
        argon2Params: ENCRYPTION_CONFIG.argon2,
        protectedDEK: fakeBlobBase64,
      });
      return;
    }

    res.status(200).json({
      success: true,
      argon2Salt: user.argon2Salt,
      argon2Params: user.argon2Params,
      protectedDEK: user.protectedDEK,
    });
  },
);

export const login = asyncHandler(
  async (
    req: Request<{}, AuthResponse, LoginRequest>,
    res: Response<AuthResponse>,
  ): Promise<void> => {
    const { email, authToken } = req.body;

    if (!email || !authToken) {
      throw new Error('All fields are required');
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isAuthVerified = await bcrypt.compare(
      authToken,
      user.hashedAuthToken,
    );

    if (!isAuthVerified) {
      throw new Error('Invalid credentials');
    }

    const userId = user._id as mongoose.Types.ObjectId;
    generateTokenAndSetCookie(res, userId.toString());

    // check what you are returning.. See diagram
    const {
      hashedAuthToken: _removed,
      protectedDEK: _dekRemoved,
      argon2Salt: _saltRemoved,
      argon2Params: _paramsRemoved,
      resetPasswordToken: _resetRemoved,
      resetPasswordExpiresAt: _resetExpiryRemoved,
      verificationToken: _verifyRemoved,
      verificationTokenExpiresAt: _verifyExpiryRemoved,
      ...sanitizedUser
    } = user.toObject();

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: sanitizedUser,
    });
  },
);

export const logout = async (
  req: Request<{}, SimpleResponse, {}>,
  res: Response<SimpleResponse>,
): Promise<void> => {
  res.cookie('jwt', '', { maxAge: 0 });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const verifyEmail = asyncHandler(
  async (
    req: Request<{}, AuthResponse, VerifyEmailRequest>,
    res: Response<AuthResponse>,
  ): Promise<void> => {
    const { code } = req.body;

    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error('Invalid or expired verification code');
    }

    user!.isVerified = true;
    user!.verificationToken = undefined;
    user!.verificationTokenExpiresAt = undefined;
    await user!.save();

    await sendWelcomeEmail(user!.name, user!.email);

    // Remove sensitive data before sending to client
    const {
      hashedAuthToken: _removed,
      protectedDEK: _dekRemoved,
      argon2Salt: _saltRemoved,
      argon2Params: _paramsRemoved,
      resetPasswordToken: _resetRemoved,
      resetPasswordExpiresAt: _resetExpiryRemoved,
      verificationToken: _verifyRemoved,
      verificationTokenExpiresAt: _verifyExpiryRemoved,
      ...sanitizedUser
    } = user!.toObject();

    res.status(200).json({
      success: true,
      message: 'User verified successfully',
      user: sanitizedUser,
    });
  },
);

export const forgotPassword = asyncHandler(
  async (
    req: Request<{}, ResendEmailResponse, ForgotPasswordRequest>,
    res: Response<ResendEmailResponse>,
  ): Promise<void> => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always respond the same (security)
    const genericResponse = {
      success: true,
      message:
        'If an account with that email exists, you will receive further instructions shortly.',
    };

    if (!user) {
      res.status(200).json(genericResponse);
      return;
    }

    // ---- cooldown logic (only if user exists) ----
    const attempts = user.resendCooldowns.passwordResetResendAttempts ?? 0;

    const cooldown = getProgressiveCooldown(attempts);

    const lastSent = user.resendCooldowns.passwordReset;

    const RESET_WINDOW = 60 * 60 * 1000; // 1 hour

    if (lastSent) {
      const elapsed = Date.now() - new Date(lastSent).getTime();

      // decay
      if (elapsed > RESET_WINDOW) {
        user.resendCooldowns.passwordResetResendAttempts = 0;
      }

      // block if still in cooldown
      if (elapsed < cooldown) {
        const retryAfter = Math.ceil((cooldown - elapsed) / 1000);

        res.status(429).json({
          success: false,
          message: `Please wait ${retryAfter}s before retrying`,
          retryAfter: retryAfter.toString(),
        });

        return;
      }
    }

    // ---- reset token generation ----
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    user.resendCooldowns.passwordReset = new Date();
    user.resendCooldowns.passwordResetResendAttempts = attempts + 1;

    await user.save();

    const BASE_URL = process.env.CLIENT_URL || 'http://localhost:5173';

    await sendPasswordResetEmail(
      user.name,
      user.email,
      `${BASE_URL}/reset-password/${resetToken}`,
    );

    res.status(200).json(genericResponse);
  },
);

// resetPassword is the DESTRUCTIVE VERSION of password change
// (this is when the user forgets their password)
export const resetPassword = asyncHandler(
  async (
    req: Request<ResetPasswordParams, SimpleResponse, ResetPasswordRequest>,
    res: Response<SimpleResponse>,
  ): Promise<void> => {
    const { token } = req.params;
    const {
      newAuthToken,
      newProtectedDEK,
      newArgon2Salt,
      argon2Params, // new params or may be same as before
    } = req.body;

    if (!newAuthToken || !newProtectedDEK || !newArgon2Salt || !argon2Params) {
      throw new Error('All fields are required');
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error('Invalid or expired reset link');
    }

    const hashedAuthToken = await bcrypt.hash(newAuthToken, 12);

    // Old data is wiped from the DB to remove corrupt nodes before updating credentials
    await deleteUserData(user._id.toString());

    // atomic update — all fields change together or not at all
    user.hashedAuthToken = hashedAuthToken;
    user.protectedDEK = newProtectedDEK;
    user.argon2Salt = newArgon2Salt;
    user.argon2Params = argon2Params;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendPasswordResetSuccessEmail(user.name, user.email);

    res.status(200).json({
      success: true,
      message: 'Your password has been reset successfully',
    });
  },
);

// TODO: Change password controller and route (non-destructive password change; DEK is present)

export const resendVerificationEmail = asyncHandler(
  async (
    req: Request<{}, ResendEmailResponse, ResendVerificationEmailRequest>,
    res: Response<ResendEmailResponse>,
  ): Promise<void> => {
    const { email } = req.body;

    if (!email) {
      throw new Error('Email is required');
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isVerified) {
      throw new Error('User already verified');
    }

    const attempts = user.resendCooldowns.verificationResendAttempts ?? 0;

    const cooldown = getProgressiveCooldown(attempts);

    const lastSent = user.resendCooldowns.verification;

    if (shouldResetAttempts(lastSent, 60 * 60 * 1000)) {
      user.resendCooldowns.verificationResendAttempts = 0;
    }

    const cooldownCheck = checkCooldown(lastSent, cooldown);

    if (!cooldownCheck.allowed) {
      res.status(429).json({
        success: false,
        message: `Please wait ${cooldownCheck.retryAfter}s`,
        retryAfter: cooldownCheck.retryAfter!.toString(),
      });

      return;
    }

    user.verificationToken = generateSixDigitCode().toString();
    user.verificationTokenExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    user.resendCooldowns.verification = new Date();
    user.resendCooldowns.verificationResendAttempts = attempts + 1;

    await user.save();

    await sendVerificationEmail(user.name, user.email, user.verificationToken);

    res.status(200).json({
      success: true,
      message: 'Verification email resent successfully',
    });
  },
);
