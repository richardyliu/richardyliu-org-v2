/**
 * Client-side scoring for the Find overlay.
 *
 * Not fuzzy matching. Fuzzy scoring on a corpus that is mostly book titles
 * produces confident nonsense — "robot" matching "Barbarians at the Gate" via
 * scattered letters. This ranks by *where* an exact substring lands instead,
 * which is predictable enough that the top hit is almost always the intended
 * one, and cheap enough to run on every keystroke over ~280 entries.
 */

/** @typedef {{ title: string, path: string, kind: string, text: string }} Entry */

/** Loaded once and cached; the index is a static asset. */
let cache = /** @type {Entry[] | null} */ (null);
let inflight = /** @type {Promise<Entry[]> | null} */ (null);

export async function loadIndex(/** @type {typeof fetch} */ f = fetch) {
  if (cache) return cache;
  if (inflight) return inflight;
  // Resolve into a local first: returning the module-level `cache` directly
  // widens the promise back to `Entry[] | null`, since the field is nullable
  // even at the moment we know it is not.
  inflight = f('/find-index.json')
    .then((r) => (r.ok ? r.json() : { entries: [] }))
    .then((d) => {
      const entries = /** @type {Entry[]} */ (d.entries ?? []);
      cache = entries;
      return entries;
    })
    .catch(() => {
      /** @type {Entry[]} */
      const empty = [];
      cache = empty;
      return empty;
    });
  return inflight;
}

const KIND_BONUS = { page: 40, building: 24, investing: 12, reading: 0 };

/**
 * Higher is better. The tiers matter more than the exact numbers:
 *   title starts with query  >  title word starts with query
 *   >  title contains  >  path contains  >  body contains
 */
function score(/** @type {Entry} */ e, /** @type {string} */ q) {
  const title = e.title.toLowerCase();
  const path = e.path.toLowerCase();
  const text = e.text.toLowerCase();

  let s = -1;
  if (title.startsWith(q)) s = 1000;
  else if (new RegExp(`\\b${escapeRe(q)}`).test(title)) s = 800;
  else if (title.includes(q)) s = 600;
  else if (path.includes(q)) s = 400;
  else if (text.includes(q)) s = 200;
  if (s < 0) return -1;

  // Shorter titles win ties: an exact-ish hit on a two-word title is a better
  // answer than the same hit buried in a fourteen-word subtitle.
  s += KIND_BONUS[/** @type {keyof typeof KIND_BONUS} */ (e.kind)] ?? 0;
  s -= Math.min(title.length, 120) * 0.5;
  return s;
}

function escapeRe(/** @type {string} */ s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** @returns {Entry[]} */
export function search(/** @type {Entry[]} */ entries, /** @type {string} */ query, limit = 6) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return entries
    .map((e) => ({ e, s: score(e, q) }))
    .filter((r) => r.s >= 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((r) => r.e);
}

/**
 * `/reading/when-we-cease-to-understand-the-world` -> `/reading/...tand-the-world`
 *
 * CSS ellipsis truncates at the end, which would hide the slug — the part that
 * actually identifies the page — and leave the section prefix everyone can
 * already guess. So the middle goes instead.
 */
export function middleTruncate(/** @type {string} */ path, max = 34) {
  if (path.length <= max) return path;
  // `#` counts as a section boundary, not just `/`. Most shelf entries are
  // `/reading#slug`, which has no second slash — keying on `/` alone threw the
  // section away and left every book looking like it lived at the root.
  const m = path.slice(1).match(/[/#]/);
  const head = m?.index === undefined ? -1 : m.index + 1;
  const prefix = head > 0 ? path.slice(0, head + 1) : '/';
  const keep = Math.max(4, max - prefix.length - 3);
  return `${prefix}...${path.slice(path.length - keep)}`;
}
