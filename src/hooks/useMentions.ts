import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MentionUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

// Parse @mentions from text and return user IDs
export function parseMentions(text: string, users: MentionUser[]): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    const username = match[1].toLowerCase();
    const user = users.find(u => 
      u.display_name?.toLowerCase().replace(/\s+/g, '') === username ||
      u.display_name?.toLowerCase() === username
    );
    if (user && !mentions.includes(user.id)) {
      mentions.push(user.id);
    }
  }

  return mentions;
}

// Highlight mentions in text
export function highlightMentions(text: string): string {
  return text.replace(/@(\w+)/g, '<span class="text-primary font-bold">@$1</span>');
}

export function useMentions() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Fetch all users for mention autocomplete (using limited public view for privacy)
  const { data: allUsers = [] } = useQuery({
    queryKey: ['mention-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles_public')
        .select('user_id, display_name, avatar_url')
        .not('display_name', 'is', null)
        .order('display_name');

      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.user_id!,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
      })) as MentionUser[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    // Show top 5 users when @ is typed with no query yet
    if (searchQuery === "") {
      return allUsers
        .filter(u => u.id !== user?.id)
        .slice(0, 5);
    }
    // Filter by search query
    const query = searchQuery.toLowerCase();
    return allUsers
      .filter(u => 
        u.id !== user?.id &&
        u.display_name?.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [allUsers, searchQuery, user?.id]);

  // Create notifications for mentioned users
  const createMentionNotifications = useCallback(async (
    mentionedUserIds: string[],
    referenceType: 'post' | 'comment',
    referenceId: string,
    postId: string,
    contentPreview: string
  ) => {
    if (!user || mentionedUserIds.length === 0) return;

    const notifications = mentionedUserIds
      .filter(id => id !== user.id) // Don't notify yourself
      .map(userId => ({
        user_id: userId,
        sender_id: user.id,
        type: 'mention',
        reference_type: referenceType,
        reference_id: referenceId,
        post_id: postId,
        content_preview: contentPreview.slice(0, 100),
      }));

    if (notifications.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) {
      console.error('Failed to create mention notifications:', error);
    }
  }, [user]);

  return {
    allUsers,
    filteredUsers,
    searchQuery,
    setSearchQuery,
    isSearching,
    setIsSearching,
    parseMentions: (text: string) => parseMentions(text, allUsers),
    createMentionNotifications,
  };
}
