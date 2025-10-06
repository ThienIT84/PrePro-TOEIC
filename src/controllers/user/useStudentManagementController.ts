/**
 * useStudentManagementController
 * React hook để integrate StudentManagementController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  StudentManagementController, 
  StudentManagementState, 
  Student, 
  StudentStatistics,
  ReassignStudentParams,
  UnassignStudentParams
} from './StudentManagementController';

export function useStudentManagementController() {
  const [controller] = useState(() => new StudentManagementController());
  const [state, setState] = useState<StudentManagementState>(controller.getState());

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
  const setStudents = useCallback((students: Student[]) => {
    controller.setStudents(students);
  }, [controller]);

  const setLoading = useCallback((loading: boolean) => {
    controller.setLoading(loading);
  }, [controller]);

  const setError = useCallback((error: string | null) => {
    controller.setError(error);
  }, [controller]);

  const setReassigning = useCallback((reassigning: string | null) => {
    controller.setReassigning(reassigning);
  }, [controller]);

  // Data operations
  const fetchStudents = useCallback(async (userId: string) => {
    return controller.fetchStudents(userId);
  }, [controller]);

  const reassignStudent = useCallback(async (params: ReassignStudentParams) => {
    return controller.reassignStudent(params);
  }, [controller]);

  const unassignStudent = useCallback(async (params: UnassignStudentParams, teacherId: string) => {
    return controller.unassignStudent(params, teacherId);
  }, [controller]);

  // Utility functions
  const getStudentStatistics = useCallback(() => {
    return controller.getStudentStatistics();
  }, [controller]);

  const getActiveStudents = useCallback(() => {
    return controller.getActiveStudents();
  }, [controller]);

  const getStudentById = useCallback((studentId: string) => {
    return controller.getStudentById(studentId);
  }, [controller]);

  const getStudentsByStatus = useCallback((status: string) => {
    return controller.getStudentsByStatus(status);
  }, [controller]);

  const getTopPerformingStudents = useCallback((limit?: number) => {
    return controller.getTopPerformingStudents(limit);
  }, [controller]);

  const getMostActiveStudents = useCallback((limit?: number) => {
    return controller.getMostActiveStudents(limit);
  }, [controller]);

  const getStudentPerformanceSummary = useCallback(() => {
    return controller.getStudentPerformanceSummary();
  }, [controller]);

  const formatStudentName = useCallback((student: Student) => {
    return controller.formatStudentName(student);
  }, [controller]);

  const formatStudentEmail = useCallback((student: Student) => {
    return controller.formatStudentEmail(student);
  }, [controller]);

  const formatAssignedDate = useCallback((assignedAt: string) => {
    return controller.formatAssignedDate(assignedAt);
  }, [controller]);

  const getStudentInitials = useCallback((student: Student) => {
    return controller.getStudentInitials(student);
  }, [controller]);

  const getStatusBadgeVariant = useCallback((status: string) => {
    return controller.getStatusBadgeVariant(status);
  }, [controller]);

  const getStatusBadgeClass = useCallback((status: string) => {
    return controller.getStatusBadgeClass(status);
  }, [controller]);

  const getStatusDisplayText = useCallback((status: string) => {
    return controller.getStatusDisplayText(status);
  }, [controller]);

  // State getters
  const isLoading = useCallback(() => {
    return controller.isLoading();
  }, [controller]);

  const isReassigning = useCallback((studentId?: string) => {
    return controller.isReassigning(studentId);
  }, [controller]);

  const getError = useCallback(() => {
    return controller.getError();
  }, [controller]);

  const getStudents = useCallback(() => {
    return controller.getStudents();
  }, [controller]);

  const clearError = useCallback(() => {
    controller.clearError();
  }, [controller]);

  const resetState = useCallback(() => {
    controller.resetState();
  }, [controller]);

  return {
    // State
    state,
    
    // State properties
    students: state.students,
    loading: state.loading,
    error: state.error,
    reassigning: state.reassigning,

    // State management
    setStudents,
    setLoading,
    setError,
    setReassigning,

    // Data operations
    fetchStudents,
    reassignStudent,
    unassignStudent,

    // Utility functions
    getStudentStatistics,
    getActiveStudents,
    getStudentById,
    getStudentsByStatus,
    getTopPerformingStudents,
    getMostActiveStudents,
    getStudentPerformanceSummary,
    formatStudentName,
    formatStudentEmail,
    formatAssignedDate,
    getStudentInitials,
    getStatusBadgeVariant,
    getStatusBadgeClass,
    getStatusDisplayText,

    // State getters
    isLoading,
    isReassigning,
    getError,
    getStudents,
    clearError,
    resetState,
  };
}
