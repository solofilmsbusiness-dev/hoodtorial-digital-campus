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
    Beginner: "bg-green-500/20 text-green-400 border-green-500/30",
    Intermediate: "bg-primary/20 text-primary border-primary/30",
    Advanced: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div
      className={cn(
        "group relative bg-card border border-border rounded-lg p-6 card-hover",
        className
      )}
    >
      {/* Course Code Badge */}
      <div className="flex items-start justify-between mb-4">
        <span className="stamp-badge">{code}</span>
        <Badge variant="outline" className={cn("text-xs", levelColors[level])}>
          {level}
        </Badge>
      </div>

      {/* Title */}
      <h3 className="heading-4 text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>

      {/* Department */}
      <p className="text-sm text-muted-foreground uppercase tracking-wide mb-3">
        {department}
      </p>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {description}
        </p>
      )}

      {/* Credits */}
      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          Credits:
        </span>
        <span className="text-sm font-bold text-primary">{credits}</span>
      </div>
    </div>
  );
}
