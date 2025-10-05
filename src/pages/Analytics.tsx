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
      // Fetch attempts with item details
      const { data: attempts, error } = await supabase
        .from('attempts')
        .select(`
          *,
          item:items(type, difficulty)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching analytics:', error);
        return;
      }

      if (!attempts) return;

      // Calculate total and correct attempts
      const totalAttempts = attempts.length;
      const correctAttempts = attempts.filter(a => a.correct).length;
      
      // Calculate average time (in seconds)
      const averageTime = attempts.reduce((sum, a) => sum + (a.time_ms || 0), 0) / attempts.length / 1000;

      // Calculate streak (simplified - consecutive days with attempts)
      const streakDays = calculateStreak(attempts);

      // Weekly progress (last 7 days)
      const weeklyProgress = calculateWeeklyProgress(attempts);

      // Topic performance
      const topicPerformance = calculateTopicPerformance(attempts);

      // Difficulty performance
      const difficultyPerformance = calculateDifficultyPerformance(attempts);

      setAnalytics({
        totalAttempts,
        correctAttempts,
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

  const calculateStreak = (attempts: any[]) => {
    if (attempts.length === 0) return 0;
    
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasAttempts = attempts.some(a => 
        a.created_at.startsWith(dateStr)
      );
      
      if (hasAttempts) {
        streak++;
      } else if (i > 0) { // Don't break on first day (today) if no attempts yet
        break;
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  const calculateWeeklyProgress = (attempts: any[]) => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAttempts = attempts.filter(a => 
        a.created_at.startsWith(dateStr)
      );
      
      last7Days.push({
        date: dateStr,
        attempts: dayAttempts.length,
        correct: dayAttempts.filter(a => a.correct).length,
      });
    }
    
    return last7Days;
  };

  const calculateTopicPerformance = (attempts: any[]) => {
    const topicStats: Record<string, { total: number; correct: number }> = {};
    
    attempts.forEach(attempt => {
      if (attempt.item?.type) {
        const type = attempt.item.type;
        if (!topicStats[type]) {
          topicStats[type] = { total: 0, correct: 0 };
        }
        topicStats[type].total++;
        if (attempt.correct) {
          topicStats[type].correct++;
        }
      }
    });
    
    return Object.entries(topicStats).map(([type, stats]) => ({
      type,
      total: stats.total,
      correct: stats.correct,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
    }));
  };

  const calculateDifficultyPerformance = (attempts: any[]) => {
    const difficultyStats: Record<string, { total: number; correct: number }> = {};
    
    attempts.forEach(attempt => {
      if (attempt.item?.difficulty) {
        const difficulty = attempt.item.difficulty;
        if (!difficultyStats[difficulty]) {
          difficultyStats[difficulty] = { total: 0, correct: 0 };
        }
        difficultyStats[difficulty].total++;
        if (attempt.correct) {
          difficultyStats[difficulty].correct++;
        }
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

  const accuracyPercentage = analytics ? (analytics.correctAttempts / analytics.totalAttempts) * 100 || 0 : 0;

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

      {analytics ? (
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
            <p className="text-muted-foreground">
              Hãy bắt đầu luyện tập để xem thống kê tiến độ của bạn.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;