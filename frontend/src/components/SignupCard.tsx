import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

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

import { Eye, EyeOff, AlertCircleIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SignupCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    title: '',
    message: '',
  });

  useEffect(() => {
    if (errorMessage.message) {
      const timer = setTimeout(
        () => setErrorMessage({ title: '', message: '' }),
        5000
      );
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // TODO: login functionality = API call to backend
  // TODO: password strength indicator

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

          <form>
            <div className="flex flex-col gap-6 max-w">
              <div className="grid gap-y-2">
                <Label htmlFor="name">Email</Label>
                <Input type="text" id="name" placeholder="Name" required />
              </div>
              <div className="grid gap-y-2">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" placeholder="Email" required />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Password"
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
                <div className="flex items-center gap-3 mt-3">
                  <Checkbox id="terms" />
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
            </div>
          </form>
          <Button className="w-full">Sign up</Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="flex flex-row items-center">
            <CardDescription>Already have an account?</CardDescription>
            <Button variant="link" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
          <div>
            {(errorMessage.title || errorMessage.message) && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                {errorMessage.title && (
                  <AlertTitle>{errorMessage.title}</AlertTitle>
                )}
                {errorMessage.message && (
                  <AlertDescription>
                    <p>{errorMessage.message}</p>
                  </AlertDescription>
                )}
              </Alert>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
