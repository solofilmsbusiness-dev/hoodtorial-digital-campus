

# Smart AI Help Agent Implementation

## Overview
Create an AI-powered help agent that provides instant assistance with platform questions, film/cinematography knowledge, and general guidance. The agent will be accessible from anywhere in the app via a floating chat button.

---

## What Will Be Built

### 1. Floating Chat Widget
A persistent chat button in the bottom-right corner that opens a sleek chat interface. Available on all pages for quick access to help.

**Visual Design:**
- Circular floating button with a "chat" or "sparkles" icon
- Matches the urban/neon aesthetic of the site
- Expands into a chat panel when clicked
- Smooth animations for open/close

### 2. Chat Interface
A modern chat panel with:
- Message history with user and assistant bubbles
- Markdown rendering for formatted AI responses
- Real-time streaming responses (tokens appear as they're generated)
- Suggested quick prompts for first-time users
- Clear conversation button

### 3. Backend Edge Function
A Supabase Edge Function that connects to Lovable AI (using the pre-configured LOVABLE_API_KEY) to power the conversations.

**AI Personality:**
- Knowledgeable about filmmaking, cinematography, directing, post-production
- Familiar with the Hoodtorial University curriculum and courses
- Friendly, helpful, and speaks with confidence
- Can answer both platform-related and general film questions

---

## User Experience

### Opening the Chat
1. User clicks the floating chat button (bottom-right corner)
2. Chat panel slides up with a welcome message
3. Quick suggestion chips appear: "How do I start learning?", "What is color grading?", "Recommend a course"

### Having a Conversation
- User types a message and hits send (or presses Enter)
- AI response streams in real-time with markdown formatting
- Conversation history persists within the session
- User can continue asking follow-up questions

### Example Interactions
- "What's the difference between a J-cut and L-cut?" → Detailed film editing explanation
- "Which course should I take first?" → Personalized recommendation based on conversation
- "How do I access my grades?" → Platform navigation help
- "Explain the rule of thirds" → Cinematography concept explanation

---

## Technical Implementation

### Files to Create

**src/components/chat/ChatWidget.tsx**
Main floating widget component that manages open/closed state and renders the chat interface.

**src/components/chat/ChatPanel.tsx**
The chat panel UI with:
- Header with title and close button
- Scrollable message area
- Input field with send button
- Loading state for streaming responses

**src/components/chat/ChatMessage.tsx**
Individual message bubble component with:
- User vs assistant styling
- Markdown rendering using react-markdown
- Timestamp display (optional)

**src/components/chat/index.ts**
Export barrel file for chat components.

**src/hooks/useChat.ts**
Custom hook managing:
- Message state (array of user/assistant messages)
- Loading/streaming state
- Send message function that calls the edge function
- Clear conversation function

**supabase/functions/chat/index.ts**
Edge function that:
- Receives messages from the frontend
- Adds a system prompt with Hoodtorial University context and film expertise
- Calls Lovable AI gateway with streaming enabled
- Returns SSE stream to frontend

### Files to Modify

**src/App.tsx**
Add the ChatWidget component to the app root so it appears on all pages.

---

## AI System Prompt

The edge function will include a carefully crafted system prompt:

```text
You are the Hoodtorial University AI Assistant - a knowledgeable, 
friendly guide for filmmakers and students.

EXPERTISE AREAS:
- Cinematography: cameras, lenses, lighting, composition, movement
- Post-Production: editing, color grading, sound design, VFX
- Directing: storytelling, working with talent, visual language
- Production: pre-production, budgeting, scheduling, crew management
- Photography: exposure, composition, lighting techniques
- Camera Systems: professional cameras, codecs, log profiles

ABOUT HOODTORIAL UNIVERSITY:
- Film school for creators who want to master the craft
- Offers courses across 6 departments
- Students earn credits toward graduation
- Degree tiers: Freshman ($29), Sophomore ($79), Graduate ($149)
- Features: scenario exams, project submissions, 1-on-1 feedback

PERSONALITY:
- Speak with confidence and urban energy
- Be encouraging and supportive
- Give practical, actionable advice
- Use examples from real films when helpful
- Keep answers clear and not too long unless asked for detail

When users ask about the platform, courses, or their progress, 
help them navigate and make decisions.
```

---

## Component Architecture

```text
App.tsx
  +-- ChatWidget (floating button + panel container)
       +-- Floating Button (always visible)
       +-- ChatPanel (conditionally rendered)
            +-- Header
            +-- Message List
            |    +-- ChatMessage (for each message)
            +-- Quick Suggestions (shown when empty)
            +-- Input Area
```

---

## Streaming Implementation

The chat will use real-time streaming for a responsive feel:

1. **Frontend sends request** to edge function with message history
2. **Edge function** proxies to Lovable AI with `stream: true`
3. **SSE stream** returns tokens as they're generated
4. **Frontend** parses SSE events and updates the assistant message character by character
5. When `[DONE]` is received, streaming ends

---

## Visual Design

### Floating Button
- 56x56px circular button
- Primary gold color with glow effect
- Chat bubble or sparkles icon
- Hover: scale up slightly, increased glow

### Chat Panel
- 400px wide, 500px tall on desktop
- Full-screen on mobile
- Dark card background (#050505)
- Gold accent border
- Rounded corners with shadow

### Message Bubbles
- User: Aligned right, primary gold background
- Assistant: Aligned left, muted card background
- Clear visual distinction between the two

### Quick Suggestions
- Horizontal scrollable row of chip buttons
- Examples: "What course fits me?", "Explain cinematography basics", "How do credits work?"

---

## Dependencies

### New Package to Install
- `react-markdown` - For rendering markdown in AI responses

### Already Available
- Lovable AI via LOVABLE_API_KEY (pre-configured)
- UI components (Button, Card, Input, ScrollArea)
- Icons from lucide-react

---

## Edge Function Details

**Path:** `supabase/functions/chat/index.ts`

**Request Format:**
```json
{
  "messages": [
    { "role": "user", "content": "What is the rule of thirds?" }
  ]
}
```

**Response:** Server-Sent Events (SSE) stream

**Error Handling:**
- 429: Rate limit exceeded - show friendly message
- 402: Credits exhausted - inform user
- 500: General error - show retry option

---

## Mobile Responsiveness

### Desktop (>768px)
- Floating button in bottom-right corner
- Chat panel positioned above the button
- Panel size: 400x500px

### Mobile (<768px)
- Same floating button
- Panel expands to full screen when open
- Keyboard-friendly input

---

## Summary

This AI assistant will give Hoodtorial University students and visitors instant access to:
- Film and cinematography knowledge
- Platform navigation help
- Course recommendations
- General creative guidance

The implementation uses Lovable AI (already configured) so no additional API keys are needed. The streaming approach ensures responsive, engaging interactions.

