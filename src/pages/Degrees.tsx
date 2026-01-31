import { PageLayout, Section, SectionHeader } from "@/components/layout";
import { Link } from "react-router-dom";
import { ArrowRight, Check, GraduationCap, BookOpen, Trophy, FileText, Award, Zap } from "lucide-react";

const degreePrograms = [
  {
    name: "Associate of Film",
    credits: 30,
    duration: "3-6 months",
    description: "Foundation in mobile filmmaking. Perfect for beginners who want to build a solid base.",
    requirements: [
      "6 core courses",
      "6 quizzes",
      "1 scenario exam",
      "2 projects",
    ],
    color: "accent",
  },
  {
    name: "Bachelor of Film",
    credits: 60,
    duration: "6-12 months",
    description: "Complete mastery of filmmaking craft. For creators ready to go pro.",
    requirements: [
      "12 courses (all departments)",
      "12 quizzes",
      "3 scenario exams",
      "6 projects",
      "1 capstone film",
    ],
    color: "primary",
    featured: true,
  },
  {
    name: "Certificate",
    credits: 15,
    duration: "1-3 months",
    description: "Focused specialization in one department. Quick credentials for specific skills.",
    requirements: [
      "3 department courses",
      "3 quizzes",
      "1 project",
    ],
    color: "neon-purple",
  },
];

const requirements = [
  { icon: BookOpen, label: "12 Courses", description: "Complete all curriculum" },
  { icon: FileText, label: "12 Quizzes", description: "Pass with 80%+" },
  { icon: Trophy, label: "3 Scenario Exams", description: "Real-world film challenges" },
  { icon: Zap, label: "6 Projects", description: "Hands-on assignments" },
  { icon: GraduationCap, label: "1 Capstone", description: "Your final film" },
  { icon: Award, label: "Official Degree", description: "Certificate + transcript" },
];

const benefits = [
  "Official degree certificate (digital + printable)",
  "Complete academic transcript",
  "LinkedIn-ready credentials",
  "Alumni network access",
  "Portfolio showcase page",
  "Letter of recommendation eligibility",
];

const Degrees = () => {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-noise">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-neon-purple/5 rounded-full blur-[120px]" />
        
        <div className="container-wide relative z-10">
          <div className="max-w-4xl">
            <span className="tag-sticker mb-6 animate-reveal">
              <GraduationCap className="w-3 h-3 mr-2" />
              Degree Programs
            </span>
            <h1 className="heading-1 mt-4 mb-6 animate-reveal stagger-1">
              EARN YOUR
              <span className="text-gold-gradient text-glow"> DEGREE</span>
            </h1>
            <p className="body-large text-muted-foreground max-w-2xl animate-reveal stagger-2">
              Real credentials for real creators. Complete the curriculum, submit your work, 
              and graduate with proof of your skills.
            </p>
          </div>
        </div>
      </section>

      {/* Degree Programs */}
      <Section>
        <SectionHeader
          eyebrow="Programs"
          title="CHOOSE YOUR PATH"
          description="Three degree tracks to match your goals and timeline."
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {degreePrograms.map((program, index) => (
            <div
              key={index}
              className={`relative flex flex-col border-2 p-8 bg-card transition-all duration-500 animate-reveal ${
                program.featured 
                  ? "border-primary glow-gold scale-[1.02]" 
                  : "border-border hover:border-primary"
              }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {program.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="tag-sticker">Most Popular</span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="heading-4 text-foreground mb-2">{program.name}</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-black text-primary">{program.credits}</span>
                  <span className="text-muted-foreground font-medium">credits</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Duration: <span className="text-foreground font-medium">{program.duration}</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-6 flex-1">{program.description}</p>

              <div className="space-y-3 mb-8">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Requirements</div>
                {program.requirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-primary/20 border border-primary flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{req}</span>
                  </div>
                ))}
              </div>

              <Link 
                to="/enroll" 
                className={program.featured ? "btn-brutal w-full text-center" : "border-2 border-border hover:border-primary hover:bg-primary hover:text-primary-foreground font-bold uppercase tracking-wide py-4 text-center transition-all duration-300"}
              >
                Start This Path
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* Requirements Breakdown */}
      <Section className="bg-card/50 bg-noise">
        <SectionHeader
          eyebrow="Bachelor's Degree"
          title="WHAT IT TAKES TO GRADUATE"
          description="The full breakdown for earning your Bachelor of Film."
          centered
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {requirements.map((req, index) => (
            <div 
              key={index} 
              className="text-center p-6 border-2 border-border bg-card hover:border-primary transition-all duration-300 animate-reveal group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 border-2 border-primary/50 flex items-center justify-center group-hover:bg-primary transition-all duration-500">
                <req.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div className="text-lg font-black text-foreground mb-1">{req.label}</div>
              <div className="text-xs text-muted-foreground">{req.description}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Sample Progress */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <div className="order-2 lg:order-1 animate-scale-in">
            <div className="relative max-w-md mx-auto">
              {/* Progress card */}
              <div className="border-4 border-primary p-8 bg-card animate-border-flow">
                <div className="text-center mb-8">
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Degree Progress</div>
                  <div className="text-6xl font-black text-primary text-glow">75%</div>
                </div>

                {/* Progress bars */}
                <div className="space-y-4">
                  {[
                    { label: "Courses", progress: 83, current: 10, total: 12 },
                    { label: "Quizzes", progress: 75, current: 9, total: 12 },
                    { label: "Exams", progress: 66, current: 2, total: 3 },
                    { label: "Projects", progress: 50, current: 3, total: 6 },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold text-foreground">{item.label}</span>
                        <span className="text-muted-foreground">{item.current}/{item.total}</span>
                      </div>
                      <div className="h-2 bg-muted border border-border">
                        <div 
                          className="h-full bg-primary transition-all duration-1000"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t-2 border-border text-center">
                  <div className="text-sm text-muted-foreground mb-2">Credits Earned</div>
                  <div className="text-3xl font-black text-foreground">45 <span className="text-muted-foreground text-lg">/ 60</span></div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 tag-sticker rotate-3 animate-float">
                Almost There!
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2 animate-slide-left">
            <span className="tag-sticker mb-6">Progress Tracking</span>
            <h2 className="heading-2 text-foreground mb-6 mt-4">
              WATCH YOUR
              <span className="text-neon-gradient"> PROGRESS</span>
            </h2>
            <p className="body-large text-muted-foreground mb-8">
              Your Student Center dashboard tracks everything in real-time. 
              See exactly where you stand and what's left to complete.
            </p>

            <ul className="space-y-4">
              {[
                "Real-time credit tracking",
                "Course completion status",
                "Quiz and exam scores",
                "Project submission status",
                "Estimated graduation date",
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Graduation Benefits */}
      <Section className="bg-card/50 bg-noise">
        <SectionHeader
          eyebrow="Benefits"
          title="WHAT YOU GET WHEN YOU GRADUATE"
          centered
        />

        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 p-4 border-2 border-border bg-card hover:border-primary transition-all duration-300 animate-reveal"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-8 h-8 bg-primary/20 border border-primary flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="text-foreground font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/enroll" className="btn-brutal inline-flex animate-glow-pulse">
              Start Your Degree
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
};

export default Degrees;
