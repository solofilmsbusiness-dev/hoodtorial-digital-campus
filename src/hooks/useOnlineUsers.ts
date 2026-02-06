import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useOnlineUsers() {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let channelRef: ReturnType<typeof supabase.channel> | null = null;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const presenceKey = user?.id || `admin-reader-${Math.random().toString(36).substring(7)}`;

      const channel = supabase.channel("online-users", {
        config: { presence: { key: presenceKey } },
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
            await channel.track({
              online_at: new Date().toISOString(),
              user_id: user?.id || null,
            });
          }
        });

      return channel;
    };

    setup().then((ch) => { channelRef = ch; });

    return () => {
      if (channelRef) supabase.removeChannel(channelRef);
    };
  }, []);

  return { onlineUserIds, onlineCount: onlineUserIds.size };
}
