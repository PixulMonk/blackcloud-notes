import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';

import { useAuth, useAuthActions } from '@/store/useAuthStore';
import useCountdown from '@/hooks/useCountdown';

function VerifyEmailCard() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const navigate = useNavigate();
  const { displayTime, startCountdown, isReady } = useCountdown();

  const { user, error, isLoading } = useAuth();
  const { verifyEmail, resendVerificationEmail, setError } = useAuthActions();

  const handleVerificationResend = async () => {
    if (!user) return;

    if (user.isVerified) {
      setError('Account already verified');
      return;
    }

    const { success, retryAfter } = await resendVerificationEmail(user.email);

    if (retryAfter !== undefined) {
      startCountdown(retryAfter);
    }
  };

  const handleChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value.slice(-1); // only keep last char
    setCode(newCode);

    // Move focus to next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('Text').slice(0, 6);
    const newCode = [...code];

    for (let i = 0; i < pasteData.length; i++) {
      if (index + i < 6) {
        newCode[index + i] = pasteData[i];
      }
    }

    setCode(newCode);

    // Focus next empty field
    const nextEmpty = newCode.findIndex((digit) => digit === '');
    if (nextEmpty !== -1) {
      inputRefs.current[nextEmpty]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const verificationCode = code.join('');
    console.log('Submitted code:', verificationCode);

    try {
      const success = await verifyEmail(verificationCode);
      if (success) {
        navigate('/');
        console.log('Email verified successfully');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('Unknown error:', error);
      }
    }
  };

  // Auto submit when all fields are filled
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (code.every((digit) => digit !== '')) {
      setIsButtonDisabled(false);
      formRef.current?.requestSubmit();
    }
  }, [code]);

  return (
    <div className="flex flex-col w-full items-center justify-center">
      <Card className="max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Verify your email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CardDescription>
            Enter the 6-digit code sent to your email address.
          </CardDescription>
          <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el!;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-12 text-center text-lg"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={(e) => handlePaste(e, index)}
                />
              ))}
            </div>
            {/* Alerts */}
            {error && (
              <div>
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Email verification failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
            <Button
              disabled={isLoading || isButtonDisabled}
              className="w-full"
              type="submit"
            >
              Verify Email
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="flex flex-row items-center">
            <CardDescription>Did not get an email?</CardDescription>
            <Button
              variant="link"
              disabled={isLoading || !isReady}
              onClick={handleVerificationResend}
            >
              {isReady ? 'Resend' : `Resend in ${displayTime}`}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default VerifyEmailCard;
