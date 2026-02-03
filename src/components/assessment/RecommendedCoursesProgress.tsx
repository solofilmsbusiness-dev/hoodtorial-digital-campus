import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, PlayCircle, Lock, Trophy, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { courses as allCourses } from "@/data/courses";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useQuizResults } from "@/hooks/useQuizResults";

interface RecommendedCoursesProgressProps {
  recommendedCourses: string[];
}

type CourseStatus = "not-started" | "in-progress" | "completed";

interface CourseProgressData {
  code: string;
  title: string;
  department: string;
  status: CourseStatus;
  progressPercent: number;
  lessonsCompleted: number;
  totalLessons: number;
}

export function RecommendedCoursesProgress({ recommendedCourses }: RecommendedCoursesProgressProps) {
  const navigate = useNavigate();
  const { enrollments } = useEnrollments();
  const { progress } = useUserProgress();
  const { results: quizResults } = useQuizResults();

  const courseProgressData = useMemo(() => {
    return recommendedCourses.map((code): CourseProgressData | null => {
      const course = allCourses.find((c) => c.code === code);
      if (!course) return null;

      const enrollment = enrollments.find((e) => e.course_code === code);
      
      // Count total lessons across all modules
      const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
      
      // Count completed lessons
      const courseProgress = progress.filter((p) => p.course_code === code && p.lesson_id && p.completed);
      const lessonsCompleted = courseProgress.length;
      
      // Check if all module quizzes are passed
      const totalQuizzes = course.modules.filter((m) => m.quiz).length;
      const passedQuizzes = course.modules.filter((m) => {
        if (!m.quiz) return false;
        return quizResults.some((r) => r.quiz_id === m.quiz!.id && r.passed);
      }).length;

      // Calculate overall progress (lessons + quizzes)
      const totalItems = totalLessons + totalQuizzes;
      const completedItems = lessonsCompleted + passedQuizzes;
      const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      let status: CourseStatus = "not-started";
      if (enrollment?.status === "completed" || progressPercent === 100) {
        status = "completed";
      } else if (enrollment?.status === "active" || progressPercent > 0) {
        status = "in-progress";
      }

      return {
        code,
        title: course.title,
        department: course.department,
        status,
        progressPercent,
        lessonsCompleted: completedItems,
        totalLessons: totalItems,
      };
    }).filter(Boolean) as CourseProgressData[];
  }, [recommendedCourses, enrollments, progress, quizResults]);

  const overallStats = useMemo(() => {
    const completed = courseProgressData.filter((c) => c.status === "completed").length;
    const inProgress = courseProgressData.filter((c) => c.status === "in-progress").length;
    const total = courseProgressData.length;
    const overallPercent = total > 0 
      ? Math.round(courseProgressData.reduce((sum, c) => sum + c.progressPercent, 0) / total)
      : 0;

    return { completed, inProgress, total, overallPercent };
  }, [courseProgressData]);

  const getStatusIcon = (status: CourseStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "in-progress":
        return <PlayCircle className="w-5 h-5 text-primary" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: CourseStatus) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      default:
        return "Not Started";
    }
  };

  if (courseProgressData.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Your Learning Progress
            </CardTitle>
            {overallStats.completed === overallStats.total && overallStats.total > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-500"
              >
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-semibold">All Complete!</span>
              </motion.div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-semibold text-primary">{overallStats.overallPercent}%</span>
            </div>
            <div className="relative">
              <Progress value={overallStats.overallPercent} className="h-3" />
              {overallStats.overallPercent > 0 && overallStats.overallPercent < 100 && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                />
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{overallStats.completed} of {overallStats.total} courses completed</span>
              {overallStats.inProgress > 0 && (
                <span>{overallStats.inProgress} in progress</span>
              )}
            </div>
          </div>

          {/* Individual Course Progress */}
          <div className="space-y-3">
            {courseProgressData.map((course, index) => (
              <motion.div
                key={course.code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={cn(
                  "p-3 rounded-lg border transition-colors",
                  course.status === "completed" 
                    ? "bg-green-500/5 border-green-500/30" 
                    : course.status === "in-progress"
                    ? "bg-primary/5 border-primary/30"
                    : "bg-muted/30 border-border"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {getStatusIcon(course.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{course.code}</span>
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          course.status === "completed" ? "bg-green-500/20 text-green-500" :
                          course.status === "in-progress" ? "bg-primary/20 text-primary" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {getStatusLabel(course.status)}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm truncate">{course.title}</h4>
                      
                      {/* Progress bar for individual course */}
                      <div className="mt-2 space-y-1">
                        <Progress 
                          value={course.progressPercent} 
                          className={cn(
                            "h-1.5",
                            course.status === "completed" && "[&>div]:bg-green-500"
                          )}
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{course.lessonsCompleted}/{course.totalLessons} items</span>
                          <span>{course.progressPercent}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => navigate(`/course/${course.code}`)}
                  >
                    {course.status === "not-started" ? "Start" : 
                     course.status === "completed" ? "Review" : "Continue"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
