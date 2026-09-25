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

    if (!subject || !message) {
      throw new Error("Subject and message are required");
    }

    await sendSupportContactEmail(req.user!.email, subject, message);

    res.status(201).json({
      success: true,
      message: "Support request submitted successfully",
    });
  },
);
