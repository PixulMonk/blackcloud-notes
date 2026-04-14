import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Eye, EyeOff, AlertCircleIcon, Loader } from 'lucide-react';

import { initializeUserVault } from '@/lib/crypto/vault';
import { deriveKeysForNewUser } from '@/lib/crypto/kdf';

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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PasswordStrengthBar from './PasswordStrengthBar';

import { useAuth, useAuthActions } from '@/store/useAuthStore';
import PasswordRequirements from './PasswordRequirements';
import { arePasswordRequirementsMet } from '@/utils/passwordRules';

export default function SignupCard() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);

  const { error, isLoading } = useAuth();
  const { signup, setError } = useAuthActions();

  const navigate = useNavigate();

  const handleSignUp = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!arePasswordRequirementsMet(password)) {
      setError('Password does not meet requirements.');
      return;
    }
    if (!hasAgreedToTerms) {
      setError(
        'Please agree to the Terms of Service and Conditions before signing up.',
      );
      return;
    }

    try {
      // Derive keys
      const { argon2Salt, keyEncryptionKey, authToken, argon2Params } =
        await deriveKeysForNewUser(password);

      if (!argon2Salt || !keyEncryptionKey || !authToken || !argon2Params) {
        throw new Error('Key derivation failed: missing required values.');
      }

      const { protectedDEK } = await initializeUserVault(keyEncryptionKey);

      if (!protectedDEK) {
        throw new Error('Vault initialization failed.');
      }

      const success = await signup(
        name,
        email,
        authToken,
        protectedDEK,
        argon2Salt,
        argon2Params,
      );
      if (success) {
        navigate('/verify-email');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
        setError(error.message);
      } else {
        console.error('Unknown error:', error);
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="flex flex-col w-full items-center justify-center">
      <Card className="max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CardDescription>Use your email for registration</CardDescription>

          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6 max-w">
              <div className="grid gap-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  placeholder="Name"
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  required
                />
              </div>
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
                </div>
                <div className="relative">
                  <div className="flex items-center">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      placeholder="Password"
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <PasswordStrengthBar password={password} />
                  <PasswordRequirements password={password} />
                </div>
                {/* Alerts */}
                {error && (
                  <div>
                    <Alert variant="destructive">
                      <AlertCircleIcon />
                      <AlertTitle>Signup failed</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <Checkbox
                    id="terms"
                    checked={hasAgreedToTerms}
                    onCheckedChange={(checked) =>
                      setHasAgreedToTerms(checked === true)
                    }
                  />
                  <p className="text-muted-foreground text-xs text-center">
                    I agree to the{' '}
                    <Link
                      to="#"
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      to="#"
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Conditions
                    </Link>
                  </p>
                </div>
              </div>
              <Button className="w-full" disabled={isLoading} type="submit">
                {isLoading ? (
                  <Loader className="animate-spin mx-auto" size={24} />
                ) : (
                  'Sign up'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="flex flex-row items-center">
            <CardDescription>Already have an account?</CardDescription>
            <Button variant="link" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
