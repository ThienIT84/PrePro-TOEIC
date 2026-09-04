/**
 * ExamResultMVC
 * MVC wrapper component cho ExamResult
 * Kết nối useExamResultController với ExamResultView
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamResultController } from '@/controllers/exam/useExamResultController';
import ExamResultView from './ExamResultView';

export const ExamResultMVC: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const {
    result,
    loading,
    error,
    retryMode,
    questions,
    attempts,
    fetchExamResult,
    setRetryMode,
    formatTime,
    getScoreColor,
  } = useExamResultController();

  useEffect(() => {
    if (sessionId) {
      fetchExamResult(sessionId);
    }
  }, [sessionId, fetchExamResult]);

  const handleNavigateDashboard = () => {
    navigate('/dashboard');
  };

  const handleNavigateReview = () => {
    if (sessionId) {
      navigate(`/exam-review/${sessionId}`);
    }
  };

  const handleNavigateExams = () => {
    navigate('/exams');
  };

  const handleEnterRetryMode = () => {
    setRetryMode(true);
  };

  const handleExitRetryMode = () => {
    setRetryMode(false);
  };

  const handleUpdateResult = (_newScore: number, _newCorrectCount: number) => {
    if (sessionId) {
      fetchExamResult(sessionId);
    }
    setRetryMode(false);
  };

  return (
    <ExamResultView
      result={result}
      loading={loading}
      error={error}
      retryMode={retryMode}
      sessionId={sessionId || ''}
      questions={questions}
      attempts={attempts}
      onNavigateDashboard={handleNavigateDashboard}
      onNavigateReview={handleNavigateReview}
      onNavigateExams={handleNavigateExams}
      onEnterRetryMode={handleEnterRetryMode}
      onExitRetryMode={handleExitRetryMode}
      onUpdateResult={handleUpdateResult}
      formatTime={formatTime}
      getScoreColor={getScoreColor}
    />
  );
};

export default ExamResultMVC;
