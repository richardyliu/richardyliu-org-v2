<script>
  import '$lib/styles/base.css';
  import { page } from '$app/state';
  import Header from '$lib/components/Header.svelte';
  import OverlayPanel from '$lib/components/OverlayPanel.svelte';
  import FindTrigger from '$lib/components/FindTrigger.svelte';
  import FindOverlay from '$lib/components/FindOverlay.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { ui } from '$lib/state/ui.svelte.js';
  import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, LANDING_ENABLED } from '$lib/site.js';

  /** @type {{ children: import('svelte').Snippet }} */
  let { children } = $props();

  /**
   * The landing drawing owns the whole viewport and has no footer. Gated on
   * LANDING_ENABLED as well as the path, because `/` currently renders the
   * About prose — which scrolls, and does want its footer.
   */
  let isLanding = $derived(LANDING_ENABLED && page.url.pathname === '/');

  /**
   * Global keys. Single letters, no modifier — which only works because there
   * is no text input anywhere on the site except inside Find itself, and that
   * one is guarded below.
   */
  function onKeydown(/** @type {KeyboardEvent} */ e) {
    const target = /** @type {HTMLElement | null} */ (e.target);
    const typing =
      target && (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable);

    // ⌘K works even while typing, because that is the gesture people arrive
    // with from every other tool.
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      ui.toggleFind();
      return;
    }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

    const k = e.key.toLowerCase();
    if (k === 'f') {
      e.preventDefault();
      ui.openFind();
    } else if (k === 'm') {
      e.preventDefault();
      ui.toggleMenu();
    } else if (e.key === 'Escape') {
      ui.closeAll();
    } else if (k === '?') {
      e.preventDefault();
      ui.openFind();
    }
  }

  // Route changes must not leave an overlay open over a page the user has
  // already navigated away from.
  $effect(() => {
    void page.url.pathname;
    ui.closeAll();
  });

  // Scroll is locked while the menu is up. Find leaves it alone: its own
  // backdrop is fixed, and locking would shift the page under the blur.
  $effect(() => {
    document.body.classList.toggle('is-locked', ui.menuOpen);
    return () => document.body.classList.remove('is-locked');
  });
</script>

<svelte:head>
  <title>{page.data.title ? `${page.data.title} | ${SITE_NAME}` : SITE_NAME}</title>
  <meta name="description" content={page.data.description ?? SITE_DESCRIPTION} />
  <meta property="og:title" content={page.data.title ?? SITE_NAME} />
  <meta property="og:description" content={page.data.description ?? SITE_DESCRIPTION} />
  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:image" content={`${SITE_URL}/RYL.png`} />
  <meta name="twitter:card" content="summary" />
</svelte:head>

<svelte:window onkeydown={onKeydown} />

<div class="header-wrapper">
  <!--
    Scripting-off menu. The checkbox is a sibling of everything it controls, so
    `:checked ~ *` can open the panel with no JavaScript at all. It is hidden
    from assistive tech because the scripted `[M]` button is the real control
    whenever scripting is available.
  -->
  <input
    id="nojs-nav-toggle"
    class="nojs-nav-toggle"
    type="checkbox"
    aria-hidden="true"
    tabindex="-1"
  />
  <Header />
  <OverlayPanel />
</div>

<div class="page-content" class:page-content--landing={isLanding}>
  {@render children()}
</div>

{#if !isLanding}
  <div class="page-content-end">
    <Footer />
  </div>
{/if}

<FindTrigger />
<FindOverlay />

<style>
  .header-wrapper {
    display: contents;
  }

  .nojs-nav-toggle {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    width: 0;
    height: 0;
  }

  .page-content {
    display: flex;
    flex-direction: column;
  }

  /*
   * The landing page is exactly one viewport with no scroll: the canvas fills
   * the space under the header, and `min-height: 0` is what allows it to shrink
   * inside the flex column instead of forcing the page taller than the screen.
   */
  .page-content--landing {
    height: calc(100vh - var(--header-height));
    height: calc(100dvh - var(--header-height));
    min-height: 0;
    overflow: hidden;
  }

  /* --- no-JS menu wiring ------------------------------------------------ */
  /* Every rule here is :global because the elements it targets live in child
     components, and the checkbox it keys off lives in this one. */
  :global(html:not(.js) .js-only) {
    display: none !important;
  }

  :global(.nojs-only) {
    display: none;
  }

  :global(html:not(.js) .nojs-only) {
    display: inline-flex;
  }

  :global(#nojs-nav-toggle:checked ~ * .overlay-backdrop),
  :global(#nojs-nav-toggle:checked ~ .overlay-backdrop) {
    display: block;
  }

  :global(#nojs-nav-toggle:checked ~ * .overlay-panel),
  :global(#nojs-nav-toggle:checked ~ .overlay-panel) {
    display: block;
  }

  :global(#nojs-nav-toggle:checked ~ * .header__nojs-menu-label--open) {
    display: none;
  }

  :global(#nojs-nav-toggle:checked ~ * .header__nojs-menu-label--close) {
    display: inline;
  }
</style>
