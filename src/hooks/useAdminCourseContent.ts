import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DbModule {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbLesson {
  id: string;
  module_id: string;
  title: string;
  type: string;
  duration: string | null;
  video_url: string | null;
  content: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ModuleWithLessons extends DbModule {
  lessons: DbLesson[];
}

export function useAdminCourseContent(courseId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch modules with lessons for a course
  const { data: modules = [], isLoading } = useQuery({
    queryKey: ["admin-course-modules", courseId],
    queryFn: async () => {
      if (!courseId) return [];

      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("sort_order");

      if (modulesError) throw modulesError;
      if (!modulesData?.length) return [];

      const moduleIds = modulesData.map((m) => m.id);
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .in("module_id", moduleIds)
        .order("sort_order");

      if (lessonsError) throw lessonsError;

      const modulesWithLessons: ModuleWithLessons[] = modulesData.map((module) => ({
        ...module,
        lessons: (lessonsData || []).filter((l) => l.module_id === module.id),
      }));

      return modulesWithLessons;
    },
    enabled: !!courseId,
  });

  // Add module
  const addModule = useMutation({
    mutationFn: async (title: string) => {
      if (!courseId) throw new Error("No course ID");
      
      const maxOrder = modules.length > 0 
        ? Math.max(...modules.map(m => m.sort_order)) + 1 
        : 0;

      const { data, error } = await supabase
        .from("modules")
        .insert({
          course_id: courseId,
          title,
          sort_order: maxOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules", courseId] });
      toast({ title: "Module added" });
    },
    onError: (error) => {
      toast({ title: "Failed to add module", description: error.message, variant: "destructive" });
    },
  });

  // Update module
  const updateModule = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase
        .from("modules")
        .update({ title })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules", courseId] });
      toast({ title: "Module updated" });
    },
    onError: (error) => {
      toast({ title: "Failed to update module", description: error.message, variant: "destructive" });
    },
  });

  // Delete module
  const deleteModule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("modules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules", courseId] });
      toast({ title: "Module deleted" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete module", description: error.message, variant: "destructive" });
    },
  });

  // Add lesson
  const addLesson = useMutation({
    mutationFn: async (lesson: {
      module_id: string;
      title: string;
      type: string;
      duration?: string;
      video_url?: string;
      content?: string;
      description?: string;
    }) => {
      const module = modules.find((m) => m.id === lesson.module_id);
      const maxOrder = module && module.lessons.length > 0
        ? Math.max(...module.lessons.map(l => l.sort_order)) + 1
        : 0;

      const { data, error } = await supabase
        .from("lessons")
        .insert({
          ...lesson,
          sort_order: maxOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules", courseId] });
      toast({ title: "Lesson added" });
    },
    onError: (error) => {
      toast({ title: "Failed to add lesson", description: error.message, variant: "destructive" });
    },
  });

  // Update lesson
  const updateLesson = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      type?: string;
      duration?: string | null;
      video_url?: string | null;
      content?: string | null;
      description?: string | null;
    }) => {
      const { error } = await supabase
        .from("lessons")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules", courseId] });
      toast({ title: "Lesson updated" });
    },
    onError: (error) => {
      toast({ title: "Failed to update lesson", description: error.message, variant: "destructive" });
    },
  });

  // Delete lesson
  const deleteLesson = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules", courseId] });
      toast({ title: "Lesson deleted" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete lesson", description: error.message, variant: "destructive" });
    },
  });

  // Reorder modules
  const reorderModules = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => ({
        id,
        sort_order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("modules")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules", courseId] });
    },
    onError: (error) => {
      toast({ title: "Failed to reorder", description: error.message, variant: "destructive" });
    },
  });

  // Reorder lessons within a module
  const reorderLessons = useMutation({
    mutationFn: async ({ moduleId, orderedIds }: { moduleId: string; orderedIds: string[] }) => {
      const updates = orderedIds.map((id, index) => ({
        id,
        sort_order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("lessons")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules", courseId] });
    },
    onError: (error) => {
      toast({ title: "Failed to reorder", description: error.message, variant: "destructive" });
    },
  });

  return {
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
  };
}
