import type { RefObject } from 'react';

export interface TreeNode {
  _id: string;
  userId: string;
  title: string;
  type: 'folder' | 'file';
  position: number;
  createdAt?: string;
  isArchived?: boolean;
  isDeleted?: boolean;
  icon?: string;
  parentId?: string | null;
  fileId?: string;
  children?: TreeNode[];
}

export interface TreeProps {
  data: TreeNode[];
}

export interface TreeNodeComponentProps {
  node: TreeNode;
}

export interface NodeLabelProps {
  node: any;
  isRenaming: boolean;
  treeData: any;
  setTreeData: (data: any) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  handleRenameSubmit: () => void;
  className?: string;
}

export interface AddNodeResponse {
  success: boolean;
  message: string;
  data: TreeNode;
}
