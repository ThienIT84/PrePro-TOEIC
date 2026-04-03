/**
 * useExamTimer Hook
 * Quản lý timer tối ưu với requestAnimationFrame
 * Tránh re-render component mỗi giây
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export type TimeMode = 'standard' | 'unlimited';

interface UseExamTimerOptions {
  initialTime: number; // seconds
  timeMode: TimeMode;
  onTimeUp?: () => void;
  isStarted?: boolean;
  isPaused?: boolean;
}

interface UseExamTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (newTime?: number) => void;
  setTime: (time: number) => void;
}

/**
 * Custom hook để quản lý exam timer
 * Sử dụng requestAnimationFrame để tối ưu performance
 */
export const useExamTimer = ({
  initialTime,
  timeMode,
  onTimeUp,
  isStarted = false,
  isPaused = false,
}: UseExamTimerOptions): UseExamTimerReturn => {
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  
  const rafIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const accumulatedTimeRef = useRef<number>(0);
  const onTimeUpRef = useRef(onTimeUp);

  // Update callback ref
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  /**
   * Timer loop với requestAnimationFrame
   * Chỉ update state mỗi giây thay vì mỗi frame
   */
  const timerLoop = useCallback(() => {
    const now = Date.now();
    const deltaTime = now - lastUpdateRef.current;
    
    // Accumulate time
    accumulatedTimeRef.current += deltaTime;
    lastUpdateRef.current = now;

    // Chỉ update state khi đủ 1 giây (1000ms)
    if (accumulatedTimeRef.current >= 1000) {
      const secondsElapsed = Math.floor(accumulatedTimeRef.current / 1000);
      accumulatedTimeRef.current = accumulatedTimeRef.current % 1000;
      
      setTimeLeft(prev => {
        const newTime = prev - secondsElapsed;
        
        // Time's up
        if (newTime <= 0) {
          setIsRunning(false);
          if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
          }
          
          // Call callback
          if (onTimeUpRef.current) {
            onTimeUpRef.current();
          }
          
          return 0;
        }
        
        return newTime;
      });
    }

    // Continue loop
    if (isRunning) {
      rafIdRef.current = requestAnimationFrame(timerLoop);
    }
  }, [isRunning]);

  /**
   * Start timer
   */
  const start = useCallback(() => {
    if (timeMode === 'unlimited') return;
    
    setIsRunning(true);
    lastUpdateRef.current = Date.now();
    accumulatedTimeRef.current = 0;
  }, [timeMode]);

  /**
   * Pause timer
   */
  const pause = useCallback(() => {
    setIsRunning(false);
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  /**
   * Resume timer
   */
  const resume = useCallback(() => {
    if (timeMode === 'unlimited') return;
    
    setIsRunning(true);
    lastUpdateRef.current = Date.now();
  }, [timeMode]);

  /**
   * Reset timer
   */
  const reset = useCallback((newTime?: number) => {
    pause();
    setTimeLeft(newTime ?? initialTime);
    accumulatedTimeRef.current = 0;
  }, [initialTime, pause]);

  /**
   * Set time manually
   */
  const setTime = useCallback((time: number) => {
    setTimeLeft(time);
  }, []);

  /**
   * Start/stop timer based on props
   */
  useEffect(() => {
    if (isStarted && !isPaused && timeMode === 'standard') {
      start();
    } else {
      pause();
    }
  }, [isStarted, isPaused, timeMode, start, pause]);

  /**
   * Timer loop effect
   */
  useEffect(() => {
    if (isRunning && timeMode === 'standard') {
      rafIdRef.current = requestAnimationFrame(timerLoop);
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isRunning, timeMode, timerLoop]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    timeLeft,
    isRunning,
    start,
    pause,
    resume,
    reset,
    setTime,
  };
};

/**
 * Format time helper
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 0) return '--:--';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};
