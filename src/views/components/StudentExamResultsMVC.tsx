/**
 * StudentExamResultsMVC
 * MVC wrapper component cho StudentExamResults
 * Integrates StudentExamResultsController với StudentExamResultsView
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useStudentExamResultsController } from '../controllers/analytics/useStudentExamResultsController';
import StudentExamResultsView from './StudentExamResultsView';

const StudentExamResultsMVC: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use student exam results controller
  const {
    state,
    examResults,
    studentStats,
    loading,
    error,
    selectedStudent,
    viewingExamId,
    setSelectedStudent,
    setViewingExamId,
    fetchStudentExamResults,
    getFilteredResults,
    formatTime,
    formatDate,
    getScoreColor,
    getScoreBadgeVariant,
    getOverviewStatistics,
  } = useStudentExamResultsController();

  // Fetch data on mount
  useEffect(() => {
    handleFetchData();
  }, []);

  // Handle fetch data
  const handleFetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Lỗi',
          description: 'Không thể xác thực người dùng',
          variant: 'destructive'
        });
        return;
      }

      const result = await fetchStudentExamResults({
        teacherId: user.id
      });

      if (!result.success) {
        toast({
          title: 'Lỗi',
          description: result.error || 'Không thể tải kết quả thi của học sinh',
          variant: 'destructive'
        });
      }
    } catch (error: unknown) {
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Handle navigate back
  const handleNavigateBack = () => {
    navigate('/dashboard');
  };

  // Handle navigate to exam result
  const handleNavigateToExamResult = (examId: string) => {
    navigate(`/exam-result/${examId}`);
  };

  return (
    <StudentExamResultsView
      // State
      examResults={examResults}
      studentStats={studentStats}
      loading={loading}
      error={error}
      selectedStudent={selectedStudent}
      viewingExamId={viewingExamId}

      // Actions
      onSetSelectedStudent={setSelectedStudent}
      onSetViewingExamId={setViewingExamId}
      onNavigateBack={handleNavigateBack}
      onNavigateToExamResult={handleNavigateToExamResult}

      // Utility functions
      getFilteredResults={getFilteredResults}
      formatTime={formatTime}
      formatDate={formatDate}
      getScoreColor={getScoreColor}
      getScoreBadgeVariant={getScoreBadgeVariant}
      getOverviewStatistics={getOverviewStatistics}
    />
  );
};

export default StudentExamResultsMVC;
