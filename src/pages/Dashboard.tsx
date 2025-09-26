import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Brain, 
  Headphones, 
  FileText, 
  Trophy, 
  Calendar, 
  Target,
  Flame,
  TrendingUp,
  Clock,
  Play,
  RotateCcw
} from 'lucide-react';
import { t } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Analytics, DrillType } from '@/types';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
        .select('*, items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch today's reviews
      const today = new Date().toISOString().split('T')[0];
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .lte('due_at', `${today}T23:59:59`);

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
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const drillTypes = [
    {
      type: 'vocab' as DrillType,
      title: t('drill.vocabulary'),
      description: 'TOEIC từ vựng chủ đề',
      icon: Brain,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      type: 'grammar' as DrillType,
      title: t('drill.grammar'),
      description: 'Ngữ pháp & cấu trúc',
      icon: BookOpen,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      type: 'listening' as DrillType,
      title: t('drill.listening'),
      description: 'Luyện nghe mini',
      icon: Headphones,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      type: 'reading' as DrillType,
      title: t('drill.reading'),
      description: 'Đọc hiểu ngắn',
      icon: FileText,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
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
      <div>
        <h1 className="text-3xl font-bold">
          {t('dashboard.welcome')}
        </h1>
        <p className="text-muted-foreground mt-1">
          Sẵn sàng cho buổi luyện tập hôm nay?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Flame className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.streakDays || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('common.days')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.accuracy')}</CardTitle>
            <Target className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.accuracy.toFixed(0) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.totalAttempts || 0} câu hỏi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.today_review')}</CardTitle>
            <Calendar className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewCount}</div>
            <p className="text-xs text-muted-foreground">
              câu cần ôn tập
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mục tiêu</CardTitle>
            <Trophy className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.target_score || 700}</div>
            <p className="text-xs text-muted-foreground">
              điểm TOEIC
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Start Drills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              {t('dashboard.quick_start')}
            </CardTitle>
            <CardDescription>
              Chọn loại luyện tập để bắt đầu ngay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {drillTypes.map(drill => (
                <Link
                  key={drill.type}
                  to={`/drills`}
                  className="block group"
                >
                  <div className={`p-4 rounded-lg border transition-all hover:shadow-md ${drill.bgColor}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <drill.icon className={`h-5 w-5 ${drill.color}`} />
                      <span className="font-medium text-sm">{drill.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {drill.description}
                    </p>
                    {analytics?.byType[drill.type] && (
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {analytics.byType[drill.type].accuracy.toFixed(0)}%
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {analytics.byType[drill.type].attempts} câu
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Review */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Ôn tập hôm nay
            </CardTitle>
            <CardDescription>
              {reviewCount > 0 ? `${reviewCount} câu cần ôn tập` : 'Không có câu nào cần ôn tập'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reviewCount > 0 ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Tiến độ ôn tập</span>
                    <span>0/{reviewCount}</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                <Button asChild className="w-full">
                  <Link to="/review">
                    Bắt đầu ôn tập
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Tuyệt vời! Bạn đã hoàn thành hết ôn tập hôm nay.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      {analytics && analytics.totalAttempts > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('dashboard.your_progress')}
            </CardTitle>
            <CardDescription>
              Thống kê tổng quan về kết quả luyện tập
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {drillTypes.map(drill => {
                const stats = analytics.byType[drill.type];
                return (
                  <div key={drill.type} className="text-center space-y-2">
                    <drill.icon className={`h-6 w-6 mx-auto ${drill.color}`} />
                    <div>
                      <p className="text-sm font-medium">{drill.title}</p>
                      <p className="text-lg font-bold">
                        {stats.accuracy.toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stats.attempts} câu
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;