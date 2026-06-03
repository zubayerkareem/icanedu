import { useCallback, useEffect, useRef, useState } from "react";

export function useCountdown(initialSeconds: number) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const onEndRef     = useRef<(() => void) | undefined>(undefined);
  const endTimeRef   = useRef<number>(0);
  const remainingRef = useRef(initialSeconds);
  const runningRef   = useRef(false); // mirrors isRunning without stale closure

  useEffect(() => { remainingRef.current = remaining; }, [remaining]);

  // Compute and apply the current remaining — called by interval and by visibility
  const applyTick = useCallback(() => {
    if (!runningRef.current) return;
    const left = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
    setRemaining(left);
    remainingRef.current = left;
    if (left <= 0) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      runningRef.current = false;
      setIsRunning(false);
      if (onEndRef.current) setTimeout(() => onEndRef.current?.(), 0);
    }
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    runningRef.current = false;
  }, []);

  const start = useCallback((onEnd?: () => void) => {
    if (onEnd !== undefined) onEndRef.current = onEnd;
    if (intervalRef.current !== null) return;
    if (remainingRef.current <= 0) return;

    endTimeRef.current = Date.now() + remainingRef.current * 1000;
    runningRef.current = true;
    setIsRunning(true);
    intervalRef.current = setInterval(applyTick, 250);
  }, [applyTick]);

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

  // Force-recalculate the instant the tab becomes visible again
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) applyTick();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [applyTick]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return { remaining, isRunning, start, pause, reset };
}
