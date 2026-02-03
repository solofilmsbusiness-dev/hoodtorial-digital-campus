

# Urban Graffiti Header Typography

## Overview

Transform the main header titles to have a graffiti/urban street art style while preserving the existing gold and neon color scheme. This will give titles like "MASTER THE CRAFT" the edgy, street-inspired look that fits the "Where Hustle Meets Hollywood" brand.

## Font Selection

After researching Google Fonts options, **Permanent Marker** is the best choice for this project:

| Font | Style | Why It Works |
|------|-------|--------------|
| **Permanent Marker** | Bold hand-drawn marker | Mimics thick marker tags and urban signage - perfect graffiti aesthetic |
| Rock Salt | Rough chalk/brush | Backup option - more textured, rough street style |

Permanent Marker captures the essence of street art while remaining highly readable for headers.

## Visual Preview

```text
Current Style (Inter Black):
┌─────────────────────────────────────┐
│      MASTER THE CRAFT               │  <-- Clean, geometric, corporate
│      THESE COURSES COUNT            │
│      EARN YOUR DEGREE               │
└─────────────────────────────────────┘

New Style (Permanent Marker):
┌─────────────────────────────────────┐
│      𝕸𝖆𝖘𝖙𝖊𝖗 𝖙𝖍𝖊 𝕮𝖗𝖆𝖋𝖙               │  <-- Hand-drawn, edgy, urban
│      These Courses Count            │
│      Earn Your Degree               │
└─────────────────────────────────────┘
```

The graffiti font applies only to major headings (h1, h2, h3), keeping body text clean and readable.

## Implementation Details

### 1. Add Permanent Marker Font

Update `index.html` to load the new font alongside Inter:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Permanent+Marker&display=swap" rel="stylesheet">
```

### 2. Update Tailwind Configuration

Add the new font family in `tailwind.config.ts`:

```typescript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  display: ['Inter', 'system-ui', 'sans-serif'],
  urban: ['Permanent Marker', 'cursive'],  // NEW
},
```

### 3. Update CSS Heading Classes

Modify heading styles in `src/index.css` to use the graffiti font:

```css
.heading-display {
  font-family: 'Permanent Marker', cursive;
  @apply tracking-tight uppercase;
  letter-spacing: 0.02em;
}

.heading-1 {
  @apply heading-display text-5xl md:text-7xl lg:text-8xl leading-[0.95];
}

.heading-2 {
  @apply heading-display text-4xl md:text-5xl lg:text-6xl leading-tight;
}

.heading-3 {
  @apply heading-display text-3xl md:text-4xl leading-tight;
}
```

Note: Permanent Marker has slightly different line-height needs, so minor adjustments are included.

## Pages Affected

All pages using `heading-1`, `heading-2`, or `heading-3` classes will automatically get the new urban style:

| Page | Headers That Change |
|------|---------------------|
| `/academics` | "MASTER THE CRAFT", "THESE COURSES COUNT", "READY TO START?" |
| `/` (Index) | "HOODTORIAL UNIVERSITY", "EARN YOUR DEGREE", "DROPS FROM THE DEAN'S OFFICE" |
| `/degrees` | "EARN YOUR DEGREE", "WATCH YOUR PROGRESS" |
| `/shop` | "GEAR UP" |
| `/community` | "Community Access Required" |
| `/auth` | "HOODTORIAL UNIVERSITY" |
| `/student` | "Welcome back" |
| All Section Headers | Via `SectionHeader` component |

## Color Theme Preservation

All existing color classes continue to work perfectly with the new font:
- `text-gold-gradient` - Gold gradient on emphasized words
- `text-neon-gradient` - Neon purple/pink gradient 
- `text-glow` - Glowing text effect
- `text-foreground` - Standard white text

The graffiti font + existing colors = authentic street art aesthetic.

## Files to Modify

| File | Changes |
|------|---------|
| `index.html` | Add Permanent Marker to Google Fonts import |
| `tailwind.config.ts` | Add `font-urban` utility class |
| `src/index.css` | Update `.heading-display` to use Permanent Marker with adjusted line-heights |

## Expected Result

Headers will transform from clean corporate typography to bold, hand-drawn street art style - giving the site an authentic urban film school vibe that matches the "Hustle Meets Hollywood" brand identity, while the neon gold and purple colors create that graffiti-meets-cinema aesthetic.

