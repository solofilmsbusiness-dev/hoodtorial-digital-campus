import { useState } from "react";

export type Goal = "cinematography" | "editing" | "photography" | "all";

interface GoalOption {
  id: Goal;
  emoji: string;
  label: string;
}

const GOALS: GoalOption[] = [
  { id: "cinematography", emoji: "🎬", label: "Cinematography & Directing" },
  { id: "editing", emoji: "✂️", label: "Editing & Post-Production" },
  { id: "photography", emoji: "📷", label: "Photography" },
  { id: "all", emoji: "🚀", label: "All of the above" },
];

interface OnboardingStep2Props {
  onNext: (goal: Goal) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function OnboardingStep2({ onNext, onBack, onSkip }: OnboardingStep2Props) {
  const [selected, setSelected] = useState<Goal | null>(null);

  return (
    <div className="flex flex-col animate-scale-up">
      <h2 className="text-2xl font-bold text-white mb-2">What are you here to master?</h2>
      <p className="text-zinc-400 text-sm mb-6">Pick the path that fits your creative vision.</p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {GOALS.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelected(g.id)}
            className={[
              "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all duration-150",
              selected === g.id
                ? "border-gold bg-gold/10 text-white"
                : "border-zinc-700 hover:border-gold/60 text-zinc-300 hover:text-white",
            ].join(" ")}
          >
            <span className="text-2xl">{g.emoji}</span>
            <span className="text-xs font-semibold leading-tight">{g.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => selected && onNext(selected)}
        disabled={!selected}
        className="btn-brutal w-full bg-gold text-black font-bold py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gold-light transition-colors"
      >
        Next →
      </button>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={onBack}
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onSkip}
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
