<script>
  import { page } from '$app/state';
  import { ui } from '$lib/state/ui.svelte.js';
  import { NAV } from '$lib/site.js';

  /**
   * The menu. Two stacked layers, and what each one does depends on the width.
   *
   * Below 1024px:
   *   backdrop — opaque white, starts below the header, hides the page outright
   *   panel    — transparent, holds the links, `pointer-events: none` except on
   *              the links themselves
   *
   * At 1024px and up the two swap roles, which is the treatment the reference
   * actually ships and the one this component was missing:
   *   panel    — a solid white slab pinned to the top of the viewport, only as
   *              tall as the links inside it
   *   backdrop — everything below that slab: 60% grey over a 6px blur, so the
   *              page stays visible and out of focus rather than being erased
   *
   * The point of the split is that a menu of six links does not need to consume
   * a 1440x900 screen to be read. Covering only the band it occupies, and
   * defocusing the rest, says "this is a layer over the page" instead of "the
   * page is gone" — while still killing the contrast that would make the text
   * underneath compete with the nav.
   *
   * Neither layer transitions. The snap is the point: the menu behaves like a
   * mode switch, not a drawer.
   */

  let currentTop = $derived('/' + (page.url.pathname.split('/').filter(Boolean)[0] ?? ''));

  /** @type {HTMLElement | undefined} */
  let panelEl = $state();

  /**
   * Click-outside-to-dismiss, asked of the panel rather than of the viewport
   * width.
   *
   * The naive version — "backdrop clicked, therefore close" — is wrong below
   * 1024px, where the backdrop is not a scrim beside the menu, it *is* the
   * menu's own white surface. Every tap on empty space inside the open menu
   * lands on it (the panel above is `pointer-events: none` except on its
   * links), so that version would dismiss on any mis-tap.
   *
   * Testing the panel's own box instead of hardcoding the breakpoint keeps one
   * source of truth: at desktop the panel is a shallow slab and everything
   * below it is genuinely outside; at mobile the panel spans the viewport, so
   * no click is ever outside and nothing dismisses. It also stays correct on
   * its own if the slab's height changes, which it does — the height is content
   * driven.
   *
   * Escape and the header's ✕ are the keyboard and assistive paths; this is the
   * redundant pointer affordance, which is why the backdrop stays aria-hidden.
   *
   * @param {MouseEvent} e
   */
  function onBackdropClick(e) {
    if (!panelEl) return;
    const r = panelEl.getBoundingClientRect();
    const inside =
      e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) ui.closeMenu();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="overlay-backdrop"
  class:overlay-backdrop--open={ui.menuOpen}
  aria-hidden="true"
  role="presentation"
  onclick={onBackdropClick}
></div>

<nav
  bind:this={panelEl}
  id="main-nav-panel"
  class="overlay-panel"
  class:overlay-panel--open={ui.menuOpen}
  aria-label="Main navigation"
>
  <div class="overlay-panel__inner layout-grid">
    <div
      class="overlay-panel__nav-list layout-grid__full layout-col-start-5-tablet layout-col-start-9-desktop"
    >
      {#each NAV as item (item.href)}
        <div class="overlay-panel__row">
          <a
            class="overlay-panel__section-title type-serif-navigation overlay-panel__link"
            class:overlay-panel__link--active={currentTop === item.href}
            href={item.href}
            onclick={() => ui.closeMenu()}>{item.label}</a
          >
          {#if item.sub}
            <div class="overlay-panel__subnav">
              {#each item.sub as sub (sub.href)}
                <a
                  class="type-serif-navigation-indent overlay-panel__link"
                  href={sub.href}
                  onclick={() => ui.closeMenu()}>{sub.label}</a
                >
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</nav>

<style>
  .overlay-backdrop {
    display: none;
    position: fixed;
    /* Stops at the header so the wordmark and `[M]` stay legible above it. */
    inset: var(--header-height) 0 0;
    background: var(--color-surface-default);
    z-index: calc(var(--z-index-modal) + 9);
  }

  .overlay-backdrop--open {
    display: block;
  }

  .overlay-panel {
    display: none;
    position: fixed;
    inset: 0;
    padding-top: var(--header-height);
    color: var(--color-text-default);
    z-index: calc(var(--z-index-modal) + 11);
    /* The panel spans the viewport but is mostly empty; only its links should
       be clickable, or the whole screen would swallow pointer events. */
    pointer-events: none;
  }

  .overlay-panel--open {
    display: block;
  }

  .overlay-panel__inner {
    position: relative;
    height: 100%;
  }

  .overlay-panel__nav-list {
    --nav-list-row-gap: var(--btn-gap);
    margin-top: 24px;
    display: grid;
    row-gap: var(--nav-list-row-gap);
    font-family: var(--font-family-serif);
    font-size: 18px;
    line-height: 1.25;
    align-content: start;
    justify-content: start;
  }

  .overlay-panel__row {
    display: flex;
    flex-direction: column;
    gap: var(--btn-gap);
  }

  .overlay-panel__subnav {
    display: flex;
    flex-direction: column;
    gap: var(--btn-gap);
  }

  .overlay-panel__section-title {
    margin: 0;
  }

  .overlay-panel__link {
    color: inherit;
    text-decoration: none;
    pointer-events: auto;
  }

  .overlay-panel__link--active,
  .overlay-panel__link:hover,
  .overlay-panel__link:focus-visible {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
  }

  .overlay-panel__link:focus-visible {
    outline: none;
  }

  /*
   * Desktop: the white slab and the blur.
   *
   * The panel stops being a transparent full-screen sheet and becomes the
   * opaque one — `inset: 0 0 auto` drops the bottom edge, so its height is
   * whatever the links inside need and no more. It also has to take pointer
   * events back, since it is now a real surface rather than a pass-through.
   *
   * The backdrop keeps its `inset: var(--header-height) 0 0` and turns into the
   * blurred half: it still covers the page, but at 60% grey over `--blur-min`
   * instead of flat white. It sits one z-index below the panel, so the band
   * behind the links is painted twice — blur first, then the slab over it — and
   * only the region past the slab reads as blurred.
   *
   * `overflow-y: auto` plus `max-height: 100dvh` is the guard for the case this
   * layout invites: a viewport short enough that the slab would otherwise grow
   * past the bottom of the screen and take the links with it.
   */
  @media (min-width: 1024px) {
    .overlay-panel {
      inset: 0 0 auto;
      padding-top: 0;
      background: var(--color-surface-default);
      pointer-events: auto;
      z-index: calc(var(--z-index-modal) + 10);
      max-height: 100vh;
      max-height: 100dvh;
      overflow-y: auto;
      overscroll-behavior: contain;
    }

    /*
     * `height: 100%` would stretch the inner grid to the viewport and defeat
     * the whole point of the auto-height slab. The padding is the slab's own
     * breathing room below the last link.
     */
    .overlay-panel__inner {
      height: auto;
      padding-bottom: 60px;
    }

    .overlay-panel__nav-list {
      --nav-list-row-gap: var(--space-line-break);
      padding-left: var(--nav-marker-width);
    }

    /* Rows tighten to a single leading: inside a slab this shallow, the looser
       button gap reads as drift rather than as grouping. */
    .overlay-panel__row,
    .overlay-panel__subnav {
      gap: 0;
    }

    .overlay-backdrop {
      background: var(--color-surface-overlay);
      backdrop-filter: blur(var(--blur-min));
      -webkit-backdrop-filter: blur(var(--blur-min));
    }
  }
</style>
