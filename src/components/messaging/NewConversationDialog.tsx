import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFriendships } from "@/hooks/useFriendships";
import { useConversations } from "@/hooks/useConversations";

interface NewConversationDialogProps {
  onConversationCreated: (id: string) => void;
}

export function NewConversationDialog({ onConversationCreated }: NewConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState<string | null>(null);
  const { friends, loading } = useFriendships();
  const { getOrCreateConversation } = useConversations();

  const filteredFriends = friends.filter((f) =>
    f.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  const handleSelect = async (friendId: string) => {
    setCreating(friendId);
    const conversationId = await getOrCreateConversation(friendId);
    if (conversationId) {
      onConversationCreated(conversationId);
      setOpen(false);
      setSearch("");
    }
    setCreating(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          New Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search friends..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="max-h-72">
            {loading ? (
              <p className="text-center py-4 text-muted-foreground text-sm">Loading...</p>
            ) : filteredFriends.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  {friends.length === 0
                    ? "Add some friends first to start messaging!"
                    : "No friends match your search."}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredFriends.map((friend) => (
                  <button
                    key={friend.user_id}
                    onClick={() => handleSelect(friend.user_id)}
                    disabled={creating === friend.user_id}
                    className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors rounded-lg text-left disabled:opacity-50"
                  >
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={friend.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                        {getInitials(friend.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">
                      {friend.display_name || "Unknown User"}
                    </span>
                    {creating === friend.user_id && (
                      <span className="ml-auto text-xs text-muted-foreground">Opening...</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
