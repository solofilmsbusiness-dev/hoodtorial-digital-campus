import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const quotes = [
  { text: "Your story starts now.", author: "The Dean" },
  { text: "Every legend starts somewhere.", author: "Class of '25" },
  { text: "Cut the excuses. Roll camera.", author: "The Code" },
  { text: "The industry won't wait.", author: "HU Alumni" },
  { text: "Craft over clout. Always.", author: "The Faculty" },
];

export function RotatingQuotes() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentQuote = quotes[currentIndex];

  return (
    <div className="absolute bottom-20 left-8 right-8 z-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Quote marks */}
          <span className="absolute -top-6 -left-2 text-6xl text-primary/20 font-serif">
            "
          </span>
          
          {/* Quote text with typewriter effect */}
          <p className="text-2xl md:text-3xl font-bold text-foreground leading-tight pl-4 border-l-4 border-primary">
            {currentQuote.text}
          </p>
          
          {/* Author */}
          <p className="mt-3 text-sm uppercase tracking-widest text-muted-foreground pl-4">
            — {currentQuote.author}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Quote indicator dots */}
      <div className="flex gap-2 mt-6 pl-4">
        {quotes.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentIndex 
                ? "bg-primary w-6" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
