<script>
  import { page } from '$app/state';
  import BrandMark from './BrandMark.svelte';
  import { ui } from '$lib/state/ui.svelte.js';
  import { NAV } from '$lib/site.js';
  import { nextPinState } from '$lib/header-pin.js';

  /**
   * The bar is a three-column grid — `1fr auto 1fr` — so the brand sits on the
   * true optical centre of the viewport regardless of how wide the breadcrumb
   * or the menu button get. Nothing is centred with transforms.
   */

  /** Section the current URL belongs to, for the `Richard Liu / Reading` crumb. */
  let crumb = $derived.by(() => {
    const path = page.url.pathname;
    if (path === '/') return null;
    const top = '/' + (path.split('/').filter(Boolean)[0] ?? '');
    const match = NAV.find((n) => n.href === top);
    if (match) return { label: match.label, href: match.href };
    // Standalone pages (/colophon) still get a crumb, just not a nav-backed one.
    const label = top.slice(1).replace(/-/g, ' ');
    return { label: label.charAt(0).toUpperCase() + label.slice(1), href: top };
  });

  let lastY = 0;

  /**
   * Mobile header hide-on-scroll-down / show-on-scroll-up. Deliberately not a
   * CSS-only `position: sticky`: the point is to give the small viewport its
   * full height while reading and hand the chrome back the instant the reader
   * reverses direction. The decision itself lives in `nextPinState` so it can be
   * tested without a scroll listener.
   */
  function onScroll() {
    const next = nextPinState({ y: window.scrollY, lastY, pinned: ui.headerPinned });
    ui.headerPinned = next.pinned;
    lastY = next.lastY;
  }

  $effect(() => {
    lastY = window.scrollY;
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });
</script>

<header
  class="header"
  class:header--pinned={ui.headerPinned}
  class:header--open={ui.menuOpen}
>
  <div class="header__bar layout-container">
    {#if ui.menuOpen}
      <!-- Open state drops the wordmark for the seal, which reads as a "back to
           the top level" affordance while the panel covers the page. -->
      <a href="/" class="header__logo-mark" aria-label="Richard Liu — home">
        <BrandMark variant="seal" />
      </a>
    {:else}
      <nav class="header__brand" aria-label="Breadcrumb">
        <a href="/" class="header__logo-word" aria-label="Richard Liu — home">
          <BrandMark variant="word" />
        </a>
        {#if crumb}
          <span class="header__breadcrumb-separator" aria-hidden="true">/</span>
          <a href={crumb.href} class="header__breadcrumb">{crumb.label}</a>
        {/if}
      </nav>
    {/if}

    <!-- `display: contents` at ≥1024px lets this wrapper hand its child
         straight to the grid, then the child pins itself to the container edge. -->
    <div class="header__actions js-only">
      <button
        class="btn btn--medium header__menu-text"
        class:header__menu-text--open={ui.menuOpen}
        type="button"
        aria-label={ui.menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={ui.menuOpen}
        aria-controls="main-nav-panel"
        onclick={() => ui.toggleMenu()}
      >
        <!-- Both layers occupy the same grid cell so the pill never changes
             width between `[M]` and the ✕. -->
        <span class="header__menu-text-stack">
          <span class="header__menu-text-layer header__menu-text-label" aria-hidden="true"
            >[M]</span
          >
          <span class="header__menu-text-layer header__menu-text-close" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1" />
            </svg>
          </span>
        </span>
      </button>
    </div>

    <button
      class="btn btn--medium btn--icon-only header__menu-button js-only"
      type="button"
      aria-label={ui.menuOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={ui.menuOpen}
      aria-controls="main-nav-panel"
      onclick={() => ui.toggleMenu()}
    >
      {#if ui.menuOpen}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1" />
        </svg>
      {:else}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 6H14M2 10H14" stroke="currentColor" stroke-width="1" />
        </svg>
      {/if}
    </button>

    <!-- Scripting-off path: a label driving the checkbox in +layout.svelte. The
         whole menu still opens and closes with CSS alone. -->
    <label for="nojs-nav-toggle" class="btn btn--medium header__nojs-menu nojs-only">
      <span class="header__nojs-menu-label header__nojs-menu-label--open" aria-hidden="true"
        >[M]</span
      >
      <span class="header__nojs-menu-label header__nojs-menu-label--close" aria-hidden="true"
        >[X]</span
      >
      <span class="sr-only">Menu</span>
    </label>
  </div>
</header>

<style>
  /*
   * Below 1024px the header is a sticky bar parked one full height above the
   * viewport, slid into place by toggling `top`. Transitioning `top` rather
   * than `transform` keeps it out of the way of the backdrop-filter on the
   * pills, which would otherwise sample a composited layer and flicker.
   */
  .header {
    position: sticky;
    top: calc(var(--header-height) * -1);
    z-index: var(--z-index-header);
    background: var(--color-surface-default);
    color: var(--color-text-default);
    min-height: var(--header-height);
    transition: top 0.22s var(--ease-emphasized);
    will-change: top;
  }

  .header--pinned {
    top: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .header {
      transition: none;
    }
  }

  .header__bar {
    position: relative;
    height: var(--header-height);
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
  }

  .header__logo-mark,
  .header__logo-word {
    margin: 0;
    color: inherit;
    text-decoration: none;
    display: flex;
    align-items: center;
    z-index: 1;
  }

  .header__logo-mark {
    grid-column: 1;
  }

  .header__brand {
    grid-column: 2;
    display: flex;
    align-items: center;
    gap: 0;
    min-width: 0;
    text-align: center;
  }

  /*
   * Identical type to the wordmark, and deliberately NO vertical nudge.
   *
   * The reference lifts its breadcrumb by a few pixels because its wordmark is
   * an SVG with a tight bounding box, so the text beside it has to be pulled up
   * onto the same optical line. Ours is live text in the same face at the same
   * size, so its line box already matches — and copying that nudge across shifted
   * the crumb 2.5px above the name (5px of margin, halved by the row's
   * `align-items: center`). Both sides now measure 28px tall with a common
   * baseline. Do not reintroduce a margin here.
   */
  .header__breadcrumb-separator,
  .header__breadcrumb {
    display: inline-block;
    font-family: var(--font-family-serif);
    font-size: var(--brand-font-size);
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .header__breadcrumb-separator {
    margin-inline: 0.1em;
  }

  .header__breadcrumb {
    color: inherit;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 20ch;
  }

  /* No breakpoint rule needed any more: --brand-font-size steps up on its own,
     and the wordmark steps with it. */

  .header__menu-button {
    grid-column: 3;
    justify-self: end;
    z-index: 1;
  }

  .header__menu-text {
    display: none;
  }

  .header__actions {
    display: contents;
  }

  .header__nojs-menu {
    display: none;
    grid-column: 3;
    justify-self: end;
    z-index: 1;
    cursor: pointer;
  }

  .header__nojs-menu-label--close {
    display: none;
  }

  /*
   * At desktop the header stops being chrome and becomes part of the page: it
   * scrolls away with the content, and the `[M]` control detaches into a fixed
   * pill aligned to the *content* container's right edge, not the viewport's,
   * so it stays in the grid on ultra-wide screens.
   */
  @media (min-width: 1024px) {
    .header {
      position: relative;
      top: auto;
      background: transparent;
      min-height: 0;
      z-index: auto;
      transition: none;
      will-change: auto;
    }

    .header.header--pinned {
      top: auto;
    }

    .header.header--open {
      position: sticky;
      top: 0;
      z-index: calc(var(--z-index-modal) + 11);
      /* The bar spans the panel while open, so it must not eat clicks meant for
         the nav underneath — only its own controls opt back in. */
      pointer-events: none;
    }

    .header.header--open .header__logo-mark,
    .header.header--open .header__logo-word,
    .header.header--open .header__menu-text {
      pointer-events: auto;
    }

    .header__menu-button {
      display: none;
    }

    .header__actions {
      display: flex;
      align-items: center;
      gap: var(--btn-padding-sm);
      position: fixed;
      top: calc((var(--header-height) - var(--btn-height)) / 2);
      right: max(
        var(--grid-margin),
        (100vw - var(--layout-max-width)) / 2 + var(--grid-margin)
      );
      z-index: calc(var(--z-index-modal) + 11);
    }

    .header__menu-text {
      display: inline-flex;
      gap: 0;
    }

    .header__menu-text-stack {
      display: grid;
      place-items: center;
    }

    .header__menu-text-layer {
      grid-area: 1 / 1;
      display: inline-flex;
      align-items: center;
      gap: 0;
    }

    /* `visibility` rather than `display`, so the hidden layer keeps reserving
       its width and the pill cannot resize mid-transition. */
    .header__menu-text-close {
      visibility: hidden;
    }

    .header__menu-text--open .header__menu-text-label {
      visibility: hidden;
    }

    .header__menu-text--open .header__menu-text-close {
      visibility: visible;
    }
  }
</style>
