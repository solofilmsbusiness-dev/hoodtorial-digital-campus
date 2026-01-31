import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  code: string;
  title: string;
  department: string;
  credits: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  description?: string;
  className?: string;
}

export function CourseCard({
  code,
  title,
  department,
  credits,
  level,
  description,
  className,
}: CourseCardProps) {
  const levelColors = {
    Beginner: "bg-accent/20 text-accent border-accent/50",
    Intermediate: "bg-primary/20 text-primary border-primary/50",
    Advanced: "bg-neon-purple/20 text-neon-purple border-neon-purple/50",
  };

  return (
    <div
      className={cn(
        "card-urban group",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <span className="tag-sticker text-[10px]">{code}</span>
        <Badge variant="outline" className={cn("text-xs font-bold border-2", levelColors[level])}>
          {level}
        </Badge>
      </div>

      {/* Title */}
      <h3 className="heading-4 text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>

      {/* Department */}
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
        {department}
      </p>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {description}
        </p>
      )}

      {/* Credits */}
      <div className="flex items-center gap-2 pt-4 border-t-2 border-border">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
          Credits:
        </span>
        <span className="text-lg font-black text-primary">{credits}</span>
      </div>
    </div>
  );
}
