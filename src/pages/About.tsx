import { PageLayout } from "@/components/layout/PageLayout";
import { Target, Film, Users, Award, Zap, Heart, Clapperboard, Info } from "lucide-react";

const coreValues = [
  {
    icon: Film,
    title: "Craft Over Clout",
    description: "We prioritize mastering the fundamentals over chasing trends. Real skill speaks louder than followers.",
  },
  {
    icon: Target,
    title: "Accessibility First",
    description: "World-class filmmaking education shouldn't require expensive equipment or exclusive connections.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "We learn together, critique together, and celebrate together. Your success is our success.",
  },
  {
    icon: Zap,
    title: "Action Over Theory",
    description: "Every lesson ends with you creating something. Watching tutorials isn't learning—doing is.",
  },
  {
    icon: Award,
    title: "Excellence Expected",
    description: "We hold our students to professional standards because that's what the industry demands.",
  },
  {
    icon: Heart,
    title: "Authenticity Always",
    description: "Tell your story, your way. We teach techniques, not templates. Your voice matters.",
  },
];

const stats = [
  { value: "10K+", label: "Students Enrolled" },
  { value: "16", label: "Courses Available" },
  { value: "500+", label: "Graduates" },
  { value: "4.9", label: "Average Rating" },
];

export default function About() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-background overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="container-wide relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="tag-sticker mb-6">Est. 2024</span>
            <h1 className="heading-1 text-gold-gradient mb-6">
              The People's Film School
            </h1>
            <p className="body-large text-muted-foreground max-w-2xl mx-auto">
              Democratizing cinematic education for the next generation of filmmakers. 
              No gatekeepers. No barriers. Just pure craft.
            </p>
          </div>
        </div>
      </section>

      {/* Hoodtorials Brand Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <div className="border-4 border-border bg-card/30 backdrop-blur-sm p-12 md:p-20 relative">
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary" />

              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-primary/10 border-2 border-primary/50 flex items-center justify-center">
                  <Clapperboard className="h-8 w-8 text-primary" />
                </div>
              </div>

              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-gold-gradient text-glow tracking-tight">
                HOODTORIALS
              </h2>

              <p className="text-lg md:text-2xl font-bold uppercase tracking-[0.25em] text-muted-foreground mt-6">
                Where We Look Under the Hood of Filmmaking
              </p>

              <p className="body-large text-muted-foreground mt-6 max-w-2xl mx-auto">
                We break down every technique, every tool, every decision that separates amateur footage from professional cinema. No gatekeeping — just the real craft, decoded.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 md:py-24 bg-charcoal">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <div className="border-l-4 border-primary pl-8 md:pl-12">
              <h2 className="heading-2 mb-6">Our Mission</h2>
              <p className="text-xl md:text-2xl text-foreground leading-relaxed mb-6">
                To prove that <span className="text-primary font-bold">great cinema</span> isn't 
                about the camera in your hand—it's about the <span className="text-primary font-bold">vision in your mind</span>.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Hoodtorial University was founded on a simple belief: the next generation of 
                groundbreaking filmmakers are already out there, camera in hand, ready to create. 
                They just need the knowledge, structure, and community to turn raw talent into 
                professional-grade craft.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-charcoal-dark border-y-2 border-border">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-black text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Code - Core Values */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <div className="text-center mb-12 md:mb-16">
            <span className="tag-sticker mb-4">The Code</span>
            <h2 className="heading-2 mb-4">What We Stand For</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              These aren't just values on a wall. They're the principles that 
              guide every course, critique, and community interaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {coreValues.map((value) => (
              <div 
                key={value.title}
                className="border-2 border-border bg-card p-6 hover:border-primary transition-colors"
              >
                <div className="w-12 h-12 bg-primary/20 border-2 border-primary flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-16 md:py-24 bg-charcoal">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="tag-sticker mb-4">The Beginning</span>
                <h2 className="heading-2 mb-6">Born From the Culture</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Hoodtorial University started in 2024 with a simple observation: 
                    some of the most creative, innovative filmmaking was happening in 
                    neighborhoods that Hollywood never visits.
                  </p>
                  <p>
                    We saw music videos and short films that outperformed million-dollar 
                    productions. We saw documentary footage from community creators that 
                    told stories mainstream media ignored. We saw raw, unfiltered talent 
                    everywhere—just waiting for the right education.
                  </p>
                  <p>
                    So we built it. A film school that meets creators where they are: 
                    in their communities, on their terms, with whatever camera they have.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-charcoal-dark border-2 border-border flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl md:text-8xl font-black text-primary mb-2">HU</div>
                    <div className="text-sm uppercase tracking-widest text-muted-foreground">
                      Since 2024
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-primary -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="heading-2 mb-6">Ready to Join the Movement?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Whether you're shooting your first short or refining your directorial voice, 
              there's a place for you at Hoodtorial University.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/enrollment" className="btn-brutal">
                View Membership Tiers
              </a>
              <a 
                href="/academics" 
                className="inline-flex items-center justify-center h-12 px-8 border-2 border-border font-bold uppercase tracking-wide hover:border-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Browse Courses
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Disclosure Section */}
      <section className="py-12 md:py-16 bg-charcoal border-t-2 border-border">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card/50 border-2 border-border p-8 md:p-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-primary/20 border-2 border-primary/50 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground">
                  Important Disclosure — Please Read
                </h3>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed pl-14">
                <p>
                  <strong className="text-foreground">Hoodtorial University is an online educational platform</strong>, not an accredited college or university. 
                  The terms "university," "degree paths," "courses," and "credits" are used for organizational and motivational purposes only and do not represent formal academic credentials.
                </p>
                <p>
                  Completion of our programs <strong className="text-foreground">does not result in an accredited degree, diploma, or professional certification</strong>. 
                  Our courses are designed to teach practical filmmaking skills and should be treated as professional development and creative enrichment.
                </p>
                <p>
                  That said — the skills you learn here are <span className="text-primary font-semibold">real</span>, the community is <span className="text-primary font-semibold">real</span>, and the growth you'll experience is <span className="text-primary font-semibold">real</span>. 
                  We're here to help you become a better filmmaker, one lesson at a time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
