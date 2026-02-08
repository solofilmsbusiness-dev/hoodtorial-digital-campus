import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, Loader2, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import defaultLogo from "@/assets/hero-logo.png";
import defaultVideo from "@/assets/hero-video.mp4";
import { motion } from "framer-motion";
import { SocialProof } from "@/components/auth/SocialProof";
import { FilmOverlay } from "@/components/auth/FilmOverlay";
import { TermsAcceptanceModal } from "@/components/auth/TermsAcceptanceModal";
import { WelcomeHeadlines } from "@/components/auth/WelcomeHeadlines";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(4, "Password must be at least 4 characters");

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; displayName?: string }>({});
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [signupDisabled, setSignupDisabled] = useState(false);
  
  // Waitlist mode state
  const [isWaitlistMode, setIsWaitlistMode] = useState(false);
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistUsername, setWaitlistUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  
  // Dynamic media URLs (fall back to static imports)
  const [videoUrl, setVideoUrl] = useState<string>(defaultVideo);
  const [logoUrl, setLogoUrl] = useState<string>(defaultLogo);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [musicEnabledSetting, setMusicEnabledSetting] = useState(true);
  const [isMusicEnabled, setIsMusicEnabled] = useState(() => {
    return localStorage.getItem('hoodtorial-login-music-enabled') !== 'false';
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const isMobile = useIsMobile();
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
          .in("id", ["login_video_url", "login_logo_url", "login_music_url", "login_music_volume", "login_music_enabled", "signup_disabled"]);

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
          if (setting.id === "login_music_volume" && setting.value) {
            setMusicVolume(parseInt(setting.value) / 100);
          }
          if (setting.id === "login_music_enabled") {
            setMusicEnabledSetting(setting.value !== "false");
          }
          if (setting.id === "signup_disabled") {
            setSignupDisabled(setting.value === "true");
          }
        });
      } catch (err) {
        console.error("Error fetching site settings:", err);
        // Continue with defaults on error
      }
    };

    fetchSiteMedia();
  }, []);

  // Handle audio playback based on user preference and admin settings
  useEffect(() => {
    if (!musicUrl || !audioRef.current || !musicEnabledSetting) return;

    const audio = audioRef.current;
    audio.volume = musicVolume;

    // Try to play if user has enabled music
    if (isMusicEnabled) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented - wait for user interaction
        });
      }
    }
  }, [musicUrl, isMusicEnabled, musicEnabledSetting, musicVolume]);

  // Handle first user interaction to enable audio (browser autoplay policy)
  useEffect(() => {
    if (!musicUrl || !isMusicEnabled || !musicEnabledSetting) return;

    const handleInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
      document.removeEventListener('click', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    return () => document.removeEventListener('click', handleInteraction);
  }, [musicUrl, isMusicEnabled, musicEnabledSetting]);

  // Listen for PASSWORD_RECOVERY event
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Force sign-in mode if signup is disabled
  useEffect(() => {
    if (signupDisabled && isSignUp) {
      setIsSignUp(false);
    }
  }, [signupDisabled, isSignUp]);

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

  // Handle password reset submission
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwResult = passwordSchema.safeParse(newPassword);
    if (!pwResult.success) {
      toast({ variant: "destructive", title: "Invalid password", description: pwResult.error.errors[0].message });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({ variant: "destructive", title: "Error", description: error.message });
      } else {
        toast({ title: "Password updated!", description: "You can now sign in with your new password." });
        setIsRecoveryMode(false);
        setNewPassword("");
        navigate("/student", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already logged in (but not in recovery mode)
  if (user && !isRecoveryMode) {
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
          // Check if profile is complete, terms accepted, and assessment is done
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, terms_accepted_at, subscription_status")
            .eq("user_id", data.user.id)
            .maybeSingle();
          
          // Store user name for personalized welcome on next visit
          if (profile?.display_name) {
            localStorage.setItem('hoodtorial-last-user', profile.display_name);
          }
          
          // Check if user has completed assessment
          const { data: assessmentResults } = await supabase
            .from("assessment_results")
            .select("id")
            .eq("user_id", data.user.id)
            .limit(1);
          
          const hasCompletedAssessment = assessmentResults && assessmentResults.length > 0;
          const needsTerms = !profile?.terms_accepted_at;
          
          if (!profile?.display_name) {
            toast({
              title: "Complete your profile",
              description: "Please fill out your profile to get started.",
            });
            navigate("/student/profile", { replace: true });
          } else if (needsTerms) {
            // Show terms acceptance modal
            setShowTermsModal(true);
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

  const handleTermsAccepted = () => {
    setShowTermsModal(false);
    navigate("/assessment", { replace: true });
  };

  // Validate username format
  const validateUsername = (username: string): string | null => {
    if (!username.trim()) {
      return "Username is required";
    }
    if (username.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (username.length > 20) {
      return "Username must be 20 characters or less";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return null;
  };

  // Handle waitlist submission
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.errors[0].message });
      return;
    }
    
    const usernameValidationError = validateUsername(waitlistUsername);
    if (usernameValidationError) {
      setUsernameError(usernameValidationError);
      return;
    }
    
    setLoading(true);
    setErrors({});
    setUsernameError(null);
    
    try {
      const { error } = await supabase
        .from("waitlist")
        .insert({ 
          email, 
          name: waitlistName || null,
          desired_username: waitlistUsername.toLowerCase()
        });
      
      if (error) {
        if (error.code === "23505") {
          // Check if it's email or username duplicate
          if (error.message?.includes("desired_username")) {
            setUsernameError("This username is already taken. Please choose another.");
          } else {
            toast({
              variant: "destructive",
              title: "Already on the list",
              description: "This email is already on the waiting list.",
            });
          }
        } else {
          throw error;
        }
      } else {
        setWaitlistSuccess(true);
        toast({
          title: "You're on the list!",
          description: "We'll notify you when registration opens.",
        });
      }
    } catch (err) {
      console.error("Waitlist error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join waiting list. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Terms Acceptance Modal */}
      <TermsAcceptanceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccepted={handleTermsAccepted}
      />
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
      {musicUrl && musicEnabledSetting && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4 }}
          onClick={toggleMusic}
          className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card transition-colors group"
          aria-label={isMusicEnabled ? "Mute music" : "Unmute music"}
        >
          {isMusicEnabled ? (
            <Volume2 className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          ) : (
            <VolumeX className="h-5 w-5 text-muted-foreground group-hover:scale-110 transition-transform" />
          )}
        </motion.button>
      )}

      {/* Full-screen Background: Video on desktop, gradient on mobile */}
      {!isMobile ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="/placeholder.svg"
          key={videoUrl}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-dark via-charcoal to-charcoal-dark" />
      )}

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
            className="text-center mt-[5vh] -mb-14 md:-mb-20 relative z-10"
          >
            <img 
              src={logoUrl}
              alt="Hoodtorial University" 
              className="w-1/2 max-w-md h-auto mx-auto animate-logo-pulse"
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
              {/* Password Recovery Mode */}
              {isRecoveryMode ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Set New Password</h2>
                    <p className="text-sm text-muted-foreground">
                      Enter your new password below.
                    </p>
                  </div>
                  <form onSubmit={handlePasswordReset} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-xs font-bold uppercase tracking-wide">
                        New Password
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-10 pr-10 bg-background/50 border-2 border-border focus:border-primary transition-all"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-brutal group relative overflow-hidden"
                    >
                      <span className="relative z-10">
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Updating...
                          </span>
                        ) : (
                          "Update Password"
                        )}
                      </span>
                    </Button>
                  </form>
                </>
              ) : waitlistSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">You're on the list!</h2>
                  <p className="text-muted-foreground mb-6">
                    We'll notify you at <span className="font-semibold text-foreground">{email}</span> when registration opens.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setWaitlistSuccess(false);
                      setIsWaitlistMode(false);
                      setEmail("");
                      setWaitlistName("");
                      setWaitlistUsername("");
                    }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              ) : isWaitlistMode ? (
                /* Waitlist Form */
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold mb-2">Join the Waiting List</h2>
                    <p className="text-sm text-muted-foreground">
                      Registration is currently closed. Leave your email and we'll notify you when spots open up.
                    </p>
                  </div>
                  
                  <form onSubmit={handleWaitlistSubmit} className="space-y-5">
                    {/* Name (optional) */}
                    <div className="space-y-2">
                      <Label htmlFor="waitlistName" className="text-xs font-bold uppercase tracking-wide">
                        Name <span className="text-muted-foreground font-normal">(optional)</span>
                      </Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="waitlistName"
                          type="text"
                          value={waitlistName}
                          onChange={(e) => setWaitlistName(e.target.value)}
                          placeholder="Your name"
                          className="pl-10 bg-background/50 border-2 border-border focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    {/* Desired Username (required) */}
                    <div className="space-y-2">
                      <Label htmlFor="waitlistUsername" className="text-xs font-bold uppercase tracking-wide">
                        Desired Username <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors font-medium">@</span>
                        <Input
                          id="waitlistUsername"
                          type="text"
                          value={waitlistUsername}
                          onChange={(e) => {
                            setWaitlistUsername(e.target.value);
                            setUsernameError(null);
                          }}
                          placeholder="your_username"
                          className="pl-8 bg-background/50 border-2 border-border focus:border-primary transition-all lowercase"
                          maxLength={20}
                        />
                      </div>
                      {usernameError && (
                        <p className="text-sm text-destructive">{usernameError}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        3-20 characters. Letters, numbers, and underscores only.
                      </p>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="waitlistEmail" className="text-xs font-bold uppercase tracking-wide">
                        Email
                      </Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="waitlistEmail"
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

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-brutal group relative overflow-hidden"
                    >
                      <span className="relative z-10">
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Joining...
                          </span>
                        ) : (
                          "Join Waiting List"
                        )}
                      </span>
                    </Button>
                  </form>

                  {/* Back to Sign In */}
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsWaitlistMode(false);
                        setErrors({});
                        setUsernameError(null);
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </>
              ) : (
                /* Normal Login/Signup Form */
                <>
                  <WelcomeHeadlines isSignUp={isSignUp} />

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
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!email) {
                              toast({
                                variant: "destructive",
                                title: "Enter your email first",
                                description: "Please enter your email address above, then click Forgot Password.",
                              });
                              return;
                            }
                            const emailResult = emailSchema.safeParse(email);
                            if (!emailResult.success) {
                              toast({
                                variant: "destructive",
                                title: "Invalid email",
                                description: "Please enter a valid email address.",
                              });
                              return;
                            }
                            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                              redirectTo: `${window.location.origin}/auth`,
                            });
                            if (error) {
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description: error.message,
                              });
                            } else {
                              toast({
                                title: "Check your email",
                                description: "If an account exists with that email, you'll receive a password reset link.",
                              });
                            }
                          }}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          Forgot Password?
                        </button>
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
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {isSignUp ? "Creating account..." : "Signing in..."}
                          </span>
                        ) : (
                          isSignUp ? "Create Account" : "Sign In"
                        )}
                      </span>
                    </Button>
                  </form>

                  {/* Toggle Sign In/Up or Waitlist */}
                  {!signupDisabled ? (
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
                  ) : (
                    <div className="mt-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Registration is currently closed.
                        <button
                          type="button"
                          onClick={() => {
                            setIsWaitlistMode(true);
                            setErrors({});
                          }}
                          className="ml-2 text-primary font-bold hover:underline"
                        >
                          Join Waiting List
                        </button>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* Social Proof */}
          <SocialProof />
        </div>
      </div>
    </div>
  );
}
