import { useRef, useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface AdminBackgroundProps {
  pageKey: string;
  children: React.ReactNode;
}

export function AdminBackground({ pageKey, children }: AdminBackgroundProps) {
  const { settings } = useSiteSettings();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const videoUrl = settings[`admin_bg_${pageKey}_video`];
  const overlayOpacity = parseInt(settings[`admin_bg_${pageKey}_overlay`] || "85") / 100;

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoUrl]);

  return (
    <div className="relative min-h-full">
      {/* Video Background */}
      {videoUrl && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
          <video
            ref={videoRef}
            key={videoUrl}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
          {/* Dark overlay */}
          <div 
            className="absolute inset-0 bg-background"
            style={{ opacity: overlayOpacity }}
          />
        </div>
      )}
      
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
