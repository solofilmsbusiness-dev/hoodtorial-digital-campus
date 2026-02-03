import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, BookOpen, ArrowRight, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface CourseCardProps {
  code: string;
  title: string;
  department: string;
  credits: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  description?: string;
  lessons?: number;
  duration?: string;
  className?: string;
  isComingSoon?: boolean;
}

export function CourseCard({
  code,
  title,
  department,
  credits,
  level,
  description,
  lessons,
  duration,
  className,
  isComingSoon = false,
}: CourseCardProps) {
  const levelColors = {
    Beginner: "bg-accent/20 text-accent border-accent/50",
    Intermediate: "bg-primary/20 text-primary border-primary/50",
    Advanced: "bg-neon-purple/20 text-neon-purple border-neon-purple/50",
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isComingSoon) {
      e.preventDefault();
      toast({
        title: "Coming Soon!",
        description: "This course is not yet available. Stay tuned for updates!",
      });
    }
  };

  return (
    <Link
      to={isComingSoon ? "#" : `/course/${code}`}
      onClick={handleClick}
      className={cn(
        "card-urban group h-full flex flex-col hover:border-primary transition-colors",
        isComingSoon && "opacity-70 grayscale-[30%] cursor-not-allowed hover:border-border",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <span className="tag-sticker text-[10px]">{code}</span>
        <div className="flex items-center gap-2">
          {isComingSoon && (
            <Badge variant="outline" className="text-xs font-bold border-2 bg-muted/50 text-muted-foreground border-muted-foreground/50">
              Coming Soon
            </Badge>
          )}
          <Badge variant="outline" className={cn("text-xs font-bold border-2", levelColors[level])}>
            {level}
          </Badge>
        </div>
      </div>

      {/* Title */}
      <h3 className={cn(
        "heading-4 text-foreground mb-2 group-hover:text-primary transition-colors leading-tight",
        isComingSoon && "group-hover:text-foreground"
      )}>
        {title}
      </h3>

      {/* Department */}
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
        {department}
      </p>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">
          {description}
        </p>
      )}

      {/* Meta info */}
      {(lessons || duration) && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          {lessons && (
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>{lessons} lessons</span>
            </div>
          )}
          {duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{duration}</span>
            </div>
          )}
        </div>
      )}

      {/* Credits */}
      <div className="flex items-center justify-between pt-4 border-t-2 border-border mt-auto">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
          Credits
        </span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-primary">{credits}</span>
          {isComingSoon ? (
            <Lock className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          )}
        </div>
      </div>
    </Link>
  );
}
