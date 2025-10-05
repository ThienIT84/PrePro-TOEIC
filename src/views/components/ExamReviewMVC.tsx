/**
 * ExamReviewMVC
 * MVC wrapper component cho TOEIC Exam Review
 * Integrates controller với view
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamReviewController } from '@/controllers/exam/useExamReviewController';
import { ExamReviewView } from '@/views/components/ExamReviewView';

interface ExamReviewMVCProps {
  sessionId: string;
  className?: string;
}

export const ExamReviewMVC: React.FC<ExamReviewMVCProps> = ({ 
  sessionId,
  className = '' 
}) => {
  const navigate = useNavigate();
  
  const {
    // State
    examSession,
    questions,
    examSet,
    userAnswers,
    loading,
    currentQuestionIndex,
    error,

    // Handlers
    setCurrentQuestionIndex,
    goToNextQuestion,
    goToPreviousQuestion,

    // Utility functions
    getCurrentQuestion,
    getCurrentAnswer,
    isCurrentAnswerCorrect,
    getScoreColor,
    getScoreBadgeVariant,
    getPartColor,
    getPartIcon,
    getTotalQuestions,
    getCorrectAnswersCount,
    getIncorrectAnswersCount,
    getQuestionsByPart,
    getCurrentPassageQuestions,
    isQuestionCorrect,
    getUserAnswer,
    getProgressPercentage,
    getStatistics,
    hasCurrentQuestionPassage,
    hasCurrentQuestionAudio,
    hasCurrentQuestionImage,
    getCurrentQuestionPassage,
    getPassageImages,
    canGoToNext,
    canGoToPrevious,
  } = useExamReviewController(sessionId);

  // Handle current question index change
  const handleCurrentQuestionIndexChange = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // Handle go to next question
  const handleGoToNextQuestion = () => {
    goToNextQuestion();
  };

  // Handle go to previous question
  const handleGoToPreviousQuestion = () => {
    goToPreviousQuestion();
  };

  // Handle retry exam
  const handleRetryExam = () => {
    if (examSet) {
      navigate(`/exam-sets/${examSet.id}/take`);
    }
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <ExamReviewView
      // State
      examSession={examSession}
      questions={questions}
      examSet={examSet}
      userAnswers={userAnswers}
      loading={loading}
      currentQuestionIndex={currentQuestionIndex}
      error={error}

      // Handlers
      onCurrentQuestionIndexChange={handleCurrentQuestionIndexChange}
      onGoToNextQuestion={handleGoToNextQuestion}
      onGoToPreviousQuestion={handleGoToPreviousQuestion}
      onRetryExam={handleRetryExam}
      onBackToDashboard={handleBackToDashboard}

      // Utility functions
      getCurrentQuestion={getCurrentQuestion}
      getCurrentAnswer={getCurrentAnswer}
      isCurrentAnswerCorrect={isCurrentAnswerCorrect}
      getScoreColor={getScoreColor}
      getScoreBadgeVariant={getScoreBadgeVariant}
      getPartColor={getPartColor}
      getPartIcon={getPartIcon}
      getTotalQuestions={getTotalQuestions}
      getCorrectAnswersCount={getCorrectAnswersCount}
      getIncorrectAnswersCount={getIncorrectAnswersCount}
      getQuestionsByPart={getQuestionsByPart}
      getCurrentPassageQuestions={getCurrentPassageQuestions}
      isQuestionCorrect={isQuestionCorrect}
      getUserAnswer={getUserAnswer}
      getProgressPercentage={getProgressPercentage}
      getStatistics={getStatistics}
      hasCurrentQuestionPassage={hasCurrentQuestionPassage}
      hasCurrentQuestionAudio={hasCurrentQuestionAudio}
      hasCurrentQuestionImage={hasCurrentQuestionImage}
      getCurrentQuestionPassage={getCurrentQuestionPassage}
      getPassageImages={getPassageImages}
      canGoToNext={canGoToNext}
      canGoToPrevious={canGoToPrevious}

      // Props
      className={className}
    />
  );
};

export default ExamReviewMVC;
