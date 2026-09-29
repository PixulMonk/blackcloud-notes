import { HydratedDocument } from "mongoose";
import { IUser } from "../models/user.model";
import { SanitizedUser } from "../types/auth.types";

export const sanitizeUser = (user: HydratedDocument<IUser>): SanitizedUser => {
  const {
    hashedAuthToken: _hashedAuthToken,
    protectedDEK: _protectedDEK,
    argon2Salt: _argon2Salt,
    argon2Params: _argon2Params,
    resetPasswordToken: _resetPasswordToken,
    resetPasswordExpiresAt: _resetPasswordExpiresAt,
    verificationToken: _verificationToken,
    verificationTokenExpiresAt: _verificationTokenExpiresAt,
    ...sanitized
  } = user.toObject();
  return sanitized;
};
