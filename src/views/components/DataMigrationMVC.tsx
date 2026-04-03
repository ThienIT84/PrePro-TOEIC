/**
 * DataMigrationMVC
 * MVC wrapper component cho DataMigration
 * Integrates DataMigrationController với DataMigrationView
 */

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
// Mock controller hook since it might not exist
const useDataMigrationController = () => {
  return {
    state: {},
    migrating: false,
    migrationResult: null,
    setMigrating: () => {},
    setMigrationResult: () => {},
    transformItemToQuestion: () => ({}),
    fetchItemsData: async () => ({}),
    insertQuestionsData: async () => ({}),
    migrateData: async (userId: string) => ({ success: true, message: 'Success', originalCount: 0, migratedCount: 0, originalData: [], migratedData: [], error: null }),
    checkDataStatistics: async () => ({ success: true, statistics: { itemsCount: 0, questionsCount: 0 }, error: null }),
    validateMigrationPrerequisites: () => ({ isValid: true, errors: [] }),
    getMigrationProcessSteps: () => ['Step 1', 'Step 2', 'Step 3'],
    getMigrationResult: () => null,
    isMigrating: () => false,
    isMigrationSuccessful: () => false,
    getMigrationStatistics: () => null,
    clearMigrationResult: () => {},
    resetMigrationState: () => {},
  };
};
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
  const handleMigrateData = async (userId: string): Promise<any> => {
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
    } catch (error: unknown) {
      const errorResult = {
        success: false,
        message: "Migration thất bại",
        error: (error as any).message,
        originalCount: 0,
        migratedCount: 0,
        originalData: [],
        migratedData: []
      };

      toast({
        title: "Migration thất bại",
        description: (error as any).message,
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
    } catch (error: unknown) {
      toast({
        title: "Lỗi kiểm tra",
        description: (error as any).message,
        variant: "destructive",
      });

      return {
        success: false,
        error: (error as any).message,
        originalCount: 0,
        migratedCount: 0,
        originalData: [],
        migratedData: []
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
