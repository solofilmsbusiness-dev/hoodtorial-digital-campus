import { useState } from "react";
import { useGalleryComments } from "@/hooks/useGalleryComments";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  galleryOwnerId: string;
  imageUrl: string;
}

export function GalleryCommentThread({ galleryOwnerId, imageUrl }: Props) {
  const { user } = useAuth();
  const { comments, isLoading, addComment, deleteComment } = useGalleryComments(galleryOwnerId, imageUrl);
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addComment.mutateAsync(text.trim());
    setText("");
  };

  return (
    <div className="space-y-3 pt-3 border-t border-border">
      <h4 className="text-sm font-semibold text-foreground">Comments</h4>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2 group">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage src={c.profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-[10px]">
                  {(c.profile?.display_name ?? "?").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-foreground truncate">
                    {c.profile?.display_name ?? "User"}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{c.content}</p>
              </div>
              {user?.id === c.user_id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0"
                  onClick={() => deleteComment.mutate(c.id)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="text-xs h-8"
          />
          <Button type="submit" size="icon" className="h-8 w-8 shrink-0" disabled={!text.trim() || addComment.isPending}>
            {addComment.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          </Button>
        </form>
      )}
    </div>
  );
}
