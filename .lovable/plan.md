
# Student Profile & Dashboard Implementation Plan

## Overview
Build a complete authentication system with extended user profiles and a Student Center dashboard where users can track their academic progress, view grades, and manage their profile.

---

## What You'll Get

**Authentication System**
- Sign up and login pages with email/password
- Protected routes for student-only content
- Automatic redirects for logged-in/logged-out users

**Extended User Profile**
- Display name and profile photo (avatar)
- Personal bio
- Social media links (Instagram, YouTube, Twitter, etc.)
- Location
- Camera gear information
- Membership tier display

**Student Center Dashboard**
- Welcome section with personalized greeting
- Degree progress overview (credits, courses, quizzes)
- Visual progress bars for each requirement
- Recent activity feed
- Quick links to courses and profile settings

**Grades & Scores Section**
- Complete list of quiz scores by course
- Pass/fail status indicators
- Overall GPA-style calculation
- Filter by department

---

## Technical Implementation

### Database Setup (Supabase/Lovable Cloud)

**Profiles Table**
Stores extended user information:
- Display name, avatar URL, bio
- Social links (Instagram, YouTube, Twitter, TikTok)
- Location and camera gear
- Membership tier and enrollment date

**User Roles Table** (Security)
Separate table for role management per security best practices.

**User Progress Table**
Tracks academic achievements:
- Completed lessons and courses
- Quiz attempts with scores
- Project submissions
- Credits earned

**Quiz Results Table**
Stores individual quiz attempts:
- Quiz ID and score
- Pass/fail status
- Attempt timestamp
- Time taken

### New Pages

| Page | Route | Purpose |
|------|-------|---------|
| Auth | /auth | Login and signup forms |
| Student Center | /student | Main dashboard |
| Profile | /student/profile | Edit profile info |
| Grades | /student/grades | View all scores |
| Transcript | /student/transcript | Academic record |

### Components to Build

- AuthForm (login/signup toggle)
- ProfileCard (displays user info)
- ProfileEditForm (update profile)
- DegreeProgress (visual progress widget)
- GradesTable (scores list)
- QuickStats (credits, courses, quizzes)
- ActivityFeed (recent completions)

### Security Measures

- Row Level Security (RLS) on all user tables
- Users can only view/edit their own data
- Email validation with Zod
- Secure password requirements
- Protected route wrapper component

---

## User Flow

```text
1. New User visits /enrollment
   -> Clicks "Enroll Now"
   -> Redirects to /auth (signup mode)
   -> Creates account
   -> Redirects to /student (dashboard)

2. Returning User
   -> Visits site, clicks "Login"
   -> Enters credentials at /auth
   -> Redirects to /student

3. Student Center
   -> Views progress dashboard
   -> Clicks course to study
   -> Takes quizzes, scores saved
   -> Returns to see updated grades
```

---

## Visual Design

The Student Center will follow the existing brutalist aesthetic:
- Dark background with gold accent progress bars
- Urban card styling for profile and stats
- Tag-sticker badges for achievements
- Neon color accents for different departments
- Glow effects on important metrics

---

## Implementation Steps

1. **Enable Lovable Cloud** - Set up authentication and database
2. **Create database tables** - Profiles, progress, quiz results with RLS policies
3. **Build auth page** - Login/signup with validation and error handling
4. **Create auth context** - Session management across the app
5. **Add protected route wrapper** - Redirect unauthenticated users
6. **Build Student Center layout** - Sidebar navigation for dashboard sections
7. **Create profile components** - Display and edit forms
8. **Build progress tracking** - Visual widgets for degree completion
9. **Create grades page** - Table of all quiz scores
10. **Update navigation** - Add login/profile links to header
11. **Connect quiz system** - Save scores when quizzes complete

---

## Profile Fields Summary

| Field | Type | Description |
|-------|------|-------------|
| display_name | Text | Public name shown on profile |
| avatar_url | URL | Profile picture (stored in blob storage) |
| bio | Text | Short personal description |
| location | Text | City/Country |
| camera_gear | Text | Equipment info |
| instagram_url | URL | Social link |
| youtube_url | URL | Social link |
| twitter_url | URL | Social link |
| tiktok_url | URL | Social link |
| membership_tier | Enum | Freshman/Sophomore/Graduate |
| enrolled_at | Timestamp | When user joined |
