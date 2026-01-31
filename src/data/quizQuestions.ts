export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
}

export interface QuizData {
  quizId: string;
  questions: QuizQuestion[];
}

// Quiz questions organized by quiz ID
export const quizQuestions: Record<string, QuizQuestion[]> = {
  // HU-101: iPhone Cinematography Fundamentals
  "hu101-q1": [
    {
      id: "hu101-q1-1",
      question: "What is the recommended frame rate for cinematic footage on iPhone?",
      options: ["30fps", "24fps", "60fps", "120fps"],
      correctAnswer: 1,
      explanation: "24fps is the standard cinematic frame rate, giving footage that classic film look."
    },
    {
      id: "hu101-q1-2",
      question: "Which iPhone camera setting controls the amount of light entering the lens?",
      options: ["ISO", "Shutter Speed", "Exposure", "White Balance"],
      correctAnswer: 2,
      explanation: "Exposure controls overall brightness by adjusting how much light the sensor captures."
    },
    {
      id: "hu101-q1-3",
      question: "What does 4K resolution refer to?",
      options: ["4000 frames per second", "Approximately 4000 pixels wide", "4 gigabytes of storage", "4 camera lenses"],
      correctAnswer: 1,
      explanation: "4K refers to horizontal resolution of approximately 4000 pixels (3840x2160)."
    },
    {
      id: "hu101-q1-4",
      question: "Which setting should you lock to prevent focus hunting during a shot?",
      options: ["Exposure Lock", "Auto Focus", "Focus Lock (AE/AF)", "HDR Mode"],
      correctAnswer: 2,
      explanation: "Locking AE/AF prevents the camera from constantly refocusing during recording."
    },
    {
      id: "hu101-q1-5",
      question: "What file format provides the most flexibility for color grading on iPhone?",
      options: ["HEVC", "ProRes", "H.264", "JPEG"],
      correctAnswer: 1,
      explanation: "ProRes offers higher bit depth and less compression, ideal for color grading."
    },
  ],
  "hu101-q2": [
    {
      id: "hu101-q2-1",
      question: "What is the primary purpose of a gimbal?",
      options: ["Increase zoom", "Stabilize footage", "Add filters", "Record audio"],
      correctAnswer: 1,
      explanation: "Gimbals use motors to counteract hand movements and keep footage smooth."
    },
    {
      id: "hu101-q2-2",
      question: "Which stabilization technique uses your body as a natural shock absorber?",
      options: ["Tripod stance", "Ninja walk", "Running motion", "Jump cuts"],
      correctAnswer: 1,
      explanation: "The ninja walk involves bending knees and taking smooth, deliberate steps."
    },
    {
      id: "hu101-q2-3",
      question: "What household item can serve as a DIY stabilizer?",
      options: ["Rubber band", "String with weight", "Pillow", "Mirror"],
      correctAnswer: 1,
      explanation: "A string rig uses tension to create stability when pulled taut."
    },
    {
      id: "hu101-q2-4",
      question: "Electronic Image Stabilization (EIS) works by:",
      options: ["Moving the lens", "Cropping and shifting the image", "Adding blur", "Slowing frame rate"],
      correctAnswer: 1,
      explanation: "EIS digitally crops and shifts the frame to compensate for movement."
    },
    {
      id: "hu101-q2-5",
      question: "What is the downside of heavy stabilization in post-production?",
      options: ["File size increases", "Colors shift", "Frame is cropped, reducing resolution", "Audio is affected"],
      correctAnswer: 2,
      explanation: "Post-stabilization crops the frame to allow room for adjustment, losing pixels."
    },
  ],
  "hu101-q3": [
    {
      id: "hu101-q3-1",
      question: "The Rule of Thirds divides the frame into how many equal parts?",
      options: ["4", "6", "9", "12"],
      correctAnswer: 2,
      explanation: "The Rule of Thirds creates a 3x3 grid, dividing the frame into 9 sections."
    },
    {
      id: "hu101-q3-2",
      question: "Where should you typically place a subject's eyes in a well-composed shot?",
      options: ["Center of frame", "Bottom third", "Upper third intersection", "Edge of frame"],
      correctAnswer: 2,
      explanation: "Eyes on the upper third line creates natural, visually pleasing composition."
    },
    {
      id: "hu101-q3-3",
      question: "Leading lines in composition help to:",
      options: ["Add brightness", "Guide the viewer's eye through the frame", "Create blur", "Increase contrast"],
      correctAnswer: 1,
      explanation: "Leading lines draw attention and create depth by guiding the eye to the subject."
    },
    {
      id: "hu101-q3-4",
      question: "What is negative space in composition?",
      options: ["Dark shadows", "Empty areas around the subject", "Out of focus areas", "The background"],
      correctAnswer: 1,
      explanation: "Negative space is the empty area that gives the subject room to breathe."
    },
    {
      id: "hu101-q3-5",
      question: "Framing within a frame means:",
      options: ["Using picture frames as props", "Using elements in the scene to frame your subject", "Adding borders in post", "Double exposure"],
      correctAnswer: 1,
      explanation: "Natural frames like doorways or windows add depth and focus attention."
    },
  ],
  "hu101-final": [
    {
      id: "hu101-f-1",
      question: "What is the standard aspect ratio for cinematic widescreen?",
      options: ["4:3", "16:9", "2.39:1", "1:1"],
      correctAnswer: 2,
      explanation: "2.39:1 (or 2.35:1) is the anamorphic widescreen ratio used in cinema."
    },
    {
      id: "hu101-f-2",
      question: "Which iPhone feature helps maintain consistent color temperature?",
      options: ["Portrait Mode", "White Balance Lock", "Night Mode", "Burst Mode"],
      correctAnswer: 1,
      explanation: "Locking white balance prevents color shifts when lighting conditions change."
    },
    {
      id: "hu101-f-3",
      question: "What does ISO control in camera settings?",
      options: ["Focus distance", "Sensor sensitivity to light", "Frame rate", "Resolution"],
      correctAnswer: 1,
      explanation: "ISO adjusts how sensitive the sensor is to light, affecting brightness and noise."
    },
    {
      id: "hu101-f-4",
      question: "A dolly zoom (Vertigo effect) combines which two movements?",
      options: ["Pan and tilt", "Zoom and physical camera movement", "Roll and zoom", "Focus pull and pan"],
      correctAnswer: 1,
      explanation: "The dolly zoom moves the camera while zooming opposite to create disorientation."
    },
    {
      id: "hu101-f-5",
      question: "What is the '180-degree rule' in cinematography?",
      options: ["Never rotate the camera more than 180 degrees", "Keep cameras on one side of an imaginary line", "Always use 180-degree shutter angle", "Subjects should face within 180 degrees of camera"],
      correctAnswer: 1,
      explanation: "The 180-degree rule maintains consistent screen direction between shots."
    },
    {
      id: "hu101-f-6",
      question: "Shutter speed for cinematic motion blur at 24fps should be:",
      options: ["1/24", "1/48", "1/120", "1/500"],
      correctAnswer: 1,
      explanation: "The 180-degree shutter rule: shutter speed should be double the frame rate."
    },
    {
      id: "hu101-f-7",
      question: "What is 'headroom' in framing?",
      options: ["Space for a boom mic", "Space above the subject's head", "Audio levels", "Storage space"],
      correctAnswer: 1,
      explanation: "Headroom is the space between the top of a subject's head and the frame edge."
    },
    {
      id: "hu101-f-8",
      question: "Which app gives manual control over iPhone camera settings?",
      options: ["Photos", "FaceTime", "Filmic Pro or Blackmagic Camera", "iMovie"],
      correctAnswer: 2,
      explanation: "Third-party apps like Filmic Pro provide full manual camera controls."
    },
    {
      id: "hu101-f-9",
      question: "A motivated camera movement is one that:",
      options: ["Is very fast", "Has a clear reason related to the story", "Uses expensive equipment", "Follows the director's storyboard"],
      correctAnswer: 1,
      explanation: "Motivated movements serve the narrative, following action or revealing information."
    },
    {
      id: "hu101-f-10",
      question: "What is the purpose of an ND (Neutral Density) filter?",
      options: ["Add color effects", "Reduce light entering the lens", "Increase sharpness", "Add lens flares"],
      correctAnswer: 1,
      explanation: "ND filters reduce light, allowing proper exposure with wider apertures outdoors."
    },
    {
      id: "hu101-f-11",
      question: "Rack focus is a technique that:",
      options: ["Uses a focus rack accessory", "Shifts focus between subjects at different distances", "Keeps everything in focus", "Blurs the entire image"],
      correctAnswer: 1,
      explanation: "Rack focus shifts the focus plane to direct attention between subjects."
    },
    {
      id: "hu101-f-12",
      question: "What does 'coverage' mean in filmmaking?",
      options: ["Insurance for equipment", "Shooting a scene from multiple angles", "How much of the script is filmed", "Area the camera can see"],
      correctAnswer: 1,
      explanation: "Coverage ensures editors have multiple angles to cut between."
    },
    {
      id: "hu101-f-13",
      question: "A Dutch angle shot is characterized by:",
      options: ["Filming in the Netherlands", "A tilted horizon line", "Extreme close-up", "Slow motion"],
      correctAnswer: 1,
      explanation: "Dutch angles tilt the camera to create tension or disorientation."
    },
    {
      id: "hu101-f-14",
      question: "What is the benefit of shooting in LOG or flat picture profiles?",
      options: ["Files are smaller", "More dynamic range for color grading", "Instant cinematic look", "Better audio quality"],
      correctAnswer: 1,
      explanation: "LOG profiles preserve highlight and shadow detail for post-production."
    },
    {
      id: "hu101-f-15",
      question: "Eye trace refers to:",
      options: ["Recording eye movements", "Where viewers naturally look in a frame", "The iris of the camera", "Focus tracking"],
      correctAnswer: 1,
      explanation: "Understanding eye trace helps compose shots that guide viewer attention."
    },
    {
      id: "hu101-f-16",
      question: "What makes a shot 'coverage' versus a 'master shot'?",
      options: ["Coverage is wider", "Master captures the whole scene; coverage provides alternate angles", "They are the same", "Master is handheld"],
      correctAnswer: 1,
      explanation: "The master establishes the scene; coverage provides editing options."
    },
    {
      id: "hu101-f-17",
      question: "The best way to ensure smooth handheld footage is:",
      options: ["Hold your breath", "Tuck elbows into your body and move smoothly", "Use maximum zoom", "Enable flash"],
      correctAnswer: 1,
      explanation: "Body positioning and deliberate movement create more stable handheld shots."
    },
    {
      id: "hu101-f-18",
      question: "What is the 'golden hour' in cinematography?",
      options: ["The most expensive hour of shooting", "The hour after sunrise or before sunset", "60 minutes of continuous recording", "Peak viewership time"],
      correctAnswer: 1,
      explanation: "Golden hour provides warm, soft, directional light ideal for cinematic shots."
    },
    {
      id: "hu101-f-19",
      question: "A whip pan is used to:",
      options: ["Clean the lens", "Create a fast transition between scenes", "Slowly reveal a location", "Focus on small details"],
      correctAnswer: 1,
      explanation: "Whip pans create energy and can be used as dynamic transitions."
    },
    {
      id: "hu101-f-20",
      question: "What should you always check before pressing record?",
      options: ["Social media", "Focus, exposure, framing, and audio levels", "The weather forecast", "Your schedule"],
      correctAnswer: 1,
      explanation: "A pre-roll check ensures technical settings are correct before capturing."
    },
  ],

  // HU-102: Lighting for Mobile Film
  "hu102-q1": [
    {
      id: "hu102-q1-1",
      question: "What is color temperature measured in?",
      options: ["Lumens", "Kelvin", "Watts", "Degrees Celsius"],
      correctAnswer: 1,
      explanation: "Color temperature is measured in Kelvin (K), ranging from warm (2700K) to cool (6500K+)."
    },
    {
      id: "hu102-q1-2",
      question: "Daylight typically has a color temperature of approximately:",
      options: ["2700K", "3200K", "5600K", "8000K"],
      correctAnswer: 2,
      explanation: "Daylight is approximately 5600K, which appears neutral white."
    },
    {
      id: "hu102-q1-3",
      question: "What does 'hard light' create?",
      options: ["Soft, gradual shadows", "Sharp, defined shadows", "No shadows", "Colored shadows"],
      correctAnswer: 1,
      explanation: "Hard light from small or distant sources creates sharp, defined shadow edges."
    },
    {
      id: "hu102-q1-4",
      question: "What is the inverse square law in lighting?",
      options: ["Light doubles every 2 feet", "Light intensity decreases by the square of the distance", "Two lights equal one", "Square lights are best"],
      correctAnswer: 1,
      explanation: "Doubling distance reduces light intensity to 1/4, tripling to 1/9, etc."
    },
    {
      id: "hu102-q1-5",
      question: "Which type of light source produces soft, flattering light?",
      options: ["Small and far away", "Large and close to subject", "Colored lights", "Direct sunlight"],
      correctAnswer: 1,
      explanation: "Large, close light sources create soft, wrapping light with gradual shadow falloff."
    },
    {
      id: "hu102-q1-6",
      question: "What is the CRI rating of a light?",
      options: ["Color Rendering Index - accuracy of color reproduction", "Camera Ready Illumination", "Continuous Recording Intensity", "Color Range Indicator"],
      correctAnswer: 0,
      explanation: "CRI measures how accurately a light source renders colors compared to natural light."
    },
  ],
  "hu102-q2": [
    {
      id: "hu102-q2-1",
      question: "During golden hour, sunlight appears:",
      options: ["Blue and harsh", "Warm and soft", "Pure white", "Green-tinted"],
      correctAnswer: 1,
      explanation: "Golden hour light is warm (around 3000K) and soft due to the sun's low angle."
    },
    {
      id: "hu102-q2-2",
      question: "Window light is typically what type of light?",
      options: ["Hard directional", "Soft diffused", "Colored", "Pulsing"],
      correctAnswer: 1,
      explanation: "Windows act as large diffused sources, creating soft, beautiful light."
    },
    {
      id: "hu102-q2-3",
      question: "To reduce harsh shadows from midday sun, you can use:",
      options: ["More direct sunlight", "A diffusion panel or reflector", "A smaller aperture only", "Night mode"],
      correctAnswer: 1,
      explanation: "Diffusion softens direct sunlight; reflectors fill in shadows."
    },
    {
      id: "hu102-q2-4",
      question: "Open shade provides what kind of lighting?",
      options: ["Direct and harsh", "Soft, even, and slightly cool", "Warm and contrasty", "Flickering"],
      correctAnswer: 1,
      explanation: "Open shade is lit by the sky, providing soft, even light with a slightly cool tone."
    },
    {
      id: "hu102-q2-5",
      question: "What is 'blue hour'?",
      options: ["When you feel sad", "The hour after sunset with cool blue light", "Using blue gels", "Underwater filming"],
      correctAnswer: 1,
      explanation: "Blue hour occurs after sunset when the sky provides soft, blue ambient light."
    },
    {
      id: "hu102-q2-6",
      question: "Backlighting from the sun can create:",
      options: ["Flat, even lighting", "Silhouettes and rim light", "No shadows", "Indoor lighting effect"],
      correctAnswer: 1,
      explanation: "Sun behind the subject creates silhouettes or beautiful rim/hair light."
    },
    {
      id: "hu102-q2-7",
      question: "To shoot in harsh sunlight, position your subject:",
      options: ["Facing directly into the sun", "With the sun behind them, using fill", "In deep shadow only", "Only at noon"],
      correctAnswer: 1,
      explanation: "Backlighting with fill creates flattering light even in harsh conditions."
    },
    {
      id: "hu102-q2-8",
      question: "Cloud cover acts as a natural:",
      options: ["Darkener", "Diffuser", "Color changer", "Reflector"],
      correctAnswer: 1,
      explanation: "Clouds diffuse sunlight, creating soft, even lighting across the scene."
    },
  ],

  // HU-103: Editing Fundamentals
  "hu103-q1": [
    {
      id: "hu103-q1-1",
      question: "What is a 'jump cut'?",
      options: ["A cut that moves the camera location", "An abrupt cut within the same shot", "A transition with a jumping animation", "Cutting on action"],
      correctAnswer: 1,
      explanation: "Jump cuts remove portions of a continuous shot, creating a jarring time skip."
    },
    {
      id: "hu103-q1-2",
      question: "A 'match cut' connects two shots by:",
      options: ["Using the same actor", "Matching visual elements, movement, or shapes", "Using the same audio", "Being the same length"],
      correctAnswer: 1,
      explanation: "Match cuts create visual continuity by linking similar shapes or movements."
    },
    {
      id: "hu103-q1-3",
      question: "What is the purpose of a 'cutaway' shot?",
      options: ["To end a scene", "To show related detail and hide edits", "To introduce a character", "To add music"],
      correctAnswer: 1,
      explanation: "Cutaways provide context and allow seamless editing of the main footage."
    },
    {
      id: "hu103-q1-4",
      question: "An 'L-cut' is when:",
      options: ["The cut forms an L shape on screen", "Audio from the next shot starts before the video", "Video from the next shot starts before audio", "Two shots overlap"],
      correctAnswer: 1,
      explanation: "L-cuts extend audio into the next shot, creating smooth transitions."
    },
    {
      id: "hu103-q1-5",
      question: "What is 'cutting on action'?",
      options: ["Only editing action movies", "Cutting during movement to hide the edit", "Cutting to a different action", "Adding action effects"],
      correctAnswer: 1,
      explanation: "Cutting during movement makes edits invisible as viewers focus on the action."
    },
    {
      id: "hu103-q1-6",
      question: "A 'J-cut' is when:",
      options: ["Video from the next shot starts before its audio", "Audio from the next shot starts before the video", "The cuts form a J pattern", "Audio is removed"],
      correctAnswer: 0,
      explanation: "J-cuts show the next shot while previous audio continues, often used for reveals."
    },
  ],

  // HU-105: Visual Storytelling Basics
  "hu105-q1": [
    {
      id: "hu105-q1-1",
      question: "The three-act structure consists of:",
      options: ["Beginning, Middle, End", "Setup, Confrontation, Resolution", "Scene, Sequence, Story", "Character, Conflict, Conclusion"],
      correctAnswer: 1,
      explanation: "The three acts are Setup (establishing), Confrontation (conflict), and Resolution."
    },
    {
      id: "hu105-q1-2",
      question: "What is the 'inciting incident'?",
      options: ["The opening shot", "The event that starts the main conflict", "The climax", "The ending"],
      correctAnswer: 1,
      explanation: "The inciting incident disrupts the protagonist's normal life and launches the story."
    },
    {
      id: "hu105-q1-3",
      question: "Show, don't tell means:",
      options: ["Never use dialogue", "Reveal information through visuals rather than exposition", "Show all footage", "Tell the story backwards"],
      correctAnswer: 1,
      explanation: "Visual storytelling communicates through images, actions, and subtext."
    },
    {
      id: "hu105-q1-4",
      question: "What is subtext?",
      options: ["Subtitles", "The underlying meaning beneath dialogue and action", "Background text", "The script"],
      correctAnswer: 1,
      explanation: "Subtext is the unspoken meaning that adds depth to scenes and characters."
    },
    {
      id: "hu105-q1-5",
      question: "A 'plant and payoff' is:",
      options: ["A gardening scene", "Introducing an element early that becomes important later", "The opening and closing shots", "Camera placement"],
      correctAnswer: 1,
      explanation: "Plants set up expectations; payoffs deliver on them, creating satisfying storytelling."
    },
    {
      id: "hu105-q1-6",
      question: "What makes a protagonist compelling?",
      options: ["Being perfect", "Having clear goals, flaws, and growth potential", "Always winning", "Narrating everything"],
      correctAnswer: 1,
      explanation: "Compelling protagonists have clear desires, relatable flaws, and room to grow."
    },
  ],
};

export const getQuizQuestions = (quizId: string): QuizQuestion[] => {
  return quizQuestions[quizId] || [];
};

export const calculateScore = (answers: Record<string, number>, questions: QuizQuestion[]): number => {
  let correct = 0;
  questions.forEach((q) => {
    if (answers[q.id] === q.correctAnswer) {
      correct++;
    }
  });
  return Math.round((correct / questions.length) * 100);
};
