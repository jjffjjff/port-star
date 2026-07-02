# oj-look Design System

**oj-look** is an all-purpose, warm-dark design language for building coherent apps and prototypes. It is the compiled form of the published **`@design-bible/ui`** React library (v1.0.0) — the "Design Bible" system: a warm dark canvas, one strategic amber accent, three typefaces with strict roles, tight radii, and depth from a surface ladder rather than shadows.

The vibe should read in five seconds: **warm, technical, personal — not corporate.**

## Sources

Built from the read-only mounted codebase `ds-package/` (File System Access API):
- `ds-package/src/` — the real upstream React library: `tokens.css`, `fonts.css`, `base.css`, and 9 components under `src/components/`.
- `ds-package/docs/guides/` — `design-system.md`, `components.md`, `implementation-guide.md` (the brand's own guidance).
- `ds-package/ds-bundle/` — a prior compiled bundle (`@design-bible/ui@1.0.0`) with per-component `.prompt.md` / `.d.ts` / variant HTML.

No logo, brand imagery, or product screens were present in the source. Where a mark would go, the name is set in Inter 600 (`oj·look`).

---

## Content Fundamentals

How oj-look writes copy — quiet, human, and specific.

- **Voice:** understated and warm, never salesy. Short declaratives. Lowercase editorial fragments carry the human moments ("a quiet place to think", "a place to keep what you notice").
- **Casing:** Sentence case for UI labels and buttons ("Open project", "New project", "View all projects"). Nav items are single words ("Work", "Gallery", "Globe"). ALL-CAPS is reserved for tiny mono captions/labels with letter-spacing.
- **Person:** neutral / imperative for actions ("Archive", "Get started"). Second person ("you") only in editorial lines ("every place *you've* saved"). Avoid "we".
- **Tone examples:** headings are plain nouns ("Projects", "Inspiration", "Globe"); metadata is factual and terse ("42 places · updated 2025-07-01"); errors are calm and direct ("Couldn't reach the server.", "This slug is already in use.").
- **Emoji:** none. Never used.
- **Editorial device:** an Instrument Serif *italic* subtitle under a structural heading is the signature move — one small human line beneath the machine-readable one.

---

## Visual Foundations

- **Color / mood:** warm dark, brown undertone — **never pure black**. Canvas `#2b2622` → surface `#3a332e` → surface-raised `#4a4239`. Off-white text `#f7f5f0` / `#b8b0a6`. Imagery skews **warm** (terracotta, amber, dusk), never cool or blue.
- **Accent discipline:** amber `#F3AD2E` appears in exactly three places — primary CTA fill, focus ring, active nav indicator. Nowhere else. Scarcity is the point.
- **Type:** three families, strict roles — **Inter** (structure: nav, body, labels), **Instrument Serif italic** (editorial voice: titles, captions), **DM Mono** (metadata: dates, slugs, coordinates). Display 64/600 with −3px tracking; body 21/300. Headings use tight negative tracking.
- **Spacing:** 4px grid (xs 4 → xl 32), generous 96px section rhythm.
- **Radii:** tight — input 4, button 6, card 8, technical/globe panels 0. **Never pills.**
- **Depth / shadows:** **no drop shadows.** Depth comes from the surface ladder + **1px hairline borders** (`#5a5249`). The only permitted shadow is an *inset* one on the globe sphere itself.
- **Borders:** 1px hairline everywhere for definition and separation.
- **Backgrounds:** flat warm surfaces. No gradients on chrome; gradients appear only as warm image placeholders and the globe sphere (radial). No repeating patterns or textures.
- **Hover states:** buttons brighten (amber → `#f5bb4d`); ghost/secondary borders lighten toward secondary text; text buttons drop to 0.8 opacity; sidebar/nav items shift text to primary + a 3–5% white wash.
- **Press states:** `transform: scale(0.97)` micro-interaction on buttons (0.1s ease). No bounce.
- **Focus:** `2px solid #F3AD2E` with 2px offset — amber, **never browser blue**. Inputs may add a `0 0 0 2px rgba(243,173,46,0.2)` glow.
- **Motion:** restrained. 0.1s press, 0.15s hover/color transitions. No infinite/decorative loops.
- **Transparency / blur:** used sparingly — dialog overlay is `rgba(20,17,15,0.6)` with a light `blur(2px)`. Tinted badge fills use 15%-alpha of their semantic color.
- **Cards:** surface fill, 1px border, 8px radius, 20px padding, **no shadow**. `globe-panel` variant is full-bleed, borderless, 0 radius.

---

## Iconography

**Phosphor Icons** (regular weight, 18–32px) are now available via CDN and bundled in `styles.css`. Regular weight is technical, geometric, and pairs perfectly with the warm-dark aesthetic — never bold consumer-app style.

**Usage:**
- **Icon sizes:** 18px (inline text), 20px (standard nav/buttons), 24px (standalone actions), 32px (hero actions/headers).
- **Colors:** `var(--db-text-primary)` for primary icons, `var(--db-text-secondary)` for secondary/deemphasis, `var(--db-accent)` only on primary CTAs (rare).
- **Never:** gray placeholder icons, disabled states, or emoji.

**Recommended icons by context:**
- Navigation: `house`, `folder`, `photo`, `globe`, `magnifying-glass`
- Actions: `plus`, `pencil`, `trash`, `arrow-up-right`, `gear`, `x`, `floppy-disk`
- Status: `check-circle`, `warning-circle`, `x-circle`, `info`

**Implementation:** Use the `ph` class with data attributes:
```html
<i class="ph ph-regular" data-icon="house" style="font-size: 20px;"></i>
```

Or via Phosphor's web component (if preferred):
```html
<script src="https://unpkg.com/@phosphor-icons/web"></script>
<ph-house weight="regular"></ph-house>
```

This is an **intentional addition** — Phosphor is not in the upstream source but aligns perfectly with oj-look's technical minimalism.

---

## Index / Manifest

**Root**
- `styles.css` — the single stylesheet entry (import this one file). `@import`s tokens + component CSS.
- `readme.md` — this file.
- `SKILL.md` — Agent-Skill front-matter for download/use in Claude Code.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `radii.css`, `effects.css`, `base.css`.
- `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json` — compiler-generated (do not edit).

**Components** (`components/general/<Name>/` — `.jsx` + `.css` + `.d.ts` + `.prompt.md` + card HTML), reached via `window.OjLookDesignSystem_3777b9.*`:
- `Typography` — 8 roles across the three typefaces.
- `Button` — primary / secondary / text; sm / md / lg.
- `Input` — field or textarea, label + error.
- `Card` — standard surface panel; globe-panel full-bleed.
- `Alert` — inline feedback, semantic left border.
- `Badge` — compact status label, tinted fills.
- `Container` — centered 1200px content column.
- `TopBar` — horizontal nav, amber underline active.
- `Sidebar` — directory nav, amber left border active.

**Foundations** (`foundations/*.html`) — Design System tab specimen cards: Colors (surface, accent, text/semantic), Type (structure, body, editorial/mono), Spacing (scale, radius), Brand (wordmark, depth, focus/press, principles).

**UI kits** (`ui_kits/`)
- `meridian/` — a warm-dark creative workspace (projects directory, inspiration gallery, globe view, new-project flow). See `ui_kits/meridian/README.md`.

## Loading (consumers)

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
```
Components are then at `window.OjLookDesignSystem_3777b9.*`. Mount into a dedicated node, not the host's own React root.

## Caveats / substitutions
- **Fonts** load from the Google Fonts CDN (Inter, Instrument Serif, DM Mono) exactly as the source did — no font binaries ship with the system. If you need self-hosted fonts, supply the files.
- **No logo** was provided; the wordmark is plain type.
- **No icon set** exists in the source; any icons in a consuming project are a flagged substitution.
