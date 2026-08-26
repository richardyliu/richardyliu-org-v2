import { error } from '@sveltejs/kit';
import { getShelfEntry, getShelfWithNotes, loadReadingNotes } from '$lib/content.js';

/** Only entries with notes get a page; the rest are rows on the index. */
export const entries = () =>
  getShelfWithNotes().map((b) => ({ slug: b.slug.split('/').filter(Boolean).pop() ?? '' }));

export const load = async ({ params }) => {
  const book = getShelfEntry(params.slug);
  if (!book || !book.hasNotes) error(404, 'Not found');
  const mod = await loadReadingNotes(params.slug);
  return {
    title: book.title,
    description: `${book.author} — read ${book.date}`,
    book,
    component: mod?.default ?? null
  };
};
