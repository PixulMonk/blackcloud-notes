import type { ThemeMode } from "@/types/theme.types";

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  isDark: boolean;
}

// Change ThemeMode as you add new themes

export const THEMES = [
  // Default Pair
  { id: "light", name: "Default Light", isDark: false },
  { id: "dark", name: "Default Dark", isDark: true },

  // Nordic Pair
  { id: "theme-nord-light", name: "Nordic Day", isDark: false },
  { id: "theme-nord", name: "Nordic Frost", isDark: true },

  // Violet / Amethyst Pair
  { id: "theme-violet-light", name: "Amethyst Frost", isDark: false },
  { id: "theme-violet", name: "Midnight Violet", isDark: true },

  // Standalone / Special Themes
  { id: "theme-rose", name: "Cosy Rose", isDark: false },
  { id: "theme-cyberpunk", name: "Cyberpunk Terminal", isDark: true },
] as const;

// Helper to quickly check if any given theme string is a dark variant
export const isThemeDark = (theme: ThemeMode): boolean => {
  const found = THEMES.find((t) => t.id === theme);
  return found ? found.isDark : false;
};
