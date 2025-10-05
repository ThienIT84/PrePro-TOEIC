import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { AppRole } from '@/types';

interface Permission {
  canCreateQuestions: boolean;
  canEditQuestions: boolean;
  canDeleteQuestions: boolean;
  canCreateExamSets: boolean;
  canEditExamSets: boolean;
  canDeleteExamSets: boolean;
  canUploadExcel: boolean;
  canViewAllStudents: boolean;
  canManageStudents: boolean;
  canViewAnalytics: boolean;
}

const usePermissions = () => {
  const { profile, loading } = useAuth();
  const [permissions, setPermissions] = useState<Permission>({
    canCreateQuestions: false,
    canEditQuestions: false,
    canDeleteQuestions: false,
    canCreateExamSets: false,
    canEditExamSets: false,
    canDeleteExamSets: false,
    canUploadExcel: false,
    canViewAllStudents: false,
    canManageStudents: false,
    canViewAnalytics: false,
  });

  useEffect(() => {
    if (!profile) {
      setPermissions({
        canCreateQuestions: false,
        canEditQuestions: false,
        canDeleteQuestions: false,
        canCreateExamSets: false,
        canEditExamSets: false,
        canDeleteExamSets: false,
        canUploadExcel: false,
        canViewAllStudents: false,
        canManageStudents: false,
        canViewAnalytics: false,
      });
      return;
    }

    const role = profile.role as AppRole;
    
    switch (role) {
      case 'teacher':
        setPermissions({
          canCreateQuestions: true,
          canEditQuestions: true,
          canDeleteQuestions: true,
          canCreateExamSets: true,
          canEditExamSets: true,
          canDeleteExamSets: true,
          canUploadExcel: true,
          canViewAllStudents: true,
          canManageStudents: true,
          canViewAnalytics: true,
        });
        break;
        
      case 'student':
        setPermissions({
          canCreateQuestions: false,
          canEditQuestions: false,
          canDeleteQuestions: false,
          canCreateExamSets: false,
          canEditExamSets: false,
          canDeleteExamSets: false,
          canUploadExcel: false,
          canViewAllStudents: false,
          canManageStudents: false,
          canViewAnalytics: false,
        });
        break;
        
      default:
        // Default to student permissions
        setPermissions({
          canCreateQuestions: false,
          canEditQuestions: false,
          canDeleteQuestions: false,
          canCreateExamSets: false,
          canEditExamSets: false,
          canDeleteExamSets: false,
          canUploadExcel: false,
          canViewAllStudents: false,
          canManageStudents: false,
          canViewAnalytics: false,
        });
    }
  }, [profile]);

  const isTeacher = () => profile?.role === 'teacher';
  const isStudent = () => profile?.role === 'student';
  const getUserRole = () => {
    if (loading) return null; // Không trả về role khi đang loading
    return profile?.role || null; // Trả về null thay vì 'student' mặc định
  };

  return {
    permissions,
    isTeacher,
    isStudent,
    getUserRole,
  };
};

export { usePermissions };
export default usePermissions;
