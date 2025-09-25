import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Trophy, Clock, Target, TrendingUp, RotateCcw } from 'lucide-react';

interface SessionResults {
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  accuracy: number;
  results: Array<{
    itemId: string;
    correct: boolean;
    timeMs: number;
    response: string;
  }>;
}

interface SessionCompleteProps {
  results: SessionResults;
  onNewSession: () => void;
  onReviewMistakes: () => void;
  onBackToDashboard: () => void;
}

const SessionComplete = ({ 
  results, 
  onNewSession, 
  onReviewMistakes, 
  onBackToDashboard 
}: SessionCompleteProps) => {
  const { totalQuestions, correctAnswers, timeSpent, accuracy } = results;
  const wrongAnswers = totalQuestions - correctAnswers;
  const averageTime = timeSpent / totalQuestions / 1000; // seconds per question
  
  const getPerformanceMessage = () => {
    if (accuracy >= 90) return { message: 'Xuất sắc!', color: 'text-green-600', icon: Trophy };
    if (accuracy >= 80) return { message: 'Rất tốt!', color: 'text-blue-600', icon: CheckCircle };
    if (accuracy >= 70) return { message: 'Tốt!', color: 'text-orange-600', icon: Target };
    return { message: 'Cần cải thiện', color: 'text-red-600', icon: TrendingUp };
  };

  const performance = getPerformanceMessage();
  const PerformanceIcon = performance.icon;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-3 mb-4">
          <PerformanceIcon className={`h-8 w-8 ${performance.color}`} />
          <h1 className={`text-3xl font-bold ${performance.color}`}>
            {performance.message}
          </h1>
        </div>
        <p className="text-muted-foreground">
          Bạn đã hoàn thành phiên luyện tập
        </p>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tổng câu hỏi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              câu đã hoàn thành
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Độ chính xác</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{accuracy.toFixed(1)}%</div>
            <Progress value={accuracy} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Thời gian TB</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageTime.toFixed(1)}s</div>
            <p className="text-xs text-muted-foreground">
              mỗi câu hỏi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tổng thời gian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(timeSpent / 60000)}:{((timeSpent % 60000) / 1000).toFixed(0).padStart(2, '0')}
            </div>
            <p className="text-xs text-muted-foreground">
              phút:giây
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Chi tiết kết quả
          </CardTitle>
          <CardDescription>
            Phân tích chi tiết phiên luyện tập vừa hoàn thành
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Correct vs Wrong */}
            <div className="space-y-4">
              <h4 className="font-medium">Kết quả chi tiết</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Câu trả lời đúng</span>
                  </div>
                  <Badge variant="secondary">{correctAnswers} câu</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Câu trả lời sai</span>
                  </div>
                  <Badge variant="destructive">{wrongAnswers} câu</Badge>
                </div>
              </div>
            </div>

            {/* Performance Tips */}
            <div className="space-y-4">
              <h4 className="font-medium">Lời khuyên</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                {accuracy >= 90 ? (
                  <p>✨ Tuyệt vời! Bạn đã thành thạo loại câu hỏi này.</p>
                ) : accuracy >= 80 ? (
                  <p>🎯 Kết quả rất tốt! Hãy tiếp tục duy trì phong độ.</p>
                ) : accuracy >= 70 ? (
                  <p>📈 Bạn đang tiến bộ. Hãy tập trung vào những câu sai để cải thiện.</p>
                ) : (
                  <>
                    <p>💪 Đừng nản lòng! Mỗi lần luyện tập đều giúp bạn tiến bộ.</p>
                    <p>📚 Hãy ôn tập lại những câu sai và thử lại.</p>
                  </>
                )}
                
                {averageTime > 60 && (
                  <p>⏱️ Cố gắng trả lời nhanh hơn để tăng độ tự tin trong thi thật.</p>
                )}
                
                {wrongAnswers > 0 && (
                  <p>🔄 Những câu sai sẽ được thêm vào hệ thống ôn tập để bạn học lại.</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          onClick={onNewSession}
          className="flex-1 max-w-xs"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Luyện tập tiếp
        </Button>
        
        {wrongAnswers > 0 && (
          <Button 
            variant="outline"
            onClick={onReviewMistakes}
            className="flex-1 max-w-xs"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Ôn tập câu sai ({wrongAnswers})
          </Button>
        )}
        
        <Button 
          variant="secondary"
          onClick={onBackToDashboard}
          className="flex-1 max-w-xs"
        >
          Về trang chủ
        </Button>
      </div>
    </div>
  );
};

export default SessionComplete;