import React, { lazy, ComponentType } from 'react';

// Simple ErrorBoundary component
const ErrorBoundary = ({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) => {
  return <>{children}</>;
};

// Lazy loading utilities for MVC components
export const createLazyController = <T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
) => {
  return lazy(importFn);
};

// Lazy loading for Controllers
export const LazyTOEICQuestionCreatorController = createLazyController(
  () => import('@/controllers/question/TOEICQuestionCreatorController')
);

export const LazyTOEICBulkUploadController = createLazyController(
  () => import('@/controllers/upload/TOEICBulkUploadController')
);

export const LazyPassageManagerController = createLazyController(
  () => import('@/controllers/passage/PassageManagerController')
);

export const LazyExamReviewController = createLazyController(
  () => import('@/controllers/exam/ExamReviewController')
);

// Lazy loading for Views
export const LazyTOEICQuestionCreatorView = createLazyController(
  () => import('@/views/components/TOEICQuestionCreatorView')
);

export const LazyTOEICBulkUploadView = createLazyController(
  () => import('@/views/components/TOEICBulkUploadView')
);

export const LazyPassageManagerView = createLazyController(
  () => import('@/views/components/PassageManagerView')
);

export const LazyExamReviewView = createLazyController(
  () => import('@/views/components/ExamReviewView')
);

// Lazy loading for MVC Wrappers
export const LazyTOEICQuestionCreatorMVC = createLazyController(
  () => import('@/views/components/TOEICQuestionCreatorMVC')
);

export const LazyTOEICBulkUploadMVC = createLazyController(
  () => import('@/views/components/TOEICBulkUploadMVC')
);

export const LazyPassageManagerMVC = createLazyController(
  () => import('@/views/components/PassageManagerMVC')
);

export const LazyExamReviewMVC = createLazyController(
  () => import('@/views/components/ExamReviewMVC')
);

// Lazy loading for Hooks
export const LazyUseTOEICQuestionCreatorController = createLazyController(
  () => import('@/controllers/question/useTOEICQuestionCreatorController')
);

export const LazyUseTOEICBulkUploadController = createLazyController(
  () => import('@/controllers/upload/useTOEICBulkUploadController')
);

export const LazyUsePassageManagerController = createLazyController(
  () => import('@/controllers/passage/usePassageManagerController')
);

export const LazyUseExamReviewController = createLazyController(
  () => import('@/controllers/exam/useExamReviewController')
);

// Lazy loading for Services
export const LazyQuestionService = createLazyController(
  () => import('@/services/domains/QuestionService')
);

export const LazyExamService = createLazyController(
  () => import('@/services/domains/ExamService')
);

export const LazyUserService = createLazyController(
  () => import('@/services/domains/UserService')
);

export const LazyAnalyticsService = createLazyController(
  () => import('@/services/domains/AnalyticsService')
);

export const LazyMediaService = createLazyController(
  () => import('@/services/domains/MediaService')
);

// Lazy loading for Pages
export const LazyQuestionManagement = createLazyController(
  () => import('@/pages/QuestionManagement')
);

export const LazyExamSelection = createLazyController(
  () => import('@/pages/ExamSelection')
);

export const LazyAnalytics = createLazyController(
  () => import('@/pages/Analytics')
);

export const LazyDashboard = createLazyController(
  () => import('@/pages/Dashboard')
);

// Utility function to preload components
export const preloadComponent = (importFn: () => Promise<unknown>) => {
  return () => {
    importFn();
  };
};

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload Dashboard and QuestionManagement as they're most commonly used
  preloadComponent(() => import('@/pages/Dashboard'))();
  preloadComponent(() => import('@/pages/QuestionManagement'))();
};

// Lazy loading with error boundary
export const createLazyWithErrorBoundary = <T extends ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType<Record<string, unknown>>
) => {
  const LazyComponent = lazy(importFn);
  
  return (props: Record<string, unknown>) => {
    const FallbackComponent = fallback || (() => <div>Loading...</div>);
    
    return (
      <ErrorBoundary fallback={<FallbackComponent />}>
        <LazyComponent {...props} />
      </ErrorBoundary>
    );
  };
};

// Simple Error Boundary for lazy loading
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<unknown> },
  { hasError: boolean }
> {
  constructor(props: unknown) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      return <FallbackComponent />;
    }

    return this.props.children;
  }
}
