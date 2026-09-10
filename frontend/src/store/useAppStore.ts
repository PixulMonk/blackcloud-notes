// store/useAppStore.ts
import { create } from "zustand";
import type { AppState, AppStateActions, SettingsTab } from "@/types/app.types";

const useAppStore = create<AppState>((set) => ({
  activeView: { type: "empty" },
  isSettingsOpen: false,
  settingsTab: "account",
  actions: {
    setActiveView: (view) => set({ activeView: view }),
    openSettings: (tab: SettingsTab = "account") =>
      set({ isSettingsOpen: true, settingsTab: tab }),
    closeSettings: () => set({ isSettingsOpen: false }),
    setSettingsTab: (tab: SettingsTab) => set({ settingsTab: tab }),
  },
}));

export const useActiveView = () => useAppStore((s) => s.activeView);
export const useIsSettingsOpen = () => useAppStore((s) => s.isSettingsOpen);
export const useSettingsTab = () => useAppStore((s) => s.settingsTab);
export const useAppStoreActions = (): AppStateActions =>
  useAppStore((s) => s.actions);
