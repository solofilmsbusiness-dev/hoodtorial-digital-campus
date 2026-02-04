

# Enhanced Welcome Messages for Login Page

## Current State

The login page currently has basic welcome text:
- **Sign Up**: "Join the University" / "Create your account to start your journey"
- **Sign In**: "Welcome Back" / "Sign in to access your Student Center"

These are static and don't match the cinematic, urban personality of the platform.

---

## Proposed Enhancements

### 1. Dynamic, Personality-Driven Headlines

Replace static text with rotating, film-inspired welcome messages that match the "Where Hustle Meets Hollywood" brand.

**Sign Up Headlines (rotate through these):**
| Headline | Subtext |
|----------|---------|
| "Your Director's Chair Awaits" | "Join 500+ filmmakers writing their origin story" |
| "The Industry Needs Your Vision" | "Create your account. Begin your legacy." |
| "Ready to Make History?" | "Every legend started with a single frame" |
| "Claim Your Seat in the Room" | "Where the next generation of cinema is born" |

**Sign In Headlines (rotate through these):**
| Headline | Subtext |
|----------|---------|
| "The Set is Ready" | "Your crew missed you. Let's get back to work." |
| "Welcome Back, Filmmaker" | "Your next lesson is waiting" |
| "Roll Camera" | "Pick up where you left off" |
| "The Hustle Continues" | "Your journey is far from over" |

### 2. Animated Text Transitions

Use framer-motion to create smooth transitions between headlines:
- Fade + slide up animation when switching between sign up/sign in
- Typewriter effect for the main headline
- Staggered fade-in for subtext
- Subtle glow pulse on the headline

### 3. Personalized Welcome Back (Sign In)

When a returning user signs in, show their name if available from a previous session:
- Store last logged-in display name in localStorage
- Show "Welcome Back, [Name]" instead of generic greeting
- Falls back to rotating messages if no name stored

### 4. Visual Enhancements

- Add a small film clapperboard or camera icon that animates
- Gradient text effect on key words ("Director's Chair", "Filmmaker")
- Subtle sparkle/star animation on the headline

---

## Technical Implementation

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Auth.tsx` | Add rotating headline logic, animations, personalization |

### New State & Logic

```typescript
// Rotating headlines arrays
const signUpHeadlines = [
  { title: "Your Director's Chair Awaits", subtitle: "Join 500+ filmmakers writing their origin story" },
  { title: "The Industry Needs Your Vision", subtitle: "Create your account. Begin your legacy." },
  // ...
];

const signInHeadlines = [
  { title: "The Set is Ready", subtitle: "Your crew missed you. Let's get back to work." },
  { title: "Welcome Back, Filmmaker", subtitle: "Your next lesson is waiting" },
  // ...
];

// Personalization from localStorage
const lastUserName = localStorage.getItem('hoodtorial-last-user');

// Rotate headlines every 5 seconds
const [headlineIndex, setHeadlineIndex] = useState(0);
useEffect(() => {
  const interval = setInterval(() => {
    setHeadlineIndex(prev => (prev + 1) % headlines.length);
  }, 5000);
  return () => clearInterval(interval);
}, [isSignUp]);
```

### Animation Pattern

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={`${isSignUp}-${headlineIndex}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="text-center mb-6"
  >
    <h2 className="heading-4 text-foreground">
      <span className="text-gold-gradient">{headline.title}</span>
    </h2>
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-sm text-muted-foreground mt-2"
    >
      {headline.subtitle}
    </motion.p>
  </motion.div>
</AnimatePresence>
```

### Personalization Storage

On successful login, store the user's name:
```typescript
// After successful sign in
if (profile?.display_name) {
  localStorage.setItem('hoodtorial-last-user', profile.display_name);
}
```

---

## Visual Preview

**Sign Up State:**
```text
   [Film Icon Animation]
   
   "Your Director's Chair Awaits"
   (with gold gradient text + glow)
   
   Join 500+ filmmakers writing their origin story
   (fade in with slight delay)
```

**Sign In State (Personalized):**
```text
   [Camera Rolling Animation]
   
   "Welcome Back, Marcus"
   (personalized if name available)
   
   Your next lesson is waiting
```

**Sign In State (Generic):**
```text
   [Camera Rolling Animation]
   
   "The Set is Ready"
   (rotating headlines)
   
   Your crew missed you. Let's get back to work.
```

---

## Summary

| Enhancement | Impact |
|-------------|--------|
| Rotating film-themed headlines | Creates energy and personality |
| Animated transitions | Adds polish and smoothness |
| Personalized "Welcome Back" | Creates connection with returning users |
| Gold gradient + glow effects | Matches platform aesthetic |
| Icon animations | Reinforces film school brand |

This transforms the auth page from a functional form into an inviting, cinematic experience that matches the "Hustle Meets Hollywood" brand.

