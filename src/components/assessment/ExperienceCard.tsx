import { Sparkles, Heart, Briefcase, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  Sparkles,
  Heart,
  Briefcase,
  Award,
};

interface ExperienceCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function ExperienceCard({
  id,
  title,
  description,
  icon,
  selected,
  onSelect,
}: ExperienceCardProps) {
  const Icon = iconMap[icon as keyof typeof iconMap] || Sparkles;

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={cn(
        "flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-200 w-full text-left",
        selected
          ? "border-primary bg-primary/10 shadow-lg"
          : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}
