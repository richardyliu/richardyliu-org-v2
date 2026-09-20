import { getArticles, getShelf } from '$lib/content.js';

export const load = () => ({
  title: 'Reading',
  description:
    'What I have read — politics, history, economics, philosophy, psychology, biography, natural science, engineering — and the articles worth keeping.',
  shelf: getShelf(),
  articles: getArticles()
});
