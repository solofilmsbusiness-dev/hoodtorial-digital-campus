import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Monitor, Bell, BellOff, Layout, Rows3, LayoutGrid } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type DisplayDensity = "comfortable" | "compact" | "cozy";

interface NotificationPreferences {
  newEnrollments: boolean;
  quizCompletions: boolean;
  trialExpirations: boolean;
  communityPosts: boolean;
  systemAlerts: boolean;
}

const defaultNotifications: NotificationPreferences = {
  newEnrollments: true,
  quizCompletions: true,
  trialExpirations: true,
  communityPosts: false,
  systemAlerts: true,
};

export default function AdminSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [density, setDensity] = useState<DisplayDensity>("comfortable");
  const [notifications, setNotifications] = useState<NotificationPreferences>(defaultNotifications);

  // Load saved preferences
  useEffect(() => {
    setMounted(true);
    
    const savedDensity = localStorage.getItem("admin-display-density") as DisplayDensity;
    if (savedDensity) setDensity(savedDensity);
    
    const savedNotifications = localStorage.getItem("admin-notifications");
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch {
        // Use defaults if parse fails
      }
    }
  }, []);

  // Save density preference
  const handleDensityChange = (value: DisplayDensity) => {
    setDensity(value);
    localStorage.setItem("admin-display-density", value);
    document.documentElement.setAttribute("data-density", value);
    toast.success("Display density updated");
  };

  // Save notification preference
  const handleNotificationChange = (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    localStorage.setItem("admin-notifications", JSON.stringify(updated));
  };

  if (!mounted) {
    return (
      <AdminLayout title="Settings" description="Configure your admin preferences">
        <div className="grid gap-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 animate-pulse bg-muted rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <AdminLayout title="Settings" description="Configure your admin preferences">
      <div className="grid gap-6 max-w-2xl">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize how the admin panel looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={isDark}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>

            <Separator />

            {/* Theme Selector */}
            <div className="space-y-3">
              <Label className="text-base">Theme Preference</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-5 w-5" />
                  <span className="text-xs">Light</span>
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-5 w-5" />
                  <span className="text-xs">Dark</span>
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => setTheme("system")}
                >
                  <Monitor className="h-5 w-5" />
                  <span className="text-xs">System</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                System theme will automatically match your device's appearance settings.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Display Density */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Display Density
            </CardTitle>
            <CardDescription>Control spacing and sizing of UI elements</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={density}
              onValueChange={(value) => handleDensityChange(value as DisplayDensity)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="comfortable" id="comfortable" />
                <div className="flex-1">
                  <Label htmlFor="comfortable" className="text-base cursor-pointer flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                    Comfortable
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Default spacing with more breathing room
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded bg-muted" />
                  <div className="w-3 h-3 rounded bg-muted" />
                  <div className="w-3 h-3 rounded bg-muted" />
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="cozy" id="cozy" />
                <div className="flex-1">
                  <Label htmlFor="cozy" className="text-base cursor-pointer flex items-center gap-2">
                    <Rows3 className="h-4 w-4 text-muted-foreground" />
                    Cozy
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Balanced spacing for everyday use
                  </p>
                </div>
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded bg-muted" />
                  <div className="w-2.5 h-2.5 rounded bg-muted" />
                  <div className="w-2.5 h-2.5 rounded bg-muted" />
                  <div className="w-2.5 h-2.5 rounded bg-muted" />
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="compact" id="compact" />
                <div className="flex-1">
                  <Label htmlFor="compact" className="text-base cursor-pointer flex items-center gap-2">
                    <Rows3 className="h-4 w-4 text-muted-foreground rotate-90" />
                    Compact
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Tighter spacing to see more content
                  </p>
                </div>
                <div className="flex gap-0.5">
                  <div className="w-2 h-2 rounded bg-muted" />
                  <div className="w-2 h-2 rounded bg-muted" />
                  <div className="w-2 h-2 rounded bg-muted" />
                  <div className="w-2 h-2 rounded bg-muted" />
                  <div className="w-2 h-2 rounded bg-muted" />
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Choose which notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="notify-enrollments" className="text-base">New Enrollments</Label>
                <p className="text-sm text-muted-foreground">
                  When a student enrolls in a course
                </p>
              </div>
              <Switch
                id="notify-enrollments"
                checked={notifications.newEnrollments}
                onCheckedChange={(checked) => handleNotificationChange("newEnrollments", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="notify-quizzes" className="text-base">Quiz Completions</Label>
                <p className="text-sm text-muted-foreground">
                  When students complete quizzes or exams
                </p>
              </div>
              <Switch
                id="notify-quizzes"
                checked={notifications.quizCompletions}
                onCheckedChange={(checked) => handleNotificationChange("quizCompletions", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="notify-trials" className="text-base">Trial Expirations</Label>
                <p className="text-sm text-muted-foreground">
                  Alerts when student trials are about to expire
                </p>
              </div>
              <Switch
                id="notify-trials"
                checked={notifications.trialExpirations}
                onCheckedChange={(checked) => handleNotificationChange("trialExpirations", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="notify-community" className="text-base">Community Posts</Label>
                <p className="text-sm text-muted-foreground">
                  New posts in the community forum
                </p>
              </div>
              <Switch
                id="notify-community"
                checked={notifications.communityPosts}
                onCheckedChange={(checked) => handleNotificationChange("communityPosts", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="notify-system" className="text-base">System Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Important system updates and security notices
                </p>
              </div>
              <Switch
                id="notify-system"
                checked={notifications.systemAlerts}
                onCheckedChange={(checked) => handleNotificationChange("systemAlerts", checked)}
              />
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allOn = {
                    newEnrollments: true,
                    quizCompletions: true,
                    trialExpirations: true,
                    communityPosts: true,
                    systemAlerts: true,
                  };
                  setNotifications(allOn);
                  localStorage.setItem("admin-notifications", JSON.stringify(allOn));
                  toast.success("All notifications enabled");
                }}
              >
                <Bell className="h-4 w-4 mr-2" />
                Enable All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allOff = {
                    newEnrollments: false,
                    quizCompletions: false,
                    trialExpirations: false,
                    communityPosts: false,
                    systemAlerts: false,
                  };
                  setNotifications(allOff);
                  localStorage.setItem("admin-notifications", JSON.stringify(allOff));
                  toast.success("All notifications disabled");
                }}
              >
                <BellOff className="h-4 w-4 mr-2" />
                Disable All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>Manage your data and privacy preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label className="text-base">Clear Local Preferences</Label>
                <p className="text-sm text-muted-foreground">
                  Reset all settings to their defaults
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  localStorage.removeItem("admin-display-density");
                  localStorage.removeItem("admin-notifications");
                  setDensity("comfortable");
                  setNotifications(defaultNotifications);
                  document.documentElement.removeAttribute("data-density");
                  toast.success("Preferences reset to defaults");
                }}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
