import { useEffect, useRef, useCallback, useState } from "react";
import { Play, Volume2, Maximize, Settings, CheckCircle2 } from "lucide-react";
import Player from "@vimeo/player";
import type { Lesson } from "@/data/courses";
import { getVideoType, getYouTubeId, getVimeoId, getYouTubeEmbedUrl, getVimeoEmbedUrl } from "@/lib/videoUtils";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface VideoPlayerProps {
  lesson: Lesson;
  videoUrl?: string | null;
  onProgress?: (watchedSeconds: number, durationSeconds: number) => void;
  initialTime?: number;
  watchPercentage?: number;
  isCompleted?: boolean;
}

export function VideoPlayer({ 
  lesson, 
  videoUrl, 
  onProgress,
  initialTime = 0,
  watchPercentage = 0,
  isCompleted = false,
}: VideoPlayerProps) {
  const url = videoUrl || (lesson as unknown as { video_url?: string }).video_url;
  const videoType = getVideoType(url);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const vimeoPlayerRef = useRef<Player | null>(null);
  const youtubeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [hasSetInitialTime, setHasSetInitialTime] = useState(false);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Direct video tracking
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || !onProgress) return;
    const watched = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    if (duration > 0) {
      onProgress(watched, duration);
    }
  }, [onProgress]);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    // Set initial time for resume
    if (initialTime > 0 && !hasSetInitialTime) {
      videoRef.current.currentTime = initialTime;
      setHasSetInitialTime(true);
    }
  }, [initialTime, hasSetInitialTime]);

  // YouTube tracking via postMessage
  useEffect(() => {
    if (videoType !== "youtube" || !iframeRef.current || !onProgress) return;

    const iframe = iframeRef.current;
    let player: YT.Player | null = null;

    // Load YouTube IFrame API if not loaded
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScript = document.getElementsByTagName("script")[0];
      firstScript.parentNode?.insertBefore(tag, firstScript);
    }

    const onYouTubeReady = () => {
      if (!iframe.id) {
        iframe.id = `yt-player-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      player = new window.YT.Player(iframe.id, {
        events: {
          onReady: (event: YT.PlayerEvent) => {
            // Set initial time
            if (initialTime > 0 && !hasSetInitialTime) {
              event.target.seekTo(initialTime, true);
              setHasSetInitialTime(true);
            }
            // Start polling for progress
            youtubeIntervalRef.current = setInterval(() => {
              if (player && typeof player.getCurrentTime === "function") {
                const currentTime = player.getCurrentTime();
                const duration = player.getDuration();
                if (duration > 0) {
                  onProgress(currentTime, duration);
                }
              }
            }, 1000);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      onYouTubeReady();
    } else {
      window.onYouTubeIframeAPIReady = onYouTubeReady;
    }

    return () => {
      if (youtubeIntervalRef.current) {
        clearInterval(youtubeIntervalRef.current);
      }
    };
  }, [videoType, onProgress, initialTime, hasSetInitialTime]);

  // Vimeo tracking
  useEffect(() => {
    if (videoType !== "vimeo" || !iframeRef.current || !onProgress) return;

    const player = new Player(iframeRef.current);
    vimeoPlayerRef.current = player;

    // Set initial time
    if (initialTime > 0 && !hasSetInitialTime) {
      player.setCurrentTime(initialTime).then(() => {
        setHasSetInitialTime(true);
      });
    }

    player.on("timeupdate", (data) => {
      onProgress(data.seconds, data.duration);
    });

    return () => {
      player.off("timeupdate");
      vimeoPlayerRef.current = null;
    };
  }, [videoType, onProgress, initialTime, hasSetInitialTime]);

  // Reset hasSetInitialTime when lesson changes
  useEffect(() => {
    setHasSetInitialTime(false);
  }, [lesson.id]);

  const renderProgressOverlay = () => {
    if (!onProgress) return null;

    return (
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background/90 to-transparent pointer-events-none">
        <div className="flex items-center gap-2">
          <Progress value={watchPercentage} className="h-1.5 flex-1" />
          <span className="text-xs font-bold text-foreground">
            {watchPercentage}%
          </span>
          {isCompleted && (
            <CheckCircle2 className="w-4 h-4 text-accent" />
          )}
        </div>
        {initialTime > 0 && watchPercentage > 0 && watchPercentage < 90 && (
          <div className="text-xs text-muted-foreground mt-1">
            Resuming from {formatTime(initialTime)}
          </div>
        )}
      </div>
    );
  };

  // YouTube embed
  if (videoType === "youtube" && url) {
    const videoId = getYouTubeId(url);
    if (videoId) {
      // Enable JS API for YouTube
      const embedUrl = `${getYouTubeEmbedUrl(videoId)}&enablejsapi=1&origin=${window.location.origin}`;
      return (
        <div className="relative w-full aspect-video bg-background border-2 border-border overflow-hidden">
          <iframe
            ref={iframeRef}
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={lesson.title}
          />
          {renderProgressOverlay()}
        </div>
      );
    }
  }

  // Vimeo embed
  if (videoType === "vimeo" && url) {
    const videoId = getVimeoId(url);
    if (videoId) {
      return (
        <div className="relative w-full aspect-video bg-background border-2 border-border overflow-hidden">
          <iframe
            ref={iframeRef}
            src={getVimeoEmbedUrl(videoId)}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={lesson.title}
          />
          {renderProgressOverlay()}
        </div>
      );
    }
  }

  // Direct video file
  if (videoType === "direct" && url) {
    return (
      <div className="relative w-full aspect-video bg-background border-2 border-border overflow-hidden">
        <video
          ref={videoRef}
          src={url}
          className="absolute inset-0 w-full h-full"
          controls
          controlsList="nodownload"
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        >
          <source src={url} />
          Your browser does not support the video tag.
        </video>
        {renderProgressOverlay()}
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

// TypeScript declarations for YouTube IFrame API
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          events?: {
            onReady?: (event: YT.PlayerEvent) => void;
            onStateChange?: (event: YT.OnStateChangeEvent) => void;
          };
        }
      ) => YT.Player;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

declare namespace YT {
  interface Player {
    getCurrentTime(): number;
    getDuration(): number;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
  }
  interface PlayerEvent {
    target: Player;
  }
  interface OnStateChangeEvent {
    data: number;
  }
}
