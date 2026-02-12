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
import { ShieldOff, ShieldCheck } from "lucide-react";

interface BlockUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  isBlocked: boolean;
  onConfirm: () => void;
}

export function BlockUserDialog({ open, onOpenChange, userName, isBlocked, onConfirm }: BlockUserDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isBlocked ? <ShieldCheck className="h-5 w-5 text-primary" /> : <ShieldOff className="h-5 w-5 text-destructive" />}
            {isBlocked ? `Unblock ${userName}?` : `Block ${userName}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isBlocked
              ? `${userName} will be able to message you and see your profile again.`
              : `${userName} won't be able to message you or interact with your content. You can unblock them later.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={isBlocked ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
          >
            {isBlocked ? "Unblock" : "Block"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
