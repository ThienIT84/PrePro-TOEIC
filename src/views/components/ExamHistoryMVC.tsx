/**
 * ExamHistoryMVC
 * MVC wrapper component cho ExamHistory
 * Integrates ExamHistoryController với ExamHistoryView
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useExamHistoryController } from '../controllers/exam/useExamHistoryController';
import ExamHistoryView from './ExamHistoryView';

const ExamHistoryMVC: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use exam history controller
  const {
    state,
    exams,
    loading,
    error,
    fetchExamHistory,
    formatTime,
    formatDate,
    getScoreColor,
  } = useExamHistoryController();

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

      const result = await fetchExamHistory({
        userId: user.id
      });

      if (!result.success) {
        toast({
          title: 'Lỗi',
          description: result.error || 'Không thể tải lịch sử bài thi',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
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

  // Handle navigate to exam sets
  const handleNavigateToExamSets = () => {
    navigate('/exam-sets');
  };

  return (
    <ExamHistoryView
      // State
      exams={exams}
      loading={loading}
      error={error}

      // Actions
      onNavigateBack={handleNavigateBack}
      onNavigateToExamResult={handleNavigateToExamResult}
      onNavigateToExamSets={handleNavigateToExamSets}

      // Utility functions
      formatTime={formatTime}
      formatDate={formatDate}
      getScoreColor={getScoreColor}
    />
  );
};

export default ExamHistoryMVC;
