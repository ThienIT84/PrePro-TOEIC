/**
 * ItemsTableCleanupMVC
 * MVC wrapper component cho ItemsTableCleanup
 * Integrates ItemsTableCleanupController với ItemsTableCleanupView
 */

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useItemsTableCleanupController } from '@/controllers/cleanup/useItemsTableCleanupController';
import ItemsTableCleanupView from './ItemsTableCleanupView';

const ItemsTableCleanupMVC: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use real items table cleanup controller
  const {
    cleaning,
    cleanupResult,
    performCleanup,
    getCleanupProcessSteps,
    getCleanupBenefits,
    getCleanupWarnings,
    getCleanupResult,
    isCleaning,
    isCleanupSuccessful,
    clearCleanupResult,
    resetCleanupState,
  } = useItemsTableCleanupController();

  // Handle perform cleanup
  const handlePerformCleanup = async (userId: string | null) => {
    if (!user) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để thực hiện cleanup",
        variant: "destructive",
      });
      return {
        success: false,
        message: "User not authenticated",
        error: "User not authenticated",
        itemsDeleted: 0,
        dataMigrated: 0,
        backupCreated: false
      };
    }

    try {
      const result = await performCleanup(user.id);
      
      if (result.success) {
        toast({
          title: "Cleanup thành công",
          description: "Bảng items đã được xóa và dữ liệu đã được migrate",
        });
      } else {
        toast({
          title: "Cleanup thất bại",
          description: result.error || 'Cleanup failed',
          variant: "destructive",
        });
      }

      return result;
    } catch (error: unknown) {
      const errorResult = {
        success: false,
        message: "Cleanup thất bại",
        error: (error as any)?.message || 'Có lỗi xảy ra',
        itemsDeleted: 0,
        dataMigrated: 0,
        backupCreated: false
      };

      toast({
        title: "Cleanup thất bại",
        description: (error as any)?.message || 'Có lỗi xảy ra',
        variant: "destructive",
      });

      return errorResult;
    }
  };

  return (
    <ItemsTableCleanupView
      // State
      cleaning={cleaning}
      cleanupResult={cleanupResult as any}

      // Actions
      onPerformCleanup={handlePerformCleanup}

      // Utility functions
      getCleanupProcessSteps={getCleanupProcessSteps}
      getCleanupBenefits={getCleanupBenefits}
      getCleanupWarnings={getCleanupWarnings}
      getCleanupResult={getCleanupResult as any}
      isCleaning={isCleaning}
      isCleanupSuccessful={isCleanupSuccessful}
      clearCleanupResult={clearCleanupResult}
      resetCleanupState={resetCleanupState}
    />
  );
};

export default ItemsTableCleanupMVC;
