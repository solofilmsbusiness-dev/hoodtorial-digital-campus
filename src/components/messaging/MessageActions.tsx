 import { Trash2 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
 } from "@/components/ui/alert-dialog";
 import { ReactionPicker } from "./ReactionPicker";
 
 interface MessageActionsProps {
   isOwn: boolean;
   onDelete: () => void;
   onReact: (emoji: string) => void;
   deleting?: boolean;
 }
 
 export function MessageActions({
   isOwn,
   onDelete,
   onReact,
   deleting,
 }: MessageActionsProps) {
   return (
     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
       <ReactionPicker onReact={onReact} />
 
       {isOwn && (
         <AlertDialog>
           <AlertDialogTrigger asChild>
             <Button
               variant="ghost"
               size="icon"
               className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
               disabled={deleting}
             >
               <Trash2 className="h-4 w-4" />
             </Button>
           </AlertDialogTrigger>
           <AlertDialogContent>
             <AlertDialogHeader>
               <AlertDialogTitle>Delete message?</AlertDialogTitle>
               <AlertDialogDescription>
                 This will permanently delete this message. This action cannot be
                 undone.
               </AlertDialogDescription>
             </AlertDialogHeader>
             <AlertDialogFooter>
               <AlertDialogCancel>Cancel</AlertDialogCancel>
               <AlertDialogAction
                 onClick={onDelete}
                 className="bg-destructive hover:bg-destructive/90"
               >
                 Delete
               </AlertDialogAction>
             </AlertDialogFooter>
           </AlertDialogContent>
         </AlertDialog>
       )}
     </div>
   );
 }