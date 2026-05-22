import { useCallback, useEffect, useRef, useState } from "react";

export function useCountdown(initialSeconds: number) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onEndRef = useRef<(() => void) | undefined>(undefined);
  const wasRunningRef = useRef(false);
  const remainingRef = useRef(initialSeconds);

  // Keep remainingRef in sync
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback((onEnd?: () => void) => {
    if (onEnd !== undefined) {
      onEndRef.current = onEnd;
    }
    if (intervalRef.current !== null) return;
    if (remainingRef.current <= 0) return;

    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsRunning(false);
          if (onEndRef.current) {
            // defer so state update settles first
            setTimeout(() => onEndRef.current?.(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const pause = useCallback(() => {
    stop();
    setIsRunning(false);
  }, [stop]);

  const reset = useCallback(
    (secs?: number) => {
      stop();
      setIsRunning(false);
      const newVal = secs !== undefined ? secs : initialSeconds;
      setRemaining(newVal);
      remainingRef.current = newVal;
      onEndRef.current = undefined;
    },
    [stop, initialSeconds]
  );

  // Page visibility: pause when hidden, resume when visible (only if was running)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasRunningRef.current = isRunning;
        if (isRunning) {
          stop();
          setIsRunning(false);
        }
      } else {
        if (wasRunningRef.current && remainingRef.current > 0) {
          // Resume without resetting onEnd callback
          intervalRef.current = setInterval(() => {
            setRemaining((prev) => {
              if (prev <= 1) {
                clearInterval(intervalRef.current!);
                intervalRef.current = null;
                setIsRunning(false);
                if (onEndRef.current) {
                  setTimeout(() => onEndRef.current?.(), 0);
                }
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          setIsRunning(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { remaining, isRunning, start, pause, reset };
}
