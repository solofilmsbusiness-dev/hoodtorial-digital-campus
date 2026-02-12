import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const challenges = [
  // LIGHTING (20)
  { title: "Golden Hour Portraits", description: "Capture warm, directional light", prompt: "Shoot a portrait during golden hour (the hour after sunrise or before sunset). Focus on how the warm, low-angle light wraps around your subject's face. Share your best frame with a note about the time of day.", difficulty: "beginner", category: "lighting", credits_reward: 0.5 },
  { title: "Single-Source Drama", description: "One light, maximum impact", prompt: "Using only a single light source (lamp, flashlight, window), create a dramatically lit scene. Aim for deep shadows and strong contrast. Show us the mood you created.", difficulty: "intermediate", category: "lighting", credits_reward: 1 },
  { title: "Silhouette Storytelling", description: "Tell a story with shapes alone", prompt: "Position your subject between the camera and a bright light source to create a silhouette. The shape alone should tell us something about the character or moment. Post your silhouette with context.", difficulty: "beginner", category: "lighting", credits_reward: 0.5 },
  { title: "Color Gel Moods", description: "Transform light with color", prompt: "Use colored gels (or colored cellophane/plastic) over a light source to create a mood. Shoot the same scene with two different gel colors and share both — explain how the color changes the emotional tone.", difficulty: "advanced", category: "lighting", credits_reward: 1.5 },
  { title: "Window Light Study", description: "Master natural indoor light", prompt: "Find a window and use only its natural light to illuminate a subject. Try three distances from the window and observe how the light quality changes. Share your favorite with notes on distance and time of day.", difficulty: "beginner", category: "lighting", credits_reward: 0.5 },
  { title: "Backlight Halos", description: "Create ethereal rim lighting", prompt: "Position your light source directly behind your subject to create a glowing halo or rim light effect. Experiment with exposure to balance the backlight against the subject's face.", difficulty: "intermediate", category: "lighting", credits_reward: 1 },
  { title: "Candle & Practical Lighting", description: "Light a scene with real sources", prompt: "Light an entire scene using only practical lights — candles, lamps, phone screens, or string lights. No dedicated film lights allowed. Capture the intimacy and warmth of practical sources.", difficulty: "intermediate", category: "lighting", credits_reward: 1 },
  { title: "Hard vs Soft Light", description: "Compare light qualities side by side", prompt: "Shoot the same subject with hard light (direct, small source) and soft light (diffused, large source). Present them side by side and explain which you prefer for this subject and why.", difficulty: "beginner", category: "lighting", credits_reward: 0.5 },
  { title: "Neon Night Shoot", description: "Use urban light as your palette", prompt: "Head out at night and find neon signs, storefronts, or LED displays to light your scene. Use only the ambient urban light — no additional sources. Capture the color and energy of the city.", difficulty: "advanced", category: "lighting", credits_reward: 1.5 },
  { title: "Chiaroscuro Still Life", description: "Paint with light like the masters", prompt: "Arrange a still life (fruit, objects, flowers) and light it with a single directional source to create a chiaroscuro effect — dramatic contrast between light and dark, inspired by Baroque paintings.", difficulty: "advanced", category: "lighting", credits_reward: 1.5 },
  { title: "Rim Light Reveals", description: "Edge-light your subject", prompt: "Set up a rim light (from behind and to the side) to outline your subject's edges. The rim should separate them from a dark background. Share the setup and the final result.", difficulty: "intermediate", category: "lighting", credits_reward: 1 },
  { title: "Bounce Light Techniques", description: "Redirect and soften light", prompt: "Use a white surface (foam board, wall, sheet) to bounce light onto your subject. Experiment with different bounce angles and distances. Document how each changes the light quality.", difficulty: "beginner", category: "lighting", credits_reward: 0.5 },
  { title: "Mixed Color Temperature", description: "Blend warm and cool sources", prompt: "Combine a warm light source (tungsten/candle) with a cool one (daylight/LED) in the same frame. Let the color contrast create visual tension. Share the result and your white balance choice.", difficulty: "advanced", category: "lighting", credits_reward: 1.5 },
  { title: "Flashlight Horror", description: "Build tension with a single beam", prompt: "Using only a flashlight (or phone torch), light a scene inspired by horror films. Move the light during the shot or hold it at unsettling angles. Capture the dread.", difficulty: "intermediate", category: "lighting", credits_reward: 1 },
  { title: "Sunrise Timelapse", description: "Document the changing light", prompt: "Set up your camera before sunrise and capture how the light transforms a scene over 30-60 minutes. Present it as a timelapse or a series of stills showing the progression.", difficulty: "intermediate", category: "lighting", credits_reward: 1 },
  { title: "Shadow Patterns", description: "Make shadows the subject", prompt: "Find or create interesting shadow patterns — blinds, fences, foliage, lace. Make the shadows themselves the main subject of your composition, not just a background element.", difficulty: "beginner", category: "lighting", credits_reward: 0.5 },
  { title: "Overhead Flat Lay Lighting", description: "Even, beautiful product light", prompt: "Set up a flat lay (objects arranged on a surface, shot from above) and light it evenly using diffused overhead light. Aim for clean, commercial-quality illumination with minimal shadows.", difficulty: "beginner", category: "lighting", credits_reward: 0.5 },
  { title: "Motivated Lighting Setups", description: "Make film lights look natural", prompt: "Set up a scene where your artificial lighting appears to come from a visible source in the frame (a lamp, window, TV). The audience should believe the practical source is doing the work.", difficulty: "advanced", category: "lighting", credits_reward: 1.5 },
  { title: "Light Painting", description: "Draw with light in long exposure", prompt: "Use a long exposure and a moving light source (flashlight, sparkler, phone screen) to paint patterns or shapes in the air. Share the final image and describe your technique.", difficulty: "intermediate", category: "lighting", credits_reward: 1 },
  { title: "Dappled Light Through Foliage", description: "Harness nature's diffuser", prompt: "Find sunlight filtering through trees or plants to create dappled light patterns on your subject. Capture the organic, textured quality of natural diffusion.", difficulty: "beginner", category: "lighting", credits_reward: 0.5 },

  // COMPOSITION (20)
  { title: "Leading Lines in Architecture", description: "Guide the eye through geometry", prompt: "Find architectural elements — hallways, staircases, bridges, roads — that create strong leading lines directing the viewer's eye toward a subject or vanishing point. Share your strongest composition.", difficulty: "beginner", category: "composition", credits_reward: 0.5 },
  { title: "Rule of Thirds Breakout", description: "Place your subject off-center", prompt: "Compose a shot placing your main subject precisely on one of the rule-of-thirds intersection points. Then shoot the same subject centered. Compare both and explain which works better and why.", difficulty: "beginner", category: "composition", credits_reward: 0.5 },
  { title: "Symmetry Hunt", description: "Find perfect balance", prompt: "Seek out symmetrical compositions in your environment — reflections, architecture, nature. Capture at least two examples of near-perfect symmetry and share them.", difficulty: "beginner", category: "composition", credits_reward: 0.5 },
  { title: "Negative Space Portraits", description: "Let emptiness speak", prompt: "Compose a portrait where your subject occupies less than a third of the frame, surrounded by negative space. The emptiness should add meaning — isolation, freedom, contemplation.", difficulty: "intermediate", category: "composition", credits_reward: 1 },
  { title: "Depth Layering", description: "Build foreground, mid, and background", prompt: "Create a composition with clear foreground, middle ground, and background elements. Each layer should add depth and dimension to the image. Annotate your layers.", difficulty: "intermediate", category: "composition", credits_reward: 1 },
  { title: "Dutch Angle Tension", description: "Tilt the world off-balance", prompt: "Shoot a scene using a dutch angle (tilted camera) to create unease, energy, or disorientation. Be intentional — explain what emotion the tilt serves in your scene.", difficulty: "intermediate", category: "composition", credits_reward: 1 },
  { title: "Bird's Eye Flat Lay", description: "See the world from above", prompt: "Shoot directly downward at a carefully arranged scene — a desk, a meal, a collection of objects. The overhead perspective should reveal patterns or relationships invisible from eye level.", difficulty: "beginner", category: "composition", credits_reward: 0.5 },
  { title: "Worm's Eye Perspective", description: "Look up at the world", prompt: "Get as low as possible and shoot upward. This extreme low angle can make subjects appear powerful, towering, or surreal. Find a subject that benefits from this perspective.", difficulty: "beginner", category: "composition", credits_reward: 0.5 },
  { title: "Frame Within a Frame", description: "Use elements to create borders", prompt: "Use doorways, windows, arches, branches, or other elements to create a frame within your camera frame, drawing attention to your subject. Share your most creative framing.", difficulty: "intermediate", category: "composition", credits_reward: 1 },
  { title: "Diagonal Dominance", description: "Create dynamic energy", prompt: "Compose a shot where the dominant visual element runs diagonally across the frame. Diagonals create energy and movement — explain how yours contributes to the image's feel.", difficulty: "intermediate", category: "composition", credits_reward: 1 },
  { title: "Centered Composition Power", description: "Break the rules with purpose", prompt: "Place your subject dead center in the frame. Centered compositions can feel static or powerful — make yours feel intentional and commanding. Explain your choice.", difficulty: "beginner", category: "composition", credits_reward: 0.5 },
  { title: "Pattern and Repetition", description: "Find rhythm in the visual world", prompt: "Find a naturally occurring pattern — tiles, windows, trees, people — and compose a shot that emphasizes the repetition. Bonus: break the pattern with one element.", difficulty: "beginner", category: "composition", credits_reward: 0.5 },
  { title: "Juxtaposition Pairs", description: "Place opposites side by side", prompt: "Find and photograph a visual juxtaposition — old/new, big/small, natural/artificial, chaos/order. The contrast should tell a story or provoke thought.", difficulty: "intermediate", category: "composition", credits_reward: 1 },
  { title: "Texture Close-Ups", description: "Get intimate with surfaces", prompt: "Get extremely close to a textured surface — wood grain, fabric weave, rust, skin, stone. Fill the entire frame with texture. The composition should make the viewer want to touch the image.", difficulty: "beginner", category: "composition", credits_reward: 0.5 },
  { title: "Scale Contrast", description: "Play with size relationships", prompt: "Compose a shot that emphasizes the contrast between something very small and something very large — a person against a mountain, an ant on a shoe, a boat on the ocean.", difficulty: "intermediate", category: "composition", credits_reward: 1 },
  { title: "Golden Spiral", description: "Follow nature's composition guide", prompt: "Compose a shot that follows the golden spiral (Fibonacci spiral). Overlay the spiral on your image to show how the eye naturally travels through the composition.", difficulty: "advanced", category: "composition", credits_reward: 1.5 },
  { title: "Converging Lines", description: "Create powerful depth", prompt: "Find two or more lines that converge toward a single vanishing point — railroad tracks, roads, corridors. Place something meaningful at or near the convergence point.", difficulty: "beginner", category: "composition", credits_reward: 0.5 },
  { title: "Reflection Symmetry", description: "Double the visual impact", prompt: "Find a reflective surface — water, glass, mirrors, polished floors — and compose a shot that uses the reflection as a key compositional element. Play with what's real and what's reflected.", difficulty: "intermediate", category: "composition", credits_reward: 1 },
  { title: "Minimalist Compositions", description: "Less is more", prompt: "Create the most minimal composition you can — as few visual elements as possible while still telling a story or evoking an emotion. Every element in the frame must earn its place.", difficulty: "advanced", category: "composition", credits_reward: 1.5 },
  { title: "Crowded Frame Storytelling", description: "Fill every inch with meaning", prompt: "Fill the entire frame with visual information — people, objects, details. Unlike minimalism, every corner should have something to discover. Make the density purposeful.", difficulty: "advanced", category: "composition", credits_reward: 1.5 },

  // MOVEMENT (20)
  { title: "Smooth Tracking Walk-and-Talk", description: "Move with your subject", prompt: "Film a subject walking and talking while you track alongside them smoothly. Use a gimbal, steadicam, or practice your ninja walk. The movement should feel effortless and cinematic.", difficulty: "intermediate", category: "movement", credits_reward: 1 },
  { title: "Whip Pan Transition", description: "Snap between scenes", prompt: "Execute a whip pan — a rapid horizontal camera movement that blurs the frame — to transition between two scenes or subjects. The start and end should feel connected despite the speed.", difficulty: "intermediate", category: "movement", credits_reward: 1 },
  { title: "Dolly Zoom Effect", description: "Distort perspective dramatically", prompt: "Create a dolly zoom (Hitchcock zoom/Vertigo effect) by moving the camera toward your subject while zooming out, or vice versa. The background should stretch or compress while the subject stays the same size.", difficulty: "advanced", category: "movement", credits_reward: 1.5 },
  { title: "Handheld Energy Shot", description: "Let the camera breathe", prompt: "Film a scene handheld, letting the natural camera movement add energy, urgency, or intimacy. Don't fight the shake — use it intentionally. Explain what mood the handheld movement creates.", difficulty: "beginner", category: "movement", credits_reward: 0.5 },
  { title: "Reveal Push-In", description: "Move toward the moment", prompt: "Start wide and slowly push in toward your subject, revealing detail and emotion as you get closer. Time the push-in to a moment of realization, decision, or emotional peak.", difficulty: "intermediate", category: "movement", credits_reward: 1 },
  { title: "Pull-Back Reveal", description: "Start close, reveal the world", prompt: "Begin tight on a detail or face and slowly pull back to reveal the larger context — the environment, other characters, or a surprising setting. The reveal should change our understanding.", difficulty: "intermediate", category: "movement", credits_reward: 1 },
  { title: "Orbit Around Subject", description: "Circle to create dimension", prompt: "Orbit your camera around a stationary subject in a smooth circle (or partial arc). The changing perspective should reveal new dimensions of the subject or scene.", difficulty: "intermediate", category: "movement", credits_reward: 1 },
  { title: "Low-Angle Rolling Shot", description: "Ground-level movement", prompt: "Place your camera very low (on the ground or a low platform) and execute a smooth rolling or sliding movement. The low angle combined with movement creates a powerful, dramatic feel.", difficulty: "beginner", category: "movement", credits_reward: 0.5 },
  { title: "Staircase Ascending Shot", description: "Climb with the camera", prompt: "Film a smooth ascending movement up a staircase — following a character or as an independent camera move. Manage the elevation change while keeping the shot steady.", difficulty: "advanced", category: "movement", credits_reward: 1.5 },
  { title: "Follow-the-Action Pan", description: "Track movement across space", prompt: "Follow a moving subject (person, car, ball, bird) with a smooth pan, keeping them in frame as they move across the scene. The timing and speed should match perfectly.", difficulty: "beginner", category: "movement", credits_reward: 0.5 },
  { title: "Parallax Layering", description: "Create depth through movement", prompt: "Move your camera sideways past objects at different distances to create a parallax effect — near objects move fast, far objects move slow. Layer at least three depth planes.", difficulty: "advanced", category: "movement", credits_reward: 1.5 },
  { title: "Tilt Up Reveal", description: "Unveil from bottom to top", prompt: "Start at the bottom of a scene (feet, base of building, ground) and tilt up to reveal the full subject or an unexpected element at the top. Build anticipation with the tilt speed.", difficulty: "beginner", category: "movement", credits_reward: 0.5 },
  { title: "Crash Zoom", description: "Snap zoom for impact", prompt: "Execute a fast, punchy zoom in or out on a key moment — a reaction, an object, a reveal. The crash zoom should feel energetic and intentional, not accidental.", difficulty: "intermediate", category: "movement", credits_reward: 1 },
  { title: "Slow Creep Tension", description: "Build dread with subtle movement", prompt: "Move your camera very slowly — almost imperceptibly — toward or away from a subject to build tension. The audience should feel the movement subconsciously before they notice it consciously.", difficulty: "advanced", category: "movement", credits_reward: 1.5 },
  { title: "Timelapse with Movement", description: "Compress time with a moving camera", prompt: "Create a timelapse where the camera also moves slowly (hyperlapse). The combination of compressed time and spatial movement creates a dynamic, immersive result.", difficulty: "advanced", category: "movement", credits_reward: 1.5 },
  { title: "Rack Focus Pull", description: "Shift attention with focus", prompt: "In a single shot, shift focus from a foreground element to a background element (or vice versa). The rack focus should direct the viewer's attention and reveal new information.", difficulty: "intermediate", category: "movement", credits_reward: 1 },
  { title: "360-Degree Spin", description: "Complete rotation around subject", prompt: "Execute a full 360-degree rotation around your subject. Keep the subject centered and the movement smooth throughout the complete circle. Show us the full revolution.", difficulty: "advanced", category: "movement", credits_reward: 1.5 },
  { title: "Overhead Crane Simulation", description: "Rise above the scene", prompt: "Simulate a crane shot by starting at ground level and rising to an overhead view (use stairs, a balcony, or creative improvisation). The vertical movement should feel smooth and purposeful.", difficulty: "advanced", category: "movement", credits_reward: 1.5 },
  { title: "Running Alongside Subject", description: "Match energy and speed", prompt: "Run alongside a moving subject while keeping the shot as stable as possible. Match their speed and energy — the shared movement should create urgency and connection.", difficulty: "beginner", category: "movement", credits_reward: 0.5 },
  { title: "Stillness-to-Motion Contrast", description: "Let stillness amplify movement", prompt: "Start with a completely locked-off static shot, then introduce movement — either the subject moves, or the camera starts moving. The contrast between stillness and motion should be dramatic.", difficulty: "intermediate", category: "movement", credits_reward: 1 },

  // STORYTELLING (20)
  { title: "Character Intro in One Shot", description: "Define a person in a single frame", prompt: "Introduce a character in a single shot — no dialogue, no title cards. The frame should tell us who this person is, what they care about, and what world they inhabit. Every detail matters.", difficulty: "intermediate", category: "storytelling", credits_reward: 1 },
  { title: "Visual Metaphor Challenge", description: "Say it without saying it", prompt: "Create a visual metaphor — use imagery to represent an abstract concept (loneliness, hope, time, growth). Don't be literal. The metaphor should resonate emotionally, not just intellectually.", difficulty: "advanced", category: "storytelling", credits_reward: 1.5 },
  { title: "Montage Sequence", description: "Tell a story in 4 shots", prompt: "Create a mini montage of exactly 4 shots that tell a complete mini-story — beginning, development, climax, resolution. Each shot should flow naturally to the next.", difficulty: "intermediate", category: "storytelling", credits_reward: 1 },
  { title: "Establish-Reveal-React", description: "The three-beat structure", prompt: "Create a three-shot sequence: establish a situation, reveal something unexpected, show the reaction. This fundamental storytelling rhythm should feel complete and satisfying.", difficulty: "beginner", category: "storytelling", credits_reward: 0.5 },
  { title: "Subtext Through Objects", description: "Let props tell the story", prompt: "Tell a story using only objects — no people visible. A coffee cup, a phone, scattered papers, a wilted flower. The objects should imply what happened and how someone felt.", difficulty: "intermediate", category: "storytelling", credits_reward: 1 },
  { title: "Before-and-After Transformation", description: "Show change over time", prompt: "Capture a transformation — a space being cleaned, a meal being prepared, a person getting ready. The before and after should feel dramatically different. Two frames, one story.", difficulty: "beginner", category: "storytelling", credits_reward: 0.5 },
  { title: "Point-of-View Sequence", description: "See through someone's eyes", prompt: "Create a POV sequence — show what a character sees from their perspective. Include at least 3 shots that immerse us in their viewpoint. We should feel like we ARE this person.", difficulty: "intermediate", category: "storytelling", credits_reward: 1 },
  { title: "Emotional Close-Up Study", description: "Read the face like a landscape", prompt: "Capture a genuine emotional moment in extreme close-up — eyes, hands, mouth. The micro-expressions and subtle movements should convey deep feeling without any context needed.", difficulty: "intermediate", category: "storytelling", credits_reward: 1 },
  { title: "World-Building Establishing Shot", description: "Set the stage for a story", prompt: "Create a single establishing shot that builds an entire world — a place with history, atmosphere, and implied stories. The viewer should want to explore this world further.", difficulty: "beginner", category: "storytelling", credits_reward: 0.5 },
  { title: "Conflict in a Single Frame", description: "Capture tension in one image", prompt: "Compose a single frame that shows conflict — between people, between a person and their environment, between desires. The tension should be visible and unresolved.", difficulty: "advanced", category: "storytelling", credits_reward: 1.5 },
  { title: "Passage of Time in 3 Shots", description: "Show hours, days, or years passing", prompt: "Using exactly 3 shots, show the passage of time — could be minutes or years. Use visual cues (light changes, seasonal shifts, aging props) to make time tangible.", difficulty: "intermediate", category: "storytelling", credits_reward: 1 },
  { title: "Unreliable Perspective", description: "Mislead then reveal the truth", prompt: "Create a sequence that initially suggests one narrative, then reveals a different truth. Play with framing, focus, or editing to mislead the viewer before the reveal.", difficulty: "advanced", category: "storytelling", credits_reward: 1.5 },
  { title: "Comedy Timing Beat", description: "Nail the pause before the laugh", prompt: "Create a short comedic moment that relies on timing — the pause, the reaction, the unexpected. Film at least three takes and share the one with the best timing.", difficulty: "intermediate", category: "storytelling", credits_reward: 1 },
  { title: "Suspense Through Pacing", description: "Make the audience hold their breath", prompt: "Build suspense in a short sequence using pacing — slow movement, held shots, delayed reveals. The viewer should feel tension building even if nothing overtly threatening happens.", difficulty: "advanced", category: "storytelling", credits_reward: 1.5 },
  { title: "Found-Footage Style", description: "Make fiction feel like reality", prompt: "Shoot a short scene in found-footage style — make it feel like real, discovered video. Use the constraints of the style (limited angles, 'accidental' framing) to increase authenticity.", difficulty: "beginner", category: "storytelling", credits_reward: 0.5 },
  { title: "Documentary Interview Setup", description: "Frame truth beautifully", prompt: "Set up and shoot a short documentary-style interview (even if the content is scripted). Focus on framing, eye-line, background selection, and lighting that serves the subject's story.", difficulty: "beginner", category: "storytelling", credits_reward: 0.5 },
  { title: "Dream Sequence Aesthetic", description: "Visualize the subconscious", prompt: "Create 2-3 shots that feel dreamlike — use soft focus, unusual angles, slow motion, overexposure, or other techniques to create an otherworldly, subconscious atmosphere.", difficulty: "advanced", category: "storytelling", credits_reward: 1.5 },
  { title: "Flashback Transition", description: "Bridge past and present", prompt: "Create a transition from 'present' to 'flashback' — use a visual or audio cue to signal the time shift. The transition should be smooth and the time periods should feel visually distinct.", difficulty: "intermediate", category: "storytelling", credits_reward: 1 },
  { title: "Environmental Storytelling", description: "Let the space narrate", prompt: "Film an empty space that tells a story — a recently vacated room, an abandoned workspace, a park bench. The environment should imply characters and events without showing anyone.", difficulty: "beginner", category: "storytelling", credits_reward: 0.5 },
  { title: "Silent Dialogue Scene", description: "Communicate without words", prompt: "Film a scene between two people who communicate entirely without dialogue — through glances, gestures, posture, and facial expressions. We should understand the conversation perfectly.", difficulty: "advanced", category: "storytelling", credits_reward: 1.5 },

  // GENERAL (20)
  { title: "Behind-the-Scenes of Your Setup", description: "Show your process", prompt: "Document your filmmaking setup — your gear, your workspace, your process. Show us how you prepare to shoot. The BTS should be as well-crafted as the work it documents.", difficulty: "beginner", category: "general", credits_reward: 0.5 },
  { title: "Recreate a Famous Film Frame", description: "Study the masters through imitation", prompt: "Pick an iconic frame from a famous film and recreate it as closely as possible with what you have available. Share the original alongside your recreation and note what you learned.", difficulty: "intermediate", category: "general", credits_reward: 1 },
  { title: "Sound Design Focus", description: "Listen before you look", prompt: "Record a 30-60 second clip where sound design is the star — foley, ambient sound, layered audio. The visuals can be simple; the audio should be rich, detailed, and immersive.", difficulty: "intermediate", category: "general", credits_reward: 1 },
  { title: "Color Grading Before/After", description: "Transform the mood in post", prompt: "Take a raw clip and create two dramatically different color grades. Show the before (raw) and both after versions. Explain how each grade changes the mood and genre feel.", difficulty: "intermediate", category: "general", credits_reward: 1 },
  { title: "Storyboard to Screen", description: "Plan then execute", prompt: "Draw a simple storyboard (stick figures are fine) for a 3-5 shot sequence, then film it. Share the storyboard alongside the final footage. How close did you get to your vision?", difficulty: "beginner", category: "general", credits_reward: 0.5 },
  { title: "Location Scout Documentation", description: "Find your perfect set", prompt: "Scout a location as if prepping for a real production — photograph it from multiple angles, note the light at different times, identify power sources and sound issues. Present your scout report.", difficulty: "beginner", category: "general", credits_reward: 0.5 },
  { title: "Prop Styling for Camera", description: "Make objects camera-ready", prompt: "Select 3-5 props and style them for camera — arrange, light, and shoot them so they look better on screen than in real life. Share your styling process and final frames.", difficulty: "beginner", category: "general", credits_reward: 0.5 },
  { title: "Continuity Challenge", description: "Master the match cut", prompt: "Film a sequence of at least 4 shots with perfect continuity — matching eyelines, prop positions, lighting, and action across cuts. Then share a 'spot the error' version with one intentional mistake.", difficulty: "advanced", category: "general", credits_reward: 1.5 },
  { title: "Aspect Ratio Experiment", description: "How shape changes story", prompt: "Film the same scene in three different aspect ratios (e.g., 16:9, 2.39:1, 4:3 or 1:1). Share all three and explain how the shape of the frame changes the feel and what information is included/excluded.", difficulty: "intermediate", category: "general", credits_reward: 1 },
  { title: "Genre Swap", description: "Same scene, different genre", prompt: "Film the same basic scene (someone entering a room, opening a door, etc.) in two completely different genres — comedy and horror, romance and thriller, etc. Same action, different everything else.", difficulty: "advanced", category: "general", credits_reward: 1.5 },
  { title: "Title Card Design", description: "Set the tone before the story begins", prompt: "Design and film a title card or opening title sequence for an imaginary film. The typography, animation, and style should set the tone and genre before a single story frame appears.", difficulty: "intermediate", category: "general", credits_reward: 1 },
  { title: "End Credits Sequence", description: "Leave them with a feeling", prompt: "Create a short end credits sequence — it could feature behind-the-scenes footage, artistic shots, or creative typography. The credits should leave the viewer with a specific emotional aftertaste.", difficulty: "intermediate", category: "general", credits_reward: 1 },
  { title: "Film Poster Still", description: "One image to sell a story", prompt: "Create a single photographic image that could serve as a film poster — it should suggest genre, mood, and story in one compelling frame. Include the imaginary film's title.", difficulty: "beginner", category: "general", credits_reward: 0.5 },
  { title: "Production Design on a Budget", description: "Build a world with nothing", prompt: "Transform a mundane space into a believable set using only items you already own. A bedroom becomes a detective's office, a kitchen becomes a lab. Show before and after.", difficulty: "intermediate", category: "general", credits_reward: 1 },
  { title: "Casting & Direction Exercise", description: "Direct a non-actor", prompt: "Direct someone who isn't an actor (friend, family member) in a simple scene. Focus on giving clear, kind direction to get a genuine performance. Share the result and your direction notes.", difficulty: "beginner", category: "general", credits_reward: 0.5 },
  { title: "Phone Gimbal Breakout", description: "Unlock your stabilizer's potential", prompt: "If you have a phone gimbal/stabilizer, try three different movement modes — follow, lock, and POV. If you don't have one, practice three handheld stabilization techniques. Share your smoothest shot.", difficulty: "beginner", category: "general", credits_reward: 0.5 },
  { title: "Weather as Character", description: "Let the elements tell the story", prompt: "Use the current weather — rain, wind, sun, fog, snow — as a central character in your shot. Don't fight the conditions; make them the star. The weather should define the mood.", difficulty: "beginner", category: "general", credits_reward: 0.5 },
  { title: "Food Cinematography", description: "Make it look delicious", prompt: "Film food in the most appetizing way possible — steam, texture, color, plating. Use techniques from food commercials: close-ups, slow motion, dramatic lighting. Make viewers hungry.", difficulty: "intermediate", category: "general", credits_reward: 1 },
  { title: "Pet & Animal Filming", description: "Direct the uncontrollable", prompt: "Film an animal (pet, bird, insect) in a visually compelling way. Animals don't take direction, so you'll need patience, the right lens, and the ability to anticipate behavior.", difficulty: "intermediate", category: "general", credits_reward: 1 },
  { title: "Collaborative Challenge", description: "Create together", prompt: "Partner with another student or friend to create a short collaborative piece — each person shoots half the shots, then combine them into a cohesive sequence. Tag your collaborator!", difficulty: "advanced", category: "general", credits_reward: 1.5 },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let startDate = "2026-02-13";
    try {
      const body = await req.json();
      if (body?.start_date) startDate = body.start_date;
    } catch {}

    // Get existing challenge dates to skip
    const { data: existing } = await supabaseAdmin
      .from("daily_challenges")
      .select("active_date");
    const existingDates = new Set((existing || []).map((c: any) => c.active_date));

    const toInsert = [];
    let currentDate = new Date(startDate + "T00:00:00Z");

    for (const ch of challenges) {
      // Skip forward if date already has a challenge
      while (existingDates.has(currentDate.toISOString().split("T")[0])) {
        currentDate.setUTCDate(currentDate.getUTCDate() + 3);
      }

      const activeDate = currentDate.toISOString().split("T")[0];
      const endDateObj = new Date(currentDate);
      endDateObj.setUTCDate(endDateObj.getUTCDate() + 2);
      const endDate = endDateObj.toISOString().split("T")[0];

      toInsert.push({
        title: ch.title,
        description: ch.description,
        prompt: ch.prompt,
        difficulty: ch.difficulty,
        category: ch.category,
        credits_reward: ch.credits_reward,
        active_date: activeDate,
        end_date: endDate,
        is_active: true,
      });

      // Next challenge starts day after end_date
      currentDate.setUTCDate(currentDate.getUTCDate() + 3);
    }

    // Insert in batches of 50
    let inserted = 0;
    for (let i = 0; i < toInsert.length; i += 50) {
      const batch = toInsert.slice(i, i + 50);
      const { error } = await supabaseAdmin
        .from("daily_challenges")
        .insert(batch);
      if (error) throw error;
      inserted += batch.length;
    }

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        date_range: `${toInsert[0]?.active_date} to ${toInsert[toInsert.length - 1]?.end_date}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
