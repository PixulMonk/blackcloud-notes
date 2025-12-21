import mongoose, { Schema, Document } from 'mongoose';

export interface ITreeNode extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  type: 'folder' | 'file';
  position: number;
  isArchived?: boolean;
  isDeleted?: boolean;
  icon?: string;
  parentId?: mongoose.Types.ObjectId | null;
  fileId?: mongoose.Types.ObjectId; // Only for 'file' nodes
}

const treeNodeSchema = new Schema<ITreeNode>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['folder', 'file'], required: true },
    position: { type: Number, required: true, default: 0 },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    icon: { type: String, default: null },
    parentId: { type: Schema.Types.ObjectId, default: null },
    fileId: { type: Schema.Types.ObjectId, ref: 'Note' },
  },
  { timestamps: true }
);

export const TreeNode = mongoose.model<ITreeNode>('TreeNode', treeNodeSchema);
