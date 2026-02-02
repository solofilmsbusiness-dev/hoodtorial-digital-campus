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
import { SortableLessonItem } from "./SortableLessonItem";
import type { DbLesson } from "@/hooks/useAdminCourseContent";

interface SortableLessonListProps {
  lessons: DbLesson[];
  moduleId: string;
  onEditLesson: (lesson: DbLesson) => void;
  onDeleteLesson: (id: string) => void;
  onReorderLessons: (moduleId: string, orderedIds: string[]) => void;
}

export function SortableLessonList({
  lessons,
  moduleId,
  onEditLesson,
  onDeleteLesson,
  onReorderLessons,
}: SortableLessonListProps) {
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
      const oldIndex = lessons.findIndex((l) => l.id === active.id);
      const newIndex = lessons.findIndex((l) => l.id === over.id);
      const newOrder = arrayMove(
        lessons.map((l) => l.id),
        oldIndex,
        newIndex
      );
      onReorderLessons(moduleId, newOrder);
    }
  };

  if (lessons.length === 0) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={lessons.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <SortableLessonItem
              key={lesson.id}
              lesson={lesson}
              onEdit={onEditLesson}
              onDelete={onDeleteLesson}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
