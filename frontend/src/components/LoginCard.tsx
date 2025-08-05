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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { Eye, EyeOff, AlertCircleIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LoginCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    title: '',
    message: '',
  });

  // TODO: login functionality = API call to backend

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

          <form>
            <div className="flex flex-col gap-6 max-w">
              <div className="grid gap-y-2">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" placeholder="Email" required />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
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
                {/* Alerts */}
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
              </div>
            </div>
          </form>
          <Button className="w-full">Sign in</Button>
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
