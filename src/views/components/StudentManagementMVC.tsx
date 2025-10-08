/**
 * StudentManagementMVC
 * MVC wrapper component cho StudentManagement
 * Integrates StudentManagementController với StudentManagementView
 */

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';
import { useStudentManagementController } from '../controllers/user/useStudentManagementController';
import StudentManagementView from './StudentManagementView';

const StudentManagementMVC: React.FC = () => {
  const { user, profile } = useAuth();
  const { isTeacher } = usePermissions();
  const { toast } = useToast();
  
  // Use student management controller
  const {
    state,
    students,
    loading,
    error,
    reassigning,
    setError,
    fetchStudents,
    reassignStudent,
    unassignStudent,
    getStudentStatistics,
    formatStudentName,
    formatStudentEmail,
    formatAssignedDate,
    getStudentInitials,
    getStatusBadgeVariant,
    getStatusBadgeClass,
    getStatusDisplayText,
    isReassigning,
    clearError,
  } = useStudentManagementController();

  // Fetch students on mount
  useEffect(() => {
    if (isTeacher() && user) {
      handleFetchStudents();
    }
  }, [isTeacher(), user?.id]);

  // Handle fetch students
  const handleFetchStudents = async () => {
    if (!user) {
      setError('Không có user đăng nhập');
      return;
    }
    
    try {
      const result = await fetchStudents(user.id);
      
      if (!result.success) {
        toast({
          title: "Lỗi",
          description: result.error || 'Failed to fetch students',
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle reassign student
  const handleReassignStudent = async (studentId: string, newTeacherId: string) => {
    try {
      const result = await reassignStudent({ studentId, newTeacherId });
      
      if (result.success) {
        // Refresh students list
        await handleFetchStudents();
        
        toast({
          title: "Thành công",
          description: "Đã chuyển học viên thành công",
        });
      } else {
        toast({
          title: "Lỗi",
          description: result.error || 'Failed to reassign student',
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle unassign student
  const handleUnassignStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Bạn có chắc muốn bỏ gán học viên "${studentName || 'Chưa có tên'}"?\n\nHọc viên sẽ không còn được gán cho bạn nhưng tài khoản vẫn được giữ lại.`)) {
      return;
    }

    if (!user) {
      toast({
        title: "Lỗi",
        description: "Không có user đăng nhập",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await unassignStudent({ studentId, studentName }, user.id);
      
      if (result.success) {
        // Refresh students list
        await handleFetchStudents();
        
        toast({
          title: "Thành công",
          description: `Đã bỏ gán học viên "${studentName || 'Chưa có tên'}" thành công`,
        });
      } else {
        toast({
          title: "Lỗi",
          description: result.error || 'Failed to unassign student',
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle clear error
  const handleClearError = () => {
    clearError();
  };

  // Check if user is teacher
  if (!isTeacher()) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Bạn không có quyền truy cập trang này. Chỉ có giáo viên mới có thể quản lý học viên.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <StudentManagementView
      // State
      students={students}
      loading={loading}
      error={error}
      reassigning={reassigning}

      // Actions
      onFetchStudents={handleFetchStudents}
      onReassignStudent={handleReassignStudent}
      onUnassignStudent={handleUnassignStudent}
      onClearError={handleClearError}

      // Utility functions
      getStudentStatistics={getStudentStatistics}
      formatStudentName={formatStudentName}
      formatStudentEmail={formatStudentEmail}
      formatAssignedDate={formatAssignedDate}
      getStudentInitials={getStudentInitials}
      getStatusBadgeVariant={getStatusBadgeVariant}
      getStatusBadgeClass={getStatusBadgeClass}
      getStatusDisplayText={getStatusDisplayText}
      isReassigning={isReassigning}
    />
  );
};

export default StudentManagementMVC;
