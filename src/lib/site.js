/**
 * Site identity. Single source of truth for the wordmark, SEO strings and the
 * Find overlay's prompt prefix, so renaming happens in exactly one place.
 */

export const SITE_NAME = 'Richard Liu';
/** Shown beside the wordmark in the footer. */
export const SITE_NAME_FULL = 'Richard Liu 劉永樂';
export const SITE_DESCRIPTION =
  'Richard Liu builds and invests at the frontier — robotics, deep tech, infrastructure, and the agents that will do skilled work.';
export const SITE_URL = 'https://www.richardyliu.org';

/**
 * The five-scene landing drawing is temporarily off: `/` renders the About
 * prose instead. The flag is read in two places — the route, which picks what
 * to mount, and +layout.svelte, which only gives `/` the full-viewport,
 * no-footer treatment while the drawing is what is on it. Set to true to
 * restore both at once; nothing has been deleted.
 */
export const LANDING_ENABLED = false;
/** Lowercased, no protocol: the Find overlay renders it as a shell prompt. */
export const FIND_PROMPT = 'richardyliu';

export const SOCIAL = {
  x: 'https://x.com/richard_yliu',
  github: 'https://github.com/richardyliu',
  linkedin: 'https://www.linkedin.com/in/richard-yliu/'
};

/**
 * Menu overlay structure. `sub` entries render indented beneath their section,
 * exactly as the reference does — the indent is typographic (text-indent), not
 * a nested list, so the whole panel stays one flat grid of rows.
 */
export const NAV = [
  { label: 'About', href: '/' },
  { label: 'Building', href: '/building' },
  { label: 'Writing', href: '/writing' },
  {
    label: 'Reading',
    href: '/reading',
    sub: [{ label: 'With Notes', href: '/reading#with-notes' }]
  },
  { label: 'Investing', href: '/investing' }
];

/** @typedef {{ label: string, href: string, external?: boolean }} LegalLink */

/**
 * The footer's link rows, bottom-left — one row now, the social links. The
 * Colophon/Contact row and the Llama Ventures row are gone. Nothing links to
 * `/colophon` any more as a result: the page still builds and is still
 * reachable through Find, it just has no navigation pointing at it.
 *
 * Kept as rows-of-rows rather than flattened to a plain list, because the
 * footer renders one <p> per row and that is the only thing deciding where
 * these break. A second row later should not mean editing the markup too.
 *
 * Typed explicitly: inferred, the rows without `external` and the rows with it
 * become different object types, and reading `.external` fails on half of them.
 *
 * @type {LegalLink[][]}
 */
export const LEGAL_ROWS = [
  [
    { label: 'X', href: SOCIAL.x, external: true },
    { label: 'GitHub', href: SOCIAL.github, external: true },
    { label: 'LinkedIn', href: SOCIAL.linkedin, external: true }
  ]
];
