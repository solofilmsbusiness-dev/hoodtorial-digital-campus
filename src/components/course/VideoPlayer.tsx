import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { Play, Volume2, Maximize, Settings, CheckCircle2, RotateCcw } from "lucide-react";
import Player from "@vimeo/player";
import type { Lesson } from "@/data/courses";
import { getVideoType, getYouTubeId, getVimeoId, getYouTubeEmbedUrl, getVimeoEmbedUrl } from "@/lib/videoUtils";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

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
  const youtubePlayerRef = useRef<YT.Player | null>(null);
  const [hasSetInitialTime, setHasSetInitialTime] = useState(false);
  const [showResumeIndicator, setShowResumeIndicator] = useState(false);
  const resumeIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Stable iframe ID based on lesson.id
  const iframeId = useMemo(() => 
    `yt-player-${lesson.id.replace(/[^a-zA-Z0-9]/g, '')}`, 
    [lesson.id]
  );

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
      // Show resume indicator
      setShowResumeIndicator(true);
      resumeIndicatorTimeoutRef.current = setTimeout(() => {
        setShowResumeIndicator(false);
      }, 4000);
    }
  }, [initialTime, hasSetInitialTime]);

  // YouTube tracking with robust initialization
  useEffect(() => {
    if (videoType !== "youtube" || !onProgress) return;

    let isDestroyed = false;
    let apiPollId: NodeJS.Timeout | null = null;
    let iframePollId: NodeJS.Timeout | null = null;

    const startProgressPolling = (player: YT.Player) => {
      // Clear any existing interval
      if (youtubeIntervalRef.current) {
        clearInterval(youtubeIntervalRef.current);
      }
      
      youtubeIntervalRef.current = setInterval(() => {
        if (isDestroyed) return;
        try {
          if (player && typeof player.getCurrentTime === "function") {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            if (duration > 0) {
              console.log("[VideoPlayer] YouTube progress:", { currentTime: Math.round(currentTime), duration: Math.round(duration) });
              onProgress(currentTime, duration);
            }
          }
        } catch (err) {
          console.error("[VideoPlayer] Error getting YouTube time:", err);
        }
      }, 1000);
    };

    const initPlayer = () => {
      if (isDestroyed) return;
      
      const iframeElement = document.getElementById(iframeId);
      if (!iframeElement) {
        console.error("[VideoPlayer] Iframe not found with id:", iframeId);
        return;
      }

      try {
        console.log("[VideoPlayer] Initializing YouTube player for:", iframeId);
        
        const player = new window.YT.Player(iframeId, {
          events: {
            onReady: (event: YT.PlayerEvent) => {
              if (isDestroyed) return;
              console.log("[VideoPlayer] YouTube player ready");
              youtubePlayerRef.current = player;
              
              // Set initial time
              if (initialTime > 0 && !hasSetInitialTime) {
                event.target.seekTo(initialTime, true);
                setHasSetInitialTime(true);
                setShowResumeIndicator(true);
                resumeIndicatorTimeoutRef.current = setTimeout(() => {
                  setShowResumeIndicator(false);
                }, 4000);
              }
              
              // Start polling for progress
              startProgressPolling(player);
            },
            onStateChange: (event: YT.OnStateChangeEvent) => {
              if (isDestroyed) return;
              console.log("[VideoPlayer] YouTube state change:", event.data);
              
              // If playing and we don't have polling running, start it
              if (event.data === 1 && !youtubeIntervalRef.current && youtubePlayerRef.current) {
                startProgressPolling(youtubePlayerRef.current);
              }
            },
            onError: (event: { data: number }) => {
              console.error("[VideoPlayer] YouTube player error:", event.data);
            },
          },
        });

        youtubePlayerRef.current = player;
      } catch (err) {
        console.error("[VideoPlayer] Failed to init YouTube player:", err);
      }
    };

    const checkAPIReady = () => {
      if (window.YT && window.YT.Player && typeof window.YT.Player === 'function') {
        console.log("[VideoPlayer] YouTube API ready, initializing player");
        initPlayer();
      } else {
        // Load API if not present
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
          console.log("[VideoPlayer] Loading YouTube API script");
          const tag = document.createElement("script");
          tag.src = "https://www.youtube.com/iframe_api";
          document.head.appendChild(tag);
        }
        
        // Poll for API ready (more reliable than global callback)
        apiPollId = setInterval(() => {
          if (isDestroyed) {
            if (apiPollId) clearInterval(apiPollId);
            return;
          }
          if (window.YT && window.YT.Player && typeof window.YT.Player === 'function') {
            console.log("[VideoPlayer] YouTube API became ready");
            if (apiPollId) clearInterval(apiPollId);
            initPlayer();
          }
        }, 100);
      }
    };

    // Wait for iframe to be in DOM before initializing
    iframePollId = setInterval(() => {
      if (isDestroyed) {
        if (iframePollId) clearInterval(iframePollId);
        return;
      }
      if (document.getElementById(iframeId)) {
        console.log("[VideoPlayer] Iframe found in DOM:", iframeId);
        if (iframePollId) clearInterval(iframePollId);
        checkAPIReady();
      }
    }, 50);

    return () => {
      isDestroyed = true;
      if (iframePollId) clearInterval(iframePollId);
      if (apiPollId) clearInterval(apiPollId);
      if (youtubeIntervalRef.current) {
        clearInterval(youtubeIntervalRef.current);
        youtubeIntervalRef.current = null;
      }
      youtubePlayerRef.current = null;
    };
  }, [videoType, onProgress, iframeId, initialTime, hasSetInitialTime]);

  // Vimeo tracking
  useEffect(() => {
    if (videoType !== "vimeo" || !iframeRef.current || !onProgress) return;

    const player = new Player(iframeRef.current);
    vimeoPlayerRef.current = player;

    // Set initial time
    if (initialTime > 0 && !hasSetInitialTime) {
      player.setCurrentTime(initialTime).then(() => {
        setHasSetInitialTime(true);
        // Show resume indicator
        setShowResumeIndicator(true);
        resumeIndicatorTimeoutRef.current = setTimeout(() => {
          setShowResumeIndicator(false);
        }, 4000);
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

  // Reset states when lesson changes
  useEffect(() => {
    setHasSetInitialTime(false);
    setShowResumeIndicator(false);
    if (resumeIndicatorTimeoutRef.current) {
      clearTimeout(resumeIndicatorTimeoutRef.current);
    }
  }, [lesson.id]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (resumeIndicatorTimeoutRef.current) {
        clearTimeout(resumeIndicatorTimeoutRef.current);
      }
    };
  }, []);

  const renderResumeIndicator = () => {
    if (!showResumeIndicator || initialTime <= 0) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-primary border-2 border-primary-foreground/20 shadow-lg">
            <RotateCcw className="w-4 h-4 text-primary-foreground animate-spin" style={{ animationDuration: '2s' }} />
            <span className="text-sm font-bold text-primary-foreground">
              Resuming from {formatTime(initialTime)}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

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
            id={iframeId}
            ref={iframeRef}
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={lesson.title}
          />
          {renderResumeIndicator()}
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
          {renderResumeIndicator()}
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
        {renderResumeIndicator()}
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
            onError?: (event: YT.OnErrorEvent) => void;
          };
        }
      ) => YT.Player;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
      };
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
  interface OnErrorEvent {
    data: number;
  }
}
