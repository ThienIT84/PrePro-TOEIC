import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
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

interface StudentExamResult {
  id: string;
  exam_set_id: string;
  user_id: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  time_spent: number;
  completed_at: string;
  exam_sets: {
    title: string;
    description: string | null;
  } | null;
  profiles: {
    name: string | null;
    user_id: string;
  } | null;
}

interface StudentStats {
  student_id: string;
  student_name: string;
  total_exams: number;
  average_score: number;
  best_score: number;
  latest_exam_date: string;
}

const StudentExamResults = () => {
  const navigate = useNavigate();
  const [examResults, setExamResults] = useState<StudentExamResult[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [viewingExamId, setViewingExamId] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentExamResults();
  }, []);

  const fetchStudentExamResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Không thể xác thực người dùng');
        return;
      }

      // Lấy danh sách học sinh của teacher
      const { data: students, error: studentsError } = await supabase.rpc('get_teacher_students', {
        teacher_uuid: user.id
      });

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        setError('Không thể tải danh sách học sinh');
        return;
      }

      if (!students || students.length === 0) {
        setError('Bạn chưa có học sinh nào');
        return;
      }

      // Lấy kết quả thi của tất cả học sinh
      const studentIds = students.map(s => s.student_id);
      const { data: results, error: resultsError } = await supabase
        .from('exam_sessions')
        .select(`
          id,
          exam_set_id,
          user_id,
          total_questions,
          correct_answers,
          score,
          time_spent,
          completed_at,
          exam_sets (title, description)
        `)
        .in('user_id', studentIds)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (resultsError) {
        console.error('Error fetching exam results:', resultsError);
        setError('Không thể tải kết quả thi');
        return;
      }

      // Lấy thông tin profile của học sinh
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', studentIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setError('Không thể tải thông tin học sinh');
        return;
      }

      // Merge thông tin profile vào results
      const resultsWithProfiles = (results || []).map(result => ({
        ...result,
        profiles: profiles?.find(p => p.user_id === result.user_id) || null
      }));

      setExamResults(resultsWithProfiles);

      // Tính toán thống kê cho từng học sinh
      const stats = students.map(student => {
        try {
          const studentResults = results?.filter(r => r.user_id === student.student_id) || [];
          const totalExams = studentResults.length;
          const averageScore = totalExams > 0 
            ? Math.round(studentResults.reduce((sum, r) => sum + r.score, 0) / totalExams)
            : 0;
          const bestScore = totalExams > 0 
            ? Math.max(...studentResults.map(r => r.score))
            : 0;
          const latestExamDate = totalExams > 0 
            ? studentResults[0].completed_at
            : '';

          return {
            student_id: student.student_id,
            student_name: student.student_name,
            total_exams: totalExams,
            average_score: averageScore,
            best_score: bestScore,
            latest_exam_date: latestExamDate
          };
        } catch (error) {
          console.error(`Error processing student ${student.student_name}:`, error);
          return {
            student_id: student.student_id,
            student_name: student.student_name,
            total_exams: 0,
            average_score: 0,
            best_score: 0,
            latest_exam_date: ''
          };
        }
      });

      setStudentStats(stats);

    } catch (err: any) {
      console.error('Error:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-lg text-muted-foreground">Đang tải kết quả thi của học sinh...</p>
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
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại Dashboard
        </Button>
      </div>
    );
  }

  const filteredResults = selectedStudent 
    ? examResults.filter(r => r.user_id === selectedStudent)
    : examResults;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kết quả thi của học sinh</h1>
          <p className="text-muted-foreground">
            Theo dõi tiến độ và kết quả thi của học sinh
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard')} variant="outline">
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
            <div className="text-2xl font-bold">{studentStats.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng bài thi</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{examResults.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm TB</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {examResults.length > 0 
                ? Math.round(examResults.reduce((sum, r) => sum + r.score, 0) / examResults.length)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm cao nhất</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {examResults.length > 0 
                ? Math.max(...examResults.map(r => r.score))
                : 0}%
            </div>
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
                        onClick={() => setSelectedStudent(student.student_id)}
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
                                setViewingExamId(result.id);
                                navigate(`/exam-result/${result.id}`);
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

export default StudentExamResults;
