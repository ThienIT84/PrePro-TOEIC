import React from 'react';
import { ExamReviewView } from './ExamReviewView';
import { useExamReviewController } from '@/controllers/exam/useExamReviewController';

interface ExamReviewMVCProps {
  sessionId: string;
}

export const ExamReviewMVC: React.FC<ExamReviewMVCProps> = ({ sessionId }) => {
  const {
    // State
    examSession,
    examSet,
    questions,
    questionReviews,
    userAnswers,
    currentQuestionIndex,
    loading,
    error,
    statistics,
    
    // Actions
    handleLoadExamData,
    handleSetCurrentQuestionIndex,
    handleGoToNextQuestion,
    handleGoToPreviousQuestion,
    handleGoToQuestion,
    handleClearError,
    
    // Controller Methods
    getAudioUrl,
    getQuestionAnalysis,
    getPerformanceAnalysis,
    getCurrentQuestion,
    getCurrentQuestionReview,
    getQuestionByIndex,
    getQuestionReviewByIndex
  } = useExamReviewController(sessionId);

  return (
    <ExamReviewView
      controller={undefined} // Not needed in MVC wrapper
      state={{
        examSession,
        examSet,
        questions,
        questionReviews,
        userAnswers,
        currentQuestionIndex,
        loading,
        error,
        statistics
      }}
      onLoadExamData={handleLoadExamData}
      onSetCurrentQuestionIndex={handleSetCurrentQuestionIndex}
      onGoToNextQuestion={handleGoToNextQuestion}
      onGoToPreviousQuestion={handleGoToPreviousQuestion}
      onGoToQuestion={handleGoToQuestion}
      onClearError={handleClearError}
    />
  );
};