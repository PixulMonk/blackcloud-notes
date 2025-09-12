import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { useEffect } from 'react';
import { useThemeStore } from './store/useThemeStore';
import { updateFavicon } from './lib/utils';
import VerifyEmailPage from './pages/VerifyEmailPage';
import { useAuthStore } from './store/useAuthStore';
import { Loader } from 'lucide-react';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { useConfirmDialogue } from './hooks/useConfirmDialogue';

function App() {
  const { isCheckingAuth, checkAuth, isAuthenticated, user } = useAuthStore();
  const { DialogueBox } = useConfirmDialogue();
  const isDark = useThemeStore((state) => state.isDark);
  const location = useLocation();
  const hideSidebar =
    [
      '/login',
      '/signup',
      '/verify-email',
      '/forgot-password',
      '/reset-password/:token',
    ].includes(location.pathname) ||
    location.pathname.startsWith('/reset-password/');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    checkAuth();
  }, []);
  console.log('isAuthenticated', isAuthenticated);
  console.log('user', user);

  useEffect(() => {
    updateFavicon(isDark);
  }, [isDark]);

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      {!hideSidebar && <AppSidebar />}
      <main className="flex-1 h-screen">
        {!hideSidebar && <SidebarTrigger />}
        {/* TODO: Nagivate home page and settings page to login if not authenticated */}
        <Routes>
          <Route
            path="/"
            element={
              user && isAuthenticated && user.isVerified ? (
                <HomePage />
              ) : user && isAuthenticated && !user.isVerified ? (
                <Navigate to="/verify-email" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/signup"
            element={
              !user && !isAuthenticated ? <SignupPage /> : <Navigate to="/" />
            }
          />
          <Route
            path="/login"
            element={
              !user && !isAuthenticated ? <LoginPage /> : <Navigate to="/" />
            }
          />
          <Route
            path="/settings"
            element={
              user && isAuthenticated ? (
                <SettingsPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/verify-email"
            element={
              user && !user.isVerified ? (
                <VerifyEmailPage />
              ) : (
                <Navigate to={user ? '/' : '/login'} />
              )
            }
          />
          <Route
            path="/forgot-password"
            element={
              isAuthenticated ? <Navigate to="/" /> : <ForgotPasswordPage />
            }
          />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
        </Routes>
        {DialogueBox}
      </main>
    </SidebarProvider>
  );
}

export default App;
