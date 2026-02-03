import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin";
import { CourseFilters, LevelFilter, StatusFilter } from "@/components/admin/CourseFilters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Eye, Lock, Database, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { courses as staticCourses } from "@/data/courses";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  code: string;
  title: string;
  department_id: string;
  credits: number;
  level: string;
  is_published: boolean;
  is_locked: boolean;
}

export default function CourseManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const { data: dbCourses, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Course[];
    },
  });

  // Use static courses if no DB courses exist
  const courses: Course[] = dbCourses && dbCourses.length > 0
    ? dbCourses
    : staticCourses.map((c) => ({
        id: c.code,
        code: c.code,
        title: c.title,
        department_id: c.departmentId,
        credits: c.credits,
        level: c.level,
        is_published: true,
        is_locked: false,
      }));

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = [...new Set(courses.map((c) => c.department_id))];
    return depts.sort();
  }, [courses]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.department_id.toLowerCase().includes(searchQuery.toLowerCase());

      // Level filter
      const matchesLevel = levelFilter === "all" || course.level === levelFilter;

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && course.is_published && !course.is_locked) ||
        (statusFilter === "coming-soon" && course.is_locked) ||
        (statusFilter === "hidden" && !course.is_published);

      // Department filter
      const matchesDept = departmentFilter === "all" || course.department_id === departmentFilter;

      return matchesSearch && matchesLevel && matchesStatus && matchesDept;
    });
  }, [courses, searchQuery, levelFilter, statusFilter, departmentFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = courses.length;
    const published = courses.filter((c) => c.is_published && !c.is_locked).length;
    const comingSoon = courses.filter((c) => c.is_locked).length;
    const hidden = courses.filter((c) => !c.is_published).length;
    return { total, published, comingSoon, hidden };
  }, [courses]);

  const togglePublished = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from("courses")
        .update({ is_published })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({ title: "Course updated" });
    },
    onError: (error) => {
      console.error("Toggle published error:", error);
      toast({ 
        title: "Failed to update course", 
        description: "Courses may need to be initialized first.",
        variant: "destructive" 
      });
    },
  });

  const toggleLocked = useMutation({
    mutationFn: async ({ id, is_locked }: { id: string; is_locked: boolean }) => {
      const { error } = await supabase
        .from("courses")
        .update({ is_locked })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({ title: "Course updated" });
    },
    onError: (error) => {
      console.error("Toggle locked error:", error);
      toast({ 
        title: "Failed to update course", 
        description: "Courses may need to be initialized first.",
        variant: "destructive" 
      });
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({ title: "Course deleted successfully" });
    },
    onError: (error) => {
      console.error("Delete course error:", error);
      toast({ 
        title: "Failed to delete course", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    },
  });

  // Seed courses mutation - populates database from static data
  const seedCourses = useMutation({
    mutationFn: async () => {
      const coursesToInsert = staticCourses.map((c, index) => ({
        code: c.code,
        title: c.title,
        department_id: c.departmentId,
        credits: c.credits,
        level: c.level,
        description: c.description || null,
        is_published: true,
        is_locked: false,
        sort_order: index,
      }));

      const { error } = await supabase
        .from("courses")
        .insert(coursesToInsert);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({ title: "Courses initialized successfully!", description: "You can now toggle course statuses." });
    },
    onError: (error) => {
      console.error("Seed courses error:", error);
      toast({ 
        title: "Failed to initialize courses", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    },
  });

  const isUsingStaticData = !dbCourses || dbCourses.length === 0;

  return (
    <AdminLayout title="Course Manager" description="Manage your curriculum">
      <div className="space-y-6">
        {isUsingStaticData && (
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-yellow-200">
                  <strong>Note:</strong> Courses are not in the database yet. Initialize them to enable status toggles.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => seedCourses.mutate()}
                  disabled={seedCourses.isPending}
                >
                  {seedCourses.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Initialize Courses
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header with stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Course Manager</h2>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
              <span>{stats.total} total</span>
              <span className="text-green-500">{stats.published} published</span>
              <span className="text-amber-500">{stats.comingSoon} coming soon</span>
              <span className="text-muted-foreground">{stats.hidden} hidden</span>
            </div>
          </div>
          <Button asChild>
            <Link to="/admin/courses/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <CourseFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          levelFilter={levelFilter}
          onLevelChange={setLevelFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          departmentFilter={departmentFilter}
          onDepartmentChange={setDepartmentFilter}
          departments={departments}
        />

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No courses found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-mono font-medium">
                        {course.code}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {course.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{course.department_id}</Badge>
                      </TableCell>
                      <TableCell>{course.level}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {/* Published Toggle Badge */}
                          <button
                            onClick={() =>
                              togglePublished.mutate({
                                id: course.id,
                                is_published: !course.is_published,
                              })
                            }
                            disabled={isUsingStaticData}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                              course.is_published
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                course.is_published ? "bg-white" : "bg-muted-foreground"
                              }`}
                            />
                            {course.is_published ? "Published" : "Hidden"}
                          </button>

                          {/* Coming Soon Toggle Badge */}
                          <button
                            onClick={() =>
                              toggleLocked.mutate({
                                id: course.id,
                                is_locked: !course.is_locked,
                              })
                            }
                            disabled={isUsingStaticData}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                              course.is_locked
                                ? "bg-amber-600 text-white hover:bg-amber-700"
                                : "border border-dashed border-muted-foreground/30 text-muted-foreground/50 hover:border-muted-foreground/50"
                            }`}
                          >
                            <Lock className="w-3 h-3" />
                            {course.is_locked ? "Coming Soon" : "—"}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {staticCourses.some(s => s.code === course.code) ? (
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/course/${course.code}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              disabled 
                              title="Preview not available for database-only courses"
                            >
                              <Eye className="h-4 w-4 opacity-50" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/courses/${course.code}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setCourseToDelete(course)}
                            disabled={isUsingStaticData}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete course"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!courseToDelete} onOpenChange={() => setCourseToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Course</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{courseToDelete?.title}" ({courseToDelete?.code})?
                This will also delete all modules, lessons, and quizzes associated with this course.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (courseToDelete) {
                    deleteCourse.mutate(courseToDelete.id);
                    setCourseToDelete(null);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
