# richardyliu-org-v2

Personal site for Richard Liu. SvelteKit, prerendered to static files.

```bash
npm install
npm run dev      # regenerates content indexes, then serves on :5178
npm run build    # -> build/  (static, 10 prerendered pages)
npm test         # pure-logic unit tests
```

## Layout

```
src/lib/styles/     the design system — tokens, type, layout, buttons
src/lib/components/ chrome (Header, OverlayPanel, FindOverlay, PageSidebar, Footer)
                    and modules (RichTextModule, Card, ListGridToggle)
src/lib/components/landing/  the generative hero
src/content/        all copy: reading/, writing/, pages/, investments.json
scripts/            content-index generators + tests
```

## The design system

`src/lib/styles/tokens.css` is a port of the reference's own token cascade, which resolves
in three hops:

```
--font-size-body-default-desktop   raw, per breakpoint
  -> --font-size-body              semantic, re-pointed by one @media block
    -> .type-serif-body            the class components actually use
```

The indirection is the point: one `@media` block per breakpoint re-aims every size at
once, so no component carries a media query of its own.

The whole palette is black, white, a grey ramp, one blue for links. **Nothing is bold** —
hierarchy comes from size, tracking, and whitespace, and every label, date, and control is
set in the mono face. Grid is 6/8/12 columns, capped at 1752px.

Dark tokens exist under `[data-theme='dark']` but nothing toggles them, matching the
reference: dark is opt-in per subtree, not a site-wide preference, because the design was
drawn for paper white.

## Chrome

| Piece | Notes |
|---|---|
| Header | `1fr auto 1fr` grid so the wordmark sits on the true optical centre. Below 1024px it hides on scroll-down and returns on scroll-up; at ≥1024px it scrolls away with the page and `[M]` detaches into a fixed pill aligned to the *content* container's right edge. |
| `[M]` menu | Opaque white backdrop starting below the header — measured, not guessed: the reference uses a flat surface with **no transition at all**. The snap is deliberate; it reads as a mode switch, not a drawer. |
| Find | `F` or `⌘K`. A shell prompt (`richardyliu/…`) with a block caret, results as title-left / path-right, `[↓][↑]`, `[enter] to visit`, `[?]` for the shortcut map. |
| Page rail | Sticky numbered sections. The active row **hides its own digit**, leaving `[ ]` — tabular figures mean the row never reflows, so an absence works as the state indicator. Digits 1–9 are live shortcuts. |
| Landing | Five seeded 2D-canvas scenes, hairline strokes, no fills. `[1]`–`[5]` to switch. Holds a fixed frame under `prefers-reduced-motion` and stops in a background tab. |

Everything degrades: with scripting off, a checkbox-driven CSS-only menu takes over, the
JS-only controls collapse to nothing, and scroll-reveal never engages. There is also a
CSS `@keyframes` failsafe that forces revealed content visible after 2.5s, covering the
case `html:not(.js)` cannot — scripting that loaded and *then* broke.

## Content

`src/content/reading/*.md` is the source of truth for the shelf: one file per book,
frontmatter plus notes where they exist. `_index.json` is **generated** from those files by
`scripts/build-shelf.mjs` on every build — `hasNotes` is computed from whether a file has a
body, so it can never drift. 272 books, 2 with notes.

Find is a build-time JSON index (`scripts/build-index.mjs`) scored on the client. The
reference uses Pagefind, which crawls built HTML and therefore leaves `vite dev` with no
index at all — Find would be dead exactly while you work on it. Scoring is tiered
substring matching, **not fuzzy**: on a corpus that is mostly book titles, fuzzy matching
produces confident nonsense (`brt` "matching" *Barbarians at the Gate*). There is a test
for that.

`src/content/writing/*.md` is one file per essay, frontmatter plus body, loaded eagerly —
the index needs every frontmatter block anyway. An essay may carry a `cover` (a path under
`static/`) and a `coverAlt`; the card renders the grey placeholder field when it has
neither, so a mixed list still lines up.

## Not borrowed

- **Typefaces.** This
  site self-hosts [Newsreader](https://fonts.google.com/specimen/Newsreader) and
  [Geist Mono](https://fonts.google.com/specimen/Geist+Mono) as open substitutes chosen to
  sit close to them. Han characters fall through to Songti SC / Source Han Serif, since
  neither Latin face covers them.
- **Marks.** Their wordmark and monogram are their trademarks. The wordmark here is live
  text; the collapsed mark is a 劉 seal.
- **The hero.** Theirs is a WebGL custom element with its own scenes and captions. These
  five scenes and their copy are original.
