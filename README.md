# Daftarche Landing Page

Daftarche is a calm, distraction-free web notebook designed for daily tasks, focus, and reading. This website serves as the official landing page, providing information, guides, and download links for the application.

It is built entirely with vanilla web technologies — no build tools, frameworks, or external dependencies:
- **HTML5** (semantic, RTL-first structure)
- **CSS3** (custom responsive design tokens)
- **JavaScript** (lightweight vanilla progressive enhancement)

## Scope

This repository ships the marketing site only. The installable PWA itself lives on
`https://app.daftrche.ir/`, so there is intentionally **no** web manifest or service
worker here — the install instructions on the page point to the app origin.

The hero shows that app **live**: `index.html` embeds `https://app.daftrche.ir/` in a
plain `<iframe>` inside the paper frame, so the visitor can add a couple of sample tasks
without leaving the page. The frame keeps the screenshot's 4:5 ratio while the app
scrolls inside, and a decorative poster image (`assets/screenshots/today-hero.webp`)
sits underneath it, filling the box while the app boots. Because the landing
(`daftrche.ir`) and the app (`app.daftrche.ir`) share the same site, browser storage
partitioning keeps the tasks the visitor creates here in the same local store the app
uses on that browser — nothing is sent anywhere. The frame source comes from
`window.DAFTARCHE_APP_URL` (`js/config.js`) through the same allowlist the entry links
use, and it is only synced when the value actually changes, so the preview is never
needlessly reloaded.

## Security notes

Every page ships a strict `Content-Security-Policy` through `<meta http-equiv>`: same-origin
scripts and styles only, `connect-src 'none'`, `upgrade-insecure-requests`, no inline code,
no forms, no plugins. `frame-src` is `'none'` everywhere except `index.html`, where the hero
live preview needs exactly one source: `frame-src https://app.daftrche.ir` — a single,
named app origin rather than a wildcard, so no other page or host can be framed. App entry
links and the preview frame are validated in `js/landing.js` against the same allowlist of
`daftrche.ir` and its subdomains on the standard port. The site contains no storage access,
no network calls of its own, and no inline handlers.

Because GitHub Pages serves static files and cannot emit custom response headers, the
unenforceable `frame-ancestors` gap is covered in script instead: `js/landing.js` includes an
anti-framing guard that breaks same-origin frames out by re-navigating the top context
and, when framed by a foreign origin, replaces the whole document with a static notice
so attackers cannot overlay their own UI over the hidden content (`404.html` ships no
scripting, and carries no interactive surface to hijack).

- `frame-ancestors` (and `report-uri`) are **ignored** when supplied via `<meta>`, so the
  JS guard above is the remaining line of defense against clickjacking.
- `.nojekyll` at the repository root disables the Jekyll build on GitHub Pages: deploys
  are served byte-for-byte from the branch (predictable, and future dot-directories such
  as `/.well-known/` — e.g. RFC 9116 `security.txt` — become reachable).
- The hero lives inside the same-origin-trust boundary: the frame loads only
  `app.daftrche.ir`, carries no `sandbox` attribute (the app needs its own storage), and is
  never injected from user input. On browsers that block or isolate storage in
  third-party frames, the preview degrades to the app's own “storage unavailable” notice
  inside the frame; the landing page itself keeps working exactly the same.

## Color and token policy

All component colors resolve to palette tokens (`--pal-*`) layered through semantic tokens
(`--color-*`, `--lp-*`) in `css/base.css`. Translucent tints and shadows are the only
values authored inline as `rgba()`, and the `@media print` block deliberately uses literal
black/white for print output.
