/**
 * BulkUploadMVC
 * MVC wrapper component cho TOEIC Bulk Upload
 * Integrates controller với view
 */

import React, { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useBulkUploadController } from '@/controllers/upload/useBulkUploadController';
import { BulkUploadView } from '@/views/components/BulkUploadView';

interface BulkUploadMVCProps {
  onQuestionsImported?: (count: number) => void;
  className?: string;
}

export const BulkUploadMVC: React.FC<BulkUploadMVCProps> = ({ 
  onQuestionsImported,
  className = '' 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    // State
    questions,
    passages,
    loading,
    importing,
    progress,
    errors,

    // File processing handlers
    processFile,
    downloadTemplate,

    // Import handlers
    importQuestions,

    // State management handlers
    reset,
    clearQuestions,
    updateQuestionStatus,

    // Utility functions
    getStatistics,
    getPartIcon,
    getPartColor,
    usesIndividualAudio,
    usesPassageAudio,
    getToeicPartInfo,
    getQuestion,
    getQuestionsByPart,
    getQuestionsByStatus,
  } = useBulkUploadController();

  // Handle file upload with toast notifications
  const handleFileUpload = async (file: File) => {
    const result = await processFile(file);
    
    if (result.success) {
      toast({
        title: "File processed",
        description: result.error || "File processed successfully",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to process Excel file",
        variant: "destructive",
      });
    }
  };

  // Handle template download with toast notifications
  const handleDownloadTemplate = () => {
    downloadTemplate();
    toast({
      title: "Template downloaded",
      description: "Đã tải template Excel cho TOEIC questions",
    });
  };

  // Handle import questions with toast notifications
  const handleImportQuestions = async () => {
    if (!user?.id) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng đăng nhập để import câu hỏi',
        variant: 'destructive',
      });
      return;
    }

    const result = await importQuestions(user.id);
    
    if (result.success) {
      toast({
        title: "Import successful",
        description: `${result.count} TOEIC questions imported successfully`,
      });
      onQuestionsImported?.(result.count || 0);
    } else {
      toast({
        title: "Import failed",
        description: result.error || "Failed to import questions",
        variant: "destructive",
      });
    }
  };

  // Handle reset with confirmation
  const handleReset = () => {
    if (questions.length > 0) {
      if (confirm('Are you sure you want to reset? This will clear all questions.')) {
        reset();
        toast({
          title: "Reset successful",
          description: "All data has been cleared",
        });
      }
    } else {
      reset();
    }
  };

  // Handle clear questions with confirmation
  const handleClearQuestions = () => {
    if (questions.length > 0) {
      if (confirm('Are you sure you want to clear all questions?')) {
        clearQuestions();
        toast({
          title: "Questions cleared",
          description: "All questions have been cleared",
        });
      }
    } else {
      clearQuestions();
    }
  };

  return (
    <BulkUploadView
      // State
      questions={questions}
      passages={passages}
      loading={loading}
      importing={importing}
      progress={progress}
      errors={errors}

      // Handlers
      onFileUpload={handleFileUpload}
      onDownloadTemplate={handleDownloadTemplate}
      onImportQuestions={handleImportQuestions}
      onReset={handleReset}
      onClearQuestions={handleClearQuestions}
      onUpdateQuestionStatus={updateQuestionStatus}

      // Utility functions
      getStatistics={getStatistics}
      getPartIcon={getPartIcon}
      getPartColor={getPartColor}
      usesIndividualAudio={usesIndividualAudio}
      usesPassageAudio={usesPassageAudio}
      getToeicPartInfo={getToeicPartInfo}
      getQuestion={getQuestion}
      getQuestionsByPart={getQuestionsByPart}
      getQuestionsByStatus={getQuestionsByStatus}

      // Props
      className={className}
      fileInputRef={fileInputRef}
    />
  );
};

export default BulkUploadMVC;
