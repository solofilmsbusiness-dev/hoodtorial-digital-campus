import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useQuizResults } from "@/hooks/useQuizResults";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useAssessmentResults } from "@/hooks/useAssessmentResults";
import { courses } from "@/data/courses";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  RotateCcw
} from "lucide-react";

export default function StudentCenter() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { results } = useQuizResults();
  const { getTotalCredits, getCompletedCourses } = useUserProgress();
  const { latestResult, hasCompletedAssessment } = useAssessmentResults();

  const totalCredits = getTotalCredits();
  const completedCourses = getCompletedCourses();
  const quizzesPassed = results.filter((r) => r.passed).length;
  const requiredCredits = 60;
  const requiredCourses = 12;
  const requiredQuizzes = 12;

  // Get recommended courses from assessment
  const recommendedCourseDetails = latestResult?.recommended_courses
    .map((code) => courses.find((c) => c.code === code))
    .filter(Boolean)
    .slice(0, 3) || [];

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

  if (profileLoading) {
    return (
      <PageLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-pulse text-primary font-bold text-xl">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="py-12 px-4">
        <div className="container-wide">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 border-4 border-primary">
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
            <Link 
              to="/student/profile" 
              className="btn-brutal text-sm flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Edit Profile
            </Link>
          </div>

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
                  <span className="text-3xl font-black text-foreground">{completedCourses}/{requiredCourses}</span>
                </div>
                <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">Courses Completed</p>
                <Progress value={(completedCourses / requiredCourses) * 100} className="h-2" />
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
                      {results.slice(0, 5).map((result) => (
                        <div key={result.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                          <div>
                            <p className="font-bold text-foreground">{result.course_code}</p>
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
                      ))}
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
    </PageLayout>
  );
}
