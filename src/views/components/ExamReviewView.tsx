/**
 * ExamReviewView
 * Pure UI component cho TOEIC Exam Review
 * Nhận tất cả data và callbacks qua props
 */

import React from 'react';
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
import { Question, ExamSet } from '@/types';
import SimpleAudioPlayer from '@/components/SimpleAudioPlayer';

export interface ExamSession {
  id: string;
  exam_set_id: string;
  user_id: string;
  score: number;
  completed_at: string;
  created_at: string;
  exam_sets?: ExamSet;
}

export interface ExamReviewViewProps {
  // State
  examSession: ExamSession | null;
  questions: Question[];
  examSet: ExamSet | null;
  userAnswers: Record<string, string>;
  loading: boolean;
  currentQuestionIndex: number;
  error: string | null;

  // Handlers
  onCurrentQuestionIndexChange: (index: number) => void;
  onGoToNextQuestion: () => void;
  onGoToPreviousQuestion: () => void;
  onRetryExam: () => void;
  onBackToDashboard: () => void;

  // Utility functions
  getCurrentQuestion: () => Question | null;
  getCurrentAnswer: () => string | null;
  isCurrentAnswerCorrect: () => boolean;
  getScoreColor: (score: number) => string;
  getScoreBadgeVariant: (score: number) => 'default' | 'secondary' | 'destructive';
  getPartColor: (part: number) => string;
  getPartIcon: (part: number) => string;
  getTotalQuestions: () => number;
  getCorrectAnswersCount: () => number;
  getIncorrectAnswersCount: () => number;
  getQuestionsByPart: () => Record<number, Array<Question & { originalIndex: number }>>;
  getCurrentPassageQuestions: () => Question[];
  isQuestionCorrect: (questionId: string) => boolean;
  getUserAnswer: (questionId: string) => string | null;
  getProgressPercentage: () => number;
  getStatistics: () => {
    total: number;
    correct: number;
    incorrect: number;
    score: number;
    currentIndex: number;
    progress: number;
  };
  hasCurrentQuestionPassage: () => boolean;
  hasCurrentQuestionAudio: () => boolean;
  hasCurrentQuestionImage: () => boolean;
  getCurrentQuestionPassage: () => any;
  getPassageImages: (passage: any) => string[];
  canGoToNext: () => boolean;
  canGoToPrevious: () => boolean;

  // Props
  className?: string;
}

export const ExamReviewView: React.FC<ExamReviewViewProps> = ({
  examSession,
  questions,
  examSet,
  userAnswers,
  loading,
  currentQuestionIndex,
  error,
  onCurrentQuestionIndexChange,
  onGoToNextQuestion,
  onGoToPreviousQuestion,
  onRetryExam,
  onBackToDashboard,
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
  className = '',
}) => {
  const navigate = useNavigate();
  const statistics = getStatistics();
  const currentQuestion = getCurrentQuestion();
  const currentAnswer = getCurrentAnswer();
  const questionsByPart = getQuestionsByPart();

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
            <Button variant="outline" onClick={onBackToDashboard}>
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
          <Button onClick={onBackToDashboard}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBackToDashboard}>
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
            <Button onClick={onRetryExam}>
              <Play className="h-4 w-4 mr-2" />
              Làm lại
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Main Content */}
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
                      Câu {currentQuestionIndex + 1} / {statistics.total}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrentAnswerCorrect() ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Tiến độ: {currentQuestionIndex + 1}/{statistics.total} câu
                  </div>
                  <div className="text-sm text-gray-600">
                    {statistics.correct}/{statistics.total} câu đúng
                  </div>
                </div>
                <Progress 
                  value={statistics.progress} 
                  className="mt-2 h-2"
                />
              </div>

              {/* Passage Content for Part 3, 4, 6, 7 */}
              {hasCurrentQuestionPassage() && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Passage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Passage Audio */}
                    {hasCurrentQuestionAudio() && (
                      <div className="mb-4">
                        <SimpleAudioPlayer 
                          audioUrl={currentQuestion.audio_url || ''} 
                          transcript={currentQuestion.transcript || ''} 
                        />
                      </div>
                    )}

                    {/* Passage Images */}
                    {(() => {
                      const passage = getCurrentQuestionPassage();
                      if (!passage) return null;

                      const images = getPassageImages(passage);
                      if (images.length === 0) return null;

                      return (
                        <div className="mb-4">
                          {images.length === 1 ? (
                            <div className="text-center">
                              <img 
                                src={images[0]} 
                                alt="Passage image" 
                                className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                                style={{ maxHeight: '500px' }}
                              />
                            </div>
                          ) : (
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
                    {(() => {
                      const passage = getCurrentQuestionPassage();
                      if (!passage?.texts?.content) return null;

                      return (
                        <div className="prose max-w-none">
                          <div className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">
                            {passage.texts.content}
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Single Question Content for Part 1, 2, 5 */}
              {(currentQuestion.part === 1 || currentQuestion.part === 2 || currentQuestion.part === 5) && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    {/* Audio Player */}
                    {hasCurrentQuestionAudio() && (
                      <div className="mb-6">
                        <SimpleAudioPlayer 
                          audioUrl={currentQuestion.audio_url || ''} 
                          transcript={currentQuestion.transcript || ''} 
                        />
                      </div>
                    )}

                    {/* Question Image */}
                    {hasCurrentQuestionImage() && (
                      <div className="mb-6 text-center">
                        <img 
                          src={currentQuestion.image_url || ''} 
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
              {hasCurrentQuestionPassage() && (
                <div className="space-y-6">
                  {getCurrentPassageQuestions().map((question, index) => {
                    const questionAnswer = getUserAnswer(question.id);
                    const isCorrect = isQuestionCorrect(question.id);
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
                  })}
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
                  onClick={onGoToPreviousQuestion}
                  disabled={!canGoToPrevious()}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Câu trước
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onGoToNextQuestion}
                  disabled={!canGoToNext()}
                >
                  Câu sau
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
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
                    <span>{currentQuestionIndex + 1}/{statistics.total}</span>
                  </div>
                  <Progress 
                    value={statistics.progress} 
                    className="h-2"
                  />
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{statistics.correct}</div>
                      <div className="text-xs text-gray-600">Đúng</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{statistics.incorrect}</div>
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
                          const userAnswer = getUserAnswer(question.id);
                          const isCorrect = isQuestionCorrect(question.id);
                          const isCurrent = question.originalIndex === currentQuestionIndex;
                          
                          return (
                            <button
                              key={question.id}
                              onClick={() => onCurrentQuestionIndexChange(question.originalIndex)}
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
                  onClick={onRetryExam}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Làm lại bài thi
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={onBackToDashboard}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
