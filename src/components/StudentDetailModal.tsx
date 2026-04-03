import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Target, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  BookOpen,
  Brain,
  Headphones,
  FileText,
  MessageSquare,
  Award,
  Clock,
  BarChart3,
  Edit,
  Save,
  X
} from 'lucide-react';
import { StudentProfile } from '@/services/teacherAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface StudentDetailModalProps {
  student: StudentProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

interface StudentStats {
  totalAttempts: number;
  avgScore: number;
  streakDays: number;
  lastActivity: string;
  skillPerformance: {
    vocabulary: number;
    grammar: number;
    listening: number;
    reading: number;
  };
  recentExams: Array<{
    id: string;
    title: string;
    score: number;
    completed_at: string;
  }>;
  weeklyProgress: Array<{
    week: string;
    attempts: number;
    score: number;
  }>;
}

const StudentDetailModal = ({ student, isOpen, onClose }: StudentDetailModalProps) => {
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);

  useEffect(() => {
    if (student && isOpen) {
      fetchStudentStats();
    }
  }, [student, isOpen]);

  const fetchStudentStats = async () => {
    if (!student) return;

    setLoading(true);
    try {
      // Get student attempts
      const { data: attempts } = await supabase
        .from('attempts')
        .select('*, questions(part, difficulty)')
        .eq('user_id', student.id)
        .order('created_at', { ascending: false });

      // Get student exam results
      const { data: exams } = await supabase
        .from('exam_sessions')
        .select('*, exam_sets(title)')
        .eq('user_id', student.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10);

      // Calculate skill performance based on TOEIC parts
      const skillPerformance = {
        vocabulary: 0,
        grammar: 0,
        listening: 0,
        reading: 0
      };

      const skillStats: Record<string, { correct: number; total: number }> = {};
      
      attempts?.forEach(attempt => {
        const part = attempt.questions?.part;
        if (part) {
          // Map TOEIC parts to skills
          let skill = '';
          if (part <= 4) {
            skill = 'listening';
          } else if (part === 5) {
            skill = 'grammar';
          } else if (part >= 6) {
            skill = 'reading';
          }
          
          if (skill) {
            if (!skillStats[skill]) {
              skillStats[skill] = { correct: 0, total: 0 };
            }
            skillStats[skill].total++;
            if (attempt.correct) {
              skillStats[skill].correct++;
            }
          }
        }
      });

      Object.entries(skillStats).forEach(([skill, stats]) => {
        if (skill in skillPerformance) {
          skillPerformance[skill as keyof typeof skillPerformance] = 
            stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        }
      });

      // Calculate weekly progress
      const weeklyProgress = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

        const weekAttempts = attempts?.filter(a => {
          const attemptDate = new Date(a.created_at);
          return attemptDate >= weekStart && attemptDate < weekEnd;
        }) || [];

        const weekScore = weekAttempts.length > 0 ?
          Math.round((weekAttempts.filter(a => a.correct).length / weekAttempts.length) * 100) : 0;

        weeklyProgress.push({
          week: `Week ${4 - i}`,
          attempts: weekAttempts.length,
          score: weekScore
        });
      }

      setStudentStats({
        totalAttempts: attempts?.length || 0,
        avgScore: student.avg_score,
        streakDays: student.streak_days,
        lastActivity: student.last_activity,
        skillPerformance,
        recentExams: exams?.map(exam => ({
          id: exam.id,
          title: exam.exam_sets?.title || 'Exam',
          score: exam.score,
          completed_at: exam.completed_at
        })) || [],
        weeklyProgress
      });

    } catch (error) {
      console.error('Error fetching student stats:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin chi tiết của học viên.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case 'vocabulary': return <Brain className="h-4 w-4" />;
      case 'grammar': return <BookOpen className="h-4 w-4" />;
      case 'listening': return <Headphones className="h-4 w-4" />;
      case 'reading': return <FileText className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
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

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Chi tiết học viên: {student.name}
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết và hiệu suất học tập của {student.name}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{student.target_score}</div>
                    <div className="text-sm text-muted-foreground">Mục tiêu</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{student.total_attempts}</div>
                    <div className="text-sm text-muted-foreground">Tổng câu hỏi</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{student.avg_score}%</div>
                    <div className="text-sm text-muted-foreground">Điểm TB</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{student.streak_days}</div>
                    <div className="text-sm text-muted-foreground">Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analytics */}
            <Tabs defaultValue="performance" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
                <TabsTrigger value="exams">Bài thi</TabsTrigger>
                <TabsTrigger value="progress">Tiến độ</TabsTrigger>
                <TabsTrigger value="notes">Ghi chú</TabsTrigger>
              </TabsList>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Hiệu suất theo kỹ năng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(studentStats?.skillPerformance || {}).map(([skill, score]) => (
                        <div key={skill} className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getSkillIcon(skill)}
                            <span className="font-medium capitalize">{skill}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                              {score}%
                            </span>
                            <Badge variant={getScoreBadgeVariant(score)}>
                              {score >= 80 ? 'Tốt' : score >= 60 ? 'Trung bình' : 'Cần cải thiện'}
                            </Badge>
                          </div>
                          <Progress value={score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weak/Strong Areas */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <TrendingDown className="h-5 w-5" />
                        Điểm yếu
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {student.weak_areas.map((area, index) => (
                          <Badge key={index} variant="destructive" className="mr-2">
                            {area}
                          </Badge>
                        ))}
                        {student.weak_areas.length === 0 && (
                          <p className="text-sm text-muted-foreground">Không có điểm yếu rõ ràng</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <TrendingUp className="h-5 w-5" />
                        Điểm mạnh
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {student.strong_areas.map((area, index) => (
                          <Badge key={index} variant="default" className="mr-2">
                            {area}
                          </Badge>
                        ))}
                        {student.strong_areas.length === 0 && (
                          <p className="text-sm text-muted-foreground">Chưa có điểm mạnh rõ ràng</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Exams Tab */}
              <TabsContent value="exams" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Bài thi gần đây
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {studentStats?.recentExams.map((exam) => (
                        <div key={exam.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{exam.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(exam.completed_at).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={getScoreBadgeVariant(exam.score)} className="text-lg">
                              {exam.score}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {(!studentStats?.recentExams || studentStats.recentExams.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">
                          Chưa có bài thi nào
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Progress Tab */}
              <TabsContent value="progress" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Tiến độ 4 tuần qua
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {studentStats?.weeklyProgress.map((week, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{week.week}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {week.attempts} câu hỏi
                              </span>
                              <Badge variant={getScoreBadgeVariant(week.score)}>
                                {week.score}%
                              </Badge>
                            </div>
                          </div>
                          <Progress value={week.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Ghi chú giáo viên
                    </CardTitle>
                    <CardDescription>
                      Thêm ghi chú cá nhân về học viên này
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {editingNotes ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="notes">Ghi chú</Label>
                          <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Nhập ghi chú về học viên..."
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => setEditingNotes(false)}>
                            <Save className="h-4 w-4 mr-2" />
                            Lưu
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingNotes(false)}>
                            <X className="h-4 w-4 mr-2" />
                            Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg min-h-[100px]">
                          {notes || (
                            <p className="text-muted-foreground italic">
                              Chưa có ghi chú nào. Click "Chỉnh sửa" để thêm ghi chú.
                            </p>
                          )}
                        </div>
                        <Button size="sm" onClick={() => setEditingNotes(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Gửi tin nhắn
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailModal;
