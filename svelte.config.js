import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
export default {
  extensions: ['.svelte', '.svx', '.md'],
  preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
  kit: {
    adapter: adapter({ fallback: '404.html', precompress: false, strict: true }),
    prerender: { handleHttpError: 'fail' },
    alias: { $content: 'src/content' }
  }
};
