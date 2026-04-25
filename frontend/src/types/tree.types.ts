import type { RefObject } from 'react';

interface BaseTreeNode {
  _id: string;
  userId: string;
  type: 'folder' | 'file';
  position: number;
  isArchived?: boolean;
  isDeleted?: boolean;
  icon?: string;
  parentId?: string | null;
  fileId?: string;
}

export interface TreeNodeDTO extends BaseTreeNode {
  encryptedTitle: string;
  children?: TreeNodeDTO[];
}

export interface TreeNode extends BaseTreeNode {
  title: string;
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

export interface TreeUIActions {
  setRenamingNodeId: (id: string | null) => void;
  selectNode: (node: TreeNode) => void;
  setFileTitle: (newTitle: string) => void;
}

export interface TreeUIState {
  renamingNodeId: string | null;
  selectedNodeId: string | null;
  selectedFileId: string | null;
  selectedFileTitle: string | null;
  actions: TreeUIActions;
}

export type TreeUIStoreState = Omit<TreeUIState, 'actions'>;
