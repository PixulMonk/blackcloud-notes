import { useState, useEffect, useRef } from 'react';

const useCountdown = () => {
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isReady = displaySeconds === 0;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;

    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const displayTime = formatTime(displaySeconds);

  useEffect(() => {
    const expiry = localStorage.getItem('resendCooldown');

    if (!expiry) return;

    const remaining = Math.ceil((Number(expiry) - Date.now()) / 1000);

    if (remaining > 0) {
      startCountdown(remaining);
    } else {
      localStorage.removeItem('resendCooldown');
    }
  }, []);

  const startCountdown = (countFromSeconds: number) => {
    const expiry = Date.now() + countFromSeconds * 1000;
    localStorage.setItem('resendCooldown', expiry.toString());

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setDisplaySeconds(countFromSeconds);

    intervalRef.current = setInterval(() => {
      setDisplaySeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setDisplaySeconds(0);
    intervalRef.current = null;
  };

  return {
    displaySeconds,
    displayTime,
    startCountdown,
    isReady,
    resetCountdown,
  };
};

export default useCountdown;
