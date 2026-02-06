import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useFacultyMembers, type FacultyMember } from "@/hooks/useFacultyMembers";
import { Skeleton } from "@/components/ui/skeleton";

const departments = [
  { name: "All", value: "all" },
  { name: "Cinematography", value: "Cinematography" },
  { name: "Post-Production", value: "Post-Production" },
  { name: "Directing", value: "Directing" },
  { name: "Production", value: "Production" },
];

function FeaturedCard({ faculty }: { faculty: FacultyMember }) {
  return (
    <div className="relative bg-card border-2 border-border p-6 md:p-8 flex flex-col md:flex-row gap-6 hover:border-primary transition-colors">
      <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary flex items-center justify-center overflow-hidden">
        {faculty.image_url ? (
          <img src={faculty.image_url} alt={faculty.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl md:text-5xl font-black text-primary">{faculty.name.charAt(0)}</span>
        )}
      </div>
      <div className="flex-1">
        <span className="tag-outline text-primary text-[10px] mb-3 inline-block">{faculty.department}</span>
        <h3 className="heading-4 text-foreground mb-1">{faculty.name}</h3>
        <p className="text-sm text-primary uppercase tracking-wide font-medium mb-3">{faculty.role}</p>
        <p className="text-sm text-muted-foreground mb-4">{faculty.bio}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {faculty.expertise.map((skill) => (
            <span key={skill} className="text-xs px-2 py-1 bg-muted text-muted-foreground">{skill}</span>
          ))}
        </div>
        <Button variant="outline" size="sm" className="gap-2 border-2">
          <Play className="h-3 w-3" /> Watch Intro
        </Button>
      </div>
    </div>
  );
}

function FacultyCard({ faculty }: { faculty: FacultyMember }) {
  return (
    <div className="bg-card border-2 border-border p-6 hover:border-primary transition-all duration-300 hover:-translate-y-1">
      <div className="w-16 h-16 mb-4 bg-gradient-to-br from-charcoal-light to-charcoal border border-border flex items-center justify-center overflow-hidden">
        {faculty.image_url ? (
          <img src={faculty.image_url} alt={faculty.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-muted-foreground">{faculty.name.charAt(0)}</span>
        )}
      </div>
      <span className="text-[10px] uppercase tracking-widest text-primary font-bold">{faculty.department}</span>
      <h3 className="font-bold text-foreground mt-1 mb-1">{faculty.name}</h3>
      <p className="text-xs text-muted-foreground mb-3">{faculty.role}</p>
      <div className="flex flex-wrap gap-1 mb-4">
        {faculty.expertise.slice(0, 2).map((skill) => (
          <span key={skill} className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground">{skill}</span>
        ))}
        {faculty.expertise.length > 2 && (
          <span className="text-[10px] px-2 py-0.5 text-muted-foreground">+{faculty.expertise.length - 2}</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground line-clamp-3 mb-4">{faculty.bio}</p>
      <Button variant="ghost" size="sm" className="gap-1 text-xs p-0 h-auto hover:text-primary">
        <Play className="h-3 w-3" /> Watch Intro
      </Button>
    </div>
  );
}

export default function Faculty() {
  const { data: facultyMembers, isLoading } = useFacultyMembers();
  const [activeDept, setActiveDept] = useState("all");

  const filtered = facultyMembers?.filter(
    (f) => activeDept === "all" || f.department === activeDept
  );
  const featured = filtered?.filter((f) => f.featured) ?? [];
  const regular = filtered?.filter((f) => !f.featured) ?? [];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-background overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="container-wide relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="tag-sticker mb-6">Meet The Faculty</span>
            <h1 className="heading-1 text-gold-gradient mb-6">Learn From The Best</h1>
            <p className="body-large text-muted-foreground max-w-2xl mx-auto">
              Our instructors are working professionals who've shot for major brands, directed award-winning films, and pioneered mobile filmmaking.
            </p>
          </div>
        </div>
      </section>

      {/* Department Filter */}
      <section className="py-8 bg-charcoal-dark border-y border-border">
        <div className="container-wide">
          <div className="flex flex-wrap justify-center gap-3">
            {departments.map((dept) => (
              <Button
                key={dept.value}
                variant={activeDept === dept.value ? "default" : "outline"}
                className={activeDept === dept.value
                  ? "font-bold uppercase tracking-wide"
                  : "font-bold uppercase tracking-wide border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                }
                onClick={() => setActiveDept(dept.value)}
              >
                {dept.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty Content */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : (
            <>
              {/* Featured Faculty */}
              {featured.length > 0 && (
                <div className="mb-16">
                  <div className="mb-12">
                    <h2 className="heading-3 mb-2">Department Heads</h2>
                    <p className="text-muted-foreground">Leading the curriculum and setting the standard.</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {featured.map((f) => <FeaturedCard key={f.id} faculty={f} />)}
                  </div>
                </div>
              )}

              {/* All Faculty Grid */}
              {regular.length > 0 && (
                <>
                  <div className="mb-8">
                    <h2 className="heading-3 mb-2">All Faculty</h2>
                    <p className="text-muted-foreground">Industry veterans bringing real-world experience to every lesson.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {regular.map((f) => <FacultyCard key={f.id} faculty={f} />)}
                  </div>
                </>
              )}

              {filtered?.length === 0 && (
                <p className="text-center text-muted-foreground py-12">No faculty members found.</p>
              )}
            </>
          )}
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-16 md:py-24 bg-charcoal border-t border-border">
        <div className="container-wide text-center">
          <h2 className="heading-2 mb-4">Learn From Industry Pros</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Get direct access to working filmmakers who've shot for Netflix, Nike, and major record labels. Their knowledge, your smartphone.
          </p>
          <a href="/enrollment" className="btn-brutal">Start Learning Today</a>
        </div>
      </section>
    </PageLayout>
  );
}
