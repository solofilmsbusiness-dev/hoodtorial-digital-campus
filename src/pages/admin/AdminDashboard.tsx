import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Trophy, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { courses as staticCourses } from "@/data/courses";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
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
    },
    {
      title: "Enrolled Students",
      value: studentsCount ?? 0,
      icon: Users,
      description: "Registered users",
      color: "text-green-500",
    },
    {
      title: "Quiz Completions",
      value: quizCompletions ?? 0,
      icon: Trophy,
      description: "All time",
      color: "text-yellow-500",
    },
    {
      title: "Completion Rate",
      value: "—",
      icon: TrendingUp,
      description: "Coming soon",
      color: "text-purple-500",
    },
  ];

  return (
    <AdminLayout title="Dashboard" description="Overview of your learning platform">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
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
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <Card>
            <CardHeader>
              <CardTitle>Student Activity</CardTitle>
              <CardDescription>
                Monitor student progress and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="outline" asChild>
                  <Link to="/admin/students">View Students</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Activity tracking coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
