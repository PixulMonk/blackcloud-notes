import { create } from 'zustand';
import type {
  TreeUIActions,
  TreeUIState,
  TreeUIStoreState,
  SortPreference,
} from '@/types/treeStore.types';
import { useShallow } from 'zustand/react/shallow';

// TODO: selectedFileId and selectedNodeId is redundant

const useTreeUIStore = create<TreeUIState>((set) => ({
  renamingNodeId: null,
  selectedNodeId: null,
  selectedFileId: null,
  selectedFileTitle: null,
  selectedNode: null,
  sortPreference: { sortBy: 'alphabetical', order: 'asc' },
  actions: {
    setRenamingNodeId: (id) => {
      set({ renamingNodeId: id });
    },

    selectNode: (node) => {
      set({
        selectedNodeId: node._id,
        selectedNode: node,
      });

      if (node.type === 'file') {
        set({
          selectedFileId: node.fileId ?? null,
          selectedFileTitle: node.title ?? null,
        });
      }
    },

    clearSelection: () =>
      set({
        selectedNodeId: null,
        selectedFileId: null,
        selectedFileTitle: null,
        selectedNode: null,
      }),

    setFileTitle: (newTitle) => set({ selectedFileTitle: newTitle }),

    setSortPreference: (preference: Partial<SortPreference>) =>
      set((state) => ({
        sortPreference: {
          ...state.sortPreference,
          ...preference,
        },
      })),
  },
}));

export const useTreeUI = (): TreeUIStoreState =>
  useTreeUIStore(
    useShallow((s) => ({
      renamingNodeId: s.renamingNodeId,
      selectedNodeId: s.selectedNodeId,
      selectedFileId: s.selectedFileId,
      selectedFileTitle: s.selectedFileTitle,
      selectedNode: s.selectedNode,
      sortPreference: s.sortPreference,
    })),
  );

export const useTreeUIActions = (): TreeUIActions =>
  useTreeUIStore((s) => s.actions);
