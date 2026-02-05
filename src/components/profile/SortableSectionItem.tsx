 import { useSortable } from "@dnd-kit/sortable";
 import { CSS } from "@dnd-kit/utilities";
 import { GripVertical, LucideIcon } from "lucide-react";
 
 interface SortableSectionItemProps {
   id: string;
   label: string;
   icon: LucideIcon;
 }
 
 export function SortableSectionItem({
   id,
   label,
   icon: Icon,
 }: SortableSectionItemProps) {
   const {
     attributes,
     listeners,
     setNodeRef,
     transform,
     transition,
     isDragging,
   } = useSortable({ id });
 
   const style = {
     transform: CSS.Transform.toString(transform),
     transition,
     opacity: isDragging ? 0.5 : 1,
     zIndex: isDragging ? 50 : undefined,
   };
 
   return (
     <div
       ref={setNodeRef}
       style={style}
       className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
         isDragging
           ? "border-primary bg-primary/10 shadow-lg"
           : "border-border bg-background hover:border-primary/50 hover:bg-muted/50"
       }`}
     >
       <div
         {...attributes}
         {...listeners}
         className="p-1 cursor-grab active:cursor-grabbing"
       >
         <GripVertical className="h-5 w-5 text-muted-foreground" />
       </div>
       <Icon className="h-5 w-5 text-primary" />
       <span className="font-medium">{label}</span>
     </div>
   );
 }