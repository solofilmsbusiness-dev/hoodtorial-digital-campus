import { AlertTriangle, X, CheckCircle2, Video, GraduationCap, Lock } from "lucide-react";
import { useTestMode } from "@/hooks/useTestMode";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TestModeBannerProps {
  className?: string;
}

export function TestModeBanner({ className }: TestModeBannerProps) {
  const {
    isTestModeEnabled,
    toggleTestMode,
    autoPassQuizzes,
    bypassVideoProgress,
    bypassEnrollmentCheck,
    skipProgressionLocks,
  } = useTestMode();

  if (!isTestModeEnabled) return null;

  const activeBypasses = [
    { active: autoPassQuizzes, label: "Auto-Pass", icon: CheckCircle2 },
    { active: bypassVideoProgress, label: "Video", icon: Video },
    { active: bypassEnrollmentCheck, label: "Enrollment", icon: GraduationCap },
    { active: skipProgressionLocks, label: "Progression", icon: Lock },
  ].filter((b) => b.active);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground py-2 px-4",
        "flex items-center justify-center gap-4 shadow-lg",
        className
      )}
    >
      <AlertTriangle className="w-5 h-5 animate-pulse shrink-0" />
      <span className="font-bold text-sm uppercase tracking-wider shrink-0">
        Test Mode Active
      </span>
      
      {/* Active bypasses */}
      <div className="hidden sm:flex items-center gap-1.5">
        {activeBypasses.map(({ label, icon: Icon }) => (
          <Badge
            key={label}
            variant="outline"
            className="bg-destructive-foreground/10 text-destructive-foreground border-destructive-foreground/30 text-xs"
          >
            <Icon className="w-3 h-3 mr-1" />
            {label}
          </Badge>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={toggleTestMode}
        className="h-7 px-3 bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90 border-none shrink-0"
      >
        <X className="w-4 h-4 mr-1" />
        Disable
      </Button>
    </div>
  );
}
