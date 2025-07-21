import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import { useState, useEffect } from 'react';
import { useThemeStore } from './store/useThemeStore';
import { updateFavicon } from './lib/utils';

function App() {
  const isDark = useThemeStore((state) => state.isDark);
  const location = useLocation();
  const hideSidebar = ['/login', '/signup'].includes(location.pathname);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    updateFavicon(isDark);
  }, [isDark]);

  return (
    <SidebarProvider>
      {!hideSidebar && <AppSidebar />}
      <main className="flex-1 h-screen">
        {!hideSidebar && <SidebarTrigger />}
        {/* TODO: Nagivate home page and settings page to login if not authenticated */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </SidebarProvider>
  );
}

export default App;
