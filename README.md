<<<<<<< HEAD
# دَفتَرچه — landing

The one-page site for **دَفتَرچه**, a quiet notebook for daily tasks, focus and
reading. Its whole promise is the sentence in the hero: *امروز قرار نیست
همه‌چیز را انجام بدهی.*

Plain HTML, CSS and a little vanilla JavaScript. No framework, no build step, no
package manager, no dependencies to install — open `index.html` in a browser and
that is the entire site. It is written right-to-left in Persian, and the web app
it points at lives next door at `app.daftrche.ir` (a separate project; this
repository owns only the page that explains it).

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The whole page: markup, meta tags, and the content-security policy. |
| `contribute.html` | صفحه همکاری و مشارکت در پروژه متن‌باز دَفتَرچه. |
| `css/base.css` | The design foundation the notebook is printed with — the two Estedad faces, the paper palette, radii, shadows, motion and stacking tokens. |
| `css/landing.css` | Everything that is only this page. |
| `js/config.js` | The one place the app address is written down. |
| `js/landing.js` | Progressive enhancement only: nothing here is load-bearing. |
| `404.html` | Served by the host for any address that does not exist. |
| `robots.txt`, `sitemap.xml` | Crawler basics, both pointing at `https://daftrche.ir/`. |
| `assets/` | Fonts, character sprites, app screenshots, icons, and the social card. |
| `CNAME` | The domain the host serves this from. |
| `.agents/skills/`, `.claude/skills/` | An installed UI/UX audit skill, not part of the site. See below. |

## Working on it locally

The page needs no server, but two things behave properly only over HTTP: the
absolute paths in `404.html`, and the pinned CSP. Any static server will do —
`python -m http.server`, `npx serve`, or a few lines of node — then visit
`/index.html`. No install step exists to run, and none should be added.

(On Windows the interpreter is usually `python`, not the `python3` that most
documentation assumes; check with `python --version` before copying a command
out of a README.)

## Rules this page holds itself to

These are the invariants worth re-reading before changing anything here. They are
not style preferences; each one is load-bearing.

1. **No inline script and no inline style.** The CSP allows `'self'` and nothing
   else, so a `<script>` or a `style=""` attribute in the markup simply will not
   run. Inline `<style>`, JSON-LD blocks and style-attribute animations are all
   blocked too — if you need one, change the policy deliberately, in the same
   commit, with a hash.
2. **No raw hex in a component.** Every colour comes from the `--pal-*` table in
   `base.css` through the semantic names. The palette is the one place a colour
   is decided.
3. **The app address lives in `js/config.js`** — *and* in the four `href`s
   carrying `data-app-link`, so the buttons still reach the app with scripting
   switched off. Change both together, or the no-JS path quietly rots.
4. **Three URLs have to agree:** `<link rel="canonical">`, `og:url` and
   `og:image` — plus `sitemap.xml` and `robots.txt`. They all describe
   `https://daftrche.ir/`.
5. **Content never depends on a script to be readable.** The reveal animation is
   armed by CSS (`@media (scripting: enabled)`), switched off by `lp-live` the
   moment `js/landing.js` runs, and abandoned by a failsafe rule if that file
   never arrives. A browser that does not understand the media feature is never
   hidden in the first place. Keep it that way: if the script fails, the page
   must still be a page.
6. **Text clears 4.5:1.** Secondary text reads `--lp-muted`, which maps to
   `--pal-paper-muted-strong` — the palette's plain muted grey is a surface tint
   and fails as type (3.18:1 on paper). The measured ratios are in `base.css`.
7. **Motion is opt-in and reversible.** Everything decorative lives behind
   `prefers-reduced-motion`, and hover states are written as
   `@media (hover: hover)` so a touch device never inherits a desktop-only state.

## The UI/UX audit skill

[ui-ux-pro-max](https://github.com/dekitproject/ux-ui-promax-skill) is installed
here as an agent skill: a searchable set of UI/UX rules that the design decisions
on this page were checked against. It is **not part of the site** — nothing in
`index.html` loads from it, it adds no dependency, no build step and no runtime
cost, and the whole of it can be deleted without changing a pixel.

| Where | Read by |
| --- | --- |
| `.claude/skills/ui-ux-pro-max/` | Claude Code / Freebuff |
| `.cursor/skills/ui-ux-pro-max/` | Cursor |
| `.codex/skills/ui-ux-pro-max/` | Codex |

Each copy is self-contained (the skill text plus its `data/*.csv` tables); they
are copies rather than links, so the same 320 KB is paid three times. Install or
refresh one target at a time — `--ai all` writes fourteen agent directories, which
is fourteen too many for a static site:

```bash
npx uipro-cli@latest init --ai claude
```

### Running its search tool

The skill is a small Python CLI, and its own docs say `python3`:

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<product type> <keywords>" --design-system
```

On Windows that interpreter is not usually on PATH. This machine has `python`
(Python 3.14), so use that, and pass `-B` so the run leaves no `__pycache__`
beside the scripts — those rules are in `.gitignore` too, but `-B` never writes
the cache in the first place:

```bash
python -B .claude/skills/ui-ux-pro-max/scripts/search.py "productivity tool landing" --domain ux -n 5
```

Useful domains: `ux`, `landing`, `style`, `typography`, `color`, `product`.

### What it recommends that this page ignores

`--design-system` hands you a complete palette and font pairing. Here both halves
are unusable on purpose, and the audit took its structure, touch-target, contrast,
focus and performance rules instead:

- **Palette** — it proposes a teal/orange Tailwind set. This page is painted from
  the paper palette in `css/base.css` (rule 2 above: a colour is decided in one
  place, in the palette).
- **Typography** — it recommends Latin-only Google Fonts (Plus Jakarta Sans on one
  query, Lora with Raleway on another) and delivers them as a `fonts.google.com`
  import. The page is read in Persian, so it is set in Estedad, and the page's own
  `default-src 'self'` policy would block a Google Fonts URL in any case.
Its structure advice, though, is the same shape this page already had — a hero, a
feature section and a CTA — which is the compression below.

The audit changed four things you can see: the page went from eight content
sections to five, phone tap targets are never under 44px, body copy is never under
16px on a phone, and the bento's two short cards no longer sit half empty.

## Deploying

The host serves this repository directly from the root; `CNAME` is the domain.
There is no build output to upload.

One limitation worth knowing: a meta-tag CSP cannot carry header-only directives
(`frame-ancestors`, HSTS, `report-uri`), and a host that serves raw files from a
CNAME cannot add headers. If any of those ever matter, this has to move to a host
that supports a `_headers` file.

After deploying, check the card rather than assuming it: share the URL and
confirm the 1200×630 preview renders, since `og:image` is only fetched by the
platform, never by the page.
=======

>>>>>>> be75a0685bdd94b94be12d1a086ac82ff7758384
