import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin";
import { StudentFilters, type SubscriptionFilter, type TierFilter, type RoleFilter, type SortOption } from "@/components/admin/StudentFilters";
import { StudentDetailSheet } from "@/components/admin/StudentDetailSheet";
import { useAdminStudents, type StudentSummary } from "@/hooks/useAdminStudents";
import { useManageRoles } from "@/hooks/useManageRoles";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  MoreHorizontal,
  Shield,
  ShieldCheck,
  ShieldX,
  Users,
  Eye,
  GraduationCap,
  BookOpen,
  Trophy,
  MapPin,
  Download,
  Ban,
  ShieldOff,
   FlaskConical,
} from "lucide-react";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export default function UserManager() {
  const { user: currentUser } = useAuth();
  const { data: students, isLoading } = useAdminStudents();
  const { addRole, removeRole } = useManageRoles();

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState<SubscriptionFilter>("all");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  // Sheet state
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Role dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "add" | "remove";
    userId: string;
    role: AppRole;
    userName: string;
  } | null>(null);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    if (!students) return [];

    let result = [...students];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.displayName?.toLowerCase().includes(query) ||
          s.location?.toLowerCase().includes(query) ||
          s.id.toLowerCase().includes(query)
      );
    }

    // Subscription filter
    if (subscriptionFilter !== "all") {
      result = result.filter((s) => {
        if (subscriptionFilter === "trial") {
          return s.subscriptionStatus === "trial" && s.trialEndsAt && new Date(s.trialEndsAt) > new Date();
        }
        if (subscriptionFilter === "active") {
          return s.subscriptionStatus === "active";
        }
        if (subscriptionFilter === "expired") {
          return s.subscriptionStatus === "trial" && s.trialEndsAt && new Date(s.trialEndsAt) < new Date();
        }
        return true;
      });
    }

    // Tier filter
    if (tierFilter !== "all") {
      result = result.filter((s) => s.membershipTier === tierFilter);
    }

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter((s) => s.roles.includes(roleFilter));
    }

    // Sort
    switch (sortOption) {
      case "oldest":
        result.sort((a, b) => new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime());
        break;
      case "newest":
        result.sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());
        break;
      case "name-asc":
        result.sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""));
        break;
      case "name-desc":
        result.sort((a, b) => (b.displayName || "").localeCompare(a.displayName || ""));
        break;
      case "quiz-rate":
        result.sort((a, b) => b.quizStats.passRate - a.quizStats.passRate);
        break;
      case "courses":
        result.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        break;
    }

    return result;
  }, [students, searchQuery, subscriptionFilter, tierFilter, roleFilter, sortOption]);

  const handleViewDetails = (userId: string) => {
    setSelectedStudentId(userId);
    setSheetOpen(true);
  };

  const handleRoleAction = (action: "add" | "remove", userId: string, role: AppRole, userName: string) => {
    if (action === "remove" && role === "admin" && userId === currentUser?.id) {
      return;
    }
    setConfirmDialog({ open: true, action, userId, role, userName });
  };

  const confirmRoleAction = () => {
    if (!confirmDialog) return;

    if (confirmDialog.action === "add") {
      addRole.mutate({ userId: confirmDialog.userId, role: confirmDialog.role });
    } else {
      removeRole.mutate({ userId: confirmDialog.userId, role: confirmDialog.role });
    }
    setConfirmDialog(null);
  };

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
       case "tester":
         return "outline";
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

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Location", "Tier", "Roles", "Courses", "Quiz Passed", "Quiz Failed", "Pass Rate", "Status", "Joined"];
    const rows = filteredStudents.map((s) => [
      s.displayName || "No name",
      s.email || "",
      s.location || "",
      s.membershipTier,
      s.roles.join("; "),
      s.enrollmentCount,
      s.quizStats.passed,
      s.quizStats.failed,
      `${s.quizStats.passRate}%`,
      s.subscriptionStatus || "unknown",
      format(new Date(s.enrolledAt), "yyyy-MM-dd"),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `students-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIndicator = (status: string | null, trialEndsAt: string | null) => {
    if (status === "active") return "ring-2 ring-green-500 ring-offset-2 ring-offset-background";
    if (status === "trial" && trialEndsAt) {
      const isExpired = new Date(trialEndsAt) < new Date();
      return isExpired ? "ring-2 ring-red-500 ring-offset-2 ring-offset-background" : "ring-2 ring-amber-500 ring-offset-2 ring-offset-background";
    }
    return "";
  };

  return (
    <AdminLayout title="Student Management" description="View and manage all students, their enrollments, and performance" pageKey="users">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={exportToCSV} disabled={filteredStudents.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span>{students?.length || 0} students</span>
          </div>
        </div>

        <StudentFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          subscriptionFilter={subscriptionFilter}
          onSubscriptionChange={setSubscriptionFilter}
          tierFilter={tierFilter}
          onTierChange={setTierFilter}
          roleFilter={roleFilter}
          onRoleChange={setRoleFilter}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    Courses
                  </div>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5" />
                    Quizzes
                  </div>
                </TableHead>
                <TableHead className="hidden sm:table-cell">Tier</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading students...
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetails(student.id)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className={`h-10 w-10 ${getStatusIndicator(student.subscriptionStatus, student.trialEndsAt)}`}>
                              <AvatarImage src={student.avatarUrl || undefined} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(student.displayName, student.id)}
                              </AvatarFallback>
                            </Avatar>
                            {student.isBanned && (
                              <div className="absolute -bottom-1 -right-1 bg-destructive rounded-full p-0.5">
                                <Ban className="h-3 w-3 text-destructive-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`font-medium truncate ${student.isBanned ? "text-muted-foreground line-through" : ""}`}>
                                {student.displayName || "No name"}
                              </p>
                              {student.id === currentUser?.id && (
                                <span className="text-xs text-muted-foreground">(you)</span>
                              )}
                              {student.isBanned && (
                                <Badge variant="destructive" className="text-xs">Banned</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              {student.location ? (
                                <>
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate max-w-[150px]">{student.location}</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground/50">—</span>
                              )}
                            </div>
                            <div className="flex gap-1 mt-1 flex-wrap md:hidden">
                              {student.roles.map((role) => (
                                <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="font-medium">{student.enrollmentCount}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {student.quizStats.totalAttempts > 0 ? (
                        <div className="space-y-0.5">
                          <div className="text-sm">
                            <span className="text-green-500">{student.quizStats.passed}</span>
                            <span className="text-muted-foreground">/</span>
                            <span className="text-red-500">{student.quizStats.failed}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{student.quizStats.passRate}%</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <GraduationCap className={`h-4 w-4 ${getTierColor(student.membershipTier)}`} />
                        <span className={`capitalize ${getTierColor(student.membershipTier)}`}>
                          {student.membershipTier}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {student.roles.map((role) => (
                          <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {format(new Date(student.enrolledAt), "MMM d")}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(student.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {!student.roles.includes("admin") && (
                            <DropdownMenuItem
                              onClick={() => handleRoleAction("add", student.id, "admin", student.displayName || "User")}
                            >
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                          )}
                          {student.roles.includes("admin") && student.id !== currentUser?.id && (
                            <DropdownMenuItem
                              onClick={() => handleRoleAction("remove", student.id, "admin", student.displayName || "User")}
                              className="text-destructive"
                            >
                              <ShieldX className="h-4 w-4 mr-2" />
                              Remove Admin
                            </DropdownMenuItem>
                          )}
                          {!student.roles.includes("professor") && (
                            <DropdownMenuItem
                              onClick={() => handleRoleAction("add", student.id, "professor", student.displayName || "User")}
                            >
                              <GraduationCap className="h-4 w-4 mr-2" />
                              Make Professor
                            </DropdownMenuItem>
                          )}
                          {student.roles.includes("professor") && (
                            <DropdownMenuItem
                              onClick={() => handleRoleAction("remove", student.id, "professor", student.displayName || "User")}
                            >
                              <ShieldX className="h-4 w-4 mr-2" />
                              Remove Professor
                            </DropdownMenuItem>
                          )}
                          {!student.roles.includes("moderator") && (
                            <DropdownMenuItem
                              onClick={() => handleRoleAction("add", student.id, "moderator", student.displayName || "User")}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Make Moderator
                            </DropdownMenuItem>
                          )}
                          {student.roles.includes("moderator") && (
                            <DropdownMenuItem
                              onClick={() => handleRoleAction("remove", student.id, "moderator", student.displayName || "User")}
                            >
                              <ShieldX className="h-4 w-4 mr-2" />
                              Remove Moderator
                            </DropdownMenuItem>
                          )}
                           {!student.roles.includes("tester") && (
                             <DropdownMenuItem
                               onClick={() => handleRoleAction("add", student.id, "tester", student.displayName || "User")}
                             >
                               <FlaskConical className="h-4 w-4 mr-2" />
                               Make Tester
                             </DropdownMenuItem>
                           )}
                           {student.roles.includes("tester") && (
                             <DropdownMenuItem
                               onClick={() => handleRoleAction("remove", student.id, "tester", student.displayName || "User")}
                             >
                               <ShieldX className="h-4 w-4 mr-2" />
                               Remove Tester
                             </DropdownMenuItem>
                           )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <StudentDetailSheet
        userId={selectedStudentId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onManageRoles={(userId, roles, displayName) => {
          setSheetOpen(false);
          // Open role dialog for the first missing role or show current state
          if (!roles.includes("admin")) {
            handleRoleAction("add", userId, "admin", displayName);
          } else if (!roles.includes("moderator")) {
            handleRoleAction("add", userId, "moderator", displayName);
          }
        }}
      />

      <AlertDialog open={confirmDialog?.open} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.action === "add" ? "Grant" : "Revoke"} {confirmDialog?.role} Role
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmDialog?.action === "add" ? "grant" : "revoke"} the{" "}
              <strong>{confirmDialog?.role}</strong> role {confirmDialog?.action === "add" ? "to" : "from"}{" "}
              <strong>{confirmDialog?.userName}</strong>?
              {confirmDialog?.role === "admin" && (
                <span className="block mt-2 text-destructive">
                  Admin users have full access to manage the platform.
                </span>
              )}
               {confirmDialog?.role === "tester" && (
                 <span className="block mt-2 text-violet-500">
                   Testers have full platform access for testing but cannot access admin features.
                 </span>
               )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleAction}>
              {confirmDialog?.action === "add" ? "Grant Role" : "Revoke Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
