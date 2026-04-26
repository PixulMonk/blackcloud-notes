import { cn } from '@/lib/utils';

interface PasswordStrengthBarProps {
  password: string;
}

const PasswordStrengthBar = ({ password }: PasswordStrengthBarProps) => {
  const getStrength = (password: string): number => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
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
    <div>
      {' '}
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
            colors[Math.max(strength - 1, 0)].replace('bg-', 'text-'),
          )}
        >
          {labels[Math.max(strength - 1, 0)]}
        </p>
      )}
    </div>
  );
};

export default PasswordStrengthBar;
