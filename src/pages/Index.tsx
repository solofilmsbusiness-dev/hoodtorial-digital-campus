import { Helmet } from "react-helmet-async";
import { PageLayout } from "@/components/layout";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollReveal, CountingNumber } from "@/components/animations";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Clock,
  Star,
  CheckCircle2,
  BookOpen,
  Users,
} from "lucide-react";
import heroLogo from "@/assets/hero-logo.png";
import heroVideo from "@/assets/hero-video.mp4";
import { courses, departments } from "@/data/courses";

// ── helpers ────────────────────────────────────────────────────────────────────

function courseCount(deptId: string) {
  return courses.filter((c) => c.departmentId === deptId).length;
}

// ── data ───────────────────────────────────────────────────────────────────────

const displayDepartments = departments.filter((department) => department.id !== "all");

const pillars = [
  {
    icon: Star,
    title: "Real creators. Real techniques.",
    description:
      "Every lesson comes from working professionals who've shot campaigns, features, and viral content — not academics reading from slides.",
  },
  {
    icon: Clock,
    title: "Learn at your own pace.",
    description:
      "Async, mobile-friendly, lifetime access. Watch on the train, in the edit suite, or at 2 AM when the idea hits you.",
  },
  {
    icon: Zap,
    title: "Built for the streets.",
    description:
      "No fluff, no gatekeeping. Practical urban filmmaking skills you can use on your next shoot — whether that's tomorrow or tonight.",
  },
];

const stats = [
  { value: String(courses.length), label: "Catalog Courses" },
  { value: String(displayDepartments.length), label: "Departments" },
  { value: "3", label: "Free Sample Lessons" },
  { value: "1", label: "Interactive Mini-Class" },
];

// ── Waitlist form ──────────────────────────────────────────────────────────────

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "duplicate" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setStatus("idle");

    const { error } = await supabase
      .from("waitlist")
      .insert({ email: email.toLowerCase().trim(), status: "pending" });

    setLoading(false);

    if (!error) {
      setStatus("success");
      const capturedEmail = email.toLowerCase().trim();
      setEmail("");
      supabase.functions.invoke("send-waitlist-email", {
        body: { email: capturedEmail },
      });
    } else if (error.code === "23505") {
      setStatus("duplicate");
    } else {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 justify-center p-5 border-2 border-primary bg-primary/10 max-w-md mx-auto">
        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
        <span className="font-bold text-primary uppercase tracking-wide text-sm">
          You're on the list. We'll be in touch.
        </span>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={loading}
          className="flex-1 h-14 px-4 border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all duration-300 font-medium disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-brutal h-14 whitespace-nowrap disabled:opacity-50"
        >
          {loading ? "..." : "Join Waitlist"}
        </button>
      </form>
      {status === "duplicate" && (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          You're already on the list. We got you.
        </p>
      )}
      {status === "error" && (
        <p className="mt-3 text-center text-sm text-destructive">
          Something went wrong. Try again.
        </p>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

const Index = () => {
  // Featured course data
  const featuredCourse = courses.find((c) => c.code === "HU-101");
  const featuredLessons = featuredCourse
    ? featuredCourse.modules.flatMap((m) => m.lessons).slice(0, 4)
    : [];

  return (
    <>
      <Helmet>
        <title>Hoodtorial University — Where Hustle Meets Hollywood</title>
        <meta
          name="description"
          content="Master cinematography, editing, photography and directing from creators who've actually done it. Hoodtorial University — film school for the culture."
        />
        <link rel="canonical" href="https://hoodtorialuniversity.com" />
        <meta property="og:title" content="Hoodtorial University — Where Hustle Meets Hollywood" />
        <meta
          property="og:description"
          content="Master cinematography, editing, photography and directing from creators who've actually done it."
        />
        <meta property="og:url" content="https://hoodtorialuniversity.com/" />
        <meta property="og:type" content="website" />
      </Helmet>

      <PageLayout pageKey="home">
        {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-noise">
          {/* Background Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-[0.12]"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>

          {/* Overlays */}
          <div className="absolute inset-0 bg-background/85" />
          <div className="absolute inset-0 bg-grid" />
          <div className="absolute inset-0 video-overlay" />

          {/* Ambient glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px] animate-pulse" />
          <div
            className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-neon-purple/8 rounded-full blur-[120px] animate-pulse"
            style={{ animationDelay: "1s" }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
            <div className="flex flex-col items-center text-center">
              {/* Logo */}
              <div className="animate-reveal">
                <img
                  src={heroLogo}
                  alt="Hoodtorial University"
                  className="h-[180px] sm:h-[260px] lg:h-[340px] w-auto animate-logo-pulse"
                />
              </div>

              {/* Headline */}
              <h1 className="mt-8 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none animate-reveal stagger-1">
                <span className="block text-foreground">Where Hustle</span>
                <span className="block text-gold-gradient text-glow">Meets Hollywood</span>
              </h1>

              {/* Subtext */}
              <p className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground font-medium leading-relaxed animate-reveal stagger-2">
                Master cinematography, editing, photography and directing from creators who've
                actually done it.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-reveal stagger-3">
                <Link to="/auth" className="btn-brutal animate-glow-pulse">
                  Start Learning
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/film-class"
                  className="inline-flex items-center gap-2 h-14 px-8 border-2 border-border text-foreground font-bold uppercase tracking-wide hover:border-primary hover:bg-primary/10 transition-all duration-300"
                >
                  Try a Free Lesson
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Scroll indicator */}
              <div className="mt-16 animate-reveal stagger-4">
                <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center pt-2 mx-auto animate-glow-pulse">
                  <div className="w-1 h-2 bg-primary rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. STATS BAR ─────────────────────────────────────────────────── */}
        <div className="bg-zinc-950 border-y-2 border-border py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((stat, i) => (
                <ScrollReveal key={i} delay={0.1 * i} direction="up">
                  <div>
                    <div className="text-3xl md:text-4xl font-black text-primary text-glow">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. WHAT YOU'LL MASTER ────────────────────────────────────────── */}
        <section className="py-20 md:py-32 bg-card/30 bg-noise">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <div className="text-center mb-16">
                <span className="tag-sticker mb-6">Curriculum</span>
                <h2 className="heading-2 text-foreground mt-4">
                  WHAT YOU'LL{" "}
                  <span className="text-gold-gradient text-glow">MASTER</span>
                </h2>
                <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
                  {displayDepartments.length} departments in the current catalog. Course listings include available and planned curriculum.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayDepartments.map((dept, i) => {
                const count = courseCount(dept.id);
                const Icon = dept.icon;
                return (
                  <ScrollReveal key={dept.id} delay={0.1 * i} direction="up">
                    <Link to="/academics" className="block h-full">
                      <div className="card-urban group h-full cursor-pointer">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 shrink-0 bg-primary/10 border-2 border-primary/40 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                            <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-lg text-foreground group-hover:text-primary transition-colors duration-300 uppercase tracking-wide">
                              {dept.name}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                              {dept.description}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            {count} {count === 1 ? "course" : "courses"}
                          </span>
                          <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 4. FEATURED COURSE ───────────────────────────────────────────── */}
        {featuredCourse && (
          <section className="py-20 md:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal direction="up">
                <div className="text-center mb-12">
                  <span className="tag-sticker mb-6">Featured Course</span>
                  <h2 className="heading-2 text-foreground mt-4">
                    START{" "}
                    <span className="text-gold-gradient text-glow">HERE</span>
                  </h2>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.1}>
                <div className="relative border-2 border-primary bg-card/50 backdrop-blur-sm p-8 md:p-12 max-w-4xl mx-auto">
                  {/* Decorative corners */}
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-primary" />
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-primary" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Course info */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest">
                          <Star className="w-3 h-3" /> Start Here
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          {featuredCourse.code}
                        </span>
                      </div>

                      <h3 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight leading-tight">
                        {featuredCourse.title}
                      </h3>

                      <p className="mt-1 text-sm font-bold uppercase tracking-widest text-primary">
                        {featuredCourse.department}
                      </p>

                      <p className="mt-4 text-muted-foreground leading-relaxed">
                        {featuredCourse.description}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <span className="font-bold">{featuredCourse.lessons} lessons</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="font-bold">{featuredCourse.duration}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Star className="w-4 h-4 text-primary" />
                          <span className="font-bold">{featuredCourse.level}</span>
                        </span>
                      </div>

                      <div className="mt-8">
                        <Link to="/auth" className="btn-brutal inline-flex">
                          Enroll Now
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </div>
                    </div>

                    {/* Lesson preview */}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
                        What's Inside
                      </h4>
                      <ul className="space-y-3">
                        {featuredLessons.map((lesson, i) => (
                          <li
                            key={lesson.id}
                            className="flex items-center gap-3 p-3 border border-border bg-background/50 hover:border-primary/50 transition-colors duration-200"
                          >
                            <span className="text-xs font-black text-primary w-5 shrink-0">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="text-sm font-medium text-foreground truncate">
                              {lesson.title}
                            </span>
                            <span className="ml-auto text-xs text-muted-foreground shrink-0">
                              {lesson.duration}
                            </span>
                          </li>
                        ))}
                        <li className="flex items-center gap-3 p-3 border border-dashed border-border/50">
                          <span className="text-xs text-muted-foreground italic">
                            + {featuredCourse.lessons - featuredLessons.length} more lessons inside...
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* ── 5. WHY HOODTORIAL UNIVERSITY ─────────────────────────────────── */}
        <section className="py-20 md:py-32 bg-card/30 bg-noise">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <div className="text-center mb-16">
                <span className="tag-sticker mb-6">Why HU</span>
                <h2 className="heading-2 text-foreground mt-4">
                  NOT YOUR AVERAGE{" "}
                  <span className="text-gold-gradient text-glow">FILM SCHOOL</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pillars.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <ScrollReveal key={i} delay={0.15 * i} direction="up">
                    <div className="card-urban group h-full text-center">
                      <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 border-2 border-primary/50 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                        <Icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
                      </div>
                      <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors duration-300 uppercase tracking-wide leading-tight mb-3">
                        {pillar.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 6. WAITLIST CTA ──────────────────────────────────────────────── */}
        <section id="waitlist" className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <div className="relative border-4 border-primary bg-card/50 backdrop-blur-sm p-10 md:p-20 text-center max-w-3xl mx-auto">
                {/* Decorative corners */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary" />

                <div className="flex justify-center mb-6">
                  <Users className="w-10 h-10 text-primary animate-pulse" />
                </div>

                <h2 className="heading-2 text-foreground">
                  BE FIRST{" "}
                  <span className="text-gold-gradient text-glow">IN LINE</span>
                </h2>
                <p className="mt-4 mb-8 text-muted-foreground text-lg max-w-xl mx-auto">
                  Get early access and exclusive launch pricing. No spam — just game.
                </p>

                <WaitlistForm />
              </div>
            </ScrollReveal>
          </div>
        </section>
      </PageLayout>
    </>
  );
};

export default Index;
