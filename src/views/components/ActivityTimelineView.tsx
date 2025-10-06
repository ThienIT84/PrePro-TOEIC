/**
 * ActivityTimelineView
 * Pure UI component cho Activity Timeline
 * Extracted từ EnhancedActivityTimeline.tsx
 */

import React from 'react';
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
import { ActivityEvent, ActivityFilter } from '../controllers/analytics/ActivityTimelineController';

export interface ActivityTimelineViewProps {
  // State
  activities: ActivityEvent[];
  loading: boolean;
  filter: ActivityFilter;
  searchTerm: string;
  autoRefresh: boolean;
  lastRefresh: Date;

  // Actions
  onSetFilter: (filter: Partial<ActivityFilter>) => void;
  onSetSearchTerm: (searchTerm: string) => void;
  onSetAutoRefresh: (autoRefresh: boolean) => void;
  onFetchActivities: () => Promise<void>;

  // Utility functions
  getActivityIcon: (type: string) => string;
  getActivityColor: (type: string) => string;
  getScoreBadgeVariant: (score: number) => 'default' | 'secondary' | 'destructive';
  formatTimestamp: (timestamp: string) => string;
  getTrendIndicator: (score: number) => string;
  getActivityTypeDisplayText: (type: string) => string;
  getTimeRangeDisplayText: (timeRange: string) => string;

  // Props
  className?: string;
}

const ActivityTimelineView: React.FC<ActivityTimelineViewProps> = ({
  activities,
  loading,
  filter,
  searchTerm,
  autoRefresh,
  lastRefresh,
  onSetFilter,
  onSetSearchTerm,
  onSetAutoRefresh,
  onFetchActivities,
  getActivityIcon,
  getActivityColor,
  getScoreBadgeVariant,
  formatTimestamp,
  getTrendIndicator,
  getActivityTypeDisplayText,
  getTimeRangeDisplayText,
  className = ''
}) => {
  // Icon mapping
  const iconMap: Record<string, React.ReactNode> = {
    Award: <Award className="h-4 w-4 text-blue-500" />,
    BookOpen: <BookOpen className="h-4 w-4 text-green-500" />,
    RefreshCw: <RefreshCw className="h-4 w-4 text-purple-500" />,
    Target: <Target className="h-4 w-4 text-yellow-500" />,
    Clock: <Clock className="h-4 w-4 text-gray-500" />
  };

  // Trend indicator mapping
  const trendMap: Record<string, React.ReactNode> = {
    TrendingUp: <TrendingUp className="h-3 w-3 text-green-500" />,
    Clock: <Clock className="h-3 w-3 text-yellow-500" />,
    AlertTriangle: <AlertTriangle className="h-3 w-3 text-red-500" />
  };

  return (
    <Card className={className}>
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
              onClick={onFetchActivities}
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
              onValueChange={(value) => onSetFilter({ type: value as any })}
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
              onValueChange={(value) => onSetFilter({ timeRange: value as any })}
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
              onChange={(e) => onSetSearchTerm(e.target.value)}
              className="w-48"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetAutoRefresh(!autoRefresh)}
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
                  {iconMap[getActivityIcon(activity.type)] || iconMap.Clock}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{activity.student_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {getActivityTypeDisplayText(activity.type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{activity.title}</p>
                  {activity.score && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getScoreBadgeVariant(activity.score)} className="text-xs">
                        Score: {activity.score}%
                      </Badge>
                      {trendMap[getTrendIndicator(activity.score)] || trendMap.Clock}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{activities.length}</div>
            <div className="text-sm text-gray-500">Tổng hoạt động</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {activities.filter(a => a.type === 'exam').length}
            </div>
            <div className="text-sm text-gray-500">Bài thi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {activities.filter(a => a.type === 'drill').length}
            </div>
            <div className="text-sm text-gray-500">Luyện tập</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {activities.length > 0 
                ? Math.round(activities.filter(a => a.score).reduce((sum, a) => sum + (a.score || 0), 0) / activities.filter(a => a.score).length)
                : 0}%
            </div>
            <div className="text-sm text-gray-500">Điểm TB</div>
          </div>
        </div>

        {/* Last Refresh Info */}
        <div className="text-xs text-gray-400 text-center">
          Cập nhật lần cuối: {lastRefresh.toLocaleTimeString('vi-VN')}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityTimelineView;
