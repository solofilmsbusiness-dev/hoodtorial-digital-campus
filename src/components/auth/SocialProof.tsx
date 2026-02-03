import { motion } from "framer-motion";
import { Users } from "lucide-react";

export function SocialProof() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="flex items-center justify-center gap-3 mt-8"
    >
      {/* Stacked avatars */}
      <div className="flex -space-x-3">
        {[
          "bg-primary/40",
          "bg-neon-purple/40",
          "bg-neon-pink/40",
          "bg-accent/40",
        ].map((color, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full ${color} border-2 border-background flex items-center justify-center`}
            style={{ zIndex: 4 - i }}
          >
            <Users className="w-3 h-3 text-foreground/70" />
          </div>
        ))}
      </div>
      
      <span className="text-sm text-muted-foreground">
        Join{" "}
        <span className="text-primary font-bold">500+</span>{" "}
        aspiring filmmakers
      </span>
    </motion.div>
  );
}
