import { getWriting } from '$lib/content.js';

export const load = () => ({
  title: 'Writing',
  description: 'Essays and notes.',
  essays: getWriting().filter((e) => !e.draft)
});
