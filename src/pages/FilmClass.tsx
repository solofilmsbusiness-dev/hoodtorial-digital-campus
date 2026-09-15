import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Download, RotateCcw, Sparkles } from "lucide-react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import rooftopKeyframe from "@/assets/storytelling-rooftop-keyframe.png.asset.json";

const KEYFRAME_ALT =
  "Hand-drawn 2D animation keyframe: a young Black filmmaker in a rust jacket stands on a Brooklyn rooftop behind a cinema camera on a tripod, looking toward a painted golden sunset over the city skyline, bridge, and river.";

type Beat = { step: string; title: string; line: string; craft: string };

const beats: Beat[] = [
  {
    step: "01",
    title: "Goal",
    line: "She wants the sunset shot before the light is gone.",
    craft:
      "A wide establishing shot carries the geography and the clock at once: the rooftop, the camera already set, and a sun that is clearly on its way down. The audience learns where we are and how much time is left without anyone saying it.",
  },
  {
    step: "02",
    title: "Obstacle",
    line: "The camera loses power.",
    craft:
      "An insert shot reveals the failure. A battery indicator, a dark viewfinder, a hand tapping a dead body. The insert earns its place because it delivers information the wide shot physically cannot show.",
  },
  {
    step: "03",
    title: "Choice",
    line: "She decides instead of freezing.",
    craft:
      "Hold on her reaction. Long enough for the audience to see the problem land, then see her settle on an answer. This is the beat most beginners cut short, and it is the beat that turns an accident into a decision.",
  },
  {
    step: "04",
    title: "Consequence",
    line: "She raises her phone and keeps shooting.",
    craft:
      "The final action proves the choice was real. Nothing is explained. The change in the character is visible in what she does, and the sunset is still in the frame she fought for.",
  },
];

type Shot = { label: string; size: string; job: string; note: string };

const shotBreakdown: Shot[] = [
  { label: "Shot 1", size: "Wide", job: "Establish geography and time", note: "Rooftop, skyline, camera on sticks, sun low. The deadline is visual." },
  { label: "Shot 2", size: "Insert", job: "Reveal the failure", note: "Close on the camera as power drops. New information, not a prettier version of shot 1." },
  { label: "Shot 3", size: "Reaction", job: "Communicate the decision", note: "Her face. Let it breathe. The audience needs time to read the shift from problem to plan." },
  { label: "Shot 4", size: "Action", job: "Prove the choice", note: "Phone up, sunset framed, she keeps rolling. The consequence is shown, never stated." },
];

const transcript = `Watch how a scene can tell a story without a single line of dialogue. Our filmmaker wants the sunset shot. Then the camera loses power. That is the obstacle. The important moment is what she does next: she chooses her phone and keeps shooting. Goal. Obstacle. Choice. Consequence. Here is how you put that on screen. Start wide so we understand the rooftop, the camera, and the fading light. Move closer when the problem appears. Then hold on her reaction long enough for us to read the decision. Finish on the action that proves it. A close-up is useful because of the information it reveals, not just because it looks cinematic. If you remove the reaction, the switch to the phone may feel sudden. If you hide the camera problem, the choice may feel random. Every cut changes what the audience knows. For your assignment, film a thirty-second scene with no dialogue. Give someone a clear goal, put one obstacle in the way, and show a decision. Use three to five shots. Play it for someone without explaining it. Ask what the character wanted and what changed. If they can answer, your images are doing the storytelling.`;

const question = {
  prompt: "Why hold on her reaction before cutting to the phone?",
  answers: [
    "It fills time between two stronger shots",
    "It lets the audience read the decision, so the switch feels chosen rather than sudden",
    "Reaction shots are required in every sequence",
  ],
  correct: 1,
  explanations: [
    "A reaction is not filler. If it were only spacing, you could cut it and lose nothing — but cutting it here makes the phone appear out of nowhere.",
    "Correct. The reaction is where the audience watches the problem land and a decision form. Remove it and the phone feels sudden; hide the dead camera and the choice feels random.",
    "Nothing is required. This reaction earns its place because it carries the story beat — the choice — that no other shot in the scene shows.",
  ],
};

const assignment = `HOODTORIAL UNIVERSITY — FREE SAMPLE
Show the Story Without Dialogue

ASSIGNMENT
Film a 30-second scene with no dialogue, in 3–5 shots.
[ ] Give the character one clear goal
[ ] Put one obstacle in the way
[ ] Show a visible decision (hold the reaction)
[ ] End on an action that proves the choice

STRUCTURE
Goal        -> wide shot: establish place and time
Obstacle    -> insert: reveal the failure
Choice      -> reaction: hold long enough to be read
Consequence -> action: prove the decision

THE TEST
Play it for someone without explaining it.
Ask: What did the character want? What changed?
If they can answer, your images are doing the storytelling.

This free sample creates no enrollment, progress record, or degree credit.`;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

export default function FilmClass() {
  const [selected, setSelected] = useState<number | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [activeBeat, setActiveBeat] = useState(0);
  const reduced = useReducedMotion();

  const download = () => {
    const blob = new Blob([assignment], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hoodtorial-storytelling-assignment.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageLayout pageKey="film-class">
      <Helmet>
        <title>Show the Story Without Dialogue | Free Film Class</title>
        <meta name="description" content="A free Hoodtorial University storytelling lesson: goal, obstacle, choice, consequence — told in four shots with no dialogue." />
        <meta property="og:title" content="Show the Story Without Dialogue" />
        <meta property="og:description" content="A free Hoodtorial University storytelling lesson on goal, obstacle, choice, and consequence." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <header className="border-b-2 border-border bg-card/40">
        <div className="container-wide py-12 md:py-16">
          <span className="tag-sticker"><Sparkles className="mr-2 h-3 w-3" />Free sample · no degree credit</span>
          <p className="mt-8 text-sm font-black uppercase tracking-widest text-primary">HU-101 · Visual Storytelling</p>
          <h1 className="heading-1 mt-3 max-w-4xl">Show the Story <span className="text-gold-gradient">Without Dialogue</span></h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            A filmmaker wants the sunset. Her camera dies. What she does next is the whole story — and she never says a word.
          </p>
        </div>
      </header>

      <main className="container-wide py-10 md:py-14">
        <figure className="overflow-hidden border-2 border-border shadow-2xl">
          <img
            src={rooftopKeyframe.url}
            alt={KEYFRAME_ALT}
            width={1664}
            height={960}
            className="block w-full"
          />
          <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-border bg-card px-4 py-3 text-xs text-muted-foreground">
            <span><strong className="text-foreground">Shot 1 — Wide.</strong> Hand-drawn 2D key art. Rooftop, skyline, camera, fading light.</span>
            <span className="border border-primary/50 px-2 py-1 font-black uppercase text-primary">Animated film in production</span>
          </figcaption>
        </figure>

        <p className="mt-4 max-w-3xl text-sm text-muted-foreground">
          The narrated 2D animated version of this lesson is being produced now. Until it is finished, the full narration is written out below as a transcript — nothing is hidden behind a player.
        </p>

        <section className="mt-14">
          <h2 className="heading-3">The four story beats</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Every scene that works without dialogue runs the same engine: a character wants something, something stops them, they decide, and the decision costs or changes something. Select a beat to see the craft behind it.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {beats.map((beat, i) => {
              const active = activeBeat === i;
              return (
                <button
                  key={beat.step}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveBeat(i)}
                  className={cn(
                    "flex h-full flex-col border-2 bg-card p-5 text-left motion-safe:transition-colors",
                    active ? "border-primary" : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-xs font-black text-primary">{beat.step}</span>
                  <span className="mt-2 text-xl font-black uppercase">{beat.title}</span>
                  <span className="mt-2 text-sm font-bold text-foreground">{beat.line}</span>
                  <span className="mt-3 text-sm leading-6 text-muted-foreground">{beat.craft}</span>
                </button>
              );
            })}
          </div>
          <p aria-live="polite" className="mt-5 border-l-2 border-primary pl-4 text-sm text-muted-foreground">
            <strong className="text-foreground">{beats[activeBeat].title}:</strong> {beats[activeBeat].line} {beats[activeBeat].craft}
          </p>
        </section>

        <section className="mt-16">
          <h2 className="heading-3">Shot breakdown</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Four shots, four jobs. A close-up is useful because of the information it reveals, not because it looks cinematic.
          </p>
          <ol className="mt-8 space-y-3">
            {shotBreakdown.map((shot) => (
              <li key={shot.label} className="grid gap-2 border-2 border-border bg-card p-5 md:grid-cols-[7rem_9rem_1fr] md:items-baseline md:gap-6">
                <span className="text-xs font-black uppercase tracking-widest text-primary">{shot.label}</span>
                <span className="text-lg font-black uppercase">{shot.size}</span>
                <span className="text-sm leading-6 text-muted-foreground"><strong className="text-foreground">{shot.job}.</strong> {shot.note}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 max-w-3xl border-l-2 border-primary pl-4 text-sm text-muted-foreground">
            Remove the reaction and the switch to the phone feels sudden. Hide the camera problem and the choice feels random. Every cut changes what the audience knows.
          </p>
        </section>

        <section className="mt-16 border-2 border-border bg-card/50 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="heading-3">Narration transcript</h2>
              <p className="mt-2 text-sm text-muted-foreground">The complete lesson narration, in text. Recorded in the Cam Voice for the animated release.</p>
            </div>
            <Button variant="outline" aria-expanded={showTranscript} onClick={() => setShowTranscript((v) => !v)}>
              {showTranscript ? "Hide transcript" : "Read transcript"}
            </Button>
          </div>
          {showTranscript && (
            <p className={cn("mt-6 max-w-4xl text-base leading-8 text-muted-foreground", !reduced && "animate-fade-in")}>
              {transcript}
            </p>
          )}
        </section>

        <section className="mt-16">
          <h2 className="heading-3">Scenario check</h2>
          <fieldset className="mt-6 border-2 border-border bg-card/50 p-5">
            <legend className="px-2 font-bold">{question.prompt}</legend>
            <div className="mt-3 grid gap-2">
              {question.answers.map((a, ai) => (
                <Button
                  key={a}
                  variant={selected === ai ? (ai === question.correct ? "default" : "destructive") : "outline"}
                  className="h-auto min-h-11 justify-start whitespace-normal text-left"
                  onClick={() => setSelected(ai)}
                >
                  {a}
                </Button>
              ))}
            </div>
            {selected !== null && (
              <div
                role="status"
                className={cn(
                  "mt-4 border-l-2 pl-3 text-sm",
                  selected === question.correct ? "border-accent text-foreground" : "border-destructive text-muted-foreground"
                )}
              >
                <strong>{selected === question.correct ? "Correct. " : "Not quite. "}</strong>
                {question.explanations[selected]}
              </div>
            )}
            <Button variant="ghost" className="mt-4" onClick={() => setSelected(null)}>
              <RotateCcw />Retry question
            </Button>
          </fieldset>
        </section>

        <section id="assignment" className="mt-20 border-y-2 border-primary py-12">
          <p className="text-sm font-black uppercase tracking-widest text-primary">Practical assignment</p>
          <h2 className="heading-3 mt-2">Thirty seconds. No dialogue.</h2>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Film a 30-second scene with no dialogue in three to five shots. Give someone a clear goal, put one obstacle in the way, and show a decision. Then play it for someone without explaining it and ask two questions: what did the character want, and what changed? If they can answer, your images are doing the storytelling.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {beats.map((b) => (
              <div key={b.step} className="border-2 border-border bg-card p-4">
                <h3 className="font-black uppercase text-primary">{b.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{b.line}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={download}><Download />Download the assignment</Button>
            <a href="/academics" className="btn-brutal">See the full curriculum<ArrowRight className="ml-2 h-4 w-4" /></a>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
