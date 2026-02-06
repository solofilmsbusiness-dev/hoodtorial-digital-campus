import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useOnlineUsers() {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: `admin-reader-${Math.random().toString(36).substring(7)}`,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const ids = new Set<string>();
        Object.values(state).forEach((presences) => {
          presences.forEach((p: any) => {
            if (p.user_id) ids.add(p.user_id);
          });
        });
        setOnlineUserIds(ids);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Track with no user_id so this reader doesn't count as a user
          await channel.track({ reader: true });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { onlineUserIds, onlineCount: onlineUserIds.size };
}
