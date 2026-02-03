import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Image, Video } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

interface CreatePostPromptProps {
  onOpen: () => void;
}

export function CreatePostPrompt({ onOpen }: CreatePostPromptProps) {
  const { profile } = useProfile();

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div 
      className="bg-card border border-border rounded-xl p-4 mb-6 cursor-pointer hover:bg-muted/30 transition-colors"
      onClick={onOpen}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-border">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
            {getInitials(profile?.display_name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 bg-muted/50 rounded-full px-4 py-2.5 text-muted-foreground text-sm">
          What's on your mind?
        </div>

        <div className="hidden sm:flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-green-500 hover:bg-green-500/10">
            <Image className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-500/10">
            <Video className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
