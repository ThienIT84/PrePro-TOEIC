import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Headphones, 
  FileText, 
  Trophy, 
  Target,
  Flame,
  TrendingUp,
  Play,
  Bell,
  Eye,
  Clock,
  BarChart3,
  Award,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Analytics, ExamSet } from '@/types';

/**
 * Props interface cho Dashboard View
 */
interface DashboardViewProps {
  // Data
  analytics: Analytics | null;
  reviewCount: number;
  examSets: ExamSet[];
  recentStudentExams: any[];
  
  // Loading state
  loading: boolean;
  error: string | null;
  
  // Computed values
  toeicParts: any[];
  teacherStats: {
    totalExamSets: number;
    totalStudents: number;
    totalExams: number;
    averageScore: number;
  };
  formattedAnalytics: {
    accuracy: number;
    totalAttempts: number;
    streakDays: number;
    averageTime: number;
  };
  
  // User info
  user: any;
  profile: any;
  isTeacher: boolean;
  
  // Actions
  onRefresh: () => void;
  onViewExamResult: (examId: string) => void;
}

/**
 * Dashboard View - Pure UI component
 * Chỉ hiển thị UI, không có business logic
 */
export const DashboardView = ({
  analytics,
  reviewCount,
  examSets,
  recentStudentExams,
  loading,
  error,
  toeicParts,
  teacherStats,
  formattedAnalytics,
  user,
  profile,
  isTeacher,
  onRefresh,
  onViewExamResult
}: DashboardViewProps) => {
  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Lỗi tải dữ liệu</h3>
                <p className="text-sm">{error}</p>
              </div>
              <Button onClick={onRefresh} variant="outline">
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Chào mừng đến với TOEIC Buddy
          </h1>
          <p className="text-muted-foreground mt-1">
            Hệ thống luyện thi TOEIC toàn diện - Sẵn sàng chinh phục mục tiêu điểm số?
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isTeacher ? 'default' : 'secondary'} className="px-3 py-1">
            {isTeacher ? 'Giáo viên' : 'Học viên'}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm số hiện tại</CardTitle>
            <Trophy className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {profile?.target_score || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              điểm TOEIC
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Độ chính xác</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formattedAnalytics.accuracy.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {formattedAnalytics.totalAttempts} câu đã làm
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chuỗi luyện tập</CardTitle>
            <Flame className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formattedAnalytics.streakDays}
            </div>
            <p className="text-xs text-muted-foreground">
              ngày liên tiếp
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bài thi đã làm</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {examSets.length}
            </div>
            <p className="text-xs text-muted-foreground">
              bộ đề có sẵn
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start - Full TOEIC Test */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Award className="h-6 w-6" />
            Làm bài thi TOEIC hoàn chỉnh
          </CardTitle>
          <CardDescription className="text-blue-700">
            Thực hành với bài thi TOEIC đầy đủ 200 câu hỏi trong 120 phút
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Thời gian: 120 phút</h3>
                  <p className="text-sm text-blue-700">Listening: 45 phút | Reading: 75 phút</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">200 câu hỏi</h3>
                  <p className="text-sm text-blue-700">7 phần thi từ Part 1 đến Part 7</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-3">
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                <Link to="/exam-selection">
                  <Play className="h-5 w-5 mr-2" />
                  Bắt đầu làm bài thi
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50" asChild>
                <Link to="/exam-sets">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Xem tất cả bộ đề
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TOEIC Parts Practice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Luyện tập theo từng phần TOEIC
          </CardTitle>
          <CardDescription>
            Chọn phần thi cụ thể để luyện tập và cải thiện kỹ năng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {toeicParts.map((part) => {
              const IconComponent = part.icon === 'Headphones' ? Headphones : 
                                  part.icon === 'BookOpen' ? BookOpen : FileText;
              
              return (
                <Link
                  key={part.part}
                  to="/exam-selection"
                  className="block group"
                >
                  <div className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg hover:scale-105 ${part.bgColor} ${part.borderColor}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${part.bgColor}`}>
                        <IconComponent className={`h-5 w-5 ${part.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-gray-700">
                          {part.title}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {part.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-xs ${part.color} border-current`}>
                        Part {part.part}
                      </Badge>
                      <Play className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Teacher Dashboard */}
      {isTeacher && (
        <>
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Users className="h-6 w-6" />
                Bảng điều khiển giáo viên
              </CardTitle>
              <CardDescription className="text-green-700">
                Quản lý học viên và theo dõi tiến độ học tập
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{teacherStats.totalExamSets}</div>
                  <div className="text-sm text-green-700">Bộ đề thi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{teacherStats.totalStudents}</div>
                  <div className="text-sm text-green-700">Học viên</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{teacherStats.totalExams}</div>
                  <div className="text-sm text-green-700">Bài thi đã làm</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{teacherStats.averageScore.toFixed(0)}</div>
                  <div className="text-sm text-green-700">Điểm trung bình</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" asChild className="border-green-300 text-green-700 hover:bg-green-50">
                  <Link to="/exam-sets">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Quản lý bộ đề
                  </Link>
                </Button>
                <Button variant="outline" asChild className="border-green-300 text-green-700 hover:bg-green-50">
                  <Link to="/questions">
                    <FileText className="h-4 w-4 mr-2" />
                    Quản lý câu hỏi
                  </Link>
                </Button>
                <Button variant="outline" asChild className="border-green-300 text-green-700 hover:bg-green-50">
                  <Link to="/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Thống kê chi tiết
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Student Exams */}
          {recentStudentExams.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Bell className="h-5 w-5" />
                  Kết quả thi mới của học viên
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Có {recentStudentExams.length} bài thi được hoàn thành gần đây
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentStudentExams.slice(0, 3).map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="font-medium">{exam.profiles?.name || 'Học viên'}</p>
                        <p className="text-sm text-muted-foreground">{exam.exam_sets?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(exam.completed_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={exam.score >= 80 ? 'default' : exam.score >= 60 ? 'secondary' : 'destructive'}>
                          {exam.score}%
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => onViewExamResult(exam.id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Xem
                        </Button>
                      </div>
                    </div>
                  ))}
                  {recentStudentExams.length > 3 && (
                    <div className="text-center">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          window.location.href = '/student-exam-results';
                        }}
                      >
                        Xem tất cả ({recentStudentExams.length} bài thi)
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Progress Overview for Students */}
      {!isTeacher && analytics && analytics.totalAttempts > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tiến độ học tập của bạn
            </CardTitle>
            <CardDescription>
              Thống kê tổng quan về kết quả luyện tập TOEIC
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng câu đã làm</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formattedAnalytics.totalAttempts}
                  </p>
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Độ chính xác</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formattedAnalytics.accuracy.toFixed(0)}%
                  </p>
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Flame className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Chuỗi luyện tập</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formattedAnalytics.streakDays} ngày
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
