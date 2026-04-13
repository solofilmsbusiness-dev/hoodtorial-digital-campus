import { Lock, Unlock, BookOpen, CheckCircle2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course } from "@/data/courses";

interface EnrollmentCardProps {
  course: Course;
  isEnrolled: boolean;
  enrollmentStatus?: "active" | "completed" | "dropped";
  canEnroll: boolean;
  hasSubscription?: boolean;
  slotsRemaining: number;
  maxSlots: number;
  onEnroll: () => void;
  isLoading?: boolean;
  requiresSubscription?: boolean;
}

const COURSE_PRICE = 29.99;

export function EnrollmentCard({
  course,
  isEnrolled,
  enrollmentStatus,
  canEnroll,
  hasSubscription,
  slotsRemaining,
  maxSlots,
  onEnroll,
  isLoading,
}: EnrollmentCardProps) {
  const isCompleted = enrollmentStatus === "completed";
  const isActive = enrollmentStatus === "active";
  // Subscribed users with open slots can enroll for free; others pay per-course
  const canEnrollFree = hasSubscription && canEnroll;

  return (
    <div className="border-2 border-border bg-card p-6 space-y-4">
      {/* Enrollment Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Enrollment Status
        </span>
        {isCompleted && (
          <span className="px-3 py-1 text-xs font-bold uppercase bg-accent/20 text-accent border border-accent/50">
            Completed
          </span>
        )}
        {isActive && (
          <span className="px-3 py-1 text-xs font-bold uppercase bg-primary/20 text-primary border border-primary/50">
            Enrolled
          </span>
        )}
        {!isEnrolled && (
          <span className="px-3 py-1 text-xs font-bold uppercase bg-muted text-muted-foreground border border-border">
            Not Enrolled
          </span>
        )}
      </div>

      {/* Price badge for non-subscribers */}
      {!isEnrolled && !hasSubscription && (
        <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded">
          <span className="text-sm text-muted-foreground">One-time purchase</span>
          <span className="text-2xl font-black text-primary">${COURSE_PRICE.toFixed(2)}</span>
        </div>
      )}

      {/* Slot indicator for subscribed users */}
      {!isEnrolled && hasSubscription && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Active Course Slots</span>
            <span className={cn("font-bold", slotsRemaining === 0 ? "text-destructive" : "text-foreground")}>
              {maxSlots - slotsRemaining}/{maxSlots} used
            </span>
          </div>
          <div className="h-2 bg-muted border border-border">
            <div
              className={cn(
                "h-full transition-all",
                slotsRemaining === 0 ? "bg-destructive" : "bg-primary"
              )}
              style={{ width: `${((maxSlots - slotsRemaining) / maxSlots) * 100}%` }}
            />
          </div>
          {slotsRemaining === 0 && (
            <p className="text-xs text-destructive">
              Complete an active course to free up a slot, or purchase this course individually.
            </p>
          )}
        </div>
      )}

      {/* Enroll button */}
      {!isEnrolled && (
        <button
          onClick={onEnroll}
          disabled={isLoading}
          className="w-full py-3 font-bold transition-all flex items-center justify-center gap-2 btn-brutal"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⏳</span>
              {canEnrollFree ? "Enrolling..." : "Redirecting..."}
            </>
          ) : canEnrollFree ? (
            <>
              <Unlock className="w-5 h-5" />
              Enroll in Course
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Enroll — ${COURSE_PRICE.toFixed(2)}
            </>
          )}
        </button>
      )}

      {/* What's included — shown for non-subscribers considering purchase */}
      {!isEnrolled && !hasSubscription && (
        <ul className="space-y-1.5 pt-1">
          {[
            "Lifetime access to all lessons",
            "Module quizzes & final exam",
            "Certificate of completion",
          ].map((feat) => (
            <li key={feat} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
              {feat}
            </li>
          ))}
        </ul>
      )}

      {/* Course info for enrolled users */}
      {isEnrolled && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3 text-sm">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              {course.credits} credits upon completion
            </span>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span className="text-accent font-medium">All content unlocked</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
