/**
 * ExamSessionWithAutoSave
 * Phiên bản ExamSession với tính năng auto-save và resume
 */

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
  isCorrect?: boolean;
  timeSpent?: number;
}

type PassageLite = {
  passage_type?: 'single' | 'double' | 'triple'; // From DB
  texts: { 
    title?: string; 
    content?: string;      // Passage 1
    content2?: string;     // Passage 2 (double)
    content3?: string;     // Passage 3 (triple)
    img_url?: string;      // Image for passage 1
    img_url2?: string;     // Image for passage 2 (double)
    img_url3?: string;     // Image for passage 3 (triple)
    additional?: string;
  } | null;
  image_url: string | null;
  audio_url: string | null;
  meta?: {
    topic?: string;
    word_count?: number;
    reading_time?: number;
    start_question_number?: number | string;
  } | null;
};

const ExamSessionWithAutoSave = ({ examSetId }: ExamSessionProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedParts: number[] | undefined = (location.state as any)?.parts;
  const timeMode: TimeMode = (location.state as any)?.timeMode || 'standard';
  const { toast } = useToast();

  // Calculate correct TOEIC question number based on part
  const getTOEICQuestionNumber = (questionIndex: number) => {
    const question = questions[questionIndex];
    if (!question) return questionIndex + 1;
    
    const part = question.part;
    const partStartNumbers: Record<number, number> = {
      1: 1,   // Part 1: 1-6
      2: 7,   // Part 2: 7-31
      3: 32,  // Part 3: 32-70
      4: 71,  // Part 4: 71-100
      5: 101, // Part 5: 101-130
      6: 131, // Part 6: 131-146
      7: 147  // Part 7: 147-200
    };
    
    // For Part 6: Use start_question_number from passage metadata + blank_index
    if (part === 6 && question.passage_id && question.blank_index) {
      const passage = passageMap[question.passage_id];
      if (passage && passage.meta && (passage.meta as any).start_question_number) {
        const startNum = parseInt((passage.meta as any).start_question_number);
        return startNum + question.blank_index - 1;
      }
    }
    
    // For other parts: Count questions in the same part before this question
    const questionsInSamePart = questions.slice(0, questionIndex + 1).filter(q => q.part === part);
    const questionInPartIndex = questionsInSamePart.length - 1;
    
    return partStartNumbers[part] + questionInPartIndex;
  };
  
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
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      
      // Also save to database if session exists
      await supabase
        .from('exam_sessions')
        .update({
          time_spent: (examSet?.time_limit || 0) * 60 - timeLeft,
          updated_at: new Date().toISOString(),
          results: {
            current_index: currentIndex,
            time_left: timeLeft,
            answers: Array.from(answers.entries()).map(([key, value]) => [key, { ...value }])
          } as any
        })
        .eq('id', sessionId);

      console.log('Auto-save completed');
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }, [sessionId, isStarted, currentIndex, answers, timeLeft, examSet]);

  // Start auto-save
  const startAutoSave = useCallback(() => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
    }
    
    const interval = setInterval(autoSave, 30000); // Auto-save every 30 seconds
    setAutoSaveInterval(interval);
  }, [autoSave]);

  // Stop auto-save
  const stopAutoSave = useCallback(() => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
      setAutoSaveInterval(null);
    }
  }, [autoSaveInterval]);

  // Check for existing session
  const checkForExistingSession = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check for in-progress sessions
      const { data: sessions } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('exam_set_id', examSetId)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessions && sessions.length > 0) {
        const session = sessions[0];
        const savedProgress = localStorage.getItem(`exam_progress_${session.id}`);
        
        if (savedProgress) {
          const progressData = JSON.parse(savedProgress);
          
          // Show resume dialog
          const shouldResume = window.confirm(
            `Bạn có một bài thi đang làm dở cho "${examSet?.title || 'Bài thi này'}". ` +
            `Tiến độ: ${progressData.currentIndex + 1}/${questions.length} câu hỏi. ` +
            `Bạn có muốn tiếp tục không?`
          );

          if (shouldResume) {
            // Resume session
            setSessionId(session.id);
            setCurrentIndex(progressData.currentIndex);
            setTimeLeft(progressData.timeLeft);
            setIsStarted(true);
            
            // Restore answers
            const restoredAnswers = new Map<string, ExamAnswer>(progressData.answers);
            setAnswers(restoredAnswers);
            
            toast({
              title: "Đã khôi phục bài thi",
              description: "Tiếp tục từ nơi bạn đã dừng lại.",
            });
            
            return true;
          } else {
            // Cancel old session
            await supabase
              .from('exam_sessions')
              .update({ status: 'cancelled' })
              .eq('id', session.id);
            
            localStorage.removeItem(`exam_progress_${session.id}`);
          }
        }
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
    }
    
    return false;
  }, [examSetId, examSet, questions.length, toast]);

  useEffect(() => {
    fetchExamData();
    checkIfCompleted();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examSetId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStarted, isPaused, timeLeft, timeMode]);

  // Start auto-save when exam starts
  useEffect(() => {
    if (isStarted && sessionId) {
      startAutoSave();
    } else {
      stopAutoSave();
    }

    return () => stopAutoSave();
  }, [isStarted, sessionId, startAutoSave, stopAutoSave]);

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isStarted && !isSubmitted) {
        e.preventDefault();
        e.returnValue = 'Bạn có chắc chắn muốn thoát? Tiến độ bài thi sẽ được lưu tự động.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isStarted, isSubmitted]);

  const checkIfCompleted = async () => {
    try {
      console.log('Checking if exam completed for examSetId:', examSetId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: completedSession } = await supabase
        .from('exam_sessions')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('exam_set_id', examSetId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (completedSession) {
        console.log('Found completed session:', completedSession.id);
        setHasCompleted(true);
        setSessionId(completedSession.id);
      }
    } catch (error) {
      console.log('No completed session found or error:', error);
    }
  };

  const fetchExamData = async () => {
    try {
      setLoading(true);
      console.log('Fetching exam data for examSetId:', examSetId);

      // Fetch exam set
      const { data: examSetData, error: examSetError } = await supabase
        .from('exam_sets')
        .select('*')
        .eq('id', examSetId)
        .single();

      if (examSetError) {
        console.error('Exam set error:', examSetError);
        throw examSetError;
      }

      console.log('Exam set data:', examSetData);
      setExamSet(examSetData as any);

      // Check for existing session before fetching questions
      const hasExistingSession = await checkForExistingSession();
      if (hasExistingSession) {
        setLoading(false);
        return;
      }

      // Fetch questions based on selected parts
      let questionsQuery = supabase
        .from('questions')
        .select(`
          *,
          passages (*)
        `)
        .eq('status', 'published'); // Only get published questions

      if (selectedParts && selectedParts.length > 0) {
        questionsQuery = questionsQuery.in('part', selectedParts);
        console.log('Filtering by selected parts:', selectedParts);
      }

      const { data: questionsData, error: questionsError } = await questionsQuery;

      if (questionsError) {
        console.error('Questions error:', questionsError);
        setError('Không thể tải câu hỏi: ' + questionsError.message);
        setLoading(false);
        return;
      }

      if (!questionsData || questionsData.length === 0) {
        console.error('No questions found');
        setError('Không tìm thấy câu hỏi nào cho bài thi này');
        setLoading(false);
        return;
      }

      console.log('Questions data:', questionsData);
      
      // Order questions by part and question number
      let orderedQuestions = (questionsData as any[] || []).sort((a, b) => {
        if (a.part !== b.part) {
          return a.part - b.part;
        }
        return a.question_number - b.question_number;
      });

      // Build passage map first (needed for sorting)
      const tempPassageMap: Record<string, PassageLite> = {};
      orderedQuestions.forEach(question => {
        if (question.passage_id && question.passages) {
          tempPassageMap[question.passage_id] = {
            passage_type: question.passages.passage_type || undefined,
            texts: question.passages.texts,
            image_url: question.passages.image_url,
            audio_url: question.passages.audio_url,
            meta: question.passages.meta || null
          };
        }
      });

      // CRITICAL FIX: Always ensure Part 3, 4, 6 & 7 passage integrity (regardless of filtering)
      const part3Questions = orderedQuestions.filter(q => q.part === 3);
      const part4Questions = orderedQuestions.filter(q => q.part === 4);
      const part6Questions = orderedQuestions.filter(q => q.part === 6);
      const part7Questions = orderedQuestions.filter(q => q.part === 7);
      const otherQuestions = orderedQuestions.filter(q => q.part !== 3 && q.part !== 4 && q.part !== 6 && q.part !== 7);

      // Function to sort passage-based questions (Part 3, 4, 6 & 7)
      const sortPassageQuestions = (questions: any[], sortByBlankIndex: boolean = false) => {
        const passageGroups: Record<string, any[]> = {};
        questions.forEach(q => {
          if (q.passage_id) {
            if (!passageGroups[q.passage_id]) {
              passageGroups[q.passage_id] = [];
            }
            passageGroups[q.passage_id].push(q);
          }
        });

        // Sort questions within each passage
        Object.keys(passageGroups).forEach(passageId => {
          passageGroups[passageId].sort((a, b) => {
            if (sortByBlankIndex) {
              const aBlankIndex = a.blank_index || 0;
              const bBlankIndex = b.blank_index || 0;
              if (aBlankIndex !== bBlankIndex) {
                return aBlankIndex - bBlankIndex;
              }
            }
            return (a.question_number || 0) - (b.question_number || 0);
          });
        });

        // Sort passages by start_question_number
        const sortedPassageIds = Object.keys(passageGroups).sort((aId, bId) => {
          const aPassage = tempPassageMap[aId];
          const bPassage = tempPassageMap[bId];
          
          if (aPassage?.meta && bPassage?.meta) {
            const aStart = parseInt((aPassage.meta as any).start_question_number || '999');
            const bStart = parseInt((bPassage.meta as any).start_question_number || '999');
            if (aStart !== bStart) return aStart - bStart;
          }
          
          const aFirstNum = passageGroups[aId][0].question_number || 0;
          const bFirstNum = passageGroups[bId][0].question_number || 0;
          return aFirstNum - bFirstNum;
        });

        const sortedQuestions: any[] = [];
        sortedPassageIds.forEach(passageId => {
          sortedQuestions.push(...passageGroups[passageId]);
        });
        return sortedQuestions;
      };

      // Sort Part 3, 4, 6, 7 questions by passage
      const sortedPart3 = part3Questions.length > 0 ? sortPassageQuestions(part3Questions, false) : [];
      const sortedPart4 = part4Questions.length > 0 ? sortPassageQuestions(part4Questions, false) : [];
      const sortedPart6 = part6Questions.length > 0 ? sortPassageQuestions(part6Questions, true) : [];
      const sortedPart7 = part7Questions.length > 0 ? sortPassageQuestions(part7Questions, false) : [];

      console.log('✅ Part 3 sorted:', sortedPart3.length, 'questions');
      console.log('✅ Part 4 sorted:', sortedPart4.length, 'questions');
      console.log('✅ Part 6 sorted:', sortedPart6.length, 'questions');
      console.log('✅ Part 7 sorted:', sortedPart7.length, 'questions');

      // Reconstruct with proper order: Part 1-2 → Part 3 → Part 4 → Part 5 → Part 6 → Part 7
      const part1to2 = otherQuestions.filter(q => (q.part as number) < 3);
      const part5 = otherQuestions.filter(q => q.part === 5);
      orderedQuestions = [...part1to2, ...sortedPart3, ...sortedPart4, ...part5, ...sortedPart6, ...sortedPart7];

      // Filter by selected parts if needed
      if (selectedParts && selectedParts.length > 0) {
        console.log('🎯 Selected parts:', selectedParts);
        orderedQuestions = orderedQuestions.filter(q => selectedParts.includes(q.part as number));
        
        // Ensure complete passages for Part 3, 4, 6 & 7
        if (selectedParts.includes(3) || selectedParts.includes(4) || selectedParts.includes(6) || selectedParts.includes(7)) {
          const filteredQuestions: any[] = [];
          const processedPassages = new Set<string>();

          orderedQuestions.forEach(q => {
            if ((q.part === 3 || q.part === 4 || q.part === 6 || q.part === 7) && q.passage_id) {
              if (!processedPassages.has(q.passage_id)) {
                const passageQuestions = orderedQuestions.filter(pq => pq.passage_id === q.passage_id);
                const allPassageQuestions = [...part3Questions, ...part4Questions, ...part6Questions, ...part7Questions].filter(pq => pq.passage_id === q.passage_id);
                
                if (passageQuestions.length === allPassageQuestions.length) {
                  filteredQuestions.push(...passageQuestions);
                }
                processedPassages.add(q.passage_id);
              }
            } else {
              filteredQuestions.push(q);
            }
          });

          orderedQuestions = filteredQuestions;
        }
      }

      console.log('🔍 Final question order:', orderedQuestions.map((q, idx) => ({
        index: idx,
        part: q.part,
        passage_id: q.passage_id?.substring(0, 8),
        blank_index: q.blank_index
      })));

      setQuestions(orderedQuestions);
      setPassageMap(tempPassageMap);

      // Calculate time limit based on actual question count
      console.log('Time calculation:', { 
        timeMode, 
        selectedParts, 
        examSetTimeLimit: examSetData.time_limit,
        examSetQuestionCount: examSetData.question_count,
        actualQuestionCount: orderedQuestions.length
      });
      
      if (timeMode === 'unlimited') {
        setTimeLeft(-1);
        console.log('Set unlimited time');
      } else if (selectedParts && selectedParts.length > 0) {
        // Calculate time based on actual question count in selected parts
        const timePerQuestion = examSetData.time_limit / examSetData.question_count;
        const totalMinutes = Math.round(orderedQuestions.length * timePerQuestion);
        console.log(`Calculated time: ${orderedQuestions.length} questions × ${timePerQuestion.toFixed(2)} min/question = ${totalMinutes} minutes`);
        setTimeLeft(Math.max(1, totalMinutes) * 60);
      } else {
        console.log('Using exam set time limit:', examSetData.time_limit);
        setTimeLeft(examSetData.time_limit * 60);
      }
      
      console.log('Exam data loaded successfully');
      console.log('Final questions count:', orderedQuestions.length);
      
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

  const startExam = () => {
    setIsStarted(true);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => new Map(prev.set(questionId, {
      questionId,
      answer,
      isCorrect: false // Will be calculated on submit
    })));
  };

  const handleSubmitExam = async () => {
    if (questions.length === 0) return;

    setIsSubmitted(true);
    stopAutoSave();
    
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
          answer.isCorrect = answer.answer === correct;
          finalAnswers.set(question.id, answer);
        }
      });

      setAnswers(finalAnswers);

      // Calculate results
      const totalQuestions = questions.length;
      const correctAnswers = Array.from(finalAnswers.values()).filter(a => a.isCorrect).length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      
      // Calculate actual time spent based on actual question count
      let timeSpent = 0;
      if (timeMode === 'unlimited') {
        timeSpent = 0;
      } else if (selectedParts && selectedParts.length > 0 && examSet) {
        // Calculate time spent based on actual question count
        const timePerQuestion = examSet.time_limit / examSet.question_count;
        const totalMinutes = Math.round(questions.length * timePerQuestion);
        const totalSeconds = totalMinutes * 60;
        timeSpent = Math.max(0, totalSeconds - timeLeft);
      } else {
        timeSpent = Math.max(0, (examSet?.time_limit || 0) * 60 - timeLeft);
      }

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
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      console.log('Session created successfully:', sessionData.id);
      setSessionId(sessionData.id);

      // Create exam attempts
      const attempts = Array.from(finalAnswers.values()).map(answer => ({
        session_id: sessionData.id,
        question_id: answer.questionId,
        user_answer: answer.answer,
        is_correct: answer.isCorrect,
        time_spent: answer.timeSpent || 0
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

      console.log('Attempts created successfully');

      toast({
        title: "Hoàn thành bài thi",
        description: `Kết quả: ${correctAnswers}/${totalQuestions} câu đúng (${score}%)`,
      });

      setShowSubmitDialog(false);
      
      // Clean up localStorage
      if (sessionId) {
        localStorage.removeItem(`exam_progress_${sessionId}`);
      }
      
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

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = async () => {
    setShowExitDialog(false);
    
    // Save current progress
    await autoSave();
    
    toast({
      title: "Đã lưu tiến độ",
      description: "Bạn có thể tiếp tục bài thi sau.",
    });
    
    navigate('/exam-sets');
  };

  const cancelExit = () => {
    setShowExitDialog(false);
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

  if (loading) {
    console.log('ExamSession - Loading state');
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (hasCompleted) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Bài thi đã hoàn thành</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-6">
                Bạn đã hoàn thành bài thi này rồi.
              </p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button onClick={() => navigate(`/exam-result/${sessionId}`)}>
                <Eye className="h-4 w-4 mr-2" />
                Xem kết quả
              </Button>
              <Button variant="outline" onClick={() => navigate('/exam-sets')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!examSet || questions.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Không tìm thấy bài thi hoặc câu hỏi.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.get(currentQuestion?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleExit}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Thoát
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{examSet.title}</h1>
              <p className="text-sm text-gray-600">
                {selectedParts ? `Part ${selectedParts.join(', ')}` : 'Tất cả các part'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {timeMode === 'standard' && timeLeft > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Thời gian còn lại</div>
                <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            )}
            {!isStarted ? (
              <Button onClick={startExam}>
                <Play className="h-4 w-4 mr-2" />
                Bắt đầu thi
              </Button>
            ) : (
              <Button onClick={() => setShowSubmitDialog(true)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Nộp bài
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-screen">
        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {currentQuestion && (
            <div className="max-w-4xl mx-auto">
              {/* Question Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge className={currentQuestion.part <= 4 ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-green-600 bg-green-50 border-green-200'}>
                      Part {currentQuestion.part}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Câu {currentIndex + 1} / {questions.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentAnswer?.answer && (
                      <Badge variant="outline">
                        Đã trả lời: {currentAnswer.answer}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Tiến độ: {currentIndex + 1}/{questions.length} câu
                  </div>
                  <div className="text-sm text-gray-600">
                    {getAnsweredCount()}/{questions.length} câu đã trả lời
                  </div>
                </div>
                <Progress 
                  value={getProgress()} 
                  className="mt-2 h-2"
                />
              </div>

              {/* Question Content */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  {/* Audio Player */}
                  {currentQuestion.audio_url && (
                    <div className="mb-6">
                      <SimpleAudioPlayer 
                        audioUrl={currentQuestion.audio_url} 
                        transcript={currentQuestion.transcript || ''} 
                      />
                    </div>
                  )}

                  {/* Question Image */}
                  {currentQuestion.image_url && (
                    <div className="mb-6 text-center">
                      <img 
                        src={currentQuestion.image_url} 
                        alt="Question image" 
                        className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                  )}

                  {/* Question Text */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Câu hỏi:</h3>
                    <p className="text-gray-800 leading-relaxed text-lg">
                      {currentQuestion.prompt_text}
                    </p>
                  </div>

                  {/* Choices */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-lg">Các lựa chọn:</h4>
                    {(currentQuestion.part === 2 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D']).map((choice) => {
                      const choices = currentQuestion.choices as unknown;
                      const choiceText = choices?.[choice] || '';
                      const isSelected = currentAnswer?.answer === choice;
                      
                      return (
                        <div
                          key={choice}
                          className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => handleAnswerChange(currentQuestion.id, choice)}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                                isSelected
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {choice}
                            </div>
                            <span className="flex-1 text-lg">{choiceText}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
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
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-4 lg:p-6 overflow-y-auto max-h-96 lg:max-h-none">
          <div className="space-y-6">
            {/* Progress Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tiến độ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {getAnsweredCount()}/{questions.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Câu đã trả lời</div>
                  </div>
                  
                  <Progress 
                    value={getProgress()} 
                    className="h-2"
                  />
                  
                  <div className="text-center text-sm text-muted-foreground">
                    {Math.round(getProgress())}% hoàn thành
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Navigation */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Câu hỏi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question, index) => {
                    const answer = answers.get(question.id);
                    const isAnswered = answer?.answer;
                    const isCurrent = index === currentIndex;
                    
                    return (
                      <button
                        key={question.id}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : isAnswered
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {getTOEICQuestionNumber(index)}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận nộp bài</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Bạn có chắc chắn muốn nộp bài thi này không?</p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tổng câu hỏi:</span> {questions.length}
                </div>
                <div>
                  <span className="font-medium">Đã trả lời:</span> {getAnsweredCount()}
                </div>
                <div>
                  <span className="font-medium">Chưa trả lời:</span> {questions.length - getAnsweredCount()}
                </div>
                <div>
                  <span className="font-medium">Thời gian còn lại:</span> {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmitExam}>
              Nộp bài
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

export default ExamSessionWithAutoSave;
