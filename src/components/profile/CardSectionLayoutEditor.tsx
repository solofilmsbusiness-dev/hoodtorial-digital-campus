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
import { Quote, Film, Camera, Link2, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SortableVisualBlock } from "./SortableVisualBlock";
import { LucideIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CardSectionLayoutEditorProps {
  order: string[];
  onChange: (newOrder: string[]) => void;
}

const AVAILABLE_CARD_SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "bio", label: "Bio", icon: Quote },
  { id: "featured_project", label: "Featured Project", icon: Film },
  { id: "info_cards", label: "Creative Info Cards", icon: Camera },
  { id: "social_links", label: "Social Links", icon: Link2 },
];

function CardMiniPreview({ order }: { order: string[] }) {
  const sectionLabels: Record<string, string> = {
    bio: "Bio",
    featured_project: "Project",
    info_cards: "Info",
    social_links: "Links",
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Card Preview</p>
      <div className="rounded-lg border border-border/50 overflow-hidden bg-card/50 p-2 space-y-1.5">
        {/* Identity wireframe (fixed) */}
        <div className="flex items-center gap-2 pb-1.5 border-b border-border/30">
          <div className="w-8 h-8 rounded-full bg-primary/20" />
          <div className="space-y-1 flex-1">
            <div className="h-2 bg-muted-foreground/20 rounded-full w-14" />
            <div className="h-1.5 bg-muted-foreground/10 rounded-full w-10" />
          </div>
        </div>
        {/* Dynamic card sections */}
        {order.map((id, i) => (
          <div
            key={id}
            className="rounded border border-border/30 bg-muted/20 px-2 py-1.5 transition-all duration-300"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-bold text-primary/60">{i + 1}</span>
              <span className="text-[9px] font-medium text-muted-foreground">{sectionLabels[id] || id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSectionLayoutEditor({
  order,
  onChange,
}: CardSectionLayoutEditorProps) {
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
  const normalizedOrder = order.length === AVAILABLE_CARD_SECTIONS.length
    ? order
    : AVAILABLE_CARD_SECTIONS.map((s) => s.id);

  const orderedSections = normalizedOrder
    .map((id) => AVAILABLE_CARD_SECTIONS.find((s) => s.id === id))
    .filter(Boolean) as typeof AVAILABLE_CARD_SECTIONS;

  return (
    <Card className="card-urban">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Profile Card Layout
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Drag sections to reorder within your profile card.
        </p>

        <div className={`${!isMobile ? "grid grid-cols-[1fr_140px] gap-6" : ""}`}>
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

          {!isMobile && <CardMiniPreview order={normalizedOrder} />}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          💡 Cover banner and identity section always appear first.
        </p>
      </CardContent>
    </Card>
  );
}
