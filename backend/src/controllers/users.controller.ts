import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { User } from "../models/user.model";
import deleteUserData from "../utils/deleteUserData";

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new Error("User ID is required");
  }

  await deleteUserData(userId.toString());
  await User.findByIdAndDelete(userId);

  res.status(200).json({ message: "User deleted successfully" });
});

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
