import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Upload, Trash2, ExternalLink, Loader2, Video, Image } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";

export function SiteCustomization() {
  const { settings, loading, updateSetting, uploadAsset, deleteAsset } = useSiteSettings();
  const [videoUploading, setVideoUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['video/mp4', 'video/webm'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an MP4 or WebM video file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (200MB max)
    if (file.size > 200 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video must be under 200MB.",
        variant: "destructive",
      });
      return;
    }

    setVideoUploading(true);
    setUploadProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      // Delete old video if exists
      if (settings.login_video_url) {
        await deleteAsset(settings.login_video_url);
      }

      const url = await uploadAsset(file, 'video');
      await updateSetting('login_video_url', url);
      
      setUploadProgress(100);
      toast({
        title: "Video uploaded",
        description: "Login page video has been updated.",
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setVideoUploading(false);
      setUploadProgress(0);
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PNG, JPG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be under 10MB.",
        variant: "destructive",
      });
      return;
    }

    setLogoUploading(true);

    try {
      // Delete old logo if exists
      if (settings.login_logo_url) {
        await deleteAsset(settings.login_logo_url);
      }

      const url = await uploadAsset(file, 'logo');
      await updateSetting('login_logo_url', url);
      
      toast({
        title: "Logo uploaded",
        description: "Login page logo has been updated.",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  };

  const handleRemoveVideo = async () => {
    try {
      if (settings.login_video_url) {
        await deleteAsset(settings.login_video_url);
      }
      await updateSetting('login_video_url', null);
      toast({
        title: "Video removed",
        description: "Login page will use the default video.",
      });
    } catch (error) {
      console.error("Error removing video:", error);
      toast({
        title: "Error",
        description: "Failed to remove video.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveLogo = async () => {
    try {
      if (settings.login_logo_url) {
        await deleteAsset(settings.login_logo_url);
      }
      await updateSetting('login_logo_url', null);
      toast({
        title: "Logo removed",
        description: "Login page will use the default logo.",
      });
    } catch (error) {
      console.error("Error removing logo:", error);
      toast({
        title: "Error",
        description: "Failed to remove logo.",
        variant: "destructive",
      });
    }
  };

  const handlePreviewLoginPage = () => {
    window.open('/auth', '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Site Customization
        </CardTitle>
        <CardDescription>
          Customize the login page appearance with custom video and logo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Login Background Video */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Login Background Video</Label>
          
          <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
            <AspectRatio ratio={16 / 9}>
              {settings.login_video_url ? (
                <video
                  src={settings.login_video_url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <div className="text-center text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Using default video</p>
                  </div>
                </div>
              )}
            </AspectRatio>
          </div>

          {videoUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">Uploading video...</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => videoInputRef.current?.click()}
              disabled={videoUploading}
            >
              {videoUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload Video
            </Button>
            
            {settings.login_video_url && (
              <Button
                variant="outline"
                onClick={handleRemoveVideo}
                disabled={videoUploading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
            
            <Button
              variant="secondary"
              onClick={handlePreviewLoginPage}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview Login Page
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Accepted formats: MP4, WebM (max 200MB)
          </p>

          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm"
            onChange={handleVideoUpload}
            className="hidden"
          />
        </div>

        <div className="border-t border-border" />

        {/* Login Logo */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Login Logo</Label>
          
          <div className="w-32 h-32 rounded-lg border border-border bg-muted/30 overflow-hidden">
            {settings.login_logo_url ? (
              <img
                src={settings.login_logo_url}
                alt="Login logo"
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Image className="h-8 w-8 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">Default</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => logoInputRef.current?.click()}
              disabled={logoUploading}
            >
              {logoUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload Logo
            </Button>
            
            {settings.login_logo_url && (
              <Button
                variant="outline"
                onClick={handleRemoveLogo}
                disabled={logoUploading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Accepted formats: PNG, JPG, WebP (max 10MB)
          </p>

          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
}
