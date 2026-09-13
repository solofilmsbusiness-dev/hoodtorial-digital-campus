import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, BookOpen, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { useEnrollments } from "@/hooks/useEnrollments";

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
  const ref = useRef<HTMLAnchorElement>(null);
  const { isEnrolled, getEnrollment } = useEnrollments();
  
  const enrolled = isEnrolled(code);
  const enrollment = getEnrollment(code);
  
  // 3D tilt effect
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springConfig = { stiffness: 300, damping: 30 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-yPct * 16);
    rotateY.set(xPct * 16);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

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
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className="h-full"
    >
      <Link
        ref={ref}
        to={isComingSoon ? "#" : `/course/${code}`}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "card-urban group h-full flex flex-col hover:border-primary transition-all duration-300",
          "transform-gpu backface-hidden",
          isComingSoon && "opacity-70 grayscale-[30%] cursor-not-allowed hover:border-border",
          className
        )}
        style={{ transform: "translateZ(20px)" }}
      >
        {/* Glare effect */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm"
          style={{
            background: `radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.1), transparent 60%)`,
          }}
        />

        {/* Header */}
        <div className="flex items-start justify-between mb-4 relative">
          <div className="flex items-center gap-2">
            <span className="tag-sticker text-[10px]">{code}</span>
            {enrolled && enrollment?.status === "active" && (
              <Badge className="bg-accent/20 text-accent border border-accent/50 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Enrolled
              </Badge>
            )}
            {enrollment?.status === "completed" && (
              <Badge className="bg-primary/20 text-primary border border-primary/50 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
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
        <div className="flex items-center justify-between pt-4 border-t-2 border-border mt-auto relative">
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
    </motion.div>
  );
}
