import React from 'react';
import { TOEICBulkUploadView } from './TOEICBulkUploadView';
import { useTOEICBulkUploadController } from '@/controllers/upload/useTOEICBulkUploadController';

export const TOEICBulkUploadMVC: React.FC = () => {
  const {
    // State
    questions,
    passages,
    progress,
    loading,
    error,
    
    // Actions
    handleFileSelect,
    handleImportQuestions,
    handleImportPassages,
    handleDownloadTemplate,
    handleReset,
    clearError,
    
    // Controller Methods
    getPartInfo
  } = useTOEICBulkUploadController();

  return (
    <TOEICBulkUploadView
      controller={undefined} // Not needed in MVC wrapper
      state={{
        questions,
        passages,
        progress,
        loading,
        error
      }}
      onFileSelect={handleFileSelect}
      onImportQuestions={handleImportQuestions}
      onImportPassages={handleImportPassages}
      onDownloadTemplate={handleDownloadTemplate}
      onReset={handleReset}
    />
  );
};



















