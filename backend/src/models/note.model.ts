import mongoose, { Schema } from 'mongoose';

export interface INote {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  title?: string;
  icon?: string;
  encryptedContent?: string;
  isArchived?: boolean;
  isDeleted?: boolean;
  tags?: string[];
}

const noteSchema = new Schema<INote>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String },
    icon: { type: String },
    encryptedContent: { type: String },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export const Note = mongoose.model<INote>('Note', noteSchema);
