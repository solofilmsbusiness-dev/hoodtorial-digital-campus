 import {
   DndContext,
   closestCenter,
   KeyboardSensor,
   PointerSensor,
   useSensor,
   useSensors,
   DragEndEvent,
 } from "@dnd-kit/core";
 import {
   arrayMove,
   SortableContext,
   sortableKeyboardCoordinates,
   verticalListSortingStrategy,
 } from "@dnd-kit/sortable";
 import { GraduationCap, Trophy, Images, MessageSquare, Layout } from "lucide-react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { SortableSectionItem } from "./SortableSectionItem";
 import { LucideIcon } from "lucide-react";
 
 interface SectionLayoutEditorProps {
   order: string[];
   onChange: (newOrder: string[]) => void;
 }
 
 const AVAILABLE_SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
   { id: "stats", label: "Academic Stats", icon: GraduationCap },
   { id: "achievements", label: "Course Achievements", icon: Trophy },
   { id: "gallery", label: "Portfolio Gallery", icon: Images },
   { id: "wall", label: "Profile Wall", icon: MessageSquare },
 ];
 
 export function SectionLayoutEditor({
   order,
   onChange,
 }: SectionLayoutEditorProps) {
   const sensors = useSensors(
     useSensor(PointerSensor, {
       activationConstraint: {
         distance: 8,
       },
     }),
     useSensor(KeyboardSensor, {
       coordinateGetter: sortableKeyboardCoordinates,
     })
   );
 
   const handleDragEnd = (event: DragEndEvent) => {
     const { active, over } = event;
 
     if (over && active.id !== over.id) {
       const oldIndex = order.indexOf(active.id as string);
       const newIndex = order.indexOf(over.id as string);
       const newOrder = arrayMove(order, oldIndex, newIndex);
       onChange(newOrder);
     }
   };
 
   // Ensure all sections are in order
   const normalizedOrder = order.length === AVAILABLE_SECTIONS.length
     ? order
     : AVAILABLE_SECTIONS.map((s) => s.id);
 
   const orderedSections = normalizedOrder
     .map((id) => AVAILABLE_SECTIONS.find((s) => s.id === id))
     .filter(Boolean) as typeof AVAILABLE_SECTIONS;
 
   return (
     <Card className="card-urban">
       <CardHeader>
         <CardTitle className="flex items-center gap-2">
           <Layout className="h-5 w-5 text-primary" />
           Profile Layout
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <p className="text-sm text-muted-foreground">
           Drag sections to reorder how they appear on your public profile.
         </p>
 
         <DndContext
           sensors={sensors}
           collisionDetection={closestCenter}
           onDragEnd={handleDragEnd}
         >
           <SortableContext
             items={normalizedOrder}
             strategy={verticalListSortingStrategy}
           >
             <div className="space-y-2">
               {orderedSections.map((section) => (
                 <SortableSectionItem
                   key={section.id}
                   id={section.id}
                   label={section.label}
                   icon={section.icon}
                 />
               ))}
             </div>
           </SortableContext>
         </DndContext>
 
         <p className="text-xs text-muted-foreground text-center">
           💡 Featured project always appears first. Social links always appear last.
         </p>
       </CardContent>
     </Card>
   );
 }