import { PageLayout, Section, SectionHeader } from "@/components/layout";
import { CourseCard } from "@/components/cards";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Film, Palette, Clapperboard, Briefcase, Clock, Award, Users } from "lucide-react";
import { useState } from "react";

const departments = [
  {
    id: "all",
    name: "All Courses",
    icon: BookOpen,
  },
  {
    id: "cinematography",
    name: "Cinematography",
    icon: Film,
    description: "Master the art of visual storytelling through lens, light, and movement. Learn to capture stunning footage with any device.",
    outcomes: ["Camera techniques", "Lighting setups", "Composition rules", "Mobile filmmaking", "Lens selection", "Exposure control"],
    color: "primary",
  },
  {
    id: "post-production",
    name: "Post-Production",
    icon: Palette,
    description: "Transform raw footage into polished films through editing, color grading, and sound design.",
    outcomes: ["Video editing", "Color grading", "Sound design", "Motion graphics", "VFX basics", "Audio mixing"],
    color: "neon-purple",
  },
  {
    id: "directing",
    name: "Directing",
    icon: Clapperboard,
    description: "Lead creative vision from concept to final cut. Master storytelling and working with talent.",
    outcomes: ["Story structure", "Working with talent", "Shot planning", "Creative leadership", "Visual language", "Narrative pacing"],
    color: "accent",
  },
  {
    id: "production",
    name: "Production",
    icon: Briefcase,
    description: "Plan, organize, and execute film projects from start to finish. Business and logistics of filmmaking.",
    outcomes: ["Pre-production", "Budget management", "Scheduling", "Team coordination", "Location scouting", "Client relations"],
    color: "neon-pink",
  },
];

const courses = [
  // ==================== CINEMATOGRAPHY ====================
  {
    code: "HU-101",
    title: "iPhone Cinematography Fundamentals",
    department: "Cinematography",
    departmentId: "cinematography",
    credits: 3,
    level: "Beginner" as const,
    description: "Master the basics of shooting cinematic footage on your iPhone. Learn optimal settings, stabilization techniques, and composition rules that make your footage look professional.",
    lessons: 8,
    duration: "4 weeks",
  },
  {
    code: "HU-102",
    title: "Lighting for Mobile Film",
    department: "Cinematography",
    departmentId: "cinematography",
    credits: 4,
    level: "Beginner" as const,
    description: "Control light like a pro using natural and affordable artificial sources. Create mood, depth, and cinematic looks without expensive gear.",
    lessons: 10,
    duration: "5 weeks",
  },
  {
    code: "HU-201",
    title: "Advanced Camera Movement",
    department: "Cinematography",
    departmentId: "cinematography",
    credits: 5,
    level: "Intermediate" as const,
    description: "Dynamic movement techniques using gimbals, sliders, and intentional handheld style. Add energy and emotion to your shots through motion.",
    lessons: 12,
    duration: "6 weeks",
  },
  {
    code: "HU-301",
    title: "Cinematic Lens Language",
    department: "Cinematography",
    departmentId: "cinematography",
    credits: 5,
    level: "Advanced" as const,
    description: "Deep dive into lens selection, depth of field, and the psychological impact of different focal lengths. Master the visual vocabulary of cinema.",
    lessons: 10,
    duration: "5 weeks",
  },

  // ==================== POST-PRODUCTION ====================
  {
    code: "HU-103",
    title: "Editing Fundamentals",
    department: "Post-Production",
    departmentId: "post-production",
    credits: 3,
    level: "Beginner" as const,
    description: "Learn the language of editing: cuts, pacing, and story flow. Master the timeline and build compelling sequences from raw footage.",
    lessons: 10,
    duration: "5 weeks",
  },
  {
    code: "HU-104",
    title: "Mobile Editing Workflow",
    department: "Post-Production",
    departmentId: "post-production",
    credits: 3,
    level: "Beginner" as const,
    description: "Edit professional content entirely on your phone or tablet. Learn efficient mobile workflows using apps like CapCut, LumaFusion, and more.",
    lessons: 8,
    duration: "4 weeks",
  },
  {
    code: "HU-202",
    title: "Color Grading Masterclass",
    department: "Post-Production",
    departmentId: "post-production",
    credits: 5,
    level: "Intermediate" as const,
    description: "Professional color grading techniques that transform your footage. Create signature looks, match shots, and evoke emotion through color.",
    lessons: 14,
    duration: "7 weeks",
  },
  {
    code: "HU-302",
    title: "Sound Design & Audio Mix",
    department: "Post-Production",
    departmentId: "post-production",
    credits: 5,
    level: "Advanced" as const,
    description: "Create immersive audio landscapes and professional sound mixes. Layer sound effects, music, and dialogue for maximum impact.",
    lessons: 12,
    duration: "6 weeks",
  },

  // ==================== DIRECTING ====================
  {
    code: "HU-105",
    title: "Visual Storytelling Basics",
    department: "Directing",
    departmentId: "directing",
    credits: 3,
    level: "Beginner" as const,
    description: "Tell stories through images. Master the fundamentals of visual narrative, scene construction, and how to guide viewer attention.",
    lessons: 8,
    duration: "4 weeks",
  },
  {
    code: "HU-203",
    title: "Documentary Storytelling",
    department: "Directing",
    departmentId: "directing",
    credits: 5,
    level: "Intermediate" as const,
    description: "Craft compelling documentary narratives from concept to final cut. Interview techniques, story structure, and ethical considerations.",
    lessons: 12,
    duration: "6 weeks",
  },
  {
    code: "HU-204",
    title: "Music Video Direction",
    department: "Directing",
    departmentId: "directing",
    credits: 4,
    level: "Intermediate" as const,
    description: "Create visually stunning music videos. Concept development, performance direction, and syncing visuals to audio.",
    lessons: 10,
    duration: "5 weeks",
  },
  {
    code: "HU-303",
    title: "Directing Talent & Performance",
    department: "Directing",
    departmentId: "directing",
    credits: 5,
    level: "Advanced" as const,
    description: "Work with actors and on-screen talent to get authentic, powerful performances. Communication, rehearsal, and on-set techniques.",
    lessons: 10,
    duration: "5 weeks",
  },

  // ==================== PRODUCTION ====================
  {
    code: "HU-106",
    title: "Pre-Production Planning",
    department: "Production",
    departmentId: "production",
    credits: 3,
    level: "Beginner" as const,
    description: "Plan your shoots like a pro. Scripts, shot lists, storyboards, and schedules that keep projects on track and on budget.",
    lessons: 8,
    duration: "4 weeks",
  },
  {
    code: "HU-205",
    title: "Budget Filmmaking",
    department: "Production",
    departmentId: "production",
    credits: 4,
    level: "Intermediate" as const,
    description: "Create professional results on limited budgets. Maximize every dollar, find free resources, and deliver high-value productions.",
    lessons: 10,
    duration: "5 weeks",
  },
  {
    code: "HU-206",
    title: "Client Management & Freelancing",
    department: "Production",
    departmentId: "production",
    credits: 4,
    level: "Intermediate" as const,
    description: "Build a sustainable freelance business. Pricing, contracts, client communication, and building long-term relationships.",
    lessons: 8,
    duration: "4 weeks",
  },
  {
    code: "HU-304",
    title: "Capstone Project Management",
    department: "Production",
    departmentId: "production",
    credits: 5,
    level: "Advanced" as const,
    description: "Lead a complete film production from concept to delivery. Coordinate teams, manage timelines, and deliver your capstone film.",
    lessons: 12,
    duration: "8 weeks",
  },
];

const stats = [
  { icon: BookOpen, value: "16", label: "Total Courses" },
  { icon: Clock, value: "85+", label: "Hours of Content" },
  { icon: Award, value: "64", label: "Total Credits" },
  { icon: Users, value: "4", label: "Departments" },
];

const Academics = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredCourses = activeFilter === "all" 
    ? courses 
    : courses.filter(course => course.departmentId === activeFilter);

  const activeDepartment = departments.find(d => d.id === activeFilter);

  const totalCredits = filteredCourses.reduce((acc, c) => acc + c.credits, 0);
  const totalLessons = filteredCourses.reduce((acc, c) => acc + c.lessons, 0);

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-noise">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-neon-purple/5 rounded-full blur-[120px]" />
        
        <div className="container-wide relative z-10">
          <div className="max-w-4xl">
            <span className="tag-sticker mb-6 animate-reveal">
              <BookOpen className="w-3 h-3 mr-2" />
              Full Curriculum
            </span>
            <h1 className="heading-1 mt-4 mb-6 animate-reveal stagger-1">
              MASTER THE
              <span className="text-neon-gradient text-glow"> CRAFT</span>
            </h1>
            <p className="body-large text-muted-foreground max-w-2xl animate-reveal stagger-2">
              16 courses across 4 departments. 85+ hours of content. Each class earns credits toward your degree. 
              No filler—every lesson teaches you something real.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 border-2 border-border bg-card/50 animate-reveal"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-primary/10 border border-primary flex items-center justify-center shrink-0">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-black text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Department Filter */}
      <Section className="bg-card/50 bg-noise py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setActiveFilter(dept.id)}
              className={`flex items-center gap-2 px-5 py-3 font-bold uppercase tracking-wide text-sm border-2 transition-all duration-300 ${
                activeFilter === dept.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-foreground"
              }`}
            >
              <dept.icon className="w-4 h-4" />
              {dept.name}
            </button>
          ))}
        </div>
      </Section>

      {/* Department Info (if specific department selected) */}
      {activeFilter !== "all" && activeDepartment && (
        <Section className="py-12">
          <div className="max-w-3xl mx-auto text-center animate-reveal">
            <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 border-2 border-primary flex items-center justify-center">
              {activeDepartment.icon && <activeDepartment.icon className="h-10 w-10 text-primary" />}
            </div>
            <h2 className="heading-3 text-foreground mb-4">{activeDepartment.name}</h2>
            <p className="text-muted-foreground mb-8">{activeDepartment.description}</p>
            
            <div className="flex flex-wrap justify-center gap-3">
              {activeDepartment.outcomes?.map((outcome, index) => (
                <span key={index} className="px-4 py-2 bg-muted border border-border text-sm font-medium text-foreground">
                  {outcome}
                </span>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Course Grid */}
      <Section className={activeFilter === "all" ? "" : "pt-0"}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 p-4 border-2 border-border bg-card/30">
          <div className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-bold">{filteredCourses.length}</span> courses
          </div>
          <div className="flex gap-6 text-sm">
            <div className="text-muted-foreground">
              Credits: <span className="text-primary font-bold">{totalCredits}</span>
            </div>
            <div className="text-muted-foreground">
              Lessons: <span className="text-foreground font-bold">{totalLessons}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course, index) => (
            <div 
              key={course.code} 
              className="animate-reveal"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CourseCard {...course} />
            </div>
          ))}
        </div>
      </Section>

      {/* Degree Path CTA */}
      <Section className="bg-card/50 bg-noise">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-left">
            <span className="tag-sticker mb-6">Earn Your Degree</span>
            <h2 className="heading-2 text-foreground mb-6 mt-4">
              THESE COURSES
              <span className="text-gold-gradient text-glow"> COUNT</span>
            </h2>
            <p className="body-large text-muted-foreground mb-8">
              Every course you complete earns credits toward your official Hoodtorial University degree. 
              Complete the full curriculum and graduate with real credentials.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { label: "Bachelor's Degree", value: "60 credits" },
                { label: "Associate's Degree", value: "30 credits" },
                { label: "Certificate", value: "15 credits" },
                { label: "Full Curriculum", value: "64 credits" },
              ].map((item, index) => (
                <div key={index} className="p-4 border-2 border-border bg-card/50">
                  <div className="text-lg font-black text-primary">{item.value}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</div>
                </div>
              ))}
            </div>

            <Link to="/degrees" className="btn-brutal inline-flex">
              View Degree Paths
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          <div className="animate-scale-in">
            <div className="border-4 border-primary p-8 bg-card relative animate-border-flow">
              <div className="text-center mb-8">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Your Progress</div>
                <div className="text-7xl font-black text-primary text-glow">0%</div>
                <div className="text-muted-foreground mt-2">Start your journey today</div>
              </div>

              <div className="space-y-3">
                {departments.filter(d => d.id !== "all").map((dept, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-border bg-muted/30">
                    <dept.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground flex-1">{dept.name}</span>
                    <span className="text-xs text-muted-foreground">0/4</span>
                  </div>
                ))}
              </div>

              {/* Corner accents */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-neon-purple" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-neon-pink" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-accent" />
            </div>
          </div>
        </div>
      </Section>

      {/* Enrollment CTA */}
      <Section>
        <div className="text-center p-12 border-2 border-border bg-card/50 animate-reveal">
          <h3 className="heading-3 text-foreground mb-4">READY TO START?</h3>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Enroll now to unlock all 16 courses and start earning credits toward your degree.
          </p>
          <Link to="/enroll" className="btn-brutal inline-flex animate-glow-pulse">
            Enroll Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </Section>
    </PageLayout>
  );
};

export default Academics;
