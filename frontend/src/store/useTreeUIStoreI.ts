import { create } from 'zustand';

interface TreeUIState {
  renamingNodeId: string | null;
  selectedNodeId: string | null;

  setRenamingNodeId: (id: string | null) => void;
  setSelectedNodeId: (id: string | null) => void;
}

export const useTreeUIStore = create<TreeUIState>((set) => ({
  renamingNodeId: null,
  selectedNodeId: null,

  setRenamingNodeId: (id) => {
    set({ renamingNodeId: id });
  },

  setSelectedNodeId: (id) => {
    set({ selectedNodeId: id });
    console.log(id);
  },
}));
