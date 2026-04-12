import { Film, Palette, Clapperboard, Briefcase, BookOpen, Camera, Video, LucideIcon } from "lucide-react";

export interface Quiz {
  id: string;
  title: string;
  questions: number;
  passingScore: number;
  timeLimitMinutes?: number; // Time limit in minutes (default: 1 min per question)
  perQuestionSeconds?: number; // Time per question in seconds (default: 60)
  usePerQuestionTimer?: boolean; // Enable per-question timer mode (default: true)
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "reading" | "practice";
  completed?: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  quiz?: Quiz;
}

export interface Course {
  code: string;
  title: string;
  department: string;
  departmentId: string;
  credits: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  lessons: number;
  duration: string;
  modules: Module[];
  finalExam?: Quiz;
  intro_video_url?: string | null;
}

export interface Department {
  id: string;
  name: string;
  icon: LucideIcon;
  description?: string;
  outcomes?: string[];
  color?: string;
}

export const departments: Department[] = [
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
  {
    id: "photography",
    name: "Photography",
    icon: Camera,
    description: "Capture stunning still images with professional techniques. From portraits to landscapes, master the art of photography.",
    outcomes: ["Composition", "Portrait lighting", "Landscape techniques", "Photo editing", "Studio setups", "Natural light mastery"],
    color: "neon-green",
  },
  {
    id: "camera-systems",
    name: "Camera Systems",
    icon: Video,
    description: "Deep dive into professional camera systems. Master Sony, Canon, and other cinema cameras for professional productions.",
    outcomes: ["Camera menus", "Codec selection", "Log profiles", "Lens adaptation", "Rigging", "Workflow optimization"],
    color: "neon-blue",
  },
];

export const courses: Course[] = [
  // ==================== CINEMATOGRAPHY ====================
  {
    code: "HU-101",
    title: "iPhone Cinematography Fundamentals",
    department: "Cinematography",
    departmentId: "cinematography",
    credits: 3,
    level: "Beginner",
    description: "Master the basics of shooting cinematic footage on your iPhone. Learn optimal settings, stabilization techniques, and composition rules that make your footage look professional.",
    lessons: 8,
    duration: "4 weeks",
    modules: [
      {
        id: "hu101-m1",
        title: "Getting Started with iPhone Cinema",
        lessons: [
          { id: "hu101-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu101-l1", title: "Why iPhone for Filmmaking?", duration: "12 min", type: "video" },
          { id: "hu101-l2", title: "Essential Camera Settings", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu101-q1", title: "Settings Quiz", questions: 5, passingScore: 80 },
      },
      {
        id: "hu101-m2",
        title: "Stabilization Techniques",
        lessons: [
          { id: "hu101-l3", title: "Handheld Stability Methods", duration: "15 min", type: "video" },
          { id: "hu101-l4", title: "DIY Stabilization Rigs", duration: "20 min", type: "video" },
        ],
        quiz: { id: "hu101-q2", title: "Stabilization Quiz", questions: 5, passingScore: 80 },
      },
      {
        id: "hu101-m3",
        title: "Composition Fundamentals",
        lessons: [
          { id: "hu101-l5", title: "Rule of Thirds Mastery", duration: "14 min", type: "video" },
          { id: "hu101-l6", title: "Leading Lines & Framing", duration: "16 min", type: "video" },
        ],
        quiz: { id: "hu101-q3", title: "Composition Quiz", questions: 5, passingScore: 80 },
      },
      {
        id: "hu101-m4",
        title: "Practical Shooting",
        lessons: [
          { id: "hu101-l7", title: "Your First Cinematic Shot", duration: "25 min", type: "practice" },
          { id: "hu101-l8", title: "Building a Shot Sequence", duration: "22 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu101-final", title: "Final Exam: iPhone Cinematography", questions: 20, passingScore: 75 },
  },
  {
    code: "HU-102",
    title: "Lighting for Mobile Film",
    department: "Cinematography",
    departmentId: "cinematography",
    credits: 4,
    level: "Beginner",
    description: "Control light like a pro using natural and affordable artificial sources. Create mood, depth, and cinematic looks without expensive gear.",
    lessons: 10,
    duration: "5 weeks",
    modules: [
      {
        id: "hu102-m1",
        title: "Understanding Light",
        lessons: [
          { id: "hu102-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu102-l1", title: "The Physics of Light for Film", duration: "15 min", type: "video" },
          { id: "hu102-l2", title: "Color Temperature Explained", duration: "12 min", type: "video" },
        ],
        quiz: { id: "hu102-q1", title: "Light Basics Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu102-m2",
        title: "Natural Light Mastery",
        lessons: [
          { id: "hu102-l3", title: "Golden Hour Techniques", duration: "18 min", type: "video" },
          { id: "hu102-l4", title: "Window Light Setups", duration: "20 min", type: "video" },
          { id: "hu102-l5", title: "Shooting in Harsh Light", duration: "16 min", type: "video" },
        ],
        quiz: { id: "hu102-q2", title: "Natural Light Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu102-m3",
        title: "Affordable Lighting Gear",
        lessons: [
          { id: "hu102-l6", title: "Budget LED Panels", duration: "14 min", type: "video" },
          { id: "hu102-l7", title: "DIY Lighting Hacks", duration: "22 min", type: "video" },
          { id: "hu102-l8", title: "Reflectors & Diffusion", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu102-q3", title: "Gear Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu102-m4",
        title: "Lighting Setups",
        lessons: [
          { id: "hu102-l9", title: "Three-Point Lighting", duration: "25 min", type: "practice" },
          { id: "hu102-l10", title: "Mood Lighting Project", duration: "30 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu102-final", title: "Final Exam: Lighting", questions: 25, passingScore: 75 },
  },
  {
    code: "HU-201",
    title: "Advanced Camera Movement",
    department: "Cinematography",
    departmentId: "cinematography",
    credits: 5,
    level: "Intermediate",
    description: "Dynamic movement techniques using gimbals, sliders, and intentional handheld style. Add energy and emotion to your shots through motion.",
    lessons: 12,
    duration: "6 weeks",
    modules: [
      {
        id: "hu201-m1",
        title: "Movement Principles",
        lessons: [
          { id: "hu201-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu201-l1", title: "Why Camera Movement Matters", duration: "14 min", type: "video" },
          { id: "hu201-l2", title: "Movement & Emotion", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu201-q1", title: "Principles Quiz", questions: 5, passingScore: 80 },
      },
      {
        id: "hu201-m2",
        title: "Gimbal Mastery",
        lessons: [
          { id: "hu201-l3", title: "Gimbal Setup & Balancing", duration: "20 min", type: "video" },
          { id: "hu201-l4", title: "Smooth Operator Techniques", duration: "25 min", type: "video" },
          { id: "hu201-l5", title: "Advanced Gimbal Moves", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu201-q2", title: "Gimbal Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu201-m3",
        title: "Slider & Dolly Techniques",
        lessons: [
          { id: "hu201-l6", title: "Slider Fundamentals", duration: "18 min", type: "video" },
          { id: "hu201-l7", title: "DIY Dolly Solutions", duration: "20 min", type: "video" },
          { id: "hu201-l8", title: "Parallax & Depth", duration: "16 min", type: "video" },
        ],
        quiz: { id: "hu201-q3", title: "Slider Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu201-m4",
        title: "Intentional Handheld",
        lessons: [
          { id: "hu201-l9", title: "The Art of Handheld", duration: "15 min", type: "video" },
          { id: "hu201-l10", title: "Documentary Style Movement", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu201-q4", title: "Handheld Quiz", questions: 5, passingScore: 80 },
      },
      {
        id: "hu201-m5",
        title: "Movement Projects",
        lessons: [
          { id: "hu201-l11", title: "Chase Scene Project", duration: "35 min", type: "practice" },
          { id: "hu201-l12", title: "One-Take Wonder", duration: "40 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu201-final", title: "Final Exam: Camera Movement", questions: 30, passingScore: 75 },
  },
  {
    code: "HU-301",
    title: "Cinematic Lens Language",
    department: "Cinematography",
    departmentId: "cinematography",
    credits: 5,
    level: "Advanced",
    description: "Deep dive into lens selection, depth of field, and the psychological impact of different focal lengths. Master the visual vocabulary of cinema.",
    lessons: 10,
    duration: "5 weeks",
    modules: [
      {
        id: "hu301-m1",
        title: "Lens Fundamentals",
        lessons: [
          { id: "hu301-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu301-l1", title: "Understanding Focal Length", duration: "20 min", type: "video" },
          { id: "hu301-l2", title: "Aperture & Depth of Field", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu301-q1", title: "Lens Basics Quiz", questions: 8, passingScore: 85 },
      },
      {
        id: "hu301-m2",
        title: "Wide Angle Psychology",
        lessons: [
          { id: "hu301-l3", title: "When to Go Wide", duration: "18 min", type: "video" },
          { id: "hu301-l4", title: "Distortion as a Tool", duration: "16 min", type: "video" },
        ],
        quiz: { id: "hu301-q2", title: "Wide Angle Quiz", questions: 6, passingScore: 85 },
      },
      {
        id: "hu301-m3",
        title: "Telephoto Mastery",
        lessons: [
          { id: "hu301-l5", title: "Compression & Intimacy", duration: "20 min", type: "video" },
          { id: "hu301-l6", title: "Long Lens Techniques", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu301-q3", title: "Telephoto Quiz", questions: 6, passingScore: 85 },
      },
      {
        id: "hu301-m4",
        title: "Mobile Lens Attachments",
        lessons: [
          { id: "hu301-l7", title: "Anamorphic on iPhone", duration: "25 min", type: "video" },
          { id: "hu301-l8", title: "Best Mobile Lens Kits", duration: "15 min", type: "reading" },
        ],
        quiz: { id: "hu301-q4", title: "Mobile Lenses Quiz", questions: 5, passingScore: 85 },
      },
      {
        id: "hu301-m5",
        title: "Lens Language Projects",
        lessons: [
          { id: "hu301-l9", title: "Emotional Lens Study", duration: "45 min", type: "practice" },
          { id: "hu301-l10", title: "Lens Comparison Reel", duration: "50 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu301-final", title: "Final Exam: Lens Language", questions: 35, passingScore: 80 },
  },

  // ==================== POST-PRODUCTION ====================
  {
    code: "HU-103",
    title: "Editing Fundamentals",
    department: "Post-Production",
    departmentId: "post-production",
    credits: 3,
    level: "Beginner",
    description: "Learn the language of editing: cuts, pacing, and story flow. Master the timeline and build compelling sequences from raw footage.",
    lessons: 10,
    duration: "5 weeks",
    modules: [
      {
        id: "hu103-m1",
        title: "The Art of the Cut",
        lessons: [
          { id: "hu103-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu103-l1", title: "Why Editing Matters", duration: "12 min", type: "video" },
          { id: "hu103-l2", title: "Types of Cuts", duration: "20 min", type: "video" },
        ],
        quiz: { id: "hu103-q1", title: "Cuts Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu103-m2",
        title: "Timeline Mastery",
        lessons: [
          { id: "hu103-l3", title: "Organizing Your Project", duration: "15 min", type: "video" },
          { id: "hu103-l4", title: "Keyboard Shortcuts", duration: "18 min", type: "video" },
          { id: "hu103-l5", title: "Working with Markers", duration: "12 min", type: "video" },
        ],
        quiz: { id: "hu103-q2", title: "Timeline Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu103-m3",
        title: "Pacing & Rhythm",
        lessons: [
          { id: "hu103-l6", title: "Editing to Music", duration: "22 min", type: "video" },
          { id: "hu103-l7", title: "Building Tension", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu103-q3", title: "Pacing Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu103-m4",
        title: "Your First Edit",
        lessons: [
          { id: "hu103-l8", title: "Assembly Edit Tutorial", duration: "30 min", type: "practice" },
          { id: "hu103-l9", title: "Rough Cut Refinement", duration: "25 min", type: "practice" },
          { id: "hu103-l10", title: "Final Polish", duration: "20 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu103-final", title: "Final Exam: Editing Fundamentals", questions: 20, passingScore: 75 },
  },
  {
    code: "HU-104",
    title: "Mobile Editing Workflow",
    department: "Post-Production",
    departmentId: "post-production",
    credits: 3,
    level: "Beginner",
    description: "Edit professional content entirely on your phone or tablet. Learn efficient mobile workflows using apps like CapCut, LumaFusion, and more.",
    lessons: 8,
    duration: "4 weeks",
    modules: [
      {
        id: "hu104-m1",
        title: "Mobile Editing Apps",
        lessons: [
          { id: "hu104-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu104-l1", title: "App Comparison Guide", duration: "18 min", type: "reading" },
          { id: "hu104-l2", title: "CapCut Deep Dive", duration: "25 min", type: "video" },
        ],
        quiz: { id: "hu104-q1", title: "Apps Quiz", questions: 5, passingScore: 80 },
      },
      {
        id: "hu104-m2",
        title: "Mobile Workflow Optimization",
        lessons: [
          { id: "hu104-l3", title: "File Management on Mobile", duration: "15 min", type: "video" },
          { id: "hu104-l4", title: "Proxy Workflows", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu104-q2", title: "Workflow Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu104-m3",
        title: "Advanced Mobile Features",
        lessons: [
          { id: "hu104-l5", title: "Keyframe Animation", duration: "20 min", type: "video" },
          { id: "hu104-l6", title: "Mobile Color Grading", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu104-q3", title: "Advanced Features Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu104-m4",
        title: "Mobile Edit Projects",
        lessons: [
          { id: "hu104-l7", title: "Social Media Edit", duration: "30 min", type: "practice" },
          { id: "hu104-l8", title: "Short Film on Mobile", duration: "40 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu104-final", title: "Final Exam: Mobile Editing", questions: 18, passingScore: 75 },
  },
  {
    code: "HU-202",
    title: "Color Grading Masterclass",
    department: "Post-Production",
    departmentId: "post-production",
    credits: 5,
    level: "Intermediate",
    description: "Professional color grading techniques that transform your footage. Create signature looks, match shots, and evoke emotion through color.",
    lessons: 14,
    duration: "7 weeks",
    modules: [
      {
        id: "hu202-m1",
        title: "Color Theory for Film",
        lessons: [
          { id: "hu202-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu202-l1", title: "Psychology of Color", duration: "18 min", type: "video" },
          { id: "hu202-l2", title: "Color Wheels & Scopes", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu202-q1", title: "Color Theory Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu202-m2",
        title: "Primary Corrections",
        lessons: [
          { id: "hu202-l3", title: "Exposure & Contrast", duration: "20 min", type: "video" },
          { id: "hu202-l4", title: "White Balance Mastery", duration: "16 min", type: "video" },
          { id: "hu202-l5", title: "Lift, Gamma, Gain", duration: "25 min", type: "video" },
        ],
        quiz: { id: "hu202-q2", title: "Primary Corrections Quiz", questions: 10, passingScore: 80 },
      },
      {
        id: "hu202-m3",
        title: "Secondary Corrections",
        lessons: [
          { id: "hu202-l6", title: "Qualifiers & Masks", duration: "22 min", type: "video" },
          { id: "hu202-l7", title: "Power Windows", duration: "18 min", type: "video" },
          { id: "hu202-l8", title: "Skin Tone Protection", duration: "20 min", type: "video" },
        ],
        quiz: { id: "hu202-q3", title: "Secondary Corrections Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu202-m4",
        title: "Creating Looks",
        lessons: [
          { id: "hu202-l9", title: "Film Emulation", duration: "25 min", type: "video" },
          { id: "hu202-l10", title: "Building Your Style", duration: "20 min", type: "video" },
          { id: "hu202-l11", title: "LUT Creation", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu202-q4", title: "Looks Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu202-m5",
        title: "Color Grading Projects",
        lessons: [
          { id: "hu202-l12", title: "Music Video Grade", duration: "45 min", type: "practice" },
          { id: "hu202-l13", title: "Narrative Scene Grade", duration: "50 min", type: "practice" },
          { id: "hu202-l14", title: "Match Grading Exercise", duration: "35 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu202-final", title: "Final Exam: Color Grading", questions: 35, passingScore: 75 },
  },
  {
    code: "HU-302",
    title: "Sound Design & Audio Mix",
    department: "Post-Production",
    departmentId: "post-production",
    credits: 5,
    level: "Advanced",
    description: "Create immersive audio landscapes and professional sound mixes. Layer sound effects, music, and dialogue for maximum impact.",
    lessons: 12,
    duration: "6 weeks",
    modules: [
      {
        id: "hu302-m1",
        title: "Audio Fundamentals",
        lessons: [
          { id: "hu302-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu302-l1", title: "Sound in Cinema", duration: "16 min", type: "video" },
          { id: "hu302-l2", title: "Audio Formats & Quality", duration: "14 min", type: "video" },
        ],
        quiz: { id: "hu302-q1", title: "Audio Basics Quiz", questions: 6, passingScore: 85 },
      },
      {
        id: "hu302-m2",
        title: "Dialogue Editing",
        lessons: [
          { id: "hu302-l3", title: "Cleaning Dialogue", duration: "22 min", type: "video" },
          { id: "hu302-l4", title: "ADR Techniques", duration: "20 min", type: "video" },
        ],
        quiz: { id: "hu302-q2", title: "Dialogue Quiz", questions: 8, passingScore: 85 },
      },
      {
        id: "hu302-m3",
        title: "Sound Effects",
        lessons: [
          { id: "hu302-l5", title: "Foley Fundamentals", duration: "25 min", type: "video" },
          { id: "hu302-l6", title: "Sound Libraries", duration: "15 min", type: "reading" },
          { id: "hu302-l7", title: "Layering SFX", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu302-q3", title: "SFX Quiz", questions: 8, passingScore: 85 },
      },
      {
        id: "hu302-m4",
        title: "Music & Final Mix",
        lessons: [
          { id: "hu302-l8", title: "Scoring & Music Selection", duration: "20 min", type: "video" },
          { id: "hu302-l9", title: "The Final Mix", duration: "28 min", type: "video" },
          { id: "hu302-l10", title: "Delivery Standards", duration: "15 min", type: "video" },
        ],
        quiz: { id: "hu302-q4", title: "Mix Quiz", questions: 8, passingScore: 85 },
      },
      {
        id: "hu302-m5",
        title: "Sound Projects",
        lessons: [
          { id: "hu302-l11", title: "Scene Sound Design", duration: "50 min", type: "practice" },
          { id: "hu302-l12", title: "Full Mix Project", duration: "60 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu302-final", title: "Final Exam: Sound Design", questions: 40, passingScore: 80 },
  },

  // ==================== DIRECTING ====================
  {
    code: "HU-105",
    title: "Visual Storytelling Basics",
    department: "Directing",
    departmentId: "directing",
    credits: 3,
    level: "Beginner",
    description: "Tell stories through images. Master the fundamentals of visual narrative, scene construction, and how to guide viewer attention.",
    lessons: 8,
    duration: "4 weeks",
    modules: [
      {
        id: "hu105-m1",
        title: "Story Foundations",
        lessons: [
          { id: "hu105-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu105-l1", title: "Visual vs Written Story", duration: "15 min", type: "video" },
          { id: "hu105-l2", title: "The Hero's Journey", duration: "20 min", type: "video" },
        ],
        quiz: { id: "hu105-q1", title: "Story Basics Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu105-m2",
        title: "Scene Construction",
        lessons: [
          { id: "hu105-l3", title: "Building a Scene", duration: "22 min", type: "video" },
          { id: "hu105-l4", title: "Subtext & Meaning", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu105-q2", title: "Scene Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu105-m3",
        title: "Guiding the Eye",
        lessons: [
          { id: "hu105-l5", title: "Visual Hierarchy", duration: "16 min", type: "video" },
          { id: "hu105-l6", title: "Blocking for Story", duration: "20 min", type: "video" },
        ],
        quiz: { id: "hu105-q3", title: "Visual Guide Quiz", questions: 5, passingScore: 80 },
      },
      {
        id: "hu105-m4",
        title: "Storytelling Project",
        lessons: [
          { id: "hu105-l7", title: "One-Minute Story", duration: "35 min", type: "practice" },
          { id: "hu105-l8", title: "Silent Narrative", duration: "40 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu105-final", title: "Final Exam: Visual Storytelling", questions: 18, passingScore: 75 },
  },
  {
    code: "HU-203",
    title: "Documentary Storytelling",
    department: "Directing",
    departmentId: "directing",
    credits: 5,
    level: "Intermediate",
    description: "Craft compelling documentary narratives from concept to final cut. Interview techniques, story structure, and ethical considerations.",
    lessons: 12,
    duration: "6 weeks",
    modules: [
      {
        id: "hu203-m1",
        title: "Documentary Forms",
        lessons: [
          { id: "hu203-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu203-l1", title: "Types of Documentary", duration: "18 min", type: "video" },
          { id: "hu203-l2", title: "Finding Your Subject", duration: "15 min", type: "video" },
        ],
        quiz: { id: "hu203-q1", title: "Forms Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu203-m2",
        title: "Interview Mastery",
        lessons: [
          { id: "hu203-l3", title: "The Art of the Interview", duration: "25 min", type: "video" },
          { id: "hu203-l4", title: "Technical Setup", duration: "18 min", type: "video" },
          { id: "hu203-l5", title: "Getting Real Answers", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu203-q2", title: "Interview Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu203-m3",
        title: "Structure & Ethics",
        lessons: [
          { id: "hu203-l6", title: "Documentary Structure", duration: "20 min", type: "video" },
          { id: "hu203-l7", title: "B-Roll Strategy", duration: "16 min", type: "video" },
          { id: "hu203-l8", title: "Ethics in Documentary", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu203-q3", title: "Structure Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu203-m4",
        title: "Documentary Project",
        lessons: [
          { id: "hu203-l9", title: "Mini-Doc Planning", duration: "30 min", type: "practice" },
          { id: "hu203-l10", title: "Conducting Your Interview", duration: "45 min", type: "practice" },
          { id: "hu203-l11", title: "Documentary Edit", duration: "50 min", type: "practice" },
          { id: "hu203-l12", title: "Final Delivery", duration: "25 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu203-final", title: "Final Exam: Documentary", questions: 30, passingScore: 75 },
  },
  {
    code: "HU-204",
    title: "Music Video Direction",
    department: "Directing",
    departmentId: "directing",
    credits: 4,
    level: "Intermediate",
    description: "Create visually stunning music videos. Concept development, performance direction, and syncing visuals to audio.",
    lessons: 10,
    duration: "5 weeks",
    modules: [
      {
        id: "hu204-m1",
        title: "Music Video Concepts",
        lessons: [
          { id: "hu204-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu204-l1", title: "Analyzing Hit Videos", duration: "20 min", type: "video" },
          { id: "hu204-l2", title: "Concept Development", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu204-q1", title: "Concepts Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu204-m2",
        title: "Performance Direction",
        lessons: [
          { id: "hu204-l3", title: "Directing Artists", duration: "22 min", type: "video" },
          { id: "hu204-l4", title: "Lip Sync Techniques", duration: "16 min", type: "video" },
        ],
        quiz: { id: "hu204-q2", title: "Performance Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu204-m3",
        title: "Visual Style",
        lessons: [
          { id: "hu204-l5", title: "Creating Visual Motifs", duration: "20 min", type: "video" },
          { id: "hu204-l6", title: "Budget-Friendly Production Design", duration: "18 min", type: "video" },
          { id: "hu204-l7", title: "Lighting for Music Videos", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu204-q3", title: "Visual Style Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu204-m4",
        title: "Music Video Project",
        lessons: [
          { id: "hu204-l8", title: "Treatment Development", duration: "30 min", type: "practice" },
          { id: "hu204-l9", title: "Music Video Shoot", duration: "60 min", type: "practice" },
          { id: "hu204-l10", title: "Music Video Edit", duration: "45 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu204-final", title: "Final Exam: Music Video", questions: 25, passingScore: 75 },
  },
  {
    code: "HU-303",
    title: "Directing Talent & Performance",
    department: "Directing",
    departmentId: "directing",
    credits: 5,
    level: "Advanced",
    description: "Work with actors and on-screen talent to get authentic, powerful performances. Communication, rehearsal, and on-set techniques.",
    lessons: 10,
    duration: "5 weeks",
    modules: [
      {
        id: "hu303-m1",
        title: "Director-Actor Relationship",
        lessons: [
          { id: "hu303-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu303-l1", title: "Building Trust", duration: "20 min", type: "video" },
          { id: "hu303-l2", title: "Communication Styles", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu303-q1", title: "Relationship Quiz", questions: 6, passingScore: 85 },
      },
      {
        id: "hu303-m2",
        title: "Rehearsal Techniques",
        lessons: [
          { id: "hu303-l3", title: "Table Reads", duration: "16 min", type: "video" },
          { id: "hu303-l4", title: "Blocking Rehearsals", duration: "22 min", type: "video" },
          { id: "hu303-l5", title: "Emotional Preparation", duration: "20 min", type: "video" },
        ],
        quiz: { id: "hu303-q2", title: "Rehearsal Quiz", questions: 8, passingScore: 85 },
      },
      {
        id: "hu303-m3",
        title: "On-Set Direction",
        lessons: [
          { id: "hu303-l6", title: "Giving Notes", duration: "18 min", type: "video" },
          { id: "hu303-l7", title: "Adjusting Performances", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu303-q3", title: "On-Set Quiz", questions: 6, passingScore: 85 },
      },
      {
        id: "hu303-m4",
        title: "Directing Projects",
        lessons: [
          { id: "hu303-l8", title: "Monologue Direction", duration: "40 min", type: "practice" },
          { id: "hu303-l9", title: "Two-Person Scene", duration: "50 min", type: "practice" },
          { id: "hu303-l10", title: "Emotional Scene Direction", duration: "55 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu303-final", title: "Final Exam: Directing Talent", questions: 35, passingScore: 80 },
  },

  // ==================== PRODUCTION ====================
  {
    code: "HU-106",
    title: "Pre-Production Planning",
    department: "Production",
    departmentId: "production",
    credits: 3,
    level: "Beginner",
    description: "Plan your shoots like a pro. Scripts, shot lists, storyboards, and schedules that keep projects on track and on budget.",
    lessons: 8,
    duration: "4 weeks",
    modules: [
      {
        id: "hu106-m1",
        title: "Script Breakdown",
        lessons: [
          { id: "hu106-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu106-l1", title: "Reading a Script", duration: "15 min", type: "video" },
          { id: "hu106-l2", title: "Breaking Down Scenes", duration: "20 min", type: "video" },
        ],
        quiz: { id: "hu106-q1", title: "Script Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu106-m2",
        title: "Visual Planning",
        lessons: [
          { id: "hu106-l3", title: "Creating Shot Lists", duration: "18 min", type: "video" },
          { id: "hu106-l4", title: "Storyboarding Basics", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu106-q2", title: "Visual Planning Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu106-m3",
        title: "Scheduling & Logistics",
        lessons: [
          { id: "hu106-l5", title: "Creating a Schedule", duration: "20 min", type: "video" },
          { id: "hu106-l6", title: "Location Scouting", duration: "16 min", type: "video" },
        ],
        quiz: { id: "hu106-q3", title: "Logistics Quiz", questions: 5, passingScore: 80 },
      },
      {
        id: "hu106-m4",
        title: "Pre-Production Project",
        lessons: [
          { id: "hu106-l7", title: "Your Production Binder", duration: "35 min", type: "practice" },
          { id: "hu106-l8", title: "Complete Pre-Pro Package", duration: "40 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu106-final", title: "Final Exam: Pre-Production", questions: 18, passingScore: 75 },
  },
  {
    code: "HU-205",
    title: "Budget Filmmaking",
    department: "Production",
    departmentId: "production",
    credits: 4,
    level: "Intermediate",
    description: "Create professional results on limited budgets. Maximize every dollar, find free resources, and deliver high-value productions.",
    lessons: 10,
    duration: "5 weeks",
    modules: [
      {
        id: "hu205-m1",
        title: "Budget Fundamentals",
        lessons: [
          { id: "hu205-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu205-l1", title: "Understanding Film Budgets", duration: "18 min", type: "video" },
          { id: "hu205-l2", title: "Budget Templates", duration: "15 min", type: "reading" },
        ],
        quiz: { id: "hu205-q1", title: "Budget Basics Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu205-m2",
        title: "Saving on Production",
        lessons: [
          { id: "hu205-l3", title: "Free Locations & Permits", duration: "20 min", type: "video" },
          { id: "hu205-l4", title: "Gear on a Budget", duration: "22 min", type: "video" },
          { id: "hu205-l5", title: "Working with Volunteers", duration: "16 min", type: "video" },
        ],
        quiz: { id: "hu205-q2", title: "Production Savings Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu205-m3",
        title: "Maximizing Value",
        lessons: [
          { id: "hu205-l6", title: "High-Value Production Design", duration: "25 min", type: "video" },
          { id: "hu205-l7", title: "Creative Problem Solving", duration: "20 min", type: "video" },
        ],
        quiz: { id: "hu205-q3", title: "Value Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu205-m4",
        title: "Budget Projects",
        lessons: [
          { id: "hu205-l8", title: "$100 Music Video", duration: "45 min", type: "practice" },
          { id: "hu205-l9", title: "$500 Short Film", duration: "50 min", type: "practice" },
          { id: "hu205-l10", title: "Budget Breakdown Presentation", duration: "30 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu205-final", title: "Final Exam: Budget Filmmaking", questions: 25, passingScore: 75 },
  },
  {
    code: "HU-206",
    title: "Client Management & Freelancing",
    department: "Production",
    departmentId: "production",
    credits: 4,
    level: "Intermediate",
    description: "Build a sustainable freelance business. Pricing, contracts, client communication, and building long-term relationships.",
    lessons: 8,
    duration: "4 weeks",
    modules: [
      {
        id: "hu206-m1",
        title: "Business Foundations",
        lessons: [
          { id: "hu206-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu206-l1", title: "Freelance vs Agency", duration: "15 min", type: "video" },
          { id: "hu206-l2", title: "Setting Your Rates", duration: "20 min", type: "video" },
        ],
        quiz: { id: "hu206-q1", title: "Business Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu206-m2",
        title: "Contracts & Legal",
        lessons: [
          { id: "hu206-l3", title: "Contract Essentials", duration: "22 min", type: "video" },
          { id: "hu206-l4", title: "Protecting Your Work", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu206-q2", title: "Legal Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu206-m3",
        title: "Client Relations",
        lessons: [
          { id: "hu206-l5", title: "Client Communication", duration: "20 min", type: "video" },
          { id: "hu206-l6", title: "Managing Expectations", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu206-q3", title: "Client Quiz", questions: 6, passingScore: 80 },
      },
      {
        id: "hu206-m4",
        title: "Business Projects",
        lessons: [
          { id: "hu206-l7", title: "Create Your Rate Card", duration: "30 min", type: "practice" },
          { id: "hu206-l8", title: "Draft Your Contract", duration: "35 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu206-final", title: "Final Exam: Freelancing", questions: 22, passingScore: 75 },
  },
  {
    code: "HU-304",
    title: "Capstone Project Management",
    department: "Production",
    departmentId: "production",
    credits: 5,
    level: "Advanced",
    description: "Lead a complete film production from concept to delivery. Coordinate teams, manage timelines, and deliver your capstone film.",
    lessons: 12,
    duration: "8 weeks",
    modules: [
      {
        id: "hu304-m1",
        title: "Project Leadership",
        lessons: [
          { id: "hu304-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu304-l1", title: "Leading a Production", duration: "20 min", type: "video" },
          { id: "hu304-l2", title: "Building Your Team", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu304-q1", title: "Leadership Quiz", questions: 6, passingScore: 85 },
      },
      {
        id: "hu304-m2",
        title: "Advanced Planning",
        lessons: [
          { id: "hu304-l3", title: "Complex Scheduling", duration: "25 min", type: "video" },
          { id: "hu304-l4", title: "Risk Management", duration: "20 min", type: "video" },
          { id: "hu304-l5", title: "Contingency Planning", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu304-q2", title: "Planning Quiz", questions: 8, passingScore: 85 },
      },
      {
        id: "hu304-m3",
        title: "Production Execution",
        lessons: [
          { id: "hu304-l6", title: "Day-of Management", duration: "22 min", type: "video" },
          { id: "hu304-l7", title: "Problem Solving On Set", duration: "20 min", type: "video" },
        ],
        quiz: { id: "hu304-q3", title: "Execution Quiz", questions: 6, passingScore: 85 },
      },
      {
        id: "hu304-m4",
        title: "Post & Delivery",
        lessons: [
          { id: "hu304-l8", title: "Managing Post-Production", duration: "22 min", type: "video" },
          { id: "hu304-l9", title: "Client Delivery", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu304-q4", title: "Delivery Quiz", questions: 6, passingScore: 85 },
      },
      {
        id: "hu304-m5",
        title: "Capstone Project",
        lessons: [
          { id: "hu304-l10", title: "Capstone Planning Phase", duration: "60 min", type: "practice" },
          { id: "hu304-l11", title: "Capstone Production", duration: "120 min", type: "practice" },
          { id: "hu304-l12", title: "Capstone Delivery & Presentation", duration: "45 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu304-final", title: "Final Exam: Project Management", questions: 45, passingScore: 80 },
  },

  // ==================== PHOTOGRAPHY ====================
  {
    code: "HU-401",
    title: "Photography Fundamentals",
    department: "Photography",
    departmentId: "photography",
    credits: 3,
    level: "Beginner",
    description: "Master the basics of digital photography. Learn exposure triangle, composition rules, and how to capture stunning images in any situation.",
    lessons: 10,
    duration: "5 weeks",
    modules: [
      {
        id: "hu401-m1",
        title: "Camera Basics",
        lessons: [
          { id: "hu401-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu401-l1", title: "Understanding Your Camera", duration: "18 min", type: "video" },
          { id: "hu401-l2", title: "The Exposure Triangle", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu401-q1", title: "Camera Basics Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu401-m2",
        title: "Composition Essentials",
        lessons: [
          { id: "hu401-l3", title: "Rule of Thirds & Beyond", duration: "20 min", type: "video" },
          { id: "hu401-l4", title: "Leading Lines & Framing", duration: "18 min", type: "video" },
          { id: "hu401-l5", title: "Negative Space & Balance", duration: "16 min", type: "video" },
        ],
        quiz: { id: "hu401-q2", title: "Composition Quiz", questions: 10, passingScore: 80 },
      },
      {
        id: "hu401-m3",
        title: "Light & Exposure",
        lessons: [
          { id: "hu401-l6", title: "Natural Light Photography", duration: "22 min", type: "video" },
          { id: "hu401-l7", title: "Golden Hour & Blue Hour", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu401-q3", title: "Lighting Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu401-m4",
        title: "Practical Projects",
        lessons: [
          { id: "hu401-l8", title: "Street Photography Walk", duration: "45 min", type: "practice" },
          { id: "hu401-l9", title: "Portrait Session", duration: "40 min", type: "practice" },
          { id: "hu401-l10", title: "Landscape Challenge", duration: "50 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu401-final", title: "Final Exam: Photography Fundamentals", questions: 25, passingScore: 75 },
  },
  {
    code: "HU-402",
    title: "Portrait Photography Mastery",
    department: "Photography",
    departmentId: "photography",
    credits: 4,
    level: "Intermediate",
    description: "Create stunning portraits that capture personality and emotion. Master lighting setups, posing techniques, and post-processing for portraits.",
    lessons: 12,
    duration: "6 weeks",
    modules: [
      {
        id: "hu402-m1",
        title: "Portrait Lighting",
        lessons: [
          { id: "hu402-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu402-l1", title: "One-Light Portraits", duration: "25 min", type: "video" },
          { id: "hu402-l2", title: "Two-Light Setups", duration: "22 min", type: "video" },
          { id: "hu402-l3", title: "Natural Light Portraits", duration: "20 min", type: "video" },
        ],
        quiz: { id: "hu402-q1", title: "Portrait Lighting Quiz", questions: 10, passingScore: 80 },
      },
      {
        id: "hu402-m2",
        title: "Posing & Direction",
        lessons: [
          { id: "hu402-l4", title: "Posing Fundamentals", duration: "22 min", type: "video" },
          { id: "hu402-l5", title: "Directing Non-Models", duration: "18 min", type: "video" },
          { id: "hu402-l6", title: "Expression & Emotion", duration: "20 min", type: "video" },
        ],
        quiz: { id: "hu402-q2", title: "Posing Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu402-m3",
        title: "Portrait Retouching",
        lessons: [
          { id: "hu402-l7", title: "Skin Retouching Techniques", duration: "28 min", type: "video" },
          { id: "hu402-l8", title: "Color Grading Portraits", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu402-q3", title: "Retouching Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu402-m4",
        title: "Portrait Projects",
        lessons: [
          { id: "hu402-l9", title: "Studio Portrait Session", duration: "60 min", type: "practice" },
          { id: "hu402-l10", title: "Environmental Portrait", duration: "50 min", type: "practice" },
          { id: "hu402-l11", title: "Creative Portrait Series", duration: "70 min", type: "practice" },
          { id: "hu402-l12", title: "Portfolio Building", duration: "40 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu402-final", title: "Final Exam: Portrait Photography", questions: 30, passingScore: 75 },
  },
  {
    code: "HU-403",
    title: "Photography Lighting Mastery",
    department: "Photography",
    departmentId: "photography",
    credits: 4,
    level: "Intermediate",
    description: "Master the art of lighting for photography. From natural light to complex studio setups, learn to shape and control light for stunning images.",
    lessons: 12,
    duration: "6 weeks",
    modules: [
      {
        id: "hu403-m1",
        title: "Light Fundamentals",
        lessons: [
          { id: "hu403-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu403-l1", title: "Understanding Light Quality", duration: "22 min", type: "video" },
          { id: "hu403-l2", title: "Color Temperature & White Balance", duration: "20 min", type: "video" },
        ],
        quiz: { id: "hu403-q1", title: "Light Basics Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu403-m2",
        title: "Natural Light Techniques",
        lessons: [
          { id: "hu403-l3", title: "Window Light Mastery", duration: "25 min", type: "video" },
          { id: "hu403-l4", title: "Golden Hour & Blue Hour", duration: "20 min", type: "video" },
          { id: "hu403-l5", title: "Reflectors & Diffusers", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu403-q2", title: "Natural Light Quiz", questions: 10, passingScore: 80 },
      },
      {
        id: "hu403-m3",
        title: "Studio Lighting",
        lessons: [
          { id: "hu403-l6", title: "Strobe vs Continuous Light", duration: "22 min", type: "video" },
          { id: "hu403-l7", title: "One-Light Setups", duration: "25 min", type: "video" },
          { id: "hu403-l8", title: "Multi-Light Configurations", duration: "28 min", type: "video" },
        ],
        quiz: { id: "hu403-q3", title: "Studio Lighting Quiz", questions: 10, passingScore: 80 },
      },
      {
        id: "hu403-m4",
        title: "Light Modifiers",
        lessons: [
          { id: "hu403-l9", title: "Softboxes & Umbrellas", duration: "20 min", type: "video" },
          { id: "hu403-l10", title: "Grids, Snoots & Flags", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu403-q4", title: "Modifiers Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu403-m5",
        title: "Lighting Projects",
        lessons: [
          { id: "hu403-l11", title: "Dramatic Portrait Lighting", duration: "60 min", type: "practice" },
          { id: "hu403-l12", title: "Product Photography Setup", duration: "55 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu403-final", title: "Final Exam: Photography Lighting", questions: 30, passingScore: 75 },
  },
  {
    code: "HU-404",
    title: "Photo Editing & Retouching",
    department: "Photography",
    departmentId: "photography",
    credits: 5,
    level: "Advanced",
    description: "Transform your photos with professional editing and retouching techniques. Master Lightroom, Photoshop, and develop your signature style.",
    lessons: 14,
    duration: "7 weeks",
    modules: [
      {
        id: "hu404-m1",
        title: "Lightroom Mastery",
        lessons: [
          { id: "hu404-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu404-l1", title: "Raw Processing Workflow", duration: "25 min", type: "video" },
          { id: "hu404-l2", title: "Local Adjustments", duration: "22 min", type: "video" },
          { id: "hu404-l3", title: "Presets & Batch Editing", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu404-q1", title: "Lightroom Quiz", questions: 10, passingScore: 85 },
      },
      {
        id: "hu404-m2",
        title: "Photoshop Essentials",
        lessons: [
          { id: "hu404-l4", title: "Layers & Masks", duration: "28 min", type: "video" },
          { id: "hu404-l5", title: "Advanced Selection Tools", duration: "25 min", type: "video" },
          { id: "hu404-l6", title: "Compositing Basics", duration: "30 min", type: "video" },
        ],
        quiz: { id: "hu404-q2", title: "Photoshop Quiz", questions: 12, passingScore: 85 },
      },
      {
        id: "hu404-m3",
        title: "Professional Retouching",
        lessons: [
          { id: "hu404-l7", title: "Frequency Separation", duration: "30 min", type: "video" },
          { id: "hu404-l8", title: "Dodge & Burn Techniques", duration: "25 min", type: "video" },
          { id: "hu404-l9", title: "Color Harmony", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu404-q3", title: "Retouching Quiz", questions: 10, passingScore: 85 },
      },
      {
        id: "hu404-m4",
        title: "Style Development",
        lessons: [
          { id: "hu404-l10", title: "Creating Your Look", duration: "20 min", type: "video" },
          { id: "hu404-l11", title: "Film Emulation", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu404-q4", title: "Style Quiz", questions: 6, passingScore: 85 },
      },
      {
        id: "hu404-m5",
        title: "Editing Projects",
        lessons: [
          { id: "hu404-l12", title: "Portrait Retouch Project", duration: "60 min", type: "practice" },
          { id: "hu404-l13", title: "Composite Creation", duration: "90 min", type: "practice" },
          { id: "hu404-l14", title: "Preset Pack Development", duration: "45 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu404-final", title: "Final Exam: Photo Editing", questions: 40, passingScore: 80 },
  },

  // ==================== CAMERA SYSTEMS ====================
  {
    code: "HU-501",
    title: "Sony A7S III Complete Guide",
    department: "Camera Systems",
    departmentId: "camera-systems",
    credits: 4,
    level: "Intermediate",
    description: "Master the Sony A7S III for professional video production. Deep dive into menus, S-Log, autofocus systems, and optimal recording settings.",
    lessons: 12,
    duration: "6 weeks",
    modules: [
      {
        id: "hu501-m1",
        title: "Camera Overview",
        lessons: [
          { id: "hu501-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu501-l1", title: "A7S III Introduction & Philosophy", duration: "18 min", type: "video" },
          { id: "hu501-l2", title: "Menu System Deep Dive", duration: "30 min", type: "video" },
        ],
        quiz: { id: "hu501-q1", title: "Camera Basics Quiz", questions: 10, passingScore: 80 },
      },
      {
        id: "hu501-m2",
        title: "Recording Formats & Codecs",
        lessons: [
          { id: "hu501-l3", title: "Understanding XAVC S-I & XAVC HS", duration: "25 min", type: "video" },
          { id: "hu501-l4", title: "4K 120fps Workflow", duration: "22 min", type: "video" },
          { id: "hu501-l5", title: "Choosing the Right Format", duration: "18 min", type: "video" },
        ],
        quiz: { id: "hu501-q2", title: "Codecs Quiz", questions: 12, passingScore: 80 },
      },
      {
        id: "hu501-m3",
        title: "S-Log3 & Color Science",
        lessons: [
          { id: "hu501-l6", title: "Exposing S-Log3 Correctly", duration: "28 min", type: "video" },
          { id: "hu501-l7", title: "S-Cinetone for Easy Color", duration: "20 min", type: "video" },
          { id: "hu501-l8", title: "Grading S-Log3 Footage", duration: "35 min", type: "video" },
        ],
        quiz: { id: "hu501-q3", title: "Color Science Quiz", questions: 10, passingScore: 80 },
      },
      {
        id: "hu501-m4",
        title: "Autofocus Mastery",
        lessons: [
          { id: "hu501-l9", title: "Real-Time Eye AF", duration: "22 min", type: "video" },
          { id: "hu501-l10", title: "AF Settings for Video", duration: "20 min", type: "video" },
        ],
        quiz: { id: "hu501-q4", title: "Autofocus Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu501-m5",
        title: "Practical Projects",
        lessons: [
          { id: "hu501-l11", title: "Low Light Challenge", duration: "60 min", type: "practice" },
          { id: "hu501-l12", title: "Slow Motion Project", duration: "50 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu501-final", title: "Final Exam: Sony A7S III", questions: 35, passingScore: 75 },
  },
  {
    code: "HU-502",
    title: "Sony FX Series for Cinema",
    department: "Camera Systems",
    departmentId: "camera-systems",
    credits: 5,
    level: "Advanced",
    description: "Professional cinema production with Sony FX3, FX6, and FX9. Master cinema workflows, ND systems, and broadcast-ready output.",
    lessons: 14,
    duration: "7 weeks",
    modules: [
      {
        id: "hu502-m1",
        title: "FX Series Overview",
        lessons: [
          { id: "hu502-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu502-l1", title: "Choosing Your FX Camera", duration: "22 min", type: "video" },
          { id: "hu502-l2", title: "Cinema vs Mirrorless Workflow", duration: "20 min", type: "video" },
        ],
        quiz: { id: "hu502-q1", title: "FX Overview Quiz", questions: 8, passingScore: 85 },
      },
      {
        id: "hu502-m2",
        title: "Professional Features",
        lessons: [
          { id: "hu502-l3", title: "Built-In ND System", duration: "18 min", type: "video" },
          { id: "hu502-l4", title: "Timecode & Genlock", duration: "25 min", type: "video" },
          { id: "hu502-l5", title: "SDI & HDMI Output", duration: "20 min", type: "video" },
        ],
        quiz: { id: "hu502-q2", title: "Pro Features Quiz", questions: 10, passingScore: 85 },
      },
      {
        id: "hu502-m3",
        title: "Advanced Color",
        lessons: [
          { id: "hu502-l6", title: "Venice CS vs S-Log3", duration: "28 min", type: "video" },
          { id: "hu502-l7", title: "LUT Workflows", duration: "25 min", type: "video" },
          { id: "hu502-l8", title: "On-Set Monitoring", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu502-q3", title: "Color Workflow Quiz", questions: 10, passingScore: 85 },
      },
      {
        id: "hu502-m4",
        title: "Rigging & Accessories",
        lessons: [
          { id: "hu502-l9", title: "Professional Rigging", duration: "30 min", type: "video" },
          { id: "hu502-l10", title: "Audio Integration", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu502-q4", title: "Rigging Quiz", questions: 8, passingScore: 85 },
      },
      {
        id: "hu502-m5",
        title: "Cinema Projects",
        lessons: [
          { id: "hu502-l11", title: "Narrative Scene Shoot", duration: "90 min", type: "practice" },
          { id: "hu502-l12", title: "Documentary Setup", duration: "60 min", type: "practice" },
          { id: "hu502-l13", title: "Commercial Production", duration: "80 min", type: "practice" },
          { id: "hu502-l14", title: "Multi-Camera Setup", duration: "70 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu502-final", title: "Final Exam: Sony FX Series", questions: 45, passingScore: 80 },
  },
  {
    code: "HU-503",
    title: "Canon Cinema EOS Fundamentals",
    department: "Camera Systems",
    departmentId: "camera-systems",
    credits: 4,
    level: "Intermediate",
    description: "Master Canon's Cinema EOS line including the C70, C300, and C500. Learn Canon Log, Dual Pixel AF, and professional cinema workflows.",
    lessons: 12,
    duration: "6 weeks",
    modules: [
      {
        id: "hu503-m1",
        title: "Cinema EOS Overview",
        lessons: [
          { id: "hu503-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu503-l1", title: "Canon Cinema Philosophy", duration: "18 min", type: "video" },
          { id: "hu503-l2", title: "C70 vs C300 vs C500", duration: "25 min", type: "video" },
        ],
        quiz: { id: "hu503-q1", title: "Cinema EOS Quiz", questions: 10, passingScore: 80 },
      },
      {
        id: "hu503-m2",
        title: "Canon Log & Color",
        lessons: [
          { id: "hu503-l3", title: "Canon Log 2 & 3 Explained", duration: "28 min", type: "video" },
          { id: "hu503-l4", title: "Wide DR vs Canon Log", duration: "20 min", type: "video" },
          { id: "hu503-l5", title: "Canon Color Science", duration: "25 min", type: "video" },
        ],
        quiz: { id: "hu503-q2", title: "Canon Color Quiz", questions: 12, passingScore: 80 },
      },
      {
        id: "hu503-m3",
        title: "Recording & Codecs",
        lessons: [
          { id: "hu503-l6", title: "XF-AVC vs MP4", duration: "22 min", type: "video" },
          { id: "hu503-l7", title: "RAW Recording Options", duration: "25 min", type: "video" },
        ],
        quiz: { id: "hu503-q3", title: "Recording Quiz", questions: 10, passingScore: 80 },
      },
      {
        id: "hu503-m4",
        title: "Dual Pixel AF System",
        lessons: [
          { id: "hu503-l8", title: "DPAF Deep Dive", duration: "25 min", type: "video" },
          { id: "hu503-l9", title: "Face Tracking & Eye AF", duration: "20 min", type: "video" },
        ],
        quiz: { id: "hu503-q4", title: "Autofocus Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu503-m5",
        title: "Canon Projects",
        lessons: [
          { id: "hu503-l10", title: "Interview Setup", duration: "50 min", type: "practice" },
          { id: "hu503-l11", title: "Run & Gun Documentary", duration: "60 min", type: "practice" },
          { id: "hu503-l12", title: "Cinematic Short", duration: "90 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu503-final", title: "Final Exam: Canon Cinema EOS", questions: 35, passingScore: 75 },
  },
  {
    code: "HU-504",
    title: "Canon R Series for Hybrid Shooters",
    department: "Camera Systems",
    departmentId: "camera-systems",
    credits: 4,
    level: "Intermediate",
    description: "Maximize the Canon R5 and R6 for photo and video. Master IBIS, oversampled 4K, and seamless photo-to-video transitions.",
    lessons: 10,
    duration: "5 weeks",
    modules: [
      {
        id: "hu504-m1",
        title: "R Series Overview",
        lessons: [
          { id: "hu504-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu504-l1", title: "R5 vs R6: Choosing Your Camera", duration: "20 min", type: "video" },
          { id: "hu504-l2", title: "RF Lens Ecosystem", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu504-q1", title: "R Series Basics Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu504-m2",
        title: "Video Capabilities",
        lessons: [
          { id: "hu504-l3", title: "4K & 8K Recording Modes", duration: "28 min", type: "video" },
          { id: "hu504-l4", title: "Heat Management Strategies", duration: "18 min", type: "video" },
          { id: "hu504-l5", title: "C-Log 3 on Mirrorless", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu504-q2", title: "Video Features Quiz", questions: 10, passingScore: 80 },
      },
      {
        id: "hu504-m3",
        title: "Photo Excellence",
        lessons: [
          { id: "hu504-l6", title: "High-Speed Burst Modes", duration: "20 min", type: "video" },
          { id: "hu504-l7", title: "Focus Stacking & Bracketing", duration: "25 min", type: "video" },
        ],
        quiz: { id: "hu504-q3", title: "Photo Features Quiz", questions: 8, passingScore: 80 },
      },
      {
        id: "hu504-m4",
        title: "Hybrid Workflows",
        lessons: [
          { id: "hu504-l8", title: "Event Hybrid Shooting", duration: "55 min", type: "practice" },
          { id: "hu504-l9", title: "Product Photography & Video", duration: "50 min", type: "practice" },
          { id: "hu504-l10", title: "Travel Content Creation", duration: "60 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu504-final", title: "Final Exam: Canon R Series", questions: 30, passingScore: 75 },
  },
  {
    code: "HU-505",
    title: "Advanced Sony Ecosystem",
    department: "Camera Systems",
    departmentId: "camera-systems",
    credits: 5,
    level: "Advanced",
    description: "Master the complete Sony ecosystem including lenses, monitoring, and multi-camera workflows. Professional techniques for broadcast and cinema.",
    lessons: 14,
    duration: "7 weeks",
    modules: [
      {
        id: "hu505-m1",
        title: "Sony Lens System",
        lessons: [
          { id: "hu505-reading-guide", title: "Course Guide & Reference PDF", duration: "15 min", type: "reading", completed: false },
          { id: "hu505-l1", title: "G Master vs G vs Zeiss", duration: "25 min", type: "video" },
          { id: "hu505-l2", title: "Adapting Vintage Lenses", duration: "22 min", type: "video" },
        ],
        quiz: { id: "hu505-q1", title: "Lens Quiz", questions: 10, passingScore: 85 },
      },
      {
        id: "hu505-m2",
        title: "Sony Accessories",
        lessons: [
          { id: "hu505-l3", title: "Sony Monitor & Recording", duration: "28 min", type: "video" },
          { id: "hu505-l4", title: "Wireless Audio Solutions", duration: "22 min", type: "video" },
          { id: "hu505-l5", title: "Power & Rigging", duration: "25 min", type: "video" },
        ],
        quiz: { id: "hu505-q2", title: "Accessories Quiz", questions: 10, passingScore: 85 },
      },
      {
        id: "hu505-m3",
        title: "Multi-Camera Production",
        lessons: [
          { id: "hu505-l6", title: "Matching Multiple Sony Bodies", duration: "30 min", type: "video" },
          { id: "hu505-l7", title: "Timecode Sync Solutions", duration: "25 min", type: "video" },
          { id: "hu505-l8", title: "Live Switching Workflow", duration: "28 min", type: "video" },
        ],
        quiz: { id: "hu505-q3", title: "Multi-Cam Quiz", questions: 12, passingScore: 85 },
      },
      {
        id: "hu505-m4",
        title: "Broadcast Applications",
        lessons: [
          { id: "hu505-l9", title: "Live Streaming Setup", duration: "30 min", type: "video" },
          { id: "hu505-l10", title: "Sports & Event Coverage", duration: "28 min", type: "video" },
        ],
        quiz: { id: "hu505-q4", title: "Broadcast Quiz", questions: 10, passingScore: 85 },
      },
      {
        id: "hu505-m5",
        title: "Pro Projects",
        lessons: [
          { id: "hu505-l11", title: "Multi-Camera Event", duration: "90 min", type: "practice" },
          { id: "hu505-l12", title: "Live Stream Production", duration: "75 min", type: "practice" },
          { id: "hu505-l13", title: "Documentary Feature Prep", duration: "80 min", type: "practice" },
          { id: "hu505-l14", title: "Ecosystem Integration Project", duration: "100 min", type: "practice" },
        ],
      },
    ],
    finalExam: { id: "hu505-final", title: "Final Exam: Sony Ecosystem", questions: 50, passingScore: 80 },
  },
];

export const getCourseByCode = (code: string): Course | undefined => {
  return courses.find(c => c.code === code);
};
