import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

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

import { useAuthStore } from '@/store/useAuthStore';
import keyDerivationFunction from '@/lib/crypto/kdf';
import { decryptAESGCM } from '@/lib/crypto/aes';
import { toBase64 } from '@/lib/crypto/crypto-utils';
import { useVaultStore } from '@/store/useVaultStore';

export default function LoginCard() {
  const location = useLocation();
  const navigate = useNavigate();

  const successMessage = location.state?.message;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, getLoginMetadata, error, isLoading } = useAuthStore();
  const { setKeys, clearKeys } = useVaultStore();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const loginMetaData = await getLoginMetadata(email);
      if (!loginMetaData) {
        throw new Error('Failed to fetch login metadata from the database');
      }

      const { argon2Salt, protectedDEK, argon2Params } = loginMetaData;

      const { authToken, keyEncryptionKey } = await keyDerivationFunction(
        password,
        argon2Salt,
      );

      const authTokenBase64 = toBase64(authToken);

      const success = await login(email, authTokenBase64);

      if (success) {
        const dataEncryptionKey = await decryptAESGCM(
          protectedDEK.ciphertext,
          protectedDEK.authTag,
          keyEncryptionKey,
          protectedDEK.iv,
        );

        setKeys(keyEncryptionKey, dataEncryptionKey);
        navigate('/');
      }

      if (!success) {
        clearKeys;
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
          <Button className="w-full" variant="outline">
            <FcGoogle className="h-4 w-4 mr-2" />
            Sign in with Google
          </Button>

          <div className="flex items-center gap-4">
            <hr className="flex-grow border-gray-300" />
            <span className="text-xs text-gray-500 uppercase">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

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
