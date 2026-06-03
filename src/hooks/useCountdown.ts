import { useCallback, useEffect, useRef, useState } from "react";

export function useCountdown(initialSeconds: number) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const onEndRef       = useRef<(() => void) | undefined>(undefined);
  const endTimeRef     = useRef<number>(0);          // absolute wall-clock deadline
  const remainingRef   = useRef(initialSeconds);     // kept in sync with state

  useEffect(() => { remainingRef.current = remaining; }, [remaining]);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const left = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
    setRemaining(left);
    remainingRef.current = left;
    if (left <= 0) {
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
      setIsRunning(false);
      if (onEndRef.current) setTimeout(() => onEndRef.current?.(), 0);
    }
  }, []);

  const start = useCallback((onEnd?: () => void) => {
    if (onEnd !== undefined) onEndRef.current = onEnd;
    if (intervalRef.current !== null) return;
    if (remainingRef.current <= 0) return;

    // Set absolute deadline based on current remaining
    endTimeRef.current = Date.now() + remainingRef.current * 1000;
    setIsRunning(true);
    intervalRef.current = setInterval(tick, 250);
  }, [tick]);

  const pause = useCallback(() => {
    stop();
    setIsRunning(false);
  }, [stop]);

  const reset = useCallback((secs?: number) => {
    stop();
    setIsRunning(false);
    const newVal = secs !== undefined ? secs : initialSeconds;
    setRemaining(newVal);
    remainingRef.current = newVal;
    onEndRef.current = undefined;
  }, [stop, initialSeconds]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return { remaining, isRunning, start, pause, reset };
}
