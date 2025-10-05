/**
 * DataMigrationMVC
 * MVC wrapper component cho DataMigration
 * Integrates DataMigrationController với DataMigrationView
 */

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDataMigrationController } from '../controllers/migration/useDataMigrationController';
import DataMigrationView from './DataMigrationView';

const DataMigrationMVC: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use data migration controller
  const {
    state,
    migrating,
    migrationResult,
    setMigrating,
    setMigrationResult,
    transformItemToQuestion,
    fetchItemsData,
    insertQuestionsData,
    migrateData,
    checkDataStatistics,
    validateMigrationPrerequisites,
    getMigrationProcessSteps,
    getMigrationResult,
    isMigrating,
    isMigrationSuccessful,
    getMigrationStatistics,
    clearMigrationResult,
    resetMigrationState,
  } = useDataMigrationController();

  // Handle migrate data
  const handleMigrateData = async (userId: string) => {
    if (!user) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để migrate",
        variant: "destructive",
      });
      return {
        success: false,
        message: "User not authenticated",
        error: "User not authenticated"
      };
    }

    try {
      const result = await migrateData(user.id);
      
      if (result.success) {
        toast({
          title: "Migration thành công",
          description: `Đã chuyển ${result.originalCount} câu hỏi từ items sang questions`,
        });
      } else {
        toast({
          title: "Migration thất bại",
          description: result.error || 'Migration failed',
          variant: "destructive",
        });
      }

      return result;
    } catch (error: any) {
      const errorResult = {
        success: false,
        message: "Migration thất bại",
        error: error.message
      };

      toast({
        title: "Migration thất bại",
        description: error.message,
        variant: "destructive",
      });

      return errorResult;
    }
  };

  // Handle check data statistics
  const handleCheckDataStatistics = async () => {
    try {
      const result = await checkDataStatistics();
      
      if (result.success && result.statistics) {
        toast({
          title: "Thống kê dữ liệu",
          description: `Items: ${result.statistics.itemsCount}, Questions: ${result.statistics.questionsCount}`,
        });
      } else {
        toast({
          title: "Lỗi kiểm tra",
          description: result.error || 'Failed to check data statistics',
          variant: "destructive",
        });
      }

      return result;
    } catch (error: any) {
      toast({
        title: "Lỗi kiểm tra",
        description: error.message,
        variant: "destructive",
      });

      return {
        success: false,
        error: error.message
      };
    }
  };

  return (
    <DataMigrationView
      // State
      migrating={migrating}
      migrationResult={migrationResult}

      // Actions
      onMigrateData={handleMigrateData}
      onCheckDataStatistics={handleCheckDataStatistics}

      // Utility functions
      getMigrationProcessSteps={getMigrationProcessSteps}
      getMigrationResult={getMigrationResult}
      isMigrating={isMigrating}
      isMigrationSuccessful={isMigrationSuccessful}
      getMigrationStatistics={getMigrationStatistics}
      clearMigrationResult={clearMigrationResult}
      resetMigrationState={resetMigrationState}
    />
  );
};

export default DataMigrationMVC;
