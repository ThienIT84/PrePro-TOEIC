import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  ArrowRight,
  Flag,
  RotateCcw,
  Play,
  Pause,
  Eye,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ExamSet, ExamQuestion, Question, DrillType, TimeMode } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toeicQuestionGenerator } from '@/services/toeicQuestionGenerator';
import SimpleAudioPlayer from './SimpleAudioPlayer';

interface ExamSessionProps {
  examSetId: string;
}

interface ExamAnswer {
  questionId: string;
  answer: string;
  timeSpent: number;
  isCorrect: boolean;
}

type PassageLite = {
  id: string;
  texts: { 
    title?: string; 
    content?: string; 
    content2?: string;
    content3?: string;
    img_url?: string;
    img_url2?: string;
    img_url3?: string;
    additional?: string; // Backward compatibility
  } | null;
  image_url: string | null; // Backward compatibility
  audio_url: string | null;
};

const ExamSession = ({ examSetId }: ExamSessionProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedParts: number[] | undefined = (location.state as any)?.parts;
  const timeMode: TimeMode = (location.state as any)?.timeMode || 'standard';
  const { toast } = useToast();
  
  const [examSet, setExamSet] = useState<ExamSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, ExamAnswer>>(new Map());
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [passageMap, setPassageMap] = useState<Record<string, PassageLite>>({});
  const [showExitDialog, setShowExitDialog] = useState(false);

  useEffect(() => {
    fetchExamData();
    checkIfCompleted();
  }, [examSetId]);


  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Only start timer if time mode is standard and timeLeft > 0
    if (isStarted && !isPaused && timeMode === 'standard' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isStarted, isPaused, timeLeft, timeMode]);

  // Handle browser back button and page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isStarted && !isSubmitted) {
        e.preventDefault();
        e.returnValue = 'Bạn có chắc chắn muốn thoát? Tiến độ bài thi sẽ được lưu tự động.';
        return e.returnValue;
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (isStarted && !isSubmitted) {
        e.preventDefault();
        setShowExitDialog(true);
        // Push state back to prevent navigation
        window.history.pushState(null, '', window.location.href);
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Add a state to history to detect back button
    if (isStarted && !isSubmitted) {
      window.history.pushState(null, '', window.location.href);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isStarted, isSubmitted]);

  const checkIfCompleted = async () => {
    try {
      console.log('Checking if exam completed for examSetId:', examSetId);
      
      // Validate examSetId
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

      // Fetch attempt policy from exam_sets (tolerant if column doesn't exist)
      const { data: setRow } = await supabase
        .from('exam_sets')
        .select('*')
        .eq('id', examSetId)
        .maybeSingle();

      // Count existing completed sessions for this user & set
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
      
      console.log('setRow data:', setRow);
      console.log('allowMultiple from DB:', allowMultiple);
      console.log('maxAttempts from DB:', maxAttempts);

      let completed = false;
      if (typeof maxAttempts === 'number') {
        completed = (completedCount || 0) >= maxAttempts;
      } else if (allowMultiple === false) {
        completed = (completedCount || 0) >= 1;
      } else {
        // default: unlimited attempts
        completed = false;
      }

      console.log('Attempt policy:', { allowMultiple, maxAttempts, completedCount, completed });
      console.log('Setting hasCompleted to:', completed);
      // Temporarily disable completion check for debugging
      setHasCompleted(false);
    } catch (error) {
      console.error('Error checking completion:', error);
    }
  };

  const fetchExamData = async () => {
    try {
      console.log('Fetching exam data for examSetId:', examSetId);
      
      // Validate examSetId
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

      // Fetch exam_questions rows first (no FK join assumptions)
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

      // If user chose specific parts within this exam set, filter accordingly
      if (selectedParts && selectedParts.length > 0) {
        orderedQuestions = orderedQuestions.filter(q => selectedParts.includes(q.part as number));
      }

      // Load passages for questions that need them (3,4,6,7)
      const passageIds = Array.from(new Set(
        orderedQuestions
          .map(q => q.passage_id)
          .filter((id): id is string => Boolean(id))
      ));

      const map: Record<string, PassageLite> = {};
      if (passageIds.length > 0) {
        const { data: passages, error: pErr } = await supabase
          .from('passages')
          .select('id, texts, image_url, audio_url')
          .in('id', passageIds);
        if (pErr) {
          console.error('Error fetching passages:', pErr);
        } else {
          (passages || []).forEach((p: any) => {
            map[p.id] = {
              id: p.id,
              texts: p.texts || null,
              image_url: p.image_url || null,
              audio_url: p.audio_url || null,
            };
          });
        }
      }

      setPassageMap(map);

      setExamSet({
        ...examSetData,
        type: examSetData.type as DrillType
      } as ExamSet);
      setQuestions(orderedQuestions);

      // Time limit: full exam uses exam set time; selected parts sum their part times
      console.log('Time calculation:', { timeMode, selectedParts, examSetTimeLimit: examSetData.time_limit });
      
      if (timeMode === 'unlimited') {
        setTimeLeft(-1); // -1 indicates unlimited time
        console.log('Set unlimited time');
      } else if (selectedParts && selectedParts.length > 0) {
        const totalMinutes = selectedParts.reduce((sum, p) => {
          const cfg = toeicQuestionGenerator.getPartConfig(p);
          console.log(`Part ${p}: ${cfg ? cfg.timeLimit : 0} minutes`);
          return sum + (cfg ? cfg.timeLimit : 0);
        }, 0);
        console.log('Total minutes for selected parts:', totalMinutes);
        setTimeLeft(Math.max(1, totalMinutes) * 60);
      } else {
        console.log('Using exam set time limit:', examSetData.time_limit);
        setTimeLeft(examSetData.time_limit * 60);
      }
      
      console.log('Exam data loaded successfully');
      console.log('Final questions count:', orderedQuestions.length);
      
      // Force refresh by updating key
      setRefreshKey(prev => prev + 1);
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

  const startExam = async () => {
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

      // Create exam session in database
      const { data: sessionData, error: sessionError } = await supabase
        .from('exam_sessions')
        .insert({
          user_id: user.id,
          exam_set_id: examSetId,
          total_questions: questions.length,
          correct_answers: 0,
          score: 0,
          time_spent: 0,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          results: {
            served_question_ids: questions.map(q => q.id),
            selected_parts: selectedParts || null,
            time_mode: timeMode,
          },
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        toast({
          title: "Lỗi",
          description: "Không thể tạo phiên thi",
          variant: "destructive",
        });
        return;
      }

      setSessionId(sessionData.id);
      setIsStarted(true);
      
      // Calculate actual time limit based on selected parts or exam set
      let actualTimeLimit = examSet?.time_limit || 120;
      
      if (timeMode === 'unlimited') {
        actualTimeLimit = -1; // Unlimited
      } else if (selectedParts && selectedParts.length > 0) {
        // Calculate time based on selected parts
        actualTimeLimit = selectedParts.reduce((sum, p) => {
          const cfg = toeicQuestionGenerator.getPartConfig(p);
          return sum + (cfg ? cfg.timeLimit : 0);
        }, 0);
      }
      
      const timeMessage = actualTimeLimit === -1 
        ? 'Không giới hạn thời gian' 
        : `${actualTimeLimit} phút`;
        
      toast({
        title: "Bắt đầu làm bài",
        description: `Bạn có ${timeMessage} để hoàn thành bài thi`,
      });
    } catch (error) {
      console.error('Error starting exam:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi bắt đầu bài thi",
        variant: "destructive",
      });
    }
  };

  const pauseExam = () => {
    if (timeMode === 'standard') {
      setIsPaused(!isPaused);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    const currentAnswer = answers.get(questionId);
    const timeSpent = currentAnswer?.timeSpent || 0;
    
    setAnswers(prev => new Map(prev.set(questionId, {
      questionId,
      answer,
      timeSpent,
      isCorrect: false // Will be calculated on submit
    })));
  };

  const handleSubmitExam = async () => {
    if (questions.length === 0) return;

    setIsSubmitted(true);
    
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
          // Compare with TOEIC question field 'correct_choice'
          // Fallback to 'answer' if present (legacy)
          const correct = (question as any).correct_choice || (question as any).answer;
          answer.isCorrect = answer.answer === correct;
          finalAnswers.set(question.id, answer);
        }
      });

      setAnswers(finalAnswers);

      // Calculate results
      const totalQuestions = questions.length;
      const correctAnswers = Array.from(finalAnswers.values()).filter(a => a.isCorrect).length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      
      // Calculate actual time spent based on selected parts or exam set
      let timeSpent = 0;
      if (timeMode === 'unlimited') {
        timeSpent = 0; // No time tracking for unlimited mode
      } else if (selectedParts && selectedParts.length > 0) {
        // Calculate time spent for selected parts
        const totalMinutes = selectedParts.reduce((sum, p) => {
          const cfg = toeicQuestionGenerator.getPartConfig(p);
          return sum + (cfg ? cfg.timeLimit : 0);
        }, 0);
        const totalSeconds = totalMinutes * 60;
        timeSpent = Math.max(0, totalSeconds - timeLeft);
      } else {
        // Use exam set time limit
        timeSpent = Math.max(0, (examSet?.time_limit || 0) * 60 - timeLeft);
      }

      // Update existing session or create new one
      let sessionData;
      if (sessionId) {
        // Update existing session
        const { data, error } = await supabase
          .from('exam_sessions')
          .update({
            total_questions: totalQuestions,
            correct_answers: correctAnswers,
            score: score,
            time_spent: timeSpent,
            status: 'completed',
            completed_at: new Date().toISOString(),
            results: {
              served_question_ids: questions.map(q => q.id),
              selected_parts: selectedParts || null,
              time_mode: timeMode,
            }
          })
          .eq('id', sessionId)
          .select()
          .single();
        
        if (error) throw error;
        sessionData = data;
      } else {
        // Create new session
        const { data, error } = await supabase
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
              selected_parts: selectedParts || null,
              time_mode: timeMode,
            },
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        sessionData = data;
      }

      // Session data is already handled above

      setSessionId(sessionData.id);

      // Create exam attempts
      const attempts = Array.from(finalAnswers.values()).map(answer => ({
        session_id: sessionData.id,
        question_id: answer.questionId,
        user_answer: answer.answer,
        is_correct: answer.isCorrect,
        time_spent: answer.timeSpent
      }));

      console.log('Creating attempts:', attempts);
      console.log('Served question IDs:', questions.map(q => q.id));
      console.log('Questions with audio:', questions.filter(q => q.audio_url));
      console.log('Questions with image:', questions.filter(q => q.image_url));

      const { error: attemptsError } = await supabase
        .from('exam_attempts')
        .insert(attempts);

      if (attemptsError) {
        console.error('Error creating attempts:', attemptsError);
        console.error('Attempts error details:', {
          message: attemptsError.message,
          details: attemptsError.details,
          hint: attemptsError.hint,
          code: attemptsError.code
        });
        
        toast({
          title: "Lỗi",
          description: `Không thể lưu chi tiết câu trả lời: ${attemptsError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Attempts created successfully');

      // Clear localStorage after successful submission
      if (sessionId) {
        localStorage.removeItem(`exam_progress_${sessionId}`);
      }

      toast({
        title: "Hoàn thành bài thi",
        description: `Kết quả: ${correctAnswers}/${totalQuestions} câu đúng (${score}%)`,
      });

      setShowSubmitDialog(false);
      
      // Navigate to results page
      console.log('Navigating to exam result:', `/exam-result/${sessionData.id}`);
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (questions.length === 0) return 0;
    return ((currentIndex + 1) / questions.length) * 100;
  };

  const getAnsweredCount = () => {
    return Array.from(answers.values()).filter(a => a.answer).length;
  };

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!sessionId || !isStarted) return;

    try {
      // Save current progress to localStorage
      const progressData = {
        sessionId,
        examSetId,
        currentIndex,
        answers: Array.from(answers.entries()),
        timeLeft,
        isStarted,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`exam_progress_${sessionId}`, JSON.stringify(progressData));
      console.log('Auto-save completed');
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }, [sessionId, isStarted, currentIndex, answers, timeLeft, examSetId]);

  // Handle exit
  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = async () => {
    setShowExitDialog(false);
    
    try {
      // Save current progress to localStorage
      await autoSave();
      
      // Update session in database
      if (sessionId) {
        await supabase
          .from('exam_sessions')
          .update({
            time_spent: (examSet?.time_limit || 0) * 60 - timeLeft,
            updated_at: new Date().toISOString(),
            results: {
              current_index: currentIndex,
              time_left: timeLeft,
              answers: Array.from(answers.entries()) as any,
              served_question_ids: questions.map(q => q.id),
              selected_parts: selectedParts || null,
              time_mode: timeMode,
            }
          })
          .eq('id', sessionId);
      }
      
      toast({
        title: "Đã lưu tiến độ",
        description: "Bạn có thể tiếp tục bài thi sau.",
      });
      
      // Clear the history state we added
      window.history.replaceState(null, '', window.location.href);
      
      // Navigate back
      navigate('/exam-sets');
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi lưu tiến độ",
        variant: "destructive",
      });
    }
  };

  const cancelExit = () => {
    setShowExitDialog(false);
    // Push state back to prevent navigation if user cancels
    window.history.pushState(null, '', window.location.href);
  };

  if (loading) {
    console.log('ExamSession - Loading state');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-center text-muted-foreground mt-4">Đang tải dữ liệu bài thi...</p>
      </div>
    );
  }

  if (!examSet || questions.length === 0) {
    console.log('ExamSession - No exam set or questions:', { examSet, questionsLength: questions.length });
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Không tìm thấy bài thi</h2>
        <p className="text-muted-foreground mb-4">
          {!examSet ? 'Không thể tải thông tin bài thi' : 'Không có câu hỏi nào trong bài thi này'}
        </p>
        <Button onClick={() => navigate('/exam-sets')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.get(currentQuestion.id);

  if (hasCompleted) {
    console.log('ExamSession - User has already completed this exam, hasCompleted:', hasCompleted);
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{examSet?.title || 'Bài thi'}</CardTitle>
            {examSet?.description && (
              <p className="text-muted-foreground">{examSet.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Bạn đã hoàn thành bài thi này!</strong>
                <p className="mt-2 text-sm">
                  Mỗi học sinh chỉ được thi một lần. Bạn có thể xem lại kết quả hoặc chọn bài thi khác.
                </p>
              </AlertDescription>
            </Alert>

            <div className="flex space-x-4">
              <Button onClick={() => navigate('/exam-sets')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Chọn bài thi khác
              </Button>
              <Button onClick={() => navigate('/exam-history')} className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                Xem kết quả
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{examSet.title}</CardTitle>
            {examSet.description && (
              <p className="text-muted-foreground">{examSet.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{questions.length}</div>
                <div className="text-sm text-muted-foreground">Số câu hỏi</div>
                {refreshKey > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    ✓ Đã cập nhật
                  </div>
                )}
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {timeMode === 'unlimited' ? 'Không giới hạn' : 
                   selectedParts && selectedParts.length > 0 ? 
                   Math.floor(timeLeft / 60) : examSet.time_limit}
                </div>
                <div className="text-sm text-muted-foreground">
                  {timeMode === 'unlimited' ? 'Thời gian tự do' : 'Phút'}
                </div>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Hướng dẫn:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• {timeMode === 'unlimited' ? 'Bạn có thể làm bài không giới hạn thời gian' : 
                       selectedParts && selectedParts.length > 0 ? 
                       `Bạn có ${Math.floor(timeLeft / 60)} phút để hoàn thành bài thi` :
                       `Bạn có ${examSet.time_limit} phút để hoàn thành bài thi`}</li>
                  <li>• Chọn đáp án A, B, C, hoặc D cho mỗi câu hỏi</li>
                  <li>• {timeMode === 'standard' ? 'Có thể tạm dừng và tiếp tục bất kỳ lúc nào' : 'Làm bài với thời gian tự do'}</li>
                  <li>• {timeMode === 'standard' ? 'Bài thi sẽ tự động nộp khi hết thời gian' : 'Bạn có thể nộp bài bất kỳ lúc nào'}</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex space-x-4">
              <Button onClick={() => navigate('/exam-sets')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <Button 
                onClick={fetchExamData} 
                variant="outline"
                disabled={loading}
                title="Làm mới danh sách câu hỏi"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
              <Button onClick={startExam} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Bắt đầu làm bài
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto space-y-6 overflow-y-auto p-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{examSet.title}</h1>
              <p className="text-sm text-muted-foreground">
                Câu {currentIndex + 1} / {questions.length} • Part {currentQuestion.part}
                {currentQuestion.passage_id && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Passage {questions.findIndex(q => q.passage_id === currentQuestion.passage_id) + 1}-{questions.filter(q => q.passage_id === currentQuestion.passage_id).length}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExit}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Thoát
              </Button>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className={`font-mono text-lg ${timeMode === 'standard' && timeLeft < 300 ? 'text-red-500' : ''}`}>
                  {timeMode === 'unlimited' ? 'Không giới hạn' : formatTime(timeLeft)}
                </span>
              </div>
              {timeMode === 'standard' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pauseExam}
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubmitDialog(true)}
              >
                <Flag className="h-4 w-4 mr-2" />
                Nộp bài
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Tiến độ</span>
              <span>{getAnsweredCount()} / {questions.length} câu đã trả lời</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Audio Player - Only for single questions (Part 1, 2) */}
            {(() => {
              // Only show audio for questions without passage_id (Part 1, 2)
              if (currentQuestion.passage_id) return null;
              
              const questionAudio = currentQuestion.audio_url;
              const hasAudio = questionAudio;
              
              console.log(`ExamSession - Question ${currentIndex + 1} audio check:`, {
                part: currentQuestion.part,
                questionAudio,
                hasAudio,
                passageId: currentQuestion.passage_id
              });
              
              return hasAudio && (
              <div className="mb-6">
                <SimpleAudioPlayer 
                    audioUrl={questionAudio}
                    transcript=""
                />
              </div>
              );
            })()}

            {/* Image for Part 1 */}
            {currentQuestion.part === 1 && currentQuestion.image_url && (
              <div className="mb-6">
                <div className="flex justify-center">
                  <img 
                    src={currentQuestion.image_url} 
                    alt="Question image" 
                    className="max-w-full h-auto rounded-lg border shadow-sm object-contain"
                    style={{ maxHeight: '500px' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden text-center text-red-500 p-4 border rounded-lg">
                    <p>Không thể tải ảnh</p>
                    <p className="text-sm">Vui lòng kiểm tra lại kết nối mạng</p>
                  </div>
                </div>
              </div>
            )}

            {/* Part 6,7 Passage Images (from passages) */}
            {(currentQuestion.part === 6 || currentQuestion.part === 7) && currentQuestion.passage_id && passageMap[currentQuestion.passage_id] && (
              (() => {
                const p = passageMap[currentQuestion.passage_id];
                const images = [];
                
                // Add images from new structure
                if (p.texts?.img_url) images.push(p.texts.img_url);
                if (p.texts?.img_url2) images.push(p.texts.img_url2);
                if (p.texts?.img_url3) images.push(p.texts.img_url3);
                
                // Backward compatibility: fallback to old structure
                if (images.length === 0) {
                  if (p.image_url) images.push(p.image_url);
                  if (p.texts?.additional) {
                    const extra = p.texts.additional
                      .split('|')
                      .map(s => s.trim())
                      .filter(Boolean);
                    images.push(...extra);
                  }
                }
                
                if (images.length === 0) return null;
                
                // For Part 7, always display images in a single column for better readability
                return (
                  <div className="mb-6">
                    <div className="space-y-4">
                      {images.map((src, i) => (
                        <div key={i} className="flex justify-center">
                          <img 
                            src={src} 
                            alt={`Passage ${i + 1}`} 
                            className="max-w-full h-auto rounded-lg border shadow-lg hover:shadow-xl transition-shadow duration-200"
                            style={{ 
                              maxHeight: '600px',
                              minHeight: '300px',
                              objectFit: 'contain'
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden text-center text-red-500 p-4 border rounded-lg">
                            <p>Không thể tải ảnh</p>
                            <p className="text-sm">Vui lòng kiểm tra lại kết nối mạng</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()
            )}

            {/* Part 6,7 Passage Text - Hidden for Part 6,7, only show images */}
            {/* Part 3,4 Passage Text - Hidden for Part 3,4 (listening), only show audio */}
            {currentQuestion.part !== 7 && currentQuestion.part !== 6 && currentQuestion.part !== 3 && currentQuestion.part !== 4 && currentQuestion.passage_id && passageMap[currentQuestion.passage_id]?.texts?.content && (
              <div className="mb-4">
                {passageMap[currentQuestion.passage_id]?.texts?.title && (
                  <h3 className="text-base font-semibold mb-2">{passageMap[currentQuestion.passage_id]?.texts?.title}</h3>
                )}
                <pre className="whitespace-pre-wrap text-sm text-gray-800">
                  {passageMap[currentQuestion.passage_id]?.texts?.content}
                </pre>
              </div>
            )}


            {/* Question Text - Hidden for Part 1 and Part 2 */}
            {currentQuestion.part !== 1 && currentQuestion.part !== 2 && (
              <div>
                <h2 className="text-lg font-medium mb-4">
                  {currentQuestion.prompt_text || (currentQuestion as any).question}
                </h2>
              </div>
            )}

            {/* Part 1 - Only Image and Instructions */}
            {currentQuestion.part === 1 && (
              <div className="mb-6">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-medium text-gray-800 mb-2">
                    Part 1: Photos
                  </h2>
                  <p className="text-gray-600">
                    Nhìn vào ảnh và chọn câu mô tả đúng nhất.
                  </p>
                </div>
              </div>
            )}

            {/* Part 2 - Question-Response Instructions */}
            {currentQuestion.part === 2 && (
              <div className="mb-6">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-medium text-gray-800 mb-2">
                    Part 2: Question-Response
                  </h2>
                  <p className="text-gray-600">
                    Nghe câu hỏi và chọn câu trả lời phù hợp nhất.
                  </p>
                </div>
              </div>
            )}

            {/* Part 3-4-6-7 - Passage Instructions */}
            {[3, 4, 6, 7].includes(currentQuestion.part) && currentQuestion.passage_id && (
              <div className="mb-6">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-medium text-gray-800 mb-2">
                    Part {currentQuestion.part}: {currentQuestion.part === 3 ? 'Conversations' : currentQuestion.part === 4 ? 'Talks' : currentQuestion.part === 6 ? 'Text Completion' : 'Reading Comprehension'}
                  </h2>
                  <p className="text-gray-600">
                    {currentQuestion.part === 3 && 'Nghe đoạn hội thoại và trả lời câu hỏi.'}
                    {currentQuestion.part === 4 && 'Nghe đoạn thuyết trình và trả lời câu hỏi.'}
                    {currentQuestion.part === 6 && 'Đọc đoạn văn và điền từ còn thiếu.'}
                    {currentQuestion.part === 7 && 'Đọc đoạn văn và trả lời câu hỏi.'}
                  </p>
                  <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full inline-block">
                    📖 Passage này có {questions.filter(q => q.passage_id === currentQuestion.passage_id).length} câu hỏi
                  </div>
                </div>
              </div>
            )}
            {/* Passage Questions - Show all questions in passage */}
            {currentQuestion.passage_id ? (
              <div className="space-y-6">
                {/* Audio and Image for the entire passage - shown once at the top */}
                {(() => {
                  const passageAudio = passageMap[currentQuestion.passage_id]?.audio_url;
                  const passageImage = passageMap[currentQuestion.passage_id]?.image_url;
                  const passageTranscript = passageMap[currentQuestion.passage_id]?.texts?.content;
                  
                  console.log(`ExamSession - Passage ${currentQuestion.passage_id} content:`, {
                    passageAudio,
                    passageImage,
                    passageTranscript,
                    passageData: passageMap[currentQuestion.passage_id]
                  });
                  
                  // For Part 3, 4: Show audio and image but no transcript
                  if ((currentQuestion.part === 3 || currentQuestion.part === 4) && (passageAudio || passageImage)) {
                    return (
                      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400">
                        <h4 className="text-lg font-semibold text-blue-900 mb-3">
                          📖 Nội dung Passage này
                        </h4>
                        
                        {/* Image for Passage */}
                        {passageImage && (
                          <div className="mb-4">
                            <div className="flex justify-center">
                              <img 
                                src={passageImage} 
                                alt="Passage Image" 
                                className="max-w-full h-auto rounded-lg shadow-md border border-gray-200"
                                style={{ maxHeight: '400px' }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Audio for Passage */}
                        {passageAudio && (
                          <div>
                            <SimpleAudioPlayer 
                              audioUrl={passageAudio}
                              transcript=""
                            />
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  // For other parts: Show full content
                  return (passageAudio || passageImage) && currentQuestion.part !== 7 && currentQuestion.part !== 6 && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">
                        📖 Nội dung Passage này
                      </h4>
                      
                      {/* Image for Passage */}
                      {passageImage && (
                        <div className="mb-4">
                          <div className="flex justify-center">
                            <img 
                              src={passageImage} 
                              alt="Passage Image" 
                              className="max-w-full h-auto rounded-lg shadow-md border border-gray-200"
                              style={{ maxHeight: '400px' }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Audio for Passage */}
                      {passageAudio && (
                        <div>
                          <SimpleAudioPlayer 
                            audioUrl={passageAudio}
                            transcript=""
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}
                
                {(() => {
                  const passageQuestions = questions.filter(q => q.passage_id === currentQuestion.passage_id);
                  return passageQuestions.map((question, questionIndex) => {
                    const globalIndex = questions.findIndex(q => q.id === question.id);
                    const questionAnswer = answers.get(question.id);
                    const isCurrentQuestion = globalIndex === currentIndex;
                    
                    return (
                      <div 
                        key={question.id} 
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          isCurrentQuestion 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Câu {globalIndex + 1}
                          </h3>
                          {questionAnswer && isSubmitted && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              questionAnswer.isCorrect 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {questionAnswer.isCorrect ? 'Đã trả lời đúng' : 'Đã trả lời sai'}
                            </span>
                          )}
                        </div>
                        
                        {/* Question Text */}
                        {question.prompt_text && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-900 font-medium">{question.prompt_text}</p>
                          </div>
                        )}
                        
                        {/* Choices for this question */}
                        <div className="space-y-2">
                          {Object.entries(question.choices || {})
                            .filter(([choiceLetter]) => {
                              if (question.part === 2) {
                                return ['A', 'B', 'C'].includes(choiceLetter);
                              }
                              return true;
                            })
                            .map(([choiceLetter, choiceText]) => {
                              const isSelected = questionAnswer?.answer === choiceLetter;
                              const isCorrect = question.correct_choice === choiceLetter;
                              const hasText = choiceText && choiceText.trim().length > 0;
                              
                              return (
                                <div
                                  key={choiceLetter}
                                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                    isSelected
                                      ? (isSubmitted && isCorrect 
                                          ? 'border-green-500 bg-green-50' 
                                          : isSubmitted && !isCorrect
                                          ? 'border-red-500 bg-red-50'
                                          : 'border-blue-500 bg-blue-50')
                                      : isSubmitted && isCorrect && questionAnswer
                                        ? 'border-green-300 bg-green-25'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                  }`}
                                  onClick={() => {
                                    if (!isSubmitted) {
                                      handleAnswerChange(question.id, choiceLetter);
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                      isSelected
                                        ? (isSubmitted && isCorrect 
                                            ? 'bg-green-500 text-white' 
                                            : isSubmitted && !isCorrect
                                            ? 'bg-red-500 text-white'
                                            : 'bg-blue-500 text-white')
                                        : isSubmitted && isCorrect && questionAnswer
                                          ? 'bg-green-300 text-white'
                                          : 'bg-gray-200 text-gray-700'
                                    }`}>
                                      {choiceLetter}
                                    </div>
                                    <span className={`text-sm ${
                                      isSelected 
                                        ? (isSubmitted && isCorrect ? 'text-green-800' : isSubmitted && !isCorrect ? 'text-red-800' : 'text-blue-800')
                                        : 'text-gray-700'
                                    }`}>
                                      {hasText ? choiceText : `Lựa chọn ${choiceLetter}`}
                                    </span>
                                    {isSelected && isSubmitted && (
                                      <span className="ml-auto text-xs font-medium">
                                        {isCorrect ? '✓ Đúng' : '✗ Sai'}
                                      </span>
                                    )}
                                    {!isSelected && isCorrect && questionAnswer && isSubmitted && (
                                      <span className="ml-auto text-xs font-medium text-green-600">
                                        ✓ Đáp án đúng
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              /* Single Question - Original logic for Part 1, 2 */
            <div className="space-y-3">
              {currentQuestion.part !== 1 && (
                <h3 className="text-md font-medium text-gray-700 mb-3">
                  Chọn đáp án:
                </h3>
              )}
              {Object.entries(currentQuestion.choices)
                .filter(([choiceLetter]) => {
                  // For Part 2, only show A, B, C
                  if (currentQuestion.part === 2) {
                    return ['A', 'B', 'C'].includes(choiceLetter);
                  }
                  return true;
                })
                .map(([choiceLetter, choiceText]) => {
                const isSelected = currentAnswer?.answer === choiceLetter;
                const hasText = choiceText && choiceText.trim().length > 0;
                
                return (
                  <label
                    key={choiceLetter}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? (isSubmitted && currentAnswer?.isCorrect 
                            ? 'border-green-500 bg-green-50' 
                            : isSubmitted && !currentAnswer?.isCorrect
                            ? 'border-red-500 bg-red-50'
                            : 'border-primary bg-primary/5')
                        : isSubmitted && currentQuestion.correct_choice === choiceLetter
                          ? 'border-green-300 bg-green-25'
                          : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={choiceLetter}
                      checked={isSelected}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected 
                        ? (isSubmitted && currentAnswer?.isCorrect
                            ? 'border-green-500 bg-green-500 text-white'
                            : isSubmitted && !currentAnswer?.isCorrect
                            ? 'border-red-500 bg-red-500 text-white'
                            : 'border-primary bg-primary text-primary-foreground')
                        : isSubmitted && currentQuestion.correct_choice === choiceLetter
                          ? 'border-green-300 bg-green-300 text-white'
                          : 'border-muted-foreground'
                    }`}>
                      {isSelected && <CheckCircle className="h-4 w-4" />}
                    </div>
                    <span className="font-medium">{choiceLetter}.</span>
                    {hasText ? (
                      <span className="flex-1">{choiceText}</span>
                    ) : (
                      <span className="flex-1 text-muted-foreground italic">
                        {currentQuestion.part === 1 ? 'Chọn đáp án này' : 
                         currentQuestion.part === 2 ? 'Chọn đáp án này' : 'Lựa chọn'}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            )}
          </div>
        </CardContent>
      </Card>
        {/* Navigation Buttons */}
        <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Câu trước
        </Button>

          <Button
            variant="outline"
            onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
            disabled={currentIndex === questions.length - 1}
          >
            Câu sau
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Right Side Navigation Panel */}
      <div className="w-80 bg-white border-l shadow-lg overflow-y-auto">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Câu hỏi</h3>
          
          {/* Group questions by part */}
          {(() => {
            const questionsByPart = questions.reduce((acc, question, index) => {
              const part = question.part;
              if (!acc[part]) {
                acc[part] = [];
              }
              acc[part].push({ ...question, index });
              return acc;
            }, {} as Record<number, Array<{ part: number; index: number }>>);

            return Object.entries(questionsByPart)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([part, partQuestions]) => (
                <div key={part} className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Part {part}
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    {partQuestions.map(({ index }) => {
                      const isAnswered = answers.has(questions[index].id);
                      const isCorrect = answers.get(questions[index].id)?.isCorrect;
                      const isCurrent = index === currentIndex;
                      
                      return (
                <Button
                  key={index}
                          variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentIndex(index)}
                          className={`h-8 w-8 p-0 text-xs font-medium ${
                            isCurrent 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : isAnswered 
                                ? (isSubmitted && isCorrect 
                                    ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' 
                                    : isSubmitted && !isCorrect
                                    ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                                    : 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200')
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                >
                  {index + 1}
                </Button>
                      );
                    })}
            </div>
          </div>
              ));
          })()}
        </div>
      </div>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận nộp bài</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Bạn có chắc chắn muốn nộp bài thi?</p>
            <div className="text-sm text-muted-foreground">
              <p>• Đã trả lời: {getAnsweredCount()} / {questions.length} câu</p>
              <p>• Thời gian còn lại: {formatTime(timeLeft)}</p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmitExam}>
                Nộp bài
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Results */}
      {isSubmitted && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Kết quả bài thi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{questions.length}</div>
                <div className="text-sm text-muted-foreground">Tổng câu hỏi</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Array.from(answers.values()).filter(a => a.isCorrect).length}
                </div>
                <div className="text-sm text-muted-foreground">Câu đúng</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {questions.length > 0 ? 
                    ((Array.from(answers.values()).filter(a => a.isCorrect).length / questions.length) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Độ chính xác</div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button onClick={() => navigate('/exam-sets')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Làm lại
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Xác nhận thoát bài thi
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Bạn có chắc chắn muốn thoát bài thi này không?</p>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Tiến độ hiện tại:</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Câu hỏi:</span>
                  <span className="font-medium">{currentIndex + 1}/{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Đã trả lời:</span>
                  <span className="font-medium">{getAnsweredCount()}/{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hoàn thành:</span>
                  <span className="font-medium">{Math.round(getProgress())}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian còn lại:</span>
                  <span className="font-medium">{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <p className="text-sm text-orange-800">
                  <strong>Lưu ý:</strong> Tiến độ sẽ được lưu tự động. Bạn có thể tiếp tục bài thi này sau.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={cancelExit}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmExit}>
              Thoát bài thi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamSession;
