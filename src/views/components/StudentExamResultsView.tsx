/**
 * StudentExamResultsView
 * Pure UI component cho Student Exam Results
 * Extracted từ StudentExamResults.tsx
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Calendar,
  Trophy,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { StudentExamResult, StudentStats } from '../controllers/analytics/StudentExamResultsController';

export interface StudentExamResultsViewProps {
  // State
  examResults: StudentExamResult[];
  studentStats: StudentStats[];
  loading: boolean;
  error: string | null;
  selectedStudent: string | null;
  viewingExamId: string | null;

  // Actions
  onSetSelectedStudent: (studentId: string | null) => void;
  onSetViewingExamId: (examId: string | null) => void;
  onNavigateBack: () => void;
  onNavigateToExamResult: (examId: string) => void;

  // Utility functions
  getFilteredResults: () => StudentExamResult[];
  formatTime: (seconds: number) => string;
  formatDate: (dateString: string) => string;
  getScoreColor: (score: number) => string;
  getScoreBadgeVariant: (score: number) => 'default' | 'secondary' | 'destructive';
  getOverviewStatistics: () => {
    totalStudents: number;
    totalExams: number;
    averageScore: number;
    highestScore: number;
  };

  // Props
  className?: string;
}

const StudentExamResultsView: React.FC<StudentExamResultsViewProps> = ({
  examResults,
  studentStats,
  loading,
  error,
  selectedStudent,
  viewingExamId,
  onSetSelectedStudent,
  onSetViewingExamId,
  onNavigateBack,
  onNavigateToExamResult,
  getFilteredResults,
  formatTime,
  formatDate,
  getScoreColor,
  getScoreBadgeVariant,
  getOverviewStatistics,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-lg text-muted-foreground">Đang tải kết quả thi của học sinh...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`container mx-auto p-6 ${className}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={onNavigateBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại Dashboard
        </Button>
      </div>
    );
  }

  const filteredResults = getFilteredResults();
  const statistics = getOverviewStatistics();

  return (
    <div className={`container mx-auto p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kết quả thi của học sinh</h1>
          <p className="text-muted-foreground">
            Theo dõi tiến độ và kết quả thi của học sinh
          </p>
        </div>
        <Button onClick={onNavigateBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại Dashboard
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng học sinh</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng bài thi</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalExams}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm TB</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.averageScore}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm cao nhất</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.highestScore}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Tổng quan học sinh</TabsTrigger>
          <TabsTrigger value="results">Chi tiết bài thi</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê học sinh</CardTitle>
              <CardDescription>
                Tổng quan về kết quả thi của từng học sinh
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentStats.map((student) => (
                  <div key={student.student_id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{student.student_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {student.total_exams} bài thi
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${getScoreColor(student.average_score)}`}>
                          {student.average_score}%
                        </div>
                        <p className="text-xs text-muted-foreground">Điểm TB</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          <span>Điểm cao nhất: {student.best_score}%</span>
                        </div>
                        {student.latest_exam_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Thi gần nhất: {formatDate(student.latest_exam_date)}</span>
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onSetSelectedStudent(student.student_id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết bài thi</CardTitle>
              <CardDescription>
                Danh sách tất cả bài thi đã hoàn thành
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredResults.map((result) => (
                  <div key={result.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{result.exam_sets?.title || 'Bài thi'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {result.profiles?.name || 'Học sinh'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getScoreBadgeVariant(result.score)} className="text-lg px-3 py-1">
                          {result.score}%
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.correct_answers}/{result.total_questions} câu đúng
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(result.completed_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(result.time_spent)}</span>
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={viewingExamId === result.id}
                              onClick={() => {
                                onSetViewingExamId(result.id);
                                onNavigateToExamResult(result.id);
                              }}
                            >
                              {viewingExamId === result.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                                  Đang tải...
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Xem chi tiết
                                </>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xem chi tiết câu trả lời và giải thích</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}

                {filteredResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p>Chưa có bài thi nào được hoàn thành</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentExamResultsView;
