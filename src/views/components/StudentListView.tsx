/**
 * StudentListView
 * Pure UI component cho Student List Management
 * Nhận tất cả data và callbacks qua props
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  ChevronUp
} from 'lucide-react';
import { StudentWithStatus, FilterState, BulkAction } from '@/controllers/user/StudentListController';

export interface StudentListViewProps {
  // State
  students: StudentWithStatus[];
  loading: boolean;
  selectedStudents: string[];
  filters: FilterState;
  showFilters: boolean;
  isBulkActionOpen: boolean;
  bulkMessage: string;

  // Handlers
  onFiltersUpdate: (updates: Partial<FilterState>) => void;
  onClearFilters: () => void;
  onToggleFilters: () => void;
  onSelectAll: () => void;
  onSelectStudent: (studentId: string) => void;
  onBulkAction: (action: BulkAction) => void;
  onBulkMessageChange: (message: string) => void;
  onSendBulkMessage: () => void;
  onCloseBulkActionDialog: () => void;

  // Utility functions
  getFilteredStudents: () => StudentWithStatus[];
  getStatusIcon: (status: string) => string;
  getStatusBadge: (status: string) => { variant: string; className: string; text: string };
  getLevelBadge: (level: string) => { variant: string; className: string; text: string };
  getActiveFiltersCount: () => number;
  getStatistics: () => {
    totalStudents: number;
    filteredStudents: number;
    selectedCount: number;
    activeCount: number;
    atRiskCount: number;
    inactiveCount: number;
    activeFiltersCount: number;
  };

  // Props
  className?: string;
}

export const StudentListView: React.FC<StudentListViewProps> = ({
  students,
  loading,
  selectedStudents,
  filters,
  showFilters,
  isBulkActionOpen,
  bulkMessage,
  onFiltersUpdate,
  onClearFilters,
  onToggleFilters,
  onSelectAll,
  onSelectStudent,
  onBulkAction,
  onBulkMessageChange,
  onSendBulkMessage,
  onCloseBulkActionDialog,
  getFilteredStudents,
  getStatusIcon,
  getStatusBadge,
  getLevelBadge,
  getActiveFiltersCount,
  getStatistics,
  className = '',
}) => {
  const filteredStudents = getFilteredStudents();
  const statistics = getStatistics();
  const bulkActions = [
    {
      id: 'send-notification',
      label: 'Gửi thông báo',
      icon: <Send className="h-4 w-4" />,
      action: (selectedIds: string[]) => {
        onBulkAction({ id: 'send-notification', label: 'Gửi thông báo', icon: <Send className="h-4 w-4" />, action: () => {} });
      }
    },
    {
      id: 'assign-homework',
      label: 'Gán bài tập',
      icon: <BookOpen className="h-4 w-4" />,
      action: (selectedIds: string[]) => {
        onBulkAction({ id: 'assign-homework', label: 'Gán bài tập', icon: <BookOpen className="h-4 w-4" />, action: () => {} });
      }
    },
    {
      id: 'export-data',
      label: 'Export data',
      icon: <Download className="h-4 w-4" />,
      action: (selectedIds: string[]) => {
        onBulkAction({ id: 'export-data', label: 'Export data', icon: <Download className="h-4 w-4" />, action: () => {} });
      }
    }
  ];

  const activeFiltersCount = getActiveFiltersCount();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
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
            {statistics.filteredStudents} / {statistics.totalStudents} học viên
          </Badge>
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
                onClick={onToggleFilters}
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
                  onChange={(e) => onFiltersUpdate({ searchTerm: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" onClick={onClearFilters}>
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
                  onValueChange={(value) => onFiltersUpdate({ level: value })}
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
                  onValueChange={(value) => onFiltersUpdate({ status: value })}
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
                  onValueChange={(value) => onFiltersUpdate({ scoreRange: value })}
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
                  onValueChange={(value) => onFiltersUpdate({ progress: value })}
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
                  onValueChange={(value) => onFiltersUpdate({ lastActivity: value })}
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
                      onCheckedChange={onSelectAll}
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
                {filteredStudents.map((student) => {
                  const statusIcon = getStatusIcon(student.status);
                  const statusBadge = getStatusBadge(student.status);
                  const levelBadge = getLevelBadge(student.level);
                  
                  return (
                    <tr key={student.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => onSelectStudent(student.id)}
                        />
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={levelBadge.variant as unknown} className={levelBadge.className}>
                          {levelBadge.text}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{student.lastScore}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{student.targetScore}</div>
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
                          {statusIcon === 'CheckCircle' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {statusIcon === 'AlertTriangle' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                          {statusIcon === 'Clock' && <Clock className="h-4 w-4 text-red-500" />}
                          {statusIcon === 'Users' && <Users className="h-4 w-4 text-gray-500" />}
                          <Badge variant={statusBadge.variant as unknown} className={statusBadge.className}>
                            {statusBadge.text}
                          </Badge>
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p>Không tìm thấy học viên nào phù hợp với bộ lọc</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Message Dialog */}
      <Dialog open={isBulkActionOpen} onOpenChange={onCloseBulkActionDialog}>
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
                onChange={(e) => onBulkMessageChange(e.target.value)}
                placeholder="Nhập nội dung thông báo..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onCloseBulkActionDialog}>
                Hủy
              </Button>
              <Button onClick={onSendBulkMessage}>
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
