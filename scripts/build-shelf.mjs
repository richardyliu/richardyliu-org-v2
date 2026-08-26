/**
 * Regenerates src/content/reading/_index.json from the markdown records.
 *
 * The markdown files are the source of truth — one per book, frontmatter plus
 * notes where they exist. The JSON is derived, and exists only because the
 * shelf index needs 272 titles without pulling 272 compiled components into the
 * page. Keeping both by hand would guarantee they diverge, so this regenerates
 * it on every build.
 *
 * `hasNotes` is computed here rather than declared in frontmatter: a book has
 * notes if it has a body. Declaring it separately is a second source of truth
 * for a fact already visible in the file.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src', 'content', 'reading');

/** Handles the quoted, colon-bearing titles these files are full of. */
function parseFrontmatter(text) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
const entries = [];
let withNotes = 0;

for (const file of files) {
  const raw = readFileSync(join(dir, file), 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) {
    console.warn(`build-shelf: no frontmatter in ${file}, skipped`);
    continue;
  }
  const meta = parseFrontmatter(m[1]);
  const body = m[2].trim();
  const slug = file.replace(/\.md$/, '');
  if (body) withNotes++;
  entries.push({
    title: meta.title ?? slug,
    author: meta.author ?? '',
    date: meta.date ?? '',
    coverImage: meta.coverImage ?? '',
    slug: `/reading/${slug}`,
    hasNotes: body.length > 0
  });
}

// Newest read first. Sorting here rather than in the client keeps the JSON
// diff-stable and means the page does no work to display it in order.
entries.sort((a, b) => {
  const ta = new Date(a.date).getTime() || 0;
  const tb = new Date(b.date).getTime() || 0;
  return tb - ta || a.title.localeCompare(b.title);
});

writeFileSync(join(dir, '_index.json'), JSON.stringify(entries, null, 1) + '\n', 'utf8');
console.log(`_index.json: ${entries.length} books (${withNotes} with notes)`);
