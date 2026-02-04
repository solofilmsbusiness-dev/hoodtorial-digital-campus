import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clapperboard, Video } from "lucide-react";

interface Headline {
  title: string;
  subtitle: string;
}

const signUpHeadlines: Headline[] = [
  { title: "Your Director's Chair Awaits", subtitle: "Join 500+ filmmakers writing their origin story" },
  { title: "The Industry Needs Your Vision", subtitle: "Create your account. Begin your legacy." },
  { title: "Ready to Make History?", subtitle: "Every legend started with a single frame" },
  { title: "Claim Your Seat in the Room", subtitle: "Where the next generation of cinema is born" },
];

const signInHeadlines: Headline[] = [
  { title: "The Set is Ready", subtitle: "Your crew missed you. Let's get back to work." },
  { title: "Welcome Back, Filmmaker", subtitle: "Your next lesson is waiting" },
  { title: "Roll Camera", subtitle: "Pick up where you left off" },
  { title: "The Hustle Continues", subtitle: "Your journey is far from over" },
];

interface WelcomeHeadlinesProps {
  isSignUp: boolean;
}

export function WelcomeHeadlines({ isSignUp }: WelcomeHeadlinesProps) {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const lastUserName = typeof window !== 'undefined' ? localStorage.getItem('hoodtorial-last-user') : null;
  
  const headlines = isSignUp ? signUpHeadlines : signInHeadlines;
  const currentHeadline = headlines[headlineIndex];
  
  // Personalized welcome for returning users
  const displayTitle = !isSignUp && lastUserName 
    ? `Welcome Back, ${lastUserName}` 
    : currentHeadline.title;

  useEffect(() => {
    // Reset index when switching between sign up/sign in
    setHeadlineIndex(0);
  }, [isSignUp]);

  useEffect(() => {
    // Don't rotate if we're showing personalized greeting
    if (!isSignUp && lastUserName) return;
    
    const interval = setInterval(() => {
      setHeadlineIndex(prev => (prev + 1) % headlines.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isSignUp, lastUserName, headlines.length]);

  return (
    <div className="text-center mb-6">
      {/* Animated Film Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex justify-center mb-3"
      >
        {isSignUp ? (
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Clapperboard className="h-8 w-8 text-primary" />
          </motion.div>
        ) : (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Video className="h-8 w-8 text-primary" />
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${isSignUp}-${headlineIndex}-${lastUserName || 'guest'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main Headline with Gold Gradient */}
          <h2 className="heading-4 text-foreground relative">
            <motion.span 
              className="text-gold-gradient inline-block"
              animate={{ 
                textShadow: [
                  "0 0 10px hsl(var(--primary) / 0.3)",
                  "0 0 20px hsl(var(--primary) / 0.5)",
                  "0 0 10px hsl(var(--primary) / 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {displayTitle}
            </motion.span>
          </h2>
          
          {/* Subtitle with Staggered Fade */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-sm text-muted-foreground mt-2"
          >
            {currentHeadline.subtitle}
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
