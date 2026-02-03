import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function FilmCountdown() {
  const [count, setCount] = useState(3);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount((prev) => prev - 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (count === 0) {
      const hideTimer = setTimeout(() => {
        setShow(false);
      }, 1200);
      return () => clearTimeout(hideTimer);
    }
  }, [count]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={count}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1.2 }}
        exit={{ opacity: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <div className="relative">
          {/* Circular frame */}
          <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-primary/50 flex items-center justify-center relative">
            {/* Animated ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-primary"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            
            {/* Count or ACTION text */}
            <motion.span
              className={`font-black uppercase tracking-tighter ${
                count > 0 
                  ? "text-7xl md:text-9xl text-primary text-glow" 
                  : "text-3xl md:text-5xl text-gold-gradient"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {count > 0 ? count : "ACTION!"}
            </motion.span>
          </div>
          
          {/* Film sprocket holes */}
          <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-around">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-sm bg-primary/30" />
            ))}
          </div>
          <div className="absolute -right-8 top-0 bottom-0 flex flex-col justify-around">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-sm bg-primary/30" />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
