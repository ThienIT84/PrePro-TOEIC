/**
 * TeacherAnalyticsView
 * Pure UI component cho Teacher Analytics Dashboard
 * Extracted từ TeacherAnalytics.tsx
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Target,
  CheckCircle,
  AlertTriangle,
  Info,
  Award,
  BookOpen,
  Headphones,
  FileText,
  Brain,
  Calendar,
  BarChart3,
  Download,
  Filter,
  Search,
  Eye,
  MessageSquare,
  Clock,
  Zap,
  Settings
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { AnalyticsData, StudentProfile, ActivityEvent, AlertItem } from '@/services/teacherAnalytics';
import { TrendData, SkillPerformance, ChartData } from '../controllers/analytics/TeacherAnalyticsController';

export interface TeacherAnalyticsViewProps {
  // State
  analyticsData: AnalyticsData | null;
  loading: boolean;
  selectedStudent: StudentProfile | null;
  activeTab: string;
  isStudentModalOpen: boolean;

  // Actions
  onSetActiveTab: (tab: string) => void;
  onOpenStudentDetailModal: (studentId: string) => void;
  onCloseStudentDetailModal: () => void;
  onExportAnalyticsReport: () => void;
  onFilterAnalyticsData: (filters: {
    dateRange?: { start: Date; end: Date };
    skillType?: string;
    studentIds?: string[];
  }) => void;
  onRefreshAnalyticsData: (userId: string) => Promise<{ success: boolean; error?: string }>;

  // Utility functions
  getTrendIconType: (trend: number) => 'up' | 'down' | 'stable';
  getTrendColorClass: (trend: number) => string;
  getAlertIconType: (type: string) => 'warning' | 'success' | 'danger' | 'info';
  getSkillIconType: (skill: string) => 'vocabulary' | 'grammar' | 'listening' | 'reading' | 'target';
  getSafeAnalyticsData: () => AnalyticsData | null;
  getKeyMetrics: () => {
    totalStudents: TrendData;
    activeToday: TrendData;
    avgScore: TrendData;
    completionRate: TrendData;
  };
  getSkillPerformanceData: () => SkillPerformance;
  getDailyActivityChartData: () => ChartData[];
  getWeeklyProgressChartData: () => ChartData[];
  getStudentsData: () => StudentProfile[];
  getClassesData: () => unknown[];
  getRecentActivitiesData: () => ActivityEvent[];
  getAlertsData: () => AlertItem[];
  getStudentById: (studentId: string) => StudentProfile | null;
  getAnalyticsSummary: () => {
    hasData: boolean;
    totalStudents: number;
    activeToday: number;
    avgScore: number;
    completionRate: number;
    topPerformingSkill: string;
    strugglingSkill: string;
  };
  getTabConfiguration: () => Array<{
    id: string;
    label: string;
    icon?: string;
    disabled?: boolean;
  }>;
  isLoading: () => boolean;
  hasAnalyticsData: () => boolean;
  getActiveTab: () => string;
  isStudentModalOpen: () => boolean;
  getSelectedStudent: () => StudentProfile | null;

  // Child components (these would be passed as props in real implementation)
  StudentListWithFilters?: React.ComponentType;
  EnhancedActivityTimeline?: React.ComponentType<{ studentIds: string[]; refreshTrigger: number }>;
  ClassManagement?: React.ComponentType;
  AdvancedAlertsSystem?: React.ComponentType;
  StudentDetailModal?: React.ComponentType<{
    student: StudentProfile | null;
    isOpen: boolean;
    onClose: () => void;
  }>;
}

const TeacherAnalyticsView: React.FC<TeacherAnalyticsViewProps> = ({
  analyticsData,
  loading,
  selectedStudent,
  activeTab,
  isStudentModalOpen,
  onSetActiveTab,
  onOpenStudentDetailModal,
  onCloseStudentDetailModal,
  onExportAnalyticsReport,
  onFilterAnalyticsData,
  onRefreshAnalyticsData,
  getTrendIconType,
  getTrendColorClass,
  getAlertIconType,
  getSkillIconType,
  getSafeAnalyticsData,
  getKeyMetrics,
  getSkillPerformanceData,
  getDailyActivityChartData,
  getWeeklyProgressChartData,
  getStudentsData,
  getClassesData,
  getRecentActivitiesData,
  getAlertsData,
  getStudentById,
  getAnalyticsSummary,
  getTabConfiguration,
  isLoading,
  hasAnalyticsData,
  getActiveTab,
  isStudentModalOpen: isStudentModalOpenCheck,
  getSelectedStudent,
  StudentListWithFilters,
  EnhancedActivityTimeline,
  ClassManagement,
  AdvancedAlertsSystem,
  StudentDetailModal,
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!hasAnalyticsData()) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Không thể tải dữ liệu phân tích. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const safeAnalyticsData = getSafeAnalyticsData();
  const keyMetrics = getKeyMetrics();
  const skillPerformance = getSkillPerformanceData();
  const dailyActivityData = getDailyActivityChartData();
  const weeklyProgressData = getWeeklyProgressChartData();
  const studentsData = getStudentsData();
  const tabConfig = getTabConfiguration();

  // Helper functions for rendering
  const renderTrendIcon = (trend: number) => {
    const trendType = getTrendIconType(trend);
    switch (trendType) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderAlertIcon = (type: string) => {
    const iconType = getAlertIconType(type);
    switch (iconType) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'danger': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const renderSkillIcon = (skill: string) => {
    const iconType = getSkillIconType(skill);
    switch (iconType) {
      case 'vocabulary': return <Brain className="h-4 w-4" />;
      case 'grammar': return <BookOpen className="h-4 w-4" />;
      case 'listening': return <Headphones className="h-4 w-4" />;
      case 'reading': return <FileText className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Phân tích giáo viên
          </h1>
          <p className="text-muted-foreground mt-1">
            Tổng quan hiệu suất và hoạt động của học viên
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onExportAnalyticsReport}>
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
          <Button variant="outline" size="sm" onClick={() => onFilterAnalyticsData({})}>
            <Filter className="h-4 w-4 mr-2" />
            Lọc dữ liệu
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng học viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics.totalStudents.value}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {renderTrendIcon(keyMetrics.totalStudents.trend)}
              <span className={getTrendColorClass(keyMetrics.totalStudents.trend)}>
                ↑ {keyMetrics.totalStudents.trend}% vs last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoạt động hôm nay</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics.activeToday.value}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {renderTrendIcon(keyMetrics.activeToday.trend)}
              <span className={getTrendColorClass(keyMetrics.activeToday.trend)}>
                ↑ {keyMetrics.activeToday.trend} students
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics.avgScore.value}/100</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {renderTrendIcon(keyMetrics.avgScore.trend)}
              <span className={getTrendColorClass(keyMetrics.avgScore.trend)}>
                ↑ {keyMetrics.avgScore.trend} points
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics.completionRate.value}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {renderTrendIcon(keyMetrics.completionRate.trend)}
              <span className={getTrendColorClass(keyMetrics.completionRate.trend)}>
                ↑ {keyMetrics.completionRate.trend}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={onSetActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          {tabConfig.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} disabled={tab.disabled}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Skill Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Hiệu suất theo kỹ năng
              </CardTitle>
              <CardDescription>
                Điểm trung bình và xu hướng của từng kỹ năng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(skillPerformance).map(([skill, data]) => (
                  <div key={skill} className="text-center space-y-2">
                    <div className="flex items-center justify-center">
                      {renderSkillIcon(skill)}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{skill}</p>
                      <p className="text-lg font-bold">{data.avg_score}%</p>
                      <div className="flex items-center justify-center gap-1">
                        {renderTrendIcon(data.trend)}
                        <span className={`text-xs ${getTrendColorClass(data.trend)}`}>
                          {data.trend > 0 ? '+' : ''}{data.trend}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Hoạt động 7 ngày qua
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={dailyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      key="activity-line"
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8884d8" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tiến độ tuần
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      key="progress-bar"
                      dataKey="avg_score" 
                      fill="#82ca9d" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          {StudentListWithFilters ? <StudentListWithFilters /> : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p>Student list component not available</p>
            </div>
          )}
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          {EnhancedActivityTimeline ? (
            <EnhancedActivityTimeline 
              studentIds={studentsData.map(s => s.id)}
              refreshTrigger={Date.now()}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p>Activity timeline component not available</p>
            </div>
          )}
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-6">
          {ClassManagement ? <ClassManagement /> : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2" />
              <p>Class management component not available</p>
            </div>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          {AdvancedAlertsSystem ? <AdvancedAlertsSystem /> : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Alerts system component not available</p>
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Cài đặt hệ thống
              </CardTitle>
              <CardDescription>
                Cấu hình các tùy chọn phân tích và thông báo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-8 w-8 mx-auto mb-2" />
                <p>Tính năng cài đặt sẽ được phát triển trong phiên bản tiếp theo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Student Detail Modal */}
      {StudentDetailModal && (
        <StudentDetailModal
          student={selectedStudent}
          isOpen={isStudentModalOpen}
          onClose={onCloseStudentDetailModal}
        />
      )}
    </div>
  );
};

export default TeacherAnalyticsView;
