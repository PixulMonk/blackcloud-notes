import mongoose, { Schema } from 'mongoose';

export interface INote {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  encryptedContent?: string; // base64 — IV ‖ ciphertext ‖ tag
  schemaVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    encryptedContent: { type: String },
    schemaVersion: { type: Number, required: true, default: 1 },
  },
  { timestamps: true },
);

noteSchema.index({ userId: 1 });
noteSchema.index({ userId: 1, isDeleted: 1 });

export const Note = mongoose.model<INote>('Note', noteSchema);
