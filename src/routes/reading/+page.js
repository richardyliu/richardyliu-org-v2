import { getShelf } from '$lib/content.js';

export const load = () => ({
  title: 'Reading',
  description:
    'What I have read — politics, history, economics, philosophy, psychology, biography, natural science, engineering.',
  shelf: getShelf()
});
