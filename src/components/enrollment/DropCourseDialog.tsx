import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock } from "lucide-react";

interface DropCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseCode: string;
  courseTitle: string;
  isInGracePeriod: boolean;
  gracePeriodHoursRemaining: number;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DropCourseDialog({
  open,
  onOpenChange,
  courseCode,
  courseTitle,
  isInGracePeriod,
  gracePeriodHoursRemaining,
  onConfirm,
  isLoading = false,
}: DropCourseDialogProps) {
  const formatTimeRemaining = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    }
    return `${Math.round(hours)} hours`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Drop Course
          </DialogTitle>
          <DialogDescription className="text-left space-y-4 pt-4">
            <p>
              Are you sure you want to drop{" "}
              <span className="font-bold text-foreground">{courseCode} - {courseTitle}</span>?
            </p>

            {isInGracePeriod ? (
              <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                <div className="flex items-center gap-2 text-accent font-medium mb-2">
                  <Clock className="h-4 w-4" />
                  Free Drop Available
                </div>
                <p className="text-sm text-muted-foreground">
                  You're within the 24-hour grace period. This drop is{" "}
                  <span className="font-bold text-foreground">FREE</span> and won't count
                  against your swap limit.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Free drop expires in {formatTimeRemaining(gracePeriodHoursRemaining)}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  The 24-hour grace period has passed. Dropping this course will free up a slot
                  but your swap count for this course remains unchanged.
                </p>
              </div>
            )}

            <div className="p-3 bg-muted/50 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="text-lg">📁</span>
                Your progress will be saved. If you re-enroll later, you can pick up where you left off.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Dropping..." : "Drop Course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}