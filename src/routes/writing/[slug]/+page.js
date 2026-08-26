import { error } from '@sveltejs/kit';
import { getEssayModule, getWriting } from '$lib/content.js';

/**
 * Tells the prerenderer which slugs exist rather than relying purely on link
 * discovery, so an essay that is not yet linked from the index still gets built.
 */
export const entries = () => getWriting().map((e) => ({ slug: e.slug }));

export const load = ({ params }) => {
  const mod = getEssayModule(params.slug);
  if (!mod) error(404, 'Not found');
  const m = mod.metadata ?? {};
  return {
    title: m.title ?? params.slug,
    description: m.description ?? '',
    component: mod.default,
    meta: {
      title: m.title ?? params.slug,
      description: m.description ?? '',
      date: m.date ?? '',
      tags: m.tags ?? '',
      readingTime: m.readingTime ?? 0,
      sample: Boolean(m.sample)
    }
  };
};
