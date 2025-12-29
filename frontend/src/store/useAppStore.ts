import { create } from 'zustand';
// TODO: Uhh I think these dialogue states are a relict from an old dialog box implementation.
// These can PROBABLY BE DELETED although I am kinda too much of a pussy to do it
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
