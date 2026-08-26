import { redirect } from '@sveltejs/kit';

/**
 * About is the homepage now, so this route only exists to keep old inbound
 * links (and the #now / #contact fragments in them) landing somewhere real.
 * 308: the move is permanent as far as a crawler is concerned, and the prose
 * itself lives at `/`.
 */
export const load = () => {
  redirect(308, '/');
};
