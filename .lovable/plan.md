

## Add "Hoodtorials" Branded Section

### What
Add a bold, eye-catching "Hoodtorials" section to the homepage with the slogan **"We Look Under the Hood of Filmmaking."** This ties the brand name directly to its meaning and gives visitors a clear, memorable tagline.

### Where
New section on the **homepage** (`src/pages/Index.tsx`), placed between the "Features" section and the "How Graduation Works" section -- a natural spot to reinforce the brand identity before diving into process details.

### Design
- Full-width section with the dark noise background for contrast
- Large, bold "HOODTORIALS" heading in the gold gradient with glow effect
- Slogan "We Look Under the Hood of Filmmaking" in prominent uppercase tracking text
- A short supporting paragraph reinforcing the concept (e.g., breaking down the craft, demystifying professional techniques)
- Framed with the brutalist border style consistent with the rest of the site
- Uses a wrench/cog or film-related icon from Lucide (e.g., `Clapperboard` or `Wrench`) to visually reinforce "under the hood"

### Technical Details

**File: `src/pages/Index.tsx`**
- Add a new `<Section>` block after the Features section
- Uses existing `Section`, `SectionHeader`, and `ScrollReveal` components
- No new dependencies or database changes needed
- Purely a frontend content addition using the existing design system

