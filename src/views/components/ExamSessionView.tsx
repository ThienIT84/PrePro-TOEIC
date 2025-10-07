/**
 * ExamSessionView
 * Pure UI component cho Exam Session
 * Extracted từ ExamSession.tsx
 */

import React from 'react';
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
  RefreshCw
} from 'lucide-react';
import { ExamSet, Question, TimeMode } from '@/types';
import { ExamAnswer, PassageLite } from '../controllers/exam/ExamSessionController';
import SimpleAudioPlayer from './SimpleAudioPlayer';

export interface ExamSessionViewProps {
  // State
  examSet: ExamSet | null;
  questions: Question[];
  currentIndex: number;
  answers: Map<string, ExamAnswer>;
  timeLeft: number;
  isStarted: boolean;
  isPaused: boolean;
  isSubmitted: boolean;
  loading: boolean;
  showSubmitDialog: boolean;
  hasCompleted: boolean;
  refreshKey: number;
  sessionId: string | null;
  passageMap: Record<string, PassageLite>;
  selectedParts: number[] | null;
  timeMode: TimeMode;

  // Actions
  onStartExam: () => void;
  onPauseExam: () => void;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  onGoToQuestion: (index: number) => void;
  onAnswerChange: (questionId: string, answer: string) => void;
  onShowSubmitDialog: () => void;
  onHideSubmitDialog: () => void;
  onSubmitExam: () => void;
  onRefreshExam: () => void;
  onNavigateBack: () => void;
  onNavigateToResults: () => void;
  onNavigateToHistory: () => void;

  // Utility functions
  formatTime: (seconds: number) => string;
  getProgress: () => number;
  getAnsweredCount: () => number;
  getCurrentQuestion: () => Question | null;
  getCurrentAnswer: () => ExamAnswer | null;
}

const ExamSessionView: React.FC<ExamSessionViewProps> = ({
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
  selectedParts,
  onStartExam,
  onPauseExam,
  onNextQuestion,
  onPreviousQuestion,
  onGoToQuestion,
  onAnswerChange,
  onShowSubmitDialog,
  onHideSubmitDialog,
  onSubmitExam,
  onRefreshExam,
  onNavigateBack,
  onNavigateToResults,
  onNavigateToHistory,
  formatTime,
  getProgress,
  getAnsweredCount,
  getCurrentQuestion,
  getCurrentAnswer,
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-center text-muted-foreground mt-4">Đang tải dữ liệu bài thi...</p>
      </div>
    );
  }

  // No exam set or questions
  if (!examSet || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Không tìm thấy bài thi</h2>
        <p className="text-muted-foreground mb-4">
          {!examSet ? 'Không thể tải thông tin bài thi' : 'Không có câu hỏi nào trong bài thi này'}
        </p>
        <Button onClick={onNavigateBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const currentAnswer = getCurrentAnswer();

  // Has completed exam
  if (hasCompleted) {
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
              <Button onClick={onNavigateBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Chọn bài thi khác
              </Button>
              <Button onClick={onNavigateToHistory} className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                Xem kết quả
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not started yet
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
                  {timeMode === 'unlimited' ? 'Không giới hạn' : examSet.time_limit}
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
                  <li>• {timeMode === 'unlimited' ? 'Bạn có thể làm bài không giới hạn thời gian' : `Bạn có ${examSet.time_limit} phút để hoàn thành bài thi`}</li>
                  <li>• Chọn đáp án A, B, C, hoặc D cho mỗi câu hỏi</li>
                  <li>• {timeMode === 'standard' ? 'Có thể tạm dừng và tiếp tục bất kỳ lúc nào' : 'Làm bài với thời gian tự do'}</li>
                  <li>• {timeMode === 'standard' ? 'Bài thi sẽ tự động nộp khi hết thời gian' : 'Bạn có thể nộp bài bất kỳ lúc nào'}</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex space-x-4">
              <Button onClick={onNavigateBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <Button 
                onClick={onRefreshExam} 
                variant="outline"
                disabled={loading}
                title="Làm mới danh sách câu hỏi"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
              <Button onClick={onStartExam} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Bắt đầu làm bài
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main exam interface
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
                  Câu {currentIndex + 1} / {questions.length} • Part {currentQuestion?.part}
                  {currentQuestion?.passage_id && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Passage {questions.findIndex(q => q.passage_id === currentQuestion.passage_id) + 1}-{questions.filter(q => q.passage_id === currentQuestion.passage_id).length}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className={`font-mono text-lg ${timeLeft < 300 ? 'text-red-500' : ''}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPauseExam}
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShowSubmitDialog}
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

        {/* Question Content */}
        {currentQuestion && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Audio Player - Only for single questions (Part 1, 2) */}
                {!currentQuestion.passage_id && currentQuestion.audio_url && (
                  <div className="mb-6">
                    <SimpleAudioPlayer 
                      audioUrl={currentQuestion.audio_url}
                      transcript=""
                    />
                  </div>
                )}

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

                {/* Part 6,7 Passage Images */}
                {(currentQuestion.part === 6 || currentQuestion.part === 7) && 
                 currentQuestion.passage_id && 
                 passageMap[currentQuestion.passage_id] && (
                  (() => {
                    const p = passageMap[currentQuestion.passage_id];
                    const extra = (p.texts?.additional || '')
                      .split('|')
                      .map(s => s.trim())
                      .filter(Boolean);
                    const images = [p.image_url, ...extra].filter(Boolean) as string[];
                    if (images.length === 0) return null;
                    
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

                {/* Part 3,4 Passage Text - Hidden for listening parts */}
                {currentQuestion.part !== 7 && 
                 currentQuestion.part !== 6 && 
                 currentQuestion.part !== 3 && 
                 currentQuestion.part !== 4 && 
                 currentQuestion.passage_id && 
                 passageMap[currentQuestion.passage_id]?.texts?.content && (
                  <div className="mb-4">
                    {passageMap[currentQuestion.passage_id]?.texts?.title && (
                      <h3 className="text-base font-semibold mb-2">
                        {passageMap[currentQuestion.passage_id]?.texts?.title}
                      </h3>
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

                {/* Part Instructions */}
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

                {/* Passage Instructions */}
                {[3, 4, 6, 7].includes(currentQuestion.part) && currentQuestion.passage_id && (
                  <div className="mb-6">
                    <div className="text-center mb-4">
                      <h2 className="text-lg font-medium text-gray-800 mb-2">
                        Part {currentQuestion.part}: {
                          currentQuestion.part === 3 ? 'Conversations' : 
                          currentQuestion.part === 4 ? 'Talks' : 
                          currentQuestion.part === 6 ? 'Text Completion' : 
                          'Reading Comprehension'
                        }
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

                {/* Passage Questions */}
                {currentQuestion.passage_id ? (
                  <div className="space-y-6">
                    {/* Audio and Image for the entire passage */}
                    {(() => {
                      const passageAudio = passageMap[currentQuestion.passage_id]?.audio_url;
                      const passageImage = passageMap[currentQuestion.passage_id]?.image_url;
                      
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
                    
                    {/* Questions in passage */}
                    {questions
                      .filter(q => q.passage_id === currentQuestion.passage_id)
                      .map((question, questionIndex) => {
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
                            
                            {/* Choices */}
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
                                          onAnswerChange(question.id, choiceLetter);
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
                      })}
                  </div>
                ) : (
                  /* Single Question */
                  <div className="space-y-4">
                    {/* Question Text */}
                    {currentQuestion.prompt_text && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-900 font-medium">{currentQuestion.prompt_text}</p>
                      </div>
                    )}
                    
                    {/* Choices */}
                    <div className="space-y-2">
                      {Object.entries(currentQuestion.choices || {})
                        .filter(([choiceLetter]) => {
                          if (currentQuestion.part === 2) {
                            return ['A', 'B', 'C'].includes(choiceLetter);
                          }
                          return true;
                        })
                        .map(([choiceLetter, choiceText]) => {
                          const isSelected = currentAnswer?.answer === choiceLetter;
                          const isCorrect = currentQuestion.correct_choice === choiceLetter;
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
                                  : isSubmitted && isCorrect && currentAnswer
                                    ? 'border-green-300 bg-green-25'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                              onClick={() => {
                                if (!isSubmitted) {
                                  onAnswerChange(currentQuestion.id, choiceLetter);
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
                                    : isSubmitted && isCorrect && currentAnswer
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
                                {!isSelected && isCorrect && currentAnswer && isSubmitted && (
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
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={onPreviousQuestion}
                disabled={currentIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Câu trước
              </Button>

              <div className="flex space-x-2">
                {questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={index === currentIndex ? "default" : "outline"}
                    size="sm"
                    onClick={() => onGoToQuestion(index)}
                    className={`w-8 h-8 p-0 ${
                      answers.get(questions[index].id)?.answer 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : ''
                    }`}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={onNextQuestion}
                disabled={currentIndex === questions.length - 1}
              >
                Câu tiếp
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={onHideSubmitDialog}>
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
            <div className="flex space-x-4">
              <Button variant="outline" onClick={onHideSubmitDialog}>
                Hủy
              </Button>
              <Button onClick={onSubmitExam}>
                Nộp bài
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamSessionView;
