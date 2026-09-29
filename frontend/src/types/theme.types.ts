export type ThemeMode =
  | "light"
  | "dark"
  | "theme-violet"
  | "theme-nord"
  | "theme-nord-light"
  | "theme-violet-light"
  | "theme-rose"
  | "theme-cyberpunk";

export interface ThemeActions {
  setTheme: (theme: ThemeMode) => void;
}

export interface ThemeState {
  theme: ThemeMode;
  actions: ThemeActions;
}
