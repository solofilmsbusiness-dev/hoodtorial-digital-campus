import { cn } from "@/lib/utils";

interface StampBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "filled";
}

export function StampBadge({ children, className, variant = "default" }: StampBadgeProps) {
  const variants = {
    default: "border-2 border-primary text-primary bg-transparent",
    outline: "border-2 border-muted-foreground text-muted-foreground bg-transparent",
    filled: "border-2 border-primary bg-primary text-primary-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-3 py-1 text-xs font-bold uppercase tracking-widest rotate-[-2deg]",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface LabelTapeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "gold" | "steel" | "muted";
}

export function LabelTape({ children, className, variant = "gold" }: LabelTapeProps) {
  const variants = {
    gold: "bg-primary text-primary-foreground",
    steel: "bg-steel text-white",
    muted: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wide",
        variants[variant],
        className
      )}
      style={{
        clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
      }}
    >
      {children}
    </span>
  );
}

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  className,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          <span className="text-2xl font-bold text-foreground">{progress}%</span>
        )}
      </div>
    </div>
  );
}
