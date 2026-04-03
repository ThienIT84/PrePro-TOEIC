import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  ArrowRight,
  Flag,
  BookOpen,
  Headphones,
  MessageSquare,
  Users,
  FileText,
  FileCheck,
  Target,
  Zap,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { toeicQuestionGenerator, TOEICQuestion, ExamConfig } from '@/services/toeicQuestionGenerator';
import { useExamQuestions } from '@/hooks/useExamQuestions';
import { TimeMode } from '@/types';

// Remove duplicate interfaces - using from toeicQuestionGenerator

const ExamSession = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { examSetId } = useParams<{ examSetId: string }>();
  
  const [examConfig, setExamConfig] = useState<ExamConfig | null>(null);
  const [questions, setQuestions] = useState<TOEICQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(-1); // -1 means not started yet
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const timeMode: TimeMode = (location.state as any)?.timeMode || 'standard';

  // Use React Query for caching
  const { data: cachedQuestions, isLoading: isLoadingQuestions } = useExamQuestions(
    examConfig || { type: 'full', examSetId },
    !!examConfig // Only fetch when config is ready
  );

  useEffect(() => {
    const fetchExamSetAndSetConfig = async () => {
      const urlParams = new URLSearchParams(location.search);
      const type = urlParams.get('type') || 'custom';
      const state = location.state as any;
      
      // If we have examSetId, use exam set configuration
      if (examSetId) {
        try {
          // Fetch exam set data if not provided in state
          const examSet = state?.examSet || await (async () => {
            const { data, error } = await supabase
              .from('exam_sets')
              .select('*')
              .eq('id', examSetId)
              .single();
            
            if (error) throw error;
            return data;
          })();
          
          console.log('📋 Exam set loaded:', examSet);
          
          const config: ExamConfig = {
            type: state?.parts && state.parts.length < 7 ? 'custom' : 'full',
            parts: state?.parts?.map((p: number) => p) || [1, 2, 3, 4, 5, 6, 7],
            questionCount: examSet.question_count || examSet.total_questions,
            timeLimit: examSet.time_limit,
            failedQuestionIds: state?.failedQuestionIds || [],
            examSetId: examSetId
          };
          
          console.log('⚙️ Exam config created:', config);
          setExamConfig(config);
          // Questions will be loaded by React Query hook
        } catch (error) {
          console.error('❌ Error fetching exam set:', error);
          toast({
            title: 'Lỗi',
            description: 'Không thể tải thông tin đề thi',
            variant: 'destructive'
          });
          navigate('/exam-sets');
        }
      } else {
        // Original logic for mini/custom tests without examSetId
        const config: ExamConfig = {
          type: type as any,
          parts: state?.parts?.map((p: string) => parseInt(p)) || [],
          questionCount: state?.testConfig?.questionCount || 50,
          timeLimit: state?.testConfig?.timeLimit || 45,
          failedQuestionIds: state?.failedQuestionIds || []
        };
        
        setExamConfig(config);
        // Questions will be loaded by React Query hook
      }
    };
    
    fetchExamSetAndSetConfig();
  }, [location, examSetId, navigate, toast]);

  useEffect(() => {
    console.log(`🕐 Timer effect: timeLeft=${timeLeft}, isPaused=${isPaused}, isCompleted=${isCompleted}, timeMode=${timeMode}`);
    
    // Only start timer if time mode is standard and timeLeft > 0 (not -1 which means not started)
    if (timeMode === 'standard' && timeLeft > 0 && !isPaused && !isCompleted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeMode === 'standard' && timeLeft === 0 && !isCompleted) {
      console.log('⏰ Time up! Submitting exam...');
      handleSubmitExam();
    }
  }, [timeLeft, isPaused, isCompleted, timeMode]);

  // Load questions from React Query cache or fetch
  useEffect(() => {
    if (cachedQuestions && examConfig) {
      console.log(`✅ Using cached/fetched questions: ${cachedQuestions.length} total`);
      console.log(`📍 Current state - questions.length: ${questions.length}, timeLeft: ${timeLeft}`);
      
      // Debug: Check for duplicate IDs
      const questionIds = cachedQuestions.map(q => q.id);
      const uniqueIds = new Set(questionIds);
      if (questionIds.length !== uniqueIds.size) {
        console.warn('⚠️ Duplicate question IDs detected!', {
          total: questionIds.length,
          unique: uniqueIds.size,
          duplicates: questionIds.length - uniqueIds.size
        });
      }
      
      setQuestions(cachedQuestions);
      console.log(`📝 Questions set in state: ${cachedQuestions.length} questions`);
      
      // Only set initial time, don't reset if already started
      if (timeLeft === -1) {
        // Set time based on time mode
        if (timeMode === 'unlimited') {
          // Keep as -1 for unlimited time until user clicks start
          console.log(`⏰ Unlimited time mode for ${cachedQuestions.length} questions`);
        } else {
          // Keep as -1 until user clicks start button
          console.log(`⏰ Standard time mode ready: ${(examConfig.timeLimit || 0) * 60} seconds for ${cachedQuestions.length} questions`);
        }
      } else {
        console.log(`⏰ Timer already running: ${timeLeft} seconds remaining`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cachedQuestions, examConfig, timeMode]);

  // Remove generateMockQuestions - now using toeicQuestionGenerator

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleSubmitExam = async () => {
    setIsCompleted(true);
    setIsPaused(true);
    
    // Calculate score
    const correctAnswers = questions.filter(q => answers[q.id] === q.correct_answer).length;
    const score = Math.round((correctAnswers / questions.length) * 100);
    
    // Save exam session
    try {
      const { error } = await supabase
        .from('exam_sessions')
        .insert({
          user_id: user?.id,
          exam_set_id: null, // In real implementation, you'd have exam sets
          total_questions: questions.length,
          correct_answers: correctAnswers,
          score,
          time_spent: (examConfig?.timeLimit || 0) * 60 - timeLeft,
          status: 'completed',
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Hoàn thành!',
        description: `Bạn đã hoàn thành bài thi với điểm số ${score}%`
      });

      // Navigate to results page
      navigate('/exam-result', { 
        state: { 
          score, 
          totalQuestions: questions.length,
          correctAnswers,
          timeTaken: (examConfig?.timeLimit || 0) * 60 - timeLeft
        } 
      });
    } catch (error) {
      console.error('Error saving exam session:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu kết quả bài thi.',
        variant: 'destructive'
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getPartIcon = (part: number) => {
    switch (part) {
      case 1: return <Headphones className="h-4 w-4" />;
      case 2: return <MessageSquare className="h-4 w-4" />;
      case 3: return <Users className="h-4 w-4" />;
      case 4: return <FileText className="h-4 w-4" />;
      case 5: return <CheckCircle className="h-4 w-4" />;
      case 6: return <FileCheck className="h-4 w-4" />;
      case 7: return <BookOpen className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getPartColor = (part: number) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-red-100 text-red-800'
    ];
    return colors[(part - 1) % colors.length];
  };

  // Show loading while fetching questions or if no questions loaded
  if (isLoadingQuestions || !examConfig || questions.length === 0) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
            </div>
            <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
          </div>

          {/* Progress Skeleton */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
            </div>
            <div className="h-2 bg-muted rounded w-full animate-pulse"></div>
          </div>

          {/* Loading Message */}
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Đang tải câu hỏi...</h3>
                  <p className="text-sm text-muted-foreground">
                    {isLoadingQuestions ? 'Đang tải từ database...' : 'Đang khởi tạo...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Card Skeleton */}
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-40 animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show start screen if timer hasn't started yet
  if (timeLeft === -1) {
    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {examConfig?.type === 'full' ? 'FULL TEST' :
               examConfig?.type === 'mini' ? 'MINI TEST' :
               examConfig?.type === 'custom' ? 'CUSTOM TEST' :
               'RETRY FAILED QUESTIONS'}
            </CardTitle>
            <CardDescription>
              Sẵn sàng bắt đầu làm bài thi?
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-muted rounded">
                <div className="font-semibold">Số câu hỏi</div>
                <div className="text-2xl font-bold text-primary">{questions.length}</div>
              </div>
              <div className="p-3 bg-muted rounded">
                <div className="font-semibold">Thời gian</div>
                <div className="text-2xl font-bold text-primary">{examConfig?.timeLimit} phút</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Hướng dẫn:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li>• Chọn đáp án A, B, C, hoặc D cho mỗi câu hỏi</li>
                <li>• Sử dụng nút "Tiếp theo" để chuyển câu</li>
                <li>• Có thể tạm dừng và tiếp tục bất kỳ lúc nào</li>
                <li>• Bài thi sẽ tự động nộp khi hết thời gian</li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/exam-selection')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <Button onClick={() => setTimeLeft((examConfig?.timeLimit || 0) * 60)}>
                <Play className="h-4 w-4 mr-2" />
                Bắt đầu làm bài
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">Bài thi đã hoàn thành!</CardTitle>
            <CardDescription>
              Cảm ơn bạn đã hoàn thành bài thi
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold text-primary">
              {Math.round((Object.values(answers).filter((answer, index) => 
                answer === questions[index]?.correct_answer
              ).length / questions.length) * 100)}%
            </div>
            <p className="text-muted-foreground">
              {Object.values(answers).filter((answer, index) => 
                answer === questions[index]?.correct_answer
              ).length} / {questions.length} câu đúng
            </p>
            <Button onClick={() => navigate('/exam-selection')}>
              Quay lại chọn bài thi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  // Safety check: if no current question, show loading
  if (!currentQuestion) {
    console.warn('⚠️ No current question found at index:', currentQuestionIndex, 'Total questions:', questions.length);
    return (
      <div className="p-6">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p>Đang tải câu hỏi...</p>
              <p className="text-sm text-muted-foreground">
                Questions: {questions.length}, Index: {currentQuestionIndex}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const currentPart = currentQuestion.part || 1;
  const isListening = currentPart <= 4;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-3 border-b">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/exam-selection')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {examConfig?.type === 'full' ? 'FULL TEST' :
               examConfig?.type === 'mini' ? 'MINI TEST' :
               examConfig?.type === 'custom' ? 'CUSTOM TEST' :
               'RETRY FAILED QUESTIONS'}
            </h1>
            <p className="text-muted-foreground">
              Câu {currentQuestionIndex + 1} / {questions.length} • Part {currentPart} {isListening ? '(Listening)' : '(Reading)'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {timeMode === 'unlimited' ? (
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                Không giới hạn
              </div>
              <div className="text-sm text-muted-foreground">Thời gian tự do</div>
            </div>
          ) : timeLeft > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-muted-foreground">Thời gian còn lại</div>
            </div>
          )}
          {timeMode === 'standard' && timeLeft > 0 && (
            <Button variant="outline" onClick={handlePauseResume}>
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Tiến độ</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={getPartColor(currentQuestion.part)}>
                {getPartIcon(currentQuestion.part)}
                <span className="ml-1">Part {currentQuestion.part}</span>
              </Badge>
              <Badge variant="outline">
                {currentQuestion.type === 'listening' ? 'Listening' : 'Reading'}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFlagQuestion(currentQuestion.id)}
            >
              <Flag className={`h-4 w-4 ${flaggedQuestions.has(currentQuestion.id) ? 'text-red-500' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question */}
          <div className="text-lg">
            {currentQuestion.question}
          </div>

          {/* Audio Player (for listening questions) */}
          {currentQuestion.type === 'listening' && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                <span className="font-medium">Audio Player</span>
              </div>
              <div className="mt-2">
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Phát audio
                </Button>
              </div>
            </div>
          )}

          {/* Choices */}
          <div className="space-y-3">
            {currentQuestion.choices.map((choice, index) => {
              const letter = String.fromCharCode(65 + index); // A, B, C, D
              const isSelected = answers[currentQuestion.id] === letter;
              
              return (
                <button
                  key={index}
                  className={`w-full p-4 text-left border rounded-lg transition-colors ${
                    isSelected 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => handleAnswerSelect(currentQuestion.id, letter)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : 'border-muted'
                    }`}>
                      {isSelected && <CheckCircle className="h-4 w-4" />}
                    </div>
                    <span className="font-medium">{letter}.</span>
                    <span>{choice}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0 || isListening}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Câu trước
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(0)}
            disabled={currentQuestionIndex === 0 || isListening}
          >
            Đầu
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(questions.length - 1)}
            disabled={currentQuestionIndex === questions.length - 1 || isListening}
          >
            Cuối
          </Button>
        </div>

        {currentQuestionIndex === questions.length - 1 ? (
          <Button onClick={handleSubmitExam} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Nộp bài
          </Button>
        ) : (
          <Button onClick={handleNextQuestion}>
            Câu tiếp
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Question List (hidden during Listening like the real test) */}
      {!isListening && (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh sách câu hỏi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-sm text-muted-foreground">
            Tổng cộng: {questions.length} câu hỏi
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-1">
                Debug: {questions.map((q, i) => `${i + 1}:${q.id.substring(0, 8)}`).join(', ')}
              </div>
            )}
          </div>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((question, index) => {
              const isAnswered = answers[question.id];
              const isFlagged = flaggedQuestions.has(question.id);
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={question.id}
                  className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                    isCurrent 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : isAnswered
                      ? 'border-green-500 bg-green-100 text-green-800'
                      : isFlagged
                      ? 'border-red-500 bg-red-100 text-red-800'
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => {
                    if (!isListening) setCurrentQuestionIndex(index);
                  }}
                  title={`Câu ${index + 1} - Part ${question.part} - ${question.id.substring(0, 8)}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
};

export default ExamSession;
