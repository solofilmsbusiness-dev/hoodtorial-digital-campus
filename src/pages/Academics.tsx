import { PageLayout, Section } from "@/components/layout";
import { CourseCard, CourseListItem } from "@/components/cards";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Clock, Award, Users, LayoutGrid, List, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { departments } from "@/data/courses";
import { TrialBanner } from "@/components/subscription";
import { useSubscription } from "@/hooks/useSubscription";
import { useCourseStatus } from "@/hooks/useCourseStatus";
import { Skeleton } from "@/components/ui/skeleton";

const stats = [
  { icon: BookOpen, value: "16", label: "Total Courses" },
  { icon: Clock, value: "85+", label: "Hours of Content" },
  { icon: Award, value: "64", label: "Total Credits" },
  { icon: Users, value: "4", label: "Departments" },
];

const Academics = () => {
  const { isTrialing } = useSubscription();
  const { courses, isLoading } = useCourseStatus();
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses.filter(course => {
    const matchesDepartment = activeFilter === "all" || course.departmentId === activeFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      course.code.toLowerCase().includes(query) ||
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      course.department.toLowerCase().includes(query);
    return matchesDepartment && matchesSearch;
  });

  // Sort: available courses first, coming soon last
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (a.isComingSoon === b.isComingSoon) return 0;
    return a.isComingSoon ? 1 : -1;
  });

  const activeDepartment = departments.find(d => d.id === activeFilter);

  const totalCredits = filteredCourses.reduce((acc, c) => acc + c.credits, 0);
  const totalLessons = filteredCourses.reduce((acc, c) => acc + c.lessons, 0);

  return (
    <PageLayout pageKey="academics">
      {/* Trial Banner */}
      {isTrialing && <TrialBanner />}

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
        <div className="flex flex-col gap-4 mb-8 p-4 border-2 border-border bg-card/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="text-foreground font-bold">{filteredCourses.length}</span> courses
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex gap-4 text-sm">
                <div className="text-muted-foreground">
                  Credits: <span className="text-primary font-bold">{totalCredits}</span>
                </div>
                <div className="text-muted-foreground">
                  Lessons: <span className="text-foreground font-bold">{totalLessons}</span>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex border-2 border-border">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search courses by code, title, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-background border-2 border-border focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border">
            <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              No courses match "{searchQuery}"{activeFilter !== "all" && " in this department"}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
              }}
              className="text-primary hover:underline font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedCourses.map((course, index) => (
              <div 
                key={course.code} 
                className="animate-reveal"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CourseCard {...course} isComingSoon={course.isComingSoon} />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCourses.map((course, index) => (
              <div 
                key={course.code} 
                className="animate-reveal"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <CourseListItem {...course} isComingSoon={course.isComingSoon} />
              </div>
            ))}
          </div>
        )}
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
          <Link to="/enrollment" className="btn-brutal inline-flex animate-glow-pulse">
            Enroll Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </Section>
    </PageLayout>
  );
};

export default Academics;
