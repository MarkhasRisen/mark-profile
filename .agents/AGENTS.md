# mark-profile Project Rules

## Always Read CLAUDE.md First

Before making any changes to this project, read `CLAUDE.md` in the repository root.
It contains authoritative conventions for architecture, theming, deployment, and asset paths.

## Critical Constraints (Quick Reference)

1. **Single-file site**: All code lives in `index.html` (inline `<style>` and `<script>`).
   - `style.css` is a **dead file** — never add styles to it.
   - There is no build system, no framework, no package.json.

2. **Asset path casing**: Developed on Windows (case-insensitive), served on Linux (case-sensitive).
   - Always match asset path casing to `git ls-files` output, not the local folder display.
   - After editing asset references, verify with the grep/sed pipeline documented in `CLAUDE.md`.

3. **JS pattern**: Add behavior by writing an `initX()` function and calling it from the single
   `DOMContentLoaded` handler (~line 900 in `index.html`).

4. **Theme tokens**: Use CSS custom properties (`--bg`, `--ink`, `--accent`, `--sage`, `--white`).
   - `--white` is theme-adaptive (dark in dark mode) — use it for cards, not literal `#fff`.

5. **Pushing to GitHub**: Requires a GitHub PAT embedded in the remote URL. Only push when the
   user explicitly asks. Follow the three-command sequence in `CLAUDE.md`.

6. **Ghost portraits**: Only add `.ghost-portrait` images to **full-width sections** (Projects,
   Credentials, Awards). Do not add them to `max-width:1100px` sections.
