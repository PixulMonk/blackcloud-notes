import mongoose, { Schema } from 'mongoose';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  hashedAuthToken: string;
  protectedDEK: {
    ciphertext: string;
    iv: string;
    authTag: string;
  };
  argon2Salt: string;
  argon2Params: {
    memoryCost: number;
    timeCost: number;
    parallelism: number;
    hashLength: number;
    type: 'argon2id';
  };
  schemaVersion: number;
  subscription: string;
  lastLogin: Date;
  isVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: Date;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    hashedAuthToken: { type: String, required: true },
    protectedDEK: {
      ciphertext: { type: String, required: true },
      iv: { type: String, required: true },
      authTag: { type: String, required: true },
    },
    argon2Salt: { type: String, required: true },
    argon2Params: {
      memoryCost: { type: Number, required: true },
      timeCost: { type: Number, required: true },
      parallelism: { type: Number, required: true },
      hashLength: { type: Number, required: true },
      type: { type: String, required: true },
    },
    schemaVersion: { type: Number, required: true, default: 1 },
    subscription: { type: String },
    lastLogin: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>('User', userSchema);
