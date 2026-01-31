
# Hoodtorial University — Implementation Plan

## Overview
A premium, cinematic digital campus for film education featuring structured coursework, film-based exams, real-time progress tracking, Stripe subscriptions, and an official degree system.

---

## Phase 1: Foundation & Design System

### Brand Assets Integration
- Copy all 3 uploaded assets (logos + owl mascot) into project
- Create organized asset structure for consistent usage

### Design System
- **Dark mode** base (charcoal/black backgrounds)
- **Gold** primary accent (#D4AF37 / rich gold)
- **Steel blue** secondary accent for contrast
- Bold condensed headlines + clean sans-serif body
- Subtle grain texture, sharp edges, thick dividers
- Stamp-style badges and label-tape tags

### Core Components
- Navigation (sticky header with "Enroll Now" CTA)
- Footer with university branding
- Card components (course cards, faculty cards, tier cards)
- Badge/tag components
- Progress indicators
- Section layouts

---

## Phase 2: Marketing Pages (Public)

### Home Page
- Hero: "Shoot Better. Edit Smarter. Graduate Different."
- Trust indicators (Cinematic iPhone, Film-Based Exams, Degree + Transcript)
- Why Hoodtorial University (3 value cards)
- Departments preview carousel
- How Graduation Works (4-step visual)
- Featured classes
- Degree system preview
- Testimonials section
- Email capture: "Free Drops From The Dean's Office"

### Academics Page
- Department sections with descriptions, outcomes, example courses
- Course cards with HU-XXX codes, levels, credits
- Filter by department

### Degree Paths Page
- Three degree programs displayed
- Requirements breakdown (12 courses, 12 quizzes, 3 scenario exams, 6 projects, 1 capstone)
- Static degree progress visualization
- Sample exam UI demo
- Graduation benefits (certificate, transcript, badge)

### Enrollment Page
- Three membership tiers: Freshman, Sophomore, Graduate
- Feature comparison table
- Stripe checkout integration
- Mobile sticky enrollment CTA

### Faculty Page
- Faculty cards with role, expertise, bio
- "Watch Intro" button placeholders

### About Page
- Mission: "Where Hustle Meets Hollywood"
- What makes HU different
- Core values ("The Code")

### Contact Page
- Contact form with category selection
- Support, Collaborations, Press, Speaking

### Legal Pages
- Privacy Policy
- Terms of Service
- Academic Integrity Policy
- Capstone Submission Policy

### Shop Page
- Campus Bookstore layout
- Digital products section
- Apparel/merch placeholders

---

## Phase 3: Authentication & Backend

### Supabase Setup
- User authentication (email/password + social options)
- User profiles table
- Subscription status tracking
- Protected routes

### Database Schema
- `profiles` — user data, subscription tier, enrollment date
- `courses` — all courses with codes, credits, department
- `lessons` — lessons within courses
- `quizzes` — quiz questions and answers
- `exams` — scenario exam content
- `projects` — project requirements and rubrics
- `user_progress` — tracks completed lessons, quizzes, projects
- `user_credits` — earned credits per user
- `capstone_submissions` — final capstone uploads

---

## Phase 4: Student Portal (Authenticated)

### Student Center Dashboard
- Welcome with mascot guide
- Degree progress overview (credits earned/required)
- Current courses in progress
- Upcoming deadlines
- Quick links to all portal sections

### Orientation Section
- Welcome video placeholder
- How the system works
- Academic calendar

### Courses & Lessons
- Department navigation
- Course list with progress indicators
- Lesson viewer with completion tracking
- Mark as complete functionality

### Quizzes & Exams
- Quiz interface (multiple choice, film-based questions)
- 80% minimum pass requirement
- Retake functionality
- Scenario exam format (longer, situational)
- Results and feedback display

### Project Submissions
- Upload interface for practical assignments
- Submission requirements and rubrics
- Status tracking (submitted, under review, approved)

### Capstone Section
- Requirements checklist
- Upload final capstone film
- Evaluation rubric display

### Progress Dashboard
- Visual degree progress (credits, courses, exams, projects)
- Transcript view (mock PDF-style layout)
- Badges earned

### Resources
- Downloads section
- Templates and tools
- Office hours placeholder

---

## Phase 5: Stripe Payments

### Integration
- Connect Stripe for subscription management
- Three product tiers: Freshman, Sophomore, Graduate
- Checkout flow with success/cancel handling
- Webhook handling for subscription events

### Subscription Features
- Tier-based content access
- Upgrade/downgrade options
- Billing management portal link

---

## Phase 6: Polish & Launch Prep

### Final Touches
- Mascot appearances throughout (Student Center, Orientation, Degree pages)
- Animations and micro-interactions
- Mobile responsiveness fine-tuning
- SEO meta tags
- Performance optimization

### Academic Governance Display
- Course codes visible throughout
- Credit system explained
- Grading standards public
- Academic integrity prominent

---

## Technology Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Payments**: Stripe (Subscriptions)
- **State**: TanStack Query for data fetching
- **Routing**: React Router
- **UI**: Custom components + shadcn/ui base

---

## Mascot Usage Strategy
- **Home**: Hero accent, graduation section
- **Student Center**: Welcome guide, orientation
- **Degree Pages**: Progress celebrations, completion badges
- **Shop**: Merch previews
- **Error states**: Friendly guidance

---

## Deliverables
1. Complete 10+ page marketing website
2. Full authentication system
3. Student portal with real-time progress tracking
4. Stripe subscription checkout
5. Course, quiz, and project management
6. Degree certificate and transcript displays
7. Dark cinematic design with gold accents
8. Mobile-first responsive design
