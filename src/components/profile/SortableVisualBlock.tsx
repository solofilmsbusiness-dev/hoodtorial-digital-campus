import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, LucideIcon, Quote, Film, Play, Camera, Link2, BarChart3, Trophy, Images, MessageSquare, Star } from "lucide-react";

interface SortableVisualBlockProps {
  id: string;
  label: string;
  icon: LucideIcon;
  index: number;
}

function BioPreview() {
  return (
    <div className="flex items-start gap-2 p-2">
      <Quote className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2 bg-muted-foreground/20 rounded-full w-full" />
        <div className="h-2 bg-muted-foreground/15 rounded-full w-4/5" />
        <div className="h-2 bg-muted-foreground/10 rounded-full w-3/5" />
      </div>
    </div>
  );
}

function FeaturedProjectPreview() {
  return (
    <div className="p-2">
      <div className="relative w-full aspect-video bg-muted/60 rounded border border-border/50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Play className="h-4 w-4 text-primary ml-0.5" />
        </div>
      </div>
    </div>
  );
}

function InfoCardsPreview() {
  return (
    <div className="p-2">
      <div className="grid grid-cols-2 gap-1.5">
        {[Camera, Film, Star, Quote].map((Icon, i) => (
          <div key={i} className="h-7 bg-muted/50 rounded border border-border/40 flex items-center justify-center">
            <Icon className="h-3 w-3 text-muted-foreground/50" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialLinksPreview() {
  return (
    <div className="p-2 flex items-center justify-center gap-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="w-6 h-6 rounded-full bg-muted/60 border border-border/40" />
      ))}
    </div>
  );
}

function StatsPreview() {
  return (
    <div className="p-2 flex items-end justify-center gap-2 h-[52px]">
      <div className="flex flex-col items-center gap-1">
        <div className="w-5 bg-primary/30 rounded-sm" style={{ height: 20 }} />
        <span className="text-[8px] text-muted-foreground/50">3.8</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-5 bg-primary/50 rounded-sm" style={{ height: 28 }} />
        <span className="text-[8px] text-muted-foreground/50">12</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-5 bg-primary/40 rounded-sm" style={{ height: 16 }} />
        <span className="text-[8px] text-muted-foreground/50">4</span>
      </div>
    </div>
  );
}

function AchievementsPreview() {
  return (
    <div className="p-2 flex items-center justify-center gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <Trophy className="h-4 w-4 text-primary/40" />
          <div className="h-1.5 w-6 bg-muted-foreground/15 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function GalleryPreview() {
  return (
    <div className="p-2">
      <div className="grid grid-cols-3 gap-1">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="aspect-square bg-muted/50 rounded-sm border border-border/30" />
        ))}
      </div>
    </div>
  );
}

function WallPreview() {
  return (
    <div className="p-2 space-y-1.5">
      {[0.9, 0.7, 0.8].map((w, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <div className="w-4 h-4 rounded-full bg-muted/60 shrink-0" />
          <div className="bg-muted/40 rounded-lg px-2 py-1.5 border border-border/30" style={{ width: `${w * 100}%` }}>
            <div className="h-1.5 bg-muted-foreground/15 rounded-full w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

const SECTION_PREVIEWS: Record<string, React.FC> = {
  bio: BioPreview,
  featured_project: FeaturedProjectPreview,
  info_cards: InfoCardsPreview,
  social_links: SocialLinksPreview,
  stats: StatsPreview,
  achievements: AchievementsPreview,
  gallery: GalleryPreview,
  wall: WallPreview,
};

export function SortableVisualBlock({
  id,
  label,
  icon: Icon,
  index,
}: SortableVisualBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const Preview = SECTION_PREVIEWS[id];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-lg border-2 transition-all overflow-hidden ${
        isDragging
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 bg-muted/30">
        <div
          {...attributes}
          {...listeners}
          className="p-0.5 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-wide text-foreground flex-1">{label}</span>
        <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center">
          {index + 1}
        </span>
      </div>
      {/* Visual Preview */}
      {Preview && <Preview />}
    </div>
  );
}
