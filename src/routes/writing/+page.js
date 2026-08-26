import { getWriting } from '$lib/content.js';

/** How recent an essay has to be to keep a feature slot, in days. */
const FEATURE_WINDOW_DAYS = 30;

/**
 * Featured is the newest essay plus anything published inside the window.
 *
 * The newest is unconditional so the section is never empty on a site that has
 * gone quiet for a while — after a long enough gap it is the only thing there,
 * which is the old single-feature behaviour.
 *
 * `essays` is already sorted newest-first, so the window selects a prefix and
 * `filter` keeps that order.
 *
 * One caveat worth knowing: the site is prerendered, so `Date.now()` is the
 * moment of the *build*, not of the visit. The feature set only changes when
 * the site is rebuilt, which for this repo means on push.
 */
export const load = () => {
  const essays = getWriting().filter((e) => !e.draft);
  const cutoff = Date.now() - FEATURE_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  const inWindow = (/** @type {string} */ date) => {
    const t = new Date(date).getTime();
    return !Number.isNaN(t) && t >= cutoff;
  };

  return {
    title: 'Writing',
    description: 'Essays and notes.',
    essays,
    featured: essays.filter((e, i) => i === 0 || inWindow(e.date))
  };
};
