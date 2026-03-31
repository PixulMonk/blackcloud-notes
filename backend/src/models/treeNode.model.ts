import mongoose, { Schema, Document } from 'mongoose';

export interface ITreeNode extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  encryptedTitle: string; // base64 — IV ‖ ciphertext ‖ tag
  type: 'folder' | 'file';
  position: number;
  isArchived?: boolean;
  archivedAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  icon?: string;
  parentId?: mongoose.Types.ObjectId | null;
  fileId?: mongoose.Types.ObjectId;
  schemaVersion: number;
}

const treeNodeSchema = new Schema<ITreeNode>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    encryptedTitle: { type: String, required: true },
    type: { type: String, enum: ['folder', 'file'], required: true },
    position: { type: Number, required: true, default: 0 },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    icon: { type: String, default: null },
    parentId: { type: Schema.Types.ObjectId, default: null },
    fileId: { type: Schema.Types.ObjectId, ref: 'Note' },
    schemaVersion: { type: Number, required: true, default: 1 },
  },
  { timestamps: true },
);

treeNodeSchema.index({ userId: 1 });
treeNodeSchema.index({ userId: 1, parentId: 1 });
treeNodeSchema.index({ userId: 1, type: 1 });

export const TreeNode = mongoose.model<ITreeNode>('TreeNode', treeNodeSchema);
