import { PageLayout, Section, SectionHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CourseCard, TierCard } from "@/components/cards";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Trophy, Target, Sparkles, Film, GraduationCap, Check } from "lucide-react";
import heroLogo from "@/assets/hero-logo.png";
import heroVideo from "@/assets/hero-video.mp4";

const stats = [
  { value: "12", label: "Courses" },
  { value: "60", label: "Credits" },
  { value: "4", label: "Departments" },
  { value: "∞", label: "Potential" },
];

const features = [
  {
    icon: Film,
    title: "Real Film Training",
    description: "No fluff. Every lesson teaches you something you can use on your next shoot.",
  },
  {
    icon: Target,
    title: "Scenario Exams",
    description: "Prove your skills through real-world film scenarios, not boring multiple choice.",
  },
  {
    icon: GraduationCap,
    title: "Actual Credentials",
    description: "Graduate with a certificate, transcript, and portfolio that proves you put in the work.",
  },
];

const graduationSteps = [
  { number: "01", title: "ENROLL", description: "Pick your tier" },
  { number: "02", title: "STUDY", description: "Complete courses" },
  { number: "03", title: "CREATE", description: "Build your capstone" },
  { number: "04", title: "GRADUATE", description: "Earn your degree" },
];

const featuredCourses = [
  {
    code: "HU-101",
    title: "iPhone Cinematography",
    department: "Cinematography",
    credits: 3,
    level: "Beginner" as const,
    description: "Master cinematic techniques using just your phone.",
  },
  {
    code: "HU-201",
    title: "Color Grading Masterclass",
    department: "Post-Production",
    credits: 4,
    level: "Intermediate" as const,
    description: "Learn professional color grading that makes footage pop.",
  },
  {
    code: "HU-301",
    title: "Documentary Storytelling",
    department: "Directing",
    credits: 5,
    level: "Advanced" as const,
    description: "Craft compelling stories that move audiences.",
  },
];

const membershipTiers = [
  {
    name: "Freshman",
    price: 29,
    description: "Start your journey",
    features: [
      "4 foundation courses",
      "Basic assessments",
      "Community access",
      "Monthly live Q&A",
    ],
  },
  {
    name: "Sophomore",
    price: 79,
    description: "Full curriculum access",
    features: [
      "All 12 courses",
      "All exams & quizzes",
      "Project submissions",
      "1-on-1 feedback",
      "Private Discord",
    ],
    highlighted: true,
  },
  {
    name: "Graduate",
    price: 149,
    description: "Complete degree program",
    features: [
      "Everything in Sophomore",
      "Capstone submission",
      "Official certificate",
      "Digital transcript",
      "Alumni network",
      "Priority support",
    ],
  },
];

const Index = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-noise">
        {/* Background Video Layer */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-[0.15]"
          poster="/placeholder.svg"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-background/80" />

        {/* Background effects */}
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 video-overlay" />
        
        {/* Animated orbs - increased opacity for more depth */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-neon-purple/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-neon-pink/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="container-wide relative z-10 py-20">
          <div className="max-w-5xl mx-auto flex flex-col items-center">
            {/* University Logo */}
            <div className="animate-reveal">
              <img 
                src={heroLogo} 
                alt="Hoodtorial University - Class of 2025" 
                className="h-[200px] sm:h-[280px] lg:h-[380px] w-auto animate-logo-pulse"
              />
            </div>

            {/* University Name */}
            <h1 className="heading-1 text-center mt-8">
              <span className="block animate-reveal stagger-1">HOODTORIAL</span>
              <span className="block text-gold-gradient text-glow animate-reveal stagger-2">UNIVERSITY</span>
            </h1>

            {/* Tagline */}
            <p className="text-lg md:text-xl lg:text-2xl font-bold uppercase tracking-[0.3em] text-muted-foreground text-center mt-6 animate-reveal stagger-3">
              Where Hustle Meets Hollywood
            </p>

            {/* Now Enrolling Badge */}
            <div className="flex justify-center mt-8 animate-reveal stagger-4">
              <span className="tag-sticker">
                <Sparkles className="w-3 h-3 mr-2" />
                Now Enrolling
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-reveal stagger-5">
              <Link to="/enroll" className="btn-brutal animate-glow-pulse">
                Start Learning
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Button asChild variant="outline" size="lg" className="border-2 border-border hover:border-primary hover:bg-primary/10 font-bold uppercase tracking-wide transition-all duration-300">
                <Link to="/academics">
                  <Play className="mr-2 h-4 w-4" />
                  View Curriculum
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 w-full">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center p-6 border-2 border-border bg-card/30 backdrop-blur-sm animate-reveal hover:border-primary transition-all duration-300"
                  style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                >
                  <div className="text-4xl md:text-5xl font-black text-primary mb-1">{stat.value}</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center pt-2 animate-glow-pulse">
            <div className="w-1 h-2 bg-primary rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <Section className="bg-card/50 bg-noise">
        <SectionHeader
          eyebrow="Why HU"
          title="NOT YOUR AVERAGE FILM SCHOOL"
          description="We built the curriculum we wish existed. No filler. All killer."
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="card-urban group animate-reveal"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="w-16 h-16 mb-6 bg-primary/10 border-2 border-primary/50 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                <feature.icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
              </div>
              <h3 className="heading-4 text-foreground mb-3 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* How It Works */}
      <Section>
        <SectionHeader
          eyebrow="The Process"
          title="HOW GRADUATION WORKS"
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {graduationSteps.map((step, index) => (
            <div 
              key={index} 
              className="relative text-center group animate-reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connector line */}
              {index < graduationSteps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              {/* Number */}
              <div className="relative z-10 w-16 h-16 mx-auto mb-4 bg-primary text-primary-foreground flex items-center justify-center font-black text-xl border-2 border-primary group-hover:bg-transparent group-hover:text-primary transition-all duration-500 group-hover:animate-glow-pulse">
                {step.number}
              </div>
              
              <h3 className="heading-4 text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Featured Courses */}
      <Section className="bg-card/50 bg-noise">
        <SectionHeader
          eyebrow="Curriculum"
          title="FEATURED CLASSES"
          description="Sample what's inside. Each course earns credits toward your degree."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCourses.map((course, index) => (
            <div key={index} className="animate-reveal" style={{ animationDelay: `${index * 0.15}s` }}>
              <CourseCard {...course} />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/academics" className="btn-brutal inline-flex">
            View All Courses
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </Section>

      {/* Degree Preview */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-slide-left">
            <span className="tag-sticker mb-6">Credentials</span>
            <h2 className="heading-2 text-foreground mb-6 mt-4">
              EARN YOUR
              <span className="text-gold-gradient text-glow"> DEGREE</span>
            </h2>
            <p className="body-large text-muted-foreground mb-8">
              Complete 60 credits, pass all exams, submit your capstone film. 
              Graduate with an official certificate and transcript.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                "12 courses",
                "12 quizzes",
                "3 scenario exams",
                "6 projects",
                "1 capstone film",
                "Official degree",
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-3 border-2 border-border bg-card/50 hover:border-primary transition-all duration-300 animate-reveal"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link to="/degrees" className="btn-brutal inline-flex">
                View Degree Paths
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Visual */}
          <div className="relative flex justify-center items-center animate-scale-in" style={{ animationDelay: "0.4s" }}>
            <div className="relative">
              {/* Progress visualization */}
              <div className="w-72 h-72 md:w-80 md:h-80 border-4 border-primary relative animate-border-flow">
                <div className="absolute inset-4 border-2 border-border bg-card/80 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="text-7xl md:text-8xl font-black text-primary text-glow">75%</div>
                  <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mt-2">Complete</div>
                  <div className="mt-4 px-4 py-2 bg-muted/50 text-muted-foreground text-xs font-bold uppercase tracking-wide border border-border">
                    45 / 60 Credits
                  </div>
                </div>
                
                {/* Decorative corners */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary animate-pulse" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-neon-purple animate-pulse" style={{ animationDelay: "0.5s" }} />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-neon-pink animate-pulse" style={{ animationDelay: "1s" }} />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-accent animate-pulse" style={{ animationDelay: "1.5s" }} />
              </div>

              {/* Floating tags */}
              <div className="absolute -top-6 -right-6 tag-sticker rotate-6 animate-float">
                Dean's List
              </div>
              <div className="absolute -bottom-6 -left-6 tag-outline text-neon-purple border-neon-purple -rotate-3 animate-float" style={{ animationDelay: "1s" }}>
                In Progress
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Membership Tiers */}
      <Section className="bg-card/50 bg-noise">
        <SectionHeader
          eyebrow="Enrollment"
          title="CHOOSE YOUR PATH"
          description="Pick the tier that fits your goals. Upgrade anytime."
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {membershipTiers.map((tier, index) => (
            <div key={index} className="animate-reveal" style={{ animationDelay: `${index * 0.15}s` }}>
              <TierCard {...tier} />
            </div>
          ))}
        </div>
      </Section>

      {/* Email Capture */}
      <Section>
        <div className="max-w-2xl mx-auto text-center animate-reveal">
          <span className="tag-sticker mb-6">
            <Trophy className="w-3 h-3 mr-2" />
            Free Drops
          </span>
          <h2 className="heading-3 text-foreground mb-4 mt-4">
            DROPS FROM THE DEAN'S OFFICE
          </h2>
          <p className="text-muted-foreground mb-8">
            Exclusive tips, free resources, and early access. No spam, just game.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 h-14 px-4 border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all duration-300 font-medium"
            />
            <button type="submit" className="btn-brutal h-14">
              Subscribe
            </button>
          </form>
        </div>
      </Section>
    </PageLayout>
  );
};

export default Index;
