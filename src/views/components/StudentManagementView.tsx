/**
 * StudentManagementView
 * Pure UI component cho Student Management
 * Extracted từ StudentManagement.tsx
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, GraduationCap, TrendingUp, Calendar, Mail, UserCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import { Student } from '../controllers/user/StudentManagementController';

export interface StudentManagementViewProps {
  // State
  students: Student[];
  loading: boolean;
  error: string | null;
  reassigning: string | null;

  // Actions
  onFetchStudents: () => Promise<void>;
  onReassignStudent: (studentId: string, newTeacherId: string) => Promise<void>;
  onUnassignStudent: (studentId: string, studentName: string) => Promise<void>;
  onClearError: () => void;

  // Utility functions
  getStudentStatistics: () => {
    totalStudents: number;
    activeStudents: number;
    totalAttempts: number;
    averageAccuracy: number;
  };
  formatStudentName: (student: Student) => string;
  formatStudentEmail: (student: Student) => string;
  formatAssignedDate: (assignedAt: string) => string;
  getStudentInitials: (student: Student) => string;
  getStatusBadgeVariant: (status: string) => 'default' | 'secondary';
  getStatusBadgeClass: (status: string) => string;
  getStatusDisplayText: (status: string) => string;
  isReassigning: (studentId?: string) => boolean;

  // Props
  className?: string;
}

const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  students,
  loading,
  error,
  reassigning,
  onFetchStudents,
  onReassignStudent,
  onUnassignStudent,
  onClearError,
  getStudentStatistics,
  formatStudentName,
  formatStudentEmail,
  formatAssignedDate,
  getStudentInitials,
  getStatusBadgeVariant,
  getStatusBadgeClass,
  getStatusDisplayText,
  isReassigning,
  className = ''
}) => {
  const statistics = getStudentStatistics();

  return (
    <div className={`container mx-auto p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý học viên</h1>
          <p className="text-muted-foreground">
            Danh sách học viên được gán cho bạn
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onFetchStudents} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Lỗi:</strong> {error}
            <div className="mt-2 flex gap-2">
              <Button variant="outline" size="sm" onClick={onFetchStudents}>
                Thử lại
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/debug/students">Mở Debug Tool</a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng học viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalStudents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.activeStudents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng bài làm</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalAttempts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Độ chính xác TB</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statistics.averageAccuracy.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách học viên</CardTitle>
          <CardDescription>
            Quản lý học viên được gán cho bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.student_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {getStudentInitials(student)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{formatStudentName(student)}</p>
                    <p className="text-sm text-muted-foreground">{formatStudentEmail(student)}</p>
                    <p className="text-xs text-muted-foreground">
                      Gán từ: {formatAssignedDate(student.assigned_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm font-medium">{student.total_attempts}</p>
                    <p className="text-xs text-muted-foreground">Bài làm</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium">{student.accuracy_percentage.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Chính xác</p>
                  </div>
                  
                  <Badge 
                    variant={getStatusBadgeVariant(student.status)}
                    className={getStatusBadgeClass(student.status)}
                  >
                    {getStatusDisplayText(student.status)}
                  </Badge>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUnassignStudent(student.student_id, formatStudentName(student))}
                    className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={isReassigning(student.student_id)}
                  >
                    {isReassigning(student.student_id) ? 'Đang xử lý...' : 'Bỏ gán'}
                  </Button>
                </div>
              </div>
            ))}
            
            {students.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có học viên nào được gán cho bạn
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagementView;
