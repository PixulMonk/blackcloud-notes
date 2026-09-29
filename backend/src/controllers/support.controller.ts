import { Request, Response } from "express";

import asyncHandler from "../utils/asyncHandler";
import { sendSupportContactEmail } from "../mailer/emails";
import {
  SubmitSupportRequest,
  SubmitSupportResponse,
} from "../types/support.types";

export const submitSupportRequest = asyncHandler(
  async (
    req: Request<{}, SubmitSupportResponse, SubmitSupportRequest, {}>,
    res: Response,
  ): Promise<void> => {
    const { subject, message } = req.body;

    if (!req.user?._id) {
      throw new Error("User not authenticated");
    }

    if (!req.user?.email) {
      throw new Error("User email not found");
    }

    if (!subject || !message) {
      throw new Error("Subject and message are required");
    }

    if (message.length > 1500) {
      throw new Error("Message exceeds maximum length of 1500 characters");
    }

    await sendSupportContactEmail(req.user!.email, subject, message);

    res.status(201).json({
      success: true,
      message: "Support request submitted successfully",
    });
  },
);
