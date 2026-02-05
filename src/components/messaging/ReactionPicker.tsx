 import { Button } from "@/components/ui/button";
 import {
   Popover,
   PopoverContent,
   PopoverTrigger,
 } from "@/components/ui/popover";
 import { SmilePlus } from "lucide-react";
 import { useState } from "react";
 
 const QUICK_REACTIONS = ["❤️", "👍", "😂", "🔥", "😢", "👏"];
 
 interface ReactionPickerProps {
   onReact: (emoji: string) => void;
   disabled?: boolean;
 }
 
 export function ReactionPicker({ onReact, disabled }: ReactionPickerProps) {
   const [open, setOpen] = useState(false);
 
   const handleReact = (emoji: string) => {
     onReact(emoji);
     setOpen(false);
   };
 
   return (
     <Popover open={open} onOpenChange={setOpen}>
       <PopoverTrigger asChild>
         <Button
           variant="ghost"
           size="icon"
           className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
           disabled={disabled}
         >
           <SmilePlus className="h-4 w-4" />
         </Button>
       </PopoverTrigger>
       <PopoverContent className="w-auto p-2" align="start">
         <div className="flex gap-1">
           {QUICK_REACTIONS.map((emoji) => (
             <Button
               key={emoji}
               variant="ghost"
               size="sm"
               className="h-8 w-8 p-0 text-lg hover:bg-muted"
               onClick={() => handleReact(emoji)}
             >
               {emoji}
             </Button>
           ))}
         </div>
       </PopoverContent>
     </Popover>
   );
 }