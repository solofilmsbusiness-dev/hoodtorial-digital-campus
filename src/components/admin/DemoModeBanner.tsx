import { Drama, Eye, EyeOff, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoMode } from "@/hooks/useDemoMode";
import { useNavigate } from "react-router-dom";

export function DemoModeBanner() {
  const { isActive, showDemoData, stats, toggleShowDemoData, canUseDemoMode } = useDemoMode();
  const navigate = useNavigate();

  // Only show banner if demo mode is active and user is admin
  if (!isActive || !canUseDemoMode) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 py-1.5 px-4 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Drama className="h-4 w-4" />
        <span className="font-medium">Demo Mode Active</span>
        <span className="text-amber-800">
          — {stats.userCount} users, {stats.postCount} posts, {stats.commentCount} comments
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleShowDemoData}
          className="h-7 text-amber-950 hover:bg-amber-600/20 hover:text-amber-950"
        >
          {showDemoData ? (
            <>
              <EyeOff className="h-3.5 w-3.5 mr-1.5" />
              Hide Demo
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              Show Demo
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/settings")}
          className="h-7 text-amber-950 hover:bg-amber-600/20 hover:text-amber-950"
        >
          <Settings className="h-3.5 w-3.5 mr-1.5" />
          Manage
        </Button>
      </div>
    </div>
  );
}
