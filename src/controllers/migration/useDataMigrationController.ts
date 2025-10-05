/**
 * useDataMigrationController
 * React hook để integrate DataMigrationController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { DataMigrationController, DataMigrationState, MigrationResult, DataStatistics, ItemData, QuestionData } from './DataMigrationController';

export function useDataMigrationController() {
  const [controller] = useState(() => new DataMigrationController());
  const [state, setState] = useState<DataMigrationState>(controller.getState());

  // Subscribe to controller state changes
  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return unsubscribe;
  }, [controller]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      controller.cleanup();
    };
  }, [controller]);

  // State management
  const setMigrating = useCallback((migrating: boolean) => {
    controller.setMigrating(migrating);
  }, [controller]);

  const setMigrationResult = useCallback((migrationResult: MigrationResult | null) => {
    controller.setMigrationResult(migrationResult);
  }, [controller]);

  // Data operations
  const transformItemToQuestion = useCallback((item: ItemData, userId: string) => {
    return controller.transformItemToQuestion(item, userId);
  }, [controller]);

  const fetchItemsData = useCallback(async () => {
    return controller.fetchItemsData();
  }, [controller]);

  const insertQuestionsData = useCallback(async (questions: QuestionData[]) => {
    return controller.insertQuestionsData(questions);
  }, [controller]);

  // Migration operations
  const migrateData = useCallback(async (userId: string) => {
    return controller.migrateData(userId);
  }, [controller]);

  const checkDataStatistics = useCallback(async () => {
    return controller.checkDataStatistics();
  }, [controller]);

  const validateMigrationPrerequisites = useCallback(async () => {
    return controller.validateMigrationPrerequisites();
  }, [controller]);

  // Utility functions
  const getMigrationProcessSteps = useCallback(() => {
    return controller.getMigrationProcessSteps();
  }, [controller]);

  const getMigrationResult = useCallback(() => {
    return controller.getMigrationResult();
  }, [controller]);

  const isMigrating = useCallback(() => {
    return controller.isMigrating();
  }, [controller]);

  const isMigrationSuccessful = useCallback(() => {
    return controller.isMigrationSuccessful();
  }, [controller]);

  const getMigrationStatistics = useCallback(() => {
    return controller.getMigrationStatistics();
  }, [controller]);

  const clearMigrationResult = useCallback(() => {
    controller.clearMigrationResult();
  }, [controller]);

  const resetMigrationState = useCallback(() => {
    controller.resetMigrationState();
  }, [controller]);

  return {
    // State
    state,
    
    // State properties
    migrating: state.migrating,
    migrationResult: state.migrationResult,

    // State management
    setMigrating,
    setMigrationResult,

    // Data operations
    transformItemToQuestion,
    fetchItemsData,
    insertQuestionsData,

    // Migration operations
    migrateData,
    checkDataStatistics,
    validateMigrationPrerequisites,

    // Utility functions
    getMigrationProcessSteps,
    getMigrationResult,
    isMigrating,
    isMigrationSuccessful,
    getMigrationStatistics,
    clearMigrationResult,
    resetMigrationState,
  };
}
