<script>
  import { reveal } from '$lib/actions/reveal.js';

  /**
   * A block of prose on the page grid.
   *
   * `half` narrows the measure to five of twelve columns. Copy set at the full
   * eight would run to ~110 characters a line at 1752px, which is roughly twice
   * a comfortable measure — the narrow column is not decoration, it is the only
   * reason the serif is readable at this page width.
   *
   * @type {{
   *   id?: string,
   *   half?: boolean,
   *   heading?: string,
   *   children: import('svelte').Snippet
   * }}
   */
  let { id, half = false, heading, children } = $props();
</script>

<section class="rich-text-module layout-grid" {id}>
  <div
    class="rich-text-module__body type-serif-body prose"
    class:rich-text-module__body--half={half}
    data-reveal=""
    use:reveal
  >
    {#if heading}
      <h2 class="rich-text-module__heading type-serif-body">{heading}</h2>
    {/if}
    {@render children()}
  </div>
</section>

<style>
  .rich-text-module__body {
    grid-column: 1 / -1;
    min-width: 0;
  }

  /* Section headings sit at body size, not heading size. Hierarchy here comes
     from the mono rail and the whitespace, never from a bigger serif. */
  .rich-text-module__heading {
    margin-bottom: var(--space-line-break);
    color: var(--color-text-muted);
  }

  @media (min-width: 600px) {
    .rich-text-module__body {
      grid-column: 1 / span 6;
    }

    .rich-text-module__body--half {
      grid-column: 1 / span 5;
    }
  }

  @media (min-width: 1024px) {
    .rich-text-module__body {
      grid-column: 1 / span 8;
    }

    .rich-text-module__body--half {
      grid-column: 1 / span 5;
    }
  }
</style>
