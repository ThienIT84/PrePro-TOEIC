import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  Award, 
  BookOpen, 
  Brain, 
  Headphones, 
  FileText,
  TrendingUp,
  AlertTriangle,
  Filter,
  Search,
  RefreshCw,
  Eye,
  MessageSquare,
  Calendar,
  Users,
  Target,
  Zap
} from 'lucide-react';
import { ActivityEvent } from '@/services/teacherAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EnhancedActivityTimelineProps {
  studentIds: string[];
  refreshTrigger?: number;
}

interface ActivityFilter {
  type: 'all' | 'exam' | 'drill' | 'review' | 'achievement';
  timeRange: 'today' | 'week' | 'month' | 'all';
  studentId?: string;
}

const EnhancedActivityTimeline = ({ studentIds, refreshTrigger }: EnhancedActivityTimelineProps) => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<ActivityFilter>({
    type: 'all',
    timeRange: 'week'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchActivities();
  }, [studentIds, filter, refreshTrigger]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchActivities(true); // Silent refresh
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchActivities = async (silent = false) => {
    if (!silent) setLoading(true);
    
    try {
      let query = supabase
        .from('exam_sessions')
        .select(`
          id,
          user_id,
          score,
          completed_at,
          exam_sets(title, type),
          profiles(name)
        `)
        .in('user_id', studentIds)
        .eq('status', 'completed');

      // Apply time filter
      if (filter.timeRange !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (filter.timeRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }
        
        query = query.gte('completed_at', startDate.toISOString());
      }

      // Apply student filter
      if (filter.studentId) {
        query = query.eq('user_id', filter.studentId);
      }

      const { data: exams } = await query
        .order('completed_at', { ascending: false })
        .limit(50);

      // Get drill activities
      let drillQuery = supabase
        .from('attempts')
        .select(`
          user_id,
          correct,
          created_at,
          questions(part),
          profiles(name)
        `)
        .in('user_id', studentIds);

      // Apply time filter for drills
      if (filter.timeRange !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (filter.timeRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }
        
        drillQuery = drillQuery.gte('created_at', startDate.toISOString());
      }

      // Apply student filter for drills
      if (filter.studentId) {
        drillQuery = drillQuery.eq('user_id', filter.studentId);
      }

      const { data: attempts } = await drillQuery
        .order('created_at', { ascending: false })
        .limit(50);

      // Combine and format activities
      const allActivities: ActivityEvent[] = [];

      // Add exam activities
      exams?.forEach(exam => {
        allActivities.push({
          id: exam.id,
          student_id: exam.user_id,
          student_name: (exam as any).profiles?.name || 'Unknown',
          type: 'exam',
          title: exam.exam_sets?.title || 'Exam',
          score: exam.score,
          timestamp: exam.completed_at,
          details: `Score: ${exam.score}%`
        });
      });

      // Add drill activities (grouped by session)
      const drillSessions = new Map<string, unknown[]>();
      attempts?.forEach(attempt => {
        const sessionKey = `${attempt.user_id}_${attempt.created_at.split('T')[0]}`;
        if (!drillSessions.has(sessionKey)) {
          drillSessions.set(sessionKey, []);
        }
        drillSessions.get(sessionKey)!.push(attempt);
      });

      drillSessions.forEach((sessionAttempts, sessionKey) => {
        const firstAttempt = sessionAttempts[0] as any;
        const correctCount = sessionAttempts.filter((a: any) => a.correct).length;
        const totalCount = sessionAttempts.length;
        const avgScore = Math.round((correctCount / totalCount) * 100);

        allActivities.push({
          id: sessionKey,
          student_id: firstAttempt.user_id,
          student_name: firstAttempt.profiles?.name || 'Unknown',
          type: 'drill',
          title: `${firstAttempt.questions?.part || 'Unknown'} Practice Session`,
          score: avgScore,
          timestamp: firstAttempt.created_at,
          details: `${correctCount}/${totalCount} correct (${avgScore}%)`
        });
      });

      // Sort by timestamp
      allActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Apply type filter
      const filteredActivities = filter.type === 'all' 
        ? allActivities 
        : allActivities.filter(a => a.type === filter.type);

      // Apply search filter
      const searchFilteredActivities = searchTerm
        ? filteredActivities.filter(a => 
            a.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : filteredActivities;

      setActivities(searchFilteredActivities);
      setLastRefresh(new Date());

    } catch (error) {
      console.error('Error fetching activities:', error);
      if (!silent) {
        toast({
          title: 'Lỗi',
          description: 'Không thể tải hoạt động của học viên.',
          variant: 'destructive'
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'exam': return <Award className="h-4 w-4 text-blue-500" />;
      case 'drill': return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'review': return <RefreshCw className="h-4 w-4 text-purple-500" />;
      case 'achievement': return <Target className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'exam': return 'border-blue-200 bg-blue-50';
      case 'drill': return 'border-green-200 bg-green-50';
      case 'review': return 'border-purple-200 bg-purple-50';
      case 'achievement': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays === 0) {
      if (diffHours === 0) {
        return `Hôm nay ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
      }
      return `Hôm nay ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Hôm qua ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const getTrendIndicator = (score: number) => {
    if (score >= 80) {
      return <TrendingUp className="h-3 w-3 text-green-500" />;
    } else if (score >= 60) {
      return <Clock className="h-3 w-3 text-yellow-500" />;
    } else {
      return <AlertTriangle className="h-3 w-3 text-red-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Study Activity Timeline
            </CardTitle>
            <CardDescription>
              Dòng thời gian hoạt động học tập của học viên
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchActivities()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Badge variant={autoRefresh ? 'default' : 'secondary'}>
              <Zap className="h-3 w-3 mr-1" />
              {autoRefresh ? 'Auto' : 'Manual'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select
              value={filter.type}
              onValueChange={(value) => setFilter(prev => ({ ...prev, type: value as 'all' | 'exam' | 'drill' | 'review' | 'achievement' }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="exam">Bài thi</SelectItem>
                <SelectItem value="drill">Luyện tập</SelectItem>
                <SelectItem value="review">Ôn tập</SelectItem>
                <SelectItem value="achievement">Thành tích</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Select
              value={filter.timeRange}
              onValueChange={(value) => setFilter(prev => ({ ...prev, timeRange: value as 'today' | 'week' | 'month' | 'all' }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="week">Tuần này</SelectItem>
                <SelectItem value="month">Tháng này</SelectItem>
                <SelectItem value="all">Tất cả</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Tìm kiếm học viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Tắt auto' : 'Bật auto'}
          </Button>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : activities.length > 0 ? (
            activities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-center gap-4 p-3 border rounded-lg ${getActivityColor(activity.type)}`}
              >
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{activity.student_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {activity.type === 'exam' ? 'Bài thi' :
                       activity.type === 'drill' ? 'Luyện tập' :
                       activity.type === 'review' ? 'Ôn tập' : 'Thành tích'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{activity.title}</p>
                  {activity.score && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getScoreBadgeVariant(activity.score)} className="text-xs">
                        Score: {activity.score}%
                      </Badge>
                      {getTrendIndicator(activity.score)}
                    </div>
                  )}
                </div>
                
                <div className="text-right text-xs text-gray-500 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(activity.timestamp)}
                  </div>
                  {activity.details && (
                    <div className="text-xs text-gray-400 mt-1">
                      {activity.details}
                    </div>
                  )}
                </div>

                <div className="flex gap-1">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p>Không có hoạt động nào trong khoảng thời gian này</p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {activities.length > 0 && (
          <div className="grid grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {activities.filter(a => a.type === 'exam').length}
              </div>
              <div className="text-xs text-gray-500">Bài thi</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {activities.filter(a => a.type === 'drill').length}
              </div>
              <div className="text-xs text-gray-500">Luyện tập</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {activities.filter(a => a.type === 'review').length}
              </div>
              <div className="text-xs text-gray-500">Ôn tập</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">
                {activities.filter(a => a.type === 'achievement').length}
              </div>
              <div className="text-xs text-gray-500">Thành tích</div>
            </div>
          </div>
        )}

        {/* Last Refresh Info */}
        <div className="text-xs text-gray-400 text-center">
          Cập nhật lần cuối: {lastRefresh.toLocaleTimeString('vi-VN')}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedActivityTimeline;
