// UnlockVaultCard.tsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { Eye, EyeOff, AlertCircleIcon, Loader, LockIcon } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { useAuthStore } from '@/store/useAuthStore';
import { useVaultStore } from '@/store/useVaultStore';
import keyDerivationFunction from '@/lib/crypto/kdf';
import { decryptAESGCM } from '@/lib/crypto/aes';

export default function UnlockVaultCard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { user, getLoginMetadata } = useAuthStore();
  const { setKeys, clearKeys } = useVaultStore();

  // redirect back to where they came from, or home
  const from = location.state?.from ?? '/';

  const handleUnlock = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!user?.email) {
        throw new Error('No active session found. Please log in again.');
      }

      // fetch salt + protectedDEK — same as login but no auth step
      const loginMetaData = await getLoginMetadata(user.email);
      if (!loginMetaData) {
        throw new Error('Failed to fetch vault metadata.');
      }

      const { argon2Salt, protectedDEK } = loginMetaData;

      // re-derive KEK from password + salt
      const { keyEncryptionKey } = await keyDerivationFunction(
        password,
        argon2Salt,
      );

      // decrypt protectedDEK to get DEK back in memory
      const dataEncryptionKey = await decryptAESGCM(
        protectedDEK.ciphertext,
        protectedDEK.authTag,
        keyEncryptionKey,
        protectedDEK.iv,
      );

      setKeys(keyEncryptionKey, dataEncryptionKey);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      clearKeys();
      if (err instanceof Error) {
        setError('Incorrect password. Please try again.');
        console.error('Vault unlock error:', err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full items-center justify-center">
      <Card className="max-w-sm w-full">
        <CardHeader className="items-center">
          <LockIcon className="h-8 w-8 mb-2 text-muted-foreground mx-auto" />
          <CardTitle className="text-2xl text-center">Vault locked</CardTitle>
          <CardDescription className="text-center">
            Enter your password to unlock your vault
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {user?.email && (
            <p className="text-sm text-center text-muted-foreground">
              {user.email}
            </p>
          )}
          <form onSubmit={handleUnlock}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Unlock failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader className="animate-spin mx-auto" size={24} />
                ) : (
                  'Unlock vault'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
