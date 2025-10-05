import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  RotateCcw,
  Headphones,
  FileText,
  BookOpen,
  Eye,
  Flag,
  Pause
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ExamSet, Question } from '@/types';
import SimpleAudioPlayer from './SimpleAudioPlayer';

interface ExamReviewProps {
  sessionId: string;
}

const ExamReview: React.FC<ExamReviewProps> = ({ sessionId }) => {
  const navigate = useNavigate();
  const [examSession, setExamSession] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examSet, setExamSet] = useState<ExamSet | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExamData();
  }, [sessionId]);

  const fetchExamData = async () => {
    try {
      console.log('Fetching exam data for session:', sessionId);
      
      // Fetch exam session
      const { data: sessionData, error: sessionError } = await supabase
        .from('exam_sessions')
        .select(`
          *,
          exam_sets (*)
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      console.log('Session data:', sessionData);
      setExamSession(sessionData);
      setExamSet(sessionData.exam_sets as any);

      // Fetch questions for this exam through exam_questions table
      const { data: examQuestionsData, error: examQuestionsError } = await supabase
        .from('exam_questions')
        .select(`
          question_id,
          order_index,
          questions (
            *,
            passages (*)
          )
        `)
        .eq('exam_set_id', sessionData.exam_set_id)
        .order('order_index', { ascending: true });

      if (examQuestionsError) {
        console.error('Exam questions error:', examQuestionsError);
        throw examQuestionsError;
      }

      // Extract questions from the joined data
      const questionsData = examQuestionsData?.map(eq => eq.questions).filter(Boolean) || [];

      console.log('Questions data:', questionsData);
      setQuestions(questionsData as any || []);

      // Fetch user answers from exam_attempts
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('exam_attempts')
        .select('question_id, user_answer')
        .eq('session_id', sessionId);

      if (attemptsError) {
        console.error('Attempts error:', attemptsError);
        throw attemptsError;
      }

      // Convert attempts to answers object
      const answers: Record<string, string> = {};
      attemptsData?.forEach(attempt => {
        answers[attempt.question_id] = attempt.user_answer || '';
      });
      setUserAnswers(answers);
    } catch (error) {
      console.error('Error fetching exam data:', error);
      setError('Không thể tải dữ liệu bài thi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getPartColor = (part: number) => {
    if (part <= 4) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getPartIcon = (part: number) => {
    if (part <= 4) return Headphones;
    return FileText;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? userAnswers[currentQuestion.id] : null;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-muted rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Có lỗi xảy ra</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()}>
              Thử lại
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!examSession || !examSet) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy bài thi</h1>
          <p className="text-gray-600 mb-6">Bài thi này có thể đã bị xóa hoặc không tồn tại.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const correctAnswers = questions.filter(question => {
    const userAnswer = userAnswers[question.id];
    return userAnswer === question.correct_choice;
  }).length;

  // Group questions by part
  const questionsByPart = questions.reduce((acc, question, index) => {
    const part = question.part;
    if (!acc[part]) {
      acc[part] = [];
    }
    acc[part].push({ ...question, originalIndex: index });
    return acc;
  }, {} as Record<number, Array<Question & { originalIndex: number }>>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Giống ExamSession */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Xem lại bài thi</h1>
              <p className="text-sm text-gray-600">{examSet.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Điểm số</div>
              <div className={`text-2xl font-bold ${getScoreColor(examSession.score)}`}>
                {examSession.score}%
              </div>
            </div>
            <Button onClick={() => navigate(`/exam-sets/${examSet.id}/take`)}>
              <Play className="h-4 w-4 mr-2" />
              Làm lại
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Main Content - Giống ExamSession */}
        <div className="flex-1 p-6 overflow-y-auto">
          {currentQuestion && (
            <div className="max-w-4xl mx-auto">
              {/* Question Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge className={getPartColor(currentQuestion.part)}>
                      Part {currentQuestion.part}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Câu {currentQuestionIndex + 1} / {totalQuestions}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentAnswer === currentQuestion.correct_choice ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Tiến độ: {currentQuestionIndex + 1}/{totalQuestions} câu
                  </div>
                  <div className="text-sm text-gray-600">
                    {correctAnswers}/{totalQuestions} câu đúng
                  </div>
                </div>
                <Progress 
                  value={((currentQuestionIndex + 1) / totalQuestions) * 100} 
                  className="mt-2 h-2"
                />
              </div>

              {/* Passage Content for Part 3, 4, 6, 7 */}
              {(currentQuestion.part === 3 || currentQuestion.part === 4 || currentQuestion.part === 6 || currentQuestion.part === 7) && currentQuestion.passage_id && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Passage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Passage Audio */}
                    {(currentQuestion as any).passages?.audio_url && (
                      <div className="mb-4">
                        <SimpleAudioPlayer 
                          audioUrl={(currentQuestion as any).passages.audio_url} 
                          transcript={(currentQuestion as any).passages.texts?.content || ''} 
                        />
                      </div>
                    )}

                    {/* Passage Images */}
                    {(() => {
                      const passage = (currentQuestion as any).passages;
                      if (!passage) return null;

                      const images = [];
                      
                      // Add main image
                      if (passage.image_url) {
                        images.push(passage.image_url);
                      }
                      
                      // Add additional images from texts.additional
                      if (passage.texts?.additional) {
                        const additionalImages = passage.texts.additional
                          .split('|')
                          .map((url: string) => url.trim())
                          .filter((url: string) => url && url.startsWith('http'));
                        images.push(...additionalImages);
                      }

                      if (images.length === 0) return null;

                      return (
                        <div className="mb-4">
                          {images.length === 1 ? (
                            // Single image
                            <div className="text-center">
                              <img 
                                src={images[0]} 
                                alt="Passage image" 
                                className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                                style={{ maxHeight: '500px' }}
                              />
                            </div>
                          ) : (
                            // Multiple images (Part 7)
                            <div className="space-y-4">
                              {images.map((url, index) => (
                                <div key={index} className="text-center">
                                  <img 
                                    src={url} 
                                    alt={`Passage image ${index + 1}`} 
                                    className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                                    style={{ maxHeight: '500px' }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Passage Text */}
                    {(currentQuestion as any).passages?.texts?.content && (
                      <div className="prose max-w-none">
                        <div className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">
                          {(currentQuestion as any).passages.texts.content}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Single Question Content for Part 1, 2, 5 */}
              {(currentQuestion.part === 1 || currentQuestion.part === 2 || currentQuestion.part === 5) && (
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
                  </CardContent>
                </Card>
              )}

              {/* All Questions for Current Passage (Part 3, 4, 6, 7) */}
              {(currentQuestion.part === 3 || currentQuestion.part === 4 || currentQuestion.part === 6 || currentQuestion.part === 7) && currentQuestion.passage_id && (
                <div className="space-y-6">
                  {(() => {
                    // Get all questions for this passage
                    const passageQuestions = questions.filter(q => q.passage_id === currentQuestion.passage_id);
                    return passageQuestions.map((question, index) => {
                      const questionAnswer = userAnswers[question.id];
                      const isCorrect = questionAnswer === question.correct_choice;
                      const isCurrent = question.id === currentQuestion.id;
                      
                      return (
                        <Card key={question.id} className={isCurrent ? 'ring-2 ring-blue-500' : ''}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">
                                  Câu {questions.findIndex(q => q.id === question.id) + 1}
                                </Badge>
                                {isCorrect ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                              {isCurrent && (
                                <Badge className="bg-blue-100 text-blue-800">Đang xem</Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            {/* Question Text */}
                            <div className="mb-6">
                              <p className="text-gray-800 leading-relaxed text-lg">
                                {question.prompt_text}
                              </p>
                            </div>

                            {/* Choices */}
                            <div className="space-y-3">
                              {['A', 'B', 'C', 'D'].map((choice) => {
                                const choices = question.choices as any;
                                const choiceText = choices?.[choice] || '';
                                const isUserAnswer = questionAnswer === choice;
                                const isCorrectAnswer = question.correct_choice === choice;
                                
                                return (
                                  <div
                                    key={choice}
                                    className={`p-3 rounded-lg border-2 transition-colors ${
                                      isCorrectAnswer
                                        ? 'border-green-500 bg-green-50'
                                        : isUserAnswer && !isCorrectAnswer
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-200 bg-white'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                          isCorrectAnswer
                                            ? 'bg-green-500 text-white'
                                            : isUserAnswer && !isCorrectAnswer
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-200 text-gray-700'
                                        }`}
                                      >
                                        {choice}
                                      </div>
                                      <span className="flex-1">{choiceText}</span>
                                      {isCorrectAnswer && (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                      )}
                                      {isUserAnswer && !isCorrectAnswer && (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explanation for this question */}
                            {(question.explain_vi || question.explain_en) && (
                              <div className="mt-6 space-y-4">
                                {/* Vietnamese Explanation */}
                                {question.explain_vi && (
                                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                    <h4 className="font-semibold text-blue-900 mb-2">Giải thích (Tiếng Việt):</h4>
                                    <p className="text-blue-800 leading-relaxed">
                                      {question.explain_vi}
                                    </p>
                                  </div>
                                )}
                                
                                {/* English Explanation */}
                                {question.explain_en && (
                                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                                    <h4 className="font-semibold text-green-900 mb-2">Explanation (English):</h4>
                                    <p className="text-green-800 leading-relaxed">
                                      {question.explain_en}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    });
                  })()}
                </div>
              )}

              {/* Single Question Content for Part 1, 2, 5 */}
              {(currentQuestion.part === 1 || currentQuestion.part === 2 || currentQuestion.part === 5) && (
                <Card>
                  <CardContent className="p-6">
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
                      {['A', 'B', 'C', 'D'].map((choice) => {
                        const choices = currentQuestion.choices as any;
                        const choiceText = choices?.[choice] || '';
                        const isUserAnswer = currentAnswer === choice;
                        const isCorrectAnswer = currentQuestion.correct_choice === choice;
                        
                        return (
                          <div
                            key={choice}
                            className={`p-4 rounded-lg border-2 transition-colors ${
                              isCorrectAnswer
                                ? 'border-green-500 bg-green-50'
                                : isUserAnswer && !isCorrectAnswer
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                                  isCorrectAnswer
                                    ? 'bg-green-500 text-white'
                                    : isUserAnswer && !isCorrectAnswer
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                {choice}
                              </div>
                              <span className="flex-1 text-lg">{choiceText}</span>
                              {isCorrectAnswer && (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <XCircle className="h-6 w-6 text-red-600" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {(currentQuestion.explain_vi || currentQuestion.explain_en) && (
                      <div className="mt-8 space-y-4">
                        {/* Vietnamese Explanation */}
                        {currentQuestion.explain_vi && (
                          <div className="p-6 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <h4 className="font-semibold text-blue-900 mb-3 text-lg">Giải thích (Tiếng Việt):</h4>
                            <p className="text-blue-800 text-lg leading-relaxed">
                              {currentQuestion.explain_vi}
                            </p>
                          </div>
                        )}
                        
                        {/* English Explanation */}
                        {currentQuestion.explain_en && (
                          <div className="p-6 bg-green-50 rounded-lg border-l-4 border-green-400">
                            <h4 className="font-semibold text-green-900 mb-3 text-lg">Explanation (English):</h4>
                            <p className="text-green-800 text-lg leading-relaxed">
                              {currentQuestion.explain_en}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Câu trước
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentQuestionIndex(Math.min(totalQuestions - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                >
                  Câu sau
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Giống ExamSession */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Progress Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tiến độ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Câu hiện tại</span>
                    <span>{currentQuestionIndex + 1}/{totalQuestions}</span>
                  </div>
                  <Progress 
                    value={((currentQuestionIndex + 1) / totalQuestions) * 100} 
                    className="h-2"
                  />
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                      <div className="text-xs text-gray-600">Đúng</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{totalQuestions - correctAnswers}</div>
                      <div className="text-xs text-gray-600">Sai</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Navigation by Part */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Câu hỏi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(questionsByPart).map(([part, partQuestions]) => (
                    <div key={part}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-sm">Part {part}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {partQuestions.map((question) => {
                          const userAnswer = userAnswers[question.id];
                          const isCorrect = userAnswer === question.correct_choice;
                          const isCurrent = question.originalIndex === currentQuestionIndex;
                          
                          return (
                            <button
                              key={question.id}
                              onClick={() => setCurrentQuestionIndex(question.originalIndex)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                                isCurrent
                                  ? 'bg-blue-600 text-white'
                                  : userAnswer
                                  ? isCorrect
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {question.originalIndex + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Thao tác</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setCurrentQuestionIndex(0)}
                  disabled={currentQuestionIndex === 0}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Câu đầu tiên
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setCurrentQuestionIndex(totalQuestions - 1)}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                >
                  Câu cuối cùng
                </Button>
                <Button 
                  className="w-full"
                  onClick={() => navigate(`/exam-sets/${examSet.id}/take`)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Làm lại bài thi
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamReview;