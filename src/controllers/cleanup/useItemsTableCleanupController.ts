/**
 * useItemsTableCleanupController
 * React hook để integrate ItemsTableCleanupController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { ItemsTableCleanupController, ItemsTableCleanupState, CleanupResult, DependenciesCheck, BackupResult, MigrationResult, DropTableResult } from './ItemsTableCleanupController';

export function useItemsTableCleanupController() {
  const [controller] = useState(() => new ItemsTableCleanupController());
  const [state, setState] = useState<ItemsTableCleanupState>(controller.getState());

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
  const setCleaning = useCallback((cleaning: boolean) => {
    controller.setCleaning(cleaning);
  }, [controller]);

  const setCleanupResult = useCallback((cleanupResult: CleanupResult | null) => {
    controller.setCleanupResult(cleanupResult);
  }, [controller]);

  // Cleanup operations
  const checkDependencies = useCallback(async () => {
    return controller.checkDependencies();
  }, [controller]);

  const backupItemsData = useCallback(async () => {
    return controller.backupItemsData();
  }, [controller]);

  const migrateRemainingData = useCallback(async (userId: string | null) => {
    return controller.migrateRemainingData(userId);
  }, [controller]);

  const dropItemsTable = useCallback(async () => {
    return controller.dropItemsTable();
  }, [controller]);

  const performCleanup = useCallback(async (userId: string | null) => {
    return controller.performCleanup(userId);
  }, [controller]);

  // Utility functions
  const getCleanupProcessSteps = useCallback(() => {
    return controller.getCleanupProcessSteps();
  }, [controller]);

  const getCleanupBenefits = useCallback(() => {
    return controller.getCleanupBenefits();
  }, [controller]);

  const getCleanupWarnings = useCallback(() => {
    return controller.getCleanupWarnings();
  }, [controller]);

  const getCleanupResult = useCallback(() => {
    return controller.getCleanupResult();
  }, [controller]);

  const isCleaning = useCallback(() => {
    return controller.isCleaning();
  }, [controller]);

  const isCleanupSuccessful = useCallback(() => {
    return controller.isCleanupSuccessful();
  }, [controller]);

  const clearCleanupResult = useCallback(() => {
    controller.clearCleanupResult();
  }, [controller]);

  const resetCleanupState = useCallback(() => {
    controller.resetCleanupState();
  }, [controller]);

  return {
    // State
    state,
    
    // State properties
    cleaning: state.cleaning,
    cleanupResult: state.cleanupResult,

    // State management
    setCleaning,
    setCleanupResult,

    // Cleanup operations
    checkDependencies,
    backupItemsData,
    migrateRemainingData,
    dropItemsTable,
    performCleanup,

    // Utility functions
    getCleanupProcessSteps,
    getCleanupBenefits,
    getCleanupWarnings,
    getCleanupResult,
    isCleaning,
    isCleanupSuccessful,
    clearCleanupResult,
    resetCleanupState,
  };
}
