import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatWidget } from "@/components/chat";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { TestModeProvider } from "@/contexts/TestModeContext";
import { ProtectedRoute, AdminRoute, PaidRoute, AssessmentRequiredRoute } from "@/components/auth";
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
import Shop from "./pages/Shop";
import Community from "./pages/Community";
import NotFound from "./pages/NotFound";
import SkillTree from "./pages/SkillTree";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CourseManager from "./pages/admin/CourseManager";
import CourseEditor from "./pages/admin/CourseEditor";
import UserManager from "./pages/admin/UserManager";
import CommunityManager from "./pages/admin/CommunityManager";
import ChallengeManager from "./pages/admin/ChallengeManager";
import AdminSettings from "./pages/admin/AdminSettings";
import SupportManager from "./pages/admin/SupportManager";
import Checkout from "./pages/Checkout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <AuthProvider>
          <ProfileProvider>
            <TestModeProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ChatWidget />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/degrees" element={<Degrees />} />
                <Route path="/skill-tree/:path" element={<SkillTree />} />
                <Route path="/academics" element={<Academics />} />
                <Route path="/course/:code" element={
                  <PaidRoute>
                    <CourseDetail />
                  </PaidRoute>
                } />
                <Route path="/enrollment" element={<Enrollment />} />
                <Route path="/faculty" element={<Faculty />} />
                <Route path="/about" element={<About />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/community" element={
                  <AssessmentRequiredRoute>
                    <Community />
                  </AssessmentRequiredRoute>
                } />
                <Route path="/auth" element={<Auth />} />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/assessment" element={
                  <ProtectedRoute>
                    <Assessment />
                  </ProtectedRoute>
                } />
                <Route path="/student" element={
                  <AssessmentRequiredRoute>
                    <StudentCenter />
                  </AssessmentRequiredRoute>
                } />
                <Route path="/student/profile" element={
                  <AssessmentRequiredRoute>
                    <StudentProfile />
                  </AssessmentRequiredRoute>
                } />
                <Route path="/student/grades" element={
                  <AssessmentRequiredRoute>
                    <StudentGrades />
                  </AssessmentRequiredRoute>
                } />
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/courses" element={
                  <AdminRoute>
                    <CourseManager />
                  </AdminRoute>
                } />
                <Route path="/admin/courses/:code" element={
                  <AdminRoute>
                    <CourseEditor />
                  </AdminRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminRoute>
                    <UserManager />
                  </AdminRoute>
                } />
                <Route path="/admin/community" element={
                  <AdminRoute>
                    <CommunityManager />
                  </AdminRoute>
                } />
                <Route path="/admin/settings" element={
                  <AdminRoute>
                    <AdminSettings />
                  </AdminRoute>
                } />
                <Route path="/admin/challenges" element={
                  <AdminRoute>
                    <ChallengeManager />
                  </AdminRoute>
                } />
                <Route path="/admin/support" element={
                  <AdminRoute>
                    <SupportManager />
                  </AdminRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
        </TestModeProvider>
      </ProfileProvider>
    </AuthProvider>
  </TooltipProvider>
</ThemeProvider>
  </QueryClientProvider>
);

export default App;
