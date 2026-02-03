import { TrendingUp, TrendingDown, Minus, Trophy, Target, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useCelebrationSound } from "@/hooks/useCelebrationSound";
interface ScoreComparisonProps {
  previousScores: Record<string, number>;
  currentScores: Record<string, number>;
  previousTotal: number;
  currentTotal: number;
}

const departmentLabels: Record<string, string> = {
  cinematography: "Cinematography",
  "post-production": "Post-Production",
  directing: "Directing",
  production: "Production",
  photography: "Photography",
  "camera-systems": "Camera Systems",
};

// Animated counter component
function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1500;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(interval);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return <span>{displayValue}</span>;
}

// Confetti particle component
function ConfettiParticle({ index }: { index: number }) {
  const colors = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--neon-pink))"];
  const color = colors[index % colors.length];
  const angle = (index * 45) + Math.random() * 20;
  const distance = 80 + Math.random() * 40;
  
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
      initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
      animate={{
        scale: [0, 1, 0.5],
        x: Math.cos(angle * Math.PI / 180) * distance,
        y: Math.sin(angle * Math.PI / 180) * distance,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 0.8,
        delay: 0.3 + index * 0.05,
        ease: "easeOut",
      }}
    />
  );
}

function ScoreChange({ previous, current, delay = 0 }: { previous: number; current: number; delay?: number }) {
  const diff = current - previous;
  
  if (diff > 0) {
    return (
      <motion.div 
        className="flex items-center gap-1 text-green-500"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: delay + 0.5, duration: 0.3 }}
      >
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ delay: delay + 0.8, duration: 0.4 }}
        >
          <TrendingUp className="w-4 h-4" />
        </motion.div>
        <span className="text-sm font-bold">+{diff}%</span>
      </motion.div>
    );
  }
  
  if (diff < 0) {
    return (
      <motion.div 
        className="flex items-center gap-1 text-red-500"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: delay + 0.5, duration: 0.3 }}
      >
        <TrendingDown className="w-4 h-4" />
        <span className="text-sm font-bold">{diff}%</span>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className="flex items-center gap-1 text-muted-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay + 0.5 }}
    >
      <Minus className="w-4 h-4" />
      <span className="text-sm">No change</span>
    </motion.div>
  );
}

export function ScoreComparison({ 
  previousScores, 
  currentScores, 
  previousTotal, 
  currentTotal 
}: ScoreComparisonProps) {
  const totalDiff = currentTotal - previousTotal;
  const isImproved = totalDiff > 0;
  const hasDeclined = totalDiff < 0;
  const { playSuccessChime, playLevelUp, playTick } = useCelebrationSound();
  const hasPlayedCelebration = useRef(false);
  
  // Play celebration sounds on mount if improved
  useEffect(() => {
    if (isImproved && !hasPlayedCelebration.current) {
      hasPlayedCelebration.current = true;
      
      // Play level up sound when component mounts
      const levelUpTimer = setTimeout(() => {
        playLevelUp();
      }, 400);
      
      // Play success chime when "Great improvement!" badge appears
      const chimeTimer = setTimeout(() => {
        playSuccessChime();
      }, 1200);
      
      return () => {
        clearTimeout(levelUpTimer);
        clearTimeout(chimeTimer);
      };
    }
  }, [isImproved, playLevelUp, playSuccessChime]);
  
  // Play tick sounds for each department that improved
  useEffect(() => {
    if (!isImproved || hasPlayedCelebration.current === false) return;
    
    const allDepts = [...new Set([...Object.keys(previousScores), ...Object.keys(currentScores)])];
    
    allDepts.forEach((dept, index) => {
      const prev = previousScores[dept] ?? 0;
      const curr = currentScores[dept] ?? 0;
      
      if (curr > prev) {
        setTimeout(() => {
          playTick(1 + index * 0.1);
        }, 800 + index * 150);
      }
    });
  }, [previousScores, currentScores, isImproved, playTick]);
  
  // Get all departments from both scores
  const allDepartments = [...new Set([
    ...Object.keys(previousScores),
    ...Object.keys(currentScores)
  ])];

  return (
    <div className="space-y-6">
      {/* Overall Score Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={cn(
          "border-2 overflow-hidden relative",
          isImproved ? "border-green-500/50 bg-green-500/5" : 
          hasDeclined ? "border-red-500/50 bg-red-500/5" : 
          "border-primary/50 bg-primary/5"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-8">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="text-sm text-muted-foreground mb-1">Previous</div>
                <div className="text-3xl font-bold text-muted-foreground">
                  <AnimatedNumber value={previousTotal} delay={300} />%
                </div>
              </motion.div>
              
              <motion.div 
                className="flex flex-col items-center relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              >
                {isImproved ? (
                  <>
                    {/* Confetti burst for improvement */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {[...Array(8)].map((_, i) => (
                        <ConfettiParticle key={i} index={i} />
                      ))}
                    </div>
                    <motion.div
                      animate={{ 
                        y: [0, -5, 0],
                        rotate: [0, -5, 5, 0]
                      }}
                      transition={{ 
                        delay: 0.8, 
                        duration: 0.6,
                        repeat: 2,
                        repeatType: "reverse"
                      }}
                    >
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </motion.div>
                    <motion.span 
                      className="text-lg font-bold text-green-500"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, type: "spring" }}
                    >
                      +{totalDiff}%
                    </motion.span>
                  </>
                ) : hasDeclined ? (
                  <>
                    <motion.div
                      animate={{ y: [0, 3, 0] }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                    >
                      <TrendingDown className="w-8 h-8 text-red-500" />
                    </motion.div>
                    <span className="text-lg font-bold text-red-500">{totalDiff}%</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Same</span>
                  </>
                )}
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="text-sm text-muted-foreground mb-1">Current</div>
                <motion.div 
                  className="text-3xl font-bold text-primary"
                  animate={isImproved ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ delay: 1.5, duration: 0.3 }}
                >
                  <AnimatedNumber value={currentTotal} delay={500} />%
                </motion.div>
              </motion.div>
            </div>
            
            <AnimatePresence>
              {isImproved && (
                <motion.div 
                  className="mt-4 text-center"
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
                >
                  <motion.div 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-500"
                    animate={{ 
                      boxShadow: [
                        "0 0 0 0 rgba(34, 197, 94, 0)",
                        "0 0 0 10px rgba(34, 197, 94, 0.1)",
                        "0 0 0 0 rgba(34, 197, 94, 0)"
                      ]
                    }}
                    transition={{ delay: 1.5, duration: 1, repeat: 2 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ delay: 1.4, duration: 0.5 }}
                    >
                      <Trophy className="w-5 h-5" />
                    </motion.div>
                    <span className="font-semibold">Great improvement!</span>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ delay: 1.6, duration: 0.3, repeat: 2 }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {hasDeclined && (
              <motion.div 
                className="mt-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground">
                  <Target className="w-5 h-5" />
                  <span className="font-medium">Keep practicing—you've got this!</span>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Department Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Department Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {allDepartments.map((dept, index) => {
              const prev = previousScores[dept] ?? 0;
              const curr = currentScores[dept] ?? 0;
              const label = departmentLabels[dept] || dept;
              const improved = curr > prev;
              
              return (
                <motion.div 
                  key={dept} 
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{label}</div>
                    <div className="flex items-center gap-3 mt-1">
                      {/* Progress bars */}
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
                        {/* Previous score (ghost) */}
                        <motion.div 
                          className="absolute inset-y-0 left-0 bg-muted-foreground/30 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${prev}%` }}
                          transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                        />
                        {/* Current score */}
                        <motion.div 
                          className={cn(
                            "absolute inset-y-0 left-0 rounded-full",
                            curr > prev ? "bg-green-500" : 
                            curr < prev ? "bg-red-500" : 
                            "bg-primary"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${curr}%` }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                        />
                        {/* Shine effect on improvement */}
                        {improved && (
                          <motion.div
                            className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            initial={{ x: "-100%" }}
                            animate={{ x: "200%" }}
                            transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <motion.div 
                      className="text-sm text-muted-foreground w-12 text-right"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      {prev}%
                    </motion.div>
                    <motion.div 
                      className="text-sm font-medium w-12 text-right"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.1, type: "spring" }}
                    >
                      {curr}%
                    </motion.div>
                    <div className="w-20">
                      <ScoreChange previous={prev} current={curr} delay={0.5 + index * 0.1} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
