import { Info, Lock, Video, CheckCircle2 } from "lucide-react";

interface ProgressionInfoProps {
  isEnrolled: boolean;
}

export function ProgressionInfo({ isEnrolled }: ProgressionInfoProps) {
  if (!isEnrolled) return null;

  return (
    <div className="border-2 border-primary/30 bg-primary/5 p-4 mb-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold text-foreground mb-2">Course Progression Rules</p>
          <ul className="space-y-1.5 text-muted-foreground">
            <li className="flex items-center gap-2">
              <Video className="w-3.5 h-3.5 text-primary" />
              Watch at least 90% of video lessons to unlock the next content
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
              Pass module quizzes before proceeding (80% required)
            </li>
            <li className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              Locked content unlocks as you complete previous lessons
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
