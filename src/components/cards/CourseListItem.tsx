import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseListItemProps {
  code: string;
  title: string;
  department: string;
  credits: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  lessons?: number;
  duration?: string;
  className?: string;
}

export function CourseListItem({
  code,
  title,
  department,
  credits,
  level,
  lessons,
  duration,
  className,
}: CourseListItemProps) {
  const levelColors = {
    Beginner: "bg-accent/20 text-accent border-accent/50",
    Intermediate: "bg-primary/20 text-primary border-primary/50",
    Advanced: "bg-neon-purple/20 text-neon-purple border-neon-purple/50",
  };

  return (
    <Link
      to={`/course/${code}`}
      className={cn(
        "flex items-center gap-4 p-4 bg-card border-2 border-border hover:border-primary transition-all group",
        className
      )}
    >
      {/* Code Badge */}
      <div className="w-20 shrink-0">
        <span className="tag-sticker text-[10px]">{code}</span>
      </div>

      {/* Title & Department */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
          {department}
        </p>
      </div>

      {/* Meta */}
      <div className="hidden md:flex items-center gap-6 text-xs text-muted-foreground shrink-0">
        {lessons && (
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>{lessons}</span>
          </div>
        )}
        {duration && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{duration}</span>
          </div>
        )}
      </div>

      {/* Level Badge */}
      <Badge variant="outline" className={cn("shrink-0 text-xs font-bold border-2 hidden sm:flex", levelColors[level])}>
        {level}
      </Badge>

      {/* Credits */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <div className="text-lg font-black text-primary">{credits}</div>
          <div className="text-[10px] text-muted-foreground uppercase">credits</div>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}
