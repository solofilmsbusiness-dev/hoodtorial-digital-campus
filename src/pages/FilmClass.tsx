import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, Download, Pause, Play, RotateCcw, Sparkles, StepBack, StepForward } from "lucide-react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import compositionStage from "@/assets/film-class-composition-stage.webp";
import characterLeft from "@/assets/film-class-character-left.webp";
import leadingLinesStage from "@/assets/film-class-leading-lines-plate.webp";
import characterRight from "@/assets/film-class-character-right.webp";
import sequenceWide from "@/assets/film-class-sequence-wide.webp";
import sequenceMedium from "@/assets/film-class-sequence-medium.webp";
import sequenceClose from "@/assets/film-class-sequence-close.webp";

type Question = { prompt: string; answers: string[]; correct: number; explanation: string };
type Lesson = { title: string; kicker: string; objective: string; body: string[]; questions: Question[] };

const lessons: Lesson[] = [
  {
    title: "Rule of Thirds",
    kicker: "Place the subject. Change the feeling.",
    objective: "Use placement and looking room to make the same location feel balanced, tense, open, or direct.",
    body: [
      "Composition is the decision about what belongs inside the frame and where each element sits. A thirds grid divides the image into nine sections. Its intersections are useful starting points because the eye can move between a subject and the environment instead of landing on one immovable center. In the scene below, placing the filmmaker near the right third leaves the studio entrance and the street visible. The place becomes part of the story, not leftover background.",
      "The grid is a tool, not a law. Centered framing can feel formal, confrontational, calm, iconic, or deliberately trapped. It works best when the symmetry, background, or emotion supports that choice. Compare the centered and thirds controls. Ask what the frame says before judging whether it follows a rule. If the audience should study the location before reading the person, off-center placement may create that path. If the person should command the image immediately, a strong center may be right.",
      "Looking room changes the emotional pressure. When a subject faces left, space on the left gives their gaze somewhere to travel. That breathing room can suggest possibility or attention beyond the frame. Crowding the face against the left edge blocks that visual path and can create tension, urgency, or unease. Neither version is automatically wrong. The important move is to notice the feeling and choose it. Start with the grid, check the gaze, then remove the overlay and see whether the story still reads.",
    ],
    questions: [
      { prompt: "A character looks toward a closed studio door. You want anticipation, not pressure. Where should most open space sit?", answers: ["Behind the character", "In the direction of the gaze", "Equally on every edge"], correct: 1, explanation: "Space in the direction of the gaze lets the viewer follow the character’s attention toward the door." },
      { prompt: "When is centered framing an intentional choice?", answers: ["Never; thirds is mandatory", "When symmetry or directness supports the moment", "Only when the background is empty"], correct: 1, explanation: "Centering can create symmetry, authority, calm, or confinement when that feeling serves the story." },
    ],
  },
  {
    title: "Leading Lines & Framing",
    kicker: "Make the viewer look where you want.",
    objective: "Arrange architectural lines and frame edges so attention reaches the story subject without accidental competition.",
    body: [
      "Leading lines are visible paths that encourage the eye to travel through an image. Floor seams, railings, window frames, ceiling beams, doorways, and rows of lights can all do the work. In this studio corridor, the architecture converges near the warm entrance. When the subject stands near that convergence, several quiet signals point to the same story beat: this person is arriving here. The lines do not force every viewer to look identically, and they never guarantee a good image. They simply strengthen a route through the frame.",
      "Placement determines whether those lines help or compete. Toggle the subject between misplaced and purposeful positions. In the misplaced version, the architecture points toward an empty doorway while the person floats near an unrelated edge. The eye receives two instructions. In the purposeful version, subject, doorway, and convergence cooperate. This does not mean every line must end exactly on a face. It means the strongest visual paths should support the information that matters most.",
      "Framing within the frame adds another layer. A doorway, fence opening, window, or foreground shape can isolate the subject and create depth. Turn on the framing overlay to see how the doorway contains the figure. Then look at the bright edge distraction: high contrast near a border can pull attention out of the image. Before recording, scan all four edges. Move yourself, adjust the angle, or simplify the background. Use lines and frames as choices, then test whether the viewer can quickly describe what matters and where to look next.",
    ],
    questions: [
      { prompt: "The sidewalk lines point to a doorway, but your subject stands far from it. What is the clearest first adjustment?", answers: ["Add more lines", "Place the subject near the visual destination", "Tilt the camera randomly"], correct: 1, explanation: "Aligning the subject with the existing visual path makes the architecture support the story." },
      { prompt: "Why scan the edges before recording?", answers: ["Bright or cut-off objects can steal attention", "Edges determine the frame rate", "Every edge must be perfectly dark"], correct: 0, explanation: "High-contrast or awkwardly cut-off details near an edge can pull the viewer away from the subject." },
    ],
  },
  {
    title: "Building a Shot Sequence",
    kicker: "Three shots. One clear moment.",
    objective: "Combine wide, medium, and close-up shots into a readable arrival while maintaining screen direction.",
    body: [
      "A sequence turns separate images into one understandable event. For a person arriving at a studio, the wide shot establishes the building, street, and direction of travel. It answers where. The medium shot moves closer as the person reaches the entrance and lifts a key. It answers what is happening. The close-up shows the useful detail—the key entering the lock. It answers exactly how the action advances. Each shot contributes new information instead of repeating the same view at three sizes.",
      "Order the storyboard below into the clearest version: wide, medium, close-up. As the sequence plays, notice the visual handoff. The person moves left to right in every shot, so the cut feels like continuous progress. If the direction suddenly reverses without motivation, the viewer may read the next image as a different movement or location. Consistency is especially valuable when a sequence is short and has little time to reorient the audience.",
      "The familiar order is not mandatory. A filmmaker might begin on the close-up of a key, withhold the location, then reveal the studio in a wide shot. That creates deliberate mystery because the audience receives detail before context. The test is clarity of intent: if the order varies, does the delayed information produce the feeling you wanted? Build the straightforward version first. Once it reads without explanation, experiment with withholding or rearranging information. Editing is not following a formula; it is controlling when the audience learns each part of the moment.",
    ],
    questions: [
      { prompt: "Which shot best establishes the studio and direction of arrival?", answers: ["Wide", "Medium", "Close-up"], correct: 0, explanation: "A wide shot gives the clearest location and spatial direction before closer action details." },
      { prompt: "When might close-up → medium → wide be useful?", answers: ["To hide all useful information", "To create deliberate mystery before revealing place", "Because shot order never affects meaning"], correct: 1, explanation: "Beginning on detail can delay context on purpose, then the wider reveal answers the audience’s question." },
    ],
  },
];

const shots = [
  { id: "wide", label: "WIDE", image: sequenceWide, detail: "Establishes the studio and left-to-right arrival.", alt: "Cinematic wide view of a filmmaker in a charcoal jacket walking left to right toward a warmly lit urban studio entrance." },
  { id: "medium", label: "MEDIUM", image: sequenceMedium, detail: "Reveals the person reaching for the entrance.", alt: "Cinematic medium view of the same filmmaker in profile, extending a hand right toward the black steel studio door." },
  { id: "close", label: "CLOSE-UP", image: sequenceClose, detail: "Shows the useful detail: key entering lock.", alt: "Cinematic close-up of the same gold-trimmed jacket cuff and hand guiding a brass key into the studio door lock." },
] as const;

type ShotId = (typeof shots)[number]["id"];

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

function CinematicImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div role="img" aria-label={`${alt} Artwork could not be loaded.`} className="flex h-full w-full items-center justify-center bg-muted p-6 text-center text-sm text-muted-foreground">Cinematic artwork unavailable. The text description remains available.</div>;
  return <img src={src} alt={alt} onError={() => setFailed(true)} className={cn("h-full w-full object-cover", className)} />;
}

function StageShell({ children, label }: { children: JSX.Element | JSX.Element[]; label: string }) {
  return <div className="relative aspect-video overflow-hidden border-2 border-border bg-muted shadow-2xl" role="group" aria-label={label}>{children}<div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-foreground/10"/><div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-background/60 to-transparent"/><span className="absolute left-3 top-3 border border-primary/50 bg-background/80 px-2 py-1 text-[10px] font-black uppercase text-primary backdrop-blur">Interactive 2.5D study</span></div>;
}

function SceneOne() {
  const [placement, setPlacement] = useState<"center" | "right third" | "left edge">("right third");
  const [grid, setGrid] = useState(true);
  const x = placement === "center" ? 50 : placement === "right third" ? 68 : 12;
  const description = placement === "center" ? "centered for a direct, formal composition" : placement === "right third" ? "on the right third, facing left into open breathing room" : "near the left edge, facing left with a cramped gaze path";
  return <div className="space-y-4">
    <StageShell label={`Urban studio at blue hour. A detailed filmmaker in a charcoal jacket is ${description}. His left-facing profile, nose, and eye line point toward the open street. Thirds grid is ${grid ? "visible" : "hidden"}.`}>
      <CinematicImage src={compositionStage} alt="Textured urban film studio exterior at blue hour with amber lights, black steel doorway, brick walls, and wet pavement." className="scale-[1.02] motion-safe:transition-transform motion-safe:duration-1000" />
      <div className="absolute bottom-[4%] h-[78%] w-[23%] -translate-x-1/2 motion-safe:transition-[left,filter] motion-safe:duration-700 motion-safe:ease-out" style={{ left: `${x}%`, filter: placement === "left edge" ? "brightness(.88)" : "brightness(1)" }}><CinematicImage src={characterLeft} alt="Adult Black filmmaker in left-facing profile, wearing a charcoal jacket with gold trim and a camera bag." className="object-contain object-bottom drop-shadow-2xl"/><div className="absolute bottom-[1%] left-[8%] h-[5%] w-[85%] rounded-full bg-background/70 blur-md" aria-hidden="true"/></div>
      <svg viewBox="0 0 100 56.25" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">{grid&&<g className="stroke-foreground/55" strokeWidth=".35">{[33.33,66.66].map(n=><line key={`v${n}`} x1={n} y1="0" x2={n} y2="56.25"/>)}{[18.75,37.5].map(n=><line key={`h${n}`} x1="0" y1={n} x2="100" y2={n}/>)}</g>}{placement!=="center"&&<g className="stroke-primary" strokeWidth=".55"><path d={placement==="right third"?"M60 18H16":"M10 18H2"}/><path d={placement==="right third"?"M16 18l4-2M16 18l4 2":"M2 18l4-2M2 18l4 2"}/></g>}<path d="M3 10V3H10 M90 3H97V10 M97 46V53H90 M10 53H3V46" className="fill-none stroke-primary" strokeWidth=".7"/></svg>
    </StageShell>
    <div className="grid gap-3"><Control label="Subject position and looking room" options={["center","right third","left edge"]} value={placement} onChange={v=>setPlacement(v as typeof placement)}/><Control label="Thirds grid" options={["off","on"]} value={grid?"on":"off"} onChange={v=>setGrid(v==="on")}/></div>
    <p className="border-l-2 border-primary pl-4 text-sm text-muted-foreground">{placement === "center" ? "Centered placement makes the arrival feel direct and formal; the person commands attention before the location." : placement === "right third" ? "The left-facing profile sits on the right third, leaving visible street space in the direction of his gaze." : "The left-facing profile is pressed near the left edge, cutting off his gaze path and creating deliberate pressure."}</p>
  </div>;
}

function SceneTwo() {
  const [purposeful, setPurposeful] = useState(true); const [frame, setFrame] = useState(true); const [distraction, setDistraction] = useState(true);
  return <div className="space-y-4">
    <StageShell label={`Brick-and-steel studio corridor whose floor seams, windows, rails, and ceiling beams converge at a bright doorway on the right. The filmmaker is ${purposeful ? "approaching that destination" : "misplaced at the competing left edge"}.`}>
      <CinematicImage src={leadingLinesStage} alt="Textured industrial studio corridor with wet reflections and real architectural lines converging toward a warm doorway on the right." />
      <div className="absolute bottom-[5%] w-[19%] motion-safe:transition-[left,filter] motion-safe:duration-700 motion-safe:ease-out" style={{ left: purposeful ? "67%" : "5%", filter: purposeful ? "brightness(1)" : "brightness(.72)" }}><CinematicImage src={characterRight} alt="Adult Black filmmaker walking right in a charcoal jacket with gold trim and camera bag." className="h-auto object-contain drop-shadow-2xl"/><div className="absolute bottom-[1%] left-[4%] h-[4%] w-[90%] rounded-full bg-background/70 blur-md" aria-hidden="true"/></div>
      <svg viewBox="0 0 100 56.25" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true"><g className="fill-none stroke-primary motion-safe:animate-fade-in" strokeWidth=".55" strokeDasharray="2 1"><path d="M2 54L80 29"/><path d="M30 56L80 29"/><path d="M7 2L80 29"/><path d="M55 1L80 29"/></g>{frame&&<path d="M72 12H96V51H72Z" className="fill-none stroke-accent motion-safe:animate-fade-in" strokeWidth=".8" strokeDasharray="3 1.5"/>}</svg>
      {distraction&&<div className="absolute left-0 top-[9%] h-16 w-3 bg-destructive shadow-lg motion-safe:animate-pulse" aria-hidden="true"/>}
    </StageShell>
    <div className="grid gap-3 sm:grid-cols-3"><Control label="Subject position" options={["misplaced","purposeful"]} value={purposeful?"purposeful":"misplaced"} onChange={v=>setPurposeful(v==="purposeful")}/><Control label="Doorway frame" options={["off","on"]} value={frame?"on":"off"} onChange={v=>setFrame(v==="on")}/><Control label="Edge distraction" options={["off","on"]} value={distraction?"on":"off"} onChange={v=>setDistraction(v==="on")}/></div>
    <p className="border-l-2 border-primary pl-4 text-sm text-muted-foreground">{purposeful ? "The floor seams, window frames, railing, and ceiling beams lead toward the person and warm entrance." : "The architecture still points to the doorway while the person competes at the opposite edge, creating two visual destinations."} {frame && "The gold doorway guide reveals a frame within the frame."} {distraction && "The bright edge mark demonstrates how high contrast at a border can pull attention away."}</p>
  </div>;
}

function SceneThree() {
  const [order,setOrder]=useState<ShotId[]>([]); const [current,setCurrent]=useState(0); const [playing,setPlaying]=useState(false); const reduced=useReducedMotion(); const correct=order.join(",")==="wide,medium,close";
  const add=(id:ShotId)=>setOrder(o=>o.includes(id)?o:[...o,id]);
  useEffect(()=>{if(!playing||reduced||order.length!==3)return;const timer=window.setTimeout(()=>{if(current<2)setCurrent(v=>v+1);else setPlaying(false)},1700);return()=>window.clearTimeout(timer)},[current,order.length,playing,reduced]);
  const reset=()=>{setOrder([]);setCurrent(0);setPlaying(false)}; const replay=()=>{setCurrent(0);setPlaying(!reduced)}; const activeShot=order[current]; const activeInfo=shots.find(s=>s.id===activeShot);
  return <div className="space-y-4">
    {order.length===3&&activeShot&&<div className="space-y-3 border-2 border-border bg-card p-3"><StageShell label={`Shot ${current+1} of 3. ${activeInfo?.alt}`}><div key={`${activeShot}-${current}`} className="h-full w-full motion-safe:animate-fade-in"><CinematicImage src={activeInfo?.image ?? sequenceWide} alt={activeInfo?.alt ?? "Studio arrival sequence"} className={cn(!reduced&&playing&&"motion-safe:scale-[1.035] motion-safe:transition-transform motion-safe:duration-1000 motion-safe:ease-out")}/><span className="absolute bottom-3 right-3 border border-primary/50 bg-background/80 px-3 py-1 text-xs font-black text-primary backdrop-blur">{activeInfo?.label}</span></div></StageShell><div aria-live="polite" className="text-sm text-muted-foreground"><strong className="text-foreground">Shot {current+1}: {activeInfo?.label}.</strong> {activeInfo?.alt} The coordinated artwork preserves left-to-right movement. This is a layered interactive study, not a rendered character-animation video.</div><div className="flex flex-wrap gap-2">{reduced?<><Button variant="outline" aria-label="Previous storyboard shot" disabled={current===0} onClick={()=>setCurrent(v=>Math.max(0,v-1))}><StepBack/>Previous shot</Button><Button aria-label="Next storyboard shot" disabled={current===2} onClick={()=>setCurrent(v=>Math.min(2,v+1))}>Next shot<StepForward/></Button><Button variant="ghost" onClick={()=>setCurrent(0)}><RotateCcw/>Replay from start</Button></>:<><Button onClick={()=>setPlaying(v=>!v)}>{playing?<><Pause/>Pause</>:<><Play/>Play</>}</Button><Button variant="outline" onClick={replay}><RotateCcw/>Replay</Button></>}</div></div>}
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" aria-label="Three cinematic storyboard shots">{shots.map(s=><Button key={s.id} variant="outline" onClick={()=>add(s.id)} className={cn("h-auto min-h-44 flex-col items-stretch whitespace-normal border-2 p-3 text-left",order.includes(s.id)&&"border-primary bg-primary/10")} aria-label={`Add ${s.label} shot to sequence. ${s.alt}`}><span className="text-[10px] font-black text-primary">{s.label}</span><span className="my-2 block aspect-video overflow-hidden border border-border bg-muted"><CinematicImage src={s.image} alt={s.alt}/></span><span className="text-xs text-muted-foreground">{s.detail}</span>{order.includes(s.id)&&<span className="mt-2 block font-black text-primary">#{order.indexOf(s.id)+1}</span>}</Button>)}</div>
    <div className="min-h-14 border-l-2 border-primary pl-4 text-sm text-muted-foreground">{order.length<3?`Choose the next shot. ${3-order.length} remaining.`:correct?"Clear sequence: place → action → useful detail. Direction stays left to right across the cuts.":"This order can work for deliberate mystery, but it withholds or rearranges context. Reset for the clearest arrival sequence."}</div><Button variant="outline" onClick={reset}><RotateCcw/>Reset sequence</Button>
  </div>;
}

function Control({label,options,value,onChange}:{label:string;options:string[];value:string;onChange:(v:string)=>void}) { return <fieldset className="border border-border p-3"><legend className="px-1 text-xs font-bold uppercase text-muted-foreground">{label}</legend><div className={cn("grid gap-2",options.length===3?"sm:grid-cols-3":"grid-cols-2")}>{options.map(o=><Button key={o} type="button" variant={value===o?"default":"outline"} onClick={()=>onChange(o)} aria-pressed={value===o} className="h-auto min-h-10 whitespace-normal capitalize">{o}</Button>)}</div></fieldset> }

function Quiz({questions,lessonIndex}:{questions:Question[];lessonIndex:number}) {
  const [answers,setAnswers]=useState<Record<number,number>>({});
  return <section className="mt-10 border-t-2 border-border pt-8"><h3 className="text-xl font-black uppercase">Scenario check</h3><p className="text-sm text-muted-foreground mt-1">Choose an answer to reveal the reasoning.</p><div className="mt-5 space-y-6">{questions.map((q,qi)=>{const selected=answers[qi];return <fieldset key={q.prompt} className="border-2 border-border bg-card/50 p-4"><legend className="px-2 font-bold">{qi+1}. {q.prompt}</legend><div className="mt-3 grid gap-2">{q.answers.map((a,ai)=><Button key={a} variant={selected===ai?(ai===q.correct?"default":"destructive"):"outline"} className="h-auto min-h-11 justify-start whitespace-normal text-left" onClick={()=>setAnswers(v=>({...v,[qi]:ai}))}>{a}</Button>)}</div>{selected!==undefined&&<div role="status" className={cn("mt-4 border-l-2 pl-3 text-sm",selected===q.correct?"border-accent text-foreground":"border-destructive text-muted-foreground")}><strong>{selected===q.correct?"Correct. ":"Not quite. "}</strong>{q.explanation}</div>}</fieldset>})}</div><Button variant="ghost" className="mt-4" onClick={()=>setAnswers({})}><RotateCcw/>Retry lesson {lessonIndex+1} questions</Button></section>
}

const assignment = `HOODTORIAL UNIVERSITY — FREE SAMPLE SHOT LIST\nComposition That Tells a Story\n\nASSIGNMENT\nShoot a 15–30 second three-shot arrival sequence on your phone.\n[ ] Wide: establish the place and direction of arrival\n[ ] Medium: reveal the arrival action\n[ ] Close-up: reveal a useful detail\n[ ] Make one deliberate composition choice\n[ ] Keep screen direction consistent\n\nSELF-REVIEW (0–2 EACH)\nClarity: 0 unclear / 1 partly readable / 2 action reads without explanation\nFraming: 0 accidental / 1 mostly controlled / 2 placement supports the intended feeling\nContinuity: 0 direction breaks / 1 minor confusion / 2 movement connects clearly\nIntentional detail: 0 close-up adds nothing / 1 relevant / 2 advances the moment\n\nThis free sample creates no enrollment, progress record, or degree credit.`;

export default function FilmClass() {
  const [active,setActive]=useState(0); const [replay,setReplay]=useState(0); const lesson=lessons[active];
  const reduced=useReducedMotion();
  const Visual=useMemo(()=>[SceneOne,SceneTwo,SceneThree][active],[active]);
  const download=()=>{const blob=new Blob([assignment],{type:"text/plain"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="hoodtorial-composition-shot-list.txt";a.click();URL.revokeObjectURL(url)};
  const reset=()=>setReplay(v=>v+1);
  return <PageLayout pageKey="film-class"><Helmet><title>Free Composition Film Class | Hoodtorial University</title><meta name="description" content="Try a free interactive Hoodtorial lesson on composition, leading lines, and three-shot sequences."/><meta property="og:title" content="Composition That Tells a Story"/><meta property="og:description" content="A free interactive Hoodtorial University composition mini-class."/><meta property="og:type" content="website"/><meta name="twitter:card" content="summary_large_image"/></Helmet>
    <header className="border-b-2 border-border bg-card/40 bg-grid"><div className="container-wide py-16 md:py-24"><span className="tag-sticker"><Sparkles className="mr-2 h-3 w-3"/>Free sample · no degree credit</span><p className="mt-8 text-sm font-black uppercase text-primary">HU-101 · Composition Fundamentals</p><h1 className="heading-1 mt-3 max-w-5xl">Composition That <span className="text-gold-gradient">Tells a Story</span></h1><p className="mt-6 max-w-2xl text-lg text-muted-foreground">A hands-on animated mini-class. Make choices, compare frames, and build a sequence. Your progress stays only on this page.</p></div></header>
    <main className="container-wide py-10 md:py-16"><nav aria-label="Lesson progress" className="grid gap-2 md:grid-cols-3">{lessons.map((l,i)=><Button key={l.title} variant={i===active?"default":"outline"} className="h-auto min-h-14 justify-start whitespace-normal text-left" onClick={()=>{setActive(i);window.scrollTo({top:0,behavior:reduced?"auto":"smooth"})}}><span className="font-black">0{i+1}</span><span>{l.title}</span></Button>)}</nav>
      <article key={`${active}-${replay}`} className="mt-10 animate-fade-in motion-reduce:animate-none"><div className="flex flex-col gap-10"><div className="order-2 mx-auto max-w-4xl"><p className="text-sm font-black uppercase text-primary">Lesson {active+1} of 3</p><h2 className="heading-3 mt-2">{lesson.title}</h2><p className="mt-3 text-xl font-bold text-foreground">“{lesson.kicker}”</p><div className="mt-6 border-l-4 border-primary bg-card p-4"><span className="text-xs font-black uppercase text-primary">Objective</span><p className="mt-1 text-sm text-muted-foreground">{lesson.objective}</p></div><div className="mt-7 space-y-5 text-base leading-7 text-muted-foreground">{lesson.body.map(p=><p key={p}>{p}</p>)}</div></div><div className="order-1"><Visual/><div className="mt-4 flex justify-end"><Button variant="ghost" onClick={reset}><RotateCcw/>Reset / replay</Button></div></div></div><Quiz questions={lesson.questions} lessonIndex={active}/>
      <div className="mt-10 flex flex-wrap justify-between gap-3"><Button variant="outline" disabled={active===0} onClick={()=>setActive(v=>v-1)}><ArrowLeft/>Previous</Button>{active<2?<Button onClick={()=>setActive(v=>v+1)}>Next lesson<ArrowRight/></Button>:<a href="#assignment" className="btn-brutal">View assignment<ArrowRight className="ml-2 h-4 w-4"/></a>}</div></article>
      <section id="assignment" className="mt-20 border-y-2 border-primary py-12"><p className="text-sm font-black uppercase text-primary">Practical assignment</p><h2 className="heading-3 mt-2">Shoot the arrival</h2><p className="mt-4 max-w-3xl text-muted-foreground">Shoot a 15–30 second three-shot arrival sequence on your phone. Include a wide, medium, and close-up; make one deliberate composition choice; and keep direction consistent. You never need to film yourself.</p><div className="mt-8 grid gap-4 md:grid-cols-4">{[["Clarity","0: unclear · 1: partly readable · 2: reads without explanation"],["Framing","0: accidental · 1: mostly controlled · 2: supports the intended feeling"],["Continuity","0: direction breaks · 1: minor confusion · 2: movement connects clearly"],["Intentional detail","0: adds nothing · 1: relevant · 2: advances the moment"]].map(([t,d])=><div key={t} className="border-2 border-border bg-card p-4"><h3 className="font-black uppercase text-primary">{t}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p></div>)}</div><Button className="mt-8" onClick={download}><Download/>Download shot list</Button></section>
    </main></PageLayout>;
}