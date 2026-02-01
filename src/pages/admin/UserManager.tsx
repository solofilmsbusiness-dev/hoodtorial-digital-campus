import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useManageRoles } from "@/hooks/useManageRoles";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Search, MoreHorizontal, Shield, ShieldCheck, ShieldX, Users } from "lucide-react";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export default function UserManager() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useAllUsers();
  const { addRole, removeRole } = useManageRoles();
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "add" | "remove";
    userId: string;
    role: AppRole;
    userName: string;
  } | null>(null);

  const filteredUsers = users?.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.id.toLowerCase().includes(searchLower)
    );
  });

  const handleRoleAction = (action: "add" | "remove", userId: string, role: AppRole, userName: string) => {
    // Prevent admins from removing their own admin role
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
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
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

  return (
    <AdminLayout title="User Management" description="Manage user roles and permissions">
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span>{users?.length || 0} users</span>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-sm"
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(user.displayName, user.id)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.displayName || "No name"}
                            {user.id === currentUser?.id && (
                              <span className="text-xs text-muted-foreground ml-2">(you)</span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {user.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map((role) => (
                          <Badge key={role} variant={getRoleBadgeVariant(role)}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(user.enrolledAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!user.roles.includes("admin") && (
                            <DropdownMenuItem
                              onClick={() => handleRoleAction("add", user.id, "admin", user.displayName || "User")}
                            >
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                          )}
                          {user.roles.includes("admin") && user.id !== currentUser?.id && (
                            <DropdownMenuItem
                              onClick={() => handleRoleAction("remove", user.id, "admin", user.displayName || "User")}
                              className="text-destructive"
                            >
                              <ShieldX className="h-4 w-4 mr-2" />
                              Remove Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {!user.roles.includes("moderator") && (
                            <DropdownMenuItem
                              onClick={() => handleRoleAction("add", user.id, "moderator", user.displayName || "User")}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Make Moderator
                            </DropdownMenuItem>
                          )}
                          {user.roles.includes("moderator") && (
                            <DropdownMenuItem
                              onClick={() => handleRoleAction("remove", user.id, "moderator", user.displayName || "User")}
                            >
                              <ShieldX className="h-4 w-4 mr-2" />
                              Remove Moderator
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
