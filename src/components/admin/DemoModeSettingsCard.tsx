import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Drama, Users, FileText, MessageCircle, RefreshCw, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { useDemoMode } from "@/hooks/useDemoMode";
import { formatDistanceToNow } from "date-fns";

export function DemoModeSettingsCard() {
  const {
    isActive,
    showDemoData,
    stats,
    isLoading,
    isGenerating,
    lastGeneratedAt,
    toggleShowDemoData,
    generateDemoData,
    clearDemoData,
    hasDemoData,
  } = useDemoMode();

  const [userCount, setUserCount] = useState(25);
  const [postCount, setPostCount] = useState(50);
  const [commentCount, setCommentCount] = useState(100);

  const handleGenerate = async () => {
    await generateDemoData({ userCount, postCount, commentCount });
  };

  const handleClear = async () => {
    await clearDemoData();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Drama className="h-5 w-5" />
            Demo Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isActive ? "border-amber-500/50 bg-amber-500/5" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Drama className="h-5 w-5 text-amber-500" />
            <CardTitle>Demo Mode</CardTitle>
            {isActive && (
              <Badge variant="outline" className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                ACTIVE
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Populate the platform with AI-generated users, posts, and activity for testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Demo Data Stats */}
        {hasDemoData && (
          <>
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-3 block">
                Current Demo Data
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-2xl font-bold">{stats.userCount}</div>
                  <div className="text-xs text-muted-foreground">Users</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <FileText className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-2xl font-bold">{stats.postCount}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <MessageCircle className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-2xl font-bold">{stats.commentCount}</div>
                  <div className="text-xs text-muted-foreground">Comments</div>
                </div>
              </div>
              {lastGeneratedAt && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Generated {formatDistanceToNow(lastGeneratedAt, { addSuffix: true })}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-demo" className="text-base">Show Demo Data</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle visibility of demo content in the UI
                </p>
              </div>
              <div className="flex items-center gap-2">
                {showDemoData ? (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <Switch
                  id="show-demo"
                  checked={showDemoData}
                  onCheckedChange={toggleShowDemoData}
                />
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Generation Configuration */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-muted-foreground">
            Generation Settings
          </Label>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Demo Users</Label>
                <span className="text-sm font-medium">{userCount}</span>
              </div>
              <Slider
                value={[userCount]}
                onValueChange={([v]) => setUserCount(v)}
                min={10}
                max={50}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Demo Posts</Label>
                <span className="text-sm font-medium">{postCount}</span>
              </div>
              <Slider
                value={[postCount]}
                onValueChange={([v]) => setPostCount(v)}
                min={25}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Demo Comments</Label>
                <span className="text-sm font-medium">{commentCount}</span>
              </div>
              <Slider
                value={[commentCount]}
                onValueChange={([v]) => setCommentCount(v)}
                min={50}
                max={200}
                step={10}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Demo Data
              </>
            )}
          </Button>
          
          {hasDemoData && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isGenerating}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Demo Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {stats.userCount} demo users, {stats.postCount} posts, 
                    and {stats.commentCount} comments. Real user data will not be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClear} className="bg-destructive text-destructive-foreground">
                    Clear All Demo Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Info note */}
        <p className="text-xs text-muted-foreground">
          Demo data uses AI to generate realistic filmmaker profiles and content. 
          All demo data is isolated with an <code className="bg-muted px-1 rounded">is_demo</code> flag 
          and can be cleared without affecting real users.
        </p>
      </CardContent>
    </Card>
  );
}
