import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageSquare,
  Settings,
  Plus,
  FlaskConical,
  Home,
  Search,
} from "lucide-react";
import { useTestMode } from "@/hooks/useTestMode";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    keywords: ["home", "overview", "stats"],
  },
  {
    title: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
    keywords: ["lessons", "curriculum", "modules"],
  },
  {
    title: "Community",
    href: "/admin/community",
    icon: MessageSquare,
    keywords: ["posts", "discussions", "forum"],
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    keywords: ["students", "members", "profiles"],
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    keywords: ["config", "preferences"],
  },
];

const actionItems = [
  {
    title: "Create New Course",
    href: "/admin/courses/new",
    icon: Plus,
    keywords: ["add", "new course"],
  },
  {
    title: "Back to Main Site",
    href: "/",
    icon: Home,
    keywords: ["home", "exit", "leave admin"],
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isTestModeEnabled, toggleTestMode } = useTestMode();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    []
  );

  return (
    <>
      {/* Trigger button for non-keyboard users */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md border border-border bg-background hover:bg-muted transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.href}
                value={`${item.title} ${item.keywords.join(" ")}`}
                onSelect={() => runCommand(() => navigate(item.href))}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Actions">
            {actionItems.map((item) => (
              <CommandItem
                key={item.href}
                value={`${item.title} ${item.keywords.join(" ")}`}
                onSelect={() => runCommand(() => navigate(item.href))}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </CommandItem>
            ))}
            <CommandItem
              value="toggle test mode testing"
              onSelect={() => runCommand(toggleTestMode)}
            >
              <FlaskConical className="mr-2 h-4 w-4" />
              <span>
                {isTestModeEnabled ? "Disable Test Mode" : "Enable Test Mode"}
              </span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
