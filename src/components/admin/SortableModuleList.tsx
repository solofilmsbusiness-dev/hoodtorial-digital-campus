import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableModuleItem } from "./SortableModuleItem";
import type { ModuleWithLessons } from "@/hooks/useAdminCourseContent";

interface SortableModuleListProps {
  modules: ModuleWithLessons[];
  onUpdateTitle: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onReorderModules: (orderedIds: string[]) => void;
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

export function SortableModuleList({
  modules,
  onUpdateTitle,
  onDelete,
  onReorderModules,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  onReorderLessons,
  isPending,
}: SortableModuleListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over.id);
      const newOrder = arrayMove(
        modules.map((m) => m.id),
        oldIndex,
        newIndex
      );
      onReorderModules(newOrder);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={modules.map((m) => m.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {modules.map((module, index) => (
            <SortableModuleItem
              key={module.id}
              module={module}
              index={index}
              onUpdateTitle={onUpdateTitle}
              onDelete={onDelete}
              onAddLesson={onAddLesson}
              onUpdateLesson={onUpdateLesson}
              onDeleteLesson={onDeleteLesson}
              onReorderLessons={onReorderLessons}
              isPending={isPending}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
