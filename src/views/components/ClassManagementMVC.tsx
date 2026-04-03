/**
 * ClassManagementMVC
 * MVC wrapper component cho ClassManagement
 * Integrates ClassManagementController với ClassManagementView
 */

import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
// Mock interfaces since controllers might not exist
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

// Mock controller hook
const useClassManagementController = () => {
  return {
    state: {},
    classes: [],
    students: [],
    loading: false,
    selectedClass: null,
    isCreateDialogOpen: false,
    isEditDialogOpen: false,
    newClass: { name: '', description: '' },
    setClasses: (classes: ClassInfo[]) => {},
    setStudents: (students: Student[]) => {},
    setLoading: (loading: boolean) => {},
    setSelectedClass: (selectedClass: ClassInfo | null) => {},
    setCreateDialogOpen: (isOpen: boolean) => {},
    setEditDialogOpen: (isOpen: boolean) => {},
    updateNewClassField: (field: string, value: string) => {},
    createClass: () => ({ success: true, error: null }),
    deleteClass: (classId: string) => ({ success: true, error: null }),
    addStudentToClass: (classId: string, studentId: string) => ({ success: true, error: null }),
    removeStudentFromClass: (classId: string, studentId: string) => ({ success: true, error: null }),
    exportClassReport: (classId: string) => ({ success: true, error: null }),
    getAvailableStudentsForClass: (classId: string) => [],
    getClassById: (classId: string) => null,
    getStudentById: (studentId: string) => null,
    calculateClassStatistics: (classId: string) => ({ totalStudents: 0, avgScore: 0, completionRate: 0 }),
    getClassAnalytics: (classId: string) => ({ scoreDistribution: [], activityTrend: [], topPerformers: [], strugglingStudents: [] }),
    validateClassForm: (formData: any) => ({ isValid: true, errors: [] }),
    searchClasses: (query: string) => [],
    searchStudents: (query: string) => [],
    getClassSummaryStatistics: () => ({ totalClasses: 0, totalStudents: 0, avgClassSize: 0, avgScore: 0 }),
    resetForm: () => {},
  };
};
import ClassManagementView from './ClassManagementView';

const ClassManagementMVC: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use class management controller
  const {
    state,
    classes,
    students,
    loading,
    selectedClass,
    isCreateDialogOpen,
    isEditDialogOpen,
    newClass,
    setClasses,
    setStudents,
    setLoading,
    setSelectedClass,
    setCreateDialogOpen,
    setEditDialogOpen,
    updateNewClassField,
    createClass,
    deleteClass,
    addStudentToClass,
    removeStudentFromClass,
    exportClassReport,
    getAvailableStudentsForClass,
    getClassById,
    getStudentById,
    calculateClassStatistics,
    getClassAnalytics,
    validateClassForm,
    searchClasses,
    searchStudents,
    getClassSummaryStatistics,
    resetForm,
  } = useClassManagementController();

  // Fetch classes (mock data)
  const fetchClasses = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Mock data - in real implementation, you'd fetch from classes table
      const mockClasses: ClassInfo[] = [
        {
          id: 'class_1',
          name: 'TOEIC Intermediate',
          description: 'Students targeting 600-700 points',
          student_count: 15,
          created_at: '2024-01-01',
          avg_score: 650,
          completion_rate: 85,
          students: []
        },
        {
          id: 'class_2',
          name: 'TOEIC Advanced',
          description: 'Students targeting 700+ points',
          student_count: 8,
          created_at: '2024-01-15',
          avg_score: 720,
          completion_rate: 92,
          students: []
        }
      ];

      setClasses(mockClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách lớp học.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch students from Supabase
  const fetchStudents = async () => {
    if (!user) return;

    try {
      // Get teacher's students
      const { data: teacherStudents } = await supabase.rpc('get_teacher_students', {
        teacher_uuid: user.id
      });

      if (teacherStudents) {
        const studentIds = teacherStudents.map(s => s.student_id);
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', studentIds) as any;

        const attemptsResult = await (supabase as any)
          .from('exam_attempts')
          .select('user_id, is_correct, created_at')
          .in('user_id', studentIds);
        const attempts = attemptsResult.data as any;

        const studentsWithStats: Student[] = (profiles as any)?.map((profile: any) => {
          const studentAttempts = (attempts as any)?.filter((a: any) => a.user_id === profile.id) || [];
          const avgScore = studentAttempts.length > 0 ?
            Math.round((studentAttempts.filter((a: any) => a.is_correct).length / studentAttempts.length) * 100) : 0;
          
          const lastActivity = studentAttempts.length > 0 ?
            studentAttempts.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at :
            profile.id; // Fallback

          return {
            id: profile.id,
            name: profile.full_name || 'Unknown',
            email: profile.email || '',
            avg_score: avgScore,
            last_activity: lastActivity,
            is_in_class: false // This would be determined by class membership
          };
        }) || [];

        setStudents(studentsWithStats);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Handle create class
  const handleCreateClass = () => {
    const validation = validateClassForm(newClass);
    if (!validation.isValid) {
      toast({
        title: 'Lỗi',
        description: validation.errors.join(', '),
        variant: 'destructive'
      });
      return;
    }

    const result = createClass();
    if (result.success) {
      toast({
        title: 'Thành công',
        description: 'Đã tạo lớp học mới.'
      });
    } else {
      toast({
        title: 'Lỗi',
        description: result.error || 'Không thể tạo lớp học.',
        variant: 'destructive'
      });
    }
  };

  // Handle delete class
  const handleDeleteClass = (classId: string) => {
    const result = deleteClass(classId);
    if (result.success) {
      toast({
        title: 'Thành công',
        description: 'Đã xóa lớp học.'
      });
    } else {
      toast({
        title: 'Lỗi',
        description: result.error || 'Không thể xóa lớp học.',
        variant: 'destructive'
      });
    }
  };

  // Handle add student to class
  const handleAddStudentToClass = (classId: string, studentId: string) => {
    const result = addStudentToClass(classId, studentId);
    if (result.success) {
      toast({
        title: 'Thành công',
        description: 'Đã thêm học viên vào lớp.'
      });
    } else {
      toast({
        title: 'Lỗi',
        description: result.error || 'Không thể thêm học viên vào lớp.',
        variant: 'destructive'
      });
    }
  };

  // Handle remove student from class
  const handleRemoveStudentFromClass = (classId: string, studentId: string) => {
    const result = removeStudentFromClass(classId, studentId);
    if (result.success) {
      toast({
        title: 'Thành công',
        description: 'Đã xóa học viên khỏi lớp.'
      });
    } else {
      toast({
        title: 'Lỗi',
        description: result.error || 'Không thể xóa học viên khỏi lớp.',
        variant: 'destructive'
      });
    }
  };

  // Handle export class report
  const handleExportClassReport = (classInfo: ClassInfo) => {
    const result = exportClassReport(classInfo.id);
    if (result.success) {
      toast({
        title: 'Thành công',
        description: `Đã xuất báo cáo cho lớp ${classInfo.name}.`
      });
    } else {
      toast({
        title: 'Lỗi',
        description: result.error || 'Không thể xuất báo cáo.',
        variant: 'destructive'
      });
    }
  };

  // Initialize data
  useEffect(() => {
    if (user) {
      fetchClasses();
      fetchStudents();
    }
  }, [user]);

  return (
    <ClassManagementView
      // State
      classes={classes}
      students={students}
      loading={loading}
      selectedClass={selectedClass}
      isCreateDialogOpen={isCreateDialogOpen}
      isEditDialogOpen={isEditDialogOpen}
      newClass={newClass}

      // Actions
      onCreateClass={handleCreateClass}
      onDeleteClass={handleDeleteClass}
      onAddStudentToClass={handleAddStudentToClass}
      onRemoveStudentFromClass={handleRemoveStudentFromClass}
      onExportClassReport={handleExportClassReport}
      onSetSelectedClass={setSelectedClass}
      onSetCreateDialogOpen={setCreateDialogOpen}
      onSetEditDialogOpen={setEditDialogOpen}
      onUpdateNewClassField={updateNewClassField}
      onResetForm={resetForm}

      // Utility functions
      getAvailableStudentsForClass={getAvailableStudentsForClass}
      getClassById={getClassById}
      getStudentById={getStudentById}
      calculateClassStatistics={calculateClassStatistics}
      getClassAnalytics={getClassAnalytics}
      validateClassForm={validateClassForm}
      searchClasses={searchClasses}
      searchStudents={searchStudents}
      getClassSummaryStatistics={getClassSummaryStatistics}
    />
  );
};

export default ClassManagementMVC;
