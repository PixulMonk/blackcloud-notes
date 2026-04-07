import type { TreeNode } from '@/types/tree.types';
import { create } from 'zustand';

interface TreeUIState {
  renamingNodeId: string | null;
  selectedNodeId: string | null;
  selectedFileId: string | null;
  selectedFileTitle: string | null;

  setRenamingNodeId: (id: string | null) => void;
  selectNode: (node: TreeNode) => void;
  setFileTitle: (newTitle: string) => void;
}

export const useTreeUIStore = create<TreeUIState>((set) => ({
  renamingNodeId: null,
  selectedNodeId: null,
  selectedFileId: null,
  selectedFileTitle: null,

  setRenamingNodeId: (id) => {
    set({ renamingNodeId: id });
  },

  selectNode: (node) => {
    if (node.type === 'folder') return;

    set({
      selectedNodeId: node._id,
      selectedFileId: node.type === 'file' ? (node.fileId ?? null) : null,
      selectedFileTitle: node.type === 'file' ? (node.title ?? null) : null,
    });
  },
  setFileTitle: (newTitle) => set({ selectedFileTitle: newTitle }),
}));
