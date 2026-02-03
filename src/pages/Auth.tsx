import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroLogo from "@/assets/hero-logo.png";
import heroVideo from "@/assets/hero-video.mp4";
import { motion } from "framer-motion";
import { FilmCountdown } from "@/components/auth/FilmCountdown";
import { RotatingQuotes } from "@/components/auth/RotatingQuotes";
import { SocialProof } from "@/components/auth/SocialProof";
import { FilmOverlay } from "@/components/auth/FilmOverlay";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(4, "Password must be at least 4 characters");

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; displayName?: string }>({});
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/student";
    navigate(from, { replace: true });
    return null;
  }

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; displayName?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    if (isSignUp && !displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              variant: "destructive",
              title: "Account exists",
              description: "This email is already registered. Try signing in instead.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Sign up failed",
              description: error.message,
            });
          }
        } else {
          toast({
            title: "Check your email",
            description: "We sent you a confirmation link. Please verify your email to continue.",
          });
        }
      } else {
        const { error, data } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              variant: "destructive",
              title: "Invalid credentials",
              description: "Email or password is incorrect. Please try again.",
            });
          } else if (error.message.includes("Email not confirmed")) {
            toast({
              variant: "destructive",
              title: "Email not verified",
              description: "Please check your email and verify your account first.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Sign in failed",
              description: error.message,
            });
          }
        } else if (data?.user) {
          // Check if profile is complete and assessment is done
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", data.user.id)
            .maybeSingle();
          
          // Check if user has completed assessment
          const { data: assessmentResults } = await supabase
            .from("assessment_results")
            .select("id")
            .eq("user_id", data.user.id)
            .limit(1);
          
          const hasCompletedAssessment = assessmentResults && assessmentResults.length > 0;
          
          if (!profile?.display_name) {
            toast({
              title: "Complete your profile",
              description: "Please fill out your profile to get started.",
            });
            navigate("/student/profile", { replace: true });
          } else if (!hasCompletedAssessment) {
            toast({
              title: "Take your entry assessment",
              description: "Complete a quick assessment to get personalized course recommendations.",
            });
            navigate("/assessment", { replace: true });
          } else {
            const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/student";
            navigate(from, { replace: true });
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Film Countdown Overlay */}
      <FilmCountdown />

      {/* Left: Cinematic Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        {/* Film Overlay Effects */}
        <FilmOverlay />

        {/* Rotating Quotes */}
        <RotatingQuotes />

        {/* Film reel decoration */}
        <motion.div
          initial={{ opacity: 0, rotate: -180 }}
          animate={{ opacity: 0.1, rotate: 0 }}
          transition={{ duration: 2, delay: 4 }}
          className="absolute top-20 left-1/2 -translate-x-1/2 z-10"
        >
          <Film className="w-32 h-32 text-primary" />
        </motion.div>
      </div>

      {/* Mobile: Compact Video Hero */}
      <div className="lg:hidden relative h-48 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background z-10" />
        
        {/* Mobile Logo */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <motion.img
            src={heroLogo}
            alt="Hoodtorial University"
            className="h-20 w-auto logo-glow"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 3.5 }}
          />
        </div>
      </div>

      {/* Right: Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 lg:py-0 bg-background relative">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] bg-neon-purple/5 rounded-full blur-[120px]" />

        <div className="w-full max-w-md relative z-10">
          {/* Desktop Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 3.5 }}
            className="hidden lg:block text-center mb-8"
          >
            <img 
              src={heroLogo} 
              alt="Hoodtorial University" 
              className="h-24 w-auto mx-auto animate-logo-pulse"
            />
          </motion.div>

          {/* University Name */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 3.7 }}
            className="text-center mb-2"
          >
            <h1 className="heading-3 lg:heading-2">
              <span className="block">HOODTORIAL</span>
              <span className="block text-gold-gradient text-glow">UNIVERSITY</span>
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mt-2">
              Where Hustle Meets Hollywood
            </p>
          </motion.div>

          {/* Glass-Morphism Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 3.9 }}
            className="mt-8 relative"
          >
            {/* Animated border glow */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-neon-purple to-primary rounded-lg opacity-30 blur-sm animate-border-flow" />
            
            <div className="relative backdrop-blur-xl bg-card/60 border border-border/50 rounded-lg p-6 md:p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h2 
                  key={isSignUp ? 'signup' : 'signin'} 
                  className="heading-4 text-foreground"
                >
                  {isSignUp ? "Join the University" : "Welcome Back"}
                </h2>
                <p 
                  key={isSignUp ? 'signup-desc' : 'signin-desc'} 
                  className="text-sm text-muted-foreground mt-1"
                >
                  {isSignUp 
                    ? "Create your account to start your journey" 
                    : "Sign in to access your Student Center"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Display Name (Sign Up only) */}
                <div 
                  className={`space-y-2 overflow-hidden transition-all duration-300 ease-out ${
                    isSignUp ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <Label htmlFor="displayName" className="text-xs font-bold uppercase tracking-wide">
                    Display Name
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className="pl-10 bg-background/50 border-2 border-border focus:border-primary transition-all"
                      tabIndex={isSignUp ? 0 : -1}
                    />
                  </div>
                  {errors.displayName && (
                    <p className="text-sm text-destructive">{errors.displayName}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wide">
                    Email
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-10 bg-background/50 border-2 border-border focus:border-primary transition-all"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wide">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 bg-background/50 border-2 border-border focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-brutal group relative overflow-hidden"
                >
                  <span className="relative z-10">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Film className="w-4 h-4 animate-spin" />
                        Rolling...
                      </span>
                    ) : (
                      isSignUp ? "Create Account" : "Sign In"
                    )}
                  </span>
                </Button>
              </form>

              {/* Toggle Sign In/Up */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setErrors({});
                    }}
                    className="ml-2 text-primary font-bold hover:underline"
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Social Proof */}
          <SocialProof />
        </div>
      </div>
    </div>
  );
}
