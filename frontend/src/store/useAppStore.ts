import { create } from 'zustand';
// TODO: opened document, current selection
interface AppStore {
  isDialogueBoxOpen: boolean;
  setIsDialogueBoxOpen: (open: boolean) => void;
  dialogueResolver: ((value: boolean) => void) | null;
  setDialogueResolver: (resolver: ((ok: boolean) => void) | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  isDialogueBoxOpen: false,
  dialogueResolver: null,

  setIsDialogueBoxOpen: (open) => set({ isDialogueBoxOpen: open }),
  setDialogueResolver: (resolver) => set({ dialogueResolver: resolver }),
}));
