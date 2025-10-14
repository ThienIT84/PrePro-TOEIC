import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Target, TrendingUp, Clock, Calendar, CheckCircle } from 'lucide-react';
import TeacherAnalytics from '@/components/TeacherAnalytics';
import ErrorBoundary from '@/components/ErrorBoundary';

interface AnalyticsData {
  totalAttempts: number;
  correctAttempts: number;
  averageTime: number;
  streakDays: number;
  weeklyProgress: Array<{
    date: string;
    attempts: number;
    correct: number;
  }>;
  topicPerformance: Array<{
    type: string;
    total: number;
    correct: number;
    accuracy: number;
  }>;
  difficultyPerformance: Array<{
    difficulty: string;
    total: number;
    correct: number;
    accuracy: number;
  }>;
}

const Analytics = () => {
  const { user, profile } = useAuth();
  const { isTeacher } = usePermissions();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch attempts with question details
      const { data: attempts, error: attemptsError } = await supabase
        .from('attempts')
        .select(`
          *,
          question:questions(part, difficulty, status)
        `)
        .eq('user_id', user.id)
        .eq('question.status', 'published')
        .order('created_at', { ascending: false });

      if (attemptsError) {
        console.error('Error fetching attempts:', attemptsError);
        return;
      }

      // Fetch exam sessions for more comprehensive data
      const { data: examSessions, error: examError } = await supabase
        .from('exam_sessions')
        .select(`
          *,
          exam_sets(title, type, difficulty)
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (examError) {
        console.error('Error fetching exam sessions:', examError);
      }

      // Combine attempts and exam data
      const allAttempts = attempts || [];
      const allExams = examSessions || [];

      // Calculate total and correct attempts
      const totalAttempts = allAttempts.length;
      const correctAttempts = allAttempts.filter(a => a.correct).length;
      
      // Add exam data to totals
      const totalExamQuestions = allExams.reduce((sum, exam) => sum + (exam.total_questions || 0), 0);
      const totalExamCorrect = allExams.reduce((sum, exam) => sum + (exam.correct_answers || 0), 0);
      
      const grandTotalAttempts = totalAttempts + totalExamQuestions;
      const grandTotalCorrect = correctAttempts + totalExamCorrect;
      
      // Calculate average time (in seconds) - only for attempts with time data
      const attemptsWithTime = allAttempts.filter(a => a.time_ms && a.time_ms > 0);
      const averageTime = attemptsWithTime.length > 0 
        ? attemptsWithTime.reduce((sum, a) => sum + (a.time_ms || 0), 0) / attemptsWithTime.length / 1000
        : 0;

      // Calculate streak (consecutive days with activity)
      const streakDays = calculateStreak(allAttempts, allExams);

      // Weekly progress (last 7 days)
      const weeklyProgress = calculateWeeklyProgress(allAttempts, allExams);

      // Topic performance
      const topicPerformance = calculateTopicPerformance(allAttempts, allExams);

      // Difficulty performance
      const difficultyPerformance = calculateDifficultyPerformance(allAttempts, allExams);

      setAnalytics({
        totalAttempts: grandTotalAttempts,
        correctAttempts: grandTotalCorrect,
        averageTime,
        streakDays,
        weeklyProgress,
        topicPerformance,
        difficultyPerformance,
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (attempts: any[], examSessions: any[] = []) => {
    // Combine all activity dates
    const allDates = new Set<string>();
    
    attempts.forEach(attempt => {
      if (attempt.created_at) {
        allDates.add(attempt.created_at.split('T')[0]);
      }
    });
    
    examSessions.forEach(exam => {
      if (exam.completed_at) {
        allDates.add(exam.completed_at.split('T')[0]);
      }
    });
    
    if (allDates.size === 0) return 0;
    
    const sortedDates = Array.from(allDates).sort().reverse();
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasActivity = sortedDates.includes(dateStr);
      
      if (hasActivity) {
        streak++;
      } else if (i > 0) { // Don't break on first day (today) if no activity yet
        break;
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  const calculateWeeklyProgress = (attempts: any[], examSessions: any[] = []) => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Count attempts for this day
      const dayAttempts = attempts.filter(a => 
        a.created_at && a.created_at.startsWith(dateStr)
      );
      
      // Count exam sessions for this day
      const dayExams = examSessions.filter(e => 
        e.completed_at && e.completed_at.startsWith(dateStr)
      );
      
      // Calculate total questions from exams
      const examQuestions = dayExams.reduce((sum, exam) => sum + (exam.total_questions || 0), 0);
      const examCorrect = dayExams.reduce((sum, exam) => sum + (exam.correct_answers || 0), 0);
      
      last7Days.push({
        date: dateStr,
        attempts: dayAttempts.length + examQuestions,
        correct: dayAttempts.filter(a => a.correct).length + examCorrect,
      });
    }
    
    return last7Days;
  };

  const calculateTopicPerformance = (attempts: any[], examSessions: any[] = []) => {
    const topicStats: Record<string, { total: number; correct: number }> = {};
    
    // Process attempts
    attempts.forEach(attempt => {
      if (attempt.question?.part) {
        const part = attempt.question.part;
        // Map TOEIC parts to topics
        let topic = '';
        if (part <= 4) {
          topic = 'listening';
        } else if (part === 5) {
          topic = 'grammar';
        } else if (part >= 6) {
          topic = 'reading';
        }
        
        if (topic) {
          if (!topicStats[topic]) {
            topicStats[topic] = { total: 0, correct: 0 };
          }
          topicStats[topic].total++;
          if (attempt.correct) {
            topicStats[topic].correct++;
          }
        }
      }
    });
    
    // Process exam sessions
    examSessions.forEach(exam => {
      if (exam.exam_sets?.type) {
        const examType = exam.exam_sets.type;
        let topic = '';
        
        // Map exam types to topics
        switch (examType) {
          case 'listening':
            topic = 'listening';
            break;
          case 'grammar':
            topic = 'grammar';
            break;
          case 'reading':
            topic = 'reading';
            break;
          case 'vocab':
            topic = 'vocabulary';
            break;
          case 'mix':
            // For mixed exams, distribute across all topics
            const totalQuestions = exam.total_questions || 0;
            const correctAnswers = exam.correct_answers || 0;
            const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
            
            ['listening', 'grammar', 'reading', 'vocabulary'].forEach(t => {
              if (!topicStats[t]) {
                topicStats[t] = { total: 0, correct: 0 };
              }
              topicStats[t].total += Math.floor(totalQuestions / 4);
              topicStats[t].correct += Math.floor(correctAnswers * accuracy / 4);
            });
            return;
        }
        
        if (topic) {
          if (!topicStats[topic]) {
            topicStats[topic] = { total: 0, correct: 0 };
          }
          topicStats[topic].total += exam.total_questions || 0;
          topicStats[topic].correct += exam.correct_answers || 0;
        }
      }
    });
    
    return Object.entries(topicStats).map(([topic, stats]) => ({
      type: topic,
      total: stats.total,
      correct: stats.correct,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
    }));
  };

  const calculateDifficultyPerformance = (attempts: any[], examSessions: any[] = []) => {
    const difficultyStats: Record<string, { total: number; correct: number }> = {};
    
    // Process attempts
    attempts.forEach(attempt => {
      if (attempt.question?.difficulty) {
        const difficulty = attempt.question.difficulty;
        if (!difficultyStats[difficulty]) {
          difficultyStats[difficulty] = { total: 0, correct: 0 };
        }
        difficultyStats[difficulty].total++;
        if (attempt.correct) {
          difficultyStats[difficulty].correct++;
        }
      }
    });
    
    // Process exam sessions
    examSessions.forEach(exam => {
      if (exam.exam_sets?.difficulty) {
        const difficulty = exam.exam_sets.difficulty;
        if (!difficultyStats[difficulty]) {
          difficultyStats[difficulty] = { total: 0, correct: 0 };
        }
        difficultyStats[difficulty].total += exam.total_questions || 0;
        difficultyStats[difficulty].correct += exam.correct_answers || 0;
      }
    });
    
    return Object.entries(difficultyStats).map(([difficulty, stats]) => ({
      difficulty,
      total: stats.total,
      correct: stats.correct,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải thống kê...</p>
          </div>
        </div>
      </div>
    );
  }

  const accuracyPercentage = analytics && analytics.totalAttempts > 0 
    ? (analytics.correctAttempts / analytics.totalAttempts) * 100 
    : 0;

  // Show teacher analytics if user is a teacher
  if (isTeacher()) {
    return (
      <ErrorBoundary>
        <TeacherAnalytics />
      </ErrorBoundary>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Thống kê tiến độ</h1>
        </div>
        <p className="text-muted-foreground">
          Theo dõi quá trình học tập và cải thiện kỹ năng TOEIC của bạn
        </p>
      </div>

      {analytics && analytics.totalAttempts > 0 ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Tổng câu hỏi</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalAttempts}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.correctAttempts} câu đúng
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Độ chính xác</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accuracyPercentage.toFixed(1)}%</div>
                <Progress value={accuracyPercentage} className="h-1 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Thời gian TB</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.averageTime.toFixed(1)}s</div>
                <p className="text-xs text-muted-foreground">
                  Mỗi câu hỏi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Streak</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.streakDays}</div>
                <p className="text-xs text-muted-foreground">
                  ngày liên tiếp
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Tabs defaultValue="weekly" className="space-y-4">
            <TabsList>
              <TabsTrigger value="weekly">7 ngày qua</TabsTrigger>
              <TabsTrigger value="topics">Theo chủ đề</TabsTrigger>
              <TabsTrigger value="difficulty">Theo độ khó</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly">
              <Card>
                <CardHeader>
                  <CardTitle>Tiến độ 7 ngày qua</CardTitle>
                  <CardDescription>
                    Số lượng câu hỏi và độ chính xác theo ngày
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.weeklyProgress.map((day, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-20 text-sm text-muted-foreground">
                          {new Date(day.date).toLocaleDateString('vi-VN', { 
                            weekday: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="text-sm font-medium">
                              {day.attempts} câu
                            </div>
                            <div className="text-sm text-green-600">
                              ({day.correct} đúng)
                            </div>
                          </div>
                          <Progress 
                            value={day.attempts > 0 ? (day.correct / day.attempts) * 100 : 0} 
                            className="h-2"
                          />
                        </div>
                        <div className="w-12 text-sm text-right">
                          {day.attempts > 0 ? `${((day.correct / day.attempts) * 100).toFixed(0)}%` : '0%'}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="topics">
              <Card>
                <CardHeader>
                  <CardTitle>Kết quả theo chủ đề</CardTitle>
                  <CardDescription>
                    Độ chính xác theo từng loại câu hỏi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topicPerformance.map((topic, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{topic.type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {topic.correct}/{topic.total} câu
                            </span>
                          </div>
                          <div className="text-sm font-medium">
                            {topic.accuracy.toFixed(1)}%
                          </div>
                        </div>
                        <Progress value={topic.accuracy} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="difficulty">
              <Card>
                <CardHeader>
                  <CardTitle>Kết quả theo độ khó</CardTitle>
                  <CardDescription>
                    Độ chính xác theo mức độ khó của câu hỏi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.difficultyPerformance.map((diff, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                diff.difficulty === 'easy' ? 'secondary' : 
                                diff.difficulty === 'medium' ? 'default' : 'destructive'
                              }
                            >
                              {diff.difficulty === 'easy' ? 'Dễ' : 
                               diff.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {diff.correct}/{diff.total} câu
                            </span>
                          </div>
                          <div className="text-sm font-medium">
                            {diff.accuracy.toFixed(1)}%
                          </div>
                        </div>
                        <Progress value={diff.accuracy} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Goal Progress */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Mục tiêu TOEIC</CardTitle>
              </div>
              <CardDescription>
                Tiến độ hướng tới điểm số mục tiêu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Điểm mục tiêu:</span>
                  <Badge variant="secondary">{profile?.target_score || 700}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Độ chính xác hiện tại:</span>
                  <span className="text-sm">{accuracyPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(accuracyPercentage, 100)} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {accuracyPercentage >= 85 
                    ? 'Tuyệt vời! Bạn đang trên đường đạt mục tiêu!' 
                    : accuracyPercentage >= 70
                    ? 'Tiến bộ tốt! Hãy tiếp tục luyện tập.'
                    : 'Hãy luyện tập thêm để cải thiện độ chính xác.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có dữ liệu</h3>
            <p className="text-muted-foreground mb-4">
              Hãy bắt đầu luyện tập để xem thống kê tiến độ của bạn.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Dữ liệu thống kê sẽ hiển thị khi bạn:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Làm bài tập luyện tập (attempts)</li>
                <li>Hoàn thành các bài thi (exam sessions)</li>
                <li>Có ít nhất một câu hỏi đã trả lời</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
