/**
 * ExamResultView
 * Pure UI View component cho kết quả bài thi TOEIC
 * Nhận toàn bộ data và handler qua props từ ExamResultMVC / Controller
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy, 
  RotateCcw,
  ArrowLeft,
  Eye,
  AlertCircle
} from 'lucide-react';
import SimpleAudioPlayer from '@/components/SimpleAudioPlayer';
import RetryMode from '@/components/RetryMode';
import type { ExamResultData } from '@/controllers/exam/ExamResultController';

export interface ExamResultViewProps {
  result: ExamResultData | null;
  loading: boolean;
  error: string | null;
  retryMode: boolean;
  sessionId: string;
  questions: any[];
  attempts: any[];
  onNavigateDashboard: () => void;
  onNavigateReview: () => void;
  onNavigateExams: () => void;
  onEnterRetryMode: () => void;
  onExitRetryMode: () => void;
  onUpdateResult: (newScore: number, newCorrectCount: number) => void;
  formatTime: (seconds: number) => string;
  getScoreColor: (score: number) => string;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  result,
  loading,
  error,
  retryMode,
  sessionId,
  questions,
  attempts,
  onNavigateDashboard,
  onNavigateReview,
  onNavigateExams,
  onEnterRetryMode,
  onExitRetryMode,
  onUpdateResult,
  formatTime,
  getScoreColor,
}) => {
  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getScoreMessage = (score: number): string => {
    if (score >= 90) return 'Xuất sắc! 🎉';
    if (score >= 80) return 'Tốt! 👍';
    if (score >= 70) return 'Khá tốt! 👌';
    if (score >= 60) return 'Đạt yêu cầu! ✅';
    return 'Cần cải thiện! 📚';
  };

  if (loading) {
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
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={onNavigateDashboard}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Về Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Không có dữ liệu kết quả thi</AlertDescription>
        </Alert>
      </div>
    );
  }

  const correctAnswers = result.questions?.filter(q => q.is_correct === true) || [];
  const wrongAnswers = result.questions?.filter(q => q.is_correct === false) || [];
  const unansweredQuestions = result.questions?.filter(q => q.is_correct === null || q.is_correct === undefined) || [];
  const totalQuestions = result.questions?.length || 0;
  const actualTimeSpent = result.questions?.reduce((total, q) => total + (q.time_spent || 0), 0) || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Retry Mode */}
      {retryMode && sessionId && (
        <RetryMode
          sessionId={sessionId}
          questions={questions || []}
          attempts={attempts || []}
          onExit={onExitRetryMode}
          onUpdate={onUpdateResult}
        />
      )}

      {/* Normal Result View */}
      {!retryMode && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Kết quả thi</h1>
              <p className="text-muted-foreground">{result.exam_set_name}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onNavigateDashboard}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Về Dashboard
              </Button>
              <Button onClick={onNavigateReview}>
                <Eye className="h-4 w-4 mr-2" />
                Xem chi tiết đáp án
              </Button>
              <Button 
                variant="secondary" 
                onClick={onEnterRetryMode}
                className="bg-orange-100 text-orange-700 hover:bg-orange-200"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Làm lại câu sai
              </Button>
              <Button variant="outline" onClick={onNavigateExams}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Thi khác
              </Button>
            </div>
          </div>

          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Điểm số</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}
                </div>
                <Badge variant={getScoreBadgeVariant(result.score)} className="mt-1">
                  {getScoreMessage(result.score)}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Câu đúng</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {correctAnswers.length}/{totalQuestions}
                </div>
                <Progress 
                  value={totalQuestions > 0 ? (correctAnswers.length / totalQuestions) * 100 : 0} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Thời gian</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(actualTimeSpent)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Hoàn thành lúc {new Date(result.completed_at).toLocaleString('vi-VN')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Câu sai + Chưa làm</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {wrongAnswers.length + unansweredQuestions.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cần ôn tập lại
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="wrong">Câu sai ({wrongAnswers.length})</TabsTrigger>
              <TabsTrigger value="unanswered">Chưa làm ({unansweredQuestions.length})</TabsTrigger>
              <TabsTrigger value="all">Tất cả câu hỏi</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tổng quan kết quả</CardTitle>
                  <CardDescription>
                    Phân tích chi tiết về bài thi của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-green-600">
                        {correctAnswers.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Câu đúng</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-red-600">
                        {wrongAnswers.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Câu sai</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-gray-600">
                        {unansweredQuestions.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Chưa làm</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-lg font-semibold">
                      Tỷ lệ đúng: {totalQuestions > 0 ? ((correctAnswers.length / totalQuestions) * 100).toFixed(1) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Thời gian trung bình mỗi câu: {totalQuestions > 0 ? formatTime(Math.round(actualTimeSpent / totalQuestions)) : '0:00'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wrong" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Câu trả lời sai</CardTitle>
                  <CardDescription>
                    Ôn tập lại những câu bạn đã trả lời sai
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {wrongAnswers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>Chúc mừng! Bạn đã trả lời đúng tất cả câu hỏi! 🎉</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {wrongAnswers.map((question, index) => (
                        <div key={question.question_id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="destructive">Câu {index + 1}</Badge>
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(question.time_spent)}
                            </Badge>
                          </div>
                          
                          <p className="font-medium">{question.question_text}</p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-red-600">Bạn chọn:</span>
                              <Badge variant="destructive">{question.user_answer}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-green-600">Đáp án đúng:</span>
                              <Badge variant="default">{question.correct_answer}</Badge>
                            </div>
                            {question.choices && (
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><strong>A.</strong> {question.choices.A}</div>
                                <div><strong>B.</strong> {question.choices.B}</div>
                                <div><strong>C.</strong> {question.choices.C}</div>
                                <div><strong>D.</strong> {question.choices.D}</div>
                              </div>
                            )}
                          </div>

                          {/* Giải thích */}
                          {question.explain_vi && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <h4 className="font-medium text-blue-900 mb-1">Giải thích:</h4>
                              <p className="text-sm text-blue-800">{question.explain_vi}</p>
                            </div>
                          )}

                          {/* Audio */}
                          {(question.audio_url || question.transcript) && (
                            <div className="mt-3">
                              <SimpleAudioPlayer 
                                audioUrl={question.audio_url || ''} 
                                transcript={(question.part === 3 || question.part === 4) ? '' : question.transcript} 
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="unanswered" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Câu chưa làm</CardTitle>
                  <CardDescription>
                    Những câu hỏi bạn chưa trả lời
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {unansweredQuestions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>Tuyệt vời! Bạn đã làm hết tất cả câu hỏi! 🎉</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {unansweredQuestions.map((question, index) => (
                        <div key={question.question_id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="secondary">Câu {index + 1}</Badge>
                          </div>
                          <p className="text-sm font-medium">{question.question_text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tất cả câu hỏi ({result.questions?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(result.questions || []).map((question, index) => (
                      <div key={question.question_id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant={question.is_correct ? "default" : "destructive"}>
                            Câu {index + 1}: {question.is_correct ? "Đúng" : "Sai"}
                          </Badge>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(question.time_spent)}
                          </Badge>
                        </div>
                        <p className="font-medium">{question.question_text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default ExamResultView;
