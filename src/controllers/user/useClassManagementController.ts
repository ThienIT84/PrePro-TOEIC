/**
 * useClassManagementController
 * React hook để integrate ClassManagementController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { ClassManagementController, ClassManagementState, ClassInfo, Student, ClassFormData } from './ClassManagementController';

export function useClassManagementController() {
  const [controller] = useState(() => new ClassManagementController());
  const [state, setState] = useState<ClassManagementState>(controller.getState());

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

  // Class management
  const setClasses = useCallback((classes: ClassInfo[]) => {
    controller.setClasses(classes);
  }, [controller]);

  const setStudents = useCallback((students: Student[]) => {
    controller.setStudents(students);
  }, [controller]);

  const setLoading = useCallback((loading: boolean) => {
    controller.setLoading(loading);
  }, [controller]);

  const setSelectedClass = useCallback((selectedClass: ClassInfo | null) => {
    controller.setSelectedClass(selectedClass);
  }, [controller]);

  const setCreateDialogOpen = useCallback((isOpen: boolean) => {
    controller.setCreateDialogOpen(isOpen);
  }, [controller]);

  const setEditDialogOpen = useCallback((isOpen: boolean) => {
    controller.setEditDialogOpen(isOpen);
  }, [controller]);

  const setNewClass = useCallback((newClass: ClassFormData) => {
    controller.setNewClass(newClass);
  }, [controller]);

  const updateNewClassField = useCallback((field: keyof ClassFormData, value: string) => {
    controller.updateNewClassField(field, value);
  }, [controller]);

  // Class operations
  const createClass = useCallback(() => {
    return controller.createClass();
  }, [controller]);

  const deleteClass = useCallback((classId: string) => {
    return controller.deleteClass(classId);
  }, [controller]);

  const addStudentToClass = useCallback((classId: string, studentId: string) => {
    return controller.addStudentToClass(classId, studentId);
  }, [controller]);

  const removeStudentFromClass = useCallback((classId: string, studentId: string) => {
    return controller.removeStudentFromClass(classId, studentId);
  }, [controller]);

  // Utility functions
  const getAvailableStudentsForClass = useCallback((classId: string) => {
    return controller.getAvailableStudentsForClass(classId);
  }, [controller]);

  const getClassById = useCallback((classId: string) => {
    return controller.getClassById(classId);
  }, [controller]);

  const getStudentById = useCallback((studentId: string) => {
    return controller.getStudentById(studentId);
  }, [controller]);

  const calculateClassStatistics = useCallback((classId: string) => {
    return controller.calculateClassStatistics(classId);
  }, [controller]);

  const getClassAnalytics = useCallback((classId: string) => {
    return controller.getClassAnalytics(classId);
  }, [controller]);

  const exportClassReport = useCallback((classId: string) => {
    return controller.exportClassReport(classId);
  }, [controller]);

  const validateClassForm = useCallback((formData: ClassFormData) => {
    return controller.validateClassForm(formData);
  }, [controller]);

  const searchClasses = useCallback((query: string) => {
    return controller.searchClasses(query);
  }, [controller]);

  const searchStudents = useCallback((query: string) => {
    return controller.searchStudents(query);
  }, [controller]);

  const getClassSummaryStatistics = useCallback(() => {
    return controller.getClassSummaryStatistics();
  }, [controller]);

  const resetForm = useCallback(() => {
    controller.resetForm();
  }, [controller]);

  return {
    // State
    state,
    
    // Class data
    classes: state.classes,
    students: state.students,
    loading: state.loading,
    selectedClass: state.selectedClass,
    isCreateDialogOpen: state.isCreateDialogOpen,
    isEditDialogOpen: state.isEditDialogOpen,
    newClass: state.newClass,

    // Class management
    setClasses,
    setStudents,
    setLoading,
    setSelectedClass,
    setCreateDialogOpen,
    setEditDialogOpen,
    setNewClass,
    updateNewClassField,

    // Class operations
    createClass,
    deleteClass,
    addStudentToClass,
    removeStudentFromClass,

    // Utility functions
    getAvailableStudentsForClass,
    getClassById,
    getStudentById,
    calculateClassStatistics,
    getClassAnalytics,
    exportClassReport,
    validateClassForm,
    searchClasses,
    searchStudents,
    getClassSummaryStatistics,
    resetForm,
  };
}
