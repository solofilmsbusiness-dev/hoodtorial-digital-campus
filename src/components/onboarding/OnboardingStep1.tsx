interface OnboardingStep1Props {
  onNext: () => void;
  onSkip: () => void;
}

export function OnboardingStep1({ onNext, onSkip }: OnboardingStep1Props) {
  return (
    <div className="flex flex-col items-center text-center animate-scale-up">
      <img
        src="/hu-logo.png"
        alt="Hoodtorial University"
        className="h-20 w-auto mb-8 object-contain"
      />

      <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
        Welcome to Hoodtorial University
      </h1>
      <p className="text-zinc-300 text-base leading-relaxed mb-10 max-w-sm">
        Where Hustle Meets Hollywood. You're now part of an elite community of creators.
      </p>

      <button
        onClick={onNext}
        className="btn-brutal w-full bg-gold text-black font-bold py-3 px-8 text-base flex items-center justify-center gap-2 hover:bg-gold-light transition-colors"
      >
        Get Started →
      </button>

      <button
        onClick={onSkip}
        className="mt-4 text-sm text-zinc-500 hover:text-zinc-300 transition-colors self-end"
      >
        Skip
      </button>
    </div>
  );
}
