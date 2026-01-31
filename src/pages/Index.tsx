import { PageLayout, Section, SectionHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { StampBadge, LabelTape, ProgressRing } from "@/components/ui/custom-badges";
import { CourseCard, TierCard } from "@/components/cards";
import { Link } from "react-router-dom";
import { ArrowRight, Film, Award, FileText, Smartphone, BookOpen, GraduationCap } from "lucide-react";
import mascot from "@/assets/mascot.png";

const trustIndicators = [
  { icon: Smartphone, title: "Cinematic iPhone", description: "Master mobile filmmaking" },
  { icon: Film, title: "Film-Based Exams", description: "Prove skills through scenarios" },
  { icon: Award, title: "Official Degree", description: "Certificate + transcript" },
];

const whyHU = [
  {
    icon: BookOpen,
    title: "Structured Curriculum",
    description: "12 courses across 4 departments with credits, quizzes, and real projects.",
  },
  {
    icon: Film,
    title: "Film-Based Learning",
    description: "Every exam uses real film scenarios. No multiple-choice busywork.",
  },
  {
    icon: GraduationCap,
    title: "Earn Your Degree",
    description: "Complete requirements, submit your capstone, and graduate with credentials.",
  },
];

const graduationSteps = [
  { step: "01", title: "Enroll", description: "Pick your tier and start your journey" },
  { step: "02", title: "Study", description: "Complete courses, quizzes, and projects" },
  { step: "03", title: "Create", description: "Submit your capstone film" },
  { step: "04", title: "Graduate", description: "Earn your degree and transcript" },
];

const featuredCourses = [
  {
    code: "HU-101",
    title: "iPhone Cinematography Fundamentals",
    department: "Cinematography",
    credits: 3,
    level: "Beginner" as const,
    description: "Master the basics of shooting cinematic footage on your iPhone.",
  },
  {
    code: "HU-201",
    title: "Advanced Color Grading",
    department: "Post-Production",
    credits: 4,
    level: "Intermediate" as const,
    description: "Learn professional color grading techniques for mobile footage.",
  },
  {
    code: "HU-301",
    title: "Documentary Storytelling",
    department: "Directing",
    credits: 5,
    level: "Advanced" as const,
    description: "Craft compelling documentary narratives from concept to final cut.",
  },
];

const membershipTiers = [
  {
    name: "Freshman",
    price: 29,
    description: "Get started with the basics",
    features: [
      "Access to 4 foundation courses",
      "Basic quizzes and assessments",
      "Community forum access",
      "Monthly live Q&A",
    ],
  },
  {
    name: "Sophomore",
    price: 79,
    description: "Full curriculum access",
    features: [
      "All 12 courses unlocked",
      "All quizzes and scenario exams",
      "Project submissions",
      "1-on-1 feedback sessions",
      "Private Discord access",
    ],
    highlighted: true,
  },
  {
    name: "Graduate",
    price: 149,
    description: "Complete the degree program",
    features: [
      "Everything in Sophomore",
      "Capstone film submission",
      "Official degree certificate",
      "Digital transcript",
      "Alumni network access",
      "Priority support",
    ],
  },
];

const Index = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-dark via-background to-background" />
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-steel/5 rounded-full blur-3xl" />

        <div className="container-wide relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Eyebrow */}
            <LabelTape className="mb-6">Now Enrolling</LabelTape>

            {/* Mascot */}
            <img 
              src={mascot} 
              alt="Hoodtorial University Owl Mascot" 
              className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-8 animate-fade-in"
            />

            {/* Headline */}
            <h1 className="heading-1 text-foreground mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              SHOOT BETTER.{" "}
              <span className="text-gold-gradient">EDIT SMARTER.</span>{" "}
              GRADUATE DIFFERENT.
            </h1>

            {/* Subheadline */}
            <p className="body-large text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              A cinematic film school for creators who want to master iPhone filmmaking, 
              editing, and storytelling. Earn a real degree from Hoodtorial University.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wide px-8">
                <Link to="/enroll">
                  Enroll Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-medium">
                <Link to="/academics">Explore Courses</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              {trustIndicators.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-card/50 border border-border rounded-lg">
                  <item.icon className="h-8 w-8 text-primary shrink-0" />
                  <div className="text-left">
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Hoodtorial University */}
      <Section dark>
        <SectionHeader
          eyebrow="Why HU"
          title="Where Hustle Meets Hollywood"
          description="We built the film school we wish existed. Structured, practical, and designed for creators who are ready to level up."
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {whyHU.map((item, index) => (
            <div key={index} className="text-center p-8 bg-card border border-border rounded-lg card-hover">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="heading-4 text-foreground mb-3">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* How Graduation Works */}
      <Section>
        <SectionHeader
          eyebrow="The Path"
          title="How Graduation Works"
          description="Four steps from enrollment to earning your degree."
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {graduationSteps.map((item, index) => (
            <div key={index} className="relative text-center p-6">
              {/* Connecting line */}
              {index < graduationSteps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-border" />
              )}
              
              {/* Step number */}
              <div className="relative z-10 w-16 h-16 mx-auto mb-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <span className="text-xl font-bold">{item.step}</span>
              </div>
              
              <h3 className="heading-4 text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Featured Courses */}
      <Section dark>
        <SectionHeader
          eyebrow="Curriculum"
          title="Featured Classes"
          description="Sample courses from our four departments. Each course earns credits toward your degree."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredCourses.map((course, index) => (
            <CourseCard key={index} {...course} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg">
            <Link to="/academics">
              View All Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </Section>

      {/* Degree Preview */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeader
              eyebrow="Credentials"
              title="Earn Your Degree"
              description="Complete 60 credits worth of courses, pass all exams, submit projects, and create your capstone film. Graduate with an official certificate and transcript."
            />

            <ul className="space-y-4">
              {[
                "12 courses across 4 departments",
                "12 quizzes + 3 scenario exams",
                "6 practical projects",
                "1 capstone film submission",
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wide">
                <Link to="/degrees">
                  View Degree Paths
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <ProgressRing progress={75} size={200} strokeWidth={12}>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">45</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">/ 60 Credits</div>
                </div>
              </ProgressRing>
              
              {/* Decorative badges */}
              <StampBadge className="absolute -top-4 -right-4">Dean's List</StampBadge>
              <LabelTape variant="steel" className="absolute -bottom-2 -left-4">In Progress</LabelTape>
            </div>
          </div>
        </div>
      </Section>

      {/* Membership Tiers */}
      <Section dark>
        <SectionHeader
          eyebrow="Enrollment"
          title="Choose Your Path"
          description="Select the tier that fits your goals. Upgrade anytime as you progress."
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {membershipTiers.map((tier, index) => (
            <TierCard key={index} {...tier} />
          ))}
        </div>
      </Section>

      {/* Email Capture */}
      <Section>
        <div className="max-w-2xl mx-auto text-center">
          <img 
            src={mascot} 
            alt="Hoodtorial University Owl" 
            className="w-20 h-20 mx-auto mb-6"
          />
          <h2 className="heading-3 text-foreground mb-4">
            Free Drops From The Dean's Office
          </h2>
          <p className="text-muted-foreground mb-8">
            Get exclusive tips, free resources, and early access to new courses. 
            No spam, just knowledge.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-12 px-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wide px-6">
              Subscribe
            </Button>
          </form>
        </div>
      </Section>
    </PageLayout>
  );
};

export default Index;
