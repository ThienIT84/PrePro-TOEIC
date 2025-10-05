/**
 * PassageManagerMVC
 * MVC wrapper component cho Passage Management
 * Integrates controller với view và Supabase operations
 */

import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { usePassageManagerController } from '@/controllers/passage/usePassageManagerController';
import { PassageManagerView } from '@/views/components/PassageManagerView';
import { Passage } from '@/controllers/passage/PassageManagerController';
import * as XLSX from 'xlsx';

interface PassageManagerMVCProps {
  className?: string;
}

export const PassageManagerMVC: React.FC<PassageManagerMVCProps> = ({ 
  className = '' 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    // State
    state,
    
    // Data getters
    getFilteredPassages,
    getStatistics,

    // Search and filter handlers
    setSearchTerm,
    setFilterPart,

    // Tab navigation handlers
    setActiveTab,

    // Form handlers
    updateFormData,
    resetFormData,
    handleContentChange,

    // Selection handlers
    toggleSelectAll,
    toggleSelectPassage,
    clearSelection,

    // Passage management handlers
    editPassage,
    setEditingPassage,

    // Loading state handlers
    setLoading,
    setSaving,
    setImporting,
    setImportProgress,
    setDeleting,

    // Utility functions
    getPartName,
    getPartColor,
    getTemplateData,
    validatePassageData,
    processImportedData,
  } = usePassageManagerController();

  // Load passages on mount
  useEffect(() => {
    fetchPassages();
  }, []);

  // Clear selection when filters change
  useEffect(() => {
    clearSelection();
  }, [state.searchTerm, state.filterPart]);

  // Fetch passages from Supabase
  const fetchPassages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('passages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Update controller with fetched data
      // Note: This would need to be implemented in the controller
      // For now, we'll simulate the data update
      console.log('Fetched passages:', data);
      
    } catch (error) {
      console.error('Error fetching passages:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách đoạn văn',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search term change
  const handleSearchTermChange = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  // Handle filter part change
  const handleFilterPartChange = (filterPart: string) => {
    setFilterPart(filterPart);
  };

  // Handle active tab change
  const handleActiveTabChange = (activeTab: string) => {
    setActiveTab(activeTab);
  };

  // Handle form data change
  const handleFormDataChange = (field: string, value: any) => {
    updateFormData(field, value);
  };

  // Handle content change
  const handleContentChange = (content: string) => {
    handleContentChange(content);
  };

  // Handle toggle select all
  const handleToggleSelectAll = () => {
    toggleSelectAll();
  };

  // Handle toggle select passage
  const handleToggleSelectPassage = (passageId: string) => {
    toggleSelectPassage(passageId);
  };

  // Handle edit passage
  const handleEditPassage = (passage: Passage) => {
    editPassage(passage);
  };

  // Handle save passage
  const handleSavePassage = async () => {
    if (!user) {
      toast({
        title: 'Lỗi',
        description: 'Bạn cần đăng nhập để lưu đoạn văn',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      const passageData = {
        ...state.formData,
        created_by: user.id
      };

      if (state.editingPassage) {
        // Update existing passage
        const { error } = await supabase
          .from('passages')
          .update(passageData)
          .eq('id', state.editingPassage.id);

        if (error) throw error;

        toast({
          title: 'Thành công',
          description: 'Đã cập nhật đoạn văn',
        });
      } else {
        // Create new passage
        const { error } = await supabase
          .from('passages')
          .insert(passageData);

        if (error) throw error;

        toast({
          title: 'Thành công',
          description: 'Đã tạo đoạn văn mới',
        });
      }

      // Reset form and refresh data
      resetFormData();
      setEditingPassage(null);
      setActiveTab('list');
      fetchPassages();

    } catch (error: any) {
      console.error('Error saving passage:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể lưu đoạn văn',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle delete passage
  const handleDeletePassage = async (passageId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đoạn văn này?')) return;

    try {
      const { error } = await supabase
        .from('passages')
        .delete()
        .eq('id', passageId);

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Đã xóa đoạn văn',
      });

      fetchPassages();
    } catch (error: any) {
      console.error('Error deleting passage:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa đoạn văn',
        variant: 'destructive',
      });
    }
  };

  // Handle delete selected passages
  const handleDeleteSelectedPassages = async () => {
    if (state.selectedPassages.size === 0) return;
    
    const confirmMessage = `Bạn có chắc chắn muốn xóa ${state.selectedPassages.size} đoạn văn đã chọn?`;
    if (!confirm(confirmMessage)) return;

    try {
      setDeleting(true);
      
      const { error } = await supabase
        .from('passages')
        .delete()
        .in('id', Array.from(state.selectedPassages));

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: `Đã xóa ${state.selectedPassages.size} đoạn văn`,
      });

      clearSelection();
      fetchPassages();
    } catch (error: any) {
      console.error('Error deleting passages:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa các đoạn văn đã chọn',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Handle download template
  const handleDownloadTemplate = () => {
    const templateData = getTemplateData();

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, 'Passages');
    XLSX.writeFile(wb, 'passages_template.xlsx');

    toast({
      title: 'Template downloaded',
      description: 'Đã tải template Excel cho passages',
    });
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setImportProgress(0);

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const { validData, errors } = processImportedData(jsonData);

      let successCount = 0;
      let errorCount = errors.length;

      for (let i = 0; i < validData.length; i++) {
        const passageData = validData[i];
        
        try {
          const { error } = await supabase
            .from('passages')
            .insert({
              ...passageData,
              created_by: user?.id
            });

          if (error) throw error;

          successCount++;
        } catch (error: any) {
          console.error(`Error importing row ${i + 1}:`, error);
          errorCount++;
        }

        // Update progress
        setImportProgress(((i + 1) / validData.length) * 100);
      }

      toast({
        title: 'Import completed',
        description: `Successfully imported ${successCount} passages. ${errorCount} errors.`,
        variant: errorCount > 0 ? 'destructive' : 'default',
      });

      // Refresh passages list
      fetchPassages();

    } catch (error: any) {
      console.error('Error importing passages:', error);
      toast({
        title: 'Import failed',
        description: error.message || 'Không thể import file Excel',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
      setImportProgress(0);
    }
  };

  // Handle reset form
  const handleResetForm = () => {
    resetFormData();
    setEditingPassage(null);
  };

  return (
    <PassageManagerView
      // State
      state={state}

      // Handlers
      onSearchTermChange={handleSearchTermChange}
      onFilterPartChange={handleFilterPartChange}
      onActiveTabChange={handleActiveTabChange}
      onFormDataChange={handleFormDataChange}
      onContentChange={handleContentChange}
      onToggleSelectAll={handleToggleSelectAll}
      onToggleSelectPassage={handleToggleSelectPassage}
      onEditPassage={handleEditPassage}
      onSavePassage={handleSavePassage}
      onDeletePassage={handleDeletePassage}
      onDeleteSelectedPassages={handleDeleteSelectedPassages}
      onDownloadTemplate={handleDownloadTemplate}
      onFileUpload={handleFileUpload}
      onResetForm={handleResetForm}

      // Utility functions
      getFilteredPassages={getFilteredPassages}
      getPartName={getPartName}
      getPartColor={getPartColor}
      getStatistics={getStatistics}

      // Props
      className={className}
    />
  );
};

export default PassageManagerMVC;
