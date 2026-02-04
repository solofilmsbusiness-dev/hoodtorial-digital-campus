import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Award, BookOpen, Users, Zap, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  tierName: string;
  onClose: () => void;
}

export function PaymentSuccessModal({ isOpen, tierName, onClose }: PaymentSuccessModalProps) {
  const navigate = useNavigate();
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);

  // Generate confetti on mount
  useEffect(() => {
    if (isOpen) {
      const colors = ["#D4AF37", "#9b87f5", "#22c55e", "#f97316", "#ffffff"];
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setConfetti(particles);
    }
  }, [isOpen]);

  const tierFeatures: Record<string, { icon: typeof BookOpen; text: string }[]> = {
    freshman: [
      { icon: BookOpen, text: "4 foundational courses" },
      { icon: Check, text: "Module quizzes" },
      { icon: Users, text: "Community access" },
    ],
    sophomore: [
      { icon: BookOpen, text: "All 16 courses" },
      { icon: Zap, text: "Final exams & projects" },
      { icon: Users, text: "Priority Discord" },
      { icon: Award, text: "Completion certificates" },
    ],
    graduate: [
      { icon: Star, text: "Everything in Sophomore" },
      { icon: Award, text: "Official HU degree" },
      { icon: Users, text: "1-on-1 mentorship" },
      { icon: Zap, text: "Industry networking" },
    ],
  };

  const features = tierFeatures[tierName.toLowerCase()] || tierFeatures.freshman;

  const handleStartLearning = () => {
    onClose();
    navigate("/student");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />

          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confetti.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ y: -20, x: `${particle.x}vw`, opacity: 1 }}
                animate={{ y: "110vh", opacity: 0 }}
                transition={{
                  duration: 3,
                  delay: particle.delay,
                  ease: "easeIn",
                }}
                className="absolute w-2 h-2 rounded-full"
                style={{ backgroundColor: particle.color }}
              />
            ))}
          </div>

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="relative w-full max-w-md"
          >
            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-accent to-primary rounded-lg opacity-70 blur-sm animate-border-flow" />

            <div className="relative bg-card border-2 border-primary rounded-lg p-8 shadow-2xl text-center">
              {/* Success checkmark */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/20 border-4 border-accent flex items-center justify-center"
              >
                <Check className="w-10 h-10 text-accent" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="heading-3 text-foreground mb-2"
              >
                Welcome to{" "}
                <span className="text-gold-gradient capitalize">{tierName}!</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-6"
              >
                Your subscription is now active. Here's what you've unlocked:
              </motion.p>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-3 mb-8"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border"
                  >
                    <feature.icon className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-foreground">{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Button onClick={handleStartLearning} className="w-full btn-brutal">
                  Start Learning
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
