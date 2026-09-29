import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { User, IUser } from "../models/user.model";

import { SimpleResponse } from "../types/common.types";
import {
  AuthTokenConfirmRequest,
  AuthResponse,
  UpdateUserRequest,
} from "../types";

import asyncHandler from "../utils/asyncHandler";
import { sanitizeUser } from "../utils/sanitizeUser";
import deleteUserData from "../utils/deleteUserData";
import {
  sendAccountDeletionConfirmationEmail,
  sendVaultWipeConfirmationEmail,
} from "../mailer/emails";

export const deleteUser = asyncHandler(
  async (
    req: Request<{}, SimpleResponse, AuthTokenConfirmRequest>,
    res: Response<SimpleResponse>,
  ) => {
    const userId = req.user?._id;
    const { authToken } = req.body;

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!authToken) {
      throw new Error("Password confirmation is required");
    }

    const user = await User.findById(userId).select("+hashedAuthToken");

    if (!user) {
      throw new Error("User not found");
    }

    const isAuthVerified = await bcrypt.compare(
      authToken,
      user.hashedAuthToken,
    );

    if (!isAuthVerified) {
      throw new Error("Incorrect password");
    }

    await deleteUserData(userId.toString());

    await sendAccountDeletionConfirmationEmail(user.name, user.email);

    await User.findByIdAndDelete(userId);

    res.cookie("jwt", "", { maxAge: 0 });
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  },
);

export const updateUser = asyncHandler(
  async (
    req: Request<{}, AuthResponse, UpdateUserRequest>,
    res: Response<AuthResponse>,
  ): Promise<void> => {
    const userId = req.user?._id;

    if (!userId) {
      throw new Error("User ID is required");
    }

    const updates: Partial<Pick<IUser, "name">> = {};

    if (req.body.name !== undefined) {
      if (typeof req.body.name !== "string" || !req.body.name.trim()) {
        throw new Error("Name must be a non-empty string");
      }
      if (req.body.name.trim().length > 50) {
        throw new Error("Name must be 50 characters or fewer");
      }
      updates.name = req.body.name.trim();
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("No valid fields to update");
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new Error("User not found");
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: sanitizeUser(updatedUser),
    });
  },
);

export const wipeVault = asyncHandler(
  async (
    req: Request<{}, SimpleResponse, AuthTokenConfirmRequest>,
    res: Response<SimpleResponse>,
  ): Promise<void> => {
    const userId = req.user?._id;
    const { authToken } = req.body;

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!authToken) {
      throw new Error("Password confirmation is required");
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const isAuthVerified = await bcrypt.compare(
      authToken,
      user.hashedAuthToken,
    );

    if (!isAuthVerified) {
      throw new Error("Incorrect password");
    }

    await deleteUserData(userId.toString());

    // The wipe is irreversible, so a mail failure must not turn a
    // successful wipe into a 500. Log it and carry on.
    try {
      await sendVaultWipeConfirmationEmail(user.name, user.email);
    } catch (error) {
      console.error("Failed to send vault wipe confirmation email:", error);
    }

    res.status(200).json({
      success: true,
      message: "Vault wiped successfully",
    });
  },
);
