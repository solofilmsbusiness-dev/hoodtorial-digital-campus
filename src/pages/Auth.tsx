import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroLogo from "@/assets/hero-logo.png";

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
    <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden bg-noise relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      
      {/* Animated orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-neon-purple/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-neon-pink/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />

      <div className="container-wide relative z-10 py-8 md:py-12">
        <div className="max-w-md mx-auto flex flex-col items-center">
          {/* University Logo */}
          <div className="animate-reveal">
            <img 
              src={heroLogo} 
              alt="Hoodtorial University - Class of 2025" 
              className="h-[120px] sm:h-[160px] lg:h-[200px] w-auto animate-logo-pulse"
            />
          </div>

          {/* University Name */}
          <h1 className="heading-3 md:heading-2 text-center mt-6">
            <span className="block animate-reveal stagger-1">HOODTORIAL</span>
            <span className="block text-gold-gradient text-glow animate-reveal stagger-2">UNIVERSITY</span>
          </h1>

          {/* Tagline */}
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground text-center mt-3 animate-reveal stagger-3">
            Where Hustle Meets Hollywood
          </p>

          {/* Form Card */}
          <div className="w-full mt-8 card-urban p-6 md:p-8 animate-reveal stagger-4">
            <div className="text-center mb-6">
              <h2 
                key={isSignUp ? 'signup' : 'signin'} 
                className="heading-4 text-foreground animate-fade-in"
              >
                {isSignUp ? "Join the University" : "Welcome Back"}
              </h2>
              <p 
                key={isSignUp ? 'signup-desc' : 'signin-desc'} 
                className="text-sm text-muted-foreground mt-1 animate-fade-in"
                style={{ animationDelay: '50ms' }}
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
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="pl-10 bg-background border-2 border-border focus:border-primary"
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
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10 bg-background border-2 border-border focus:border-primary"
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
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-background border-2 border-border focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                className="w-full btn-brutal"
              >
                {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
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
        </div>
      </div>
    </div>
  );
}
