<script>
  import { ui } from '$lib/state/ui.svelte.js';

  /**
   * The only persistent affordance besides `[M]`. It sits bottom-centre on
   * desktop — unusual, and the reason the page reads as an application rather
   * than a document. On small screens it collapses to an icon in the corner,
   * where a thumb can reach it.
   *
   * No z-index games to hide it behind the overlays: at z 30 it is simply below
   * them, so both the menu backdrop and Find cover it on their own.
   */
</script>

<button
  class="btn btn--medium find-trigger js-only"
  aria-label="Find"
  onclick={() => ui.openFind()}
>
  <svg
    class="find-trigger__icon"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="7" cy="7" r="4" stroke="currentColor" stroke-width="1" />
    <path d="M10 10L14 14" stroke="currentColor" stroke-width="1" />
  </svg>
  <span class="find-trigger__label">Find [F]</span>
</button>

<style>
  .find-trigger {
    position: fixed;
    bottom: var(--grid-margin);
    right: var(--grid-margin);
    left: auto;
    z-index: 30;
    min-width: var(--btn-min-width);
    width: auto;
    padding: 0 var(--btn-padding-sm);
  }

  .find-trigger__icon {
    display: block;
    flex-shrink: 0;
  }

  .find-trigger__label {
    display: none;
  }

  @media (min-width: 1024px) {
    .find-trigger {
      right: auto;
      left: 50%;
      transform: translateX(-50%);
      padding: 0 var(--btn-padding-lg);
    }

    /* The label replaces the icon rather than joining it — the keycap `[F]`
       already says what the magnifier would. */
    .find-trigger__icon {
      display: none;
    }

    .find-trigger__label {
      display: inline;
    }
  }
</style>
