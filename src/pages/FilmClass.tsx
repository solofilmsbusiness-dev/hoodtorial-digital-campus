import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, Check, Download, RotateCcw, Sparkles } from "lucide-react";
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
  { id: "wide", label: "WIDE", detail: "Establishes the studio and left-to-right arrival.", icon: "STUDIO / ARRIVAL" },
  { id: "medium", label: "MEDIUM", detail: "Reveals the person reaching for the entrance.", icon: "HAND TO DOOR" },
  { id: "close", label: "CLOSE-UP", detail: "Shows the useful detail: key entering lock.", icon: "KEY / LOCK" },
];

function SceneOne() {
  const [placement, setPlacement] = useState<"center" | "thirds">("thirds");
  const [room, setRoom] = useState<"cramped" | "breathing">("breathing");
  const x = placement === "center" ? 50 : room === "breathing" ? 68 : 20;
  return <div className="space-y-4">
    <div className="aspect-video border-2 border-border bg-card overflow-hidden" role="img" aria-label={`Urban studio viewfinder. Subject is ${placement === "center" ? "centered" : "on a thirds intersection"} with ${room} looking room.`}>
      <svg viewBox="0 0 100 56" className="h-full w-full film-scene" aria-hidden="true">
        <rect width="100" height="56" className="fill-muted"/><rect y="36" width="100" height="20" className="fill-card"/>
        <rect x="5" y="9" width="42" height="27" className="fill-background stroke-border"/><rect x="12" y="16" width="26" height="9" className="fill-primary/20 stroke-primary"/><text x="25" y="22" textAnchor="middle" className="fill-primary text-[4px] font-bold">STUDIO 101</text>
        <path d="M0 45 L100 40 M0 53 L100 47" className="stroke-border" strokeWidth="1"/>
        <g className="transition-transform duration-500 motion-reduce:transition-none" style={{ transform: `translateX(${x - 50}px)` }}><circle cx="50" cy="25" r="3.4" className="fill-primary"/><path d="M50 29 L50 42 M50 33 L43 37 M50 33 L56 30 M50 42 L45 51 M50 42 L55 51" className="stroke-foreground" strokeWidth="2.2"/></g>
        {[33.33,66.66].map(n=><line key={`v${n}`} x1={n} y1="0" x2={n} y2="56" className="stroke-foreground/40" strokeWidth=".4"/>)}{[18.67,37.33].map(n=><line key={`h${n}`} x1="0" y1={n} x2="100" y2={n} className="stroke-foreground/40" strokeWidth=".4"/>)}
        <path d="M3 10V3H10 M90 3H97V10 M97 46V53H90 M10 53H3V46" className="fill-none stroke-primary" strokeWidth="1"/>
      </svg>
    </div>
    <div className="grid sm:grid-cols-2 gap-3">
      <Control label="Subject placement" options={["center","thirds"]} value={placement} onChange={v=>setPlacement(v as typeof placement)}/>
      <Control label="Looking room" options={["cramped","breathing"]} value={room} onChange={v=>setRoom(v as typeof room)}/>
    </div>
    <p className="text-sm text-muted-foreground border-l-2 border-primary pl-4">{placement === "center" ? "Centered framing makes the arrival feel direct and formal; the person commands attention before the location." : room === "breathing" ? "The right-third placement leaves space toward the subject’s gaze, letting the studio and destination share the story." : "The subject is off-center, but the gaze is pressed against the edge. That pressure can create tension when chosen deliberately."}</p>
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
  const [order,setOrder]=useState<string[]>([]); const correct=order.join(",")==="wide,medium,close";
  const add=(id:string)=>setOrder(o=>o.includes(id)?o:[...o,id]);
  return <div className="space-y-4"><div className="grid grid-cols-3 gap-2" aria-label="Three storyboard shots">
    {shots.map((s,i)=><button key={s.id} onClick={()=>add(s.id)} className={cn("min-h-36 border-2 p-3 text-left transition-colors",order.includes(s.id)?"border-primary bg-primary/10":"border-border bg-card hover:border-primary")} aria-label={`Add ${s.label} shot to sequence`}><span className="text-[10px] font-black text-primary">{s.label}</span><div className="my-4 h-12 border border-border bg-muted flex items-center justify-center text-[9px] font-bold text-center">{s.icon}</div><span className="text-xs text-muted-foreground">{s.detail}</span>{order.includes(s.id)&&<span className="mt-2 block text-primary font-black">#{order.indexOf(s.id)+1}</span>}</button>)}
  </div><div className="min-h-14 border-l-2 border-primary pl-4 text-sm text-muted-foreground">{order.length<3?`Choose the next shot. ${3-order.length} remaining.`:correct?"Clear sequence: place → action → useful detail. Direction stays left to right across the cuts.":"This order can work for deliberate mystery, but it withholds or rearranges context. Reset for the clearest arrival sequence."}</div><Button variant="outline" onClick={()=>setOrder([])}><RotateCcw/>Reset sequence</Button></div>;
}

function Control({label,options,value,onChange}:{label:string;options:string[];value:string;onChange:(v:string)=>void}) { return <fieldset className="border border-border p-3"><legend className="px-1 text-xs font-bold uppercase text-muted-foreground">{label}</legend><div className="grid grid-cols-2 gap-2">{options.map(o=><Button key={o} type="button" variant={value===o?"default":"outline"} onClick={()=>onChange(o)} aria-pressed={value===o} className="capitalize">{o}</Button>)}</div></fieldset> }

function Quiz({questions,lessonIndex}:{questions:Question[];lessonIndex:number}) {
  const [answers,setAnswers]=useState<Record<number,number>>({});
  return <section className="mt-10 border-t-2 border-border pt-8"><h3 className="text-xl font-black uppercase">Scenario check</h3><p className="text-sm text-muted-foreground mt-1">Choose an answer to reveal the reasoning.</p><div className="mt-5 space-y-6">{questions.map((q,qi)=>{const selected=answers[qi];return <fieldset key={q.prompt} className="border-2 border-border bg-card/50 p-4"><legend className="px-2 font-bold">{qi+1}. {q.prompt}</legend><div className="mt-3 grid gap-2">{q.answers.map((a,ai)=><Button key={a} variant={selected===ai?(ai===q.correct?"default":"destructive"):"outline"} className="h-auto min-h-11 justify-start whitespace-normal text-left" onClick={()=>setAnswers(v=>({...v,[qi]:ai}))}>{a}</Button>)}</div>{selected!==undefined&&<div role="status" className={cn("mt-4 border-l-2 pl-3 text-sm",selected===q.correct?"border-accent text-foreground":"border-destructive text-muted-foreground")}><strong>{selected===q.correct?"Correct. ":"Not quite. "}</strong>{q.explanation}</div>}</fieldset>})}</div><Button variant="ghost" className="mt-4" onClick={()=>setAnswers({})}><RotateCcw/>Retry lesson {lessonIndex+1} questions</Button></section>
}

const assignment = `HOODTORIAL UNIVERSITY — FREE SAMPLE SHOT LIST\nComposition That Tells a Story\n\nASSIGNMENT\nShoot a 15–30 second three-shot arrival sequence on your phone.\n[ ] Wide: establish the place and direction of arrival\n[ ] Medium: reveal the arrival action\n[ ] Close-up: reveal a useful detail\n[ ] Make one deliberate composition choice\n[ ] Keep screen direction consistent\n\nSELF-REVIEW (0–2 EACH)\nClarity: 0 unclear / 1 partly readable / 2 action reads without explanation\nFraming: 0 accidental / 1 mostly controlled / 2 placement supports the intended feeling\nContinuity: 0 direction breaks / 1 minor confusion / 2 movement connects clearly\nIntentional detail: 0 close-up adds nothing / 1 relevant / 2 advances the moment\n\nThis free sample creates no enrollment, progress record, or degree credit.`;

export default function FilmClass() {
  const [active,setActive]=useState(0); const [replay,setReplay]=useState(0); const lesson=lessons[active];
  const Visual=useMemo(()=>[SceneOne,SceneTwo,SceneThree][active],[active]);
  const download=()=>{const blob=new Blob([assignment],{type:"text/plain"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="hoodtorial-composition-shot-list.txt";a.click();URL.revokeObjectURL(url)};
  const reset=()=>setReplay(v=>v+1);
  return <PageLayout pageKey="film-class"><Helmet><title>Free Composition Film Class | Hoodtorial University</title><meta name="description" content="Try a free interactive Hoodtorial lesson on composition, leading lines, and three-shot sequences."/><meta property="og:title" content="Composition That Tells a Story"/><meta property="og:description" content="A free interactive Hoodtorial University composition mini-class."/><meta property="og:type" content="website"/><meta name="twitter:card" content="summary_large_image"/></Helmet>
    <header className="border-b-2 border-border bg-card/40 bg-grid"><div className="container-wide py-16 md:py-24"><span className="tag-sticker"><Sparkles className="mr-2 h-3 w-3"/>Free sample · no degree credit</span><p className="mt-8 text-sm font-black uppercase text-primary">HU-101 · Composition Fundamentals</p><h1 className="heading-1 mt-3 max-w-5xl">Composition That <span className="text-gold-gradient">Tells a Story</span></h1><p className="mt-6 max-w-2xl text-lg text-muted-foreground">A hands-on animated mini-class. Make choices, compare frames, and build a sequence. Your progress stays only on this page.</p></div></header>
    <main className="container-wide py-10 md:py-16"><nav aria-label="Lesson progress" className="grid gap-2 md:grid-cols-3">{lessons.map((l,i)=><Button key={l.title} variant={i===active?"default":"outline"} className="h-auto min-h-14 justify-start whitespace-normal text-left" onClick={()=>{setActive(i);window.scrollTo({top:0,behavior:"smooth"})}}><span className="font-black">0{i+1}</span><span>{l.title}</span></Button>)}</nav>
      <article key={`${active}-${replay}`} className="mt-10 animate-fade-in"><div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start"><div><p className="text-sm font-black uppercase text-primary">Lesson {active+1} of 3</p><h2 className="heading-3 mt-2">{lesson.title}</h2><p className="mt-3 text-xl font-bold text-foreground">“{lesson.kicker}”</p><div className="mt-6 border-l-4 border-primary bg-card p-4"><span className="text-xs font-black uppercase text-primary">Objective</span><p className="mt-1 text-sm text-muted-foreground">{lesson.objective}</p></div><div className="mt-7 space-y-5 text-base leading-7 text-muted-foreground">{lesson.body.map(p=><p key={p}>{p}</p>)}</div></div><div className="lg:sticky lg:top-24"><Visual/><div className="mt-4 flex justify-end"><Button variant="ghost" onClick={reset}><RotateCcw/>Reset / replay</Button></div></div></div><Quiz questions={lesson.questions} lessonIndex={active}/>
      <div className="mt-10 flex flex-wrap justify-between gap-3"><Button variant="outline" disabled={active===0} onClick={()=>setActive(v=>v-1)}><ArrowLeft/>Previous</Button>{active<2?<Button onClick={()=>setActive(v=>v+1)}>Next lesson<ArrowRight/></Button>:<a href="#assignment" className="btn-brutal">View assignment<ArrowRight className="ml-2 h-4 w-4"/></a>}</div></article>
      <section id="assignment" className="mt-20 border-y-2 border-primary py-12"><p className="text-sm font-black uppercase text-primary">Practical assignment</p><h2 className="heading-3 mt-2">Shoot the arrival</h2><p className="mt-4 max-w-3xl text-muted-foreground">Shoot a 15–30 second three-shot arrival sequence on your phone. Include a wide, medium, and close-up; make one deliberate composition choice; and keep direction consistent. You never need to film yourself.</p><div className="mt-8 grid gap-4 md:grid-cols-4">{[["Clarity","0: unclear · 1: partly readable · 2: reads without explanation"],["Framing","0: accidental · 1: mostly controlled · 2: supports the intended feeling"],["Continuity","0: direction breaks · 1: minor confusion · 2: movement connects clearly"],["Intentional detail","0: adds nothing · 1: relevant · 2: advances the moment"]].map(([t,d])=><div key={t} className="border-2 border-border bg-card p-4"><h3 className="font-black uppercase text-primary">{t}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p></div>)}</div><Button className="mt-8" onClick={download}><Download/>Download shot list</Button></section>
    </main></PageLayout>;
}