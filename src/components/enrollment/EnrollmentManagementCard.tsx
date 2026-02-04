import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  MoreHorizontal, 
  ArrowRightLeft, 
  Trash2, 
  Clock,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DropCourseDialog } from "./DropCourseDialog";
import { SwapCourseDialog } from "./SwapCourseDialog";
import { formatDistanceToNow } from "date-fns";

interface Course {
  code: string;
  title: string;
  department: string;
  credits: number;
}

interface EnrollmentManagementCardProps {
  course: Course;
  enrolledAt: string;
  progress?: number;
  isInGracePeriod: boolean;
  gracePeriodHoursRemaining: number;
  remainingSwaps: number;
  maxSwaps: number;
  enrolledCourseCodes: string[];
  onDrop: (courseCode: string) => Promise<void>;
  onSwap: (fromCode: string, toCode: string) => Promise<void>;
}

export function EnrollmentManagementCard({
  course,
  enrolledAt,
  progress = 0,
  isInGracePeriod,
  gracePeriodHoursRemaining,
  remainingSwaps,
  maxSwaps,
  enrolledCourseCodes,
  onDrop,
  onSwap,
}: EnrollmentManagementCardProps) {
  const [dropDialogOpen, setDropDialogOpen] = useState(false);
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDrop = async () => {
    setIsLoading(true);
    await onDrop(course.code);
    setIsLoading(false);
    setDropDialogOpen(false);
  };

  const handleSwap = async (toCourseCode: string) => {
    setIsLoading(true);
    await onSwap(course.code, toCourseCode);
    setIsLoading(false);
    setSwapDialogOpen(false);
  };

  const formatTimeRemaining = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    return `${Math.round(hours)}h`;
  };

  return (
    <>
      <Card className="card-urban hover:border-primary transition-all">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {course.code}
                </span>
                {isInGracePeriod && (
                  <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Free drop: {formatTimeRemaining(gracePeriodHoursRemaining)}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-foreground line-clamp-1">
                {course.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {course.department} • {course.credits} credits
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSwapDialogOpen(true)}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Swap Course
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setDropDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Drop Course
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* Meta info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span>
              Enrolled {formatDistanceToNow(new Date(enrolledAt), { addSuffix: true })}
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              {remainingSwaps}/{maxSwaps} swaps
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button asChild className="flex-1" size="sm">
              <Link to={`/course/${course.code}`}>
                <Play className="mr-2 h-4 w-4" />
                Continue
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <DropCourseDialog
        open={dropDialogOpen}
        onOpenChange={setDropDialogOpen}
        courseCode={course.code}
        courseTitle={course.title}
        isInGracePeriod={isInGracePeriod}
        gracePeriodHoursRemaining={gracePeriodHoursRemaining}
        onConfirm={handleDrop}
        isLoading={isLoading}
      />

      <SwapCourseDialog
        open={swapDialogOpen}
        onOpenChange={setSwapDialogOpen}
        fromCourseCode={course.code}
        fromCourseTitle={course.title}
        enrolledCourseCodes={enrolledCourseCodes}
        isInGracePeriod={isInGracePeriod}
        gracePeriodHoursRemaining={gracePeriodHoursRemaining}
        remainingSwaps={remainingSwaps}
        maxSwaps={maxSwaps}
        onConfirm={handleSwap}
        isLoading={isLoading}
      />
    </>
  );
}