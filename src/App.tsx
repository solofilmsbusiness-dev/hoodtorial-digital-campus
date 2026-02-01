import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatWidget } from "@/components/chat";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Degrees from "./pages/Degrees";
import Academics from "./pages/Academics";
import CourseDetail from "./pages/CourseDetail";
import Enrollment from "./pages/Enrollment";
import Faculty from "./pages/Faculty";
import About from "./pages/About";
import Auth from "./pages/Auth";
import StudentCenter from "./pages/StudentCenter";
import StudentProfile from "./pages/StudentProfile";
import StudentGrades from "./pages/StudentGrades";
import Assessment from "./pages/Assessment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <ChatWidget />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/degrees" element={<Degrees />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/course/:code" element={<CourseDetail />} />
            <Route path="/enrollment" element={<Enrollment />} />
            <Route path="/faculty" element={<Faculty />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/assessment" element={
              <ProtectedRoute>
                <Assessment />
              </ProtectedRoute>
            } />
            <Route path="/student" element={
              <ProtectedRoute>
                <StudentCenter />
              </ProtectedRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            } />
            <Route path="/student/grades" element={
              <ProtectedRoute>
                <StudentGrades />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
