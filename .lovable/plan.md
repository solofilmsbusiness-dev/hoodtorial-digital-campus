# Hoodtorial Free Composition Mini-Class

## Goal
Create a focused public sample that teaches real composition skills without changing accounts, payments, enrollment rules, assessment rules, or backend data.

## Catalog accuracy
- Derive homepage and Academics course and department totals from the catalog source instead of hardcoded numbers.
- Label the catalog as available and planned curriculum based on existing course status.
- Remove unverified hours, enrollment, social-proof, accreditation, and credential language from the touched homepage and Academics sections.
- Add a prominent **Try a Free Lesson** link on both pages.

## Public mini-class
- Add the unauthenticated `/film-class` page, titled **Composition That Tells a Story**, clearly marked as a free HU-101 sample with no degree credit.
- Build three fully written lessons with objectives, substantial teaching text, accessible controls, previous/next navigation, reset/replay, reduced-motion support, and text equivalents.
- Create original animated scenes for rule-of-thirds comparison, leading-line/framing comparison, and a draggable or selectable three-shot studio-arrival sequence.
- Add two scenario questions per lesson with explanations and retry behavior. Keep progress only in page memory; do not write enrollment or completion data.
- Finish with the 15–30 second practical assignment, four-part 0–2 rubric, and a client-side downloadable shot list/checklist.

## Production document
- Add `docs/animated-course-production-plan.md` mapping real HU-101, HU-102, and HU-103 lesson IDs to about 12 no-on-camera production concepts.
- Include objectives, visual formats, assignments, reusable lesson structure, and a realistic production sequence.
- Include complete voiceover scripts and scene timings for the three implemented sample lessons as future 2–3 minute narrated videos, clearly separated from the current interactive lessons.

## Technical details
- Use existing semantic color tokens and Hoodtorial’s premium dark cinematic style.
- Keep `/course/:code` behind the existing paid-access guard while `/film-class` remains public.
- Avoid fake players, placeholder video URLs, backend progress, and unverified equipment or software claims.
- Verify the app checks, then exercise all three lessons, feedback/retry/reset, download, mobile layout, reduced-motion behavior, public access, and a paid course redirect in Chromium.