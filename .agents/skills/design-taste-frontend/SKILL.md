---
name: design-taste-frontend
description: Anti-slop frontend skill for landing pages, portfolios, and redesigns. The agent reads the brief, infers the right design direction, and ships interfaces that do not look templated. Real design systems when applicable, audit-first on redesigns, strict pre-flight check.
---

# tasteskill: Anti-Slop Frontend Skill

> Landing pages, portfolios, and redesigns. Not dashboards, not data tables, not multi-step product UI.
> Every rule below is **contextual**. None of it fires automatically. First read the brief, then pull only what fits.

---

## 0. BRIEF INFERENCE (Read the Room Before Anything Else)

Before touching code or tweaking dials, **infer what the user actually wants**. Most LLM design output is bad because the model jumps to a default aesthetic instead of reading the room.

### 0.A Read these signals first
1. **Page kind** - landing (SaaS / consumer / agency / event), portfolio (dev / designer / creative studio), redesign (preserve vs overhaul), editorial / blog.
2. **Vibe words** the user used - "minimalist", "calm", "Linear-style", "Awwwards", "brutalist", "premium consumer", "Apple-y", "playful", "serious B2B", "editorial", "agency-y", "glassy", "dark tech".
3. **Reference signals** - URLs they linked, screenshots they pasted, products they named, brands they're competing with.
4. **Audience** - B2B procurement panel vs. design-conscious consumer vs. recruiter scanning a portfolio.
5. **Brand assets that already exist** - logo, color, type, photography.
6. **Quiet constraints** - accessibility-first audiences, public-sector, regulated industries, trust-first commerce, kids' products. These constraints OVERRIDE aesthetic preference.

### 0.B Output a one-line "Design Read" before generating
Before any code, state: **"Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <design system or aesthetic family>."**

### 0.C If the brief is ambiguous, ask one question, do not guess
Ask exactly **one** clarifying question, never a multi-question dump.

### 0.D Anti-Default Discipline
Do not default to: AI-purple gradients, centered hero over dark mesh, three equal feature cards, generic glassmorphism on everything, infinite-loop micro-animations everywhere, Inter + slate-900.

---

## 1. THE THREE DIALS (Core Configuration)

* **DESIGN_VARIANCE: 8** - 1 = Perfect Symmetry, 10 = Artsy Chaos
* **MOTION_INTENSITY: 6** - 1 = Static, 10 = Cinematic / Physics
* **VISUAL_DENSITY: 4** - 1 = Art Gallery / Airy, 10 = Cockpit / Packed Data

### 1.A Dial Inference
| Signal | VARIANCE | MOTION | DENSITY |
|---|---|---|---|
| "minimalist / clean / calm / editorial / Linear-style" | 5-6 | 3-4 | 2-3 |
| "premium consumer / Apple-y / luxury / brand" | 7-8 | 5-7 | 3-4 |
| "playful / wild / Dribbble / Awwwards / experimental / agency" | 9-10 | 8-10 | 3-4 |
| "landing page / portfolio / marketing site (default)" | 7-9 | 6-8 | 3-5 |
| "trust-first / public-sector / regulated / accessibility-critical" | 3-4 | 2-3 | 4-5 |

### 1.B Use-Case Presets
| Use case | VARIANCE | MOTION | DENSITY |
|---|---|---|---|
| Landing (SaaS, mainstream) | 7 | 6 | 4 |
| Landing (Agency / creative) | 9 | 8 | 3 |
| Landing (Premium consumer) | 7 | 6 | 3 |
| Portfolio (Designer / studio) | 8 | 7 | 3 |
| Portfolio (Developer) | 6 | 5 | 4 |

---

## 2. BRIEF TO DESIGN SYSTEM MAP

### 2.A When to reach for a real design system
| Brief reads as... | Reach for |
|---|---|
| Microsoft / enterprise SaaS | @fluentui/react-components |
| Google-ish UI, Material-flavored | @material/web + Material 3 tokens |
| IBM-style B2B / enterprise analytics | @carbon/react + @carbon/styles |
| Shopify app surfaces | polaris.js / Polaris React |
| GitHub-style devtool | @primer/css or @primer/react-brand |
| Public-sector UK service | govuk-frontend |
| US public-sector / trust-first | uswds |
| Modern SaaS where you own components | shadcn/ui |
| Tailwind-based modern SaaS / AI marketing | Tailwind v4 utilities |

**One system per project.** Do not mix systems.

### 2.B Aesthetics (no official package)
| Aesthetic | Implementation |
|---|---|
| Glassmorphism | backdrop-filter, layered borders, highlight overlays |
| Bento (Apple-style tile grids) | CSS Grid with mixed cell sizes |
| Brutalism | Native CSS, monospace, raw borders |
| Editorial / magazine | Serif type, asymmetric grid, generous whitespace |
| Dark tech / hacker | Mono + accent neon, terminal motifs |
| Aurora / mesh gradients | SVG or layered radial gradients |

---

## 3. DEFAULT ARCHITECTURE & CONVENTIONS

### 3.A Stack
* **Framework:** React or Next.js. Default to Server Components (RSC).
* **Styling:** Tailwind v4 (default).
* **Animation:** Motion (motion/react). Import `import { motion } from "motion/react"`.
* **Fonts:** Self-host with @font-face + font-display: swap. Never link Google Fonts via <link> in production.

### 3.B State
* Local useState / useReducer for isolated UI.
* **NEVER** use useState to track continuous values (mouse position, scroll, pointer physics). Use Motion's useMotionValue / useTransform / useScroll.

### 3.C Icons
* **Allowed (priority order):** @phosphor-icons/react, hugeicons-react, @radix-ui/react-icons, @tabler/icons-react.
* **Discouraged:** lucide-react (acceptable only when project already depends on it).
* **NEVER hand-roll SVG icons.**
* **One family per project.**

### 3.D Emoji Policy
Discouraged by default. Replace symbols with icon-library glyphs.

### 3.E Responsiveness & Layout Mechanics
* Contain layouts using max-w-[1400px] mx-auto or max-w-7xl.
* **NEVER** use h-screen for Hero sections. ALWAYS use min-h-[100dvh].
* **Grid over Flex-Math:** NEVER use complex flexbox percentage math.

### 3.F Dependency Verification (mandatory)
Before importing ANY 3rd-party library, check package.json first.

---

## 4. DESIGN ENGINEERING DIRECTIVES

### 4.1 Typography
* Display / Headlines: Default text-4xl md:text-6xl tracking-tighter leading-none
* Body / Paragraphs: Default text-base text-gray-600 leading-relaxed max-w-[65ch]
* **Discouraged as default:** Inter. Pick Geist, Outfit, Cabinet Grotesk, Satoshi first.
* **SERIF DISCIPLINE:** Serif is very discouraged as default. Only acceptable when brand brief names a serif font, OR aesthetic is genuinely editorial/luxury/heritage.
* **BANNED as defaults:** Fraunces and Instrument_Serif.

### 4.2 Color Calibration
* Max 1 accent color. Saturation < 80% by default.
* **THE LILA RULE:** AI Purple / Blue glow is discouraged. Use neutral bases (Zinc/Slate/Stone) with high-contrast singular accents.
* **COLOR CONSISTENCY LOCK (mandatory):** Accent chosen for a page is used on the WHOLE page.
* **PREMIUM-CONSUMER PALETTE BAN (mandatory):** warm beige/cream + brass/clay/oxblood is BANNED as default.

### 4.3 Layout
* **ANTI-CENTER BIAS:** Centered Hero sections avoided when DESIGN_VARIANCE > 4. Use Split Screen, left-aligned content/right-aligned asset, or asymmetric whitespace.

### 4.4 Cards & Shadows
* Use cards ONLY when elevation communicates real hierarchy.
* **SHAPE CONSISTENCY LOCK (mandatory):** ONE corner-radius scale per page.

### 4.5 Interactive UI States
* **Loading:** Skeletal loaders matching layout shape.
* **Tactile Feedback:** On :active, use -translate-y-[1px] or scale-[0.98].
* **BUTTON CONTRAST CHECK (mandatory):** WCAG AA min 4.5:1.
* **CTA BUTTON WRAP BAN (mandatory):** Button text MUST fit on one line at desktop.
* **NO DUPLICATE CTA INTENT (mandatory):** One label per intent.

### 4.7 Layout Discipline (Hard Rules - Failing any = shipping broken work)
* **Hero MUST fit in initial viewport.** Headline max 2 lines, subtext max 20 words.
* **HERO TOP PADDING CAP:** Max pt-24 at desktop.
* **HERO STACK DISCIPLINE:** Max 4 text elements (eyebrow, headline, subtext, CTAs).
* **Navigation MUST render on a single line on desktop.** Max 80px height.
* **Section-Layout-Repetition Ban.** Each layout family appears at most ONCE.
* **ZIGZAG ALTERNATION CAP:** Max 2 consecutive image+text-split sections.
* **EYEBROW RESTRAINT:** Maximum 1 eyebrow per 3 sections.
* **SPLIT-HEADER BAN:** Left headline + right explainer paragraph is banned as default.
* **Bento Background Diversity:** At least 2-3 cells with real visual variation.
* **Mobile collapse must be explicit per section.**

### 4.8 Image & Visual Asset Strategy
1. **Image-generation tool first.** Use generate_image or equivalent for section assets.
2. **Real web images second.** Use https://picsum.photos/seed/{descriptive-seed}/{w}/{h}.
3. **Last resort:** Leave labeled placeholder slots.
* **Div-based fake screenshots are BANNED.**
* **Hero needs a real visual.**

### 4.9 Content Density
* Default per section: headline <= 8 words, sub-paragraph <= 25 words, one asset or CTA.
* **COPY SELF-AUDIT (mandatory before ship):** Re-read every visible string. Flag broken grammar, AI-hallucination sounds, unclear referents.
* **Fake-precise numbers:** Must come from real data or be labeled as mock.

### 4.10 Quotes & Testimonials
* Max 3 lines of quote text visible by default.
* Real names and real roles only.
