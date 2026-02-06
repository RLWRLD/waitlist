<!-- Copilot / AI agent instructions tailored to this repo -->
# RLWRLD-homepage-mockup — AI coding assistant guide

Purpose: fast, task-focused orientation so an AI contributor becomes productive immediately.

- **Big picture**: This repo is a static website mockup (vanilla HTML/CSS/JS). The `rlwrld/` folder contains the working site: pages, `css/` and `js/`. There is a small subproject `rlwrld/RLDX-web/` (interactive demo). No build tool or bundler is used.

- **Key integration points**:
  - Waitlist / Supabase: see [SUPABASE_SETUP.md](SUPABASE_SETUP.md) and `waitlist.html` — frontend posts to the Supabase REST endpoint (replace `SUPABASE_URL` / `SUPABASE_ANON_KEY` in `waitlist.html`).
  - Shared header/footer injection: `rlwrld/js/common-header.js` controls `basePath` logic and nav links — update this file when adding pages or changing nav structure.
  - Interactive diagram / demo: `rlwrld/RLDX-web/` contains its own `script.js` and assets; treat it as a self-contained subsite.

- **Architecture / data flow (quick)**:
  - Static pages reference `rlwrld/css/styles.css` and `rlwrld/js/*.js`. JS initializes UI features on DOMContentLoaded (see `rlwrld/RLDX-web/script.js` for patterns: `init*` functions, `throttle`, `IntersectionObserver`).
  - Client-side waitlist submits JSON (and some columns) to Supabase REST (`/rest/v1/waitlist`) using the `anon` key. Supabase is configured insert-only via RLS (see `SUPABASE_SETUP.md`).

- **Project-specific conventions**:
  - No frameworks or npm build: modify files directly and test by opening the HTML in a browser or deploying to a static host.
  - Relative-path detection: `common-header.js` computes `basePath` based on `window.location.pathname`. When adding nested pages, ensure `basePath` still resolves (or update the detection logic).
  - Vanilla JS pattern: functions named `init*` for feature initialization; keep side-effect code inside DOMContentLoaded handlers.
  - Performance patterns: use `throttle()` for scroll handlers and `IntersectionObserver` for lazy loading and animations (see `rlwrld/RLDX-web/script.js`).

- **Where to make common edits** (examples):
  - Update navigation: edit `rlwrld/js/common-header.js` (nav links, `rldxPath` logic).
  - Add images/logos: place files under `rlwrld/assets/images/` or `rlwrld/assets/logos/` and reference via the repo's relative paths.
  - Change styles globally: edit `rlwrld/css/styles.css`.
  - Update waitlist behavior or keys: edit `waitlist.html` (search for `SUPABASE_URL` / `SUPABASE_ANON_KEY`).

- **Developer workflows (discovered / recommended)**:
  - Local quick test: open any HTML file in browser (e.g., `open index.html` or serve with a static host).
  - Deployment options: GitHub Pages / Vercel / Netlify; no build step required.
  - Supabase setup: follow `SUPABASE_SETUP.md` exactly to create the `waitlist` table and RLS policy. The frontend uses the public `anon` key for inserts only.

- **Editing guidelines for AI code edits**:
  - Keep changes minimal and scoped to the file(s) relevant to the task.
  - Preserve vanilla JS style and avoid introducing frameworks or bundlers.
  - When changing navigation or adding nested pages, update `rlwrld/js/common-header.js` and verify `basePath` logic.
  - If adding new interactive code, follow existing patterns: create `init*` functions, add `DOMContentLoaded` registration, and reuse `throttle()`/`IntersectionObserver` where relevant.

- **Files to inspect for examples / patterns**:
  - [README.md](README.md) — high-level design notes and Supabase summary.
  - [SUPABASE_SETUP.md](SUPABASE_SETUP.md) — canonical Supabase SQL and frontend snippet.
  - [rlwrld/js/common-header.js](rlwrld/js/common-header.js) — basePath and header/footer injection pattern.
  - [rlwrld/RLDX-web/script.js](rlwrld/RLDX-web/script.js) — JS initialization, performance helpers, and feature examples.
  - [waitlist.html](waitlist.html) — full frontend form + Supabase submission flow.

- **What not to change without review**:
  - Don't expose `service_role` or any server keys in frontend files.
  - Avoid restructuring into a build system or introducing node_modules; these are intentional design choices here.

If anything here is unclear or you'd like more examples (e.g., exact code snippets to update `basePath` handling or how to add a new page), tell me which area to expand and I will iterate.
