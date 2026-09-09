export type AppView =
  | { type: "empty" }
  | { type: "editor" }
  | { type: "trash" }
  | { type: "archived" };
// Add new types along with renderView function at HomePage.tsx

export type SettingsTab = "account" | "security" | "vault" | "appearance";

export interface AppState {
  activeView: AppView;
  isSettingsOpen: boolean;
  settingsTab: SettingsTab;
  actions: AppStateActions;
}

export interface AppStateActions {
  setActiveView: (view: AppView) => void;
  openSettings: (tab: SettingsTab) => void;
  closeSettings: () => void;
  setSettingsTab: (tab: SettingsTab) => void;
}
