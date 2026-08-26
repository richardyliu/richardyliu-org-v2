<script>
  import PageSidebar from './PageSidebar.svelte';
  import { ui } from '$lib/state/ui.svelte.js';

  /**
   * Shared shell for every page except the landing page.
   *
   * The rail is laid over the page rather than beside it: an absolutely
   * positioned grid pinned to `main`'s box, so it inherits main's full height
   * and `position: sticky` inside it has the whole scroll to travel through. A
   * rail sitting in its own short container above the content would have
   * nothing to stick within and would quietly not move at all.
   *
   * The pay-off is that modules keep the real 12-column grid instead of a
   * sub-grid of some narrower body column — they place themselves at columns
   * 1–8 and simply never reach under the rail at 10–12.
   *
   * @type {{
   *   sections?: { id: string, label: string }[],
   *   children: import('svelte').Snippet
   * }}
   */
  let { sections = [], children } = $props();
</script>

<main class="content-page">
  {#if sections.length}
    <!-- The menu backdrop starts below the header so the wordmark stays
         readable, but the rail is pulled up into that same band — so it has to
         be hidden explicitly rather than relying on the backdrop to cover it. -->
    <div
      class="content-page__overlay layout-overlay-grid"
      class:content-page__overlay--concealed={ui.menuOpen}
    >
      <div class="content-page__rail">
        <PageSidebar {sections} />
      </div>
    </div>
  {/if}

  <div class="layout-page-modules content-page__modules">
    {@render children()}
  </div>
</main>

<style>
  .content-page {
    position: relative;
  }

  .content-page__overlay {
    /* Covers the page but must not eat clicks meant for the prose underneath;
       only the rail's own contents opt back in. */
    pointer-events: none;
    z-index: 2;
  }

  .content-page__overlay--concealed {
    visibility: hidden;
  }

  .content-page__rail {
    display: none;
    pointer-events: auto;
    min-width: 0;
    /* Sticky inside the absolutely-positioned overlay: the overlay spans main's
       full height, so this is the travel range the rail gets. */
    position: sticky;
    top: var(--sticky-top-offset);
    align-self: start;
    /* `--sticky-top-offset` is `header/2 − 0.625em`, and `em` resolves against
       whatever element uses it. The offset was derived for the mono rail, so the
       rail has to carry the mono size or the first row lands ~4px high. */
    font-size: var(--type-mono-navigation-size);
  }

  .content-page__modules {
    padding-top: var(--space-8);
  }

  @media (min-width: 600px) {
    .content-page__rail {
      display: block;
      grid-column: 6 / span 3;
      padding-top: var(--space-3);
    }
  }

  @media (min-width: 1024px) {
    .content-page__modules {
      padding-top: var(--space-9);
    }

    .content-page__rail {
      grid-column: 10 / span 3;
      /*
       * At this width the header is transparent and scrolls with the page, so
       * the rail is pulled up onto the header's own centre line — the offset is
       * exactly `sticky-top − header`, which is where PageSidebar then sticks,
       * putting its first row on the same baseline as `[M]`. Below 1024px the
       * header is an opaque sticky bar and this would hide the rail behind it.
       */
      padding-top: 0;
      margin-top: calc(var(--sticky-top-offset) - var(--header-height));
    }
  }
</style>
