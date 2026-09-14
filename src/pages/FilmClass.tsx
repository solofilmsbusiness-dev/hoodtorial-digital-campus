import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, Download, Pause, Play, RotateCcw, Sparkles, StepBack, StepForward } from "lucide-react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Question = { prompt: string; answers: string[]; correct: number; explanation: string };
type Lesson = { title: string; kicker: string; objective: string; body: string[]; questions: Question[] };

const lessons: Lesson[] = [
  {
    title: "Rule of Thirds",
    kicker: "Place the subject. Change the feeling.",
    objective: "Use placement and looking room to make the same location feel balanced, tense, open, or direct.",
    body: [
      "Composition is the decision about what belongs inside the frame and where each element sits. A thirds grid divides the image into nine sections. Its intersections are useful starting points because the eye can move between a subject and the environment instead of landing on one immovable center. In the scene below, placing the filmmaker on the right intersection leaves the studio sign and the street visible. The place becomes part of the story, not leftover background.",
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
      "Leading lines are visible paths that encourage the eye to travel through an image. Curbs, railings, rooflines, shadows, doorways, and rows of lights can all do the work. In this studio alley, the sidewalk edges and awning beams converge near the entrance. When the subject stands near that convergence, several quiet signals point to the same story beat: this person is arriving here. The lines do not force every viewer to look identically, and they never guarantee a good image. They simply strengthen a route through the frame.",
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
  { id: "wide", label: "WIDE", detail: "Establishes the studio and left-to-right arrival.", alt: "Wide view of a person walking left to right along the street toward the studio door." },
  { id: "medium", label: "MEDIUM", detail: "Reveals the person reaching for the entrance.", alt: "Medium view from the same side as the person reaches right toward the studio door." },
  { id: "close", label: "CLOSE-UP", detail: "Shows the useful detail: key entering lock.", alt: "Close-up of the right-facing hand guiding a key into the studio door lock." },
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

function ShotDrawing({ shot }: { shot: ShotId }) {
  if (shot === "wide") return <svg viewBox="0 0 160 90" className="h-full w-full" aria-hidden="true">
    <rect width="160" height="90" className="fill-muted"/><rect y="64" width="160" height="26" className="fill-card"/>
    <rect x="84" y="14" width="65" height="51" className="fill-background stroke-border" strokeWidth="2"/><rect x="98" y="31" width="24" height="34" className="fill-card stroke-primary" strokeWidth="2"/><rect x="91" y="20" width="48" height="8" className="fill-primary/20"/><text x="115" y="26" textAnchor="middle" className="fill-primary text-[6px] font-black">STUDIO 101</text>
    <path d="M0 76H160M12 83H52M65 83H106M118 83H152" className="stroke-border" strokeWidth="2"/><g><circle cx="55" cy="43" r="6" className="fill-primary"/><path d="M58 42l5 2-5 2M55 49l4 16 13 7M58 55l12-3M59 65l-8 11" className="fill-none stroke-foreground" strokeWidth="4" strokeLinecap="round"/></g><path d="M36 55H76" className="stroke-accent" strokeWidth="2" markerEnd="url(#wideArrow)"/><defs><marker id="wideArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" className="fill-accent"/></marker></defs>
  </svg>;
  if (shot === "medium") return <svg viewBox="0 0 160 90" className="h-full w-full" aria-hidden="true">
    <rect width="160" height="90" className="fill-muted"/><rect x="103" width="57" height="90" className="fill-background stroke-primary" strokeWidth="3"/><circle cx="121" cy="45" r="5" className="fill-card stroke-foreground" strokeWidth="2"/><path d="M25 90V57c0-19 10-31 27-31 14 0 24 10 28 25l7 22M48 26c11 0 18 7 18 17M65 50l22 23 27-25" className="fill-none stroke-foreground" strokeWidth="7" strokeLinecap="round"/><circle cx="114" cy="48" r="5" className="fill-primary"/><path d="M70 18H120" className="stroke-accent" strokeWidth="2" markerEnd="url(#mediumArrow)"/><defs><marker id="mediumArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" className="fill-accent"/></marker></defs>
  </svg>;
  return <svg viewBox="0 0 160 90" className="h-full w-full" aria-hidden="true">
    <rect width="160" height="90" className="fill-muted"/><rect x="111" width="49" height="90" className="fill-background stroke-primary" strokeWidth="3"/><circle cx="124" cy="45" r="8" className="fill-card stroke-foreground" strokeWidth="3"/><path d="M18 63c17-4 29-15 41-19 10-3 19 2 27 5l25-4M55 44l12-12 8 12M89 48l16-9" className="fill-none stroke-foreground" strokeWidth="8" strokeLinecap="round"/><path d="M83 45h34M92 45v8M101 45v6" className="stroke-primary" strokeWidth="3"/><path d="M54 22H112" className="stroke-accent" strokeWidth="2" markerEnd="url(#closeArrow)"/><defs><marker id="closeArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" className="fill-accent"/></marker></defs>
  </svg>;
}

function SceneOne() {
  const [placement, setPlacement] = useState<"center" | "right third" | "left edge">("right third");
  const [grid, setGrid] = useState(true);
  const x = placement === "center" ? 50 : placement === "right third" ? 68 : 12;
  const description = placement === "center" ? "centered for a direct, formal composition" : placement === "right third" ? "on the right third, facing left into open breathing room" : "near the left edge, facing left with a cramped gaze path";
  return <div className="space-y-4">
    <div className="aspect-video border-2 border-border bg-card overflow-hidden" role="img" aria-label={`Urban studio viewfinder. Subject is ${description}. Thirds grid is ${grid ? "visible" : "hidden"}.`}>
      <svg viewBox="0 0 100 56" className="h-full w-full film-scene" aria-hidden="true">
        <rect width="100" height="56" className="fill-muted"/><rect y="36" width="100" height="20" className="fill-card"/><rect x="5" y="9" width="42" height="27" className="fill-background stroke-border"/><rect x="12" y="16" width="26" height="9" className="fill-primary/20 stroke-primary"/><text x="25" y="22" textAnchor="middle" className="fill-primary text-[4px] font-bold">STUDIO 101</text><path d="M0 45 L100 40 M0 53 L100 47" className="stroke-border" strokeWidth="1"/>
        <g className="transition-transform duration-500 motion-reduce:transition-none" style={{ transform: `translateX(${x - 50}px)` }}><path d="M52 21c-3-1-6 1-6 4 0 2 1 4 3 5h4v-3l-3-1 3-2Z" className="fill-primary stroke-foreground" strokeWidth=".7"/><circle cx="48.5" cy="24" r=".6" className="fill-background"/><path d="M48 24h-3" className="stroke-accent" strokeWidth=".8"/><path d="M50 30 L50 42 M50 33 L43 37 M50 33 L56 30 M50 42 L45 51 M50 42 L55 51" className="stroke-foreground" strokeWidth="2.2"/></g>
        {grid&&<>{[33.33,66.66].map(n=><line key={`v${n}`} x1={n} y1="0" x2={n} y2="56" className="stroke-foreground/40" strokeWidth=".4"/>)}{[18.67,37.33].map(n=><line key={`h${n}`} x1="0" y1={n} x2="100" y2={n} className="stroke-foreground/40" strokeWidth=".4"/>)}</>}<path d="M3 10V3H10 M90 3H97V10 M97 46V53H90 M10 53H3V46" className="fill-none stroke-primary" strokeWidth="1"/>
      </svg>
    </div>
    <div className="grid gap-3"><Control label="Subject position and looking room" options={["center","right third","left edge"]} value={placement} onChange={v=>setPlacement(v as typeof placement)}/><Control label="Thirds grid" options={["off","on"]} value={grid?"on":"off"} onChange={v=>setGrid(v==="on")}/></div>
    <p className="text-sm text-muted-foreground border-l-2 border-primary pl-4">{placement === "center" ? "Centered framing makes the arrival feel direct and formal; the person commands attention before the location." : placement === "right third" ? "The left-facing profile sits near the right third, leaving open space in the direction of the gaze. The studio and destination share the story." : "The left-facing profile is pressed near the left edge, cutting off its gaze path. That pressure can create tension when chosen deliberately."}</p>
  </div>;
}

function SceneTwo() {
  const [purposeful, setPurposeful] = useState(true); const [frame, setFrame] = useState(true);
  return <div className="space-y-4">
    <div className="aspect-video border-2 border-border bg-card overflow-hidden" role="img" aria-label={`Studio alley with converging architectural lines. Subject placement is ${purposeful ? "purposeful" : "misplaced"}. Doorway framing is ${frame ? "visible" : "hidden"}.`}>
      <svg viewBox="0 0 100 56" className="h-full w-full film-scene" aria-hidden="true"><rect width="100" height="56" className="fill-muted"/><rect x="65" y="8" width="25" height="39" className="fill-background stroke-border"/><path d="M0 56 L72 28 L100 56 M0 3 L72 28 M100 6 L72 28 M0 43 L72 28" className="fill-none stroke-primary/60" strokeWidth="1"/><path d="M0 50 L72 28" className="stroke-foreground/50" strokeWidth="2"/><rect x="93" y="5" width="5" height="28" className="fill-destructive" opacity=".75"/><g className="transition-transform duration-500 motion-reduce:transition-none" style={{transform:`translateX(${purposeful ? 22 : -25}px)`}}><circle cx="50" cy="26" r="3" className="fill-primary"/><path d="M50 29L50 42M50 33L44 38M50 42L45 50M50 42L55 50" className="stroke-foreground" strokeWidth="2"/></g>{frame&&<rect x="64" y="7" width="27" height="42" className="fill-none stroke-accent" strokeWidth="2" strokeDasharray="3 2"/>}</svg>
    </div>
    <div className="grid sm:grid-cols-2 gap-3"><Control label="Subject position" options={["misplaced","purposeful"]} value={purposeful?"purposeful":"misplaced"} onChange={v=>setPurposeful(v==="purposeful")}/><Control label="Doorway frame" options={["off","on"]} value={frame?"on":"off"} onChange={v=>setFrame(v==="on")}/></div>
    <p className="text-sm text-muted-foreground border-l-2 border-primary pl-4">{purposeful ? "The strongest lines now converge near the person and entrance. The bright strip at the right edge remains a distraction worth removing." : "The architecture points to the entrance while the subject sits elsewhere, splitting attention between two destinations."} {frame && "The doorway overlay shows how a frame within the frame can isolate the subject and add depth."}</p>
  </div>;
}

function SceneThree() {
  const [order,setOrder]=useState<ShotId[]>([]); const [current,setCurrent]=useState(0); const [playing,setPlaying]=useState(false); const reduced=useReducedMotion(); const correct=order.join(",")==="wide,medium,close";
  const add=(id:ShotId)=>setOrder(o=>o.includes(id)?o:[...o,id]);
  useEffect(()=>{if(!playing||reduced||order.length!==3)return;const timer=window.setTimeout(()=>{if(current<2)setCurrent(v=>v+1);else setPlaying(false)},1300);return()=>window.clearTimeout(timer)},[current,order.length,playing,reduced]);
  const reset=()=>{setOrder([]);setCurrent(0);setPlaying(false)}; const replay=()=>{setCurrent(0);setPlaying(!reduced)}; const activeShot=order[current]; const activeInfo=shots.find(s=>s.id===activeShot);
  return <div className="space-y-4"><div className="grid grid-cols-1 gap-2 sm:grid-cols-3" aria-label="Three illustrated storyboard shots">
    {shots.map(s=><Button key={s.id} variant="outline" onClick={()=>add(s.id)} className={cn("h-auto min-h-44 flex-col items-stretch whitespace-normal border-2 p-3 text-left",order.includes(s.id)&&"border-primary bg-primary/10")} aria-label={`Add ${s.label} shot to sequence. ${s.alt}`}><span className="text-[10px] font-black text-primary">{s.label}</span><span className="my-2 block aspect-video overflow-hidden border border-border bg-muted"><ShotDrawing shot={s.id}/></span><span className="text-xs text-muted-foreground">{s.detail}</span>{order.includes(s.id)&&<span className="mt-2 block text-primary font-black">#{order.indexOf(s.id)+1}</span>}</Button>)}
  </div>{order.length===3&&activeShot&&<div className="space-y-3 border-2 border-border bg-card p-3"><div className="aspect-video overflow-hidden border-2 border-primary bg-muted" role="img" aria-label={`Playing shot ${current+1} of 3. ${activeInfo?.alt}`}><div key={`${activeShot}-${current}`} className="h-full w-full animate-fade-in motion-reduce:animate-none"><ShotDrawing shot={activeShot}/></div></div><div aria-live="polite" className="text-sm text-muted-foreground"><strong className="text-foreground">Shot {current+1}: {activeInfo?.label}.</strong> {activeInfo?.alt} All three drawings preserve left-to-right movement.</div><div className="flex flex-wrap gap-2">{reduced?<><Button variant="outline" aria-label="Previous storyboard shot" disabled={current===0} onClick={()=>setCurrent(v=>Math.max(0,v-1))}><StepBack/>Previous shot</Button><Button aria-label="Next storyboard shot" disabled={current===2} onClick={()=>setCurrent(v=>Math.min(2,v+1))}>Next shot<StepForward/></Button><Button variant="ghost" onClick={()=>setCurrent(0)}><RotateCcw/>Replay from start</Button></>:<><Button onClick={()=>setPlaying(v=>!v)}>{playing?<><Pause/>Pause</>:<><Play/>Play</>}</Button><Button variant="outline" onClick={replay}><RotateCcw/>Replay</Button></>}</div></div>}
  <div className="min-h-14 border-l-2 border-primary pl-4 text-sm text-muted-foreground">{order.length<3?`Choose the next shot. ${3-order.length} remaining.`:correct?"Clear sequence: place → action → useful detail. Direction stays left to right across the cuts.":"This order can work for deliberate mystery, but it withholds or rearranges context. Reset for the clearest arrival sequence."}</div><Button variant="outline" onClick={reset}><RotateCcw/>Reset sequence</Button></div>;
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
      <article key={`${active}-${replay}`} className="mt-10 animate-fade-in motion-reduce:animate-none"><div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start"><div><p className="text-sm font-black uppercase text-primary">Lesson {active+1} of 3</p><h2 className="heading-3 mt-2">{lesson.title}</h2><p className="mt-3 text-xl font-bold text-foreground">“{lesson.kicker}”</p><div className="mt-6 border-l-4 border-primary bg-card p-4"><span className="text-xs font-black uppercase text-primary">Objective</span><p className="mt-1 text-sm text-muted-foreground">{lesson.objective}</p></div><div className="mt-7 space-y-5 text-base leading-7 text-muted-foreground">{lesson.body.map(p=><p key={p}>{p}</p>)}</div></div><div className="lg:sticky lg:top-24"><Visual/><div className="mt-4 flex justify-end"><Button variant="ghost" onClick={reset}><RotateCcw/>Reset / replay</Button></div></div></div><Quiz questions={lesson.questions} lessonIndex={active}/>
      <div className="mt-10 flex flex-wrap justify-between gap-3"><Button variant="outline" disabled={active===0} onClick={()=>setActive(v=>v-1)}><ArrowLeft/>Previous</Button>{active<2?<Button onClick={()=>setActive(v=>v+1)}>Next lesson<ArrowRight/></Button>:<a href="#assignment" className="btn-brutal">View assignment<ArrowRight className="ml-2 h-4 w-4"/></a>}</div></article>
      <section id="assignment" className="mt-20 border-y-2 border-primary py-12"><p className="text-sm font-black uppercase text-primary">Practical assignment</p><h2 className="heading-3 mt-2">Shoot the arrival</h2><p className="mt-4 max-w-3xl text-muted-foreground">Shoot a 15–30 second three-shot arrival sequence on your phone. Include a wide, medium, and close-up; make one deliberate composition choice; and keep direction consistent. You never need to film yourself.</p><div className="mt-8 grid gap-4 md:grid-cols-4">{[["Clarity","0: unclear · 1: partly readable · 2: reads without explanation"],["Framing","0: accidental · 1: mostly controlled · 2: supports the intended feeling"],["Continuity","0: direction breaks · 1: minor confusion · 2: movement connects clearly"],["Intentional detail","0: adds nothing · 1: relevant · 2: advances the moment"]].map(([t,d])=><div key={t} className="border-2 border-border bg-card p-4"><h3 className="font-black uppercase text-primary">{t}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p></div>)}</div><Button className="mt-8" onClick={download}><Download/>Download shot list</Button></section>
    </main></PageLayout>;
}