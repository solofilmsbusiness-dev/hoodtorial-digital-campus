import { PageLayout, Section, SectionHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CourseCard, TierCard } from "@/components/cards";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Zap, Trophy, Target, Sparkles, Film, GraduationCap } from "lucide-react";

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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-neon-purple/10 rounded-full blur-[100px]" />
        </div>

        <div className="container-wide relative z-10 py-20">
          <div className="max-w-5xl mx-auto">
            {/* Tag */}
            <div className="flex justify-center mb-8 animate-fade-in">
              <span className="tag-sticker">
                <Sparkles className="w-3 h-3 mr-2" />
                Now Enrolling
              </span>
            </div>

            {/* Headline */}
            <h1 className="heading-1 text-center mb-8 animate-fade-in-up">
              <span className="block">SHOOT BETTER.</span>
              <span className="block text-neon-gradient">EDIT SMARTER.</span>
              <span className="block">GRADUATE DIFFERENT.</span>
            </h1>

            {/* Subheadline */}
            <p className="body-large text-muted-foreground text-center max-w-2xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Film school for creators who want to master the craft, 
              not just watch tutorials. Earn a real degree.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <Link to="/enroll" className="btn-brutal">
                Start Learning
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Button asChild variant="outline" size="lg" className="border-2 border-border hover:border-primary font-bold uppercase tracking-wide">
                <Link to="/academics">
                  <Play className="mr-2 h-4 w-4" />
                  View Curriculum
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-6 border-2 border-border bg-card/50">
                  <div className="text-4xl md:text-5xl font-black text-primary mb-1">{stat.value}</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-pulse">
          <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-muted-foreground rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <Section className="bg-charcoal-dark">
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
              className="card-urban group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 mb-6 bg-primary/10 border-2 border-primary flex items-center justify-center group-hover:bg-primary transition-colors">
                <feature.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="heading-4 text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* How It Works */}
      <Section className="bg-stripes">
        <SectionHeader
          eyebrow="The Process"
          title="HOW GRADUATION WORKS"
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {graduationSteps.map((step, index) => (
            <div key={index} className="relative text-center group">
              {/* Connector line */}
              {index < graduationSteps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-border" />
              )}
              
              {/* Number */}
              <div className="relative z-10 w-16 h-16 mx-auto mb-4 bg-primary text-primary-foreground flex items-center justify-center font-black text-xl border-2 border-primary group-hover:bg-background group-hover:text-primary transition-colors">
                {step.number}
              </div>
              
              <h3 className="heading-4 text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Featured Courses */}
      <Section className="bg-charcoal-dark">
        <SectionHeader
          eyebrow="Curriculum"
          title="FEATURED CLASSES"
          description="Sample what's inside. Each course earns credits toward your degree."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCourses.map((course, index) => (
            <CourseCard key={index} {...course} />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="tag-sticker mb-6">Credentials</span>
            <h2 className="heading-2 text-foreground mb-6">
              EARN YOUR
              <span className="text-gold-gradient"> DEGREE</span>
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
                <div key={index} className="flex items-center gap-3 p-3 border-2 border-border bg-card/50">
                  <Zap className="w-4 h-4 text-primary shrink-0" />
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
          <div className="relative flex justify-center items-center">
            <div className="relative">
              {/* Progress visualization */}
              <div className="w-64 h-64 md:w-80 md:h-80 border-4 border-primary relative">
                <div className="absolute inset-4 border-2 border-border bg-card/50 flex flex-col items-center justify-center">
                  <div className="text-6xl md:text-7xl font-black text-primary">75%</div>
                  <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mt-2">Complete</div>
                  <div className="mt-4 px-4 py-2 bg-muted text-muted-foreground text-xs font-bold uppercase tracking-wide">
                    45 / 60 Credits
                  </div>
                </div>
                
                {/* Decorative corners */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary" />
              </div>

              {/* Floating tags */}
              <div className="absolute -top-4 -right-8 tag-sticker rotate-6">
                Dean's List
              </div>
              <div className="absolute -bottom-4 -left-8 tag-outline text-neon-purple border-neon-purple -rotate-3">
                In Progress
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Membership Tiers */}
      <Section className="bg-charcoal-dark">
        <SectionHeader
          eyebrow="Enrollment"
          title="CHOOSE YOUR PATH"
          description="Pick the tier that fits your goals. Upgrade anytime."
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {membershipTiers.map((tier, index) => (
            <TierCard key={index} {...tier} />
          ))}
        </div>
      </Section>

      {/* Email Capture */}
      <Section>
        <div className="max-w-2xl mx-auto text-center">
          <span className="tag-sticker mb-6">
            <Trophy className="w-3 h-3 mr-2" />
            Free Drops
          </span>
          <h2 className="heading-3 text-foreground mb-4">
            DROPS FROM THE DEAN'S OFFICE
          </h2>
          <p className="text-muted-foreground mb-8">
            Exclusive tips, free resources, and early access. No spam, just game.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 h-14 px-4 border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-medium"
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
