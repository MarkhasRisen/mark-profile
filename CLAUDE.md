# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page personal portfolio for Mark Risen Caparas. The entire site is **one self-contained file: `index.html`** (~1200 lines). All CSS lives in one inline `<style>` block and all JS in one inline `<script>` block. The only external resources are Google Fonts and the favicon. There is **no build system, no framework, no package.json, no tests, and no linter.**

`style.css` is tracked in git but **not referenced anywhere** — it is a dead file left over from an earlier version. Do not add styles to it; all styling is inline in `index.html`.

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

The repo is developed on **Windows (case-insensitive)** but served by **GitHub Pages on Linux (case-sensitive)**. A path that works locally can 404 in production. Folder casing in git is not always what you'd expect — e.g. git tracks `CCS student leader/` (lowercase) and `Paragon/` (capital P) even though the local folders display differently. **Always match the casing in `git ls-files`, not the local folder.** After editing asset references, verify every one resolves to a tracked file with exact case:
```
git ls-files > /tmp/tracked.txt
grep -oE '(src|href)="[^"]+\.(jpg|jpeg|png|webp|pdf|mp4)"' index.html \
  | sed -E 's/^(src|href)="//; s/"$//' | grep -v '^https' | sort -u \
  | while read -r r; do grep -qxF "$r" /tmp/tracked.txt || echo "MISSING: $r"; done
```
Any `MISSING:` line is a production 404.

## Architecture & conventions

- **Theming:** CSS custom properties are defined in `:root{` (~line 22); dark mode overrides live under `:root[data-theme="dark"]`. The toggle persists to `localStorage` key `mrc-v2-theme`. Brand tokens: `--bg`, `--ink`, `--accent` (terracotta `#c4623a`), `--sage`, `--white` (note: `--white` is theme-adaptive — it is dark in dark mode, so use it for cards rather than a literal `#fff`).
- **Type system:** Sora (headings), Source Serif 4 (body), IBM Plex Mono (labels/meta).
- **JS bootstrap:** a single `DOMContentLoaded` handler (~line 900) calls a series of `initX()` functions (`initTheme`, `initLightbox`, `initSlideshow`, `initExpand`, `initAnimations`, `initCounters`, `initContactForm`, etc.). To add behavior, write an `initX()` function and call it from that handler.
- **Lightbox:** shared DOM (`#v2-lb`). Photo sets are grouped independently by the `data-pg` attribute on `[data-photo]` wrappers (values like `ql`, `carina`, `recolor`, `moments`); the creatives masonry uses `[data-gal]` as one group. Adding a new `data-pg` value automatically forms a new navigable group — no JS change needed.
- **Expand/collapse:** a `.expand-toggle[data-target]` button toggles `.expand-body.collapsed` (a `max-height` transition). Reused across project cards and award cards.
- **Scroll UX:** `.fade-up` + IntersectionObserver for reveal-on-scroll; `[data-count]`/`[data-suffix]` for animated stat counters; `[data-nav]` for scroll-spy nav highlighting.
- **Ghost portraits:** faint background `.ghost-portrait` images (`z-index:-1`, `section:has(> .ghost-portrait){isolation:isolate}`). They only render usefully in **full-width sections** (Projects, Credentials, Awards), where centered content leaves side margins; in `max-width:1100` sections the content covers them, so don't add them there.
- **Contact form:** posts to Formspree (`https://formspree.io/f/mojoaroe`) via async fetch in `initContactForm`.

## Section structure (in `index.html`)

Hero/about → stats bar → Projects (ReColor, QuadLearning, Optum ERP) → Experience → Credentials (Education / Certifications / Training) → Leadership (+ testimonial) → Awards → Community Initiatives → Creatives (video + masonry) → Contact (socials + Formspree form + "Moments" photo band) → footer. Each major section is a top-level `<section id="...">` matched by the nav anchors.
