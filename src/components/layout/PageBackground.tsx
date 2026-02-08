import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageBackgroundProps {
  pageKey: string;
  children: React.ReactNode;
}

export function PageBackground({ pageKey, children }: PageBackgroundProps) {
  const { settings } = useSiteSettings();
  const isMobile = useIsMobile();
  
  const videoUrl = settings[`page_bg_${pageKey}_video`];
  const overlayOpacity = parseInt(settings[`page_bg_${pageKey}_overlay`] || "85") / 100;

  return (
    <div className="relative min-h-full">
      {/* Video Background - skip on mobile to prevent crashes */}
      {videoUrl && !isMobile && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
          <video
            key={videoUrl}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.15 }}
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
