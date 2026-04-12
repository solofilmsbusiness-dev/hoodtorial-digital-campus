import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileContext } from "@/contexts/ProfileContext";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useCourseStatus } from "@/hooks/useCourseStatus";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { courses as staticCourses, getTotalLessonsCount } from "@/data/courses";
import {
  BookOpen,
  Play,
  Sparkles,
  ArrowRight,
  GraduationCap,
  CheckCircle2,
  Film,
  Scissors,
  Clapperboard,
  Video,
  Camera,
  Aperture,
  type LucideIcon,
} from "lucide-react";

// lesson_progress row shape (table may not exist yet)
interface LessonProgressRow {
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed_at: string | null;
}

const DEPT_ICON: Record<string, LucideIcon> = {
  cinematography: Film,
  "post-production": Scissors,
  directing: Clapperboard,
  production: Video,
  photography: Camera,
  "camera-systems": Aperture,
};

const DEPT_COLOR_CLASSES: Record<string, string> = {
  cinematography: "text-primary bg-primary/10 border-primary/30",
  "post-production": "text-purple-400 bg-purple-400/10 border-purple-400/30",
  directing: "text-accent bg-accent/10 border-accent/30",
  production: "text-pink-400 bg-pink-400/10 border-pink-400/30",
  photography: "text-green-400 bg-green-400/10 border-green-400/30",
  "camera-systems": "text-blue-400 bg-blue-400/10 border-blue-400/30",
};

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfileContext();
  const { activeEnrollments, completedEnrollments, loading: enrollmentsLoading } = useEnrollments();
  const { progress } = useUserProgress();
  const { courses: publishedCourses, isLoading: coursesLoading } = useCourseStatus();

  // lesson_progress data — scaffold for a table being built in parallel
  const [lessonProgress, setLessonProgress] = useState<LessonProgressRow[] | null>(null);
  const [lessonProgressLoaded, setLessonProgressLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setLessonProgress([]);
      setLessonProgressLoaded(true);
      return;
    }

    async function fetchLessonProgress() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from("lesson_progress")
          .select("user_id, course_id, lesson_id, completed_at")
          .eq("user_id", user!.id);

        if (error) {
          // Table may not exist yet — treat as empty
          setLessonProgress([]);
        } else {
          setLessonProgress((data as LessonProgressRow[]) || []);
        }
      } catch {
        setLessonProgress([]);
      } finally {
        setLessonProgressLoaded(true);
      }
    }

    fetchLessonProgress();
  }, [user]);

  const isLoading = profileLoading || enrollmentsLoading || coursesLoading || !lessonProgressLoaded;

  const getInitials = (name?: string | null) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || "S";
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate lesson progress % using user_progress (real working table)
  const getCourseProgress = (courseCode: string): { percent: number; completed: number; total: number } => {
    const staticCourse = staticCourses.find((c) => c.code === courseCode);
    const total = staticCourse ? getTotalLessonsCount(staticCourse) : 0;
    if (total === 0) return { percent: 0, completed: 0, total: 0 };

    const completed = progress.filter(
      (p) => p.course_code === courseCode && p.completed && p.lesson_id
    ).length;

    return { percent: Math.round((completed / total) * 100), completed, total };
  };

  // Active courses the student has started (has at least 1 completed lesson)
  const inProgressCodes = new Set(
    progress
      .filter((p) => p.completed && p.lesson_id)
      .map((p) => p.course_code)
  );

  const enrolledCodes = new Set([
    ...activeEnrollments.map((e) => e.course_code),
    ...completedEnrollments.map((e) => e.course_code),
  ]);

  // Courses for "Continue Learning" — enrolled & started but not 100%
  const continueCourses = activeEnrollments
    .map((e) => {
      const course =
        publishedCourses.find((c) => c.code === e.course_code) ||
        staticCourses.find((c) => c.code === e.course_code);
      if (!course) return null;
      const prog = getCourseProgress(e.course_code);
      return { course, prog, enrolledAt: e.enrolled_at };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null && item.prog.percent < 100)
    .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());

  // Whether we have lesson_progress data (from the scaffolded table)
  const hasLessonProgressData = lessonProgress !== null && lessonProgress.length > 0;

  // Courses for "Explore More" — published, not enrolled, max 4
  const exploreCourses = publishedCourses
    .filter((c) => !enrolledCodes.has(c.code))
    .slice(0, 4);

  if (isLoading) {
    return (
      <PageLayout pageKey="dashboard">
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-pulse text-primary font-bold text-xl">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Student";
  const totalCredits = profile ? 0 : 0; // placeholder — credits from useUserProgress if needed
  const completedCount = completedEnrollments.length;

  return (
    <PageLayout pageKey="dashboard">
      <div className="py-8 px-4">
        <div className="container-wide">

          {/* ── Welcome Header ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-4">
              <Avatar
                className="h-16 w-16 border-4"
                style={{ borderColor: profile?.profile_accent_color || "hsl(var(--primary))" }}
              >
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {getInitials(profile?.display_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-black tracking-tighter uppercase leading-tight text-2xl sm:text-4xl text-foreground">
                  Welcome back, {displayName}
                </h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {completedCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      <CheckCircle2 className="h-3 w-3" />
                      {completedCount} course{completedCount !== 1 ? "s" : ""} completed
                    </span>
                  )}
                  {activeEnrollments.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-bold">
                      <BookOpen className="h-3 w-3" />
                      {activeEnrollments.length} active
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/student"
                className="btn-brutal text-xs flex items-center gap-2 px-4 py-2"
              >
                <GraduationCap className="h-4 w-4" />
                Student Center
              </Link>
              <Link
                to="/academics"
                className="btn-brutal text-xs flex items-center gap-2 px-4 py-2 bg-charcoal hover:bg-charcoal-light text-white"
              >
                <BookOpen className="h-4 w-4" />
                Browse Courses
              </Link>
            </div>
          </div>

          {/* ── Continue Learning ── */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Play className="h-5 w-5 text-primary" />
              <h2 className="font-black uppercase tracking-tight text-xl text-foreground">
                Continue Learning
              </h2>
            </div>

            {/* Show CTA when no lesson_progress data (table empty or not yet created) */}
            {!hasLessonProgressData || continueCourses.length === 0 ? (
              <Card className="card-urban">
                <CardContent className="py-12 text-center">
                  <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
                  {activeEnrollments.length === 0 ? (
                    <>
                      <p className="text-muted-foreground mb-4">
                        You haven't started any courses yet.
                      </p>
                      <Link
                        to="/academics"
                        className="btn-brutal inline-flex items-center gap-2 px-6 py-3"
                      >
                        <Sparkles className="h-4 w-4" />
                        Start your first course
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground mb-4">
                        You're enrolled — jump in and start learning!
                      </p>
                      {activeEnrollments[0] && (
                        <Link
                          to={`/course/${activeEnrollments[0].course_code}`}
                          className="btn-brutal inline-flex items-center gap-2 px-6 py-3"
                        >
                          <Play className="h-4 w-4" />
                          Start{" "}
                          {publishedCourses.find(
                            (c) => c.code === activeEnrollments[0].course_code
                          )?.title || activeEnrollments[0].course_code}
                        </Link>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {continueCourses.slice(0, 2).map(({ course, prog }) => {
                  const DeptIcon = DEPT_ICON[course.departmentId] || Film;
                  const colorCls =
                    DEPT_COLOR_CLASSES[course.departmentId] ||
                    "text-primary bg-primary/10 border-primary/30";
                  return (
                    <Card
                      key={course.code}
                      className="card-urban group hover:border-primary transition-colors"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-lg border flex items-center justify-center flex-shrink-0 ${colorCls}`}
                          >
                            <DeptIcon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
                              {course.department}
                            </p>
                            <h3 className="font-bold text-base leading-tight line-clamp-1">
                              {course.title}
                            </h3>
                            <div className="mt-3 space-y-1.5">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                  {prog.completed} of {prog.total} lessons
                                </span>
                                <span className="font-bold text-primary">{prog.percent}%</span>
                              </div>
                              <Progress value={prog.percent} className="h-1.5" />
                            </div>
                            <Link
                              to={`/course/${course.code}`}
                              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                            >
                              <Play className="h-3 w-3" />
                              Continue
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── My Courses ── */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="font-black uppercase tracking-tight text-xl text-foreground">
                  My Courses
                </h2>
              </div>
              <Link
                to="/student"
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
              >
                Manage <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {activeEnrollments.length === 0 && completedEnrollments.length === 0 ? (
              <Card className="card-urban">
                <CardContent className="py-10 text-center">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                  <p className="text-muted-foreground text-sm mb-3">No courses enrolled yet.</p>
                  <Link
                    to="/academics"
                    className="text-primary font-bold text-sm hover:underline"
                  >
                    Browse the catalog →
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...activeEnrollments, ...completedEnrollments].map((enrollment) => {
                  const course =
                    publishedCourses.find((c) => c.code === enrollment.course_code) ||
                    staticCourses.find((c) => c.code === enrollment.course_code);
                  if (!course) return null;

                  const isCompleted = enrollment.status === "completed";
                  const prog = isCompleted
                    ? { percent: 100, completed: 0, total: 0 }
                    : getCourseProgress(enrollment.course_code);
                  const DeptIcon = DEPT_ICON[course.departmentId] || Film;
                  const colorCls =
                    DEPT_COLOR_CLASSES[course.departmentId] ||
                    "text-primary bg-primary/10 border-primary/30";

                  return (
                    <Card
                      key={enrollment.id}
                      className={`card-urban group flex flex-col hover:border-primary transition-colors ${
                        isCompleted ? "border-primary/40" : ""
                      }`}
                    >
                      <CardContent className="p-5 flex flex-col flex-1">
                        {/* Course icon + level */}
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-10 h-10 rounded-lg border flex items-center justify-center ${colorCls}`}
                          >
                            <DeptIcon className="w-5 h-5" />
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                              isCompleted
                                ? "bg-primary/20 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isCompleted ? (
                              <><CheckCircle2 className="h-3 w-3" />Done</>
                            ) : course.level}
                          </span>
                        </div>

                        {/* Title + department */}
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
                          {course.department}
                        </p>
                        <h3 className="font-bold text-sm leading-tight line-clamp-2 flex-1">
                          {course.title}
                        </h3>

                        {/* Progress bar */}
                        <div className="mt-4 space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {isCompleted
                                ? `${course.lessons || prog.total} lessons`
                                : `${prog.completed} of ${prog.total || course.lessons} lessons`}
                            </span>
                            <span
                              className={`font-bold ${isCompleted ? "text-primary" : "text-foreground"}`}
                            >
                              {prog.percent}%
                            </span>
                          </div>
                          <Progress
                            value={prog.percent}
                            className={`h-1.5 ${isCompleted ? "[&>div]:bg-primary" : ""}`}
                          />
                        </div>

                        {/* CTA */}
                        <Link
                          to={`/course/${course.code}`}
                          className={`mt-4 btn-brutal text-xs flex items-center justify-center gap-2 py-2 ${
                            isCompleted ? "bg-primary/10 border-primary/30" : ""
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <BookOpen className="h-3.5 w-3.5" />
                              Review
                            </>
                          ) : prog.percent > 0 ? (
                            <>
                              <Play className="h-3.5 w-3.5" />
                              Continue
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5" />
                              Start
                            </>
                          )}
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Add course slot */}
                <Link
                  to="/academics"
                  className="p-5 border-2 border-dashed border-border hover:border-primary rounded-lg flex flex-col items-center justify-center text-center text-muted-foreground hover:text-primary transition-all min-h-[200px] group"
                >
                  <BookOpen className="h-8 w-8 mb-2 opacity-40 group-hover:opacity-100 transition-opacity" />
                  <span className="text-sm font-bold">Add a course</span>
                  <span className="text-xs mt-1 opacity-70">Browse the catalog</span>
                </Link>
              </div>
            )}
          </section>

          {/* ── Explore More ── */}
          {exploreCourses.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="font-black uppercase tracking-tight text-xl text-foreground">
                    Explore More
                  </h2>
                </div>
                <Link
                  to="/academics"
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {exploreCourses.map((course) => {
                  const DeptIcon = DEPT_ICON[course.departmentId] || Film;
                  const colorCls =
                    DEPT_COLOR_CLASSES[course.departmentId] ||
                    "text-primary bg-primary/10 border-primary/30";

                  return (
                    <Card
                      key={course.code}
                      className="card-urban group hover:border-primary transition-colors flex flex-col"
                    >
                      <CardContent className="p-5 flex flex-col flex-1">
                        <div
                          className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-3 ${colorCls}`}
                        >
                          <DeptIcon className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
                          {course.department}
                        </p>
                        <h3 className="font-bold text-sm leading-tight line-clamp-2 flex-1">
                          {course.title}
                        </h3>
                        <div className="flex items-center justify-between mt-2 mb-3">
                          <span className="text-xs text-muted-foreground">
                            {course.lessons} lessons
                          </span>
                          <span className="text-xs text-muted-foreground">{course.level}</span>
                        </div>
                        <Link
                          to={`/course/${course.code}`}
                          className="btn-brutal text-xs flex items-center justify-center gap-2 py-2 bg-charcoal hover:bg-charcoal-light text-white"
                        >
                          View Course
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Footer CTA ── */}
          <div className="text-center py-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-2">
              {inProgressCodes.size > 0
                ? "Keep the momentum going — you're making progress!"
                : "Your filmmaking journey starts here. Enroll in your first course!"}
            </p>
            <Link
              to="/academics"
              className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
            >
              Browse All Courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}
