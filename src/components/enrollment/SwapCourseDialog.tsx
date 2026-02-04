import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRightLeft, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { useCourseStatus } from "@/hooks/useCourseStatus";
import { Skeleton } from "@/components/ui/skeleton";

interface SwapCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromCourseCode: string;
  fromCourseTitle: string;
  enrolledCourseCodes: string[];
  isInGracePeriod: boolean;
  gracePeriodHoursRemaining: number;
  remainingSwaps: number;
  maxSwaps: number;
  onConfirm: (toCourseCode: string) => void;
  isLoading?: boolean;
}

export function SwapCourseDialog({
  open,
  onOpenChange,
  fromCourseCode,
  fromCourseTitle,
  enrolledCourseCodes,
  isInGracePeriod,
  gracePeriodHoursRemaining,
  remainingSwaps,
  maxSwaps,
  onConfirm,
  isLoading = false,
}: SwapCourseDialogProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const { courses, isLoading: coursesLoading } = useCourseStatus();

  // Get available courses (not already enrolled, not coming soon)
  const availableCourses = courses.filter(
    (c) => !enrolledCourseCodes.includes(c.code) && c.code !== fromCourseCode && !c.isComingSoon
  );

  const formatTimeRemaining = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    }
    return `${Math.round(hours)} hours`;
  };

  const handleConfirm = () => {
    if (selectedCourse) {
      onConfirm(selectedCourse);
      setSelectedCourse("");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedCourse("");
    }
    onOpenChange(newOpen);
  };

  const canSwap = isInGracePeriod || remainingSwaps > 0;
  const selectedCourseDetails = availableCourses.find((c) => c.code === selectedCourse);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Swap Course
          </DialogTitle>
          <DialogDescription className="text-left space-y-4 pt-4">
            <p>
              Replace{" "}
              <span className="font-bold text-foreground">{fromCourseCode} - {fromCourseTitle}</span>{" "}
              with another course.
            </p>

            {/* Swap status */}
            <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-lg">
              <span className="text-sm text-muted-foreground">Swaps remaining:</span>
              <span className="font-bold text-foreground">
                {remainingSwaps} of {maxSwaps}
              </span>
            </div>

            {isInGracePeriod ? (
              <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                <div className="flex items-center gap-2 text-accent font-medium mb-2">
                  <Clock className="h-4 w-4" />
                  Free Swap Available
                </div>
                <p className="text-sm text-muted-foreground">
                  You're within the 24-hour grace period. This swap is{" "}
                  <span className="font-bold text-foreground">FREE</span> and won't count
                  against your swap limit.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Free swap expires in {formatTimeRemaining(gracePeriodHoursRemaining)}
                </p>
              </div>
            ) : canSwap ? (
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <div className="flex items-center gap-2 text-primary font-medium mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  This will use 1 swap
                </div>
                <p className="text-sm text-muted-foreground">
                  After this swap, you'll have {remainingSwaps - 1} swap(s) remaining for this enrollment slot.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <div className="flex items-center gap-2 text-destructive font-medium mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  No Swaps Remaining
                </div>
                <p className="text-sm text-muted-foreground">
                  You've used all your swaps for this enrollment. You can still drop the course to free up a slot.
                </p>
              </div>
            )}

            {/* Course selector */}
            {canSwap && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Select new course:
                </label>
                {coursesLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : availableCourses.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                    No other courses available to swap to.
                  </p>
                ) : (
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a course..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses.map((course) => (
                        <SelectItem key={course.code} value={course.code}>
                          <span className="font-medium">{course.code}</span>
                          <span className="text-muted-foreground"> - {course.title}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {selectedCourseDetails && (
                  <div className="p-3 bg-card border border-border rounded-lg mt-3">
                    <p className="font-bold text-sm text-foreground">{selectedCourseDetails.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedCourseDetails.department} • {selectedCourseDetails.level} • {selectedCourseDetails.credits} credits
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="p-3 bg-muted/50 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="text-lg">📁</span>
                Your progress on {fromCourseCode} will be saved.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !selectedCourse || !canSwap}
          >
            {isLoading ? "Swapping..." : "Confirm Swap"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}