import { Drama } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface DemoUserBadgeProps {
  isDemo?: boolean;
  variant?: "badge" | "icon";
  className?: string;
}

export function DemoUserBadge({ isDemo, variant = "badge", className }: DemoUserBadgeProps) {
  const { isAdmin } = useAdminAuth();

  // Only show to admins and only if is_demo is true
  if (!isAdmin || !isDemo) {
    return null;
  }

  if (variant === "icon") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Drama className={`h-3.5 w-3.5 text-amber-500 ${className}`} />
        </TooltipTrigger>
        <TooltipContent>
          <p>Demo user</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`bg-amber-500/20 text-amber-600 border-amber-500/30 text-xs ${className}`}
    >
      <Drama className="h-3 w-3 mr-1" />
      Demo
    </Badge>
  );
}
