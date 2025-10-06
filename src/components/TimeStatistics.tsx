import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, TrendingUp, Target } from 'lucide-react';

interface TimeStatisticsProps {
  timeSpent: number;
  totalQuestions: number;
  correctAnswers: number;
  partStatistics: Array<{
    part: number;
    correct: number;
    total: number;
    accuracy: number;
  }>;
}

const TimeStatistics: React.FC<TimeStatisticsProps> = ({
  timeSpent,
  totalQuestions,
  correctAnswers,
  partStatistics
}) => {
  const averageTimePerQuestion = timeSpent / totalQuestions;
  const timePerCorrectAnswer = correctAnswers > 0 ? timeSpent / correctAnswers : 0;
  
  // Calculate time efficiency score (0-100)
  const timeEfficiency = Math.max(0, Math.min(100, 
    100 - ((averageTimePerQuestion - 60) / 60) * 50
  ));

  const getTimeEfficiencyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTimeEfficiencyText = (score: number) => {
    if (score >= 80) return 'Rất nhanh';
    if (score >= 60) return 'Tốt';
    if (score >= 40) return 'Trung bình';
    return 'Cần cải thiện';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Thống kê thời gian
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall Time Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
              </div>
              <div className="text-xs text-blue-700">Tổng thời gian</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {Math.round(averageTimePerQuestion)}s
              </div>
              <div className="text-xs text-green-700">TB/câu</div>
            </div>
          </div>

          {/* Time Efficiency */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-xl font-bold ${getTimeEfficiencyColor(timeEfficiency)}`}>
              {Math.round(timeEfficiency)}%
            </div>
            <div className="text-sm text-gray-600">
              Hiệu quả thời gian • {getTimeEfficiencyText(timeEfficiency)}
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">Khuyến nghị:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {averageTimePerQuestion > 90 && (
                <li>• Tập trung vào việc đọc nhanh và hiểu ý chính</li>
              )}
              {averageTimePerQuestion < 30 && (
                <li>• Dành thêm thời gian để đọc kỹ và suy nghĩ</li>
              )}
              <li>• Mục tiêu: 60-90 giây/câu cho Reading, 30-45 giây/câu cho Listening</li>
              <li>• Luyện tập với đồng hồ để quen với áp lực thời gian</li>
            </ul>
          </div>

          {/* Part-wise Time Analysis */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">Phân tích theo Part:</h4>
            <div className="space-y-1">
              {partStatistics.map((stat) => {
                const partTime = (stat.total / totalQuestions) * timeSpent;
                const avgTimePerQuestion = partTime / stat.total;
                
                return (
                  <div key={stat.part} className="flex justify-between items-center text-xs">
                    <span>Part {stat.part}:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{Math.round(avgTimePerQuestion)}s/câu</span>
                      <div className={`w-2 h-2 rounded-full ${
                        avgTimePerQuestion <= 60 ? 'bg-green-400' : 
                        avgTimePerQuestion <= 90 ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeStatistics;

