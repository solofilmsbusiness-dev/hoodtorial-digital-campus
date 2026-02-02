import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { courses as staticCourses, departments } from "@/data/courses";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAdminCourseContent } from "@/hooks/useAdminCourseContent";
import { SortableModuleList } from "@/components/admin/SortableModuleList";

interface CourseForm {
  code: string;
  title: string;
  description: string;
  department_id: string;
  credits: number;
  level: string;
  duration: string;
  is_published: boolean;
  is_locked: boolean;
}

// Separate component to handle modules section
function ModulesSection({ courseId }: { courseId: string }) {
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [showAddModule, setShowAddModule] = useState(false);

  const {
    modules,
    isLoading,
    addModule,
    updateModule,
    deleteModule,
    addLesson,
    updateLesson,
    deleteLesson,
    reorderModules,
    reorderLessons,
  } = useAdminCourseContent(courseId);

  const handleAddModule = () => {
    if (newModuleTitle.trim()) {
      addModule.mutate(newModuleTitle.trim());
      setNewModuleTitle("");
      setShowAddModule(false);
    }
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Modules & Lessons</CardTitle>
        {!showAddModule && (
          <Button onClick={() => setShowAddModule(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddModule && (
          <div className="flex items-center gap-2 p-4 border border-dashed border-border">
            <Input
              placeholder="Module title..."
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddModule();
                if (e.key === "Escape") setShowAddModule(false);
              }}
              autoFocus
            />
            <Button onClick={handleAddModule} disabled={!newModuleTitle.trim()}>
              Add
            </Button>
            <Button variant="ghost" onClick={() => setShowAddModule(false)}>
              Cancel
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading modules...
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No modules yet. Add your first module to get started.</p>
          </div>
        ) : (
          <SortableModuleList
            modules={modules}
            onUpdateTitle={(id, title) => updateModule.mutate({ id, title })}
            onDelete={(id) => deleteModule.mutate(id)}
            onReorderModules={(orderedIds) => reorderModules.mutate(orderedIds)}
            onAddLesson={(moduleId, lesson) =>
              addLesson.mutate({ module_id: moduleId, ...lesson })
            }
            onUpdateLesson={(id, updates) => updateLesson.mutate({ id, ...updates })}
            onDeleteLesson={(id) => deleteLesson.mutate(id)}
            onReorderLessons={(moduleId, orderedIds) =>
              reorderLessons.mutate({ moduleId, orderedIds })
            }
            isPending={addLesson.isPending || updateLesson.isPending}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default function CourseEditor() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isNew = code === "new";

  const [form, setForm] = useState<CourseForm>({
    code: "",
    title: "",
    description: "",
    department_id: "CIN",
    credits: 3,
    level: "Beginner",
    duration: "8 weeks",
    is_published: true,
    is_locked: false,
  });

  // Fetch existing course
  const { data: dbCourse, isLoading } = useQuery({
    queryKey: ["admin-course", code],
    queryFn: async () => {
      if (isNew) return null;

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  // Load from static if not in DB
  useEffect(() => {
    if (isNew) return;

    if (dbCourse) {
      setForm({
        code: dbCourse.code,
        title: dbCourse.title,
        description: dbCourse.description || "",
        department_id: dbCourse.department_id,
        credits: dbCourse.credits,
        level: dbCourse.level,
        duration: dbCourse.duration || "",
        is_published: dbCourse.is_published,
        is_locked: dbCourse.is_locked,
      });
    } else if (!isLoading) {
      const staticCourse = staticCourses.find((c) => c.code === code);
      if (staticCourse) {
        setForm({
          code: staticCourse.code,
          title: staticCourse.title,
          description: staticCourse.description,
          department_id: staticCourse.departmentId,
          credits: staticCourse.credits,
          level: staticCourse.level,
          duration: staticCourse.duration,
          is_published: true,
          is_locked: false,
        });
      }
    }
  }, [dbCourse, isLoading, isNew, code]);

  const saveCourse = useMutation({
    mutationFn: async (data: CourseForm) => {
      if (isNew) {
        const { error } = await supabase.from("courses").insert({
          code: data.code,
          title: data.title,
          description: data.description,
          department_id: data.department_id,
          credits: data.credits,
          level: data.level,
          duration: data.duration,
          is_published: data.is_published,
          is_locked: data.is_locked,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("courses")
          .update({
            title: data.title,
            description: data.description,
            department_id: data.department_id,
            credits: data.credits,
            level: data.level,
            duration: data.duration,
            is_published: data.is_published,
            is_locked: data.is_locked,
          })
          .eq("code", code);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({ title: isNew ? "Course created" : "Course updated" });
      if (isNew) {
        navigate(`/admin/courses/${form.code}`);
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to save course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCourse.mutate(form);
  };

  const updateField = <K extends keyof CourseForm>(field: K, value: CourseForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AdminLayout
      title={isNew ? "New Course" : `Edit: ${form.title || code}`}
      description={isNew ? "Create a new course" : "Modify course details and content"}
    >
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/admin/courses")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Course Code</Label>
                    <Input
                      id="code"
                      value={form.code}
                      onChange={(e) => updateField("code", e.target.value.toUpperCase())}
                      placeholder="CIN101"
                      disabled={!isNew}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={form.department_id}
                      onValueChange={(v) => updateField("department_id", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Introduction to Cinematography"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Course description..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="credits">Credits</Label>
                    <Input
                      id="credits"
                      type="number"
                      min={1}
                      max={6}
                      value={form.credits}
                      onChange={(e) => updateField("credits", parseInt(e.target.value) || 3)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select
                      value={form.level}
                      onValueChange={(v) => updateField("level", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={form.duration}
                      onChange={(e) => updateField("duration", e.target.value)}
                      placeholder="8 weeks"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Visibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Published</Label>
                      <p className="text-xs text-muted-foreground">
                        Visible to students
                      </p>
                    </div>
                    <Switch
                      checked={form.is_published}
                      onCheckedChange={(v) => updateField("is_published", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Coming Soon</Label>
                      <p className="text-xs text-muted-foreground">
                        Show as locked
                      </p>
                    </div>
                    <Switch
                      checked={form.is_locked}
                      onCheckedChange={(v) => updateField("is_locked", v)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={saveCourse.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveCourse.isPending ? "Saving..." : "Save Course"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>

        {/* Modules Section */}
        {!isNew && dbCourse && (
          <ModulesSection courseId={dbCourse.id} />
        )}
      </div>
    </AdminLayout>
  );
}
