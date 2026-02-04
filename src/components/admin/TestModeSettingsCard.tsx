import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FlaskConical, CheckCircle2, Video, GraduationCap, Lock, Zap } from "lucide-react";
import { useTestMode } from "@/hooks/useTestMode";
import { cn } from "@/lib/utils";

export function TestModeSettingsCard() {
  const {
    isTestModeEnabled,
    autoPassQuizzes,
    bypassVideoProgress,
    bypassEnrollmentCheck,
    skipProgressionLocks,
    toggleTestMode,
    setAutoPassQuizzes,
    setBypassVideoProgress,
    setBypassEnrollmentCheck,
    setSkipProgressionLocks,
    canUseTestMode,
    activeBypassCount,
  } = useTestMode();

  if (!canUseTestMode) {
    return null;
  }

  return (
    <Card className={cn(
      "transition-all duration-200",
      isTestModeEnabled && "border-destructive/50 bg-destructive/5"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            <CardTitle>Test Mode</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            {isTestModeEnabled && (
              <Badge variant="destructive" className="animate-pulse">
                ACTIVE
              </Badge>
            )}
            <Switch
              checked={isTestModeEnabled}
              onCheckedChange={toggleTestMode}
              aria-label="Toggle test mode"
            />
          </div>
        </div>
        <CardDescription>
          Bypass content restrictions for testing course flows
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warning Banner */}
        {isTestModeEnabled && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">
                Test Mode Active — {activeBypassCount} bypass{activeBypassCount !== 1 ? "es" : ""} enabled
              </p>
              <p className="text-xs text-muted-foreground">
                Content restrictions are currently bypassed. Disable test mode when finished testing.
              </p>
            </div>
          </div>
        )}

        <Separator />

        {/* Feature Toggles */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Bypass Features</Label>

          {/* Auto-Pass Quizzes */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-0.5">
                <Label htmlFor="auto-pass-quizzes" className="text-sm font-medium">
                  Auto-Pass Quizzes
                </Label>
                <p className="text-xs text-muted-foreground">
                  Automatically pass quizzes without answering questions
                </p>
              </div>
            </div>
            <Switch
              id="auto-pass-quizzes"
              checked={autoPassQuizzes}
              onCheckedChange={setAutoPassQuizzes}
              disabled={!isTestModeEnabled}
            />
          </div>

          {/* Bypass Video Progress */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-start gap-3">
              <Video className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-0.5">
                <Label htmlFor="bypass-video" className="text-sm font-medium">
                  Bypass Video Progress
                </Label>
                <p className="text-xs text-muted-foreground">
                  Mark videos as complete instantly without watching
                </p>
              </div>
            </div>
            <Switch
              id="bypass-video"
              checked={bypassVideoProgress}
              onCheckedChange={setBypassVideoProgress}
              disabled={!isTestModeEnabled}
            />
          </div>

          {/* Bypass Enrollment Check */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-start gap-3">
              <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-0.5">
                <Label htmlFor="bypass-enrollment" className="text-sm font-medium">
                  Bypass Enrollment Check
                </Label>
                <p className="text-xs text-muted-foreground">
                  Access any course without being enrolled
                </p>
              </div>
            </div>
            <Switch
              id="bypass-enrollment"
              checked={bypassEnrollmentCheck}
              onCheckedChange={setBypassEnrollmentCheck}
              disabled={!isTestModeEnabled}
            />
          </div>

          {/* Skip Progression Locks */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-0.5">
                <Label htmlFor="skip-progression" className="text-sm font-medium">
                  Skip Progression Locks
                </Label>
                <p className="text-xs text-muted-foreground">
                  Access all lessons regardless of prior completion
                </p>
              </div>
            </div>
            <Switch
              id="skip-progression"
              checked={skipProgressionLocks}
              onCheckedChange={setSkipProgressionLocks}
              disabled={!isTestModeEnabled}
            />
          </div>
        </div>

        {!isTestModeEnabled && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-muted-foreground">
            <Zap className="h-4 w-4" />
            <p className="text-xs">
              Enable test mode to configure bypass features. You can also toggle via <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">⌘K</kbd> → "Test Mode"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
