 import { useState } from "react";
 import { Send, CreditCard } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Textarea } from "@/components/ui/textarea";
 import { useDirectMessages, ContactCardData } from "@/hooks/useDirectMessages";
 import { useProfileContext } from "@/contexts/ProfileContext";
 import {
   Popover,
   PopoverContent,
   PopoverTrigger,
 } from "@/components/ui/popover";
 import { Card } from "@/components/ui/card";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 
 interface MessageComposerProps {
   conversationId: string;
  onTyping?: (isTyping: boolean) => void;
 }
 
export function MessageComposer({ conversationId, onTyping }: MessageComposerProps) {
   const [message, setMessage] = useState("");
   const [sending, setSending] = useState(false);
   const [showContactPreview, setShowContactPreview] = useState(false);
   const { sendMessage, sendContactCard } = useDirectMessages(conversationId);
   const { profile } = useProfileContext();
 
   const handleSend = async () => {
     if (!message.trim() || sending) return;
     setSending(true);
     const { error } = await sendMessage(message);
     if (!error) setMessage("");
     setSending(false);
   };
 
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onTyping?.(true);
  };

   const handleKeyDown = (e: React.KeyboardEvent) => {
     if (e.key === "Enter" && !e.shiftKey) {
       e.preventDefault();
       handleSend();
     }
   };
 
   const handleShareContact = async () => {
     if (!profile) return;
     setSending(true);
 
     const cardData: ContactCardData = {
       user_id: profile.user_id,
       display_name: profile.display_name,
       avatar_url: profile.avatar_url,
       bio: profile.bio,
       filmmaking_style: profile.filmmaking_style,
       camera_gear: profile.camera_gear,
       portfolio_url: profile.portfolio_url,
       instagram_url: profile.instagram_url,
       youtube_url: profile.youtube_url,
       twitter_url: profile.twitter_url,
       vimeo_url: profile.vimeo_url,
       tiktok_url: profile.tiktok_url,
       imdb_url: profile.imdb_url,
     };
 
     await sendContactCard(cardData);
     setShowContactPreview(false);
     setSending(false);
   };
 
   const getInitials = (name?: string | null) => {
     if (!name) return "?";
     return name
       .split(" ")
       .map((n) => n.charAt(0))
       .join("")
       .toUpperCase()
       .slice(0, 2);
   };
 
   return (
     <div className="p-4 border-t bg-background">
       <div className="flex gap-2 items-end">
         <Popover open={showContactPreview} onOpenChange={setShowContactPreview}>
           <PopoverTrigger asChild>
             <Button variant="ghost" size="icon" className="shrink-0" disabled={!profile}>
               <CreditCard className="h-5 w-5" />
             </Button>
           </PopoverTrigger>
           <PopoverContent className="w-72" align="start">
             <div className="space-y-3">
               <p className="text-sm font-semibold">Share Your Contact Card</p>
               <Card className="p-3 bg-muted/50">
                 <div className="flex items-center gap-2">
                   <Avatar className="h-10 w-10">
                     <AvatarImage src={profile?.avatar_url || undefined} />
                     <AvatarFallback>{getInitials(profile?.display_name)}</AvatarFallback>
                   </Avatar>
                   <div>
                     <p className="font-semibold text-sm">{profile?.display_name || "Your Name"}</p>
                     <p className="text-xs text-muted-foreground">{profile?.filmmaking_style || "Filmmaker"}</p>
                   </div>
                 </div>
               </Card>
               <Button size="sm" className="w-full" onClick={handleShareContact} disabled={sending}>
                 <Send className="h-4 w-4 mr-1" />
                 Send Card
               </Button>
             </div>
           </PopoverContent>
         </Popover>
 
         <Textarea
           value={message}
          onChange={handleInputChange}
          onBlur={() => onTyping?.(false)}
           onKeyDown={handleKeyDown}
           placeholder="Type a message..."
           className="min-h-[44px] max-h-32 resize-none"
           rows={1}
         />
 
         <Button
           size="icon"
           onClick={handleSend}
           disabled={!message.trim() || sending}
           className="shrink-0"
         >
           <Send className="h-5 w-5" />
         </Button>
       </div>
     </div>
   );
 }