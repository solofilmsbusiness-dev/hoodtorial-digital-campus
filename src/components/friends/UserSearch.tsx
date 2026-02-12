import { useState, useEffect } from "react";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { AddFriendButton } from "./AddFriendButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfileLink } from "@/components/profile/UserProfileLink";
import { Skeleton } from "@/components/ui/skeleton";

interface PublicProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function UserSearch() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      setSearched(true);
      try {
        const { data, error } = await supabase
          .from("profiles_public")
          .select("user_id, display_name, avatar_url")
          .ilike("display_name", `%${query.trim()}%`)
          .neq("user_id", user?.id || "")
          .limit(20);

        if (error) throw error;
        setResults((data as PublicProfile[]) || []);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, user?.id]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No students found matching "{query}"</p>
        </div>
      )}

      {!loading && !searched && (
        <div className="text-center py-8">
          <Search className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Search for students to add as friends</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((profile) => (
            <Card key={profile.user_id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
              <UserProfileLink
                userId={profile.user_id}
                displayName={profile.display_name}
                avatarUrl={profile.avatar_url}
                size="lg"
                className="flex-1 min-w-0"
              />
              <AddFriendButton userId={profile.user_id} size="sm" variant="default" showLabel />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
