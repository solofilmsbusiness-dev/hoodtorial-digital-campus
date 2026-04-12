import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileContext } from "@/contexts/ProfileContext";
import { OnboardingStep1 } from "./OnboardingStep1";
import { OnboardingStep2, type Goal } from "./OnboardingStep2";
import { OnboardingStep3 } from "./OnboardingStep3";

interface OnboardingModalProps {
  onDone: () => void;
}

export function OnboardingModal({ onDone }: OnboardingModalProps) {
  const { user } = useAuth();
  const { updateProfile } = useProfileContext();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<Goal | null>(null);

  async function completeOnboarding(selectedGoal?: Goal) {
    if (!user) return;

    // goal is a new column not yet in generated types — cast to any for the update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = { onboarding_completed: true };
    if (selectedGoal) updates.goal = selectedGoal;

    await supabase.from("profiles").update(updates).eq("user_id", user.id).then(() => null).catch(() => null);

    // Also sync onboarding_completed into local profile state
    await updateProfile({ onboarding_completed: true });

    // localStorage fallback
    localStorage.setItem(`hu_onboarding_done_${user.id}`, "true");

    onDone();
  }

  function handleStep2Next(selected: Goal) {
    setGoal(selected);
    setStep(3);
  }

  const totalSteps = 3;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-8 shadow-xl relative">
        {/* Step indicator dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={[
                "h-2 rounded-full transition-all duration-300",
                i + 1 === step ? "w-6 bg-gold" : "w-2 bg-zinc-700",
              ].join(" ")}
            />
          ))}
        </div>

        {step === 1 && (
          <OnboardingStep1
            onNext={() => setStep(2)}
            onSkip={() => completeOnboarding()}
          />
        )}

        {step === 2 && (
          <OnboardingStep2
            onNext={handleStep2Next}
            onBack={() => setStep(1)}
            onSkip={() => completeOnboarding()}
          />
        )}

        {step === 3 && (
          <OnboardingStep3
            goal={goal}
            onComplete={() => completeOnboarding(goal ?? undefined)}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}
