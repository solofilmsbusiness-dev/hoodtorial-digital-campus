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
import { GraduationCap, Trophy, Images, MessageSquare, Layout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SortableVisualBlock } from "./SortableVisualBlock";
import { LucideIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SectionLayoutEditorProps {
  order: string[];
  onChange: (newOrder: string[]) => void;
}

const AVAILABLE_SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "stats", label: "Academic Stats", icon: GraduationCap },
  { id: "achievements", label: "Course Achievements", icon: Trophy },
  { id: "gallery", label: "Portfolio Gallery", icon: Images },
  { id: "wall", label: "Profile Wall", icon: MessageSquare },
];

function MiniPreviewColumn({ order }: { order: string[] }) {
  const sectionColors: Record<string, string> = {
    stats: "bg-primary/20",
    achievements: "bg-primary/15",
    gallery: "bg-primary/25",
    wall: "bg-primary/10",
  };
  const sectionLabels: Record<string, string> = {
    stats: "Stats",
    achievements: "Achievements",
    gallery: "Gallery",
    wall: "Wall",
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Live Preview</p>
      {/* Fixed header wireframe */}
      <div className="rounded-lg border border-border/50 overflow-hidden bg-card/50">
        <div className="h-8 bg-muted/40 border-b border-border/30" />
        <div className="flex items-center gap-2 p-2">
          <div className="w-6 h-6 rounded-full bg-muted/60" />
          <div className="space-y-1 flex-1">
            <div className="h-1.5 bg-muted-foreground/20 rounded-full w-16" />
            <div className="h-1 bg-muted-foreground/10 rounded-full w-10" />
          </div>
        </div>
      </div>
      {/* Dynamic sections */}
      {order.map((id, i) => (
        <div
          key={id}
          className={`rounded-lg border border-border/40 p-2 ${sectionColors[id] || "bg-muted/20"} transition-all duration-300`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-bold text-primary/60">{i + 1}</span>
            <span className="text-[9px] font-medium text-muted-foreground">{sectionLabels[id] || id}</span>
          </div>
          <div className="mt-1 h-3 bg-background/30 rounded" />
        </div>
      ))}
    </div>
  );
}

export function SectionLayoutEditor({
  order,
  onChange,
}: SectionLayoutEditorProps) {
  const isMobile = useIsMobile();
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
      const oldIndex = order.indexOf(active.id as string);
      const newIndex = order.indexOf(over.id as string);
      const newOrder = arrayMove(order, oldIndex, newIndex);
      onChange(newOrder);
    }
  };

  // Ensure all sections are in order
  const normalizedOrder = order.length === AVAILABLE_SECTIONS.length
    ? order
    : AVAILABLE_SECTIONS.map((s) => s.id);

  const orderedSections = normalizedOrder
    .map((id) => AVAILABLE_SECTIONS.find((s) => s.id === id))
    .filter(Boolean) as typeof AVAILABLE_SECTIONS;

  return (
    <Card className="card-urban">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layout className="h-5 w-5 text-primary" />
          Profile Page Layout
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Drag sections to reorder how they appear on your public profile page.
        </p>

        <div className={`${!isMobile ? "grid grid-cols-[1fr_140px] gap-6" : ""}`}>
          {/* Drag blocks */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={normalizedOrder}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {orderedSections.map((section, index) => (
                  <SortableVisualBlock
                    key={section.id}
                    id={section.id}
                    label={section.label}
                    icon={section.icon}
                    index={index}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Live preview column (desktop only) */}
          {!isMobile && <MiniPreviewColumn order={normalizedOrder} />}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          💡 Featured project always appears first. Social links always appear last.
        </p>
      </CardContent>
    </Card>
  );
}
