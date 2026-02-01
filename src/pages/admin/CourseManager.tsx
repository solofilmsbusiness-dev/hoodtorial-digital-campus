import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Eye, Lock } from "lucide-react";
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
    onError: () => {
      toast({ title: "Failed to update course", variant: "destructive" });
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
    onError: () => {
      toast({ title: "Failed to update course", variant: "destructive" });
    },
  });

  const isUsingStaticData = !dbCourses || dbCourses.length === 0;

  return (
    <AdminLayout title="Course Manager" description="Manage your curriculum">
      <div className="space-y-6">
        {isUsingStaticData && (
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="py-4">
              <p className="text-sm text-yellow-200">
                <strong>Note:</strong> Showing courses from static data. Add courses to the database to enable editing.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{courses.length} Courses</h2>
            <p className="text-muted-foreground">Manage course visibility and content</p>
          </div>
          <Button asChild>
            <Link to="/admin/courses/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Locked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
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
                    <TableCell>{course.credits}</TableCell>
                    <TableCell>
                      <Switch
                        checked={course.is_published}
                        onCheckedChange={(checked) =>
                          togglePublished.mutate({ id: course.id, is_published: checked })
                        }
                        disabled={isUsingStaticData}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={course.is_locked}
                        onCheckedChange={(checked) =>
                          toggleLocked.mutate({ id: course.id, is_locked: checked })
                        }
                        disabled={isUsingStaticData}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/course/${course.code}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/courses/${course.code}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
