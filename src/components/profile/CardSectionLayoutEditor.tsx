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
 import { Quote, Film, Camera, Link2, CreditCard } from "lucide-react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { SortableSectionItem } from "./SortableSectionItem";
 import { LucideIcon } from "lucide-react";
 
 interface CardSectionLayoutEditorProps {
   order: string[];
   onChange: (newOrder: string[]) => void;
 }
 
 const AVAILABLE_CARD_SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
   { id: "bio", label: "Bio", icon: Quote },
   { id: "featured_project", label: "Featured Project", icon: Film },
   { id: "info_cards", label: "Creative Info Cards", icon: Camera },
   { id: "social_links", label: "Social Links", icon: Link2 },
 ];
 
 export function CardSectionLayoutEditor({
   order,
   onChange,
 }: CardSectionLayoutEditorProps) {
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
   const normalizedOrder = order.length === AVAILABLE_CARD_SECTIONS.length
     ? order
     : AVAILABLE_CARD_SECTIONS.map((s) => s.id);
 
   const orderedSections = normalizedOrder
     .map((id) => AVAILABLE_CARD_SECTIONS.find((s) => s.id === id))
     .filter(Boolean) as typeof AVAILABLE_CARD_SECTIONS;
 
   return (
     <Card className="card-urban">
       <CardHeader>
         <CardTitle className="flex items-center gap-2">
           <CreditCard className="h-5 w-5 text-primary" />
           Profile Card Layout
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <p className="text-sm text-muted-foreground">
           Drag sections to reorder within your profile card.
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
           💡 Cover banner and identity section always appear first.
         </p>
       </CardContent>
     </Card>
   );
 }