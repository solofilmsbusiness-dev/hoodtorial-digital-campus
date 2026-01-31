import { PageLayout, Section, SectionHeader } from "@/components/layout";
import { CourseCard } from "@/components/cards";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Film, Palette, Clapperboard, Filter } from "lucide-react";
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
    description: "Master the art of visual storytelling through lens, light, and movement.",
    outcomes: ["Camera techniques", "Lighting setups", "Composition", "Mobile filmmaking"],
  },
  {
    id: "post-production",
    name: "Post-Production",
    icon: Palette,
    description: "Transform raw footage into polished films through editing and color.",
    outcomes: ["Video editing", "Color grading", "Sound design", "VFX basics"],
  },
  {
    id: "directing",
    name: "Directing",
    icon: Clapperboard,
    description: "Lead creative vision from concept to final cut.",
    outcomes: ["Story structure", "Working with talent", "Shot planning", "Creative leadership"],
  },
  {
    id: "production",
    name: "Production",
    icon: Filter,
    description: "Plan, organize, and execute film projects from start to finish.",
    outcomes: ["Pre-production", "Budget management", "Scheduling", "Team coordination"],
  },
];

const courses = [
  // Cinematography
  {
    code: "HU-101",
    title: "iPhone Cinematography Fundamentals",
    department: "Cinematography",
    departmentId: "cinematography",
    credits: 3,
    level: "Beginner" as const,
    description: "Master the basics of shooting cinematic footage on your iPhone. Learn settings, stabilization, and composition.",
  },
  {
    code: "HU-102",
    title: "Lighting for Mobile Film",
    department: "Cinematography",
    departmentId: "cinematography",
    credits: 4,
    level: "Beginner" as const,
    description: "Control light like a pro using natural and affordable artificial sources.",
  },
  {
    code: "HU-201",
    title: "Advanced Camera Movement",
    department: "Cinematography",
    departmentId: "cinematography",
    credits: 4,
    level: "Intermediate" as const,
    description: "Dynamic movement techniques: gimbals, sliders, and handheld style.",
  },
  // Post-Production
  {
    code: "HU-103",
    title: "Editing Fundamentals",
    department: "Post-Production",
    departmentId: "post-production",
    credits: 3,
    level: "Beginner" as const,
    description: "Learn the language of editing: cuts, pacing, and story flow.",
  },
  {
    code: "HU-202",
    title: "Color Grading Masterclass",
    department: "Post-Production",
    departmentId: "post-production",
    credits: 5,
    level: "Intermediate" as const,
    description: "Professional color grading techniques that make footage pop.",
  },
  {
    code: "HU-301",
    title: "Sound Design & Mix",
    department: "Post-Production",
    departmentId: "post-production",
    credits: 4,
    level: "Advanced" as const,
    description: "Create immersive audio landscapes and professional sound mixes.",
  },
  // Directing
  {
    code: "HU-104",
    title: "Visual Storytelling",
    department: "Directing",
    departmentId: "directing",
    credits: 3,
    level: "Beginner" as const,
    description: "Tell stories through images. Master the fundamentals of visual narrative.",
  },
  {
    code: "HU-203",
    title: "Documentary Storytelling",
    department: "Directing",
    departmentId: "directing",
    credits: 5,
    level: "Intermediate" as const,
    description: "Craft compelling documentary narratives from concept to final cut.",
  },
  {
    code: "HU-302",
    title: "Directing Talent",
    department: "Directing",
    departmentId: "directing",
    credits: 4,
    level: "Advanced" as const,
    description: "Work with actors and on-screen talent to get authentic performances.",
  },
  // Production
  {
    code: "HU-105",
    title: "Pre-Production Planning",
    department: "Production",
    departmentId: "production",
    credits: 3,
    level: "Beginner" as const,
    description: "Plan your shoots effectively: scripts, shot lists, and schedules.",
  },
  {
    code: "HU-204",
    title: "Budget Filmmaking",
    department: "Production",
    departmentId: "production",
    credits: 4,
    level: "Intermediate" as const,
    description: "Create professional results on limited budgets. Maximize every dollar.",
  },
  {
    code: "HU-303",
    title: "Capstone Project Management",
    department: "Production",
    departmentId: "production",
    credits: 5,
    level: "Advanced" as const,
    description: "Lead a complete film production from concept to delivery.",
  },
];

const Academics = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredCourses = activeFilter === "all" 
    ? courses 
    : courses.filter(course => course.departmentId === activeFilter);

  const activeDepartment = departments.find(d => d.id === activeFilter);

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
              Curriculum
            </span>
            <h1 className="heading-1 mt-4 mb-6 animate-reveal stagger-1">
              MASTER THE
              <span className="text-neon-gradient text-glow"> CRAFT</span>
            </h1>
            <p className="body-large text-muted-foreground max-w-2xl animate-reveal stagger-2">
              12 courses across 4 departments. Each class earns credits toward your degree. 
              No filler—every lesson teaches you something real.
            </p>
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
        <div className="flex items-center justify-between mb-8">
          <div className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-bold">{filteredCourses.length}</span> courses
          </div>
          <div className="text-sm text-muted-foreground">
            Total credits: <span className="text-primary font-bold">{filteredCourses.reduce((acc, c) => acc + c.credits, 0)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* CTA */}
        <div className="text-center mt-16 p-12 border-2 border-border bg-card/50 animate-reveal">
          <h3 className="heading-3 text-foreground mb-4">READY TO START?</h3>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Enroll now to unlock all courses and start earning credits toward your degree.
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
