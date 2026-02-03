import { getVideoType, getYouTubeId, getVimeoId, getYouTubeEmbedUrl, getVimeoEmbedUrl } from "@/lib/videoUtils";

interface CourseVideoPreviewProps {
  url: string;
}

export function CourseVideoPreview({ url }: CourseVideoPreviewProps) {
  const videoType = getVideoType(url);

  if (!videoType) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
        Invalid video URL
      </div>
    );
  }

  if (videoType === "youtube") {
    const videoId = getYouTubeId(url);
    if (!videoId) return null;
    return (
      <div className="aspect-video rounded-lg overflow-hidden">
        <iframe
          src={getYouTubeEmbedUrl(videoId)}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (videoType === "vimeo") {
    const videoId = getVimeoId(url);
    if (!videoId) return null;
    return (
      <div className="aspect-video rounded-lg overflow-hidden">
        <iframe
          src={getVimeoEmbedUrl(videoId)}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (videoType === "direct") {
    return (
      <div className="aspect-video rounded-lg overflow-hidden">
        <video src={url} controls className="w-full h-full" />
      </div>
    );
  }

  return null;
}
