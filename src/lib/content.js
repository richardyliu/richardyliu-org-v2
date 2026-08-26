/**
 * Content loaders. Everything here runs at prerender time only.
 *
 * Reading and writing are loaded differently on purpose. The shelf is 272
 * entries of which two have bodies, so eagerly importing 272 compiled markdown
 * components would ship the whole shelf as JavaScript for no benefit — the list
 * comes from a JSON index, and only the two note pages import their markdown.
 * Writing is a handful of essays, so eager is fine and gives us frontmatter for
 * the index without a second pass.
 */

import shelf from '$content/reading/_index.json';
import investments from '$content/investments.json';
import builds from '$content/builds.json';

/** @typedef {{ title: string, author: string, date: string, coverImage: string, slug: string, hasNotes: boolean }} ShelfEntry */

/** Markdown bodies for the shelf entries that have notes. Lazy — see above. */
const readingNotes = import.meta.glob('/src/content/reading/*.md');

/** Essays. Eager: the index needs every frontmatter block anyway. */
const writingModules = import.meta.glob('/src/content/writing/*.md', { eager: true });

/**
 * The hand-composed pages (/about). Loaded through a glob rather than imported
 * by name for a boring but real reason: SvelteKit writes the `$content` alias
 * into tsconfig `paths`, so a literal
 * `import About from '$content/pages/about.md'` resolves to a file TypeScript
 * then refuses, `.md` not being an extension it can read. Vite types globs for
 * us, so going through one sidesteps the whole problem — and matches how the
 * shelf and the essays are already loaded.
 */
const pageModules = import.meta.glob('/src/content/pages/*.md', { eager: true });

/** `2026-08-16` sorts lexically; `August 16, 2026` does not. */
function toTime(/** @type {string} */ date) {
  const t = new Date(date).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** `August 16, 2026` -> `08.16.2026`, the mono rail's date format. */
export function monoDate(/** @type {string} */ date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}.${pad(d.getDate())}.${d.getFullYear()}`;
}

/** Last path segment of a `/reading/<slug>` style slug. */
function tail(/** @type {string} */ slug) {
  return slug.split('/').filter(Boolean).pop() ?? slug;
}

/** @returns {ShelfEntry[]} newest read first */
export function getShelf() {
  return /** @type {ShelfEntry[]} */ (shelf)
    .slice()
    .sort((a, b) => toTime(b.date) - toTime(a.date));
}

/** The subset that has a page of its own. */
export function getShelfWithNotes() {
  return getShelf().filter((b) => b.hasNotes);
}

export function getShelfEntry(/** @type {string} */ slug) {
  return getShelf().find((b) => tail(b.slug) === slug);
}

/**
 * Compiled markdown for one book's notes, or null when the entry is a bare
 * shelf record. Returning null rather than throwing lets the route render the
 * metadata-only case instead of 404ing on a book that genuinely exists.
 */
export async function loadReadingNotes(/** @type {string} */ slug) {
  const key = `/src/content/reading/${slug}.md`;
  const loader = readingNotes[key];
  if (!loader) return null;
  const mod = /** @type {{ default: unknown, metadata?: Record<string, unknown> }} */ (
    await loader()
  );
  return mod;
}

/** @typedef {{ slug: string, title: string, description: string, date: string, tags: string[], draft: boolean, sample: boolean, cover: string | null, coverAlt: string, readingTime: number }} Essay */

/** @returns {Essay[]} newest first */
export function getWriting() {
  return Object.entries(writingModules)
    .map(([path, mod]) => {
      const m = /** @type {{ metadata: Record<string, any> }} */ (mod).metadata ?? {};
      return {
        slug: path.split('/').pop()?.replace(/\.md$/, '') ?? '',
        title: m.title ?? 'Untitled',
        description: m.description ?? '',
        date: m.date ?? '',
        tags: m.tags ?? [],
        draft: Boolean(m.draft),
        sample: Boolean(m.sample),
        cover: m.cover ?? null,
        coverAlt: m.coverAlt ?? '',
        readingTime: m.readingTime ?? 0
      };
    })
    .sort((a, b) => toTime(b.date) - toTime(a.date));
}

/**
 * The compiled component for one essay, or null. Reads straight out of the
 * eager glob above — the module is already in the bundle, so this is a lookup,
 * not a second load.
 */
export function getEssayModule(/** @type {string} */ slug) {
  const key = `/src/content/writing/${slug}.md`;
  return /** @type {{ default: unknown, metadata: Record<string, any> } | undefined} */ (
    writingModules[key]
  );
}

/**
 * One page doc as a component, by filename stem.
 * @param {string} name
 */
export function getPage(name) {
  const mod = /** @type {{ default: import('svelte').Component } | undefined} */ (
    pageModules[`/src/content/pages/${name}.md`]
  );
  if (!mod) throw new Error(`Missing page: ${name}.md`);
  return mod.default;
}

/**
 * The section rail a page doc declares for itself, in its `<script module>`
 * block. It lives next to the prose rather than in the route so that adding a
 * section is one edit in one file — the rail and the copy it points at cannot
 * disagree about what exists.
 *
 * @param {string} name
 * @returns {{ id: string, label: string }[]}
 */
export function getPageSections(name) {
  const mod = /** @type {{ SECTIONS?: { id: string, label: string }[] } | undefined} */ (
    pageModules[`/src/content/pages/${name}.md`]
  );
  if (!mod) throw new Error(`Missing page: ${name}.md`);
  return mod.SECTIONS ?? [];
}

/**
 * The hardware on /building, in the order the file lists them. Unsorted on
 * purpose: unlike the shelf and the portfolio there is no date on these, and
 * the sequence in the file is the author's own running order.
 *
 * @returns {{ slug: string, image: string, caption: string, alt: string }[]}
 */
export function getBuilds() {
  return builds;
}

export function getInvestments() {
  return /** @type {{name: string, description: string, year: number, via: string, url: string}[]} */ (
    investments
  )
    .slice()
    .sort((a, b) => b.year - a.year || a.name.localeCompare(b.name));
}
