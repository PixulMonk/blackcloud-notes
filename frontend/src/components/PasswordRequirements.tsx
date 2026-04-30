import { cn } from '@/lib/utils';
import { passwordRequirements } from '@/utils/passwordRules';

interface PasswordRequirementsProps {
  password: string;
}

const PasswordRequirements = ({ password }: PasswordRequirementsProps) => {
  return (
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
  );
};

export default PasswordRequirements;
