import { Check, Clapperboard, Film, Megaphone, Calendar, Camera, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  Clapperboard,
  Film,
  Megaphone,
  Calendar,
  Camera,
  Video,
};

interface InterestCardProps {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  selected: boolean;
  disabled: boolean;
  onToggle: (id: string) => void;
}

export function InterestCard({
  id,
  name,
  tagline,
  icon,
  selected,
  disabled,
  onToggle,
}: InterestCardProps) {
  const Icon = iconMap[icon as keyof typeof iconMap] || Camera;

  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      disabled={disabled && !selected}
      className={cn(
        "relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200",
        "text-left w-full",
        selected
          ? "border-primary bg-primary/10 shadow-lg"
          : "border-border bg-card hover:border-primary/50 hover:bg-accent/50",
        disabled && !selected && "opacity-50 cursor-not-allowed"
      )}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      <div
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center",
          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="w-7 h-7" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{tagline}</p>
      </div>
    </button>
  );
}
