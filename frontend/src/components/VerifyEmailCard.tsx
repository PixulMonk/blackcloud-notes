import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function VerifyEmailCard() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const navigate = useNavigate();
  const isLoading = false;

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
    index: number
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const verificationCode = code.join('');
    console.log('Submitted code:', verificationCode);
    // Navigate or call API here
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
            <Button disabled={isButtonDisabled} className="w-full">
              Verify Email
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default VerifyEmailCard;
