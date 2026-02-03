import { format } from "date-fns";
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
import {
  BookOpen,
  CheckCircle,
  Clock,
  ExternalLink,
  GraduationCap,
  MapPin,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { useStudentDetails, type StudentDetails } from "@/hooks/useAdminStudents";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface StudentDetailSheetProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManageRoles: (userId: string, roles: AppRole[], displayName: string) => void;
}

export function StudentDetailSheet({
  userId,
  open,
  onOpenChange,
  onManageRoles,
}: StudentDetailSheetProps) {
  const { data: student, isLoading } = useStudentDetails(userId);

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
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
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={student.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {getInitials(student.displayName, student.id)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">
                    {student.displayName || "Unnamed Student"}
                  </h3>
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
                  </div>
                </div>
              </div>

              {student.bio && (
                <p className="text-sm text-muted-foreground">{student.bio}</p>
              )}

              <Separator />

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

              {/* Enrolled Courses */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Enrolled Courses ({student.enrollments.length})
                </h4>
                {student.enrollments.length > 0 ? (
                  <div className="space-y-2">
                    {student.enrollments.map((enrollment) => (
                      <div
                        key={enrollment.courseCode}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium text-sm">{enrollment.courseCode}</p>
                          <p className="text-xs text-muted-foreground">{enrollment.courseTitle}</p>
                        </div>
                        <Badge
                          variant={enrollment.status === "active" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {enrollment.status}
                        </Badge>
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

              {/* Quiz Performance */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Quiz Performance
                </h4>
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
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lessons Completed</span>
                    <span className="font-medium">{student.lessonsCompleted}</span>
                  </div>
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
                  <a href={`/profile/${student.id}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Public Profile
                  </a>
                </Button>
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
  );
}
