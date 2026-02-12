import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatWidget } from "@/components/chat";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { TestModeProvider } from "@/contexts/TestModeContext";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { CartProvider } from "@/contexts/CartContext";
import { DemoModeBanner } from "@/components/admin/DemoModeBanner";
 import { TesterModeBanner } from "@/components/admin/TesterModeBanner";
 import { useTestMode } from "@/hooks/useTestMode";
import { ProtectedRoute, AdminRoute, PaidRoute, AssessmentRequiredRoute } from "@/components/auth";
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
import WaitlistManager from "./pages/admin/WaitlistManager";
import FacultyManager from "./pages/admin/FacultyManager";
import Checkout from "./pages/Checkout";
 import Friends from "./pages/Friends";
 import Messages from "./pages/Messages";
 import PublicProfile from "./pages/PublicProfile";

const queryClient = new QueryClient();

// Root redirect component - always sends users to login or student center
function RootRedirect() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary font-bold text-xl">Loading...</div>
      </div>
    );
  }
  
  return <Navigate to={user ? "/student" : "/auth"} replace />;
}

// Redirect component for legacy /journey/:path routes
function JourneyRedirect() {
  const { path } = useParams();
  return <Navigate to={`/skill-tree/${path}`} replace />;
}

 // Wrapper component to access hooks inside providers
 function AppContent() {
   const { isTesterRole, isTestModeEnabled } = useTestMode();
   
   // Show tester banner only for tester role (not admin test mode)
   const showTesterBanner = isTesterRole && isTestModeEnabled;
   
   return (
     <>
       {showTesterBanner && <TesterModeBanner />}
       <BrowserRouter>
         <DemoModeBanner />
         <ChatWidget />
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/degrees" element={<Degrees />} />
            <Route path="/skill-tree/:path" element={<SkillTree />} />
            <Route path="/journey/:path" element={<JourneyRedirect />} />
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
           <Route path="/friends" element={
             <AssessmentRequiredRoute>
               <Friends />
             </AssessmentRequiredRoute>
           } />
           <Route path="/messages" element={
             <AssessmentRequiredRoute>
               <Messages />
             </AssessmentRequiredRoute>
           } />
             <Route path="/profile/:userId" element={
               <AssessmentRequiredRoute>
                 <PublicProfile />
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
             <Route path="/admin/waitlist" element={
               <AdminRoute>
                 <WaitlistManager />
               </AdminRoute>
             } />
             <Route path="/admin/faculty" element={
               <AdminRoute>
                 <FacultyManager />
               </AdminRoute>
             } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
           <Route path="*" element={<NotFound />} />
         </Routes>
       </BrowserRouter>
     </>
   );
 }
 
 const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <AuthProvider>
          <ProfileProvider>
            <TestModeProvider>
               <DemoModeProvider>
                <CartProvider>
               <Toaster />
               <Sonner />
                <AppContent />
                </CartProvider>
             </DemoModeProvider>
        </TestModeProvider>
      </ProfileProvider>
    </AuthProvider>
  </TooltipProvider>
</ThemeProvider>
  </QueryClientProvider>
);

export default App;
