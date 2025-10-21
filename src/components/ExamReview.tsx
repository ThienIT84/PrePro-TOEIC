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
import TimeStatistics from './TimeStatistics';
import { PassageDisplay } from './PassageDisplay';
import ExamReviewSettings from './ExamReviewSettings';

interface ExamReviewProps {
  sessionId: string;
}

const ExamReview: React.FC<ExamReviewProps> = ({ sessionId }) => {
  const navigate = useNavigate();
  const [examSession, setExamSession] = useState<unknown>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examSet, setExamSet] = useState<ExamSet | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showTranslations, setShowTranslations] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);

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

      // Get served question IDs from session results (only questions from selected parts)
      const servedQuestionIds = (sessionData as any)?.results?.served_question_ids as string[] | undefined;
      
      if (!servedQuestionIds || servedQuestionIds.length === 0) {
        throw new Error('Không tìm thấy danh sách câu hỏi đã thi');
      }

      // Fetch only the questions that were actually served (from selected parts)
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          *,
          passages (*)
        `)
        .in('id', servedQuestionIds);

      if (questionsError) {
        console.error('Questions error:', questionsError);
        throw questionsError;
      }

      console.log('Questions data:', questionsData);
      
      // Sort questions according to the order in servedQuestionIds
      // Supabase .in() doesn't preserve order, so we need to sort manually
      const sortedQuestions = (questionsData as any[] || []).sort((a, b) => {
        const indexA = servedQuestionIds.indexOf(a.id);
        const indexB = servedQuestionIds.indexOf(b.id);
        return indexA - indexB;
      });
      
      console.log('Sorted questions:', sortedQuestions);
      setQuestions(sortedQuestions);

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

  // Use actual time spent from exam session, but validate it
  const actualTimeSpent = (examSession as any)?.time_spent || 0;

  // Group questions by part
  const questionsByPart = questions.reduce((acc, question, index) => {
    const part = question.part;
    if (!acc[part]) {
      acc[part] = [];
    }
    acc[part].push({ ...question, originalIndex: index });
    return acc;
  }, {} as Record<number, Array<Question & { originalIndex: number }>>);

  // Calculate part-wise statistics
  const partStatistics = Object.entries(questionsByPart).map(([part, partQuestions]) => {
    const correctInPart = partQuestions.filter(q => userAnswers[q.id] === q.correct_choice).length;
    const totalInPart = partQuestions.length;
    const accuracy = totalInPart > 0 ? (correctInPart / totalInPart) * 100 : 0;
    
    return {
      part: parseInt(part),
      correct: correctInPart,
      total: totalInPart,
      accuracy: Math.round(accuracy),
      questions: partQuestions
    };
  }).sort((a, b) => a.part - b.part);

  // Calculate TOEIC score estimation
  const calculateTOEICScore = (accuracy: number) => {
    // Rough estimation based on TOEIC scoring system
    if (accuracy >= 95) return 990;
    if (accuracy >= 90) return 900 + (accuracy - 90) * 18;
    if (accuracy >= 80) return 800 + (accuracy - 80) * 10;
    if (accuracy >= 70) return 700 + (accuracy - 70) * 10;
    if (accuracy >= 60) return 600 + (accuracy - 60) * 10;
    if (accuracy >= 50) return 500 + (accuracy - 50) * 10;
    if (accuracy >= 40) return 400 + (accuracy - 40) * 10;
    if (accuracy >= 30) return 300 + (accuracy - 30) * 10;
    if (accuracy >= 20) return 200 + (accuracy - 20) * 10;
    return Math.max(100, accuracy * 5);
  };

  const estimatedTOEICScore = calculateTOEICScore((correctAnswers / totalQuestions) * 100);

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
            <ExamReviewSettings
              showTranslations={showTranslations}
              showExplanations={showExplanations}
              onToggleTranslations={setShowTranslations}
              onToggleExplanations={setShowExplanations}
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Điểm số</div>
              <div className={`text-2xl font-bold ${getScoreColor((examSession as any).score)}`}>
                {(examSession as any).score}%
              </div>
              <div className="text-xs text-blue-600 font-medium">
                ~{estimatedTOEICScore} TOEIC
              </div>
            </div>
            <Button onClick={() => navigate(`/exam-sets/${examSet.id}/take`)}>
              <Play className="h-4 w-4 mr-2" />
              Làm lại
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-screen">
        {/* Main Content - Giống ExamSession */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
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
                          transcript={(currentQuestion.part === 3 || currentQuestion.part === 4) ? '' : (currentQuestion as any).passages.texts?.content || ''} 
                        />
                      </div>
                    )}

                    {/* Part 6 and 7 images are now handled by PassageDisplay component above */}

                    {/* Passage Text with Translation - For Part 3, 4, 6, 7 */}
                    {(currentQuestion.part === 3 || currentQuestion.part === 4 || currentQuestion.part === 6 || currentQuestion.part === 7) && (currentQuestion as any).passages?.texts?.content && (
                      <>
                        {console.log(`🔍 Part ${currentQuestion.part} Passage Data:`, {
                          passage: (currentQuestion as any).passages,
                          translationVi: (currentQuestion as any).passages?.translation_vi,
                          translationEn: (currentQuestion as any).passages?.translation_en,
                          additional: (currentQuestion as any).passages?.texts?.additional,
                          showTranslations: showTranslations,
                          hasTranslationVi: !!(currentQuestion as any).passages?.translation_vi,
                          hasTranslationEn: !!(currentQuestion as any).passages?.translation_en,
                          translationViContent: (currentQuestion as any).passages?.translation_vi?.content,
                          translationViContent2: (currentQuestion as any).passages?.translation_vi?.content2,
                          translationViContent3: (currentQuestion as any).passages?.translation_vi?.content3
                        })}
                        <PassageDisplay
                          passage={{
                            content: (currentQuestion as any).passages.texts.content,
                            title: (currentQuestion as any).passages.texts.title || `Passage ${currentQuestionIndex + 1}`,
                            content2: (currentQuestion as any).passages.texts.content2,
                            content3: (currentQuestion as any).passages.texts.content3,
                            img_url: (currentQuestion as any).passages.texts.img_url,
                            img_url2: (currentQuestion as any).passages.texts.img_url2,
                            img_url3: (currentQuestion as any).passages.texts.img_url3,
                            additional: (currentQuestion as any).passages.texts.additional
                          }}
                          translationVi={showTranslations ? ((currentQuestion as any).passages?.translation_vi || null) : null}
                          translationEn={showTranslations ? ((currentQuestion as any).passages?.translation_en || null) : null}
                          showTranslation={showTranslations}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              )}


              {/* All Questions for Current Passage (Part 3, 4, 6, 7) */}
              {(currentQuestion.part === 3 || currentQuestion.part === 4 || currentQuestion.part === 6 || currentQuestion.part === 7) && currentQuestion.passage_id && (
                <div className="space-y-6">
                  {(() => {
                    // Get all questions for this passage
                    const passageQuestions = questions.filter(q => q.passage_id === currentQuestion.passage_id && q.part === currentQuestion.part);
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
                              {(question.part === 2 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D']).map((choice) => {
                                const choices = question.choices as unknown;
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
                            {showExplanations && (question.explain_vi || question.explain_en) && (
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
                    {showExplanations && (currentQuestion.explain_vi || currentQuestion.explain_en) && (
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
        <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-4 lg:p-6 overflow-y-auto max-h-96 lg:max-h-none">
          <div className="space-y-6">
            {/* Overall Score Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tổng kết</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Overall Score */}
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getScoreColor((examSession as any).score)}`}>
                      {(examSession as any).score}%
                    </div>
                    <div className="text-sm text-gray-600">Độ chính xác</div>
                  </div>

                  {/* TOEIC Score Estimation */}
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      ~{estimatedTOEICScore}
                    </div>
                    <div className="text-sm text-blue-700">Điểm TOEIC ước tính</div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{correctAnswers}</div>
                      <div className="text-xs text-green-700">Đúng</div>
                    </div>
                    <div className="p-2 bg-red-50 rounded">
                      <div className="text-lg font-bold text-red-600">{totalQuestions - correctAnswers}</div>
                      <div className="text-xs text-red-700">Sai</div>
                    </div>
                  </div>

                  {/* Time Spent */}
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-medium text-gray-700">
                      Thời gian: {Math.floor(actualTimeSpent / 60)}m {actualTimeSpent % 60}s
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Part-wise Analysis */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Phân tích theo Part</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {partStatistics.map((stat) => {
                    const PartIcon = getPartIcon(stat.part);
                    const partColor = getPartColor(stat.part);
                    
                    return (
                      <div key={stat.part} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <PartIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">Part {stat.part}</span>
                          </div>
                          <div className="text-sm font-bold">
                            {stat.correct}/{stat.total}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={stat.accuracy} 
                            className="flex-1 h-2"
                          />
                          <span className="text-xs font-medium w-12 text-right">
                            {stat.accuracy}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {stat.part <= 4 ? 'Listening' : 'Reading'} • 
                          {stat.accuracy >= 80 ? ' Xuất sắc' : 
                           stat.accuracy >= 60 ? ' Tốt' : 
                           stat.accuracy >= 40 ? ' Trung bình' : ' Cần cải thiện'}
                        </div>
                      </div>
                    );
                  })}
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

            {/* Time Statistics */}
            <TimeStatistics
              timeSpent={actualTimeSpent}
              totalQuestions={totalQuestions}
              correctAnswers={correctAnswers}
              partStatistics={partStatistics}
            />

            {/* Improvement Suggestions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Đề xuất cải thiện</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    const weakParts = partStatistics.filter(stat => stat.accuracy < 60);
                    const strongParts = partStatistics.filter(stat => stat.accuracy >= 80);
                    
                    return (
                      <>
                        {/* Weak Areas */}
                        {weakParts.length > 0 && (
                          <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                            <h4 className="font-semibold text-red-900 mb-2">Cần cải thiện:</h4>
                            <ul className="text-sm text-red-800 space-y-1">
                              {weakParts.map(part => (
                                <li key={part.part}>
                                  • Part {part.part} ({part.accuracy}%) - 
                                  {part.part <= 4 ? 'Luyện nghe nhiều hơn' : 'Đọc hiểu và từ vựng'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Strong Areas */}
                        {strongParts.length > 0 && (
                          <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                            <h4 className="font-semibold text-green-900 mb-2">Điểm mạnh:</h4>
                            <ul className="text-sm text-green-800 space-y-1">
                              {strongParts.map(part => (
                                <li key={part.part}>
                                  • Part {part.part} ({part.accuracy}%) - 
                                  {part.part <= 4 ? 'Kỹ năng nghe tốt' : 'Kỹ năng đọc tốt'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* General Recommendations */}
                        <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          <h4 className="font-semibold text-blue-900 mb-2">Khuyến nghị:</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            {estimatedTOEICScore >= 800 && (
                              <li>• Bạn đã có trình độ tốt! Tiếp tục luyện tập để đạt 900+</li>
                            )}
                            {estimatedTOEICScore >= 600 && estimatedTOEICScore < 800 && (
                              <li>• Tập trung vào các Part yếu để đạt mục tiêu 800+</li>
                            )}
                            {estimatedTOEICScore < 600 && (
                              <li>• Cần luyện tập nhiều hơn, tập trung vào từ vựng và ngữ pháp cơ bản</li>
                            )}
                            <li>• Làm lại bài thi này sau 1-2 tuần để kiểm tra tiến bộ</li>
                            <li>• Thực hành đều đặn 30-60 phút mỗi ngày</li>
                          </ul>
                        </div>
                      </>
                    );
                  })()}
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
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // TODO: Implement save/share functionality
                    navigator.clipboard.writeText(`Tôi vừa hoàn thành bài thi TOEIC với điểm số ${(examSession as any).score}% (ước tính ~${estimatedTOEICScore} điểm TOEIC). Hãy cùng luyện tập nhé!`);
                  }}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Chia sẻ kết quả
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