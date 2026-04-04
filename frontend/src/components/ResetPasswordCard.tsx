import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Eye, EyeOff, AlertCircleIcon, Loader } from 'lucide-react';

import { useAuthStore } from '@/store/useAuthStore';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { confirm } from './ConfirmDialogue';

import keyDerivationFunction from '@/lib/crypto/kdf';
import { encryptAESGCM } from '@/lib/crypto/aes';
import { toBase64 } from './../lib/crypto/crypto-utils';

function ResetPasswordCard() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { resetPassword, error, setError, isLoading } = useAuthStore();

  const { token } = useParams();

  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok = await confirm({
      title: '⚠️ WARNING: DATA WILL BE LOST',
      message: `Resetting your password will permanently delete all your encrypted notes.
      This action cannot be undone.
      Only proceed if you understand that your data will be lost.`,
      noText: 'Cancel',
    });
    if (ok) await handleChangePassword();
  };

  const handleChangePassword = async () => {
    if (!token) {
      setError('Invalid or expired reset link');
      return;
    }

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
      // Step 1 - generate newArgon2Salt, derive newAuthToken and newKeyEncryptionKey from password
      const {
        argon2Salt: newArgon2Salt,
        keyEncryptionKey: newKeyEncryptionKey,
        authToken: newAuthToken,
        argon2Params,
      } = await keyDerivationFunction(password);

      // Step 2 - generate newIV
      const newIV = window.crypto.getRandomValues(new Uint8Array(12)); //96-bits

      // Step 3 - Since user is not logged in, generate new DEK
      const dataEncryptionKey = crypto.getRandomValues(new Uint8Array(32));
      if (!dataEncryptionKey) {
        throw new Error('Failed to generate new data encryption key');
      }

      const { ciphertext, authTag: newAuthTag } = await encryptAESGCM(
        dataEncryptionKey,
        newKeyEncryptionKey,
        newIV,
      );

      // Step 4 - prepare new DEK payload
      const newProtectedDEK = {
        ciphertext: toBase64(ciphertext),
        iv: toBase64(newIV),
        authTag: toBase64(newAuthTag),
      };

      // Step 5 - send to database (make API call)
      const success = await resetPassword(
        token,
        toBase64(newAuthToken),
        newProtectedDEK,
        toBase64(newArgon2Salt),
        argon2Params,
      );
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
          <CardDescription>
            <CardDescription>
              Enter a new password to regain access to your account.
            </CardDescription>
          </CardDescription>
          <form onSubmit={handleSubmit}>
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
              </div>
              {/* Alerts */}
              <Alert variant="destructive" className="bg-destructive/10">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>Data Loss Warning</AlertTitle>
                <AlertDescription>
                  Because your data is end-to-end encrypted, resetting your
                  password will permanently delete all existing notes. This
                  cannot be undone.
                </AlertDescription>
              </Alert>
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
