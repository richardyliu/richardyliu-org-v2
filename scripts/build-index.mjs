/**
 * Builds static/find-index.json — the corpus the Find overlay searches.
 *
 * The reference runs Pagefind, which crawls the *built* HTML after the fact.
 * That gives real full-text search but leaves `vite dev` with no index at all,
 * so Find is dead exactly when you are working on it. This walks the content
 * sources instead, which means the index exists in dev, has no binary
 * dependency, and is deterministic across machines.
 *
 * Trade-off worth naming: prose that lives inside .svelte routes rather than
 * markdown is not indexed automatically. Those pages are listed in STATIC_PAGES
 * below with hand-written keywords.
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const content = join(root, 'src', 'content');

/** Strips YAML frontmatter and returns [frontmatterText, body]. */
function splitFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return m ? [m[1], m[2]] : ['', raw];
}

/** Minimal YAML: flat `key: value` pairs, quoted or bare. Enough for our own files. */
function parseFrontmatter(text) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

/** Markdown -> rough plain text. Only needs to be good enough to match against. */
function toPlain(md) {
  return md
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const BODY_LIMIT = 1200;

/** @type {{title: string, path: string, kind: string, text: string}[]} */
const entries = [];

const push = (title, path, kind, text = '') =>
  entries.push({ title, path, kind, text: text.slice(0, BODY_LIMIT) });

// ------------------------------------------------------------------ static
const STATIC_PAGES = [
  { title: 'Richard Liu', path: '/', kind: 'page', text: 'home landing frontier robotics deep tech investing agents' },
  { title: 'Building', path: '/building', kind: 'page', text: 'robots hardware rover competition robotics industrial inventory arm intake shooter elevator' },
  { title: 'Writing', path: '/writing', kind: 'page', text: 'essays notes index' },
  { title: 'Reading', path: '/reading', kind: 'page', text: 'shelf books read notes' },
  { title: 'Investing', path: '/investing', kind: 'page', text: 'investments portfolio companies' },
  { title: 'Colophon', path: '/colophon', kind: 'page', text: 'typography newsreader geist mono design system credits build' }
];
for (const p of STATIC_PAGES) push(p.title, p.path, p.kind, p.text);

// ------------------------------------------------------------------- about
// One entry for the whole page. `toPlain` above drops the `<script>` blocks and
// the HTML comments, so what lands in the index is the prose and nothing of the
// RichTextModule wiring that structures it.
// The path is `/` because the About prose is the homepage.
const aboutFile = join(content, 'pages', 'about.md');
if (existsSync(aboutFile)) {
  const aboutText = toPlain(splitFrontmatter(readFileSync(aboutFile, 'utf8'))[1]);
  if (aboutText) push('About', '/', 'page', aboutText);
}

// ----------------------------------------------------------------- writing
const writingDir = join(content, 'writing');
if (existsSync(writingDir)) {
  for (const file of readdirSync(writingDir).filter((f) => f.endsWith('.md'))) {
    const raw = readFileSync(join(writingDir, file), 'utf8');
    const [fm, body] = splitFrontmatter(raw);
    const meta = parseFrontmatter(fm);
    if (meta.draft === 'true') continue;
    const slug = file.replace(/\.md$/, '');
    push(
      meta.title || slug,
      `/writing/${slug}`,
      'writing',
      `${meta.description ?? ''} ${meta.tags ?? ''} ${toPlain(body)}`
    );
  }
}

// ----------------------------------------------------------------- reading
const shelfPath = join(content, 'reading', '_index.json');
if (existsSync(shelfPath)) {
  const shelf = JSON.parse(readFileSync(shelfPath, 'utf8'));
  for (const b of shelf) {
    const slug = String(b.slug).split('/').filter(Boolean).pop();
    // Every shelf entry is findable; only the ones with notes route to a page
    // of their own, so the rest deep-link to their row on the index.
    const path = b.hasNotes ? `/reading/${slug}` : `/reading#${slug}`;
    push(b.title, path, 'reading', `${b.author} ${b.date}`);
  }
}

// --------------------------------------------------------------- investing
const invPath = join(content, 'investments.json');
if (existsSync(invPath)) {
  for (const i of JSON.parse(readFileSync(invPath, 'utf8'))) {
    push(i.name, `/investing#${slugify(i.name)}`, 'investing', `${i.description} ${i.via} ${i.year}`);
  }
}

// ------------------------------------------------------------------ builds
// One entry per machine, pointing at its own anchor on /building — same shape
// as the portfolio rows, so a search for "shooter" lands on the build rather
// than on the top of the page.
const buildsPath = join(content, 'builds.json');
if (existsSync(buildsPath)) {
  for (const b of JSON.parse(readFileSync(buildsPath, 'utf8'))) {
    push(b.title, `/building#${b.slug}`, 'building', `${b.caption} ${b.alt}`);
  }
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/*
 * Collapse entries that resolve to the same URL.
 *
 * This is not hygiene, it is a correctness fix. `/` is pushed twice whenever the
 * About prose is the homepage — once by STATIC_PAGES as the site's own entry,
 * once by the About block above — and two rows that navigate to the same place
 * are a duplicate result for the reader *and* a duplicate key for the results
 * list, which keys on path. Svelte cannot map a row index to a DOM node through
 * a duplicate key: the selected-row highlight lands on the wrong row and two
 * rows light up at once, and in dev the whole list refuses to render.
 *
 * The first entry keeps the row and its title, since STATIC_PAGES is where a
 * page's canonical name is written down; the later one only donates its text,
 * so its keywords still match. Re-truncated because two bodies concatenated can
 * exceed the limit that `push` already applied to each.
 */
const byPath = new Map();
for (const e of entries) {
  const seen = byPath.get(e.path);
  if (seen) seen.text = `${seen.text} ${e.text}`.slice(0, BODY_LIMIT);
  else byPath.set(e.path, e);
}
const deduped = [...byPath.values()];
if (deduped.length !== entries.length) {
  console.log(`find-index.json: merged ${entries.length - deduped.length} duplicate-path entr` +
    `${entries.length - deduped.length === 1 ? 'y' : 'ies'}`);
}

const outDir = join(root, 'static');
mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, 'find-index.json'),
  JSON.stringify({ generated: deduped.length, entries: deduped }),
  'utf8'
);

const byKind = deduped.reduce((a, e) => ((a[e.kind] = (a[e.kind] ?? 0) + 1), a), {});
console.log(
  `find-index.json: ${deduped.length} entries (` +
    Object.entries(byKind)
      .map(([k, n]) => `${k} ${n}`)
      .join(', ') +
    ')'
);
