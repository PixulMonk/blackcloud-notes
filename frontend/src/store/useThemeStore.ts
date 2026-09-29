import { create } from "zustand";
import { persist } from "zustand/middleware";

import { updateFavicon } from "@/lib/utils";
import { THEMES, isThemeDark } from "@/config/theme";
import type { ThemeMode } from "@/types/theme.types";

const ALL_THEME_CLASSES = THEMES.map((t) => t.id).filter(
  (id) => id !== "light",
);

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark", // default fallback
      setTheme: (theme: ThemeMode) => {
        const root = document.documentElement;

        // Remove all previous theme classes dynamically
        root.classList.remove(...ALL_THEME_CLASSES);

        // Apply the new theme class (light default has no special class)
        if (theme !== "light") {
          root.classList.add(theme);
        }

        // Update favicon dynamically using the config helper
        const isDarkVariant = isThemeDark(theme);
        updateFavicon(isDarkVariant);

        set({ theme });
      },
    }),
    {
      name: "blackcloud-theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const root = document.documentElement;
          root.classList.remove(...ALL_THEME_CLASSES);
          if (state.theme !== "light") {
            root.classList.add(state.theme);
          }
        }
      },
    },
  ),
);

// Clean, direct selectors
export const useTheme = () => useThemeStore((s) => s.theme);
export const useIsDarkVariant = () =>
  useThemeStore((s) => isThemeDark(s.theme));
export const useSetTheme = () => useThemeStore((s) => s.setTheme);
