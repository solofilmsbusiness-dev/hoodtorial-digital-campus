import { Play, Volume2, Maximize, Settings } from "lucide-react";
import type { Lesson } from "@/data/courses";
import { getVideoType, getYouTubeId, getVimeoId, getYouTubeEmbedUrl, getVimeoEmbedUrl } from "@/lib/videoUtils";

interface VideoPlayerProps {
  lesson: Lesson;
  videoUrl?: string | null;
}

export function VideoPlayer({ lesson, videoUrl }: VideoPlayerProps) {
  const url = videoUrl || (lesson as unknown as { video_url?: string }).video_url;
  const videoType = getVideoType(url);

  // YouTube embed
  if (videoType === 'youtube' && url) {
    const videoId = getYouTubeId(url);
    if (videoId) {
      return (
        <div className="relative w-full aspect-video bg-background border-2 border-border overflow-hidden">
          <iframe
            src={getYouTubeEmbedUrl(videoId)}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={lesson.title}
          />
        </div>
      );
    }
  }

  // Vimeo embed
  if (videoType === 'vimeo' && url) {
    const videoId = getVimeoId(url);
    if (videoId) {
      return (
        <div className="relative w-full aspect-video bg-background border-2 border-border overflow-hidden">
          <iframe
            src={getVimeoEmbedUrl(videoId)}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={lesson.title}
          />
        </div>
      );
    }
  }

  // Direct video file
  if (videoType === 'direct' && url) {
    return (
      <div className="relative w-full aspect-video bg-background border-2 border-border overflow-hidden">
        <video
          src={url}
          className="absolute inset-0 w-full h-full"
          controls
          controlsList="nodownload"
          playsInline
        >
          <source src={url} />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Placeholder for lessons without video
  return (
    <div className="relative w-full aspect-video bg-background border-2 border-border overflow-hidden">
      {/* Video placeholder with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-neon-purple/20" />
      
      {/* Center play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button className="w-20 h-20 bg-primary/90 hover:bg-primary flex items-center justify-center transition-all duration-200 hover:scale-105 group">
          <Play className="w-10 h-10 text-primary-foreground ml-1 group-hover:scale-110 transition-transform" fill="currentColor" />
        </button>
      </div>

      {/* Lesson info overlay */}
      <div className="absolute top-4 left-4 right-4">
        <div className="bg-background/80 backdrop-blur-sm border border-border p-3">
          <h3 className="font-bold text-foreground truncate">{lesson.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">Duration: {lesson.duration}</p>
        </div>
      </div>

      {/* Video controls placeholder */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4">
        {/* Progress bar */}
        <div className="h-1 bg-border mb-3 relative">
          <div className="absolute left-0 top-0 h-full w-0 bg-primary" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-foreground hover:text-primary transition-colors">
              <Play className="w-5 h-5" />
            </button>
            <button className="text-foreground hover:text-primary transition-colors">
              <Volume2 className="w-5 h-5" />
            </button>
            <span className="text-xs text-muted-foreground">0:00 / {lesson.duration}</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-foreground hover:text-primary transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="text-foreground hover:text-primary transition-colors">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
