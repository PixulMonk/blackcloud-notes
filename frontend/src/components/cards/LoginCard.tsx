import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import {
  Eye,
  EyeOff,
  AlertCircleIcon,
  CheckCircle2Icon,
  Loader,
} from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { useAuth, useAuthActions } from '@/store/useAuthStore';
import { deriveKeysForLogin } from '@/lib/crypto/kdf';
import { fromBase64 } from '@/lib/crypto/crypto-utils';
import { decryptAESGCMBytes } from '@/lib/crypto/aes';
import { useVaultActions } from '@/store/useVaultStore';

export default function LoginCard() {
  const location = useLocation();
  const navigate = useNavigate();

  const successMessage = location.state?.message;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { error, isLoading } = useAuth();
  const { login, getLoginMetadata } = useAuthActions();
  const { setKeys, clearKeys } = useVaultActions();

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const loginMetaData = await getLoginMetadata(email);
      if (!loginMetaData) {
        throw new Error('Failed to fetch login metadata from the database');
      }

      const { argon2Salt, protectedDEK, argon2Params } = loginMetaData;

      const { authToken, keyEncryptionKey } = await deriveKeysForLogin(
        password,
        fromBase64(argon2Salt),
        argon2Params,
      );

      const success = await login(email, authToken);

      if (success) {
        const dataEncryptionKey = await decryptAESGCMBytes(
          protectedDEK,
          keyEncryptionKey,
        );

        setKeys(keyEncryptionKey, dataEncryptionKey);
        navigate('/');
      }

      if (!success) {
        clearKeys();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('Unknown error:', error);
      }
    }
  };

  return (
    <div className="flex flex-col w-full items-center justify-center">
      <Card className="max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CardDescription>Sign in with your email</CardDescription>

          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6 max-w">
              <div className="grid gap-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  placeholder="Email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    variant="link"
                    asChild
                  >
                    <Link to="/forgot-password">Forgot your password?</Link>
                  </Button>
                  {/* <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a> */}
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    placeholder="Password"
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    required
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
                {/* Alerts */}
                <div>
                  {successMessage && (
                    <div>
                      <Alert>
                        <CheckCircle2Icon />
                        <AlertTitle>Password reset successful</AlertTitle>
                        <AlertDescription>{successMessage}</AlertDescription>
                      </Alert>
                    </div>
                  )}
                  {/* Your login form here */}
                </div>

                {error && (
                  <div>
                    <Alert variant="destructive">
                      <AlertCircleIcon />
                      <AlertTitle>Login failed</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
              <Button className="w-full" type="submit">
                {isLoading ? (
                  <Loader className="animate-spin mx-auto" size={24} />
                ) : (
                  'Sign in'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="flex flex-row items-center">
            <CardDescription>Don't have an account?</CardDescription>
            <Button variant="link" asChild>
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
