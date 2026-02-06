import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LivePresenceIndicator() {
  const [onlineCount, setOnlineCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let presenceKey = `anon-${Math.random().toString(36).substring(7)}`;

    const setupChannel = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) presenceKey = user.id;

      const channel = supabase.channel("online-users", {
        config: {
          presence: {
            key: presenceKey,
          },
        },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const count = Object.keys(state).length;
          setOnlineCount(count);
          setIsConnected(true);
        })
        .on("presence", { event: "join" }, () => {
          setOnlineCount((prev) => prev + 1);
        })
        .on("presence", { event: "leave" }, () => {
          setOnlineCount((prev) => Math.max(0, prev - 1));
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

    let channelRef: ReturnType<typeof supabase.channel> | null = null;
    setupChannel().then((ch) => { channelRef = ch; });

    return () => {
      if (channelRef) {
        supabase.removeChannel(channelRef);
      }
    };
  }, []);

  if (!isConnected) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30"
    >
      {/* Pulsing dot */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
      </span>
      
      <span className="text-xs font-bold text-accent">
        <AnimatePresence mode="wait">
          <motion.span
            key={onlineCount}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="inline-block"
          >
            {onlineCount}
          </motion.span>
        </AnimatePresence>
        {" "}online
      </span>
      
      <Users className="h-3 w-3 text-accent" />
    </motion.div>
  );
}
