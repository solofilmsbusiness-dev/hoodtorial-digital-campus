export function FilmOverlay() {
  return (
    <>
      {/* Center vignette overlay */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, hsl(var(--background) / 0.3) 50%, hsl(var(--background) / 0.7) 100%)'
        }}
      />
      
      {/* Scanlines effect */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.03]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              hsl(var(--foreground)) 2px,
              hsl(var(--foreground)) 4px
            )`,
          }}
        />
      </div>

      {/* Film grain noise */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.04] bg-noise" />

      {/* Lens flare effect */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 z-10 pointer-events-none">
        <div className="w-full h-full bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      {/* Additional lens flare - bottom left */}
      <div className="absolute bottom-1/3 left-1/4 w-48 h-48 z-10 pointer-events-none">
        <div className="w-full h-full bg-neon-purple/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Neon accent lines - top and bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 z-10 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-1 z-10 bg-gradient-to-r from-transparent via-neon-purple/20 to-transparent" />
    </>
  );
}
