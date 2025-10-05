import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
import { teacherAnalyticsService, AnalyticsData, StudentProfile, ActivityEvent, AlertItem } from '@/services/teacherAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import StudentDetailModal from './StudentDetailModal';
import EnhancedActivityTimeline from './EnhancedActivityTimeline';
import ClassManagement from './ClassManagement';
import AdvancedAlertsSystem from './AdvancedAlertsSystem';
import StudentListWithFilters from './StudentListWithFilters';

const TeacherAnalytics = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await teacherAnalyticsService.getAnalyticsData(user.id);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set empty data to prevent white screen
      setAnalyticsData({
        total_students: 0,
        active_today: 0,
        avg_score: 0,
        completion_rate: 0,
        students_trend: 0,
        activity_trend: 0,
        score_trend: 0,
        completion_trend: 0,
        students: [],
        classes: [],
        recent_activities: [],
        alerts: [],
        skill_performance: {
          vocabulary: { avg_score: 0, trend: 0 },
          grammar: { avg_score: 0, trend: 0 },
          listening: { avg_score: 0, trend: 0 },
          reading: { avg_score: 0, trend: 0 }
        },
        daily_activity: [],
        weekly_progress: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'danger': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
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

  if (!analyticsData) {
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

  // Ensure we have valid data structure
  const safeAnalyticsData = {
    ...analyticsData,
    students: analyticsData.students || [],
    classes: analyticsData.classes || [],
    recent_activities: analyticsData.recent_activities || [],
    alerts: analyticsData.alerts || [],
    daily_activity: analyticsData.daily_activity || [],
    weekly_progress: analyticsData.weekly_progress || [],
    skill_performance: analyticsData.skill_performance || {
      vocabulary: { avg_score: 0, trend: 0 },
      grammar: { avg_score: 0, trend: 0 },
      listening: { avg_score: 0, trend: 0 },
      reading: { avg_score: 0, trend: 0 }
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
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
          <Button variant="outline" size="sm">
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
            <div className="text-2xl font-bold">{safeAnalyticsData.total_students}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(safeAnalyticsData.students_trend)}
              <span className={getTrendColor(safeAnalyticsData.students_trend)}>
                ↑ {safeAnalyticsData.students_trend}% vs last month
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
            <div className="text-2xl font-bold">{safeAnalyticsData.active_today}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(safeAnalyticsData.activity_trend)}
              <span className={getTrendColor(safeAnalyticsData.activity_trend)}>
                ↑ {safeAnalyticsData.activity_trend} students
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
            <div className="text-2xl font-bold">{safeAnalyticsData.avg_score}/100</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(safeAnalyticsData.score_trend)}
              <span className={getTrendColor(safeAnalyticsData.score_trend)}>
                ↑ {safeAnalyticsData.score_trend} points
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
            <div className="text-2xl font-bold">{safeAnalyticsData.completion_rate}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(safeAnalyticsData.completion_trend)}
              <span className={getTrendColor(safeAnalyticsData.completion_trend)}>
                ↑ {safeAnalyticsData.completion_trend}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="students">Học viên</TabsTrigger>
          <TabsTrigger value="activities">Hoạt động</TabsTrigger>
          <TabsTrigger value="classes">Lớp học</TabsTrigger>
          <TabsTrigger value="alerts">Cảnh báo</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
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
                {Object.entries(safeAnalyticsData.skill_performance).map(([skill, data]) => (
                  <div key={skill} className="text-center space-y-2">
                    <div className="flex items-center justify-center">
                      {getSkillIcon(skill)}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{skill}</p>
                      <p className="text-lg font-bold">{data.avg_score}%</p>
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(data.trend)}
                        <span className={`text-xs ${getTrendColor(data.trend)}`}>
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
                  <LineChart data={safeAnalyticsData.daily_activity}>
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
                  <BarChart data={safeAnalyticsData.weekly_progress}>
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
          <StudentListWithFilters />
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <EnhancedActivityTimeline 
            studentIds={safeAnalyticsData.students.map(s => s.id)}
            refreshTrigger={Date.now()}
          />
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-6">
          <ClassManagement />
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <AdvancedAlertsSystem />
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
      <StudentDetailModal
        student={selectedStudent}
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setSelectedStudent(null);
        }}
      />
    </div>
  );
};

export default TeacherAnalytics;
