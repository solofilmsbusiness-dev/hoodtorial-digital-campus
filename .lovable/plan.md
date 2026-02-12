
## Add 100 Challenges with 3-Day Duration

### Overview
Currently challenges last only 1 day (matched by exact `active_date`). We'll add an `end_date` column so each challenge spans 3 days, then seed 100 new challenges covering Feb 13 - Dec 1, 2026 (every 3 days).

---

### Database Change

**Add `end_date` column to `daily_challenges` table**
- New column: `end_date` (date, nullable, defaults to `active_date + 2 days`)
- Update existing 7 challenges to set `end_date = active_date + 2`

```sql
ALTER TABLE daily_challenges ADD COLUMN end_date date;
UPDATE daily_challenges SET end_date = active_date + interval '2 days';
ALTER TABLE daily_challenges ALTER COLUMN end_date SET NOT NULL;
ALTER TABLE daily_challenges ALTER COLUMN end_date SET DEFAULT (CURRENT_DATE + interval '2 days');
```

---

### New Edge Function: `supabase/functions/seed-challenges/index.ts`

Creates 100 challenges with 3-day windows, spaced so each starts the day after the previous one ends. Covers all 5 categories and 3 difficulty levels with film-school-themed prompts.

- Accepts optional `start_date` (defaults to Feb 13, 2026)
- Each challenge: `active_date` = start, `end_date` = start + 2 days
- Next challenge starts on day after previous `end_date`
- Skips dates that already have challenges
- Difficulty distribution: ~40 beginner (0.5cr), ~35 intermediate (1cr), ~25 advanced (1.5cr)
- Categories rotate evenly: lighting, composition, movement, storytelling, general

---

### Modified Files

**`src/hooks/useDailyChallenges.ts`**
- Change "today's challenge" query: instead of `.eq('active_date', today)`, use `.lte('active_date', today).gte('end_date', today)` to find the currently active challenge
- Add a `timeRemaining` calculation showing how many days are left on the current challenge
- Increase browse limit from 30 to 100

**`src/components/community/DailyChallengeCard.tsx`**
- Change "Today's Challenge" label to show remaining time (e.g., "2 days left" or "Last day!")
- Keep all existing UI otherwise the same

**`src/pages/admin/ChallengeManager.tsx`**
- Add `end_date` field to the create/edit form (auto-calculated as `active_date + 2` but editable)
- Show date range in the table instead of just start date (e.g., "Feb 13 - Feb 15")
- Add a "Seed 100 Challenges" button that calls the new edge function

**`supabase/config.toml`**
- Register the new `seed-challenges` function with `verify_jwt = false`

---

### Challenge Content (100 challenges, 20 per category)

**Lighting (20):** Golden hour portraits, single-source drama, silhouette storytelling, color gel moods, window light study, backlight halos, candle/practical lighting, hard vs soft light comparison, neon night shoots, chiaroscuro still life, rim light reveals, bounce light techniques, mixed color temperature, flashlight horror, sunrise timelapse, shadow patterns, overhead flat lay lighting, motivated lighting setups, light painting, dappled light through foliage

**Composition (20):** Leading lines in architecture, rule of thirds breakout, symmetry hunt, negative space portraits, depth layering (foreground/mid/background), dutch angle tension, bird's eye flat lay, worm's eye perspective, frame within frame, diagonal dominance, centered composition power, pattern and repetition, juxtaposition pairs, texture close-ups, scale contrast (tiny vs huge), golden spiral, converging lines, reflection symmetry, minimalist compositions, crowded frame storytelling

**Movement (20):** Smooth tracking walk-and-talk, whip pan transition, dolly zoom effect, handheld energy shot, reveal push-in, pull-back reveal, orbit around subject, low-angle rolling shot, staircase ascending shot, follow-the-action pan, parallax layering, tilt up reveal, crash zoom, slow creep tension, time-lapse with movement, rack focus pull, 360-degree spin, overhead crane simulation, running alongside subject, stillness-to-motion contrast

**Storytelling (20):** Character intro in one shot, visual metaphor challenge, montage sequence (4 shots), establish-reveal-react, subtext through objects, before-and-after transformation, point-of-view sequence, emotional close-up study, world-building establishing shot, conflict in a single frame, passage of time in 3 shots, unreliable perspective, comedy timing beat, suspense through pacing, found-footage style, documentary interview setup, dream sequence aesthetic, flashback transition, environmental storytelling, silent dialogue scene

**General (20):** Behind-the-scenes of your setup, recreate a famous film frame, sound design focus (foley), color grading before/after, storyboard to screen comparison, location scout documentation, prop styling for camera, continuity challenge (match cuts), aspect ratio experiment, genre swap (same scene, different genre), title card design, end credits sequence, film poster still, production design on a budget, casting and direction exercise, breakout your phone gimbal, weather as character, food cinematography, pet/animal filming, collaborative challenge (tag a friend)

---

### Files Summary

| File | Action |
|------|--------|
| Database migration | Add `end_date` column, backfill existing rows |
| `supabase/functions/seed-challenges/index.ts` | New -- edge function with 100 challenges |
| `supabase/config.toml` | Add seed-challenges function config |
| `src/hooks/useDailyChallenges.ts` | Update query for date ranges, add time remaining |
| `src/components/community/DailyChallengeCard.tsx` | Show days remaining instead of "Today's Challenge" |
| `src/pages/admin/ChallengeManager.tsx` | Add end_date to form, date range display, seed button |
