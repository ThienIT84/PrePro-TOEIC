/**
 * ClassManagementView
 * Pure UI component cho Class Management
 * Extracted từ ClassManagement.tsx
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Mail,
  MessageSquare,
  FileText,
  BarChart3,
  UserPlus,
  UserMinus,
  Eye,
  Download
} from 'lucide-react';
// Mock interfaces since controller might not exist
interface ClassInfo {
  id: string;
  name: string;
  description: string;
  student_count: number;
  created_at: string;
  avg_score: number;
  completion_rate: number;
  students: Student[];
}

interface Student {
  id: string;
  name: string;
  email: string;
  avg_score: number;
  last_activity: string;
  is_in_class: boolean;
}

interface ClassFormData {
  name: string;
  description: string;
}

export interface ClassManagementViewProps {
  // State
  classes: ClassInfo[];
  students: Student[];
  loading: boolean;
  selectedClass: ClassInfo | null;
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  newClass: ClassFormData;

  // Actions
  onCreateClass: () => void;
  onDeleteClass: (classId: string) => void;
  onAddStudentToClass: (classId: string, studentId: string) => void;
  onRemoveStudentFromClass: (classId: string, studentId: string) => void;
  onExportClassReport: (classInfo: ClassInfo) => void;
  onSetSelectedClass: (selectedClass: ClassInfo | null) => void;
  onSetCreateDialogOpen: (isOpen: boolean) => void;
  onSetEditDialogOpen: (isOpen: boolean) => void;
  onUpdateNewClassField: (field: keyof ClassFormData, value: string) => void;
  onResetForm: () => void;

  // Utility functions
  getAvailableStudentsForClass: (classId: string) => Student[];
  getClassById: (classId: string) => ClassInfo | null;
  getStudentById: (studentId: string) => Student | null;
  calculateClassStatistics: (classId: string) => {
    totalStudents: number;
    avgScore: number;
    completionRate: number;
  };
  getClassAnalytics: (classId: string) => {
    scoreDistribution: { range: string; count: number }[];
    activityTrend: { date: string; activity: number }[];
    topPerformers: Student[];
    strugglingStudents: Student[];
  };
  validateClassForm: (formData: ClassFormData) => {
    isValid: boolean;
    errors: string[];
  };
  searchClasses: (query: string) => ClassInfo[];
  searchStudents: (query: string) => Student[];
  getClassSummaryStatistics: () => {
    totalClasses: number;
    totalStudents: number;
    avgClassSize: number;
    avgScore: number;
  };
}

const ClassManagementView: React.FC<ClassManagementViewProps> = ({
  classes,
  students,
  loading,
  selectedClass,
  isCreateDialogOpen,
  isEditDialogOpen,
  newClass,
  onCreateClass,
  onDeleteClass,
  onAddStudentToClass,
  onRemoveStudentFromClass,
  onExportClassReport,
  onSetSelectedClass,
  onSetCreateDialogOpen,
  onSetEditDialogOpen,
  onUpdateNewClassField,
  onResetForm,
  getAvailableStudentsForClass,
  getClassById,
  getStudentById,
  calculateClassStatistics,
  getClassAnalytics,
  validateClassForm,
  searchClasses,
  searchStudents,
  getClassSummaryStatistics,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Quản lý lớp học
          </h2>
          <p className="text-muted-foreground">
            Tạo và quản lý các lớp học của bạn
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={onSetCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo lớp mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo lớp học mới</DialogTitle>
              <DialogDescription>
                Tạo một lớp học mới để quản lý học viên
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="class-name">Tên lớp học</Label>
                <Input
                  id="class-name"
                  value={newClass.name}
                  onChange={(e) => onUpdateNewClassField('name', e.target.value)}
                  placeholder="VD: TOEIC Intermediate"
                />
              </div>
              <div>
                <Label htmlFor="class-description">Mô tả</Label>
                <Textarea
                  id="class-description"
                  value={newClass.description}
                  onChange={(e) => onUpdateNewClassField('description', e.target.value)}
                  placeholder="Mô tả về lớp học..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onSetCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={onCreateClass}>
                  Tạo lớp
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classInfo) => (
          <Card key={classInfo.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{classInfo.name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDeleteClass(classInfo.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <CardDescription>{classInfo.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Class Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-primary">{classInfo.student_count}</div>
                  <div className="text-xs text-muted-foreground">Học viên</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{classInfo.avg_score}</div>
                  <div className="text-xs text-muted-foreground">Điểm TB</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">{classInfo.completion_rate}%</div>
                  <div className="text-xs text-muted-foreground">Hoàn thành</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onSetSelectedClass(classInfo)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Xem chi tiết
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onExportClassReport(classInfo)}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Class Detail Modal */}
      {selectedClass && (
        <Dialog open={!!selectedClass} onOpenChange={() => onSetSelectedClass(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {selectedClass.name}
              </DialogTitle>
              <DialogDescription>
                {selectedClass.description}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="students" className="space-y-4">
              <TabsList>
                <TabsTrigger value="students">Học viên</TabsTrigger>
                <TabsTrigger value="analytics">Phân tích</TabsTrigger>
                <TabsTrigger value="assignments">Bài tập</TabsTrigger>
              </TabsList>

              {/* Students Tab */}
              <TabsContent value="students" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Danh sách học viên</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Thêm học viên
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Thêm học viên vào lớp</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Chọn học viên</Label>
                          <Select onValueChange={(value) => onAddStudentToClass(selectedClass.id, value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn học viên..." />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableStudentsForClass(selectedClass.id).map(student => (
                                <SelectItem key={student.id} value={student.id}>
                                  {student.name} ({student.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  {selectedClass.students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">
                          {student.avg_score}%
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onRemoveStudentFromClass(selectedClass.id, student.id)}
                        >
                          <UserMinus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {selectedClass.students.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <p>Chưa có học viên nào trong lớp này</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{selectedClass.student_count}</div>
                        <div className="text-sm text-muted-foreground">Tổng học viên</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedClass.avg_score}</div>
                        <div className="text-sm text-muted-foreground">Điểm trung bình</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedClass.completion_rate}%</div>
                        <div className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">85%</div>
                        <div className="text-sm text-muted-foreground">Tỷ lệ tham gia</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Assignments Tab */}
              <TabsContent value="assignments" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p>Tính năng giao bài tập sẽ được phát triển trong phiên bản tiếp theo</p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClassManagementView;
