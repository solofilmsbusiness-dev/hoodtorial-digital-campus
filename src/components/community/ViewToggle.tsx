import { Button } from "@/components/ui/button";
import { LayoutGrid, Newspaper, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = 'timeline' | 'grid' | 'following';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  const options: { value: ViewMode; icon: React.ReactNode; label: string }[] = [
    { value: 'timeline', icon: <Newspaper className="h-4 w-4" />, label: 'Timeline' },
    { value: 'grid', icon: <LayoutGrid className="h-4 w-4" />, label: 'Gallery' },
    { value: 'following', icon: <Bookmark className="h-4 w-4" />, label: 'Saved' },
  ];

  return (
    <div className="flex items-center bg-muted/50 rounded-lg p-1 gap-1">
      {options.map((option) => (
        <Button
          key={option.value}
          variant="ghost"
          size="sm"
          onClick={() => onChange(option.value)}
          className={cn(
            "gap-2 h-8 px-3 transition-all",
            value === option.value
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.icon}
          <span className="hidden sm:inline text-xs font-medium">{option.label}</span>
        </Button>
      ))}
    </div>
  );
}
