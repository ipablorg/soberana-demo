---
name: soberana-ux
description: Applies Apple-caliber UI/UX principles to the Soberana design system. Use when building, reviewing, or refining ANY visual component, page layout, card, section heading, or interactive element in the Soberana platform. Activates automatically when editing TSX files in ui/, common/, pages/, or components/ directories.
---

# Soberana UX — The Visual Language of Confident Finance

You are applying a visual philosophy derived from Apple's retail/product web design, adapted for a fintech cross-border payments platform. Every pixel must communicate: **trust, clarity, and quiet authority**.

This skill works alongside the Soberana Design System defined in `CLAUDE.md`. It does NOT override token values or component APIs. It adds the **personality layer** — the micro-decisions that separate a competent UI from a memorable one.

---

## 1. THE APPLE ANATOMY — What Makes It Memorable

Study these patterns extracted from Apple's Store pages. They apply directly to Soberana.

### 1.1 The Two-Tone Section Header

Apple's section headers use exactly two typographic weights on one line:

```
**The latest.** Take a look at what's new, right now.
```

- First fragment: **bold, black** (`text-foreground font-semibold`)
- Second fragment: **regular weight, gray** (`text-muted-foreground font-normal`)
- Both fragments sit on the same baseline, same `text-2xl` or `text-3xl` size
- No colon, no dash, no separator — just a period and a space

**Implementation pattern:**

```tsx
<h2 className="text-2xl lg:text-3xl tracking-tight">
  <span className="font-semibold text-foreground">The latest.</span>
  {' '}
  <span className="font-normal text-muted-foreground">
    Take a look at what's new, right now.
  </span>
</h2>
```

**When to use in Soberana:**
- Dashboard section headers: **"Your moves."** Recent cross-border transactions.
- Settings pages: **"Security."** How we protect what matters.
- Card headers: **"Smart Treasury."** Your money, always working.

**RULE: Every section header in Soberana MUST use this two-tone pattern.** Bold declarative fragment + lighter explanatory fragment. Never a single flat heading.

### 1.2 The Product Card Grid

Apple's product cards follow a precise hierarchy:

```
┌──────────────────────────────┐
│  [optional: "NEW" label]     │   ← text-xs uppercase tracking-wider
│                              │      text-destructive (orange-red)
│  Product Name                │   ← text-2xl font-semibold text-foreground
│  Tagline. Short. Punchy.     │   ← text-sm text-muted-foreground
│  From $X or $Y/mo.          │   ← text-xs text-muted-foreground
│                              │
│       [PRODUCT IMAGE]        │   ← Generous padding, product is hero
│       (bleeds to edges       │
│        or floats centered)   │
│                              │
└──────────────────────────────┘
```

**Key observations:**
- Card background: `bg-muted/30` (very subtle gray, NOT pure white on white page)
- Border: NONE. The background tint IS the container boundary
- Border-radius: generous (`rounded-2xl` in Apple's case; in Soberana use `rounded-xl`)
- Padding: `p-6 pb-0` — text has padding, image bleeds to bottom
- Image occupies 50-60% of card height
- Spacing between cards: `gap-4` (tight, creates rhythm)

**For Soberana, the equivalent is a Service/Product card:**

```tsx
<div className="rounded-xl bg-muted/30 p-6 pb-0 overflow-hidden">
  <Badge variant="secondary" className="text-[10px] uppercase tracking-widest mb-3">
    New
  </Badge>
  <h3 className="text-xl font-semibold text-foreground">Smart Treasury</h3>
  <p className="text-sm text-muted-foreground mt-1">
    Your idle funds, always earning.
  </p>
  <p className="text-xs text-muted-foreground mt-2">
    Starting from 0.05% daily yield
  </p>
  <div className="mt-6 -mb-1 flex justify-center">
    {/* illustration or icon, generous size */}
  </div>
</div>
```

### 1.3 The Value Proposition Strip

Apple's "Apple Store difference" section uses a horizontal strip of icon+text cards:

```
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│  [icon]  │  │  [icon]  │  │  [icon]  │  │  [icon]  │
│          │  │          │  │          │  │          │
│ Text w/  │  │ Text w/  │  │ Text w/  │  │ Text w/  │
│ colored  │  │ colored  │  │ colored  │  │ colored  │
│ links    │  │ links    │  │ links    │  │ links    │  
└─────────┘  └─────────┘  └─────────┘  └─────────┘
```

**Key details:**
- Icon: sits inside a very subtle container (no visible bg, just spacing)
- Icon style: line-art, single color, NOT filled
- Icon size: 28-32px (large enough to read, not so large it dominates)
- Text: mixed — black for informational, **colored for actionable links**
  - Links are colored semantically: blue for actions, green for delivery, purple for personalization
- Card background: `bg-card` (white card on very light gray page)
- Card corners: `rounded-xl`
- No hover elevation, no shadow — just subtle `hover:bg-muted/50` transition

**For Soberana, use this for benefit strips on landing or product pages:**

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  {benefits.map((b) => (
    <div key={b.id} className="rounded-xl bg-card border border-border/50 p-5 space-y-3">
      <b.icon className="h-7 w-7 text-muted-foreground" />
      <p className="text-sm text-foreground leading-relaxed">
        {b.textBefore}
        <span className="text-primary font-medium">{b.link}</span>
        {b.textAfter}
      </p>
    </div>
  ))}
</div>
```

### 1.4 The Product Showcase Row (Accessories / Audio)

Apple shows product carousels with this pattern:

```
┌──────────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  [Promo card      │  │ [Image]  │  │ [Image]  │  │ [Image]  │
│   with headline   │  │          │  │          │  │          │
│   and subtext     │  │ Label    │  │ Label    │  │ Label    │
│   over image]     │  │ Name     │  │ Name     │  │ Name     │
│                   │  │ $Price   │  │ $Price   │  │ $Price   │
└──────────────────┘  └──────────┘  └──────────┘  └──────────┘
```

**Key details:**
- First card is a "feature promo" — larger, with headline text over/above image
- Remaining cards are uniform product cards
- Price: `font-mono tabular-nums text-sm text-foreground`
- Small colored label above name: "Free Engraving" in green — `text-xs text-success font-medium`
- Color swatches: tiny dots (`w-3 h-3 rounded-full`) inline
- Carousel arrow: subtle circle button at right edge, `bg-muted/70 hover:bg-muted`

**For Soberana:** This maps to showing different service tiers, card products, or vault options.

---

## 2. THE 12 MICRO-PRINCIPLES

These are the invisible decisions that create the Apple feeling. Apply them to every component you build or review.

### P1: Background Layering (The Gray Sandwich)

Apple NEVER places white cards on a white background. The page itself has a very subtle warm gray, and cards sit on top in pure white (or vice versa in dark sections).

**In Soberana:**
- Page background: `bg-background` (which is `oklch(0.99 0 0)` — nearly white, NOT pure white)
- Card surface: `bg-card` — slightly different from background
- Inset sections: `bg-muted/30` or `bg-muted/50` — creates the "layer sandwich"
- NEVER: card with `bg-card` sitting directly on `bg-card` parent without ANY visual separation

```
PAGE (bg-background) → SECTION (bg-muted/30) → CARD (bg-card) → CONTENT
```

### P2: Border Reduction

Apple's cards have NO visible borders in most contexts. The background contrast IS the boundary.

**In Soberana:**
- Landing/marketing pages: prefer `bg-muted/30` with no border over `border border-border`
- Dashboard/operational pages: keep `border border-border` for data density
- RULE: If the background contrast is sufficient (`bg-card` on `bg-muted/30`), drop the border entirely. Add `border border-border/30` only when backgrounds are too similar.

### P3: Typography as Architecture

Apple uses only 3 distinct type sizes per section, with weight doing the heavy lifting:

| Role | Size | Weight | Color |
|------|------|--------|-------|
| Section title (bold part) | `text-2xl` or `text-3xl` | `font-semibold` | `text-foreground` |
| Section title (light part) | Same size | `font-normal` | `text-muted-foreground` |
| Card title | `text-lg` or `text-xl` | `font-semibold` | `text-foreground` |
| Body/tagline | `text-sm` | `font-normal` | `text-muted-foreground` |
| Meta/price/label | `text-xs` | `font-medium` | `text-muted-foreground` |

**RULE:** Never use more than 3 font sizes in a single section. If you need more hierarchy, use weight and color, not size.

### P4: The "NEW" / Status Label

Apple uses a tiny, uppercase, tracking-wide label to mark freshness:

```tsx
<span className="text-[10px] font-medium uppercase tracking-widest text-destructive">
  New
</span>
```

- Color: warm red/orange (`text-destructive` in Soberana maps to a warm tone)
- Position: ABOVE the title, never beside it
- No background, no badge container — just naked text
- For Soberana equivalents: "New", "Beta", "Updated", "Live"

### P5: Tagline Rhythm

Apple taglines are punchy, rhythmic, and use periods as pauses:

- "All out Pro." (3 words)
- "Feature stacked. Value packed." (antithesis)
- "The magic of Mac at a surprising price." (longer, melodic)

**For Soberana:**
- "Move money. Without borders." (antithesis)
- "Your treasury. Always earning." (possessive + continuous)
- "One API. Every rail." (contrast of singular vs. total)

**RULE:** Taglines must be 2-8 words. Use periods for rhythm. If it doesn't sound good spoken aloud, rewrite it.

### P6: Generous Image Space

Products/illustrations MUST occupy at least 40% of their container's vertical space. Apple lets images breathe. A card with 70% text and 30% image looks like a form, not a product showcase.

**For Soberana:** Even though we don't have physical products, illustrations, icons, and data visualizations deserve the same generous space. A stats card with a tiny chart crammed in the corner fails this principle.

### P7: Consistent Corner Radius

Apple uses ONE radius value across an entire section. Cards, images, input fields within those cards — all share the same corner radius.

**Soberana already codifies this:** `rounded-xl` for cards, `rounded-lg` for buttons/inputs, `rounded-md` for badges. Follow it religiously.

### P8: Color as Semantic Signal Only

In Apple's Store pages, color appears in exactly 3 contexts:
1. **Status labels**: "NEW" in orange-red
2. **Actionable links**: blue, green, purple — each with specific meaning
3. **Product images**: the product itself provides color

Everything else is grayscale (black text, gray text, white/gray backgrounds).

**For Soberana:**
- `text-foreground` and `text-muted-foreground` for all text
- `text-primary` ONLY for interactive links and primary actions
- `text-success`, `text-destructive`, `text-warning` ONLY for status indicators
- Brand gradient ONLY in designated brand moments (CTA buttons, logo, loading)
- NEVER use color for decoration. Every colored pixel must MEAN something.

### P9: The Invisible Grid

Apple's grid is always present but never visible. Cards align precisely, gutters are consistent, and nothing is "almost aligned."

**For Soberana:**
- Always use `grid` with explicit columns, not `flex flex-wrap` for card layouts
- Consistent gap: `gap-4` for card grids, `gap-3` for compact strips, `gap-6` for sections
- Mobile: always `grid-cols-1` or `grid-cols-2`, never try to squeeze 3+ on mobile

### P10: Scroll Peek

Apple's horizontal carousels always show a peek of the next card at the right edge. This signals "there's more" without needing a "See all" button.

**For Soberana:** When using horizontal scroll containers, ensure the last visible card is cut at approximately 30% visibility. Add `overflow-x-auto scrollbar-hide` and pad the container so the peek is natural.

### P11: Micro-copy Precision

Apple's meta text is surgically precise:
- "From $1099 or $45.79/mo. for 24 mo.*"
- Every element: price, installment, duration, asterisk — all present, all tiny, all `text-xs text-muted-foreground`

**For Soberana:** Financial micro-copy (fees, rates, durations) must ALWAYS use:
```tsx
<span className="text-xs text-muted-foreground font-mono tabular-nums">
  From 0.5% per transfer · Settlement in 24h
</span>
```

### P12: No Decoration Without Purpose

Apple uses zero decorative elements. No divider lines between cards. No background patterns. No gradients on cards. No icons for decoration.

**For Soberana:**
- Remove any `<hr>` or `<Separator>` that isn't absolutely necessary
- Remove any background gradient on cards (brand gradient is for CTAs only)
- If an icon doesn't communicate specific meaning, remove it
- Whitespace IS the separator. Trust the grid and spacing.

---

## 3. SECTION TEMPLATES

### 3.1 Dashboard Overview Section

```tsx
{/* Section header — two-tone */}
<div className="space-y-1 mb-6">
  <h2 className="text-2xl tracking-tight">
    <span className="font-semibold text-foreground">Overview.</span>
    {' '}
    <span className="font-normal text-muted-foreground">
      Your financial activity at a glance.
    </span>
  </h2>
</div>

{/* Stats grid — consistent cards on subtle background */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <StatsCard ... />
  <StatsCard ... />
  <StatsCard ... />
</div>
```

### 3.2 Product/Service Card Grid

```tsx
<section className="space-y-6">
  <h2 className="text-2xl lg:text-3xl tracking-tight">
    <span className="font-semibold text-foreground">Services.</span>
    {' '}
    <span className="font-normal text-muted-foreground">
      Everything you need to move money globally.
    </span>
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {services.map((s) => (
      <div
        key={s.id}
        className="rounded-xl bg-muted/30 p-6 pb-0 overflow-hidden group cursor-pointer"
      >
        {s.isNew && (
          <span className="text-[10px] font-medium uppercase tracking-widest text-destructive">
            New
          </span>
        )}
        <h3 className="text-lg font-semibold text-foreground mt-1">{s.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{s.tagline}</p>
        <div className="mt-6 flex justify-center">
          <s.illustration className="h-32 w-auto opacity-90 group-hover:opacity-100 transition-opacity duration-150" />
        </div>
      </div>
    ))}
  </div>
</section>
```

### 3.3 Benefits/Value Strip

```tsx
<section className="space-y-6">
  <h2 className="text-2xl tracking-tight">
    <span className="font-semibold text-foreground">The Soberana advantage.</span>
    {' '}
    <span className="font-normal text-muted-foreground">
      Built different, by design.
    </span>
  </h2>

  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
    {benefits.map((b) => (
      <div key={b.id} className="rounded-xl bg-card border border-border/30 p-5 space-y-3">
        <b.icon className="h-7 w-7 text-muted-foreground" />
        <p className="text-sm text-foreground leading-relaxed">
          {b.description}
        </p>
      </div>
    ))}
  </div>
</section>
```

### 3.4 Empty State

```tsx
<div className="flex flex-col items-center justify-center py-16 space-y-4">
  <EmptyIcon className="h-12 w-12 text-muted-foreground/50" />
  <div className="text-center space-y-1">
    <p className="text-lg font-semibold text-foreground">No transactions yet.</p>
    <p className="text-sm text-muted-foreground">
      Your cross-border moves will appear here.
    </p>
  </div>
  <Button variant="gradient" size="sm">
    Start your first move
  </Button>
</div>
```

---

## 4. REVIEW CHECKLIST

Before delivering any UI component or page, verify EVERY item:

### Typography
- [ ] Section headers use two-tone pattern (bold + light)?
- [ ] Maximum 3 font sizes per visible section?
- [ ] Weight and color create hierarchy, not just size?
- [ ] Taglines are punchy (2-8 words), use periods for rhythm?
- [ ] Financial data uses `font-mono tabular-nums`?

### Layout & Space
- [ ] Background layering: page → section → card have distinct tones?
- [ ] Cards on marketing/landing pages: prefer `bg-muted/30` over bordered cards?
- [ ] Grid used (not flex-wrap) for card layouts?
- [ ] Consistent gap: `gap-4` cards, `gap-3` compact, `gap-6` sections?
- [ ] Generous whitespace — no section feels cramped?
- [ ] Images/illustrations occupy 40%+ of their container?

### Color Discipline
- [ ] Color used ONLY for: status labels, actionable links, brand moments?
- [ ] All body text is `text-foreground` or `text-muted-foreground`?
- [ ] No decorative colors on cards, backgrounds, or dividers?
- [ ] "NEW/Beta" labels: `text-[10px] uppercase tracking-widest text-destructive`?

### Micro-details
- [ ] No unnecessary borders (background contrast suffices)?
- [ ] No decorative dividers, patterns, or gradients?
- [ ] Consistent corner radius within sections?
- [ ] Horizontal carousels show peek of next item?
- [ ] Meta/price text: `text-xs text-muted-foreground font-mono tabular-nums`?

### Personality
- [ ] Does the component communicate trust and quiet authority?
- [ ] Would this look at home on apple.com? (clarity, not flashiness)
- [ ] Is there enough negative space for the content to breathe?
- [ ] Does every visible element earn its place? (remove anything decorative)

---

## 5. ANTI-PATTERNS — What Apple (and Soberana) Never Do

| Never | Why | Instead |
|-------|-----|---------|
| Gradient backgrounds on cards | Gradients are for brand CTAs only | `bg-muted/30` or `bg-card` |
| Colored icon backgrounds (blue circle behind icon) | Adds visual noise | Icon in `text-muted-foreground`, no background |
| Multiple CTA buttons in one card | Decision paralysis | One primary action per card |
| All-caps titles | Screams, doesn't speak | Sentence case, let weight do the work |
| Dense bullet lists in cards | Data dump, not design | Max 3 items, or restructure as sub-cards |
| Shadow on every card | Shadow implies elevation; overuse flattens hierarchy | `shadow-none` default, `shadow-sm` only for active/floating states |
| Colorful borders | Borders should be invisible infrastructure | `border-border/30` or no border |
| Animation on load for every element | Overstimulation | Animate only the hero or primary content |
| `transition-all` | Animates layout shifts, causes jank | `transition-colors duration-150` or `transition-opacity duration-150` |

---

## 6. VOICE IN UI COPY

Derived from the Apple Marcom philosophy (see `.claude/skills/loopay-marcom/SKILL.md`), adapted for fintech:

### Headlines: The Destillation Rule

Every heading must pass the "Destillation" test from the Joz/Myhren framework:

1. **Specification**: "Cross-border payment processing with multi-rail settlement"
2. **Destillation**: "Send money anywhere, settle fast"
3. **Marcom headline**: **"Every border. One click."**

### Button Labels

| Bad (corporate) | Good (Apple-voice) |
|---|---|
| Submit Transaction | Send now |
| Create New Transfer | Start a move |
| Configure Settings | Customize |
| View All Transactions | See all moves |
| Generate Report | Get your report |

### Empty States

Empty states are an opportunity for personality:
- "No moves yet." (not "No transactions found")
- "Your treasury is ready." (not "Treasury account balance: $0.00")
- "Cards are coming soon." (not "Feature unavailable")

### Error Messages

- "Something went wrong. We're on it." (not "Error 500: Internal Server Error")
- "Can't reach the network right now." (not "Network request failed")
- "That didn't work. Try again?" (not "Operation failed. Please retry.")

---

## 7. DARK MODE CONSIDERATIONS

Apple's dark mode is not just an inversion. Observe:

- Backgrounds go to near-black, NOT pure black (`oklch(0.13...)` in Soberana)
- Cards become slightly lighter than background (NOT white)
- Text shifts to near-white, muted text stays medium gray
- Borders become MORE visible (the background contrast trick reverses)
- Images should not have white backgrounds that glow

**For Soberana dark mode:**
- Card `bg-card` on dark is already slightly elevated — keep it
- ADD `border border-border/50` to cards that had no border in light mode
- Ensure illustrations/icons work on dark backgrounds
- Brand gradient reads identically on both modes

---

## 8. RESPONSIVE STRATEGY

Apple's responsive approach:

| Breakpoint | Cards per row | Section header size | Card padding |
|---|---|---|---|
| Mobile (<640px) | 1-2 | `text-xl` | `p-4` |
| Tablet (640-1024px) | 2-3 | `text-2xl` | `p-5` |
| Desktop (>1024px) | 3-4 | `text-2xl lg:text-3xl` | `p-6` |

**RULE:** On mobile, never show more than 2 cards per row. Horizontal scroll is preferred for 3+ items on mobile, with the peek pattern (P10).

---

## 9. APPLYING TO EXISTING SOBERANA COMPONENTS

When reviewing or editing existing components, apply this skill by:

1. **StatsCard**: Add two-tone section header above the grid. Ensure icon has no colored background circle. Verify `font-mono tabular-nums` on all numbers.

2. **DataTable**: Replace generic empty state with personality copy. Add two-tone header. Use `bg-muted/30` for alternating row hints instead of borders.

3. **ServiceTabs (Landing)**: Already well-structured. Enhance descriptions to pass the Destillation test. Ensure tab container uses `bg-muted/30` not `bg-muted/50`.

4. **Sidebar**: Already compliant. Navigation labels could use the meta style: `text-[10px] uppercase tracking-widest` for section labels.

5. **Card containers**: Audit all Card usages. Marketing/showcase contexts should prefer `bg-muted/30` borderless. Operational contexts keep borders.

---

*This skill is the visual conscience of Soberana. When in doubt, remove. When unsure about color, don't use it. When a section feels flat, add space, not decoration. The luxury is in what you chose NOT to include.*
