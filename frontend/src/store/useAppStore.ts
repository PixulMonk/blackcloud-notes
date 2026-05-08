import { create } from 'zustand';
import type { AppState, AppStateActions, AppView } from '@/types/app.types';

const useAppStore = create<AppState>((set) => ({
  activeView: null,
  actions: {
    setActiveView: (view) => set({ activeView: view }),
  },
}));

export const useActiveView = () => useAppStore((s) => s.activeView);
export const useAppStoreActions = (): AppStateActions =>
  useAppStore((s) => s.actions);
