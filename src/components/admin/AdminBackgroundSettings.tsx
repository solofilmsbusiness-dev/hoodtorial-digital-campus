import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Upload, 
  Trash2, 
  Film, 
  LayoutDashboard, 
  BookOpen, 
  Flame, 
  Users as UsersIcon, 
  MessageSquare, 
  Headphones,
  Settings,
  ExternalLink,
  Loader2
} from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const ADMIN_PAGES = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { key: "courses", label: "Courses", icon: BookOpen, path: "/admin/courses" },
  { key: "challenges", label: "Challenges", icon: Flame, path: "/admin/challenges" },
  { key: "community", label: "Community", icon: MessageSquare, path: "/admin/community" },
  { key: "support", label: "Support", icon: Headphones, path: "/admin/support" },
  { key: "users", label: "Users", icon: UsersIcon, path: "/admin/users" },
  { key: "settings", label: "Settings", icon: Settings, path: "/admin/settings" },
];

export function AdminBackgroundSettings() {
  const { settings, loading, updateSetting, uploadAsset, deleteAsset } = useSiteSettings();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getVideoUrl = (pageKey: string) => settings[`admin_bg_${pageKey}_video`];
  const getOverlayOpacity = (pageKey: string) => parseInt(settings[`admin_bg_${pageKey}_overlay`] || "85");

  const handleVideoUpload = async (pageKey: string, file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file (MP4 or WebM)");
      return;
    }

    if (file.size > 200 * 1024 * 1024) {
      toast.error("Video must be under 200MB");
      return;
    }

    setUploading(pageKey);
    try {
      // Delete old video if exists
      const oldUrl = getVideoUrl(pageKey);
      if (oldUrl) {
        await deleteAsset(oldUrl);
      }

      // Upload new video
      const url = await uploadAsset(file, "video");
      await updateSetting(`admin_bg_${pageKey}_video`, url);
      toast.success("Background video uploaded!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload video");
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveVideo = async (pageKey: string) => {
    const url = getVideoUrl(pageKey);
    if (url) {
      try {
        await deleteAsset(url);
        await updateSetting(`admin_bg_${pageKey}_video`, null);
        toast.success("Background video removed");
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to remove video");
      }
    }
  };

  const handleOpacityChange = async (pageKey: string, value: number[]) => {
    await updateSetting(`admin_bg_${pageKey}_overlay`, value[0].toString());
  };

  const activePage = ADMIN_PAGES.find(p => p.key === activeTab);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="h-5 w-5" />
          Admin Page Backgrounds
        </CardTitle>
        <CardDescription>
          Add cinematic video backgrounds to each admin section
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 h-auto gap-1">
            {ADMIN_PAGES.map((page) => (
              <TabsTrigger 
                key={page.key} 
                value={page.key}
                className="flex flex-col items-center gap-1 py-2 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <page.icon className="h-4 w-4" />
                <span className="text-xs">{page.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {ADMIN_PAGES.map((page) => (
            <TabsContent key={page.key} value={page.key} className="space-y-6 mt-6">
              {/* Video Preview */}
              <div className="space-y-3">
                <Label>Background Video Preview</Label>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted/50 border border-border relative">
                {getVideoUrl(page.key) ? (
                    <>
                      <video
                        key={getVideoUrl(page.key)}
                        ref={(el) => { if (el) el.play().catch(() => {}); }}
                        src={getVideoUrl(page.key)!}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                      {/* Simulated overlay */}
                      <div 
                        className="absolute inset-0 bg-background pointer-events-none"
                        style={{ opacity: getOverlayOpacity(page.key) / 100 }}
                      />
                      {/* Sample content preview */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center space-y-2">
                          <page.icon className="h-12 w-12 mx-auto text-primary/60" />
                          <p className="text-lg font-semibold text-foreground/80">{page.label} Page</p>
                          <p className="text-sm text-muted-foreground">Content appears above the video</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <Film className="h-12 w-12 mb-2 opacity-30" />
                      <p className="text-sm">No video set</p>
                      <p className="text-xs opacity-60">Upload a video to create an immersive background</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Controls */}
              <div className="space-y-3">
                <Label>Background Video</Label>
                <div className="flex gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleVideoUpload(page.key, file);
                        e.target.value = "";
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading === page.key}
                  >
                    {uploading === page.key ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Video
                      </>
                    )}
                  </Button>
                  {getVideoUrl(page.key) && (
                    <Button
                      variant="outline"
                      onClick={() => handleRemoveVideo(page.key)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Accepted formats: MP4, WebM (max 200MB)
                </p>
              </div>

              {/* Overlay Opacity */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Overlay Opacity</Label>
                  <span className="text-sm text-muted-foreground font-mono">
                    {getOverlayOpacity(page.key)}%
                  </span>
                </div>
                <Slider
                  value={[getOverlayOpacity(page.key)]}
                  onValueCommit={(value) => handleOpacityChange(page.key, value)}
                  min={70}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More visible (70%)</span>
                  <span>More subtle (100%)</span>
                </div>
              </div>

              {/* Preview Link */}
              <div className="pt-4 border-t border-border">
                <Button asChild variant="outline" size="sm">
                  <Link to={page.path}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Preview in {page.label}
                  </Link>
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
