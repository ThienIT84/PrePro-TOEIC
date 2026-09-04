/**
 * BulkOperationsMVC
 * MVC wrapper component cho BulkOperations
 * Integrates BulkOperationsController với BulkOperationsView
 */

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useBulkOperationsController } from '@/controllers/bulk/useBulkOperationsController';
import BulkOperationsView from './BulkOperationsView';

export interface BulkOperationsMVCProps {
  onQuestionsImported?: (count: number) => void;
  className?: string;
}

const BulkOperationsMVC: React.FC<BulkOperationsMVCProps> = ({
  onQuestionsImported,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use real bulk operations controller
  const {
    activeTab,
    questions,
    loading,
    importing,
    progress,
    setActiveTab,
    setQuestions,
    setLoading,
    setImporting,
    setProgress,
    validateQuestion,
    fixQuestion,
    removeQuestion,
    processExcelFile,
    generateTemplate,
    importQuestions,
    exportQuestions,
    getQuestionCounts,
    getValidQuestions,
    getInvalidQuestions,
    getImportedQuestions,
    canImport,
    isImporting,
    isLoading,
    getProgress,
    getActiveTab,
    getQuestions,
    clearQuestions,
    resetState
  } = useBulkOperationsController();

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setQuestions([]);

    try {
      const result = await processExcelFile(file);
      
      if (result.success) {
        setQuestions(result.questions);
        toast({
          title: "File processed",
          description: `${result.validCount} valid questions, ${result.invalidCount} invalid questions`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || 'Failed to process file',
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as any)?.message || 'Có lỗi xảy ra',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle import questions
  const handleImportQuestions = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to import questions',
        variant: 'destructive'
      });
      return;
    }

    const validQuestions = getValidQuestions();
    if (validQuestions.length === 0) {
      toast({
        title: "No valid questions",
        description: "Please fix invalid questions before importing",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setProgress(0);

    try {
      const result = await importQuestions(user.id, 10);
      
      if (result.success) {
        toast({
          title: "Import successful",
          description: `${result.importedCount} questions imported successfully`,
        });
        onQuestionsImported?.(result.importedCount);
      } else {
        toast({
          title: "Import failed",
          description: result.error || 'Failed to import questions',
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Import failed",
        description: (error as any)?.message || 'Có lỗi xảy ra',
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  // Handle export questions
  const handleExportQuestions = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to export questions',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await exportQuestions();
      
      if (result.success) {
        toast({
          title: "Export successful",
          description: `${result.exportedCount} questions exported successfully`,
        });
      } else {
        toast({
          title: "Export failed",
          description: result.error || 'Failed to export questions',
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Export failed",
        description: (error as any)?.message || 'Có lỗi xảy ra',
        variant: "destructive",
      });
    }
  };

  // Handle download template
  const handleDownloadTemplate = () => {
    generateTemplate();
    toast({
      title: "Template downloaded",
      description: "Excel template has been generated and downloaded",
    });
  };

  // Handle fix question
  const handleFixQuestion = (index: number, field: string, value: string) => {
    fixQuestion(index, field as any, value);
  };

  // Handle remove question
  const handleRemoveQuestion = (index: number) => {
    removeQuestion(index);
    toast({
      title: "Question removed",
      description: "Question has been removed from the list",
    });
  };

  // Handle clear questions
  const handleClearQuestions = () => {
    clearQuestions();
    toast({
      title: "Questions cleared",
      description: "All questions have been cleared from the list",
    });
  };

  return (
    <BulkOperationsView
      // State
      activeTab={activeTab}
      questions={questions as any}
      loading={loading}
      importing={importing}
      progress={progress}

      // Actions
      onSetActiveTab={setActiveTab}
      onFileUpload={handleFileUpload}
      onImportQuestions={handleImportQuestions}
      onExportQuestions={handleExportQuestions}
      onDownloadTemplate={handleDownloadTemplate}
      onFixQuestion={handleFixQuestion}
      onRemoveQuestion={handleRemoveQuestion}
      onClearQuestions={handleClearQuestions}

      // Utility functions
      getQuestionCounts={getQuestionCounts}
      getValidQuestions={getValidQuestions as any}
      getInvalidQuestions={getInvalidQuestions as any}
      getImportedQuestions={getImportedQuestions as any}
      canImport={canImport}

      // Props
      className={className}
    />
  );
};

export default BulkOperationsMVC;
