import { useState, useRef } from "react";
import { Send, CreditCard, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDirectMessages, ContactCardData } from "@/hooks/useDirectMessages";
import { useProfileContext } from "@/contexts/ProfileContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, sendContactCard } = useDirectMessages(conversationId);
  const { profile } = useProfileContext();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSend = async () => {
    if ((!message.trim() && !imageFile) || sending) return;
    setSending(true);

    // Handle image upload
    if (imageFile && user) {
      try {
        const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${user.id}/msg-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("community-uploads")
          .upload(fileName, imageFile, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("community-uploads")
          .getPublicUrl(fileName);

        // Send as image message
        await supabase.from("direct_messages").insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: urlData.publicUrl,
          message_type: "image",
        });

        await supabase
          .from("conversations")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", conversationId);

        clearImage();
      } catch (err) {
        toast({
          title: "Failed to send image",
          description: (err as Error).message,
          variant: "destructive",
        });
      }
    }

    // Handle text message
    if (message.trim()) {
      const { error } = await sendMessage(message);
      if (!error) setMessage("");
    }

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      creative_role: (profile as any).creative_role || null,
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
    return name.split(" ").map((n) => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-4 border-t bg-background">
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <img src={imagePreview} alt="Preview" className="h-20 rounded-lg border border-border" />
          <button
            onClick={clearImage}
            className="absolute -top-2 -right-2 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="h-5 w-5" />
        </Button>

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
          disabled={(!message.trim() && !imageFile) || sending}
          className="shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}