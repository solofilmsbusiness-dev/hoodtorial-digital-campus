 import { ExternalLink, Instagram, Youtube, Twitter, Film } from "lucide-react";
 import { Card } from "@/components/ui/card";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Button } from "@/components/ui/button";
 import { ContactCardData } from "@/hooks/useDirectMessages";
 
 interface ContactCardMessageProps {
   cardData: ContactCardData;
 }
 
 export function ContactCardMessage({ cardData }: ContactCardMessageProps) {
   const getInitials = (name?: string | null) => {
     if (!name) return "?";
     return name
       .split(" ")
       .map((n) => n.charAt(0))
       .join("")
       .toUpperCase()
       .slice(0, 2);
   };
 
   const socialLinks = [
     { url: cardData.instagram_url, icon: Instagram, label: "Instagram" },
     { url: cardData.youtube_url, icon: Youtube, label: "YouTube" },
     { url: cardData.twitter_url, icon: Twitter, label: "Twitter" },
     { url: cardData.vimeo_url, icon: Film, label: "Vimeo" },
   ].filter((link) => link.url);
 
   return (
     <Card className="p-4 max-w-xs bg-gradient-to-br from-card to-muted/50 border-2">
       <div className="flex items-center gap-3 mb-3">
         <Avatar className="h-12 w-12 border-2 border-primary">
           <AvatarImage src={cardData.avatar_url || undefined} />
           <AvatarFallback className="bg-primary text-primary-foreground font-bold">
             {getInitials(cardData.display_name)}
           </AvatarFallback>
         </Avatar>
         <div>
           <p className="font-bold">{cardData.display_name || "Unknown User"}</p>
            {(cardData.creative_role || cardData.filmmaking_style) && (
              <p className="text-xs text-muted-foreground">
                {cardData.creative_role || cardData.filmmaking_style}
              </p>
            )}
         </div>
       </div>
 
       {cardData.bio && (
         <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{cardData.bio}</p>
       )}
 
       {cardData.camera_gear && (
         <p className="text-xs text-muted-foreground mb-3">📷 {cardData.camera_gear}</p>
       )}
 
       {socialLinks.length > 0 && (
         <div className="flex gap-2 mb-3">
           {socialLinks.map(({ url, icon: Icon, label }) => (
             <a
               key={label}
               href={url!}
               target="_blank"
               rel="noopener noreferrer"
               className="p-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
             >
               <Icon className="h-4 w-4" />
             </a>
           ))}
         </div>
       )}
 
       {cardData.portfolio_url && (
         <Button size="sm" variant="outline" className="w-full" asChild>
           <a href={cardData.portfolio_url} target="_blank" rel="noopener noreferrer">
             <ExternalLink className="h-3 w-3 mr-1" />
             View Portfolio
           </a>
         </Button>
       )}
     </Card>
   );
 }