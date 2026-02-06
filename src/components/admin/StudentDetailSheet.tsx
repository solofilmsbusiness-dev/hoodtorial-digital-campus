import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Ban,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  GraduationCap,
  Loader2,
  MapPin,
  RotateCcw,
  ShieldOff,
  Target,
  Trash2,
  Trophy,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useStudentDetails, type StudentDetails } from "@/hooks/useAdminStudents";
import { useAdminQuizManagement, type QuizResultDetail } from "@/hooks/useAdminQuizManagement";
import { useStudentAnalytics } from "@/hooks/useStudentAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { StudentAnalyticsCard } from "./StudentAnalyticsCard";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AppRole = Database["public"]["Enums"]["app_role"];

interface StudentDetailSheetProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManageRoles: (userId: string, roles: AppRole[], displayName: string) => void;
}

type ConfirmAction = 
  | { type: "removeEnrollment"; courseCode: string; courseTitle: string }
  | { type: "resetQuiz"; quizResultId: string; quizId: string }
  | { type: "resetAllQuizzes" }
  | { type: "removeAllEnrollments" }
  | { type: "resetAllProgress" }
  | { type: "banUser" }
  | { type: "unbanUser" }
  | { type: "deleteUser" };

export function StudentDetailSheet({
  userId,
  open,
  onOpenChange,
  onManageRoles,
}: StudentDetailSheetProps) {
  const { user: currentUser } = useAuth();
  const { data: student, isLoading, refetch } = useStudentDetails(userId);
  const { 
    fetchQuizResultsWithAnswers, 
    deleteQuizResult, 
    deleteAllQuizResults, 
    deleteEnrollment,
    deleteAllEnrollments,
    deleteAllProgress,
    banUser,
    unbanUser,
    deleteUser,
    isDeleting 
  } = useAdminQuizManagement();

  const [quizResults, setQuizResults] = useState<QuizResultDetail[]>([]);
  const [loadingQuizResults, setLoadingQuizResults] = useState(false);
  const [expandedQuizzes, setExpandedQuizzes] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<ConfirmAction | null>(null);
  const [banReason, setBanReason] = useState("");

  // Calculate analytics from student data
  const analyticsInput = useMemo(() => {
    if (!student) return null;
    return {
      progress: student.progressData || [],
      quizResults: student.quizResultsData || [],
      enrollments: student.enrollments.map((e) => ({
        course_code: e.courseCode,
        status: e.status,
      })),
    };
  }, [student]);

  const metrics = useStudentAnalytics(analyticsInput);

  // Fetch detailed quiz results when sheet opens
  useEffect(() => {
    if (open && userId) {
      setLoadingQuizResults(true);
      fetchQuizResultsWithAnswers(userId)
        .then(setQuizResults)
        .catch((err) => {
          console.error("Error fetching quiz results:", err);
          toast.error("Failed to load quiz details");
        })
        .finally(() => setLoadingQuizResults(false));
    } else {
      setQuizResults([]);
      setExpandedQuizzes(new Set());
      setBanReason("");
    }
  }, [open, userId, fetchQuizResultsWithAnswers]);

  const getInitials = (name: string | null, id: string) => {
    if (name) {
      return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return id.slice(0, 2).toUpperCase();
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "professor":
        return "default";
      case "moderator":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "graduate":
        return "text-yellow-500";
      case "sophomore":
        return "text-blue-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string | null, trialEndsAt: string | null) => {
    if (status === "active") {
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Paid</Badge>;
    }
    if (status === "trial" && trialEndsAt) {
      const isExpired = new Date(trialEndsAt) < new Date();
      if (isExpired) {
        return <Badge variant="destructive">Expired</Badge>;
      }
      return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Trial</Badge>;
    }
    return <Badge variant="outline">No Sub</Badge>;
  };

  const toggleQuizExpanded = (quizResultId: string) => {
    setExpandedQuizzes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(quizResultId)) {
        newSet.delete(quizResultId);
      } else {
        newSet.add(quizResultId);
      }
      return newSet;
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog || !userId) return;

    try {
      if (confirmDialog.type === "removeEnrollment") {
        const result = await deleteEnrollment(userId, confirmDialog.courseCode);
        if (result.success) {
          toast.success(`Removed enrollment from ${confirmDialog.courseTitle}`);
          refetch();
        } else {
          throw result.error;
        }
      } else if (confirmDialog.type === "resetQuiz") {
        const result = await deleteQuizResult(confirmDialog.quizResultId, userId);
        if (result.success) {
          toast.success("Quiz result reset successfully");
          setQuizResults((prev) => prev.filter((r) => r.id !== confirmDialog.quizResultId));
          refetch();
        } else {
          throw result.error;
        }
      } else if (confirmDialog.type === "resetAllQuizzes") {
        const result = await deleteAllQuizResults(userId);
        if (result.success) {
          toast.success("All quiz results reset successfully");
          setQuizResults([]);
          refetch();
        } else {
          throw result.error;
        }
      } else if (confirmDialog.type === "removeAllEnrollments") {
        const result = await deleteAllEnrollments(userId);
        if (result.success) {
          toast.success("Removed all enrollments");
          refetch();
        } else {
          throw result.error;
        }
      } else if (confirmDialog.type === "resetAllProgress") {
        const result = await deleteAllProgress(userId);
        if (result.success) {
          toast.success("All lesson progress reset");
          refetch();
        } else {
          throw result.error;
        }
      } else if (confirmDialog.type === "banUser") {
        if (!banReason.trim()) {
          toast.error("Please provide a reason for the ban");
          return;
        }
        const result = await banUser(userId, banReason.trim(), currentUser?.id || "");
        if (result.success) {
          toast.success("User has been banned");
          setBanReason("");
          refetch();
        } else {
          throw result.error;
        }
      } else if (confirmDialog.type === "unbanUser") {
        const result = await unbanUser(userId);
        if (result.success) {
          toast.success("User has been unbanned");
          refetch();
        } else {
          throw result.error;
        }
      } else if (confirmDialog.type === "deleteUser") {
        const result = await deleteUser(userId);
        if (result.success) {
          toast.success("User has been permanently deleted");
          onOpenChange(false); // Close the sheet after deletion
        } else {
          throw result.error;
        }
      }
    } catch (error) {
      console.error("Action failed:", error);
      toast.error("Action failed. Please try again.");
    } finally {
      setConfirmDialog(null);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Student Details</SheetTitle>
          </SheetHeader>

          {isLoading ? (
            <div className="space-y-4 mt-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : student ? (
            <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
              <div className="space-y-6">
                {/* Banned Banner */}
                {student.isBanned && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-start gap-3">
                      <Ban className="h-5 w-5 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-destructive">Account Banned</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {student.banReason || "No reason provided"}
                        </p>
                        {student.bannedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Banned on {format(new Date(student.bannedAt), "MMM d, yyyy")}
                          </p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => setConfirmDialog({ type: "unbanUser" })}
                          disabled={isDeleting}
                        >
                          <ShieldOff className="h-4 w-4 mr-1.5" />
                          Unban User
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Header */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={student.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(student.displayName, student.id)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-lg truncate">
                        {student.displayName || "Unnamed Student"}
                      </h3>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/profile/${student.id}`}>
                          <ExternalLink className="h-4 w-4 mr-1.5" />
                          View Profile
                        </Link>
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {student.location && (
                        <>
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{student.location}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>Member since {format(new Date(student.enrolledAt), "MMM yyyy")}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <Badge variant="outline" className={getTierColor(student.membershipTier)}>
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {student.membershipTier}
                      </Badge>
                      {student.roles.map((role) => (
                        <Badge key={role} variant={getRoleBadgeVariant(role)}>
                          {role}
                        </Badge>
                      ))}
                      {student.isBanned && (
                        <Badge variant="destructive">
                          <Ban className="h-3 w-3 mr-1" />
                          Banned
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {student.bio && (
                  <p className="text-sm text-muted-foreground">{student.bio}</p>
                )}

                <Separator />

                {/* Learning Analytics */}
                {metrics && (
                  <>
                    <StudentAnalyticsCard metrics={metrics} />
                    <Separator />
                    <AIInsightsPanel
                      studentName={student.displayName || "Student"}
                      studentId={student.id}
                      metrics={metrics}
                      enrolledCourses={student.enrollments.map((e) => e.courseCode)}
                    />
                    <Separator />
                  </>
                )}

                {/* Subscription Status */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Subscription
                  </h4>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(student.subscriptionStatus, student.trialEndsAt)}
                      </div>
                      {student.subscriptionStatus === "trial" && student.trialEndsAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(student.trialEndsAt) > new Date()
                            ? `Ends ${format(new Date(student.trialEndsAt), "MMM d, yyyy")}`
                            : `Ended ${format(new Date(student.trialEndsAt), "MMM d, yyyy")}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Assessment Results */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Assessment Results
                  </h4>
                  {student.assessmentResult ? (
                    <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Experience Level</span>
                        <Badge variant="secondary">{student.assessmentResult.experienceLevel}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Score</span>
                        <span className="font-medium">{student.assessmentResult.totalScore}/100</span>
                      </div>
                      {student.assessmentResult.interests.length > 0 && (
                        <div>
                          <span className="text-sm text-muted-foreground">Interests</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {student.assessmentResult.interests.map((interest) => (
                              <Badge key={interest} variant="outline" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
                      No assessment completed yet
                    </p>
                  )}
                </div>

                <Separator />

                {/* Enrolled Courses with Remove Action */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Enrolled Courses ({student.enrollments.length})
                    </h4>
                    {student.enrollments.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setConfirmDialog({ type: "removeAllEnrollments" })}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Remove All
                      </Button>
                    )}
                  </div>
                  {student.enrollments.length > 0 ? (
                    <div className="space-y-2">
                      {student.enrollments.map((enrollment) => (
                        <div
                          key={enrollment.courseCode}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{enrollment.courseCode}</p>
                            <p className="text-xs text-muted-foreground truncate">{enrollment.courseTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              Enrolled {format(new Date(enrollment.enrolledAt), "MMM d, yyyy")}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={enrollment.status === "active" ? "default" : "secondary"}
                              className="capitalize"
                            >
                              {enrollment.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setConfirmDialog({
                                type: "removeEnrollment",
                                courseCode: enrollment.courseCode,
                                courseTitle: enrollment.courseTitle,
                              })}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
                      No courses enrolled
                    </p>
                  )}
                </div>

                <Separator />

                {/* Quiz Results with Reset Actions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Quiz Results
                    </h4>
                    {quizResults.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setConfirmDialog({ type: "resetAllQuizzes" })}
                        disabled={isDeleting}
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                        Reset All
                      </Button>
                    )}
                  </div>

                  {/* Quiz Stats Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="flex items-center justify-center gap-1 text-green-500">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-semibold text-lg">{student.quizStats.passed}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Passed</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="flex items-center justify-center gap-1 text-red-500">
                        <XCircle className="h-4 w-4" />
                        <span className="font-semibold text-lg">{student.quizStats.failed}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <span className="font-semibold text-lg">{student.quizStats.passRate}%</span>
                      <p className="text-xs text-muted-foreground">Pass Rate</p>
                    </div>
                  </div>

                  {/* Detailed Quiz Results */}
                  {loadingQuizResults ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : quizResults.length > 0 ? (
                    <div className="space-y-2">
                      {quizResults.map((result) => (
                        <Collapsible
                          key={result.id}
                          open={expandedQuizzes.has(result.id)}
                          onOpenChange={() => toggleQuizExpanded(result.id)}
                        >
                          <div className="rounded-lg border bg-card">
                            <div className="flex items-center justify-between p-3">
                              <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left">
                                {expandedQuizzes.has(result.id) ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                                <div>
                                  <p className="font-medium text-sm">
                                    {result.courseCode} - {result.quizId}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(result.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                    {result.attemptNumber && ` • Attempt #${result.attemptNumber}`}
                                  </p>
                                </div>
                              </CollapsibleTrigger>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={result.passed ? "default" : "destructive"}
                                  className={cn(
                                    result.passed
                                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                                      : ""
                                  )}
                                >
                                  {result.score}/{result.totalQuestions} ({Math.round((result.score / result.totalQuestions) * 100)}%)
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDialog({
                                      type: "resetQuiz",
                                      quizResultId: result.id,
                                      quizId: result.quizId,
                                    });
                                  }}
                                  disabled={isDeleting}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <CollapsibleContent>
                              {result.answers.length > 0 ? (
                                <div className="px-3 pb-3 border-t pt-3 space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Question Breakdown
                                  </p>
                                  {result.answers.map((answer, idx) => (
                                    <div
                                      key={answer.questionId}
                                      className={cn(
                                        "p-2 rounded text-sm",
                                        answer.isCorrect
                                          ? "bg-green-500/5 border border-green-500/20"
                                          : "bg-red-500/5 border border-red-500/20"
                                      )}
                                    >
                                      <div className="flex items-start gap-2">
                                        {answer.isCorrect ? (
                                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                        ) : (
                                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-xs">Q{idx + 1}: {answer.questionText}</p>
                                          {!answer.isCorrect && answer.options.length > 0 && (
                                            <div className="mt-1 space-y-0.5 text-xs">
                                              <p className="text-red-500">
                                                Your answer: {answer.selectedAnswer >= 0 && answer.selectedAnswer < answer.options.length
                                                  ? `${String.fromCharCode(65 + answer.selectedAnswer)}. ${answer.options[answer.selectedAnswer]}`
                                                  : "No answer"}
                                              </p>
                                              <p className="text-green-600">
                                                Correct: {answer.correctAnswer >= 0 && answer.correctAnswer < answer.options.length
                                                  ? `${String.fromCharCode(65 + answer.correctAnswer)}. ${answer.options[answer.correctAnswer]}`
                                                  : "Unknown"}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="px-3 pb-3 border-t pt-3">
                                  <p className="text-xs text-muted-foreground italic">
                                    No detailed answer data available for this attempt (recorded before answer tracking was enabled)
                                  </p>
                                </div>
                              )}
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
                      No quiz attempts yet
                    </p>
                  )}

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Lessons Completed</span>
                      <span className="font-medium">{student.lessonsCompleted}</span>
                    </div>
                    {student.lessonsCompleted > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setConfirmDialog({ type: "resetAllProgress" })}
                        disabled={isDeleting}
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                        Reset Progress
                      </Button>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onManageRoles(student.id, student.roles, student.displayName || "Student")}
                  >
                    Manage Roles
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to={`/profile/${student.id}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Public Profile
                    </Link>
                  </Button>
                  {!student.isBanned && (
                    <Button
                      variant="destructive"
                      onClick={() => setConfirmDialog({ type: "banUser" })}
                      disabled={isDeleting}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Ban User
                    </Button>
                  )}
                  {/* Delete User - hidden for current user */}
                  {student.id !== currentUser?.id && (
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive hover:bg-destructive/10"
                      onClick={() => setConfirmDialog({ type: "deleteUser" })}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete User Permanently
                    </Button>
                  )}
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              Student not found
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.type === "removeEnrollment" && "Remove Enrollment"}
              {confirmDialog?.type === "resetQuiz" && "Reset Quiz Result"}
              {confirmDialog?.type === "resetAllQuizzes" && "Reset All Quiz Results"}
              {confirmDialog?.type === "removeAllEnrollments" && "Remove All Enrollments"}
              {confirmDialog?.type === "resetAllProgress" && "Reset All Progress"}
              {confirmDialog?.type === "banUser" && "Ban User"}
              {confirmDialog?.type === "unbanUser" && "Unban User"}
              {confirmDialog?.type === "deleteUser" && "Permanently Delete User"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                {confirmDialog?.type === "removeEnrollment" && (
                  <>
                    Are you sure you want to remove this student from{" "}
                    <strong>{confirmDialog.courseTitle}</strong>? This action cannot be undone.
                    The student's progress data will be preserved.
                  </>
                )}
                {confirmDialog?.type === "resetQuiz" && (
                  <>
                    Are you sure you want to reset the quiz result for{" "}
                    <strong>{confirmDialog.quizId}</strong>? This will delete this attempt and allow
                    the student to retake the quiz.
                  </>
                )}
                {confirmDialog?.type === "resetAllQuizzes" && (
                  <>
                    <strong className="text-destructive">Warning:</strong> This will delete ALL quiz
                    results for this student. This action cannot be undone.
                  </>
                )}
                {confirmDialog?.type === "removeAllEnrollments" && (
                  <>
                    <strong className="text-destructive">Warning:</strong> This will remove the student
                    from ALL courses. They will lose access to all enrolled content.
                  </>
                )}
                {confirmDialog?.type === "resetAllProgress" && (
                  <>
                    <strong className="text-destructive">Warning:</strong> This will reset ALL lesson
                    progress for this student. They will need to rewatch all content.
                  </>
                )}
                {confirmDialog?.type === "banUser" && (
                  <div className="space-y-3">
                    <p>
                      Banning this user will block their access to the platform. Their data will be
                      preserved but they will not be able to log in.
                    </p>
                    <div>
                      <label className="text-sm font-medium">Ban Reason (required)</label>
                      <Textarea
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        placeholder="Enter reason for ban..."
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                )}
                {confirmDialog?.type === "unbanUser" && (
                  <>
                    Are you sure you want to unban this user? They will regain access to the platform.
                  </>
                )}
                {confirmDialog?.type === "deleteUser" && (
                  <div className="space-y-2">
                    <p>
                      <strong className="text-destructive">Warning:</strong> This action is <strong>irreversible</strong>.
                    </p>
                    <p>
                      Permanently deleting <strong>{student?.displayName || "this user"}</strong> will remove:
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                      <li>Account and login credentials</li>
                      <li>Profile information</li>
                      <li>Course enrollments and progress</li>
                      <li>Quiz results and answers</li>
                      <li>Community posts and comments</li>
                      <li>Messages and friendships</li>
                    </ul>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={isDeleting || (confirmDialog?.type === "banUser" && !banReason.trim())}
              className={cn(
                (confirmDialog?.type === "unbanUser")
                  ? "" 
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
