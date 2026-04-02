import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

import { Eye, EyeOff, AlertCircleIcon, Loader } from 'lucide-react';

import { cn } from '@/lib/utils';
import { initializeUserVault } from '@/lib/crypto/vault';
import keyDerivationFunction from '@/lib/crypto/kdf';

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

import { useAuthStore } from '@/store/useAuthStore';

export default function SignupCard() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);

  const navigate = useNavigate();

  const { signup, error, setError, isLoading } = useAuthStore();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
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
        await keyDerivationFunction(password);

      if (!argon2Salt || !keyEncryptionKey || !authToken || !argon2Params) {
        throw new Error('Key derivation failed: missing required values.');
      }

      if (!(argon2Salt instanceof Uint8Array)) {
        throw new Error('Invalid salt format');
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

  // TODO: extract strength indicator to a new component
  // PASSWORD REQUIREMENTS AND STRENGTH INDICATOR
  const arePasswordRequirementsMet = (password: string): boolean => {
    return passwordRequirements.every((req) => req.test(password));
  };

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    {
      label: 'At least 1 uppercase letter',
      test: (pwd: string) => /[A-Z]/.test(pwd),
    },
    { label: 'At least 1 number', test: (pwd: string) => /\d/.test(pwd) },
    {
      label: 'At least 1 special character',
      test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd),
    },
  ];

  // TODO: move to utils?
  const getStrength = (pwd: string): number => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0 to 4
  };

  const strength: number = getStrength(password);
  const colors = [
    'bg-red-500', // Too Weak
    'bg-yellow-500', // Weak
    'bg-lime-400', // Strong
    'bg-green-600', // Very Strong
  ];
  const labels = ['Too Weak', 'Weak', 'Strong', 'Very Strong'];

  return (
    <div className="flex flex-col w-full items-center justify-center">
      <Card className="max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button className="w-full" variant="outline">
            <FcGoogle className="h-4 w-4 mr-2" />
            Sign up with Google
          </Button>

          <div className="flex items-center gap-4">
            <hr className="flex-grow border-gray-300" />
            <span className="text-xs text-gray-500 uppercase">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

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
                  {/* Strength bar */}
                  {password && (
                    <div className="flex gap-1 mt-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-1 flex-1 rounded transition-colors',
                            i < strength
                              ? colors[Math.max(strength - 1, 0)]
                              : 'bg-gray-200',
                          )}
                        />
                      ))}
                    </div>
                  )}
                  {password && strength > 0 && (
                    <p
                      className={cn(
                        'text-sm mt-1',
                        colors[Math.max(strength - 1, 0)].replace(
                          'bg-',
                          'text-',
                        ),
                      )}
                    >
                      {labels[Math.max(strength - 1, 0)]}
                    </p>
                  )}
                  {/* Password Requirements */}
                  <div className="mt-2 space-y-1 text-xs">
                    {passwordRequirements.map((req, idx) => {
                      const valid = req.test(password);
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full transition-colors',
                              valid ? 'bg-green-500' : 'bg-gray-300',
                            )}
                          />
                          <span
                            className={cn(
                              'transition-colors',
                              valid ? 'text-green-600' : 'text-gray-500',
                            )}
                          >
                            {req.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
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
