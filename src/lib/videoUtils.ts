export type VideoType = 'youtube' | 'vimeo' | 'direct' | null;

export function getVideoType(url: string | null | undefined): VideoType {
  if (!url) return null;
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('vimeo.com')) {
    return 'vimeo';
  }
  if (url.match(/\.(mp4|webm|ogg)($|\?)/i)) {
    return 'direct';
  }
  return null;
}

export function getYouTubeId(url: string): string | null {
  // Handle youtube.com/watch?v=ID format
  const watchMatch = url.match(/youtube\.com\/watch\?v=([^&\s]+)/);
  if (watchMatch) return watchMatch[1];
  
  // Handle youtu.be/ID format
  const shortMatch = url.match(/youtu\.be\/([^?\s]+)/);
  if (shortMatch) return shortMatch[1];
  
  // Handle youtube.com/embed/ID format
  const embedMatch = url.match(/youtube\.com\/embed\/([^?\s]+)/);
  if (embedMatch) return embedMatch[1];
  
  return null;
}

export function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

export function getVimeoEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}`;
}
