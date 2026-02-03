import { AlertTriangle, X } from "lucide-react";
import { useTestMode } from "@/hooks/useTestMode";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TestModeBannerProps {
  className?: string;
}

export function TestModeBanner({ className }: TestModeBannerProps) {
  const { isTestModeEnabled, toggleTestMode } = useTestMode();

  if (!isTestModeEnabled) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground py-2 px-4",
        "flex items-center justify-center gap-4 shadow-lg",
        className
      )}
    >
      <AlertTriangle className="w-5 h-5 animate-pulse" />
      <span className="font-bold text-sm uppercase tracking-wider">
        Test Mode Active — Content Restrictions Bypassed
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTestMode}
        className="h-7 px-3 bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90 border-none"
      >
        <X className="w-4 h-4 mr-1" />
        Disable
      </Button>
    </div>
  );
}
