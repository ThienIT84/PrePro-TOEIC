import React from 'react';
import { PassageManagerView } from './PassageManagerView';
import { usePassageManagerController } from '@/controllers/passage/usePassageManagerController';

export const PassageManagerMVC: React.FC = () => {
  const {
    // State
    passages,
    filteredPassages,
    selectedPassages,
    editingPassage,
    formData,
    loading,
    saving,
    deleting,
    importing,
    importProgress,
    error,
    activeTab,
    
    // Actions
    handleLoadPassages,
    handleCreatePassage,
    handleUpdatePassage,
    handleDeletePassage,
    handleDeleteSelectedPassages,
    handleToggleSelection,
    handleSelectAll,
    handleClearSelection,
    handleSetEditingPassage,
    handleSetFormData,
    handleApplyFilters,
    handleUploadAudio,
    handleUploadImage,
    handleImportFromExcel,
    handleExportToExcel,
    handleSetActiveTab,
    handleClearError,
    
    // Controller Methods
    getPartInfo,
    calculateWordCount,
    calculateReadingTime
  } = usePassageManagerController();

  return (
    <PassageManagerView
      controller={undefined} // Not needed in MVC wrapper
      state={{
        passages,
        filteredPassages,
        selectedPassages,
        editingPassage,
        formData,
        loading,
        saving,
        deleting,
        importing,
        importProgress,
        error,
        activeTab
      }}
      onLoadPassages={handleLoadPassages}
      onCreatePassage={handleCreatePassage}
      onUpdatePassage={handleUpdatePassage}
      onDeletePassage={handleDeletePassage}
      onDeleteSelectedPassages={handleDeleteSelectedPassages}
      onToggleSelection={handleToggleSelection}
      onSelectAll={handleSelectAll}
      onClearSelection={handleClearSelection}
      onSetEditingPassage={handleSetEditingPassage}
      onSetFormData={handleSetFormData}
      onApplyFilters={handleApplyFilters}
      onUploadAudio={handleUploadAudio}
      onUploadImage={handleUploadImage}
      onImportFromExcel={handleImportFromExcel}
      onExportToExcel={handleExportToExcel}
      onSetActiveTab={handleSetActiveTab}
      onClearError={handleClearError}
    />
  );
};