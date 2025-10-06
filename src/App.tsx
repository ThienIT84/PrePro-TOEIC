import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Review from "./pages/Review";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import QuestionManagement from "./pages/QuestionManagement";
import QuestionGeneratorPage from "./pages/QuestionGeneratorPage";
import ExamQuestionManagement from "./components/ExamQuestionManagement";
import ExamResult from "./components/ExamResult";
import ExamHistory from "./components/ExamHistory";
import StudentExamResults from "./components/StudentExamResults";
import ExamSession from "./components/ExamSession";
// Removed debug page: ExamSessionDebug
import ExamSessionPage from "./pages/ExamSession";
import ExamSets from "./pages/ExamSets";
import ExamSelection from "./pages/ExamSelection";
import ExamCustomize from "./pages/ExamCustomize";
import ExamReview from "./pages/ExamReview";
import DebugReview from "./pages/DebugReview";
import TestAuth from "./pages/TestAuth";
import RoleManagementSimple from "./components/RoleManagementSimple";
import StudentManagement from "./components/StudentManagement";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import { useParams } from "react-router-dom";

const queryClient = new QueryClient();

const ExamSessionWrapper = () => {
  const { examSetId } = useParams<{ examSetId: string }>();
  return <ExamSession examSetId={examSetId!} />;
};

const AppContent = () => {
  const { user, loading } = useAuth();
  const { permissions } = usePermissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Home route */}
      <Route 
        path="/" 
        element={<Index />} 
      />
      
      {/* Public routes */}
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/dashboard" replace /> : <Auth />} 
      />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          user ? (
            <Layout>
              <Dashboard />
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      
      <Route 
        path="/review" 
        element={
          user ? (
            <Layout>
              <Review />
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route 
        path="/debug-review" 
        element={
          user ? (
            <Layout>
              <DebugReview />
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route 
        path="/test-auth" 
        element={
          user ? (
            <Layout>
              <TestAuth />
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route 
        path="/analytics" 
        element={
          user ? (
            <Layout>
              <Analytics />
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route 
        path="/settings" 
        element={
          user ? (
            <Layout>
              <Settings />
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route 
        path="/questions" 
        element={
          user && permissions.canCreateQuestions ? (
            <Layout>
              <QuestionManagement />
            </Layout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } 
      />
      <Route 
        path="/question-generator" 
        element={
          user && permissions.canCreateQuestions ? (
            <Layout>
              <QuestionGeneratorPage />
            </Layout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } 
      />
      <Route 
        path="/exam-sets/:examSetId/questions" 
        element={
          user && permissions.canCreateExamSets ? (
            <Layout>
              <ExamQuestionManagement />
            </Layout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } 
      />
      <Route 
        path="/exam-sets/:examSetId/customize" 
        element={
          user ? (
            <Layout>
              <ExamCustomize />
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route 
        path="/exam-sets/:examSetId/take" 
        element={
          user ? (
            <Layout>
              <ExamSessionWrapper />
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route 
        path="/exam-result/:sessionId" 
        element={
          user ? (
            <Layout>
              <ExamResult />
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route 
        path="/exam-review/:sessionId" 
        element={
          user ? (
            <Layout>
              <ExamReview />
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route 
        path="/exam-history" 
        element={
          user ? (
            <Layout>
              <ExamHistory />
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route 
        path="/student-exam-results" 
        element={
          user && permissions.canManageStudents ? (
            <Layout>
              <StudentExamResults />
            </Layout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } 
      />
      
      {/* Role Management - Teacher only */}
      <Route 
        path="/role-management" 
        element={
          user && permissions.canManageStudents ? (
            <Layout>
              <RoleManagementSimple />
            </Layout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } 
      />
      
      {/* Student Management - Teacher only */}
      <Route 
        path="/students" 
        element={
          user && permissions.canManageStudents ? (
            <Layout>
              <StudentManagement />
            </Layout>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } 
      />
      
      
      {/* Exam Session - Student only */}
      <Route
        path="/exam-session"
        element={
          user ? (
            <ExamSessionPage />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="/exam-session/:examSetId"
        element={
          user ? (
            <ExamSessionPage />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="/exam-sets"
        element={
          user ? (
            <Layout>
              <ExamSets />
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="/exam-selection"
        element={
          user ? (
            <Layout>
              <ExamSelection />
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="/exam-selection/:examSetId"
        element={
          user ? (
            <Layout>
              <ExamSelection />
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route 
        path="/exam-result" 
        element={
          user ? (
            <Layout>
              <ExamResult />
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      
      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
