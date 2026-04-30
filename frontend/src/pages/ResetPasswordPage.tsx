import ResetPasswordCard from '@/components/ResetPasswordCard';
import { useIsDark } from '@/store/useThemeStore';

function ResetPasswordPage() {
  const isDark = useIsDark();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <img
        src={
          isDark ? '/logo/logo-vertical-dark.svg' : '/logo/logo-vertical.svg'
        }
        alt="BlackCloud Logo"
        className="h-32 sm:h-36 md:h-40 lg:h-42 w-auto mb-5"
      />
      <ResetPasswordCard />
    </div>
  );
}

export default ResetPasswordPage;
