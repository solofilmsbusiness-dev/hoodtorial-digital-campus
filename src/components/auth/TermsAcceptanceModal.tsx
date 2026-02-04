import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Check, Clock, BookOpen, Users, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface TermsAcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccepted: () => void;
}

export function TermsAcceptanceModal({ isOpen, onClose, onAccepted }: TermsAcceptanceModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const trialFeatures = [
    { icon: BookOpen, text: "Access first 2 modules of any course" },
    { icon: Users, text: "View community discussions" },
    { icon: Clock, text: "3 days of free access" },
    { icon: Award, text: "Take module quizzes" },
  ];

  const handleAcceptTerms = async () => {
    if (!user || !accepted) return;

    setLoading(true);
    try {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

      const { error } = await supabase
        .from("profiles")
        .update({
          terms_accepted_at: now.toISOString(),
          subscription_status: "trial",
          trial_started_at: now.toISOString(),
          trial_ends_at: trialEnd.toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Welcome to Hoodtorial University! 🎬",
        description: "Your 3-day free trial has started. Explore and enjoy!",
      });

      onAccepted();
    } catch (err) {
      console.error("Error accepting terms:", err);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again.",
      });
    } finally {
      setLoading(false);
    }
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

          {/* Film grain overlay */}
          <div className="absolute inset-0 film-grain pointer-events-none opacity-30" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-lg"
          >
            {/* Animated border glow */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-neon-purple to-primary rounded-lg opacity-50 blur-sm animate-border-flow" />

            <div className="relative bg-card border-2 border-border rounded-lg p-8 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center"
                >
                  <Award className="w-8 h-8 text-primary" />
                </motion.div>
                <h2 className="heading-3 text-foreground mb-2">
                  Welcome to the University!
                </h2>
                <p className="text-muted-foreground">
                  Start your 3-day free trial and explore mobile filmmaking
                </p>
              </div>

              {/* Trial Features */}
              <div className="space-y-3 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Your Trial Includes:
                </h3>
                <div className="grid gap-2">
                  {trialFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border"
                    >
                      <feature.icon className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-sm text-foreground">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Terms Summary */}
              <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border text-xs text-muted-foreground space-y-2">
                <p>
                  <strong>Terms of Service Summary:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Content is for personal educational use only</li>
                  <li>Respect community guidelines and fellow students</li>
                  <li>Trial converts to paid subscription after 3 days</li>
                  <li>You can cancel anytime before trial ends</li>
                </ul>
              </div>

              {/* Checkbox */}
              <div className="flex items-start gap-3 mb-6">
                <Checkbox
                  id="terms"
                  checked={accepted}
                  onCheckedChange={(checked) => setAccepted(checked === true)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-foreground cursor-pointer">
                  I agree to the{" "}
                  <a href="/terms" className="text-primary hover:underline" target="_blank">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-primary hover:underline" target="_blank">
                    Privacy Policy
                  </a>
                  , and I understand my 3-day free trial will begin immediately.
                </Label>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleAcceptTerms}
                  disabled={!accepted || loading}
                  className="w-full btn-brutal group relative overflow-hidden"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Starting your trial...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      Start My 3-Day Free Trial
                    </span>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  No credit card required • Cancel anytime
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
