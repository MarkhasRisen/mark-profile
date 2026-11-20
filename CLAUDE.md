# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page personal portfolio for Mark Risen Caparas. The entire site is **one self-contained file: `index.html`** (~1580 lines). CSS lives in an inline `<style>` block in `<head>` (plus a tiny second `<style>` block ~line 275), and all site JS lives in one inline `<script>` block near the end (~line 1209). There is **no build system, no framework, no package.json, no tests, and no linter.**

External resources loaded by the page: Google Fonts, Umami analytics (`cloud.umami.is`, in `<head>`), and the Credly badge embed script (`cdn.credly.com`, last line of `<body>`). Everything else is local.

`.agents/AGENTS.md` is a short rules summary for other agents that points back to this file. If you change a convention here, update it there too.

## Develop & deploy

- **Preview:** open `index.html` directly in a browser (`file://`). Changes appear on refresh. There is no dev server.
- **Deploy:** GitHub Pages serves the `main` branch root. Pushing to `main` publishes; the live site is https://markhasrisen.github.io/mark-profile/ and rebuilds ~1–2 min after a push.
- **Pushing:** `gh` CLI is not installed and git cannot prompt for credentials in this environment. Pushing requires a GitHub PAT embedded in the remote URL, then restored:
  ```
  git remote set-url origin https://<TOKEN>@github.com/MarkhasRisen/mark-profile.git
  git push origin main
  git remote set-url origin https://github.com/MarkhasRisen/mark-profile.git
  ```
  `.claude/` is gitignored because the harness captures approved `set-url` commands (with the token) into `.claude/settings.json`. Keep it ignored. Only commit/push when the user explicitly asks.

## Critical: case-sensitive asset paths

The repo is developed on **Windows (case-insensitive)** but served by **GitHub Pages on Linux (case-sensitive)**. A path that works locally can 404 in production. Folder casing in git is not always what you'd expect — e.g. git tracks `CCS student leader/` (lowercase) and `Paragon/` (capital P) even though the local folders display differently. **Always match the casing in `git ls-files`, not the local folder.** An untracked file also 404s in production even though it loads locally. After editing asset references, run this in Git Bash (the Bash tool) to verify that every reference resolves to a tracked file with exact case:
```
T="$(git ls-files)"
grep -oE '(src|href)="[^"]+\.(jpg|jpeg|png|webp|pdf|mp4|svg)"' index.html \
  | sed -E 's/^(src|href)="//; s/"$//' | grep -v '^https' | sort -u \
  | while read -r r; do printf '%s\n' "$T" | grep -qxF "$r" || echo "MISSING: $r"; done
```
Any `MISSING:` line is a production 404.

## Architecture & conventions

- **Theming:** CSS custom properties are defined in `:root{` (~line 35); dark mode overrides live under `:root[data-theme="dark"]` (~line 45). With no saved choice the page follows the OS `prefers-color-scheme` (live); once the toggle is clicked, the choice persists to `localStorage` key `mrc-v2-theme` and wins. A one-line script in `<head>` applies the theme before first paint (keep its logic in sync with `initTheme`, which syncs the sun/moon icons and `aria-pressed`). Wrap any `localStorage` access in try/catch — an uncaught throw inside one `initX()` aborts every init after it. Brand tokens: `--bg`, `--ink`, `--accent` (terracotta `#c4623a`), `--sage`, `--white` (note: `--white` is theme-adaptive — it is dark in dark mode, so use it for cards rather than a literal `#fff`). Exception: logo panels for AGAILA and ReColor deliberately use a hardcoded `background:#ffffff` so the dark artwork stays visible in dark mode.
- **Styling style:** most layout is inline `style="..."` attributes on elements rather than classes; follow the surrounding markup's pattern when editing a section.
- **Readability floor:** no text below `font-size:10px`. Muted greys `--ink-3`/`--ink-4` were tuned for contrast (light: ≈5.5:1 / ≈3.7:1; dark was raised to ≈8.2:1 / ≈6.3:1 on `--bg` because the dimmer values were hard to read) — never move them closer to the background; use `--ink-4` only for meta labels, never body copy.
- **Card hover:** add `card-lift` to any new card (projects, experience, credentials, awards, leadership, initiatives and VeloBuild cards all use it). It lifts via the `translate` property (not `transform`, which `.fade-up` owns) and uses `!important` box-shadow to beat inline shadows. Don't add per-card `:hover` rules.
- **Motion & brand touches:** theme toggle does a circular reveal via `document.startViewTransition` (instant swap if unsupported or reduced motion). Section heading rules carry `class="sec-rule"` and draw in once via `initSectionRules` (hidden state gated on `html.js-anim`, observer watches the heading row because a `scaleX(0)` rule has no area). Hero slides zoom while `.active` (the slideshow toggles that class); `#about::before` paints the glow/dot texture using `--hero-glow`/`--hero-dot`. Global `::selection`, `:focus-visible`, scrollbar and `text-wrap:balance|pretty` rules live near the top of the `<style>` block.
- **Testing in headless Chrome:** IntersectionObserver doesn't fire on programmatic scroll under `--virtual-time-budget`, so test scroll-triggered features with a window tall enough to show the whole page.
- **Photo frames:** `[data-photo]` CSS owns the frame — 8px radius, 180px thumbnail height, hover zoom/dim and an expand badge (`::after`). Don't put `border-radius` on the `<img>` or wrapper inline. Single large photos use `class="photo-feature"` (380px, 240px on mobile) with an inline `object-position` to pick the focal point. ReColor phone screenshots (`data-pg="recolor"`) and the QuadLearning doc preview intentionally keep their own sizing.
- **Footer:** `footer.site-foot` (styles under `/* Footer */`): brand blurb + status pill, Explore links, Connect (socials + CV), bottom bar with `#footTop`. If the CV filename changes, update it in the nav, hero **and** footer.
- **Nav breakpoints:** the 10 desktop links tighten below 1240px and collapse into the `#navToggle` menu below 1100px. If you add a nav link, re-check widths around 1100–1280px.
- **Type system:** Sora (headings), Source Serif 4 (body), IBM Plex Mono (labels/meta).
- **JS bootstrap:** a single `DOMContentLoaded` handler (~line 1264) calls a series of `initX()` functions (`initTheme`, `initScrollSpy`, `initLightbox`, `initSlideshow`, `initExpand`, `initAnimations`, `initCounters`, `initContactForm`, `initSectionNums`, etc.). To add behavior, write an `initX()` function and call it from that handler.
- **Lightbox:** shared DOM (`#v2-lb`). Photo sets are grouped independently by the `data-pg` attribute on `[data-photo]` wrappers (values like `ql`, `carina`, `recolor`, `optum`, `moments`); the creatives masonry uses `[data-gal]` as one group that follows the active Creatives filter (hidden tiles are skipped; built on click, not at init). Adding a new `data-pg` value automatically forms a new navigable group — no JS change needed. `initLightbox` also makes every tile keyboard-focusable (`tabindex`/`role="button"`, Enter/Space opens) and hides prev/next/counter for one-image groups, so give each tile's `<img>` a real `alt` (it becomes the tile's label).
- **Experience timeline:** Experience is an `<ol class="exp-timeline">`; each role is an `<li class="exp-item">` holding an `.exp-mark` (dot + "YEAR · Company" label) and an `.exp-card`. Newest first; only the newest gets `exp-item--latest` (filled dot). `.exp-card` is a 300px photo column + text; add `exp-card--banner` for wide/group photos to put the photo full-width on top instead. Each role is tinted with its company brand via a `--brand` variable set by a modifier class (`exp-item--concentrix` blue, `exp-item--optum` orange; tokens `--cx-blue`/`--optum-orange` in `:root` and dark mode). The card markup uses `var(--brand)`, not `var(--accent)`; a new role needs its own modifier class and tokens.
- **Leadership:** opens with a `.lead-capstone` banner for Student Leader of the Year (AY 2025–26). It is framed as the culmination of all the roles below, not tied to one org, and uses the stage photo (`data-pg="leadership-award"`). Then two featured `.lead-feature` cards, highest office first: (1) LYCESGO PRO + College Rep (one seat; accent top border, `.lead-gallery` = square pubmat + two thumbnails, `data-pg="lycesgo"`, `.lead-also` pill, `.lead-bullet` list, officer-statement quote); (2) SATA President, text-only (`lead-feature--text`; SATA is now the CCS Student Government, noted via `.lead-now`; `.lead-stats` counters, adviser quote, `.lead-path` mini-timeline that goes vertical below 480px). Then a 2-col `.v2-lead-grid` of `.lead-role` cards ("Other roles") and a one-line `.lead-earlier`. Photos live in `leadership/`. Styles live under the `/* Leadership: ... */` comment in the main `<style>` block. The header count ("10 ROLES") and the stats-bar "10+ Leadership Roles" must stay in sync with the roles listed.
- **Awards:** grouped into "Research & Academic" and "Leadership" (`.aw-group-label`). ReColor's three honors share one `.aw-feature` card (`.aw-gallery` photos with `data-pg="recolor-awards"`, a starred `.aw-list` timeline: Best CS Thesis May 4, Best Research SSH Champion May 14 at the University Research Colloquium, CCS Achiever of the Year Jun 19, plus an expandable awarding video and a link to `#recolor`, the ReColor project card). Leadership awards are an `.aw-pair` of `.aw-card`s linking to `#leadership`; extra lightbox photos can sit in `[data-photo][hidden]` siblings with the same `data-pg`. Photo files in `CCS Achiever/` actually show the ReColor/SSH recognition. Header says "5 AWARDS · 2026"; keep it and the stats-bar "5 Awards" in sync. Styles live under the `/* Awards: ... */` comment.
- **Community Initiatives:** a `.ci-arc` 3-step timeline (Carina relief Aug 2024 → Tech Forward Oct 2024 → founded VeloBuild Jul 2026, linking to `#velobuild`; goes vertical below 480px), then a `.ci-pair` of photo-led `.ci-card`s (`.ci-gallery` = main photo + two thumbs, `data-pg="tf"` / `"carina"`). Each card states the role in a `.ci-role` pill: Tech Forward = organizer as SATA President (stats 150+ / 3 tracks / SDG 4 only); Carina = SATA participated in a relief operation organized by LPU-Cavite Community Outreach as Service Learning (no numbers on purpose). VeloBuild has its own section, so don't re-add a VeloBuild card here. Styles live under the `/* Initiatives: ... */` comment.
- **Creatives:** 25 unique pieces in `#cr-gallery` (two duplicate files are intentionally not shown). Each tile is `<div data-gal data-cat="events|org|greet|design">` with a real caption as the `<img alt>` plus a `.cr-cap` hover overlay (always visible on touch). `.cr-chip` filter buttons (`initCreativesFilter`) toggle `hidden` on tiles, set `aria-pressed`, and update `#cr-status`; chip counts and the header "25 PIECES" are hand-written, so update them when adding a piece. Styles live under the `/* Creatives: ... */` comment.
- **Clickable skills (`initSkills`):** chips in the About "Skills & Tools" box are `<button class="skill-chip" data-skill="key">`; any element anywhere with `data-skills="key1 key2"` + `data-skill-label="Name · Section"` is a match. Clicking a chip outlines matches (`.skill-hit`) and lists them in `#skill-results` with jump links (auto-expands collapsed sections). To link a skill to new content, just add its key to that element's `data-skills`. Only tag places the page itself shows the skill was used; chips with no evidence stay plain `<span>`s (no dot marker).
- **Lightbox touch:** swipe left/right navigates, swipe down closes; a `.loading` class on `#v2-lb` shows a spinner until the image loads, and neighbours are preloaded.
- **Expand/collapse:** a `.expand-toggle[data-target]` button toggles `.expand-body.collapsed` (a `max-height` transition) and sets `inert` on the body while collapsed. Reused across project cards and award cards.
- **Reduced motion:** a `prefers-reduced-motion` CSS block disables transitions and reveals `.fade-up` immediately; JS checks the `REDUCED_MOTION` const to skip slideshow autoplay and the typewriter. Respect it in any new animation.
- **Scroll UX:** `.fade-up` + IntersectionObserver for reveal-on-scroll; `[data-count]`/`[data-suffix]` for animated stat counters; `[data-nav]` for scroll-spy nav highlighting.
- **Section numbers:** each section heading has `<span class="section-num" data-num="N">`, which `initSectionNums` animates from 00 up to N. The numbers are set by hand, so when you insert or reorder a section, renumber the `data-num` values (and the fallback text inside the span) that follow it. Currently 01 Hero → 09 Creatives.
- **Ghost portraits:** faint background `.ghost-portrait` images (`z-index:-1`, `section:has(> .ghost-portrait){isolation:isolate}`). They only render usefully in **full-width sections** (Projects, Credentials, Awards), where centered content leaves side margins; in `max-width:1100` sections the content covers them, so don't add them there.
- **Contact form:** posts to Formspree (`https://formspree.io/f/mojoaroe`) via async fetch in `initContactForm`.

## Section structure (in `index.html`)

Hero/about [01] → stats bar → Projects [02] (ReColor, QuadLearning, Optum ERP) → VeloBuild [03] (founder nonprofit org; donated projects: AGAILA, ReColor, MyCCS) → Experience [04] (Concentrix fraud ops, Optum internship; newest first) → Credentials (Education / Certifications / Training) → Leadership → Awards → Community Initiatives → Creatives (video + masonry) → Contact (socials + Formspree form + "Moments" photo band) → footer. Each major section is a top-level `<section id="...">` matched by the nav `href="#id"` anchors.

## Logo assets

- Use `agaila-logo.svg` and `recolor-logo.svg` (the PNGs are fallbacks). `AGAILA.svg` and `ReColor logo.svg` are older tracked copies; they are not referenced by the page.
- `myccs-logo.png` is a placeholder. In the page, MyCCS shows a styled text wordmark instead.
