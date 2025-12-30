import type { TreeNode } from '@/types/tree';
import { create } from 'zustand';

interface TreeUIState {
  renamingNodeId: string | null;
  selectedNodeId: string | null;
  selectedFileId: string | null;

  setRenamingNodeId: (id: string | null) => void;
  selectNode: (node: TreeNode) => void;
}

export const useTreeUIStore = create<TreeUIState>((set) => ({
  renamingNodeId: null,
  selectedNodeId: null,
  selectedFileId: null,

  setRenamingNodeId: (id) => {
    set({ renamingNodeId: id });
  },

  selectNode: (node) =>
    set({
      selectedNodeId: node._id,
      selectedFileId: node.type === 'file' ? node.fileId ?? null : null,
    }),
}));
