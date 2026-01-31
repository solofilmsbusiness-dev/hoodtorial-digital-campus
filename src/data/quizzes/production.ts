import { QuizQuestion } from '../quizQuestions';

// HU-106: Pre-Production Planning
export const hu106Questions: Record<string, QuizQuestion[]> = {
  "hu106-q1": [
    {
      id: "hu106-q1-1",
      question: "What is the first step in pre-production?",
      options: ["Hiring crew", "Script breakdown and analysis", "Location scouting", "Equipment rental"],
      correctAnswer: 1,
      explanation: "Script breakdown identifies all production requirements before any other planning."
    },
    {
      id: "hu106-q1-2",
      question: "A script breakdown identifies:",
      options: ["Only dialogue", "All elements needed: cast, props, locations, costumes, etc.", "Only the budget", "Camera angles"],
      correctAnswer: 1,
      explanation: "Breakdowns catalog every requirement for scheduling and budgeting."
    },
    {
      id: "hu106-q1-3",
      question: "Color-coded script breakdowns use different colors for:",
      options: ["Decoration", "Different element categories (cast, props, wardrobe, etc.)", "Time of day", "Difficulty level"],
      correctAnswer: 1,
      explanation: "Color coding helps organize and identify elements at a glance."
    },
    {
      id: "hu106-q1-4",
      question: "A 'one-liner' schedule shows:",
      options: ["One-line descriptions", "A condensed shooting schedule with basic info per scene", "One day of shooting", "A single location"],
      correctAnswer: 1,
      explanation: "One-liners provide a quick overview of the entire shooting schedule."
    },
    {
      id: "hu106-q1-5",
      question: "Why break down each scene individually?",
      options: ["To waste time", "To identify unique requirements and budget accurately", "It's optional", "For legal reasons only"],
      correctAnswer: 1,
      explanation: "Scene-by-scene analysis ensures nothing is overlooked."
    },
  ],
  "hu106-q2": [
    {
      id: "hu106-q2-1",
      question: "Location scouting should assess:",
      options: ["Only aesthetics", "Light, sound, power, access, permits, and safety", "Only cost", "Only size"],
      correctAnswer: 1,
      explanation: "Comprehensive scouting prevents production problems."
    },
    {
      id: "hu106-q2-2",
      question: "A location release form:",
      options: ["Is optional", "Grants legal permission to film at a location", "Only for public spaces", "Only for studios"],
      correctAnswer: 1,
      explanation: "Releases protect productions from legal issues."
    },
    {
      id: "hu106-q2-3",
      question: "When scouting, photographing the location helps:",
      options: ["Nothing", "Plan shots, share with crew, and identify issues", "Only for memories", "Legal requirements"],
      correctAnswer: 1,
      explanation: "Scout photos inform planning and crew communication."
    },
    {
      id: "hu106-q2-4",
      question: "Permits are needed when filming:",
      options: ["Never", "In public spaces, certain private properties, and controlled areas", "Only for big productions", "Only internationally"],
      correctAnswer: 1,
      explanation: "Permit requirements vary by location and jurisdiction."
    },
    {
      id: "hu106-q2-5",
      question: "A backup location is important because:",
      options: ["It's not important", "Primary locations can become unavailable or unsuitable", "For variety only", "Legal requirement"],
      correctAnswer: 1,
      explanation: "Backup plans prevent costly delays from location problems."
    },
    {
      id: "hu106-q2-6",
      question: "Sound considerations when scouting include:",
      options: ["Only music", "Ambient noise, traffic, HVAC, and potential audio issues", "Nothing important", "Only echo"],
      correctAnswer: 1,
      explanation: "Audio problems on set are expensive to fix in post."
    },
  ],
  "hu106-q3": [
    {
      id: "hu106-q3-1",
      question: "A shooting schedule organizes:",
      options: ["Random scenes", "Scenes by location, cast, and efficiency, not script order", "Only by script order", "By budget only"],
      correctAnswer: 1,
      explanation: "Efficient scheduling saves time and money."
    },
    {
      id: "hu106-q3-2",
      question: "Cast availability affects scheduling because:",
      options: ["It doesn't", "Actors may have limited dates requiring schedule adaptation", "Only for stars", "Only for extras"],
      correctAnswer: 1,
      explanation: "Scheduling must accommodate key cast availability."
    },
    {
      id: "hu106-q3-3",
      question: "A 'day-out-of-days' chart shows:",
      options: ["Calendar dates only", "When each cast member is needed throughout production", "Daily weather", "Equipment needs"],
      correctAnswer: 1,
      explanation: "DOODs help manage cast schedules and costs."
    },
    {
      id: "hu106-q3-4",
      question: "Scheduling exteriors requires considering:",
      options: ["Nothing special", "Weather, daylight hours, and seasonal conditions", "Only temperature", "Only location"],
      correctAnswer: 1,
      explanation: "Exterior variables significantly impact shooting."
    },
    {
      id: "hu106-q3-5",
      question: "Why schedule the most difficult scenes early?",
      options: ["Random choice", "Fresh energy and buffer time for problems", "They're not important", "Budget reasons only"],
      correctAnswer: 1,
      explanation: "Early difficult scenes allow time for challenges."
    },
    {
      id: "hu106-q3-6",
      question: "Call sheets communicate:",
      options: ["Only call times", "Who, what, where, and when for each shooting day", "Only locations", "Only crew names"],
      correctAnswer: 1,
      explanation: "Call sheets are the daily blueprint for production."
    },
  ],
  "hu106-final": [
    {
      id: "hu106-f-1",
      question: "A production budget should include:",
      options: ["Only equipment", "All costs: crew, cast, locations, equipment, post, and contingency", "Only salaries", "Only food"],
      correctAnswer: 1,
      explanation: "Comprehensive budgets prevent financial surprises."
    },
    {
      id: "hu106-f-2",
      question: "Contingency in a budget is:",
      options: ["Wasted money", "Emergency funds for unexpected costs (typically 10-15%)", "Optional luxury", "Only for big productions"],
      correctAnswer: 1,
      explanation: "Contingency protects against inevitable surprises."
    },
    {
      id: "hu106-f-3",
      question: "Storyboards help pre-production by:",
      options: ["Being decorative", "Visualizing shots and sequences before filming", "Only for animation", "Replacing the script"],
      correctAnswer: 1,
      explanation: "Storyboards communicate visual plans to the entire team."
    },
    {
      id: "hu106-f-4",
      question: "A shot list differs from storyboards in that it:",
      options: ["Is more detailed", "Lists shots in text form with technical specifications", "Is visual only", "Replaces storyboards"],
      correctAnswer: 1,
      explanation: "Shot lists provide technical details storyboards may lack."
    },
    {
      id: "hu106-f-5",
      question: "The production designer is responsible for:",
      options: ["Camera work", "The overall visual look including sets, props, and colors", "Only costumes", "Only lighting"],
      correctAnswer: 1,
      explanation: "Production design creates the visual world of the film."
    },
    {
      id: "hu106-f-6",
      question: "Wardrobe planning should consider:",
      options: ["Only cost", "Character, story, continuity, and practical concerns", "Only color", "Only comfort"],
      correctAnswer: 1,
      explanation: "Costume serves character and story first."
    },
    {
      id: "hu106-f-7",
      question: "Equipment lists should include:",
      options: ["Only cameras", "All gear needed with backups and expendables", "Only expensive items", "Only lighting"],
      correctAnswer: 1,
      explanation: "Complete lists prevent on-set equipment problems."
    },
    {
      id: "hu106-f-8",
      question: "Insurance for productions covers:",
      options: ["Nothing important", "Equipment, liability, cast, and potential losses", "Only expensive items", "Only accidents"],
      correctAnswer: 1,
      explanation: "Insurance protects against various production risks."
    },
    {
      id: "hu106-f-9",
      question: "Rehearsals during pre-production help:",
      options: ["Waste time", "Develop performance and identify production challenges", "Only for stage", "Nothing"],
      correctAnswer: 1,
      explanation: "Pre-shoot rehearsals save time on set."
    },
    {
      id: "hu106-f-10",
      question: "Crew hiring should prioritize:",
      options: ["Cheapest options", "Skills, reliability, and good working relationships", "Only famous people", "Only friends"],
      correctAnswer: 1,
      explanation: "Right crew members make productions run smoothly."
    },
    {
      id: "hu106-f-11",
      question: "A production meeting before shooting should:",
      options: ["Be skipped", "Align all departments on the plan and answer questions", "Only include the director", "Only discuss budget"],
      correctAnswer: 1,
      explanation: "Production meetings ensure team alignment."
    },
    {
      id: "hu106-f-12",
      question: "What is a 'tech scout'?",
      options: ["Finding tech talent", "Department heads visiting locations to plan technical needs", "Equipment shopping", "A type of crew"],
      correctAnswer: 1,
      explanation: "Tech scouts let departments plan for specific locations."
    },
    {
      id: "hu106-f-13",
      question: "Meal planning for productions is important because:",
      options: ["It's not important", "Well-fed crews perform better and morale stays high", "Legal requirement only", "Budget padding"],
      correctAnswer: 1,
      explanation: "Craft services and meals significantly affect crew performance."
    },
    {
      id: "hu106-f-14",
      question: "Safety planning in pre-production includes:",
      options: ["Nothing specific", "Risk assessment, emergency procedures, and stunt coordination", "Only insurance", "Only legal review"],
      correctAnswer: 1,
      explanation: "Safety planning prevents accidents and protects everyone."
    },
    {
      id: "hu106-f-15",
      question: "A production timeline maps out:",
      options: ["Only the shoot", "Pre-production, production, and post-production phases", "Only editing", "Nothing useful"],
      correctAnswer: 1,
      explanation: "Complete timelines show the entire project journey."
    },
    {
      id: "hu106-f-16",
      question: "Casting during pre-production should:",
      options: ["Be rushed", "Allow time for auditions, callbacks, and chemistry reads", "Only take one day", "Be the last step"],
      correctAnswer: 1,
      explanation: "Proper casting takes time but determines success."
    },
    {
      id: "hu106-f-17",
      question: "Music rights should be cleared:",
      options: ["After shooting", "During pre-production to avoid post-production problems", "Never", "Only for final mix"],
      correctAnswer: 1,
      explanation: "Early music clearance prevents expensive problems later."
    },
    {
      id: "hu106-f-18",
      question: "Communication tools for production include:",
      options: ["Only email", "Call sheets, production reports, and team messaging", "Nothing formal", "Only phone calls"],
      correctAnswer: 1,
      explanation: "Clear communication systems keep productions organized."
    },
    {
      id: "hu106-f-19",
      question: "Pre-production is complete when:",
      options: ["The camera arrives", "All planning is done and the team is ready to execute", "Budget is set", "Locations are found"],
      correctAnswer: 1,
      explanation: "Pre-production ends when production can begin smoothly."
    },
    {
      id: "hu106-f-20",
      question: "The most important pre-production document is:",
      options: ["Business card", "There's no single most important—the complete package enables success", "The budget only", "The script only"],
      correctAnswer: 1,
      explanation: "Comprehensive pre-production requires all elements working together."
    },
  ],
};

// HU-205: Budget Filmmaking
export const hu205Questions: Record<string, QuizQuestion[]> = {
  "hu205-q1": [
    {
      id: "hu205-q1-1",
      question: "The first rule of budget filmmaking is:",
      options: ["Spend more", "Maximize creative impact with minimal resources", "Copy expensive films", "Ignore quality"],
      correctAnswer: 1,
      explanation: "Creative problem-solving replaces expensive solutions."
    },
    {
      id: "hu205-q1-2",
      question: "Constraints in low-budget filmmaking can:",
      options: ["Only limit creativity", "Force innovative solutions that become artistic choices", "Always hurt quality", "Be ignored"],
      correctAnswer: 1,
      explanation: "Limitations often spark the most creative solutions."
    },
    {
      id: "hu205-q1-3",
      question: "Writing for low budgets means:",
      options: ["Worse stories", "Crafting stories that work within available resources", "Only short films", "No dialogue"],
      correctAnswer: 1,
      explanation: "Smart writing leverages what you have access to."
    },
    {
      id: "hu205-q1-4",
      question: "Single-location films save money on:",
      options: ["Nothing", "Transportation, permits, and setup time", "Only permits", "Only time"],
      correctAnswer: 1,
      explanation: "Location consolidation significantly reduces costs."
    },
    {
      id: "hu205-q1-5",
      question: "Natural light can:",
      options: ["Never look professional", "Create beautiful results with proper understanding", "Only work outdoors", "Replace all lights"],
      correctAnswer: 1,
      explanation: "Understanding natural light enables professional results cheaply."
    },
  ],
  "hu205-q2": [
    {
      id: "hu205-q2-1",
      question: "DIY equipment solutions should:",
      options: ["Replace everything", "Solve specific problems while maintaining quality", "Be avoided", "Cost more"],
      correctAnswer: 1,
      explanation: "Selective DIY can save money without sacrificing quality."
    },
    {
      id: "hu205-q2-2",
      question: "Borrowing equipment works best when:",
      options: ["You don't ask", "You have relationships and treat gear respectfully", "You take without permission", "Only from family"],
      correctAnswer: 1,
      explanation: "Professional relationships and respect enable equipment sharing."
    },
    {
      id: "hu205-q2-3",
      question: "Affordable audio recording requires:",
      options: ["Expensive gear only", "Knowledge, proper technique, and suitable locations", "No planning", "Only built-in mics"],
      correctAnswer: 1,
      explanation: "Good technique matters more than expensive gear for audio."
    },
    {
      id: "hu205-q2-4",
      question: "Free locations can be found through:",
      options: ["Nowhere", "Personal connections, public spaces, and creative requests", "Only paying", "Only studios"],
      correctAnswer: 1,
      explanation: "Creative sourcing reveals many free location options."
    },
    {
      id: "hu205-q2-5",
      question: "Using available props and wardrobe:",
      options: ["Looks cheap always", "Can look great with careful selection and styling", "Is impossible", "Only for documentaries"],
      correctAnswer: 1,
      explanation: "Thoughtful curation of existing items can work beautifully."
    },
    {
      id: "hu205-q2-6",
      question: "Crew deferments mean:",
      options: ["Free labor", "Payment delayed until profits, requiring clear agreements", "No pay ever", "Only for students"],
      correctAnswer: 1,
      explanation: "Deferments should be documented with clear terms."
    },
  ],
  "hu205-q3": [
    {
      id: "hu205-q3-1",
      question: "Shooting efficiently saves money by:",
      options: ["Nothing", "Reducing days, which reduces costs across all categories", "Only saving time", "Only saving food costs"],
      correctAnswer: 1,
      explanation: "Fewer shooting days mean savings in every budget line."
    },
    {
      id: "hu205-q3-2",
      question: "Small crews can be effective when:",
      options: ["Never", "Everyone is skilled and roles are clearly defined", "Only for simple projects", "No one is experienced"],
      correctAnswer: 1,
      explanation: "Skilled small crews can be highly efficient."
    },
    {
      id: "hu205-q3-3",
      question: "Casting friends and family:",
      options: ["Always looks amateur", "Can work if they suit the roles and can perform", "Is the only option", "Never works"],
      correctAnswer: 1,
      explanation: "Cast for ability, not just availability."
    },
    {
      id: "hu205-q3-4",
      question: "Shooting ratio on low budgets should be:",
      options: ["As high as possible", "Efficient—more coverage isn't always better", "Always 20:1", "Ignored"],
      correctAnswer: 1,
      explanation: "Deliberate, planned shooting saves time and storage."
    },
    {
      id: "hu205-q3-5",
      question: "Free music and sound effects can be found:",
      options: ["Nowhere legally", "Through Creative Commons, royalty-free libraries, and composers seeking credit", "Only by stealing", "Only expensive libraries"],
      correctAnswer: 1,
      explanation: "Many legal free audio sources exist for low-budget productions."
    },
  ],
  "hu205-final": [
    {
      id: "hu205-f-1",
      question: "The most successful low-budget films succeed because of:",
      options: ["Luck only", "Strong stories, performances, and creative problem-solving", "Just good marketing", "Famous actors"],
      correctAnswer: 1,
      explanation: "Fundamentals matter most regardless of budget."
    },
    {
      id: "hu205-f-2",
      question: "Crowdfunding for films requires:",
      options: ["Just asking for money", "A compelling pitch, audience, and realistic goals", "Only social media", "Guaranteed success"],
      correctAnswer: 1,
      explanation: "Successful crowdfunding requires preparation and community."
    },
    {
      id: "hu205-f-3",
      question: "Post-production on a budget benefits from:",
      options: ["Rushing", "Free/affordable software and learning to do things yourself", "Skipping editing", "Only expensive software"],
      correctAnswer: 1,
      explanation: "Many professional-grade tools are now affordable or free."
    },
    {
      id: "hu205-f-4",
      question: "Color grading on a budget is possible with:",
      options: ["Only expensive software", "DaVinci Resolve (free version) and other affordable tools", "No grading at all", "Only LUTs"],
      correctAnswer: 1,
      explanation: "Professional color grading tools are now accessible."
    },
    {
      id: "hu205-f-5",
      question: "VFX on a budget should:",
      options: ["Be avoided completely", "Be used strategically for invisible or essential effects", "Replace everything", "Always look obvious"],
      correctAnswer: 1,
      explanation: "Strategic VFX can solve problems without looking cheap."
    },
    {
      id: "hu205-f-6",
      question: "Marketing a low-budget film requires:",
      options: ["Huge advertising budget", "Creative grassroots strategies and building audience", "Only festival submissions", "No effort"],
      correctAnswer: 1,
      explanation: "Creative marketing can compete with bigger budgets."
    },
    {
      id: "hu205-f-7",
      question: "Festival strategy for low-budget films should:",
      options: ["Target only Sundance", "Be realistic about appropriate festivals and costs", "Skip festivals entirely", "Only local festivals"],
      correctAnswer: 1,
      explanation: "Strategic festival selection maximizes limited resources."
    },
    {
      id: "hu205-f-8",
      question: "Building a crew of collaborators means:",
      options: ["Only hiring professionals", "Creating ongoing relationships with talented people who share your vision", "Working alone always", "Only using strangers"],
      correctAnswer: 1,
      explanation: "Regular collaborators improve with each project together."
    },
    {
      id: "hu205-f-9",
      question: "Gear rental vs. buying depends on:",
      options: ["Always buy", "Frequency of use, budget, and specific project needs", "Always rent", "Only trends"],
      correctAnswer: 1,
      explanation: "Calculate what makes sense for your production volume."
    },
    {
      id: "hu205-f-10",
      question: "Food and craft services on low budgets:",
      options: ["Can be skipped", "Should still be decent—morale matters", "Should be expensive", "Is the biggest expense"],
      correctAnswer: 1,
      explanation: "Good food is one of the best crew morale investments."
    },
    {
      id: "hu205-f-11",
      question: "Distribution for low-budget films now includes:",
      options: ["Only theatrical", "Self-distribution, streaming platforms, and digital sales", "Only DVDs", "Only TV"],
      correctAnswer: 1,
      explanation: "Digital distribution has democratized film release."
    },
    {
      id: "hu205-f-12",
      question: "The most valuable resource in low-budget filmmaking is:",
      options: ["Money", "Time, creativity, and relationships", "Equipment", "Locations"],
      correctAnswer: 1,
      explanation: "Non-monetary resources often matter most."
    },
    {
      id: "hu205-f-13",
      question: "Learning from failure in low-budget filmmaking:",
      options: ["Should be avoided", "Is essential to growth and improvement", "Means you should quit", "Only happens to bad filmmakers"],
      correctAnswer: 1,
      explanation: "Each project teaches lessons for the next."
    },
    {
      id: "hu205-f-14",
      question: "Scheduling for budget efficiency means:",
      options: ["Longest schedule possible", "Minimizing days while maintaining quality and crew welfare", "Rushing everything", "Ignoring actor needs"],
      correctAnswer: 1,
      explanation: "Efficient scheduling balances speed with quality."
    },
    {
      id: "hu205-f-15",
      question: "The best investment in low-budget filmmaking is:",
      options: ["Expensive camera", "Sound recording equipment and skilled sound mixer", "The most famous actor", "Biggest crew"],
      correctAnswer: 1,
      explanation: "Good audio separates professional from amateur."
    },
    {
      id: "hu205-f-16",
      question: "Student films teach:",
      options: ["Nothing useful", "Fundamentals and collaboration skills valuable throughout career", "Only theory", "Bad habits"],
      correctAnswer: 1,
      explanation: "Student work builds foundation for professional growth."
    },
    {
      id: "hu205-f-17",
      question: "Building an audience before your film is finished:",
      options: ["Is pointless", "Creates community and helps with release strategy", "Wastes time", "Only for famous people"],
      correctAnswer: 1,
      explanation: "Audience development can start during production."
    },
    {
      id: "hu205-f-18",
      question: "The 'Dogme 95' movement showed that:",
      options: ["Rules ruin creativity", "Constraints can produce powerful, focused filmmaking", "Only Danish films are good", "Big budgets are necessary"],
      correctAnswer: 1,
      explanation: "Severe limitations forced innovation and authenticity."
    },
    {
      id: "hu205-f-19",
      question: "Making your first feature film is about:",
      options: ["Perfection", "Learning, completing, and proving you can do it", "Winning awards immediately", "Making money"],
      correctAnswer: 1,
      explanation: "Completing a feature demonstrates commitment and ability."
    },
    {
      id: "hu205-f-20",
      question: "The most important lesson of budget filmmaking is:",
      options: ["Get more money", "Story and execution matter more than resources", "Give up without budget", "Wait for opportunities"],
      correctAnswer: 1,
      explanation: "Great films can be made at any budget level."
    },
  ],
};

// HU-206: Client Management
export const hu206Questions: Record<string, QuizQuestion[]> = {
  "hu206-q1": [
    {
      id: "hu206-q1-1",
      question: "The discovery call with a new client should:",
      options: ["Only discuss price", "Understand their goals, audience, and vision", "Sell immediately", "Skip questions"],
      correctAnswer: 1,
      explanation: "Understanding needs before proposing solutions builds trust."
    },
    {
      id: "hu206-q1-2",
      question: "Setting expectations upfront prevents:",
      options: ["Nothing", "Misunderstandings, scope creep, and conflict", "Only budget issues", "Only timeline issues"],
      correctAnswer: 1,
      explanation: "Clear expectations align both parties from the start."
    },
    {
      id: "hu206-q1-3",
      question: "A creative brief should include:",
      options: ["Only the script", "Goals, audience, deliverables, timeline, and budget", "Only the budget", "Only the deadline"],
      correctAnswer: 1,
      explanation: "Complete briefs guide the entire project."
    },
    {
      id: "hu206-q1-4",
      question: "Pricing creative work should consider:",
      options: ["Only time spent", "Time, expertise, usage rights, and value to client", "Only what competitors charge", "Only the client's budget"],
      correctAnswer: 1,
      explanation: "Fair pricing reflects full value, not just hours."
    },
    {
      id: "hu206-q1-5",
      question: "When a client's vision conflicts with best practices, you should:",
      options: ["Just do what they want", "Explain your perspective while respecting their final decision", "Refuse the project", "Argue until you win"],
      correctAnswer: 1,
      explanation: "Professional guidance with client respect is the balance."
    },
  ],
  "hu206-q2": [
    {
      id: "hu206-q2-1",
      question: "Contracts should be signed:",
      options: ["After the project", "Before any work begins", "Only for big projects", "Verbally only"],
      correctAnswer: 1,
      explanation: "Contracts protect both parties before work starts."
    },
    {
      id: "hu206-q2-2",
      question: "A contract should include:",
      options: ["Only payment terms", "Scope, timeline, payment, revisions, ownership, and termination", "Only the deadline", "Nothing specific"],
      correctAnswer: 1,
      explanation: "Comprehensive contracts prevent disputes."
    },
    {
      id: "hu206-q2-3",
      question: "Scope creep is:",
      options: ["Always acceptable", "Gradual expansion of project beyond original agreement", "Only the client's problem", "Always intentional"],
      correctAnswer: 1,
      explanation: "Scope creep threatens timelines and profitability."
    },
    {
      id: "hu206-q2-4",
      question: "Change orders should be:",
      options: ["Ignored", "Documented, priced, and approved before implementation", "Done for free", "Verbal only"],
      correctAnswer: 1,
      explanation: "Formal change orders prevent scope creep."
    },
    {
      id: "hu206-q2-5",
      question: "Kill fees protect against:",
      options: ["Nothing", "Client cancellation after you've committed time and resources", "Only your ego", "Only large projects"],
      correctAnswer: 1,
      explanation: "Kill fees compensate for lost opportunity from cancellation."
    },
    {
      id: "hu206-q2-6",
      question: "Usage rights in contracts define:",
      options: ["How you use the contract", "How the client can use the deliverables", "Only exclusivity", "Nothing important"],
      correctAnswer: 1,
      explanation: "Usage rights affect pricing and future opportunities."
    },
  ],
  "hu206-q3": [
    {
      id: "hu206-q3-1",
      question: "Regular client updates should:",
      options: ["Be avoided", "Keep clients informed and prevent surprise issues", "Only share good news", "Only happen when asked"],
      correctAnswer: 1,
      explanation: "Proactive communication builds trust and prevents problems."
    },
    {
      id: "hu206-q3-2",
      question: "Managing client feedback requires:",
      options: ["Accepting everything", "Organizing, prioritizing, and sometimes pushing back professionally", "Ignoring what you disagree with", "Only following direction"],
      correctAnswer: 1,
      explanation: "Professional feedback management protects the work."
    },
    {
      id: "hu206-q3-3",
      question: "When a deadline is at risk, you should:",
      options: ["Wait and hope", "Communicate early with solutions and options", "Hide the problem", "Blame the client"],
      correctAnswer: 1,
      explanation: "Early communication with solutions preserves trust."
    },
    {
      id: "hu206-q3-4",
      question: "Revision rounds in contracts should be:",
      options: ["Unlimited", "Defined with a specific number and scope", "Not mentioned", "As many as client wants"],
      correctAnswer: 1,
      explanation: "Defined revisions prevent endless changes."
    },
    {
      id: "hu206-q3-5",
      question: "Presenting work to clients should:",
      options: ["Just send files", "Provide context, explain decisions, and guide feedback", "Never explain choices", "Only show final versions"],
      correctAnswer: 1,
      explanation: "Context helps clients give useful feedback."
    },
    {
      id: "hu206-q3-6",
      question: "Difficult client feedback should be:",
      options: ["Ignored", "Addressed professionally with clarifying questions", "Argued against immediately", "Accepted without question"],
      correctAnswer: 1,
      explanation: "Understanding the real issue enables good solutions."
    },
  ],
  "hu206-final": [
    {
      id: "hu206-f-1",
      question: "Building long-term client relationships requires:",
      options: ["Only good work", "Quality work, communication, and exceeding expectations", "Only low prices", "Only fast turnaround"],
      correctAnswer: 1,
      explanation: "Lasting relationships are built on multiple factors."
    },
    {
      id: "hu206-f-2",
      question: "Client referrals come from:",
      options: ["Asking once", "Consistently excellent work and positive relationships", "Only discounts", "Only advertising"],
      correctAnswer: 1,
      explanation: "Great experiences lead to natural referrals."
    },
    {
      id: "hu206-f-3",
      question: "When to fire a client:",
      options: ["Never", "When the relationship is toxic, unprofitable, or unsustainable", "When they disagree with you", "After every project"],
      correctAnswer: 1,
      explanation: "Some client relationships aren't worth continuing."
    },
    {
      id: "hu206-f-4",
      question: "Handling late payments should include:",
      options: ["Ignoring it", "Clear terms, reminders, and escalation process", "Stopping all work immediately", "Never mentioning it"],
      correctAnswer: 1,
      explanation: "Professional payment processes protect your business."
    },
    {
      id: "hu206-f-5",
      question: "Testimonials and case studies are valuable for:",
      options: ["Nothing", "Demonstrating results and building credibility with prospects", "Only your ego", "Only your website"],
      correctAnswer: 1,
      explanation: "Social proof helps win new business."
    },
    {
      id: "hu206-f-6",
      question: "Upselling existing clients means:",
      options: ["Being pushy", "Offering additional valuable services that meet their needs", "Only offering discounts", "Ignoring their budget"],
      correctAnswer: 1,
      explanation: "Good upselling serves client needs, not just your revenue."
    },
    {
      id: "hu206-f-7",
      question: "Managing multiple clients requires:",
      options: ["Taking on everything", "Organization, realistic capacity, and honest communication", "Saying yes to everything", "Only big clients"],
      correctAnswer: 1,
      explanation: "Sustainable business means managing capacity wisely."
    },
    {
      id: "hu206-f-8",
      question: "A portfolio review with potential clients should:",
      options: ["Show everything you've done", "Present relevant work that demonstrates capability for their project", "Only show the most expensive work", "Skip the portfolio"],
      correctAnswer: 1,
      explanation: "Curated presentations are more effective than showing everything."
    },
    {
      id: "hu206-f-9",
      question: "Project post-mortems help by:",
      options: ["Wasting time", "Identifying what worked and what to improve for future projects", "Assigning blame", "Nothing useful"],
      correctAnswer: 1,
      explanation: "Reflection improves future project execution."
    },
    {
      id: "hu206-f-10",
      question: "Setting your rates should consider:",
      options: ["Only what competitors charge", "Your costs, expertise, market rate, and value delivered", "Only client budget", "Only hourly time"],
      correctAnswer: 1,
      explanation: "Sustainable rates account for all factors."
    },
    {
      id: "hu206-f-11",
      question: "The proposal is a selling tool that should:",
      options: ["Only list prices", "Demonstrate understanding and present a clear solution", "Be as short as possible", "Copy other proposals"],
      correctAnswer: 1,
      explanation: "Proposals show clients you understand their needs."
    },
    {
      id: "hu206-f-12",
      question: "Deposits before starting work:",
      options: ["Are optional", "Protect against non-payment and show client commitment", "Insult clients", "Only for new clients"],
      correctAnswer: 1,
      explanation: "Deposits are standard professional practice."
    },
    {
      id: "hu206-f-13",
      question: "Handling creative differences with clients requires:",
      options: ["Always giving in", "Professional dialogue, compromise, and sometimes firm boundaries", "Always winning", "Quitting the project"],
      correctAnswer: 1,
      explanation: "Creative differences need professional navigation."
    },
    {
      id: "hu206-f-14",
      question: "Client education about the creative process helps:",
      options: ["Nothing", "Set realistic expectations and improve collaboration", "Only you", "Waste time"],
      correctAnswer: 1,
      explanation: "Educated clients are better collaborators."
    },
    {
      id: "hu206-f-15",
      question: "Saying 'no' to projects that don't fit is:",
      options: ["Unprofessional", "Sometimes necessary for business health and reputation", "Never acceptable", "Only for established creators"],
      correctAnswer: 1,
      explanation: "Strategic 'no' protects time for right opportunities."
    },
    {
      id: "hu206-f-16",
      question: "Building a personal brand as a creative professional:",
      options: ["Is vanity", "Attracts ideal clients and differentiates your work", "Replaces good work", "Only matters on social media"],
      correctAnswer: 1,
      explanation: "Personal brand attracts aligned opportunities."
    },
    {
      id: "hu206-f-17",
      question: "The final delivery to a client should:",
      options: ["Just send files", "Include organized assets, documentation, and a professional close", "Skip the invoice", "Never end"],
      correctAnswer: 1,
      explanation: "Professional delivery leaves lasting impressions."
    },
    {
      id: "hu206-f-18",
      question: "Following up with past clients helps:",
      options: ["Nothing", "Maintain relationships and surface new opportunities", "Only annoy them", "Only when you need work"],
      correctAnswer: 1,
      explanation: "Regular touch points keep you top of mind."
    },
    {
      id: "hu206-f-19",
      question: "Handling client emergencies and rush requests:",
      options: ["Always say yes", "Assess capacity, charge appropriately, and set expectations", "Always say no", "Ignore the urgency"],
      correctAnswer: 1,
      explanation: "Rush work deserves rush rates and honest capacity assessment."
    },
    {
      id: "hu206-f-20",
      question: "The best client relationships are based on:",
      options: ["Price only", "Mutual respect, clear communication, and shared goals", "Fear", "Friendship only"],
      correctAnswer: 1,
      explanation: "Professional partnerships built on respect thrive."
    },
  ],
};

// HU-304: Capstone Project
export const hu304Questions: Record<string, QuizQuestion[]> = {
  "hu304-q1": [
    {
      id: "hu304-q1-1",
      question: "The capstone project should demonstrate:",
      options: ["One skill only", "Integration of skills learned across the entire curriculum", "Only technical ability", "Only creative vision"],
      correctAnswer: 1,
      explanation: "Capstones prove comprehensive competency."
    },
    {
      id: "hu304-q1-2",
      question: "Choosing a capstone topic should consider:",
      options: ["Only what's easy", "Your passion, portfolio needs, and feasibility", "Only what's impressive", "Only trends"],
      correctAnswer: 1,
      explanation: "Topic selection balances passion with practicality."
    },
    {
      id: "hu304-q1-3",
      question: "Research for your capstone should include:",
      options: ["Nothing", "Industry analysis, reference gathering, and technical planning", "Only watching other films", "Only reading articles"],
      correctAnswer: 1,
      explanation: "Thorough research informs better creative decisions."
    },
    {
      id: "hu304-q1-4",
      question: "A capstone proposal should contain:",
      options: ["Just the idea", "Concept, approach, timeline, budget, and success criteria", "Only the title", "Only the script"],
      correctAnswer: 1,
      explanation: "Complete proposals demonstrate project viability."
    },
    {
      id: "hu304-q1-5",
      question: "Setting capstone goals that are measurable helps:",
      options: ["Nothing", "Track progress and evaluate success objectively", "Only for grading", "Only for impressing others"],
      correctAnswer: 1,
      explanation: "Measurable goals enable meaningful evaluation."
    },
    {
      id: "hu304-q1-6",
      question: "Identifying potential challenges early allows:",
      options: ["Worry", "Planning solutions and mitigating risks proactively", "Giving up", "Only listing problems"],
      correctAnswer: 1,
      explanation: "Anticipating problems enables preparation."
    },
  ],
  "hu304-q2": [
    {
      id: "hu304-q2-1",
      question: "Capstone pre-production should be:",
      options: ["Skipped", "More thorough than any previous project", "The same as always", "Optional"],
      correctAnswer: 1,
      explanation: "The capstone demands the most complete preparation."
    },
    {
      id: "hu304-q2-2",
      question: "Building your capstone team requires:",
      options: ["Working alone", "Recruiting collaborators whose skills complement yours", "Only friends", "Only professionals"],
      correctAnswer: 1,
      explanation: "Strategic team building strengthens the project."
    },
    {
      id: "hu304-q2-3",
      question: "Resource planning for capstone projects must be:",
      options: ["Ignored", "Realistic about what you can actually access and afford", "Overly optimistic", "Only about money"],
      correctAnswer: 1,
      explanation: "Realistic planning prevents disappointment and failure."
    },
    {
      id: "hu304-q2-4",
      question: "Script development for the capstone should:",
      options: ["Be rushed", "Go through multiple drafts with feedback", "Be first draft only", "Skip feedback"],
      correctAnswer: 1,
      explanation: "Refined scripts lead to better films."
    },
    {
      id: "hu304-q2-5",
      question: "Creating a detailed production schedule helps:",
      options: ["Nothing", "Manage time, resources, and expectations throughout the project", "Only for long projects", "Only for big teams"],
      correctAnswer: 1,
      explanation: "Schedules keep complex projects on track."
    },
    {
      id: "hu304-q2-6",
      question: "Technical testing before the capstone shoot:",
      options: ["Wastes time", "Identifies equipment issues and develops workflow confidence", "Is unnecessary", "Only for new gear"],
      correctAnswer: 1,
      explanation: "Pre-shoot testing prevents on-set problems."
    },
  ],
  "hu304-q3": [
    {
      id: "hu304-q3-1",
      question: "During capstone production, problem-solving skills are tested by:",
      options: ["Nothing going wrong", "Inevitable challenges requiring quick, effective solutions", "Having everything planned perfectly", "Avoiding all problems"],
      correctAnswer: 1,
      explanation: "Real production always presents unexpected challenges."
    },
    {
      id: "hu304-q3-2",
      question: "Maintaining quality under pressure requires:",
      options: ["Giving up on quality", "Prioritizing what matters most while managing compromises", "Working faster", "Ignoring problems"],
      correctAnswer: 1,
      explanation: "Intelligent prioritization preserves essential quality."
    },
    {
      id: "hu304-q3-3",
      question: "Documentation during capstone production helps:",
      options: ["Nothing", "Track progress, capture lessons, and create behind-the-scenes content", "Only waste time", "Only for legal reasons"],
      correctAnswer: 1,
      explanation: "Documentation serves multiple purposes."
    },
    {
      id: "hu304-q3-4",
      question: "Managing team dynamics during production requires:",
      options: ["Ignoring conflicts", "Clear communication, conflict resolution, and leadership", "Doing everything yourself", "Avoiding all disagreement"],
      correctAnswer: 1,
      explanation: "Team leadership is essential during production stress."
    },
    {
      id: "hu304-q3-5",
      question: "Staying on schedule during production means:",
      options: ["Rushing through everything", "Making smart decisions about what to cut and what's essential", "Never making changes", "Working longer hours only"],
      correctAnswer: 1,
      explanation: "Schedule management requires intelligent trade-offs."
    },
    {
      id: "hu304-q3-6",
      question: "Capturing performance during the capstone demonstrates:",
      options: ["Only technical skill", "Directing ability and collaboration with talent", "Only camera skills", "Only your script"],
      correctAnswer: 1,
      explanation: "Performance direction shows comprehensive filmmaking ability."
    },
  ],
  "hu304-q4": [
    {
      id: "hu304-q4-1",
      question: "Capstone post-production should aim for:",
      options: ["Quick completion", "The highest quality finish you're capable of achieving", "Minimal effort", "Only rough cut quality"],
      correctAnswer: 1,
      explanation: "The capstone represents your best work."
    },
    {
      id: "hu304-q4-2",
      question: "Seeking feedback during capstone editing helps:",
      options: ["Nothing", "Identify blind spots and strengthen the final product", "Only slow you down", "Only get compliments"],
      correctAnswer: 1,
      explanation: "External perspective improves the work."
    },
    {
      id: "hu304-q4-3",
      question: "Color grading the capstone should:",
      options: ["Be skipped", "Establish a cohesive look that serves the story", "Only add LUTs", "Copy other films exactly"],
      correctAnswer: 1,
      explanation: "Intentional color grading demonstrates craft."
    },
    {
      id: "hu304-q4-4",
      question: "Sound design and mixing for the capstone should:",
      options: ["Use only production audio", "Create an immersive, polished soundscape", "Be minimal", "Add as many effects as possible"],
      correctAnswer: 1,
      explanation: "Sound design elevates the production value."
    },
    {
      id: "hu304-q4-5",
      question: "Multiple export versions of the capstone serve:",
      options: ["No purpose", "Different platforms, screenings, and use cases", "Only taking up storage", "Only festivals"],
      correctAnswer: 1,
      explanation: "Various formats serve different needs."
    },
    {
      id: "hu304-q4-6",
      question: "Creating a capstone case study or making-of helps:",
      options: ["Nothing", "Demonstrate process and share lessons learned", "Only fill time", "Only look professional"],
      correctAnswer: 1,
      explanation: "Process documentation adds portfolio value."
    },
  ],
  "hu304-final": [
    {
      id: "hu304-f-1",
      question: "The capstone presentation should:",
      options: ["Only show the film", "Context your work, explain choices, and demonstrate learning", "Be as short as possible", "Avoid discussion"],
      correctAnswer: 1,
      explanation: "Articulating your process shows professional development."
    },
    {
      id: "hu304-f-2",
      question: "Receiving capstone critique requires:",
      options: ["Defensiveness", "Openness to feedback while defending key creative decisions", "Accepting all criticism", "Ignoring all feedback"],
      correctAnswer: 1,
      explanation: "Professional critique response balances openness and conviction."
    },
    {
      id: "hu304-f-3",
      question: "The capstone demonstrates readiness for:",
      options: ["Nothing specific", "Professional work and continued growth as a filmmaker", "Only student work", "Only one type of project"],
      correctAnswer: 1,
      explanation: "The capstone proves readiness for the industry."
    },
    {
      id: "hu304-f-4",
      question: "Identifying what you would do differently helps:",
      options: ["Show weakness", "Demonstrate self-awareness and capacity for growth", "Nothing", "Only for bad projects"],
      correctAnswer: 1,
      explanation: "Self-reflection is a sign of maturity."
    },
    {
      id: "hu304-f-5",
      question: "The capstone film should be:",
      options: ["Perfect in every way", "Your best work that demonstrates comprehensive skills", "Just good enough", "Exactly like a reference film"],
      correctAnswer: 1,
      explanation: "The capstone represents your current highest level."
    },
    {
      id: "hu304-f-6",
      question: "Distribution strategy for your capstone might include:",
      options: ["Nothing", "Festivals, online platforms, and portfolio use", "Only keeping it private", "Only showing to friends"],
      correctAnswer: 1,
      explanation: "Strategic distribution maximizes the capstone's value."
    },
    {
      id: "hu304-f-7",
      question: "The skills demonstrated in a capstone include:",
      options: ["Only technical skills", "Technical, creative, organizational, and collaborative abilities", "Only creativity", "Only leadership"],
      correctAnswer: 1,
      explanation: "Capstones test comprehensive filmmaking competency."
    },
    {
      id: "hu304-f-8",
      question: "After completing the capstone, next steps might include:",
      options: ["Stopping filmmaking", "Building on skills, networking, and pursuing opportunities", "Only celebrating", "Only resting"],
      correctAnswer: 1,
      explanation: "The capstone is a launching pad, not an ending."
    },
    {
      id: "hu304-f-9",
      question: "The capstone project timeline should include:",
      options: ["Only production", "Pre-production, production, post-production, and buffer time", "Only editing", "No buffer time"],
      correctAnswer: 1,
      explanation: "Complete timelines account for all phases and potential delays."
    },
    {
      id: "hu304-f-10",
      question: "Quality benchmarks for the capstone should be:",
      options: ["Vague", "Specific, measurable standards you commit to meeting", "Impossible", "Whatever happens"],
      correctAnswer: 1,
      explanation: "Clear benchmarks guide quality decisions."
    },
    {
      id: "hu304-f-11",
      question: "The capstone's contribution to your portfolio is:",
      options: ["Minimal", "Potentially your most significant piece demonstrating current ability", "Only for school", "Replaceable immediately"],
      correctAnswer: 1,
      explanation: "The capstone often becomes a portfolio centerpiece."
    },
    {
      id: "hu304-f-12",
      question: "Documenting the capstone process creates value for:",
      options: ["Nobody", "Future learning, teaching, and demonstrating your approach", "Only yourself", "Only the project"],
      correctAnswer: 1,
      explanation: "Process documentation serves multiple future purposes."
    },
    {
      id: "hu304-f-13",
      question: "The capstone project proves your ability to:",
      options: ["Only follow instructions", "Conceive, plan, execute, and complete a project independently", "Only work with others", "Only use equipment"],
      correctAnswer: 1,
      explanation: "Independent project completion is the ultimate demonstration."
    },
    {
      id: "hu304-f-14",
      question: "Celebrating capstone completion is important because:",
      options: ["It's not important", "Acknowledging achievement motivates future work", "Only for social media", "Only for grades"],
      correctAnswer: 1,
      explanation: "Recognizing accomplishments builds confidence."
    },
    {
      id: "hu304-f-15",
      question: "The lasting impact of the capstone project is:",
      options: ["Temporary", "A foundation for continued growth and professional development", "Only a grade", "Only a memory"],
      correctAnswer: 1,
      explanation: "The capstone launches the next phase of your journey."
    },
    {
      id: "hu304-f-16",
      question: "Collaboration during the capstone develops:",
      options: ["Nothing new", "Professional working relationships and team leadership skills", "Only conflict", "Only frustration"],
      correctAnswer: 1,
      explanation: "Capstone collaboration builds industry-ready skills."
    },
    {
      id: "hu304-f-17",
      question: "Creative problem-solving in the capstone demonstrates:",
      options: ["That problems happened", "Resilience and adaptability essential for professional work", "Only failure", "Nothing important"],
      correctAnswer: 1,
      explanation: "Navigating challenges proves professional readiness."
    },
    {
      id: "hu304-f-18",
      question: "Feedback integration throughout the capstone shows:",
      options: ["Weakness", "Ability to collaborate and improve work through input", "Inability to decide", "Only for school projects"],
      correctAnswer: 1,
      explanation: "Integrating feedback is a professional skill."
    },
    {
      id: "hu304-f-19",
      question: "The capstone's technical quality should reflect:",
      options: ["Beginner level", "The highest standard you can achieve with available resources", "Only what equipment allows", "Only luck"],
      correctAnswer: 1,
      explanation: "Technical excellence within constraints is the goal."
    },
    {
      id: "hu304-f-20",
      question: "Graduating with a capstone means you have:",
      options: ["Just finished assignments", "Proven ability to deliver professional-quality work", "Only learned theory", "Nothing to show"],
      correctAnswer: 1,
      explanation: "The capstone is tangible proof of capability."
    },
    {
      id: "hu304-f-21",
      question: "Capstone projects test emotional resilience through:",
      options: ["Easy success", "Challenges that require perseverance and commitment", "No difficulties", "Only technical problems"],
      correctAnswer: 1,
      explanation: "Completing despite challenges builds crucial resilience."
    },
    {
      id: "hu304-f-22",
      question: "What matters most in the capstone is:",
      options: ["Perfection", "Demonstrating growth, commitment, and professional potential", "Being the best in class", "Only the final product"],
      correctAnswer: 1,
      explanation: "The journey and growth matter alongside the result."
    },
    {
      id: "hu304-f-23",
      question: "Your capstone voice should be:",
      options: ["Copying others exactly", "Authentic to your perspective and artistic vision", "Whatever is trendy", "Undefined"],
      correctAnswer: 1,
      explanation: "The capstone should reflect your unique voice."
    },
    {
      id: "hu304-f-24",
      question: "Industry professionals evaluating capstones look for:",
      options: ["Only technical perfection", "Potential, decision-making ability, and professional readiness", "Only creativity", "Only following trends"],
      correctAnswer: 1,
      explanation: "Professionals recognize potential beyond perfection."
    },
    {
      id: "hu304-f-25",
      question: "The capstone experience prepares you for:",
      options: ["Only student work", "The realities of professional film production", "Only hobby filmmaking", "Nothing specific"],
      correctAnswer: 1,
      explanation: "Capstone experience translates directly to industry work."
    },
  ],
};
