import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Drills from "./pages/Drills";
import Review from "./pages/Review";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();

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
        path="/drills" 
        element={
          user ? (
            <Layout>
              <Drills />
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
