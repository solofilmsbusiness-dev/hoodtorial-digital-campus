import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useWalkthrough } from "@/hooks/useWalkthrough";
import { WalkthroughOverlay } from "@/components/walkthrough";
import { PageLayout } from "@/components/layout";
import { StampBadge } from "@/components/ui/custom-badges";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { useProfileContext } from "@/contexts/ProfileContext";
import { useQuizResults } from "@/hooks/useQuizResults";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useAssessmentResults } from "@/hooks/useAssessmentResults";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useCourseStatus } from "@/hooks/useCourseStatus";
import { courses, getTotalLessonsCount, getTotalQuizzesCount } from "@/data/courses";
import { useDbCourseCounts } from "@/hooks/useDbCourseCounts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactAdminSheet } from "@/components/support";
import { EnrollmentManagementCard } from "@/components/enrollment";
import { 
  BookOpen, 
  Trophy, 
  GraduationCap, 
  User, 
  Settings, 
  ChevronRight,
  Award,
  Clock,
  Sparkles,
  RotateCcw,
  Layers,
  CheckCircle2,
  Play,
  Users,
  HelpCircle,
  Eye,
  Map
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentCenter() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfileContext();
  const { results } = useQuizResults();
  const { progress, getTotalCredits, getCompletedCourses } = useUserProgress();
  const [supportSheetOpen, setSupportSheetOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCoursesRef = useRef<HTMLDivElement>(null);
  const [highlightedCourse, setHighlightedCourse] = useState<string | null>(null);
  const { latestResult, hasCompletedAssessment } = useAssessmentResults();
  const { 
    activeEnrollments, 
    completedEnrollments, 
    slotsRemaining, 
    maxSlots,
    isInGracePeriod,
    getGracePeriodRemaining,
    getRemainingSwaps,
    maxSwapsPerEnrollment,
    dropCourse,
    swapCourse,
  } = useEnrollments();
  
  // Use merged course list from database + static data
  const { allCourses, isLoading: coursesLoading } = useCourseStatus();
  const { dbCourseCounts } = useDbCourseCounts();

  // Handle enrolled query param - scroll to and highlight new course
  useEffect(() => {
    const enrolledCode = searchParams.get("enrolled");
    if (enrolledCode && !coursesLoading) {
      setHighlightedCourse(enrolledCode);
      
      // Scroll to active courses section
      setTimeout(() => {
        activeCoursesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        
        // Find and scroll to the specific card
        const cardElement = document.querySelector(`[data-course-code="${enrolledCode}"]`);
        if (cardElement) {
          setTimeout(() => {
            cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 300);
        }
      }, 100);
      
      // Clear the query param after highlighting
      setTimeout(() => {
        searchParams.delete("enrolled");
        setSearchParams(searchParams, { replace: true });
      }, 500);
      
      // Clear highlight after animation
      setTimeout(() => {
        setHighlightedCourse(null);
      }, 3500);
    }
  }, [searchParams, coursesLoading, setSearchParams]);

  const totalCredits = getTotalCredits();
  const completedCourses = getCompletedCourses();
  const quizzesPassed = results.filter((r) => r.passed).length;
  const requiredCredits = 60;
  const requiredCourses = 12;
  const requiredQuizzes = 12;

  // Helper to find courses from merged database + static list
  const getCourse = (code: string) => {
    return allCourses.find(c => c.code === code);
  };

  // Get recommended courses from assessment
  const recommendedCourseDetails = latestResult?.recommended_courses
    .map((code) => getCourse(code) || courses.find((c) => c.code === code))
    .filter(Boolean)
    .slice(0, 3) || [];

  // Get active course details with full course data (uses merged list)
  const activeCourseDetails = activeEnrollments
    .map((e) => {
      const course = getCourse(e.course_code);
      return course ? { ...course, enrollment: e } : null;
    })
    .filter(Boolean);

  // Get enrolled course codes for swap dialog
  const enrolledCourseCodes = activeEnrollments.map((e) => e.course_code);

  // Get completed course details with enrollment data
  const completedCourseDetails = completedEnrollments
    .map((e) => {
      const course = getCourse(e.course_code);
      return course ? { ...course, enrollment: e } : null;
    })
    .filter(Boolean);

  // Total credits from completed courses
  const totalCompletedCredits = completedCourseDetails.reduce((sum, c) => sum + (c?.credits || 0), 0);

  const getInitials = (name?: string | null) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || "S";
    return name.split(" ").map((n) => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  const getMembershipBadgeColor = (tier?: string | null) => {
    switch (tier) {
      case "graduate": return "bg-primary text-primary-foreground";
      case "sophomore": return "bg-accent text-accent-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  // Calculate course progress for each enrollment
  const getCourseProgress = (courseCode: string) => {
    // Check if enrollment is marked complete - always show 100%
    const enrollment = activeEnrollments.find(e => e.course_code === courseCode);
    if (enrollment?.status === 'completed') return 100;
    
    // Use DB counts when available, fall back to static
    const dbCounts = dbCourseCounts[courseCode];
    let totalLessons: number;
    let totalQuizzes: number;

    if (dbCounts && (dbCounts.totalLessons > 0 || dbCounts.totalQuizzes > 0)) {
      totalLessons = dbCounts.totalLessons;
      totalQuizzes = dbCounts.totalQuizzes;
    } else {
      const staticCourse = courses.find(c => c.code === courseCode);
      const course = staticCourse || getCourse(courseCode);
      if (!course) return 0;
      totalLessons = course.modules?.length > 0 ? getTotalLessonsCount(course) : 0;
      totalQuizzes = course.modules?.length > 0 ? getTotalQuizzesCount(course) : 0;
    }

    const total = totalLessons + totalQuizzes;
    if (total === 0) return 0;
    
    // Count completed lessons for this course
    const courseProgress = progress.filter(p => p.course_code === courseCode);
    const completedLessons = courseProgress.filter(p => 
      p.lesson_id && p.completed
    ).length;
    
    // Count passed quizzes for this course (unique quiz IDs only)
    const courseQuizResults = results.filter(r => r.course_code === courseCode && r.passed);
    const uniquePassedQuizIds = new Set(courseQuizResults.map(r => r.quiz_id));
    const completedQuizzes = uniquePassedQuizIds.size;
    
    const completed = completedLessons + completedQuizzes;
    return Math.round((completed / total) * 100);
  };

  const handleDropCourse = async (courseCode: string) => {
    await dropCourse(courseCode);
  };

  const handleSwapCourse = async (fromCode: string, toCode: string) => {
    await swapCourse(fromCode, toCode);
  };

  if (profileLoading || coursesLoading) {
    return (
      <PageLayout pageKey="student_center">
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-pulse text-primary font-bold text-xl">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageKey="student_center">
      <div className="py-12 px-4">
        <div className="container-wide">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
              <Avatar 
                className="h-20 w-20 border-4"
                style={{ borderColor: profile?.profile_accent_color || 'hsl(var(--primary))' }}
              >
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {getInitials(profile?.display_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="heading-2 text-foreground mb-1">
                  Welcome back, {profile?.display_name || "Student"}
                </h1>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getMembershipBadgeColor(profile?.membership_tier)}`}>
                    {profile?.membership_tier || "Freshman"}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    Enrolled {profile?.enrolled_at ? new Date(profile.enrolled_at).toLocaleDateString() : "Today"}
                  </span>
                </div>
              </div>
            </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/student/profile" 
              className="btn-brutal text-sm flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Edit Profile
            </Link>
            <Link 
              to={`/profile/${user?.id}`} 
              className="btn-brutal text-sm flex items-center gap-2 bg-charcoal hover:bg-charcoal-light"
            >
              <Eye className="h-4 w-4" />
              View Profile
            </Link>
          </div>
          </div>

          {/* Active Courses Section - Now with management */}
          <Card ref={activeCoursesRef} className="card-urban mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Active Courses
                </CardTitle>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Slots:</span>
                  <span className={cn(
                    "font-bold",
                    slotsRemaining === 0 ? "text-destructive" : "text-primary"
                  )}>
                    {activeEnrollments.length}/{maxSlots}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeEnrollments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No active courses yet.</p>
                  <p className="text-sm">You can enroll in up to {maxSlots} courses at a time.</p>
                  <Link to="/academics" className="text-primary font-bold hover:underline mt-4 inline-block">
                    Browse Courses →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeCourseDetails.map((courseData) => (
                    <EnrollmentManagementCard
                      key={courseData!.code}
                      course={{
                        code: courseData!.code,
                        title: courseData!.title,
                        department: courseData!.department,
                        credits: courseData!.credits,
                      }}
                      enrolledAt={(courseData as any).enrollment.enrolled_at}
                      progress={getCourseProgress(courseData!.code)}
                      isInGracePeriod={isInGracePeriod(courseData!.code)}
                      gracePeriodHoursRemaining={getGracePeriodRemaining(courseData!.code)}
                      remainingSwaps={getRemainingSwaps(courseData!.code)}
                      maxSwaps={maxSwapsPerEnrollment}
                      enrolledCourseCodes={enrolledCourseCodes}
                      onDrop={handleDropCourse}
                      onSwap={handleSwapCourse}
                      isHighlighted={highlightedCourse === courseData!.code}
                    />
                  ))}
                  {slotsRemaining > 0 && (
                    <Link
                      to="/academics"
                      className="p-4 border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center text-center text-muted-foreground hover:text-primary transition-all min-h-[180px] rounded-lg"
                    >
                      <BookOpen className="h-8 w-8 mb-2 opacity-50" />
                      <span className="text-sm font-medium">
                        {slotsRemaining} {slotsRemaining === 1 ? "slot" : "slots"} available
                      </span>
                      <span className="text-xs">Add a course</span>
                    </Link>
                  )}
                </div>
              )}
          </CardContent>
          </Card>

          {/* Achievements Section - Completed Courses */}
          {completedEnrollments.length > 0 && (
            <Card className="card-urban mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Your Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {completedCourseDetails.map((courseData) => (
                    <div 
                      key={courseData!.code}
                      className="relative p-4 border-2 border-primary/50 bg-primary/5 rounded-lg text-center overflow-hidden group"
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-[shimmer_3s_ease-in-out_infinite] pointer-events-none" />
                      
                      {/* Badge content */}
                      <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {courseData!.code}
                      </span>
                      <h4 className="font-bold text-sm mt-2 line-clamp-2">
                        {courseData!.title}
                      </h4>
                      
                      {/* Certification stamp */}
                      <StampBadge variant="filled" className="mt-3">
                        ✓ Certified
                      </StampBadge>
                      
                      {/* Completion date */}
                      <p className="text-xs text-muted-foreground mt-2">
                        {(courseData as any).enrollment.completed_at 
                          ? format(new Date((courseData as any).enrollment.completed_at), 'MMM d, yyyy')
                          : 'Completed'}
                      </p>
                      
                      {/* Credits */}
                      <p className="text-xs font-bold text-primary mt-1">
                        {courseData!.credits} credits earned
                      </p>
                    </div>
                  ))}
                </div>
                
                {/* Summary */}
                <div className="mt-6 pt-4 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground">
                    You've earned <span className="font-bold text-primary">{totalCompletedCredits} credits</span> from {completedEnrollments.length} completed {completedEnrollments.length === 1 ? 'course' : 'courses'}!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="card-urban">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <GraduationCap className="h-8 w-8 text-primary" />
                  <span className="text-3xl font-black text-foreground">{totalCredits}/{requiredCredits}</span>
                </div>
                <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">Credits Earned</p>
                <Progress value={(totalCredits / requiredCredits) * 100} className="h-2" />
              </CardContent>
            </Card>

            <Card className="card-urban">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="h-8 w-8 text-accent" />
                  <span className="text-3xl font-black text-foreground">{completedEnrollments.length}/{requiredCourses}</span>
                </div>
                <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">Courses Completed</p>
                <Progress value={(completedEnrollments.length / requiredCourses) * 100} className="h-2" />
              </CardContent>
            </Card>

            <Card className="card-urban">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Trophy className="h-8 w-8 text-primary" />
                  <span className="text-3xl font-black text-foreground">{quizzesPassed}/{requiredQuizzes}</span>
                </div>
                <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">Quizzes Passed</p>
                <Progress value={(quizzesPassed / requiredQuizzes) * 100} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="card-urban">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Recent Quiz Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {results.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No quiz results yet. Start a course to take your first quiz!</p>
                      <Link to="/academics" className="text-primary font-bold hover:underline mt-2 inline-block">
                        Browse Courses →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {results.slice(0, 5).map((result) => {
                        const courseTitle = courses.find((c) => c.code === result.course_code)?.title;
                        return (
                        <div key={result.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                          <div>
                            <p className="font-bold text-foreground">
                              {result.course_code}
                              {courseTitle && <span className="text-muted-foreground font-normal"> • {courseTitle}</span>}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(result.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold">
                              {result.score}/{result.total_questions}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              result.passed 
                                ? "bg-green-500/20 text-green-400" 
                                : "bg-destructive/20 text-destructive"
                            }`}>
                              {result.passed ? "Passed" : "Failed"}
                            </span>
                          </div>
                        </div>
                      )})}
                      {results.length > 5 && (
                        <Link 
                          to="/student/grades" 
                          className="block text-center text-primary font-bold hover:underline mt-4"
                        >
                          View All Grades →
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <Card className="card-urban">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Quick Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {!hasCompletedAssessment && (
                    <Link 
                      to="/assessment" 
                      className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary hover:bg-primary/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span className="font-bold text-primary">Take Entry Assessment</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-primary" />
                    </Link>
                  )}

                  <Link 
                    to="/community" 
                    className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border border-accent/30 hover:border-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-accent" />
                      <span className="font-bold">Student Community</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-accent" />
                  </Link>

                  <Link 
                    to="/academics" 
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span className="font-bold">Browse Courses</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                  
                  <Link 
                    to="/student/grades" 
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-accent" />
                      <span className="font-bold">View Grades</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                  
                  <Link 
                    to="/student/profile" 
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-primary" />
                      <span className="font-bold">Edit Profile</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>

                  {hasCompletedAssessment && (
                    <Link 
                      to="/assessment" 
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-primary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <RotateCcw className="h-5 w-5 text-muted-foreground" />
                        <span className="font-bold">Retake Assessment</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  )}

                  <button 
                    onClick={() => setSupportSheetOpen(true)}
                    className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-primary transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-muted-foreground" />
                      <span className="font-bold">Need Help?</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </CardContent>
              </Card>

              {/* Recommended Courses */}
              {hasCompletedAssessment && recommendedCourseDetails.length > 0 && (
                <Card className="card-urban">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Recommended For You
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {recommendedCourseDetails.map((course) => (
                      <Link
                        key={course!.code}
                        to={`/course/${course!.code}`}
                        className="block p-3 bg-muted/30 rounded-lg border border-border hover:border-primary transition-colors"
                      >
                        <p className="font-bold text-sm">{course!.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {course!.department} • {course!.level}
                        </p>
                      </Link>
                    ))}
                    <Link 
                      to="/academics" 
                      className="block text-center text-primary font-bold text-sm hover:underline pt-2"
                    >
                      View All Courses →
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Degree Progress */}
              <Card className="card-urban">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Degree Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${(totalCredits / requiredCredits) * 352} 352`}
                          className="text-primary"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-black">{Math.round((totalCredits / requiredCredits) * 100)}%</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {requiredCredits - totalCredits} credits to graduation
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <ContactAdminSheet 
        open={supportSheetOpen} 
        onOpenChange={setSupportSheetOpen} 
      />
    </PageLayout>
  );
}
