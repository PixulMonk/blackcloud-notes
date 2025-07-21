import { create } from 'zustand';
import { updateFavicon } from '@/lib/utils';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark:
    localStorage.getItem('theme') === 'dark' ||
    localStorage.getItem('theme') === null,

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
}));
