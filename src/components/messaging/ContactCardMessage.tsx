import React from "react";
import { ExternalLink, Instagram, Youtube, Twitter, Film, Camera, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContactCardData } from "@/hooks/useDirectMessages";
import { Link } from "react-router-dom";

interface ContactCardMessageProps {
  cardData: ContactCardData;
}

export const ContactCardMessage = React.forwardRef<HTMLDivElement, ContactCardMessageProps>(
  ({ cardData }, ref) => {
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

    const roleLabel = cardData.creative_role || cardData.filmmaking_style;

    return (
      <div
        ref={ref}
        className="max-w-xs rounded-lg border-l-4 border-l-primary bg-gradient-to-br from-card to-muted/30 border border-border shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 ring-2 ring-primary ring-offset-2 ring-offset-background">
              <AvatarImage src={cardData.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
                {getInitials(cardData.display_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-bold text-foreground truncate">
                {cardData.display_name || "Unknown User"}
              </p>
              {roleLabel && (
                <Badge variant="outline" className="mt-1 border-primary/50 text-primary text-[10px] px-2 py-0">
                  {roleLabel}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        {(cardData.bio || cardData.camera_gear || socialLinks.length > 0) && (
          <div className="px-4 pb-3 space-y-2.5">
            {cardData.bio && (
              <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2 line-clamp-2">
                {cardData.bio}
              </p>
            )}

            {cardData.camera_gear && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Camera className="h-3 w-3 text-primary/70 shrink-0" />
                <span className="truncate">{cardData.camera_gear}</span>
              </div>
            )}

            {socialLinks.length > 0 && (
              <div className="flex gap-1.5">
                {socialLinks.map(({ url, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="px-4 pb-4 flex gap-2">
          <Button size="sm" className="flex-1 h-8 text-xs" asChild>
            <Link to={`/profile/${cardData.user_id}`}>
              <User className="h-3 w-3 mr-1" />
              View Profile
            </Link>
          </Button>
          {cardData.portfolio_url && (
            <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
              <a href={cardData.portfolio_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Portfolio
              </a>
            </Button>
          )}
        </div>
      </div>
    );
  }
);

ContactCardMessage.displayName = "ContactCardMessage";
