import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import mongoose, { sanitizeFilter } from 'mongoose';
import dotenv from 'dotenv';

import asyncHandler from '../utils/asyncHandler';
import { generateSixDigitCode } from '../utils/generateVerificationCode';
import { generateSalt } from '../utils/generateKDFSalt';
import { User } from '../models/user.model';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie';
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetSuccessEmail,
} from '../../mailer/emails';

dotenv.config();

export const checkAuth = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = await User.findById(req.user).select('-password -kdfSalt');

    if (!user) {
      throw new Error('User not found');
    }
    res.status(200).json({ success: true, user: user });
  }
);

export const signup = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      throw new Error(
        'Unable to create account. Please check your details or try logging in'
      );
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      kdfSalt: generateSalt(),
      password: hashedPassword,
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
      newUser.verificationToken!
    );

    // remove password for return response
    const {
      password: _removed,
      kdfSalt: _saltRemoved,
      ...sanitizedUser
    } = newUser.toObject();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: sanitizedUser,
    });
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new Error('Invalid credentials');
    }

    const userId = user._id as mongoose.Types.ObjectId;
    generateTokenAndSetCookie(res, userId.toString());

    const {
      password: _removed,
      kdfSalt: _saltRemoved,
      ...sanitizedUser
    } = user.toObject();

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: sanitizedUser,
    });
  }
);

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.cookie('jwt', '', { maxAge: 0 });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const verifyEmail = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
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

    res.status(200).json({
      success: true,
      message: 'User verified successfully',
      user: user,
    });
  }
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      //  Return a generic success message to prevent user enumeration attacks
      res.status(200).json({
        success: true,
        message:
          'If an account with that email exists, you will receive further instructions shortly.',
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // expires in 1 hour

    user!.resetPasswordToken = resetToken;
    user!.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user?.save();

    const APP_BASE_URL: string =
      process.env.APP_DOMAIN || 'http://localhost:5173';

    await sendPasswordResetEmail(
      user!.name,
      user!.email,
      `${APP_BASE_URL}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message:
        'If an account with that email exists, you will receive further instructions shortly.',
    });
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error('Invalid or expired reset link');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user!.password = hashedPassword;
    user!.resetPasswordToken = undefined;
    user!.resetPasswordExpiresAt = undefined;
    await user!.save();

    await sendPasswordResetSuccessEmail(user.name, user.email);

    res.status(200).json({
      sucess: true,
      message: 'Your password has been reset successfully',
    });
  }
);
