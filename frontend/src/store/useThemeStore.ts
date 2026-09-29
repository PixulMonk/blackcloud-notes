import { create } from "zustand";
import { persist } from "zustand/middleware";

import { updateFavicon } from "@/lib/utils";
import { THEMES, isThemeDark } from "@/config/theme";
import type { ThemeMode } from "@/types/theme.types";
import { subscribeToUserId } from "./useAuthStore";

const ALL_THEME_CLASSES = THEMES.map((t) => t.id).filter(
  (id) => id !== "light",
);

const DEFAULT_THEME: ThemeMode = "dark";
const GUEST_KEY = "guest"; // theme used while logged out (e.g. login page)

interface ThemeState {
  themesByUser: Record<string, ThemeMode>;
  currentUserId: string | null;
  setTheme: (theme: ThemeMode) => void;
  applyThemeForUser: (userId: string | null) => void;
}

const applyThemeToDOM = (theme: ThemeMode) => {
  const root = document.documentElement;
  root.classList.remove(...ALL_THEME_CLASSES);
  if (theme !== "light") {
    root.classList.add(theme);
  }
  updateFavicon(isThemeDark(theme));
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themesByUser: {},
      currentUserId: null,

      setTheme: (theme) => {
        const key = get().currentUserId ?? GUEST_KEY;
        applyThemeToDOM(theme);
        set((state) => ({
          themesByUser: { ...state.themesByUser, [key]: theme },
        }));
      },

      applyThemeForUser: (userId) => {
        const key = userId ?? GUEST_KEY;
        const theme = get().themesByUser[key] ?? DEFAULT_THEME;
        applyThemeToDOM(theme);
        set({ currentUserId: userId });
      },
    }),
    {
      name: "blackcloud-theme",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Best guess before auth resolves: whichever user/guest slot was
        // active last session. subscribeToUserId corrects this once
        // checkAuth resolves, if it turns out to be a different account.
        const key = state.currentUserId ?? GUEST_KEY;
        applyThemeToDOM(state.themesByUser[key] ?? DEFAULT_THEME);
      },
    },
  ),
);

// Re-apply the correct theme slot whenever the logged-in user changes —
// login, logout, or switching accounts.
subscribeToUserId((userId) => {
  useThemeStore.getState().applyThemeForUser(userId);
});

export const useTheme = () =>
  useThemeStore(
    (s) => s.themesByUser[s.currentUserId ?? GUEST_KEY] ?? DEFAULT_THEME,
  );
export const useIsDarkVariant = () =>
  useThemeStore((s) =>
    isThemeDark(s.themesByUser[s.currentUserId ?? GUEST_KEY] ?? DEFAULT_THEME),
  );
export const useSetTheme = () => useThemeStore((s) => s.setTheme);
