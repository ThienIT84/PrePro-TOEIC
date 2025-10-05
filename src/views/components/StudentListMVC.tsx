/**
 * StudentListMVC
 * MVC wrapper component cho Student List Management
 * Integrates controller với view
 */

import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useStudentListController } from '@/controllers/user/useStudentListController';
import { StudentListView } from '@/views/components/StudentListView';
import { BulkAction } from '@/controllers/user/StudentListController';

interface StudentListMVCProps {
  className?: string;
}

export const StudentListMVC: React.FC<StudentListMVCProps> = ({ 
  className = '' 
}) => {
  const { toast } = useToast();
  
  const {
    // State
    students,
    loading,
    selectedStudents,
    filters,
    showFilters,
    isBulkActionOpen,
    bulkMessage,

    // Handlers
    updateFilters,
    clearFilters,
    toggleFilters,
    handleSelectAll,
    handleSelectStudent,
    getBulkActions,
    setBulkMessage,
    sendBulkMessage,
    closeBulkActionDialog,

    // Utility functions
    getFilteredStudents,
    getStatusIcon,
    getStatusBadge,
    getLevelBadge,
    getActiveFiltersCount,
    getStatistics,
  } = useStudentListController();

  // Handle filters update
  const handleFiltersUpdate = (updates: Partial<typeof filters>) => {
    updateFilters(updates);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    clearFilters();
  };

  // Handle toggle filters
  const handleToggleFilters = () => {
    toggleFilters();
  };

  // Handle select all
  const handleSelectAll = () => {
    handleSelectAll();
  };

  // Handle select student
  const handleSelectStudent = (studentId: string) => {
    handleSelectStudent(studentId);
  };

  // Handle bulk action
  const handleBulkAction = (action: BulkAction) => {
    switch (action.id) {
      case 'send-notification':
        toast({
          title: 'Thành công',
          description: `Đã gửi thông báo cho ${selectedStudents.length} học viên.`
        });
        break;
      case 'assign-homework':
        toast({
          title: 'Thành công',
          description: `Đã gán bài tập cho ${selectedStudents.length} học viên.`
        });
        break;
      case 'export-data':
        toast({
          title: 'Thành công',
          description: `Đã xuất dữ liệu của ${selectedStudents.length} học viên.`
        });
        break;
    }
  };

  // Handle bulk message change
  const handleBulkMessageChange = (message: string) => {
    setBulkMessage(message);
  };

  // Handle send bulk message
  const handleSendBulkMessage = () => {
    sendBulkMessage();
    toast({
      title: 'Thành công',
      description: `Đã gửi thông báo cho ${selectedStudents.length} học viên.`
    });
  };

  // Handle close bulk action dialog
  const handleCloseBulkActionDialog = () => {
    closeBulkActionDialog();
  };

  return (
    <StudentListView
      // State
      students={students}
      loading={loading}
      selectedStudents={selectedStudents}
      filters={filters}
      showFilters={showFilters}
      isBulkActionOpen={isBulkActionOpen}
      bulkMessage={bulkMessage}

      // Handlers
      onFiltersUpdate={handleFiltersUpdate}
      onClearFilters={handleClearFilters}
      onToggleFilters={handleToggleFilters}
      onSelectAll={handleSelectAll}
      onSelectStudent={handleSelectStudent}
      onBulkAction={handleBulkAction}
      onBulkMessageChange={handleBulkMessageChange}
      onSendBulkMessage={handleSendBulkMessage}
      onCloseBulkActionDialog={handleCloseBulkActionDialog}

      // Utility functions
      getFilteredStudents={getFilteredStudents}
      getStatusIcon={getStatusIcon}
      getStatusBadge={getStatusBadge}
      getLevelBadge={getLevelBadge}
      getActiveFiltersCount={getActiveFiltersCount}
      getStatistics={getStatistics}

      // Props
      className={className}
    />
  );
};

export default StudentListMVC;
