import { Request, Response } from "express";
import bcrypt from "bcrypt";

import asyncHandler from "../utils/asyncHandler";
import { User } from "../models/user.model";
import deleteUserData from "../utils/deleteUserData";
import { SimpleResponse } from "../types/common.types";
import { sendAccountDeletionConfirmationEmail } from "../mailer/emails";

export const deleteUser = asyncHandler(
  async (
    req: Request<{}, SimpleResponse, { authToken: string }>,
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

    // req.user from protectRoute likely omits hashedAuthToken (like the sanitized login response) —
    // fetch it explicitly if so
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

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new Error("User ID is required");
  }

  // Allow name updates for now, but we can add more fields later if needed
  const { name } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name },
    { new: true },
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  res
    .status(200)
    .json({ message: "User updated successfully", user: updatedUser });
});
