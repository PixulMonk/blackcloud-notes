import { create } from 'zustand';
import type {
  TreeUIActions,
  TreeUIState,
  TreeUIStoreState,
} from '@/types/treeStore.types';
import { useShallow } from 'zustand/react/shallow';

const useTreeUIStore = create<TreeUIState>((set) => ({
  renamingNodeId: null,
  selectedNodeId: null,
  selectedFileId: null,
  selectedFileTitle: null,
  selectedNode: null, // add this
  actions: {
    setRenamingNodeId: (id) => {
      set({ renamingNodeId: id });
    },

    selectNode: (node) => {
      if (node.type === 'folder') return;

      set({
        selectedNodeId: node._id,
        selectedFileId: node.type === 'file' ? (node.fileId ?? null) : null,
        selectedFileTitle: node.type === 'file' ? (node.title ?? null) : null,
        selectedNode: node,
      });
    },
    setFileTitle: (newTitle) => set({ selectedFileTitle: newTitle }),
  },
}));

export const useTreeUI = (): TreeUIStoreState =>
  useTreeUIStore(
    useShallow((s) => ({
      renamingNodeId: s.renamingNodeId,
      selectedNodeId: s.selectedFileId,
      selectedFileId: s.selectedFileId,
      selectedFileTitle: s.selectedFileTitle,
      selectedNode: s.selectedNode, // add this
    })),
  );

export const useTreeUIActions = (): TreeUIActions =>
  useTreeUIStore((s) => s.actions);
