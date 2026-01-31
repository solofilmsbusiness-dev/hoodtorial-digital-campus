import { QuizQuestion } from '../quizQuestions';

// HU-101: iPhone Cinematography Fundamentals
export const hu101Questions: Record<string, QuizQuestion[]> = {
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
};

// HU-102: Lighting for Mobile Film
export const hu102Questions: Record<string, QuizQuestion[]> = {
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
  ],
  "hu102-q3": [
    {
      id: "hu102-q3-1",
      question: "What are the three components of three-point lighting?",
      options: ["Top, bottom, side", "Key, fill, backlight", "Red, green, blue", "Soft, medium, hard"],
      correctAnswer: 1,
      explanation: "Three-point lighting uses a key light, fill light, and backlight for dimension."
    },
    {
      id: "hu102-q3-2",
      question: "What is the purpose of a fill light?",
      options: ["Create the main shadows", "Reduce shadow intensity", "Add color", "Create rim lighting"],
      correctAnswer: 1,
      explanation: "Fill light softens shadows created by the key light without eliminating them."
    },
    {
      id: "hu102-q3-3",
      question: "A reflector can be used to:",
      options: ["Create hard shadows", "Bounce light into shadow areas", "Change color temperature dramatically", "Block all light"],
      correctAnswer: 1,
      explanation: "Reflectors bounce existing light to fill shadows and add dimension."
    },
    {
      id: "hu102-q3-4",
      question: "What is a practical light in filmmaking?",
      options: ["A light that's easy to use", "A visible light source within the scene", "The most expensive light", "A backup light"],
      correctAnswer: 1,
      explanation: "Practicals are light sources visible in the frame, like lamps or candles."
    },
    {
      id: "hu102-q3-5",
      question: "Diffusion material is used to:",
      options: ["Intensify light", "Soften and spread light", "Block light completely", "Change light color"],
      correctAnswer: 1,
      explanation: "Diffusion spreads light rays, creating softer shadows and more even illumination."
    },
  ],
  "hu102-final": [
    {
      id: "hu102-f-1",
      question: "What color temperature is tungsten/incandescent light?",
      options: ["3200K", "5600K", "6500K", "2000K"],
      correctAnswer: 0,
      explanation: "Tungsten light is approximately 3200K, appearing warm/orange."
    },
    {
      id: "hu102-f-2",
      question: "The key light is typically positioned:",
      options: ["Directly behind the subject", "At 45 degrees to one side of the camera", "Directly below the subject", "As far away as possible"],
      correctAnswer: 1,
      explanation: "The key light at 45 degrees creates dimensionality and natural-looking shadows."
    },
    {
      id: "hu102-f-3",
      question: "What is the lighting ratio?",
      options: ["The number of lights used", "The relationship between key and fill light intensity", "The color of the lights", "The height of the lights"],
      correctAnswer: 1,
      explanation: "Lighting ratio describes the contrast between lit and shadow sides of the subject."
    },
    {
      id: "hu102-f-4",
      question: "High-key lighting creates a mood that is:",
      options: ["Dark and mysterious", "Bright and optimistic", "Scary and tense", "Sad and melancholic"],
      correctAnswer: 1,
      explanation: "High-key lighting with minimal shadows creates upbeat, positive atmospheres."
    },
    {
      id: "hu102-f-5",
      question: "Low-key lighting is characterized by:",
      options: ["Lots of fill light", "Strong contrast and deep shadows", "Bright, even lighting", "No key light"],
      correctAnswer: 1,
      explanation: "Low-key lighting uses strong contrast and shadows for dramatic, moody looks."
    },
    {
      id: "hu102-f-6",
      question: "What is a hair light/kicker?",
      options: ["A light for styling hair", "A backlight that creates rim separation", "The main light source", "A colored light effect"],
      correctAnswer: 1,
      explanation: "Hair lights create a rim of light separating the subject from the background."
    },
    {
      id: "hu102-f-7",
      question: "LED panels are popular because they:",
      options: ["Are always free", "Run cool, are adjustable, and energy efficient", "Only work outdoors", "Create the hardest shadows"],
      correctAnswer: 1,
      explanation: "LEDs offer adjustable color temperature, low heat, and energy efficiency."
    },
    {
      id: "hu102-f-8",
      question: "What is motivated lighting?",
      options: ["Lighting that excites the crew", "Lighting that appears to come from a source in the scene", "The most expensive lighting", "Lighting without cables"],
      correctAnswer: 1,
      explanation: "Motivated lighting mimics or enhances natural sources visible in the scene."
    },
    {
      id: "hu102-f-9",
      question: "Gels are used to:",
      options: ["Clean the lens", "Change the color of light", "Stabilize the camera", "Record audio"],
      correctAnswer: 1,
      explanation: "Colored gels placed over lights change their color output."
    },
    {
      id: "hu102-f-10",
      question: "What is Rembrandt lighting?",
      options: ["Lighting from Amsterdam", "A pattern with a triangle of light on one cheek", "Completely even lighting", "Only using candles"],
      correctAnswer: 1,
      explanation: "Rembrandt lighting creates a distinctive triangle of light under one eye."
    },
    {
      id: "hu102-f-11",
      question: "Negative fill refers to:",
      options: ["Removing light to deepen shadows", "Adding extra lights", "Using colored gels", "Underexposing the image"],
      correctAnswer: 0,
      explanation: "Negative fill uses black surfaces to absorb light and increase contrast."
    },
    {
      id: "hu102-f-12",
      question: "What is the best position for a beauty/glamour light?",
      options: ["Below the subject", "Directly above/in front of the subject", "Behind the subject only", "To the far side"],
      correctAnswer: 1,
      explanation: "Beauty lighting from above and front minimizes skin texture and shadows."
    },
    {
      id: "hu102-f-13",
      question: "What is chiaroscuro lighting?",
      options: ["Italian food lighting", "Strong contrast between light and dark", "Colorful party lighting", "Underwater lighting"],
      correctAnswer: 1,
      explanation: "Chiaroscuro creates dramatic contrast, popularized in Renaissance paintings."
    },
    {
      id: "hu102-f-14",
      question: "Eye light or catch light is:",
      options: ["A light that hurts the eyes", "The reflection of light visible in the subject's eyes", "A type of flash", "Red-eye reduction"],
      correctAnswer: 1,
      explanation: "Catch lights add life and depth by creating reflections in the eyes."
    },
    {
      id: "hu102-f-15",
      question: "Background separation is achieved by:",
      options: ["Moving the subject closer to the background", "Lighting the background differently from the subject", "Using only one light", "Shooting in darkness"],
      correctAnswer: 1,
      explanation: "Different lighting on subject and background creates depth and separation."
    },
    {
      id: "hu102-f-16",
      question: "What does 'wrapping light' mean?",
      options: ["Putting lights in boxes", "Light that curves around the subject softly", "Turning off lights", "Adding tinsel to lights"],
      correctAnswer: 1,
      explanation: "Wrapping light gently curves around the subject, creating soft transitions."
    },
    {
      id: "hu102-f-17",
      question: "What is the purpose of a light meter?",
      options: ["Measure distance", "Measure the intensity of light for proper exposure", "Change color temperature", "Control the lights remotely"],
      correctAnswer: 1,
      explanation: "Light meters measure illumination to help achieve consistent, correct exposure."
    },
    {
      id: "hu102-f-18",
      question: "What is mixed lighting?",
      options: ["Lights of different brands", "Multiple color temperature sources in one scene", "Lights at different heights", "Using only natural light"],
      correctAnswer: 1,
      explanation: "Mixed lighting occurs when sources of different color temperatures are present."
    },
    {
      id: "hu102-f-19",
      question: "A snoot is used to:",
      options: ["Spread light widely", "Create a narrow, focused beam", "Add color", "Reduce heat"],
      correctAnswer: 1,
      explanation: "Snoots concentrate light into a tight, controlled circle."
    },
    {
      id: "hu102-f-20",
      question: "The safest way to power lights on set is to:",
      options: ["Use extension cords only", "Check power capacity and use proper cables", "Use the highest wattage possible", "Plug everything into one outlet"],
      correctAnswer: 1,
      explanation: "Proper power management prevents overloads, fires, and equipment damage."
    },
  ],
};

// HU-201: Advanced Camera Movement
export const hu201Questions: Record<string, QuizQuestion[]> = {
  "hu201-q1": [
    {
      id: "hu201-q1-1",
      question: "What emotional effect does slow, deliberate camera movement typically create?",
      options: ["Tension and unease", "Energy and excitement", "Calm and contemplation", "Comedy and humor"],
      correctAnswer: 2,
      explanation: "Slow movements create a sense of calm, allowing viewers to absorb the scene."
    },
    {
      id: "hu201-q1-2",
      question: "A push-in shot typically conveys:",
      options: ["Character retreating", "Increasing importance or intensity", "Confusion", "Comedy"],
      correctAnswer: 1,
      explanation: "Moving toward a subject emphasizes their importance or builds dramatic tension."
    },
    {
      id: "hu201-q1-3",
      question: "What is the difference between a pan and a tilt?",
      options: ["Pan moves vertically, tilt moves horizontally", "Pan moves horizontally, tilt moves vertically", "They are the same", "Pan uses a dolly, tilt uses a crane"],
      correctAnswer: 1,
      explanation: "Pan rotates left/right on the horizontal axis; tilt rotates up/down on the vertical."
    },
    {
      id: "hu201-q1-4",
      question: "Unmotivated camera movement can:",
      options: ["Always improve a scene", "Distract viewers from the story", "Make editing easier", "Save time on set"],
      correctAnswer: 1,
      explanation: "Camera movement without story purpose can feel arbitrary and pull viewers out."
    },
    {
      id: "hu201-q1-5",
      question: "A tracking shot follows:",
      options: ["The script", "A subject's movement through space", "The audio levels", "The editing timeline"],
      correctAnswer: 1,
      explanation: "Tracking shots move with a subject, maintaining their position in frame."
    },
  ],
  "hu201-q2": [
    {
      id: "hu201-q2-1",
      question: "What are the three axes a gimbal stabilizes?",
      options: ["X, Y, Z", "Pan, tilt, roll", "Up, down, sideways", "Speed, direction, rotation"],
      correctAnswer: 1,
      explanation: "Gimbals use motors on pan (yaw), tilt (pitch), and roll axes for stabilization."
    },
    {
      id: "hu201-q2-2",
      question: "Before using a gimbal, you should always:",
      options: ["Charge your phone", "Balance the gimbal properly", "Update the firmware", "Record a test shot"],
      correctAnswer: 1,
      explanation: "Proper balancing reduces motor strain and ensures smooth operation."
    },
    {
      id: "hu201-q2-3",
      question: "The 'inception mode' on a gimbal allows:",
      options: ["Slow motion", "360-degree roll rotation", "Hyperlapse", "Focus pulling"],
      correctAnswer: 1,
      explanation: "Inception mode unlocks the roll axis for dramatic rotational movements."
    },
    {
      id: "hu201-q2-4",
      question: "What is 'follow mode' on a gimbal?",
      options: ["The gimbal follows the app instructions", "The gimbal follows your pan movements", "The gimbal follows GPS", "The gimbal follows audio"],
      correctAnswer: 1,
      explanation: "Follow mode allows the gimbal to rotate smoothly with your horizontal movements."
    },
    {
      id: "hu201-q2-5",
      question: "To achieve the smoothest gimbal footage, you should:",
      options: ["Run quickly", "Walk with bent knees and smooth steps", "Keep your arms fully extended", "Look at the screen constantly"],
      correctAnswer: 1,
      explanation: "Bent knees absorb vertical motion; smooth steps prevent bounce."
    },
  ],
  "hu201-q3": [
    {
      id: "hu201-q3-1",
      question: "A slider creates movement along:",
      options: ["A circular path", "A straight linear track", "A curved path", "A random path"],
      correctAnswer: 1,
      explanation: "Sliders provide smooth, straight horizontal or diagonal movements."
    },
    {
      id: "hu201-q3-2",
      question: "Parallax in slider shots refers to:",
      options: ["A focus effect", "The relative movement of foreground and background", "A lens type", "Camera rotation"],
      correctAnswer: 1,
      explanation: "Parallax shows different rates of movement between close and far objects, adding depth."
    },
    {
      id: "hu201-q3-3",
      question: "What is the main advantage of motorized sliders?",
      options: ["They're cheaper", "Consistent, repeatable speed", "They're lighter", "They don't need batteries"],
      correctAnswer: 1,
      explanation: "Motors provide consistent speed for smooth, professional-looking movements."
    },
    {
      id: "hu201-q3-4",
      question: "A dolly differs from a slider because it:",
      options: ["Is only for photography", "Can travel longer distances on tracks or wheels", "Is handheld", "Only moves vertically"],
      correctAnswer: 1,
      explanation: "Dollies can cover much greater distances than fixed-length sliders."
    },
    {
      id: "hu201-q3-5",
      question: "What is a crab move?",
      options: ["A move inspired by crabs", "Moving the camera sideways parallel to the action", "Moving backwards", "A circular movement"],
      correctAnswer: 1,
      explanation: "Crab moves track sideways, maintaining the camera's angle to the subject."
    },
  ],
  "hu201-q4": [
    {
      id: "hu201-q4-1",
      question: "Documentary-style handheld typically features:",
      options: ["Perfect stability", "Intentional, organic movement", "Only wide shots", "Slow motion"],
      correctAnswer: 1,
      explanation: "Documentary handheld embraces natural movement for immediacy and authenticity."
    },
    {
      id: "hu201-q4-2",
      question: "The 'body brace' technique involves:",
      options: ["Using a harness", "Tucking elbows into your body for stability", "Lying down", "Using two cameras"],
      correctAnswer: 1,
      explanation: "Keeping elbows tucked creates a stable platform using your body."
    },
    {
      id: "hu201-q4-3",
      question: "Breathing technique during handheld shooting should be:",
      options: ["Holding breath completely", "Breathing naturally with smooth exhales during shots", "Hyperventilating", "Breathing as loudly as possible"],
      correctAnswer: 1,
      explanation: "Steady breathing prevents sudden movements; exhale gently during takes."
    },
    {
      id: "hu201-q4-4",
      question: "What lens focal length is most forgiving for handheld?",
      options: ["Telephoto (200mm)", "Wide angle (18-24mm)", "Super telephoto (400mm)", "Macro lens"],
      correctAnswer: 1,
      explanation: "Wide angles are more forgiving of shake than telephoto lenses."
    },
    {
      id: "hu201-q4-5",
      question: "Intentional shake is often used to convey:",
      options: ["Peace and tranquility", "Chaos, urgency, or disorientation", "Romance", "Slow passage of time"],
      correctAnswer: 1,
      explanation: "Controlled shake adds energy and tension to intense moments."
    },
  ],
  "hu201-final": [
    {
      id: "hu201-f-1",
      question: "A crane shot moves the camera:",
      options: ["Only horizontally", "Vertically and/or in sweeping arcs", "Only in a circle", "Backwards only"],
      correctAnswer: 1,
      explanation: "Cranes lift cameras for dramatic vertical movements and sweeping reveals."
    },
    {
      id: "hu201-f-2",
      question: "The Steadicam was invented to:",
      options: ["Replace tripods", "Combine handheld mobility with smooth, stable footage", "Record audio", "Create slow motion"],
      correctAnswer: 1,
      explanation: "Steadicam revolutionized filmmaking by enabling smooth movement while walking."
    },
    {
      id: "hu201-f-3",
      question: "What is a 'oner' or one-take shot?",
      options: ["A shot lasting exactly one second", "An entire scene captured in one continuous take", "A shot from one angle", "A shot by one camera operator"],
      correctAnswer: 1,
      explanation: "Oners capture complete scenes without cuts, requiring precise coordination."
    },
    {
      id: "hu201-f-4",
      question: "A pullback reveal starts:",
      options: ["On a wide shot", "Close on a detail, then moves back to show context", "With camera shake", "With a freeze frame"],
      correctAnswer: 1,
      explanation: "Pullbacks reveal context by starting tight and moving out to show the full scene."
    },
    {
      id: "hu201-f-5",
      question: "What is 'motivated movement' in camera work?",
      options: ["Movement inspired by emotion", "Movement that has a story reason, like following a character", "Random movement", "Fast movement"],
      correctAnswer: 1,
      explanation: "Motivated movement serves the narrative rather than moving arbitrarily."
    },
    {
      id: "hu201-f-6",
      question: "An arc shot moves:",
      options: ["In a straight line", "In a curve around the subject", "Only up and down", "Only diagonally"],
      correctAnswer: 1,
      explanation: "Arc shots circle around subjects, creating dynamic perspective changes."
    },
    {
      id: "hu201-f-7",
      question: "The 'zolly' or Vertigo effect combines:",
      options: ["Pan and tilt", "Dolly and zoom in opposite directions", "Tilt and roll", "Two cameras"],
      correctAnswer: 1,
      explanation: "The zolly creates disorientation by dollying one way while zooming the opposite."
    },
    {
      id: "hu201-f-8",
      question: "When should camera movement begin?",
      options: ["Always before action starts", "When motivated by action or emotion in the scene", "Only at the end of scenes", "Never during dialogue"],
      correctAnswer: 1,
      explanation: "Starting movement with motivation makes it feel natural rather than arbitrary."
    },
    {
      id: "hu201-f-9",
      question: "What is the purpose of an establishing crane shot?",
      options: ["To show the camera equipment", "To reveal scope, location, and orient the audience", "To save time", "To hide mistakes"],
      correctAnswer: 1,
      explanation: "Crane establishing shots convey scale and geography of a location."
    },
    {
      id: "hu201-f-10",
      question: "A dutch angle combined with movement creates:",
      options: ["A stable shot", "Increased tension and disorientation", "A romantic mood", "Comedy"],
      correctAnswer: 1,
      explanation: "Tilted angles with movement intensify feelings of unease or chaos."
    },
    {
      id: "hu201-f-11",
      question: "In chase scenes, camera movement should:",
      options: ["Be completely still", "Match and amplify the energy of the action", "Be very slow", "Use only wide lenses"],
      correctAnswer: 1,
      explanation: "Dynamic camera movement heightens the intensity of action sequences."
    },
    {
      id: "hu201-f-12",
      question: "Diagonal movement through a scene creates:",
      options: ["Confusion", "Dynamic energy and depth", "Boredom", "Sadness"],
      correctAnswer: 1,
      explanation: "Diagonal movements are more visually dynamic than horizontal or vertical."
    },
    {
      id: "hu201-f-13",
      question: "What is 'leading room' in a tracking shot?",
      options: ["Extra crew space", "Space in front of the subject's direction of travel", "Behind-the-scenes footage", "A type of equipment"],
      correctAnswer: 1,
      explanation: "Leading room gives subjects space to move into, maintaining comfortable framing."
    },
    {
      id: "hu201-f-14",
      question: "A 'floating' camera style is characteristic of:",
      options: ["Action films only", "The Steadicam and gimbal aesthetic", "Still photography", "Animation"],
      correctAnswer: 1,
      explanation: "The floating aesthetic creates smooth, dreamlike camera movement."
    },
    {
      id: "hu201-f-15",
      question: "When combining dolly and pan, you should:",
      options: ["Move as fast as possible", "Coordinate movements for smooth, intentional results", "Only move one at a time", "Avoid using both together"],
      correctAnswer: 1,
      explanation: "Combined movements require practice to look smooth and motivated."
    },
    {
      id: "hu201-f-16",
      question: "Slow motion and camera movement together create:",
      options: ["Confusion", "Heightened drama and visual impact", "Technical problems", "Comedy only"],
      correctAnswer: 1,
      explanation: "Slow motion amplifies the emotional effect of cinematic camera movement."
    },
    {
      id: "hu201-f-17",
      question: "The 'hero walk' shot typically uses:",
      options: ["A static camera", "A low-angle tracking shot toward or with the character", "Only close-ups", "Overhead angles"],
      correctAnswer: 1,
      explanation: "Hero walks use low angles and movement to emphasize character power."
    },
    {
      id: "hu201-f-18",
      question: "What is the first step in planning a complex moving shot?",
      options: ["Start shooting immediately", "Block the action and map the camera path", "Order more equipment", "Edit previous footage"],
      correctAnswer: 1,
      explanation: "Planning movement with actors ensures smooth execution on set."
    },
    {
      id: "hu201-f-19",
      question: "POV shots benefit from movement that:",
      options: ["Is perfectly smooth", "Mimics natural human head movement", "Never changes", "Is extremely fast"],
      correctAnswer: 1,
      explanation: "POV shots feel authentic when movement matches human perception."
    },
    {
      id: "hu201-f-20",
      question: "When ending a camera move, you should:",
      options: ["Stop abruptly", "Ease out gradually for a smooth finish", "Speed up", "Shake the camera"],
      correctAnswer: 1,
      explanation: "Easing out prevents jarring stops and maintains professional quality."
    },
  ],
};

// HU-301: Cinematic Lens Language
export const hu301Questions: Record<string, QuizQuestion[]> = {
  "hu301-q1": [
    {
      id: "hu301-q1-1",
      question: "What does focal length determine?",
      options: ["The camera's weight", "The field of view and magnification", "The shutter speed", "The color temperature"],
      correctAnswer: 1,
      explanation: "Focal length determines how wide or narrow the view is and magnification level."
    },
    {
      id: "hu301-q1-2",
      question: "A wider aperture (lower f-number) creates:",
      options: ["Deeper depth of field", "Shallower depth of field", "More noise", "Slower shutter speed"],
      correctAnswer: 1,
      explanation: "Wide apertures like f/1.4 create shallow focus with blurred backgrounds."
    },
    {
      id: "hu301-q1-3",
      question: "Which aperture creates the deepest depth of field?",
      options: ["f/1.4", "f/2.8", "f/11", "f/4"],
      correctAnswer: 2,
      explanation: "Higher f-numbers like f/11 keep more of the scene in sharp focus."
    },
    {
      id: "hu301-q1-4",
      question: "What is bokeh?",
      options: ["A camera brand", "The aesthetic quality of out-of-focus areas", "A type of filter", "A lighting technique"],
      correctAnswer: 1,
      explanation: "Bokeh refers to the visual quality of blur in out-of-focus areas."
    },
    {
      id: "hu301-q1-5",
      question: "Prime lenses differ from zoom lenses because they:",
      options: ["Can zoom", "Have a fixed focal length", "Are always wider", "Cost less"],
      correctAnswer: 1,
      explanation: "Prime lenses have one fixed focal length but often superior optical quality."
    },
  ],
  "hu301-q2": [
    {
      id: "hu301-q2-1",
      question: "Wide angle lenses (below 35mm) tend to:",
      options: ["Compress space", "Expand space and exaggerate depth", "Blur the background more", "Work only outdoors"],
      correctAnswer: 1,
      explanation: "Wide angles stretch distances and make spaces appear larger."
    },
    {
      id: "hu301-q2-2",
      question: "Wide lenses close to faces cause:",
      options: ["Flattering proportions", "Exaggerated, unflattering distortion", "No difference", "Better focus"],
      correctAnswer: 1,
      explanation: "Wide lenses distort facial features when positioned too close."
    },
    {
      id: "hu301-q2-3",
      question: "Wide lenses are ideal for:",
      options: ["Portrait close-ups", "Establishing shots and small spaces", "Extreme bokeh", "Distant wildlife"],
      correctAnswer: 1,
      explanation: "Wide angles capture expansive scenes and work well in tight spaces."
    },
    {
      id: "hu301-q2-4",
      question: "Barrel distortion in wide lenses causes:",
      options: ["Straight lines to bow outward", "Colors to shift", "Focus problems", "Straight lines to bow inward"],
      correctAnswer: 0,
      explanation: "Barrel distortion curves straight lines outward, especially at the frame edges."
    },
    {
      id: "hu301-q2-5",
      question: "Wide lenses create a sense of:",
      options: ["Intimacy", "Claustrophobia or epic scale", "Simplicity", "Confusion"],
      correctAnswer: 1,
      explanation: "Wide angles can feel expansive (outdoors) or unsettling (close to subjects)."
    },
  ],
  "hu301-q3": [
    {
      id: "hu301-q3-1",
      question: "Telephoto lenses (85mm+) create:",
      options: ["Expanded space", "Compressed space with flattened depth", "Extreme distortion", "Wide fields of view"],
      correctAnswer: 1,
      explanation: "Telephoto compression makes elements appear closer together."
    },
    {
      id: "hu301-q3-2",
      question: "Why are telephoto lenses preferred for portraits?",
      options: ["They're cheaper", "They flatten features and create pleasing compression", "They have more distortion", "They're lighter"],
      correctAnswer: 1,
      explanation: "Telephoto compression creates flattering proportions and beautiful bokeh."
    },
    {
      id: "hu301-q3-3",
      question: "The 85mm lens is often called:",
      options: ["The standard lens", "The portrait lens", "The wide lens", "The macro lens"],
      correctAnswer: 1,
      explanation: "85mm is ideal for flattering portraits with good working distance."
    },
    {
      id: "hu301-q3-4",
      question: "Long lenses isolate subjects by:",
      options: ["Increasing depth of field", "Creating shallow focus that separates subject from background", "Adding distortion", "Changing colors"],
      correctAnswer: 1,
      explanation: "Telephoto lenses at wide apertures create strong subject isolation."
    },
    {
      id: "hu301-q3-5",
      question: "Telephoto lenses make backgrounds appear:",
      options: ["Further away", "Closer and larger relative to the subject", "Brighter", "Sharper"],
      correctAnswer: 1,
      explanation: "Compression pulls backgrounds forward, appearing closer to subjects."
    },
  ],
  "hu301-q4": [
    {
      id: "hu301-q4-1",
      question: "Anamorphic lenses create:",
      options: ["Square images", "Widescreen aspect ratios and distinctive flares", "Only black and white images", "3D effects"],
      correctAnswer: 1,
      explanation: "Anamorphic lenses squeeze images for widescreen and create signature oval flares."
    },
    {
      id: "hu301-q4-2",
      question: "What creates the 'anamorphic look' in mobile filmmaking?",
      options: ["Software filters only", "Clip-on anamorphic adapters", "Standard lenses", "Cropping in post"],
      correctAnswer: 1,
      explanation: "Anamorphic adapters for smartphones create authentic widescreen characteristics."
    },
    {
      id: "hu301-q4-3",
      question: "Mobile lens attachments typically mount using:",
      options: ["Glue", "Clips or cases with mounting systems", "Magnets only", "Tape"],
      correctAnswer: 1,
      explanation: "Most mobile lenses use clip-on mounts or dedicated cases with threads."
    },
    {
      id: "hu301-q4-4",
      question: "What is the 'squeeze factor' in anamorphic?",
      options: ["How hard to squeeze the lens", "The horizontal compression ratio", "The weight of the lens", "Battery life impact"],
      correctAnswer: 1,
      explanation: "Squeeze factor (1.33x, 2x) indicates horizontal compression amount."
    },
    {
      id: "hu301-q4-5",
      question: "Mobile macro lenses are used for:",
      options: ["Wide landscapes", "Extreme close-up details", "Portrait photography", "Night photography"],
      correctAnswer: 1,
      explanation: "Macro lenses enable sharp focus at very close distances for detail shots."
    },
  ],
  "hu301-final": [
    {
      id: "hu301-f-1",
      question: "The 'normal' lens (50mm on full frame) is called that because:",
      options: ["It's the most common", "It approximates human field of view", "It's the cheapest", "It has no distortion"],
      correctAnswer: 1,
      explanation: "50mm roughly matches human perspective, feeling natural and familiar."
    },
    {
      id: "hu301-f-2",
      question: "What does 'full frame equivalent' mean for mobile?",
      options: ["The phone is full size", "The focal length converted to match 35mm film standards", "Maximum zoom", "Best quality"],
      correctAnswer: 1,
      explanation: "Equivalent focal lengths help compare mobile lenses to traditional cinema lenses."
    },
    {
      id: "hu301-f-3",
      question: "A 24mm lens would typically be used for:",
      options: ["Tight close-ups", "Establishing shots and wide views", "Extreme macro", "Portraits"],
      correctAnswer: 1,
      explanation: "24mm provides wide coverage for environments and establishing shots."
    },
    {
      id: "hu301-f-4",
      question: "Chromatic aberration appears as:",
      options: ["Sharp lines", "Color fringing on high-contrast edges", "Black spots", "Circular patterns"],
      correctAnswer: 1,
      explanation: "Chromatic aberration creates colored edges, especially in cheaper lenses."
    },
    {
      id: "hu301-f-5",
      question: "The psychological effect of telephoto in thrillers is:",
      options: ["Comedy", "Surveillance, voyeurism, or disconnection", "Romance", "Adventure"],
      correctAnswer: 1,
      explanation: "Long lenses create feelings of being watched or isolated from the scene."
    },
    {
      id: "hu301-f-6",
      question: "Wide lenses in horror films create:",
      options: ["Calm", "Distortion and discomfort", "Romance", "Nostalgia"],
      correctAnswer: 1,
      explanation: "Wide lenses distort reality, creating unease and psychological tension."
    },
    {
      id: "hu301-f-7",
      question: "Lens flare is caused by:",
      options: ["Battery issues", "Light hitting the lens directly", "Wrong exposure", "Focus problems"],
      correctAnswer: 1,
      explanation: "Flares occur when bright light enters the lens directly, hitting elements."
    },
    {
      id: "hu301-f-8",
      question: "Vintage lenses are valued for their:",
      options: ["Perfect sharpness", "Unique character, flaws, and organic rendering", "Low cost only", "Waterproofing"],
      correctAnswer: 1,
      explanation: "Vintage lenses offer distinctive characteristics that differ from modern clinical sharpness."
    },
    {
      id: "hu301-f-9",
      question: "What is 'lens language' in storytelling?",
      options: ["Speaking about cameras", "Using lens choice to convey emotion and meaning", "Technical specifications", "Marketing terms"],
      correctAnswer: 1,
      explanation: "Lens language uses focal length psychology to enhance narrative."
    },
    {
      id: "hu301-f-10",
      question: "A 'deep focus' shot uses:",
      options: ["Wide aperture, shallow depth", "Small aperture for front-to-back sharpness", "Telephoto only", "No lens"],
      correctAnswer: 1,
      explanation: "Deep focus keeps everything sharp, often achieved with small apertures and wide lenses."
    },
    {
      id: "hu301-f-11",
      question: "Rack focus works best with:",
      options: ["Deep depth of field", "Shallow depth of field to create visible transitions", "No depth of field", "Only wide lenses"],
      correctAnswer: 1,
      explanation: "Shallow focus makes rack focus transitions clear and impactful."
    },
    {
      id: "hu301-f-12",
      question: "The '135mm' lens is often used for:",
      options: ["Wide establishing shots", "Beauty shots and interviews with strong compression", "Extreme wide angles", "Macro photography"],
      correctAnswer: 1,
      explanation: "135mm provides beautiful compression for portraits and talking heads."
    },
    {
      id: "hu301-f-13",
      question: "Why might a filmmaker choose a 'slower' lens (f/4)?",
      options: ["It's always better", "Lighter weight, sharper results, and often cheaper", "More bokeh", "Better colors"],
      correctAnswer: 1,
      explanation: "Slower lenses trade speed for lighter weight, sharpness, and affordability."
    },
    {
      id: "hu301-f-14",
      question: "Perspective distortion can be used creatively to:",
      options: ["Improve audio", "Exaggerate emotions or create unease", "Fix focus", "Change resolution"],
      correctAnswer: 1,
      explanation: "Intentional distortion becomes a storytelling tool when used purposefully."
    },
    {
      id: "hu301-f-15",
      question: "What is a 'matched set' of lenses?",
      options: ["Lenses of the same color", "Lenses with consistent color, contrast, and character", "Lenses from different brands", "Damaged lenses"],
      correctAnswer: 1,
      explanation: "Matched sets ensure visual consistency when switching focal lengths."
    },
    {
      id: "hu301-f-16",
      question: "Mobile phones typically have what type of sensor?",
      options: ["Full frame", "Smaller sensors requiring focal length conversion", "Medium format", "Film"],
      correctAnswer: 1,
      explanation: "Phone sensors are much smaller than full frame, affecting depth of field."
    },
    {
      id: "hu301-f-17",
      question: "The relationship between focal length and compression is:",
      options: ["Unrelated", "Longer focal lengths = more compression", "Shorter = more compression", "Random"],
      correctAnswer: 1,
      explanation: "Longer lenses compress space more than wide angles."
    },
    {
      id: "hu301-f-18",
      question: "Cinema zooms differ from photo zooms in that they:",
      options: ["Are smaller", "Maintain focus and have minimal breathing during zooming", "Only work on phones", "Are cheaper"],
      correctAnswer: 1,
      explanation: "Cinema zooms are designed for smooth zooming without focus shift."
    },
    {
      id: "hu301-f-19",
      question: "What is 'focus falloff'?",
      options: ["Losing focus during shooting", "How gradually focus transitions from sharp to soft", "A focusing technique", "A lens defect"],
      correctAnswer: 1,
      explanation: "Focus falloff describes the transition character from in-focus to out-of-focus."
    },
    {
      id: "hu301-f-20",
      question: "The best lens choice depends on:",
      options: ["Only budget", "Story needs, emotional intent, and practical constraints", "What's newest", "What's most expensive"],
      correctAnswer: 1,
      explanation: "Lens selection should serve the story and emotional goals first."
    },
  ],
};
