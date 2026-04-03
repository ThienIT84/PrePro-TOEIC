/**
 * useExamAutoSave Hook
 * Quản lý auto-save với debouncing và queue
 * Tối ưu để tránh lag UI khi lưu
 */

import { useEffect, useRef, useCallback } from 'react';
import { ExamSessionData, examSessionManager } from '@/services/ExamSessionManager';

interface UseExamAutoSaveOptions {
  sessionId: string | null;
  isActive: boolean;
  interval?: number; // milliseconds
  debounceDelay?: number; // milliseconds
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

interface UseExamAutoSaveReturn {
  triggerSave: () => Promise<void>;
  forceSave: () => Promise<void>;
  isAutoSaving: boolean;
  lastSaveTime: Date | null;
}

/**
 * Hook quản lý auto-save tối ưu
 */
export const useExamAutoSave = ({
  sessionId,
  isActive,
  interval = 30000, // 30 seconds
  debounceDelay = 2000, // 2 seconds
  onSaveSuccess,
  onSaveError,
}: UseExamAutoSaveOptions): UseExamAutoSaveReturn => {
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveQueueRef = useRef<boolean>(false);
  const isSavingRef = useRef<boolean>(false);
  const lastSaveTimeRef = useRef<Date | null>(null);
  
  const onSaveSuccessRef = useRef(onSaveSuccess);
  const onSaveErrorRef = useRef(onSaveError);

  // Update callback refs
  useEffect(() => {
    onSaveSuccessRef.current = onSaveSuccess;
    onSaveErrorRef.current = onSaveError;
  }, [onSaveSuccess, onSaveError]);

  /**
   * Thực hiện save
   */
  const performSave = useCallback(async () => {
    if (!sessionId || isSavingRef.current) {
      saveQueueRef.current = true;
      return;
    }

    try {
      isSavingRef.current = true;
      
      // Log for debugging
      console.log('[AutoSave] Saving session:', sessionId);
      
      // Call ExamSessionManager to save
      await examSessionManager.autoSave();
      
      lastSaveTimeRef.current = new Date();
      saveQueueRef.current = false;
      
      // Success callback
      if (onSaveSuccessRef.current) {
        onSaveSuccessRef.current();
      }
      
      console.log('[AutoSave] Save completed at', lastSaveTimeRef.current.toLocaleTimeString());
      
    } catch (error) {
      console.error('[AutoSave] Save error:', error);
      
      // Error callback
      if (onSaveErrorRef.current && error instanceof Error) {
        onSaveErrorRef.current(error);
      }
      
    } finally {
      isSavingRef.current = false;
      
      // Process queued save if any
      if (saveQueueRef.current) {
        saveQueueRef.current = false;
        setTimeout(() => performSave(), 1000); // Retry after 1s
      }
    }
  }, [sessionId]);

  /**
   * Trigger save với debouncing
   * Dùng khi user thay đổi answer
   */
  const triggerSave = useCallback(async () => {
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      performSave();
    }, debounceDelay);
  }, [performSave, debounceDelay]);

  /**
   * Force save ngay lập tức
   * Dùng khi submit hoặc exit
   */
  const forceSave = useCallback(async () => {
    // Clear debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    await performSave();
  }, [performSave]);

  /**
   * Start auto-save interval
   */
  const startAutoSave = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    console.log('[AutoSave] Starting auto-save interval:', interval, 'ms');
    
    autoSaveIntervalRef.current = setInterval(() => {
      if (!isSavingRef.current) {
        performSave();
      }
    }, interval);
  }, [interval, performSave]);

  /**
   * Stop auto-save interval
   */
  const stopAutoSave = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
      console.log('[AutoSave] Stopped auto-save interval');
    }
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  /**
   * Auto-save lifecycle
   */
  useEffect(() => {
    if (isActive && sessionId) {
      startAutoSave();
    } else {
      stopAutoSave();
    }

    return () => {
      stopAutoSave();
    };
  }, [isActive, sessionId, startAutoSave, stopAutoSave]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Force save on unmount if there are unsaved changes
      if (saveQueueRef.current && !isSavingRef.current) {
        performSave();
      }
    };
  }, [performSave]);

  return {
    triggerSave,
    forceSave,
    isAutoSaving: isSavingRef.current,
    lastSaveTime: lastSaveTimeRef.current,
  };
};

/**
 * Helper: Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Helper: Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
