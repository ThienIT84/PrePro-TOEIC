import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
import { t } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Analytics, DrillType, ExamSet } from '@/types';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { permissions, isTeacher } = usePermissions();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [examSets, setExamSets] = useState<ExamSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentStudentExams, setRecentStudentExams] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch analytics data
      const { data: attempts } = await supabase
        .from('attempts')
        .select('*, questions(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch today's reviews
      const today = new Date().toISOString().split('T')[0];
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .lte('due_at', `${today}T23:59:59`);

      // Fetch exam sets
      const { data: examSetsData } = await supabase
        .from('exam_sets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      // Calculate analytics
      if (attempts) {
        const totalAttempts = attempts.length;
        const correctAnswers = attempts.filter(a => a.correct).length;
        const accuracy = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;
        
        const averageTime = attempts.reduce((acc, curr) => acc + (curr.time_ms || 0), 0) / totalAttempts || 0;
        
        // Calculate streak (simplified - count consecutive days with attempts)
        const uniqueDays = [...new Set(attempts.map(a => a.created_at.split('T')[0]))];
        const streakDays = uniqueDays.length;

        // Group by type
        const byType = {} as Record<DrillType, { attempts: number; correct: number; accuracy: number }>;
        const types: DrillType[] = ['vocab', 'grammar', 'listening', 'reading', 'mix'];
        
        types.forEach(type => {
          const typeAttempts = attempts.filter(a => a.items?.type === type);
          const typeCorrect = typeAttempts.filter(a => a.correct).length;
          byType[type] = {
            attempts: typeAttempts.length,
            correct: typeCorrect,
            accuracy: typeAttempts.length > 0 ? (typeCorrect / typeAttempts.length) * 100 : 0
          };
        });

        const analyticsData: Analytics = {
          totalAttempts,
          correctAnswers,
          accuracy,
          averageTime,
          streakDays,
          byType,
          byDifficulty: {
            easy: { attempts: 0, correct: 0, accuracy: 0 },
            medium: { attempts: 0, correct: 0, accuracy: 0 },
            hard: { attempts: 0, correct: 0, accuracy: 0 }
          }
        };

        setAnalytics(analyticsData);
      }

      setReviewCount(reviews?.length || 0);
      setExamSets(examSetsData || []);

      // Nếu là teacher, lấy kết quả thi gần đây của học sinh
      if (isTeacher()) {
        const { data: studentExams } = await supabase
          .from('exam_sessions')
          .select(`
            id,
            exam_set_id,
            user_id,
            score,
            completed_at,
            exam_sets (title)
          `)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(5);

        // Lọc chỉ học sinh của teacher này
        const { data: myStudents } = await supabase.rpc('get_teacher_students', {
          teacher_uuid: user.id
        });

        if (myStudents && studentExams) {
          const myStudentIds = myStudents.map(s => s.student_id);
          const filteredExams = studentExams.filter(exam => 
            myStudentIds.includes(exam.user_id)
          );

          // Lấy thông tin profile của học sinh
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, name')
            .in('user_id', myStudentIds);

          // Merge thông tin profile
          const examsWithProfiles = filteredExams.map(exam => ({
            ...exam,
            profiles: profiles?.find(p => p.user_id === exam.user_id) || null
          }));

          setRecentStudentExams(examsWithProfiles);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toeicParts = [
    {
      part: 1,
      title: 'Part 1 - Mô tả hình ảnh',
      description: '6 câu hỏi - Nghe và chọn mô tả đúng',
      icon: Headphones,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      part: 2,
      title: 'Part 2 - Hỏi đáp',
      description: '25 câu hỏi - Nghe câu hỏi và chọn câu trả lời',
      icon: Headphones,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      part: 3,
      title: 'Part 3 - Hội thoại',
      description: '39 câu hỏi - Nghe đoạn hội thoại',
      icon: Headphones,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      part: 4,
      title: 'Part 4 - Bài nói',
      description: '30 câu hỏi - Nghe bài nói ngắn',
      icon: Headphones,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      part: 5,
      title: 'Part 5 - Hoàn thành câu',
      description: '30 câu hỏi - Ngữ pháp và từ vựng',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      part: 6,
      title: 'Part 6 - Hoàn thành đoạn văn',
      description: '16 câu hỏi - Điền từ vào đoạn văn',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      part: 7,
      title: 'Part 7 - Đọc hiểu',
      description: '54 câu hỏi - Đọc hiểu đoạn văn',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
  ];

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
          <Badge variant={isTeacher() ? 'default' : 'secondary'} className="px-3 py-1">
            {isTeacher() ? 'Giáo viên' : 'Học viên'}
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
              {analytics?.accuracy.toFixed(0) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.totalAttempts || 0} câu đã làm
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chuỗi luyện tập</CardTitle>
            <Flame className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{analytics?.streakDays || 0}</div>
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
            {toeicParts.map((part) => (
              <Link
                key={part.part}
                to="/exam-selection"
                className="block group"
              >
                <div className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg hover:scale-105 ${part.bgColor} ${part.borderColor}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${part.bgColor}`}>
                      <part.icon className={`h-5 w-5 ${part.color}`} />
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
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teacher Dashboard */}
      {isTeacher() && (
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
                  <div className="text-2xl font-bold text-green-600">{examSets.length}</div>
                  <div className="text-sm text-green-700">Bộ đề thi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-green-700">Học viên</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-green-700">Bài thi đã làm</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
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
                          onClick={() => {
                            window.location.href = `/exam-result/${exam.id}`;
                          }}
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
      {!isTeacher() && analytics && analytics.totalAttempts > 0 && (
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
                    {analytics.totalAttempts}
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
                    {analytics.accuracy.toFixed(0)}%
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
                    {analytics.streakDays} ngày
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

export default Dashboard;