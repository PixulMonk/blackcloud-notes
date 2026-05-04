import { useState, useEffect, useRef } from 'react';

const useCountdown = () => {
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isReady = displaySeconds === 0;

  const startCountdown = (countFromSeconds: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setDisplaySeconds(countFromSeconds);

    intervalRef.current = setInterval(() => {
      setDisplaySeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
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

  return { displaySeconds, startCountdown, isReady, resetCountdown };
};

export default useCountdown;
