import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AlumniDashboard from "./pages/AlumniDashboard";
import NotFound from "./pages/NotFound";
import MaintenancePage from "./pages/MaintenancePage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode; allowedRole: string }) => {
  const { user, userRole, loading, isMaintenanceMode } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a proper spinner
  }

  // Maintenance Check
  if (isMaintenanceMode && userRole !== "admin") {
    // If user is admin (or we are checking if they are admin), we might let them pass or check further.
    // Actually `userRole` might be 'admin', 'student', 'alumni'.
    // Logic: If maintenance is ON, ONLY admins can access protected routes.
    // If I am a student trying to access /dashboard/student -> Redirect to Maintenance.
    return <Navigate to="/maintenance" replace />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (userRole === undefined) {
    return <div>Verifying access...</div>; // Waiting for role fetch
  }

  if (userRole !== allowedRole) {
    // Optional: Redirect to an unauthorized page or back to home with a toast
    return <Navigate to="/" replace />; 
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login/:role" element={<LoginPage />} />
            <Route
              path="/dashboard/student"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/alumni"
              element={
                <ProtectedRoute allowedRole="alumni">
                  <AlumniDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
