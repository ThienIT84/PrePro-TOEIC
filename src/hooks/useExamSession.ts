/**
 * useExamSession hook
 * Quản lý state và logic của exam session
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { examSessionManager, ExamSessionData } from '@/services/ExamSessionManager';
import { useToast } from '@/hooks/use-toast';

export interface UseExamSessionOptions {
  examSetId: string;
  questions: any[];
  selectedParts?: number[];
  timeMode?: 'standard' | 'unlimited';
}

export const useExamSession = (options: UseExamSessionOptions) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [sessionData, setSessionData] = useState<ExamSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  
  const isInitialized = useRef(false);
  const beforeUnloadHandler = useRef<((e: BeforeUnloadEvent) => void) | null>(null);

  /**
   * Khởi tạo session
   */
  const initializeSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Kiểm tra có session đang active không
      const existingSession = examSessionManager.getCurrentSession();
      if (existingSession) {
        setSessionData(existingSession);
        setLoading(false);
        return;
      }

      // Tạo session mới
      await createNewSession();

      setLoading(false);
    } catch (error) {
      console.error('Error initializing session:', error);
      setError('Không thể khởi tạo bài thi');
      setLoading(false);
    }
  }, [options.examSetId, options.questions, options.selectedParts, options.timeMode]);

  /**
   * Tạo session mới
   */
  const createNewSession = async () => {
    const sessionId = await examSessionManager.createSession(
      options.examSetId,
      options.questions,
      options.selectedParts,
      options.timeMode
    );
    
    const newSession = examSessionManager.getCurrentSession();
    setSessionData(newSession);
  };

  /**
   * Lưu câu trả lời
   */
  const saveAnswer = useCallback((questionId: string, answer: string, timeSpent: number = 0) => {
    if (!sessionData) return;

    examSessionManager.saveAnswer(questionId, answer, timeSpent);
    
    // Cập nhật local state
    setSessionData(prev => {
      if (!prev) return prev;
      const newAnswers = new Map(prev.answers);
      newAnswers.set(questionId, { questionId, answer, timeSpent });
      return { ...prev, answers: newAnswers };
    });
  }, [sessionData]);

  /**
   * Cập nhật progress
   */
  const updateProgress = useCallback((currentIndex: number, timeLeft: number) => {
    if (!sessionData) return;

    examSessionManager.updateProgress(currentIndex, timeLeft);
    
    setSessionData(prev => {
      if (!prev) return prev;
      return { ...prev, currentIndex, timeLeft };
    });
  }, [sessionData]);

  /**
   * Hoàn thành bài thi
   */
  const completeExam = useCallback(async () => {
    try {
      await examSessionManager.completeSession();
      
      toast({
        title: "Hoàn thành bài thi",
        description: "Bài thi đã được lưu thành công.",
      });

      // Navigate to results
      const sessionId = sessionData?.sessionId;
      if (sessionId) {
        navigate(`/exam-result/${sessionId}`);
      }
    } catch (error) {
      console.error('Error completing exam:', error);
      toast({
        title: "Lỗi",
        description: "Không thể hoàn thành bài thi",
        variant: "destructive",
      });
    }
  }, [sessionData, navigate]);

  /**
   * Hủy bài thi
   */
  const cancelExam = useCallback(async () => {
    try {
      await examSessionManager.cancelSession();
      
      toast({
        title: "Đã hủy bài thi",
        description: "Bài thi đã được hủy và không được tính điểm.",
      });

      navigate('/exam-sets');
    } catch (error) {
      console.error('Error cancelling exam:', error);
      toast({
        title: "Lỗi",
        description: "Không thể hủy bài thi",
        variant: "destructive",
      });
    }
  }, [navigate]);

  /**
   * Xử lý thoát
   */
  const handleExit = useCallback(() => {
    setShowExitDialog(true);
  }, []);

  /**
   * Xác nhận thoát
   */
  const confirmExit = useCallback(async () => {
    setShowExitDialog(false);
    await cancelExam();
  }, [cancelExam]);

  /**
   * Hủy thoát
   */
  const cancelExit = useCallback(() => {
    setShowExitDialog(false);
  }, []);

  /**
   * Setup beforeunload handler
   */
  const setupBeforeUnloadHandler = useCallback(() => {
    if (beforeUnloadHandler.current) {
      window.removeEventListener('beforeunload', beforeUnloadHandler.current);
    }

    beforeUnloadHandler.current = (e: BeforeUnloadEvent) => {
      if (sessionData && sessionData.isStarted) {
        e.preventDefault();
        e.returnValue = 'Bạn có chắc chắn muốn thoát? Tiến độ bài thi sẽ được lưu tự động.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', beforeUnloadHandler.current);
  }, [sessionData]);

  /**
   * Cleanup
   */
  const cleanup = useCallback(() => {
    if (beforeUnloadHandler.current) {
      window.removeEventListener('beforeunload', beforeUnloadHandler.current);
      beforeUnloadHandler.current = null;
    }
  }, []);

  // Initialize session
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      initializeSession();
    }
  }, [initializeSession]);

  // Setup beforeunload handler
  useEffect(() => {
    setupBeforeUnloadHandler();
    return cleanup;
  }, [setupBeforeUnloadHandler, cleanup]);

  return {
    sessionData,
    loading,
    error,
    showExitDialog,
    saveAnswer,
    updateProgress,
    completeExam,
    cancelExam,
    handleExit,
    confirmExit,
    cancelExit,
    initializeSession
  };
};
