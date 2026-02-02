import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GripVertical, Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { useState } from "react";
import { LessonDialog } from "./LessonDialog";
import { SortableLessonList } from "./SortableLessonList";
import type { ModuleWithLessons, DbLesson } from "@/hooks/useAdminCourseContent";

interface SortableModuleItemProps {
  module: ModuleWithLessons;
  index: number;
  onUpdateTitle: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onAddLesson: (moduleId: string, lesson: {
    title: string;
    type: string;
    duration?: string;
    video_url?: string;
    content?: string;
    description?: string;
  }) => void;
  onUpdateLesson: (id: string, updates: {
    title?: string;
    type?: string;
    duration?: string | null;
    video_url?: string | null;
    content?: string | null;
    description?: string | null;
  }) => void;
  onDeleteLesson: (id: string) => void;
  onReorderLessons: (moduleId: string, orderedIds: string[]) => void;
  isPending?: boolean;
}

export function SortableModuleItem({
  module,
  index,
  onUpdateTitle,
  onDelete,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  onReorderLessons,
  isPending,
}: SortableModuleItemProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(module.title);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<DbLesson | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== module.title) {
      onUpdateTitle(module.id, editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(module.title);
    setIsEditingTitle(false);
  };

  const handleAddLesson = () => {
    setEditingLesson(null);
    setLessonDialogOpen(true);
  };

  const handleEditLesson = (lesson: DbLesson) => {
    setEditingLesson(lesson);
    setLessonDialogOpen(true);
  };

  const handleSaveLesson = (data: {
    title: string;
    type: string;
    duration?: string;
    video_url?: string;
    content?: string;
    description?: string;
  }) => {
    if (editingLesson) {
      onUpdateLesson(editingLesson.id, {
        title: data.title,
        type: data.type,
        duration: data.duration || null,
        video_url: data.video_url || null,
        description: data.description || null,
      });
    } else {
      onAddLesson(module.id, data);
    }
    setLessonDialogOpen(false);
    setEditingLesson(null);
  };

  return (
    <>
      <Card ref={setNodeRef} style={style} className="border-2">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>

            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="h-8"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveTitle}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <span className="font-semibold">
                  Module {index + 1}: {module.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Module?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{module.title}" and all its lessons. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => onDelete(module.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4 px-4">
          <div className="pl-8 space-y-2">
            <SortableLessonList
              lessons={module.lessons}
              moduleId={module.id}
              onEditLesson={handleEditLesson}
              onDeleteLesson={onDeleteLesson}
              onReorderLessons={onReorderLessons}
            />

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={handleAddLesson}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Lesson
            </Button>
          </div>
        </CardContent>
      </Card>

      <LessonDialog
        open={lessonDialogOpen}
        onOpenChange={setLessonDialogOpen}
        lesson={editingLesson}
        onSave={handleSaveLesson}
        isPending={isPending}
      />
    </>
  );
}
