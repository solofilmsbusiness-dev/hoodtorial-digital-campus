import { useState } from "react";
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
import {
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  Video,
  FileText,
  Dumbbell,
  ChevronUp,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { LessonDialog } from "./LessonDialog";
import type { ModuleWithLessons, DbLesson } from "@/hooks/useAdminCourseContent";

interface ModuleEditorProps {
  module: ModuleWithLessons;
  index: number;
  totalModules: number;
  onUpdateTitle: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
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
  onMoveLessonUp: (moduleId: string, lessonId: string) => void;
  onMoveLessonDown: (moduleId: string, lessonId: string) => void;
  isPending?: boolean;
}

const typeIcons = {
  video: Video,
  reading: FileText,
  practice: Dumbbell,
};

export function ModuleEditor({
  module,
  index,
  totalModules,
  onUpdateTitle,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  onMoveLessonUp,
  onMoveLessonDown,
  isPending,
}: ModuleEditorProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(module.title);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<DbLesson | null>(null);

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
      <Card className="border-2">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center gap-3">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onMoveUp(module.id)}
                disabled={index === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onMoveDown(module.id)}
                disabled={index === totalModules - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
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
            {module.lessons.map((lesson, lessonIndex) => {
              const Icon = typeIcons[lesson.type as keyof typeof typeIcons] || Video;
              return (
                <div
                  key={lesson.id}
                  className="flex items-center gap-2 py-2 px-3 bg-muted/50 border border-border text-sm group"
                >
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100"
                      onClick={() => onMoveLessonUp(module.id, lesson.id)}
                      disabled={lessonIndex === 0}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100"
                      onClick={() => onMoveLessonDown(module.id, lesson.id)}
                      disabled={lessonIndex === module.lessons.length - 1}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{lesson.title}</span>
                  {lesson.duration && (
                    <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => handleEditLesson(lesson)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Lesson?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{lesson.title}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => onDeleteLesson(lesson.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })}

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
