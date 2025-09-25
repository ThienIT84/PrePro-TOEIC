import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, BookOpen, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import type { DrillType, Difficulty } from '@/types';

interface WeakArea {
  type: DrillType;
  accuracy: number;
  totalAttempts: number;
  priority: 'high' | 'medium' | 'low';
}

interface StudyRecommendation {
  title: string;
  description: string;
  type: DrillType;
  difficulty: Difficulty;
  estimatedTime: number; // minutes
  priority: number;
}

const StudyPlan = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState({ target: 50, completed: 0 });

  useEffect(() => {
    if (user) {
      analyzePerformance();
    }
  }, [user]);

  const analyzePerformance = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get recent attempts (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: attempts, error } = await supabase
        .from('attempts')
        .select(`
          *,
          item:items(type, difficulty)
        `)
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) {
        console.error('Error fetching performance data:', error);
        return;
      }

      if (!attempts || attempts.length === 0) {
        setRecommendations(getDefaultRecommendations());
        setLoading(false);
        return;
      }

      // Analyze weak areas by type
      const typeStats: Record<DrillType, { correct: number; total: number }> = {
        vocab: { correct: 0, total: 0 },
        grammar: { correct: 0, total: 0 },
        listening: { correct: 0, total: 0 },
        reading: { correct: 0, total: 0 },
        mix: { correct: 0, total: 0 }
      };

      attempts.forEach(attempt => {
        if (attempt.item?.type) {
          const type = attempt.item.type as DrillType;
          typeStats[type].total++;
          if (attempt.correct) {
            typeStats[type].correct++;
          }
        }
      });

      // Calculate weak areas
      const weakAreasData: WeakArea[] = Object.entries(typeStats)
        .filter(([_, stats]) => stats.total > 0)
        .map(([type, stats]) => {
          const accuracy = (stats.correct / stats.total) * 100;
          let priority: 'high' | 'medium' | 'low' = 'low';
          
          if (accuracy < 60) priority = 'high';
          else if (accuracy < 80) priority = 'medium';
          
          return {
            type: type as DrillType,
            accuracy,
            totalAttempts: stats.total,
            priority
          };
        })
        .sort((a, b) => a.accuracy - b.accuracy); // Sort by accuracy (worst first)

      setWeakAreas(weakAreasData);

      // Generate recommendations
      const recommendationsData = generateRecommendations(weakAreasData, profile?.focus || []);
      setRecommendations(recommendationsData);

      // Calculate weekly progress
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);
      
      const weeklyAttempts = attempts.filter(a => 
        new Date(a.created_at) >= thisWeek
      ).length;

      setWeeklyGoal(prev => ({ ...prev, completed: weeklyAttempts }));

    } catch (error) {
      console.error('Error analyzing performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (weakAreas: WeakArea[], focusAreas: string[]): StudyRecommendation[] => {
    const recommendations: StudyRecommendation[] = [];

    // Add recommendations for weak areas
    weakAreas.slice(0, 3).forEach((area, index) => {
      let difficulty: Difficulty = 'medium';
      if (area.accuracy < 50) difficulty = 'easy';
      else if (area.accuracy > 80) difficulty = 'hard';

      recommendations.push({
        title: getRecommendationTitle(area.type, area.priority),
        description: getRecommendationDescription(area.type, area.accuracy),
        type: area.type,
        difficulty,
        estimatedTime: area.priority === 'high' ? 20 : 15,
        priority: index + 1
      });
    });

    // Add focus area recommendations
    focusAreas.forEach(focus => {
      if (!weakAreas.find(w => w.type === focus)) {
        recommendations.push({
          title: `Củng cố ${getTypeName(focus as DrillType)}`,
          description: `Duy trì và nâng cao kỹ năng ${getTypeName(focus as DrillType)} theo mục tiêu của bạn.`,
          type: focus as DrillType,
          difficulty: 'medium',
          estimatedTime: 15,
          priority: 4
        });
      }
    });

    return recommendations.slice(0, 5); // Limit to 5 recommendations
  };

  const getDefaultRecommendations = (): StudyRecommendation[] => [
    {
      title: 'Bắt đầu với Từ vựng cơ bản',
      description: 'Học từ vựng TOEIC thiết yếu để xây dựng nền tảng vững chắc.',
      type: 'vocab',
      difficulty: 'easy',
      estimatedTime: 15,
      priority: 1
    },
    {
      title: 'Ngữ pháp cơ bản',
      description: 'Nắm vững các cấu trúc ngữ pháp quan trọng trong TOEIC.',
      type: 'grammar',
      difficulty: 'easy',
      estimatedTime: 20,
      priority: 2
    },
    {
      title: 'Luyện nghe cơ bản',
      description: 'Làm quen với âm thanh và tốc độ nói trong bài thi TOEIC.',
      type: 'listening',
      difficulty: 'easy',
      estimatedTime: 15,
      priority: 3
    }
  ];

  const getRecommendationTitle = (type: DrillType, priority: 'high' | 'medium' | 'low'): string => {
    const typeNames = {
      vocab: 'Từ vựng',
      grammar: 'Ngữ pháp', 
      listening: 'Nghe hiểu',
      reading: 'Đọc hiểu',
      mix: 'Hỗn hợp'
    };

    if (priority === 'high') return `🚨 Cải thiện ${typeNames[type]} ngay`;
    if (priority === 'medium') return `📈 Nâng cao ${typeNames[type]}`;
    return `✨ Hoàn thiện ${typeNames[type]}`;
  };

  const getRecommendationDescription = (type: DrillType, accuracy: number): string => {
    const messages = {
      high: `Bạn cần tập trung vào ${getTypeName(type)} với độ chính xác chỉ ${accuracy.toFixed(0)}%.`,
      medium: `Hãy luyện tập thêm ${getTypeName(type)} để đạt được kết quả tốt hơn.`,
      low: `Tiếp tục duy trì phong độ tốt ở ${getTypeName(type)}.`
    };

    if (accuracy < 60) return messages.high;
    if (accuracy < 80) return messages.medium;
    return messages.low;
  };

  const getTypeName = (type: DrillType): string => {
    const names = {
      vocab: 'Từ vựng',
      grammar: 'Ngữ pháp',
      listening: 'Nghe hiểu', 
      reading: 'Đọc hiểu',
      mix: 'Hỗn hợp'
    };
    return names[type];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getDaysUntilTest = () => {
    if (!profile?.test_date) return null;
    const testDate = new Date(profile.test_date);
    const now = new Date();
    const diffTime = testDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const daysToTest = getDaysUntilTest();

  return (
    <div className="space-y-6">
      {/* Test Date Countdown */}
      {daysToTest && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Ngày thi TOEIC</h3>
                <p className="text-muted-foreground">
                  Còn <span className="font-bold text-primary">{daysToTest} ngày</span> để chuẩn bị
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Goal */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Mục tiêu tuần này</CardTitle>
          </div>
          <CardDescription>
            Hãy hoàn thành {weeklyGoal.target} câu hỏi trong tuần
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tiến độ</span>
              <span>{weeklyGoal.completed}/{weeklyGoal.target} câu</span>
            </div>
            <Progress 
              value={(weeklyGoal.completed / weeklyGoal.target) * 100} 
              className="h-2" 
            />
            {weeklyGoal.completed >= weeklyGoal.target && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Hoàn thành mục tiêu tuần!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weak Areas */}
      {weakAreas.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Khu vực cần cải thiện</CardTitle>
            </div>
            <CardDescription>
              Dựa trên kết quả 30 ngày gần đây
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weakAreas.slice(0, 3).map((area, index) => (
                <div key={area.type} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{getTypeName(area.type)}</div>
                      <div className="text-sm text-muted-foreground">
                        {area.totalAttempts} câu • {area.accuracy.toFixed(0)}% đúng
                      </div>
                    </div>
                  </div>
                  <Badge variant={getPriorityColor(area.priority) as any}>
                    {area.priority === 'high' ? 'Ưu tiên cao' : 
                     area.priority === 'medium' ? 'Ưu tiên trung bình' : 'Cần cải thiện'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Kế hoạch học tập được đề xuất</CardTitle>
          </div>
          <CardDescription>
            Các bài luyện tập phù hợp với trình độ hiện tại của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{rec.estimatedTime} phút</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{getTypeName(rec.type)}</Badge>
                    <Badge variant={
                      rec.difficulty === 'easy' ? 'secondary' : 
                      rec.difficulty === 'medium' ? 'default' : 'destructive'
                    }>
                      {rec.difficulty === 'easy' ? 'Dễ' : 
                       rec.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline">
                    Bắt đầu luyện tập
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyPlan;