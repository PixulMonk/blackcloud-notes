import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { useEffect } from 'react';
import { useIsDark } from './store/useThemeStore';
import { updateFavicon } from './lib/utils';
import VerifyEmailPage from './pages/VerifyEmailPage';
import { useAuth, useAuthActions } from './store/useAuthStore';
import { Loader } from 'lucide-react';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UnlockVaultPage from './pages/UnlockVaultPage';
import { useDataEncryptionKey } from './store/useVaultStore';
import Header from './components/Header';

function App() {
  const { user, isCheckingAuth, isAuthenticated } = useAuth();
  const { checkAuth } = useAuthActions();
  const dataEncryptionKey = useDataEncryptionKey();
  const isDark = useIsDark();
  const location = useLocation();

  const authRoutes = [
    '/login',
    '/signup',
    '/verify-email',
    '/forgot-password',
    '/unlock-vault',
  ];

  const hideSidebar =
    authRoutes.includes(location.pathname) ||
    location.pathname.startsWith('/reset-password/');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    checkAuth();
  }, []);

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

  // vault lock guard — authenticated but DEK is missing
  const vaultLocked =
    isAuthenticated && user?.isVerified && !dataEncryptionKey && !hideSidebar;

  if (vaultLocked) {
    return <UnlockVaultPage />;
  }

  return (
    <SidebarProvider>
      {!hideSidebar && <AppSidebar />}
      <main className="flex-1 h-screen">
        {!hideSidebar && <Header />}
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
          <Route
            path="/unlock-vault"
            element={
              isAuthenticated ? <UnlockVaultPage /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </main>
    </SidebarProvider>
  );
}

export default App;
