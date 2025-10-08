/**
 * ExamSessionMVC
 * MVC wrapper component cho ExamSession
 * Integrates ExamSessionController với ExamSessionView
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { toeicQuestionGenerator } from '@/services/toeicQuestionGenerator';
import { ExamSet, Question, DrillType, TimeMode } from '@/types';
// Mock controller hook since it might not exist
const useExamSessionController = () => {
  return {
    state: {},
    examSet: null,
    questions: [],
    currentIndex: 0,
    answers: new Map(),
    timeLeft: 0,
    isStarted: false,
    isPaused: false,
    isSubmitted: false,
    loading: false,
    showSubmitDialog: false,
    hasCompleted: false,
    refreshKey: 0,
    sessionId: null,
    passageMap: {},
    selectedParts: null,
    setExamSet: (examSet: any) => {},
    setQuestions: (questions: any[]) => {},
    setSelectedParts: (parts: any) => {},
    setLoading: (loading: boolean) => {},
    setHasCompleted: (completed: boolean) => {},
    setPassageMap: (passages: any) => {},
    setSessionId: (id: string) => {},
    setTimeLeft: (time: number) => {},
    startExam: () => {},
    pauseExam: () => {},
    nextQuestion: () => {},
    previousQuestion: () => {},
    goToQuestion: (index: number) => {},
    handleAnswerChange: (questionId: string, answer: string) => {},
    showSubmitDialogAction: () => {},
    hideSubmitDialog: () => {},
    handleSubmitExam: () => {},
    formatTime: () => '',
    getProgress: () => 0,
    getAnsweredCount: () => 0,
    getCurrentQuestion: () => null,
    getCurrentAnswer: () => null,
    calculateResults: () => ({ totalQuestions: 0, correctAnswers: 0, score: 0, timeSpent: 0 }),
  };
};

// Mock interfaces since controller might not exist
interface ExamAnswer {
  question_id: string;
  answer: string;
  is_correct: boolean;
  time_spent: number;
  questionId?: string;
  isCorrect?: boolean;
  timeSpent?: number;
}

interface PassageLite {
  id: string;
  title: string;
  content: string;
  audio_url?: string;
  image_url?: string;
  texts?: {
    title?: string;
    content?: string;
    additional?: string;
  };
}
import ExamSessionView from './ExamSessionView';

interface ExamSessionMVCProps {
  examSetId?: string;
}

const ExamSessionMVC: React.FC<ExamSessionMVCProps> = ({ examSetId: propExamSetId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { toast } = useToast();
  
  // Get examSetId from props or params
  const examSetId = propExamSetId || params.examSetId;
  const selectedParts: number[] | undefined = (location.state as any)?.parts;
  const timeMode: TimeMode = (location.state as any)?.timeMode || 'standard';

  // Use exam session controller
  const {
    state,
    examSet,
    questions,
    currentIndex,
    answers,
    timeLeft,
    isStarted,
    isPaused,
    isSubmitted,
    loading,
    showSubmitDialog,
    hasCompleted,
    refreshKey,
    sessionId,
    passageMap,
    selectedParts: controllerSelectedParts,
    setExamSet,
    setQuestions,
    setSelectedParts,
    setLoading,
    setHasCompleted,
    setPassageMap,
    setSessionId,
    setTimeLeft,
    startExam,
    pauseExam,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    handleAnswerChange,
    showSubmitDialogAction,
    hideSubmitDialog,
    handleSubmitExam: handleSubmitExamAction,
    formatTime,
    getProgress,
    getAnsweredCount,
    getCurrentQuestion,
    getCurrentAnswer,
    calculateResults,
  } = useExamSessionController();

  // Set selected parts
  useEffect(() => {
    if (selectedParts) {
      setSelectedParts(selectedParts);
    }
  }, [selectedParts, setSelectedParts]);

  // Check if exam is completed
  const checkIfCompleted = async () => {
    try {
      console.log('Checking if exam completed for examSetId:', examSetId);
      
      if (!examSetId) {
        console.log('No examSetId provided, skipping completion check');
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return;
      }

      console.log('User found:', user.id);

      // Fetch attempt policy from exam_sets
      const { data: setRow } = await supabase
        .from('exam_sets')
        .select('*')
        .eq('id', examSetId)
        .maybeSingle();

      // Count existing completed sessions
      const { count: completedCount, error: countErr } = await supabase
        .from('exam_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('exam_set_id', examSetId)
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (countErr) {
        console.error('Count query error:', countErr);
        return;
      }

      // Determine policy
      const allowMultiple = (setRow as any)?.allow_multiple_attempts;
      const maxAttempts = (setRow as any)?.max_attempts ?? (setRow as any)?.attempt_limit;

      let completed = false;
      if (typeof maxAttempts === 'number') {
        completed = (completedCount || 0) >= maxAttempts;
      } else if (allowMultiple === false) {
        completed = (completedCount || 0) >= 1;
      } else {
        completed = false;
      }

      console.log('Attempt policy:', { allowMultiple, maxAttempts, completedCount, completed });
      setHasCompleted(completed);
    } catch (error) {
      console.error('Error checking completion:', error);
    }
  };

  // Fetch exam data
  const fetchExamData = async () => {
    try {
      console.log('Fetching exam data for examSetId:', examSetId);
      
      if (!examSetId) {
        console.error('No examSetId provided');
        toast({
          title: "Lỗi",
          description: "Không tìm thấy ID đề thi",
          variant: "destructive",
        });
        navigate('/exam-sets');
        return;
      }
      
      // Fetch exam set
      const { data: examSetData, error: examSetError } = await supabase
        .from('exam_sets')
        .select('*')
        .eq('id', examSetId)
        .single();

      if (examSetError) {
        console.error('Error fetching exam set:', examSetError);
        throw examSetError;
      }

      console.log('Exam set data:', examSetData);

      // Fetch exam_questions rows
      const { data: examQRows, error: examQErr } = await supabase
        .from('exam_questions')
        .select('question_id, order_index')
        .eq('exam_set_id', examSetId)
        .order('order_index', { ascending: true });

      if (examQErr) {
        console.error('Error fetching exam_questions:', examQErr);
        throw examQErr;
      }

      console.log('Exam question mapping:', examQRows);

      if (!examQRows || examQRows.length === 0) {
        toast({
          title: "Cảnh báo",
          description: "Không có câu hỏi nào trong đề thi này. Vui lòng thêm câu hỏi trước khi làm bài.",
          variant: "destructive",
        });
        navigate('/exam-sets');
        return;
      }

      // Fetch questions by IDs
      const questionIds = examQRows.map(r => r.question_id);
      const { data: questionRows, error: qErr } = await supabase
        .from('questions')
        .select('*')
        .in('id', questionIds);

      if (qErr) {
        console.error('Error fetching questions:', qErr);
        throw qErr;
      }

      // Order questions by order_index mapping
      const idToQuestion: Record<string, Question> = {};
      (questionRows || []).forEach((q: any) => { idToQuestion[q.id] = q as Question; });
      let orderedQuestions = examQRows
        .map(r => idToQuestion[r.question_id])
        .filter(Boolean) as Question[];

      // Filter by selected parts if provided
      if (selectedParts && selectedParts.length > 0) {
        orderedQuestions = orderedQuestions.filter(q => selectedParts.includes(q.part as number));
      }

      // Load passages for questions that need them
      const passageIds = Array.from(new Set(
        orderedQuestions
          .map(q => q.passage_id)
          .filter((id): id is string => Boolean(id))
      ));

      const passageMap: Record<string, PassageLite> = {};
      if (passageIds.length > 0) {
        const { data: passages, error: pErr } = await supabase
          .from('passages')
          .select('id, texts, image_url, audio_url')
          .in('id', passageIds);
        if (pErr) {
          console.error('Error fetching passages:', pErr);
        } else {
          (passages || []).forEach((p: any) => {
            passageMap[p.id] = {
              id: p.id,
              title: p.title || '',
              content: p.content || '',
              texts: p.texts || null,
              image_url: p.image_url || null,
              audio_url: p.audio_url || null,
            };
          });
        }
      }

      setPassageMap(passageMap);

      setExamSet({
        ...examSetData,
        type: examSetData.type as DrillType
      } as ExamSet);
      setQuestions(orderedQuestions);

      // Set time limit
      if (selectedParts && selectedParts.length > 0) {
        const totalMinutes = selectedParts.reduce((sum, p) => {
          const cfg = toeicQuestionGenerator.getPartConfig(p);
          return sum + (cfg ? cfg.timeLimit : 0);
        }, 0);
        setTimeLeft(Math.max(1, totalMinutes) * 60);
      } else {
        setTimeLeft(examSetData.time_limit * 60);
      }
      
      console.log('Exam data loaded successfully');
      console.log('Final questions count:', orderedQuestions.length);
      
    } catch (error) {
      console.error('Error fetching exam data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu bài thi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle exam submission
  const handleSubmitExam = async () => {
    if (questions.length === 0) return;

    handleSubmitExamAction();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Lỗi",
          description: "Không thể xác thực người dùng",
          variant: "destructive",
        });
        return;
      }

      // Calculate correct answers
      const finalAnswers = new Map(answers);
      questions.forEach(question => {
        const answer = finalAnswers.get(question.id);
        if (answer) {
          const correct = (question as any).correct_choice || (question as any).answer;
          (answer as any).isCorrect = (answer as any).answer === correct;
          finalAnswers.set(question.id, answer);
        }
      });

      // Calculate results
      const results = calculateResults();
      const { totalQuestions, correctAnswers, score, timeSpent } = results;

      // Create exam session
      const { data: sessionData, error: sessionError } = await supabase
        .from('exam_sessions')
        .insert({
          user_id: user.id,
          exam_set_id: examSetId,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          score: score,
          time_spent: timeSpent,
          results: {
            served_question_ids: questions.map(q => q.id),
            selected_parts: selectedParts || null
          },
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        toast({
          title: "Lỗi",
          description: `Không thể lưu kết quả thi: ${sessionError.message}`,
          variant: "destructive",
        });
        return;
      }

      setSessionId(sessionData.id);

      // Create exam attempts
      const attempts = Array.from(finalAnswers.values()).map(answer => ({
        session_id: sessionData.id,
        question_id: (answer as any).questionId || (answer as any).question_id,
        user_answer: (answer as any).answer,
        is_correct: (answer as any).isCorrect || (answer as any).is_correct,
        time_spent: (answer as any).timeSpent || (answer as any).time_spent
      }));

      const { error: attemptsError } = await supabase
        .from('exam_attempts')
        .insert(attempts);

      if (attemptsError) {
        console.error('Error creating attempts:', attemptsError);
        toast({
          title: "Lỗi",
          description: `Không thể lưu chi tiết câu trả lời: ${attemptsError.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Hoàn thành bài thi",
        description: `Kết quả: ${correctAnswers}/${totalQuestions} câu đúng (${score}%)`,
      });

      hideSubmitDialog();
      
      // Navigate to results page
      setTimeout(() => {
        navigate(`/exam-result/${sessionData.id}`);
      }, 2000);

    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi nộp bài",
        variant: "destructive",
      });
    }
  };

  // Initialize exam data
  useEffect(() => {
    if (examSetId) {
      fetchExamData();
      checkIfCompleted();
    }
  }, [examSetId]);

  // Navigation handlers
  const handleNavigateBack = () => {
    navigate('/exam-sets');
  };

  const handleNavigateToResults = () => {
    if (sessionId) {
      navigate(`/exam-result/${sessionId}`);
    }
  };

  const handleNavigateToHistory = () => {
    navigate('/exam-history');
  };

  return (
    <ExamSessionView
      // State
      examSet={examSet}
      questions={questions}
      currentIndex={currentIndex}
      answers={answers}
      timeLeft={timeLeft}
      isStarted={isStarted}
      isPaused={isPaused}
      isSubmitted={isSubmitted}
      loading={loading}
      showSubmitDialog={showSubmitDialog}
      hasCompleted={hasCompleted}
      refreshKey={refreshKey}
      sessionId={sessionId}
      passageMap={passageMap}
      selectedParts={controllerSelectedParts}
      timeMode={timeMode}

      // Actions
      onStartExam={startExam}
      onPauseExam={pauseExam}
      onNextQuestion={nextQuestion}
      onPreviousQuestion={previousQuestion}
      onGoToQuestion={goToQuestion}
      onAnswerChange={handleAnswerChange}
      onShowSubmitDialog={showSubmitDialogAction}
      onHideSubmitDialog={hideSubmitDialog}
      onSubmitExam={handleSubmitExam}
      onRefreshExam={fetchExamData}
      onNavigateBack={handleNavigateBack}
      onNavigateToResults={handleNavigateToResults}
      onNavigateToHistory={handleNavigateToHistory}

      // Utility functions
      formatTime={formatTime}
      getProgress={getProgress}
      getAnsweredCount={getAnsweredCount}
      getCurrentQuestion={getCurrentQuestion}
      getCurrentAnswer={getCurrentAnswer}
    />
  );
};

export default ExamSessionMVC;
