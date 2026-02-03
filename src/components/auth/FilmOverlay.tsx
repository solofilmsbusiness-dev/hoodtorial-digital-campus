export function FilmOverlay() {
  return (
    <>
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50 z-10" />
      
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

      {/* Film sprocket holes - left side */}
      <div className="absolute left-0 top-0 bottom-0 w-12 z-20 flex flex-col justify-around py-8 bg-background/50">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="w-6 h-4 mx-3 rounded-sm bg-background border border-border/50"
          />
        ))}
      </div>

      {/* Film sprocket holes - right side */}
      <div className="absolute right-0 top-0 bottom-0 w-12 z-20 flex flex-col justify-around py-8 bg-background/50">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="w-6 h-4 mx-3 rounded-sm bg-background border border-border/50"
          />
        ))}
      </div>

      {/* Lens flare effect */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 z-10 pointer-events-none">
        <div className="w-full h-full bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      {/* Neon accent lines */}
      <div className="absolute bottom-0 left-12 right-12 h-1 z-20 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute top-0 left-12 right-12 h-1 z-20 bg-gradient-to-r from-transparent via-neon-purple/30 to-transparent" />
    </>
  );
}
