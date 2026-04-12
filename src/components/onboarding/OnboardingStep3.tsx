import { Link } from "react-router-dom";
import type { Goal } from "./OnboardingStep2";

interface CourseRec {
  code: string;
  title: string;
  department: string;
  departmentColorClass: string;
  description: string;
}

const COURSE_MAP: Record<Goal, CourseRec> = {
  cinematography: {
    code: "HU-101",
    title: "iPhone Cinematography Fundamentals",
    department: "Cinematography",
    departmentColorClass: "text-primary bg-primary/10 border-primary/30",
    description:
      "Master the basics of shooting cinematic footage on your iPhone. Learn optimal settings, stabilization techniques, and composition rules.",
  },
  editing: {
    code: "HU-103",
    title: "Editing Fundamentals",
    department: "Post-Production",
    departmentColorClass: "text-purple-400 bg-purple-400/10 border-purple-400/30",
    description:
      "Learn the core editing principles and workflow used by professional filmmakers. Cut your first film from raw footage to finished cut.",
  },
  photography: {
    code: "HU-401",
    title: "Photography Fundamentals",
    department: "Photography",
    departmentColorClass: "text-green-400 bg-green-400/10 border-green-400/30",
    description:
      "Capture stunning images with professional techniques. Understand exposure, composition, and light to take your photography to the next level.",
  },
  all: {
    code: "HU-101",
    title: "iPhone Cinematography Fundamentals",
    department: "Cinematography",
    departmentColorClass: "text-primary bg-primary/10 border-primary/30",
    description:
      "Master the basics of shooting cinematic footage on your iPhone. Learn optimal settings, stabilization techniques, and composition rules.",
  },
};

interface OnboardingStep3Props {
  goal: Goal | null;
  onComplete: () => void;
  onBack: () => void;
}

export function OnboardingStep3({ goal, onComplete, onBack }: OnboardingStep3Props) {
  const rec = COURSE_MAP[goal ?? "all"];

  return (
    <div className="flex flex-col animate-scale-up">
      <h2 className="text-2xl font-bold text-white mb-2">Start here</h2>
      <p className="text-zinc-400 text-sm mb-6">
        Based on your goals, we recommend this course to kick things off.
      </p>

      <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-5 mb-8">
        <span
          className={`inline-block text-xs font-semibold px-2 py-0.5 rounded border mb-3 ${rec.departmentColorClass}`}
        >
          {rec.department}
        </span>
        <p className="text-xs text-zinc-500 font-mono mb-1">{rec.code}</p>
        <h3 className="text-lg font-bold text-white mb-2">{rec.title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{rec.description}</p>
      </div>

      <Link
        to={`/course/${rec.code}`}
        onClick={onComplete}
        className="btn-brutal w-full bg-gold text-black font-bold py-3 text-base flex items-center justify-center gap-2 hover:bg-gold-light transition-colors mb-3"
      >
        Start This Course →
      </Link>

      <Link
        to="/academics"
        onClick={onComplete}
        className="btn-brutal w-full bg-zinc-800 text-white font-bold py-3 text-base flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors"
      >
        Browse All Courses
      </Link>

      <button
        onClick={onBack}
        className="mt-4 text-sm text-zinc-500 hover:text-zinc-300 transition-colors self-start"
      >
        ← Back
      </button>
    </div>
  );
}
