import { useState, useRef } from "react";
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
  Home,
  BookOpen, 
  Users as UsersIcon, 
  MessageSquare, 
  GraduationCap,
  ShoppingBag,
  UserCircle,
  ExternalLink,
  Loader2,
  Clapperboard,
  Mail
} from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const STUDENT_PAGES = [
  { key: "home", label: "Home", icon: Home, path: "/" },
  { key: "academics", label: "Courses", icon: BookOpen, path: "/academics" },
  { key: "community", label: "Community", icon: MessageSquare, path: "/community" },
  { key: "student_center", label: "Student Center", icon: Clapperboard, path: "/student-center" },
  { key: "degrees", label: "Degrees", icon: GraduationCap, path: "/degrees" },
  { key: "faculty", label: "Faculty", icon: UserCircle, path: "/faculty" },
  { key: "shop", label: "Shop", icon: ShoppingBag, path: "/shop" },
  { key: "friends", label: "Friends", icon: UsersIcon, path: "/friends" },
  { key: "messages", label: "Messages", icon: Mail, path: "/messages" },
];

export function PageBackgroundSettings() {
  const { settings, loading, updateSetting, uploadAsset, deleteAsset } = useSiteSettings();
  const [activeTab, setActiveTab] = useState("home");
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getVideoUrl = (pageKey: string) => settings[`page_bg_${pageKey}_video`];
  const getOverlayOpacity = (pageKey: string) => parseInt(settings[`page_bg_${pageKey}_overlay`] || "85");

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
      const oldUrl = getVideoUrl(pageKey);
      if (oldUrl) {
        await deleteAsset(oldUrl);
      }

      const url = await uploadAsset(file, "video");
      await updateSetting(`page_bg_${pageKey}_video`, url);
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
        await updateSetting(`page_bg_${pageKey}_video`, null);
        toast.success("Background video removed");
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to remove video");
      }
    }
  };

  const handleOpacityChange = async (pageKey: string, value: number[]) => {
    await updateSetting(`page_bg_${pageKey}_overlay`, value[0].toString());
  };

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
          Page Backgrounds
        </CardTitle>
        <CardDescription>
          Add cinematic video backgrounds to student-facing pages (disabled on mobile)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 h-auto gap-1">
            {STUDENT_PAGES.map((page) => (
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

          {STUDENT_PAGES.map((page) => (
            <TabsContent key={page.key} value={page.key} className="space-y-6 mt-6">
              {/* Video Preview */}
              <div className="space-y-3">
                <Label>Background Video Preview</Label>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted/50 border border-border relative">
                  {getVideoUrl(page.key) ? (
                    <>
                      <video
                        key={getVideoUrl(page.key)}
                        src={getVideoUrl(page.key)!}
                        className="w-full h-full object-cover"
                        style={{ opacity: 0.15 }}
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                      <div 
                        className="absolute inset-0 bg-background pointer-events-none"
                        style={{ opacity: getOverlayOpacity(page.key) / 100 }}
                      />
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
