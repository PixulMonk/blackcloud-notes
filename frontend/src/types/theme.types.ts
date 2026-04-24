export interface ThemeActions {
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

export interface ThemeState {
  isDark: boolean;
  actions: ThemeActions;
}
