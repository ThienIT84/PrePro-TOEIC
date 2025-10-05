/**
 * BulkOperationsMVC
 * MVC wrapper component cho BulkOperations
 * Integrates BulkOperationsController với BulkOperationsView
 */

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useBulkOperationsController } from '../controllers/bulk/useBulkOperationsController';
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
  
  // Use bulk operations controller
  const {
    state,
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
    resetState,
  } = useBulkOperationsController();

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to upload files',
        variant: 'destructive'
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message,
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
          description: `${result.exportedCount} questions exported to Excel file`,
        });
      } else {
        toast({
          title: "Export failed",
          description: result.error || 'Failed to export questions',
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle generate template
  const handleGenerateTemplate = () => {
    generateTemplate();
    toast({
      title: "Template downloaded",
      description: "Question template has been downloaded",
    });
  };

  return (
    <BulkOperationsView
      // State
      activeTab={activeTab}
      questions={questions}
      loading={loading}
      importing={importing}
      progress={progress}

      // Actions
      onSetActiveTab={setActiveTab}
      onFileUpload={handleFileUpload}
      onImportQuestions={handleImportQuestions}
      onExportQuestions={handleExportQuestions}
      onGenerateTemplate={handleGenerateTemplate}
      onFixQuestion={fixQuestion}
      onRemoveQuestion={removeQuestion}

      // Data getters
      getQuestionCounts={getQuestionCounts}
      getValidQuestions={getValidQuestions}
      getInvalidQuestions={getInvalidQuestions}
      getImportedQuestions={getImportedQuestions}

      // State checks
      canImport={canImport}
      isImporting={isImporting}
      isLoading={isLoading}
      getProgress={getProgress}
      getActiveTab={getActiveTab}
      getQuestions={getQuestions}

      // Utility functions
      clearQuestions={clearQuestions}
      resetState={resetState}

      // Props
      className={className}
    />
  );
};

export default BulkOperationsMVC;
