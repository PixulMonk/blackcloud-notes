import { create } from 'zustand';
import { updateFavicon } from '@/lib/utils';

import type { ThemeActions, ThemeState } from '@/types/theme.types';

const useThemeStore = create<ThemeState>((set) => ({
  isDark:
    localStorage.getItem('theme') === 'dark' ||
    localStorage.getItem('theme') === null,
  actions: {
    toggleTheme: () =>
      set((state) => {
        const newTheme: boolean = !state.isDark;
        document.documentElement.classList.toggle('dark', newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        updateFavicon(newTheme);
        return { isDark: newTheme };
      }),

    setTheme: (dark) => {
      document.documentElement.classList.toggle('dark', dark);
      localStorage.setItem('theme', dark ? 'dark' : 'light');
      updateFavicon(dark);
      set({ isDark: dark });
    },
  },
}));

export const useIsDark = () => useThemeStore((s) => s.isDark);
export const useThemeStoreActions = (): ThemeActions =>
  useThemeStore((s) => s.actions);
