import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, Film, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import defaultLogo from "@/assets/hero-logo.png";
import defaultVideo from "@/assets/hero-video.mp4";
import { motion } from "framer-motion";
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
  
  // Dynamic media URLs (fall back to static imports)
  const [videoUrl, setVideoUrl] = useState<string>(defaultVideo);
  const [logoUrl, setLogoUrl] = useState<string>(defaultLogo);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [isMusicEnabled, setIsMusicEnabled] = useState(() => {
    return localStorage.getItem('hoodtorial-login-music-enabled') !== 'false';
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Fetch custom login media from site_settings
  useEffect(() => {
    const fetchSiteMedia = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("id, value")
          .in("id", ["login_video_url", "login_logo_url", "login_music_url"]);

        data?.forEach((setting) => {
          if (setting.id === "login_video_url" && setting.value) {
            setVideoUrl(setting.value);
          }
          if (setting.id === "login_logo_url" && setting.value) {
            setLogoUrl(setting.value);
          }
          if (setting.id === "login_music_url" && setting.value) {
            setMusicUrl(setting.value);
          }
        });
      } catch (err) {
        console.error("Error fetching site settings:", err);
        // Continue with defaults on error
      }
    };

    fetchSiteMedia();
  }, []);

  // Handle audio playback based on user preference
  useEffect(() => {
    if (!musicUrl || !audioRef.current) return;

    const audio = audioRef.current;
    audio.volume = 0.3;

    // Try to play if user has enabled music
    if (isMusicEnabled) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented - wait for user interaction
        });
      }
    }
  }, [musicUrl, isMusicEnabled]);

  // Handle first user interaction to enable audio (browser autoplay policy)
  useEffect(() => {
    if (!musicUrl || !isMusicEnabled) return;

    const handleInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
      document.removeEventListener('click', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    return () => document.removeEventListener('click', handleInteraction);
  }, [musicUrl, isMusicEnabled]);

  const toggleMusic = () => {
    const newState = !isMusicEnabled;
    setIsMusicEnabled(newState);
    localStorage.setItem('hoodtorial-login-music-enabled', String(newState));
    
    if (audioRef.current) {
      if (newState) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  };

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Audio */}
      {musicUrl && (
        <audio
          ref={audioRef}
          src={musicUrl}
          loop
          preload="auto"
        />
      )}

      {/* Music Toggle Button */}
      {musicUrl && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4 }}
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card transition-colors group"
          aria-label={isMusicEnabled ? "Mute music" : "Unmute music"}
        >
          {isMusicEnabled ? (
            <Volume2 className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          ) : (
            <VolumeX className="h-5 w-5 text-muted-foreground group-hover:scale-110 transition-transform" />
          )}
        </motion.button>
      )}

      {/* Full-screen Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        key={videoUrl}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-background/80 z-[5]" />

      {/* Film Overlay Effects */}
      <FilmOverlay />

      {/* Centered Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 2.5, ease: "easeOut" }}
            className="text-center mt-12 -mb-14 md:-mb-20 relative z-10"
          >
            <img 
              src={logoUrl}
              alt="Hoodtorial University" 
              className="h-48 md:h-64 w-auto mx-auto animate-logo-pulse"
            />
          </motion.div>

          {/* University Name */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 3.0, ease: "easeOut" }}
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
            transition={{ duration: 1.5, delay: 3.5, ease: "easeOut" }}
            className="mt-8 relative"
          >
            {/* Animated border glow */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-neon-purple to-primary rounded-lg opacity-30 blur-sm animate-border-flow" />
            
            <div className="relative backdrop-blur-xl bg-card/70 border border-border/50 rounded-lg p-6 md:p-8 shadow-2xl">
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
