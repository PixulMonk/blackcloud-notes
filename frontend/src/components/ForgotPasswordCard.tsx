import { useState } from 'react';
import { Link } from 'react-router-dom';

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
import { useAuth, useAuthActions } from '@/store/useAuthStore';
import { AlertCircleIcon, Loader, ChevronLeft } from 'lucide-react';

function ForgotPasswordCard() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { error, isLoading } = useAuth();
  const { forgotPassword, setError } = useAuthActions();

  const sendRecoveryEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      setError('Email field cannot be empty.');
      return;
    }

    try {
      const success = await forgotPassword(email);

      if (success) {
        setIsSubmitted(true);
        // Change message
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
          <CardTitle className="text-2xl text-center">
            Forgot password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CardDescription>
            {isSubmitted
              ? `If an account exists for ${email}, you will receive a password reset link shortly.`
              : "Enter your email address and we'll send you a link to reset your password."}
          </CardDescription>
          {!isSubmitted && (
            <form onSubmit={sendRecoveryEmail}>
              <div className="flex flex-col gap-6 max-w">
                <Input
                  type="email"
                  id="email"
                  value={email}
                  placeholder="Email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
                {/* Alerts */}
                <div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircleIcon />
                      <AlertTitle>Cannot send password reset email</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <Button className="w-full" type="submit">
                  {isLoading ? (
                    <Loader className="animate-spin mx-auto" size={24} />
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="flex flex-row items-center">
            <Button variant="link" asChild>
              <Link to="/login">
                <ChevronLeft />
                Back to login
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ForgotPasswordCard;
