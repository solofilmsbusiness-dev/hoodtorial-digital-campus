import { courses as allCourses } from "@/data/courses";
import type { Goal } from "./OnboardingStep2";

const DEPT_COLOR: Record<string, string> = {
  cinematography: "text-primary bg-primary/10 border-primary/30",
  "post-production": "text-purple-400 bg-purple-400/10 border-purple-400/30",
  directing: "text-accent bg-accent/10 border-accent/30",
  production: "text-pink-400 bg-pink-400/10 border-pink-400/30",
  photography: "text-green-400 bg-green-400/10 border-green-400/30",
  "camera-systems": "text-blue-400 bg-blue-400/10 border-blue-400/30",
};

// Which departmentIds to include for each goal
const GOAL_DEPT_IDS: Record<Goal, string[]> = {
  cinematography: ["cinematography", "directing"],
  editing: ["post-production"],
  photography: ["photography"],
  all: ["cinematography", "post-production", "photography", "directing"],
};

// For "all", pin one specific starter course per dept so we get a curated set
// One beginner starter from each key department
const ALL_PINNED_CODES = ["HU-101", "HU-103", "HU-401", "HU-105"];

function getRecommended(goal: Goal) {
  const deptIds = GOAL_DEPT_IDS[goal];

  if (goal === "all") {
    return allCourses.filter((c) => ALL_PINNED_CODES.includes(c.code));
  }

  return allCourses.filter((c) => deptIds.includes(c.departmentId));
}

interface OnboardingStep3Props {
  goal: Goal | null;
  onComplete: () => void;
  onBack: () => void;
}

export function OnboardingStep3({ goal, onComplete, onBack }: OnboardingStep3Props) {
  const recommended = getRecommended(goal ?? "all");

  return (
    <div className="flex flex-col animate-scale-up">
      <h2 className="text-2xl font-bold text-white mb-2">Start here</h2>
      <p className="text-zinc-400 text-sm mb-5">
        Based on your goal, here's where we'd start you. Take the quick assessment to get your personalized degree path.
      </p>

      {/* Scrollable course list */}
      <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1 mb-6">
        {recommended.map((course) => (
          <div
            key={course.code}
            className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-4 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded border whitespace-nowrap ${DEPT_COLOR[course.departmentId] ?? "text-zinc-400 bg-zinc-700 border-zinc-600"}`}
                >
                  {course.department}
                </span>
                <span className="text-xs text-zinc-500 font-mono">{course.code}</span>
              </div>
              <p className="text-sm font-semibold text-white leading-tight truncate">
                {course.title}
              </p>
            </div>
            <button
              onClick={onComplete}
              className="shrink-0 btn-brutal bg-gold text-black text-xs font-bold px-3 py-1.5 hover:bg-gold-light transition-colors whitespace-nowrap"
            >
              Find My Courses →
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onComplete}
        className="btn-brutal w-full bg-zinc-800 text-white font-bold py-3 text-sm flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors"
      >
        Take the Assessment →
      </button>

      <button
        onClick={onBack}
        className="mt-4 text-sm text-zinc-500 hover:text-zinc-300 transition-colors self-start"
      >
        ← Back
      </button>
    </div>
  );
}
