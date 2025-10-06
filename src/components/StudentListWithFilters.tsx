import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Filter, 
  Search, 
  Download, 
  Mail, 
  BookOpen, 
  Eye, 
  MessageSquare,
  Calendar,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  Send,
  FileText,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { StudentProfile, teacherAnalyticsService } from '@/services/teacherAnalytics';
import { toast } from '@/hooks/use-toast';

interface StudentWithStatus extends StudentProfile {
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lastScore: number;
  targetScore: number;
  progress: number;
  lastActivityTime: string;
  status: 'Active' | 'Inactive' | 'At Risk';
}

interface FilterState {
  level: string;
  status: string;
  scoreRange: string;
  progress: string;
  lastActivity: string;
  searchTerm: string;
}

interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: (selectedIds: string[]) => void;
}

const StudentListWithFilters = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    level: 'all',
    status: 'all',
    scoreRange: 'all',
    progress: 'all',
    lastActivity: 'all',
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');

  // Fetch real data from Supabase
  useEffect(() => {
    if (user) {
      fetchStudentsData();
    }
  }, [user]);

  const fetchStudentsData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const analyticsData = await teacherAnalyticsService.getAnalyticsData(user.id);
      const studentProfiles = analyticsData.students || [];
      
      // Transform StudentProfile to StudentWithStatus
      const transformedStudents: StudentWithStatus[] = studentProfiles.map(student => {
        // Determine level based on avg_score
        let level: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
        if (student.avg_score >= 700) {
          level = 'Advanced';
        } else if (student.avg_score >= 500) {
          level = 'Intermediate';
        }

        // Determine status based on last activity and performance
        let status: 'Active' | 'Inactive' | 'At Risk' = 'Active';
        const lastActivityDate = new Date(student.last_activity);
        const now = new Date();
        const daysSinceActivity = Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceActivity > 7) {
          status = 'Inactive';
        } else if (daysSinceActivity > 3 || student.avg_score < 400) {
          status = 'At Risk';
        }

        // Calculate progress towards target
        const progress = student.target_score > 0 
          ? Math.min(100, Math.round((student.avg_score / student.target_score) * 100))
          : 0;

        // Format last activity time
        const lastActivityTime = formatLastActivityTime(student.last_activity);

        return {
          ...student,
          level,
          lastScore: Math.round(student.avg_score),
          targetScore: student.target_score || 0,
          progress,
          lastActivityTime,
          status
        };
      });

      setStudents(transformedStudents);
    } catch (error) {
      console.error('Error fetching students data:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu học viên. Vui lòng thử lại sau.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatLastActivityTime = (lastActivity: string): string => {
    const now = new Date();
    const activityDate = new Date(lastActivity);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return activityDate.toLocaleDateString('vi-VN');
    }
  };

  // Filter students based on current filters
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Level filter
      if (filters.level !== 'all' && student.level !== filters.level) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && student.status !== filters.status) {
        return false;
      }

      // Score range filter
      if (filters.scoreRange !== 'all') {
        const score = student.lastScore;
        switch (filters.scoreRange) {
          case '0-400':
            if (score < 0 || score > 400) return false;
            break;
          case '400-600':
            if (score < 400 || score > 600) return false;
            break;
          case '600-800':
            if (score < 600 || score > 800) return false;
            break;
          case '800-990':
            if (score < 800 || score > 990) return false;
            break;
        }
      }

      // Progress filter
      if (filters.progress !== 'all') {
        const progress = student.progress;
        switch (filters.progress) {
          case '<50%':
            if (progress >= 50) return false;
            break;
          case '50-80%':
            if (progress < 50 || progress > 80) return false;
            break;
          case '>80%':
            if (progress <= 80) return false;
            break;
        }
      }

      // Last activity filter
      if (filters.lastActivity !== 'all') {
        const lastActivity = new Date(student.last_activity);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

        switch (filters.lastActivity) {
          case 'Today':
            if (diffDays > 0) return false;
            break;
          case 'This Week':
            if (diffDays > 7) return false;
            break;
          case 'This Month':
            if (diffDays > 30) return false;
            break;
          case '>1 Month':
            if (diffDays <= 30) return false;
            break;
        }
      }

      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        if (!student.name.toLowerCase().includes(searchLower) && 
            !student.email.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [students, filters]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'At Risk': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'Inactive': return <Clock className="h-4 w-4 text-red-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <Badge variant="default" className="bg-green-100 text-green-800">🟢 Active</Badge>;
      case 'At Risk': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">🟡 Warning</Badge>;
      case 'Inactive': return <Badge variant="destructive" className="bg-red-100 text-red-800">🔴 Inactive</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Beginner': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Beginner</Badge>;
      case 'Intermediate': return <Badge variant="default" className="bg-purple-100 text-purple-800">Intermediate</Badge>;
      case 'Advanced': return <Badge variant="destructive" className="bg-orange-100 text-orange-800">Advanced</Badge>;
      default: return <Badge variant="outline">{level}</Badge>;
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const bulkActions: BulkAction[] = [
    {
      id: 'send-notification',
      label: 'Gửi thông báo',
      icon: <Send className="h-4 w-4" />,
      action: (selectedIds) => {
        setIsBulkActionOpen(true);
        toast({
          title: 'Thành công',
          description: `Đã gửi thông báo cho ${selectedIds.length} học viên.`
        });
      }
    },
    {
      id: 'assign-homework',
      label: 'Gán bài tập',
      icon: <BookOpen className="h-4 w-4" />,
      action: (selectedIds) => {
        toast({
          title: 'Thành công',
          description: `Đã gán bài tập cho ${selectedIds.length} học viên.`
        });
      }
    },
    {
      id: 'export-data',
      label: 'Export data',
      icon: <Download className="h-4 w-4" />,
      action: (selectedIds) => {
        toast({
          title: 'Thành công',
          description: `Đã xuất dữ liệu của ${selectedIds.length} học viên.`
        });
      }
    }
  ];

  const clearFilters = () => {
    setFilters({
      level: 'all',
      status: 'all',
      scoreRange: 'all',
      progress: 'all',
      lastActivity: 'all',
      searchTerm: ''
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all' && value !== '').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Đang tải danh sách học viên...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Danh sách học viên
          </h2>
          <p className="text-muted-foreground">
            Quản lý và theo dõi học viên với filters và bulk actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredStudents.length} / {students.length} học viên
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStudentsData}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Làm mới'}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Tìm kiếm và lọc
            </CardTitle>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">
                  {activeFiltersCount} filters
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {showFilters ? 'Ẩn' : 'Hiện'} filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Xóa filters
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="level-filter">Level</Label>
                <Select
                  value={filters.level}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status-filter">Trạng thái</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="score-filter">Điểm số</Label>
                <Select
                  value={filters.scoreRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, scoreRange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khoảng điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="0-400">0-400</SelectItem>
                    <SelectItem value="400-600">400-600</SelectItem>
                    <SelectItem value="600-800">600-800</SelectItem>
                    <SelectItem value="800-990">800-990</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="progress-filter">Tiến độ</Label>
                <Select
                  value={filters.progress}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, progress: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tiến độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="<50%">&lt;50%</SelectItem>
                    <SelectItem value="50-80%">50-80%</SelectItem>
                    <SelectItem value=">80%">&gt;80%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="activity-filter">Hoạt động cuối</Label>
                <Select
                  value={filters.lastActivity}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, lastActivity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Today">Hôm nay</SelectItem>
                    <SelectItem value="This Week">Tuần này</SelectItem>
                    <SelectItem value="This Month">Tháng này</SelectItem>
                    <SelectItem value=">1 Month">&gt;1 tháng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedStudents.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">
                  Đã chọn {selectedStudents.length} học viên
                </span>
              </div>
              <div className="flex gap-2">
                {bulkActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    size="sm"
                    onClick={() => action.action(selectedStudents)}
                  >
                    {action.icon}
                    <span className="ml-2">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Danh sách học viên ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">
                    <Checkbox
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left p-3 font-medium">Tên</th>
                  <th className="text-left p-3 font-medium">Level</th>
                  <th className="text-left p-3 font-medium">Điểm Gần Nhất</th>
                  <th className="text-left p-3 font-medium">Mục Tiêu</th>
                  <th className="text-left p-3 font-medium">Tiến Độ</th>
                  <th className="text-left p-3 font-medium">Ngày Học Cuối</th>
                  <th className="text-left p-3 font-medium">Trạng Thái</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={() => handleSelectStudent(student.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      {getLevelBadge(student.level)}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{student.lastScore}</div>
                      <div className="text-xs text-muted-foreground">
                        {student.total_attempts} câu hỏi
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{student.targetScore}</div>
                      <div className="text-xs text-muted-foreground">
                        {student.test_date ? `Thi: ${new Date(student.test_date).toLocaleDateString('vi-VN')}` : 'Chưa đặt lịch'}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{student.lastActivityTime}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(student.status)}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              {getStatusBadge(student.status)}
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm">
                                <div className="font-medium mb-1">Thông tin chi tiết:</div>
                                <div>Streak: {student.streak_days} ngày</div>
                                <div>Hoàn thành: {student.completion_rate}%</div>
                                {student.weak_areas.length > 0 && (
                                  <div>Yếu: {student.weak_areas.join(', ')}</div>
                                )}
                                {student.strong_areas.length > 0 && (
                                  <div>Mạnh: {student.strong_areas.join(', ')}</div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {student.streak_days > 0 ? `Streak: ${student.streak_days} ngày` : 'Chưa có streak'}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View Detail
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && students.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có học viên</h3>
              <p className="mb-4">Bạn chưa có học viên nào được gán.</p>
              <div className="text-sm">
                <p>Để xem danh sách học viên, hãy:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Gán học viên cho bạn trong phần quản lý</li>
                  <li>Liên hệ admin để được gán học viên</li>
                </ul>
              </div>
            </div>
          )}

          {filteredStudents.length === 0 && students.length > 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p>Không tìm thấy học viên nào phù hợp với bộ lọc</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="mt-2"
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Message Dialog */}
      <Dialog open={isBulkActionOpen} onOpenChange={setIsBulkActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gửi thông báo cho học viên</DialogTitle>
            <DialogDescription>
              Gửi thông báo cho {selectedStudents.length} học viên đã chọn
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-message">Nội dung thông báo</Label>
              <Textarea
                id="bulk-message"
                value={bulkMessage}
                onChange={(e) => setBulkMessage(e.target.value)}
                placeholder="Nhập nội dung thông báo..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBulkActionOpen(false)}>
                Hủy
              </Button>
              <Button onClick={() => {
                setIsBulkActionOpen(false);
                setBulkMessage('');
                toast({
                  title: 'Thành công',
                  description: `Đã gửi thông báo cho ${selectedStudents.length} học viên.`
                });
              }}>
                <Send className="h-4 w-4 mr-2" />
                Gửi thông báo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentListWithFilters;
