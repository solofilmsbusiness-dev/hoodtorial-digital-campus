import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Trophy, TrendingUp, FlaskConical, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { courses as staticCourses } from "@/data/courses";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTestMode } from "@/hooks/useTestMode";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { PendingItemsCard } from "@/components/admin/PendingItemsCard";
import { useCompletionRate } from "@/hooks/useAdminActivity";

export default function AdminDashboard() {
  const {
    isTestModeEnabled,
    toggleTestMode,
    autoPassQuizzes,
    setAutoPassQuizzes,
    bypassVideoProgress,
    setBypassVideoProgress,
  } = useTestMode();

  const { rate: completionRate, isLoading: isLoadingRate } = useCompletionRate();

  const { data: dbCourses } = useQuery({
    queryKey: ["admin-courses-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: studentsCount } = useQuery({
    queryKey: ["admin-students-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: quizCompletions } = useQuery({
    queryKey: ["admin-quiz-completions"],
    queryFn: async () => {
      const { count } = await supabase
        .from("quiz_results")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const totalCourses = (dbCourses ?? 0) > 0 ? dbCourses : staticCourses.length;

  const stats = [
    {
      title: "Total Courses",
      value: totalCourses,
      icon: BookOpen,
      description: "Active curriculum",
      color: "text-blue-500",
      href: "/admin/courses",
    },
    {
      title: "Enrolled Students",
      value: studentsCount ?? 0,
      icon: Users,
      description: "Registered users",
      color: "text-green-500",
      href: "/admin/users",
    },
    {
      title: "Quiz Completions",
      value: quizCompletions ?? 0,
      icon: Trophy,
      description: "All time",
      color: "text-yellow-500",
      href: "/admin/users",
    },
    {
      title: "Completion Rate",
      value: isLoadingRate ? "..." : `${completionRate}%`,
      icon: TrendingUp,
      description: "Lesson progress",
      color: "text-purple-500",
      href: "/admin/users",
    },
  ];

  return (
    <AdminLayout title="Dashboard" description="Overview of your learning platform">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link key={stat.title} to={stat.href}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Two column layout for cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Management */}
          <Card>
            <CardHeader>
              <CardTitle>Course Management</CardTitle>
              <CardDescription>
                Add, edit, and organize your course content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button asChild>
                  <Link to="/admin/courses">View All Courses</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/admin/courses/new">Add New Course</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pending Items */}
          <PendingItemsCard />
        </div>

        {/* Testing Tools and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Testing Tools */}
          <Card className={isTestModeEnabled ? "border-destructive" : ""}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" />
                <CardTitle>Testing Tools</CardTitle>
              </div>
              <CardDescription>
                Admin-only tools for testing course content and progression
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Test Mode Toggle */}
              <div className="flex items-center justify-between p-4 border-2 border-border rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <Label htmlFor="test-mode" className="text-base font-semibold">
                    Enable Test Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Bypass all content completion requirements
                  </p>
                </div>
                <Switch
                  id="test-mode"
                  checked={isTestModeEnabled}
                  onCheckedChange={toggleTestMode}
                />
              </div>

              {isTestModeEnabled && (
                <>
                  {/* Warning */}
                  <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-destructive">Test Mode Active</p>
                      <p className="text-muted-foreground">
                        All lessons and quizzes are unlocked. Content restrictions are bypassed.
                      </p>
                    </div>
                  </div>

                  {/* Sub-options */}
                  <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="bypass-video" className="text-sm font-medium">
                          Bypass Video Progress
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Treat all videos as 100% watched
                        </p>
                      </div>
                      <Switch
                        id="bypass-video"
                        checked={bypassVideoProgress}
                        onCheckedChange={setBypassVideoProgress}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-pass" className="text-sm font-medium">
                          Auto-Pass Quizzes
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Enable instant quiz completion buttons
                        </p>
                      </div>
                      <Switch
                        id="auto-pass"
                        checked={autoPassQuizzes}
                        onCheckedChange={setAutoPassQuizzes}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <ActivityFeed />
        </div>
      </div>
    </AdminLayout>
  );
}
