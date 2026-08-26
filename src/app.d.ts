// Ambient types for the project.
declare global {
  namespace App {
    interface PageData {
      title?: string;
      description?: string;
    }
  }
}

/**
 * mdsvex compiles .md and .svx into Svelte components with a `metadata` export.
 * Content is loaded through `import.meta.glob` (see src/lib/content.js), which
 * Vite types for us; these cover any direct, non-aliased import.
 */
declare module '*.md' {
  import type { Component } from 'svelte';
  const component: Component;
  export const metadata: Record<string, any>;
  export default component;
}

declare module '*.svx' {
  import type { Component } from 'svelte';
  const component: Component;
  export const metadata: Record<string, any>;
  export default component;
}

export {};
