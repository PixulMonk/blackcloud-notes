import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/store/useAuthStore';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { Eye, EyeOff, AlertCircleIcon, Loader } from 'lucide-react';

// TODO: don't forget to warn user about data loss since password is tied to encryption key
function ResetPasswordCard() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);

  const { resetPassword, error, setError, isLoading } = useAuthStore();

  const { token } = useParams();
  const navigate = useNavigate();

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password != confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!arePasswordRequirementsMet(password)) {
      setError('Password does not meet requirements.');
      return;
    }

    try {
      const success = await resetPassword(token!, password);
      if (success) {
        navigate('/login', {
          state: {
            message:
              'Your password has been reset successfully. Please log in.',
          },
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('Unknown error:', error);
      }
    }
  };

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
          <CardTitle className="text-2xl text-center">Reset password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CardDescription>Please enter your new password</CardDescription>
          <form onSubmit={handleChangePassword}>
            <div className="flex flex-col gap-6 max-w">
              <div className="grid gap-y-2">
                <Label htmlFor="password">Password</Label>

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
                </div>
              </div>
              <div className="grid gap-y-2">
                <Label htmlFor="password">Confirm password</Label>
                <div className="relative">
                  <div className="flex items-center">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm-password"
                      value={confirmPassword}
                      placeholder="Confirm password"
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                      }}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? (
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
                              : 'bg-gray-200'
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
                          'text-'
                        )
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
                              valid ? 'bg-green-500' : 'bg-gray-300'
                            )}
                          />
                          <span
                            className={cn(
                              'transition-colors',
                              valid ? 'text-green-600' : 'text-gray-500'
                            )}
                          >
                            {req.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {/* Alerts */}
              {error && (
                <div>
                  <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Reset password failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </div>
              )}
              <Button className="w-full" disabled={isLoading} type="submit">
                {isLoading ? (
                  <Loader className="animate-spin mx-auto" size={24} />
                ) : (
                  'Change password'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResetPasswordCard;
