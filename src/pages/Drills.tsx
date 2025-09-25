import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { t } from '@/lib/i18n';
import { Play, Settings, BookOpen, Brain, Headphones, FileText, Shuffle } from 'lucide-react';
import type { Item, DrillType, Difficulty } from '@/types';
import DrillSession from '@/components/DrillSession';
import SessionComplete from '@/components/SessionComplete';
import StudyPlan from '@/components/StudyPlan';

interface SessionResults {
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  accuracy: number;
  results: Array<{
    itemId: string;
    correct: boolean;
    timeMs: number;
    response: string;
  }>;
}

const Drills = () => {
  const { user } = useAuth();
  const [sessionState, setSessionState] = useState<'setup' | 'active' | 'complete'>('setup');
  const [sessionItems, setSessionItems] = useState<Item[]>([]);
  const [sessionResults, setSessionResults] = useState<SessionResults | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Session configuration
  const [sessionConfig, setSessionConfig] = useState({
    type: 'mix' as DrillType | 'mix',
    difficulty: 'medium' as Difficulty | 'mix',
    questionCount: 10,
  });
  
  const [dailyProgress, setDailyProgress] = useState({ completed: 0, target: 50 });

  useEffect(() => {
    fetchDailyProgress();
  }, []);

  const startSession = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('items')
        .select('*');

      // Apply filters based on configuration
      if (sessionConfig.type !== 'mix') {
        query = query.eq('type', sessionConfig.type);
      }
      
      if (sessionConfig.difficulty !== 'mix') {
        query = query.eq('difficulty', sessionConfig.difficulty);
      }

      const { data, error } = await query
        .order('RANDOM()')
        .limit(sessionConfig.questionCount);

      if (error) {
        console.error('Error fetching questions:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải câu hỏi. Vui lòng thử lại.',
          variant: 'destructive',
        });
        return;
      }

      if (!data || data.length === 0) {
        toast({
          title: 'Không có câu hỏi',
          description: 'Không tìm thấy câu hỏi phù hợp với cấu hình của bạn.',
          variant: 'destructive',
        });
        return;
      }

      setSessionItems(data as Item[]);
      setSessionState('active');
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi bắt đầu phiên luyện tập.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyProgress = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attempts')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00Z`)
        .lt('created_at', `${today}T23:59:59Z`);

      if (!error && data) {
        setDailyProgress(prev => ({ ...prev, completed: data.length }));
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleSessionComplete = async (results: SessionResults) => {
    if (!user) return;

    try {
      // Record all attempts from the session
      const attempts = results.results.map(result => ({
        item_id: result.itemId,
        user_id: user.id,
        response: result.response,
        correct: result.correct,
        time_ms: result.timeMs
      }));

      const { error } = await supabase
        .from('attempts')
        .insert(attempts);

      if (error) {
        console.error('Error saving session results:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể lưu kết quả. Vui lòng thử lại.',
          variant: 'destructive',
        });
        return;
      }

      // Add wrong answers to review queue
      for (const result of results.results) {
        if (!result.correct) {
          await addToReviewQueue(result.itemId);
        }
      }

      // Update daily progress
      setDailyProgress(prev => ({ 
        ...prev, 
        completed: prev.completed + results.totalQuestions 
      }));

      setSessionResults(results);
      setSessionState('complete');

      toast({
        title: 'Hoàn thành!',
        description: `Bạn đã hoàn thành ${results.totalQuestions} câu với độ chính xác ${results.accuracy.toFixed(1)}%.`,
      });

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addToReviewQueue = async (itemId: string) => {
    if (!user) return;
    
    try {
      // Check if item already exists in review queue
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .maybeSingle();
      
      // Only add if not already in review queue
      if (!existingReview) {
        const { error } = await supabase
          .from('reviews')
          .insert({
            user_id: user.id,
            item_id: itemId,
            due_at: new Date().toISOString(),
            interval_days: 1,
            ease_factor: 250,
            repetitions: 0
          });
        
        if (error) {
          console.error('Error adding to review queue:', error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleNewSession = () => {
    setSessionState('setup');
    setSessionItems([]);
    setSessionResults(null);
  };

  const handleReviewMistakes = () => {
    // Navigate to review page or start a review session
    window.location.href = '/review';
  };

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  // Render different views based on session state
  if (sessionState === 'active' && sessionItems.length > 0) {
    return (
      <DrillSession
        items={sessionItems}
        onComplete={handleSessionComplete}
        onExit={handleNewSession}
        sessionType={sessionConfig.type === 'mix' ? undefined : sessionConfig.type}
        difficulty={sessionConfig.difficulty === 'mix' ? undefined : sessionConfig.difficulty}
      />
    );
  }

  if (sessionState === 'complete' && sessionResults) {
    return (
      <SessionComplete
        results={sessionResults}
        onNewSession={handleNewSession}
        onReviewMistakes={handleReviewMistakes}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  // Session setup view
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Luyện tập TOEIC</h1>
            <p className="text-muted-foreground">
              Tùy chỉnh phiên luyện tập theo nhu cầu của bạn
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            <span className="font-semibold">{dailyProgress.completed}</span>/{dailyProgress.target} câu hôm nay
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Session Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Start Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Bắt đầu nhanh
              </CardTitle>
              <CardDescription>
                Chọn loại luyện tập để bắt đầu ngay lập tức
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { type: 'vocab', icon: Brain, title: 'Từ vựng', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
                  { type: 'grammar', icon: BookOpen, title: 'Ngữ pháp', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/20' },
                  { type: 'listening', icon: Headphones, title: 'Nghe', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20' },
                  { type: 'reading', icon: FileText, title: 'Đọc', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' }
                ].map((drill) => (
                  <Button
                    key={drill.type}
                    variant="outline"
                    className={`h-20 flex-col gap-2 ${drill.bg} hover:shadow-md`}
                    onClick={() => {
                      setSessionConfig(prev => ({ ...prev, type: drill.type as DrillType }));
                      startSession();
                    }}
                  >
                    <drill.icon className={`h-6 w-6 ${drill.color}`} />
                    <span className="text-sm font-medium">{drill.title}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Session Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Tùy chỉnh phiên luyện tập
              </CardTitle>
              <CardDescription>
                Cấu hình chi tiết cho phiên luyện tập của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Type Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Loại câu hỏi</label>
                  <Select
                    value={sessionConfig.type}
                    onValueChange={(value) => setSessionConfig(prev => ({ 
                      ...prev, 
                      type: value as DrillType | 'mix' 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mix">
                        <div className="flex items-center gap-2">
                          <Shuffle className="h-4 w-4" />
                          Hỗn hợp
                        </div>
                      </SelectItem>
                      <SelectItem value="vocab">Từ vựng</SelectItem>
                      <SelectItem value="grammar">Ngữ pháp</SelectItem>
                      <SelectItem value="listening">Nghe hiểu</SelectItem>
                      <SelectItem value="reading">Đọc hiểu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Độ khó</label>
                  <Select
                    value={sessionConfig.difficulty}
                    onValueChange={(value) => setSessionConfig(prev => ({ 
                      ...prev, 
                      difficulty: value as Difficulty | 'mix' 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mix">Hỗn hợp</SelectItem>
                      <SelectItem value="easy">Dễ</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="hard">Khó</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Question Count */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Số câu hỏi</label>
                  <Select
                    value={sessionConfig.questionCount.toString()}
                    onValueChange={(value) => setSessionConfig(prev => ({ 
                      ...prev, 
                      questionCount: parseInt(value) 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 câu (5 phút)</SelectItem>
                      <SelectItem value="10">10 câu (10 phút)</SelectItem>
                      <SelectItem value="20">20 câu (20 phút)</SelectItem>
                      <SelectItem value="50">50 câu (50 phút)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={startSession} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Đang chuẩn bị...
                  </div>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Bắt đầu luyện tập ({sessionConfig.questionCount} câu)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Study Plan Sidebar */}
        <div className="space-y-6">
          <StudyPlan />
        </div>
      </div>
    </div>
  );
};

export default Drills;