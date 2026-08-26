<script>
  /**
   * Landing caption + scene selector.
   *
   * The caption sits at `opacity: 0` until the block is hovered, with no
   * transition — it snaps. That is not an oversight copied from the reference,
   * it is the behaviour that makes the page work: at rest the viewport is
   * nothing but the drawing, and the text appears only for someone who has
   * already reached for it. A fade would make it feel like a tooltip that was
   * slow to arrive.
   *
   * Below 1024px the caption is not rendered visibly at all — there is no hover
   * on a touch screen to reveal it with — so the accessible copy lives in the
   * page's `.sr-only` block instead, and only the bullets remain.
   *
   * @type {{
   *   title: string,
   *   body?: string,
   *   count: number,
   *   active: number,
   *   onselect: (i: number) => void
   * }}
   */
  let { title, body = '', count, active, onselect } = $props();
</script>

<div class="visual-text">
  <div class="visual-description">
    <p class="type-semi-mono-x-small visual-desc">
      <span class="visual-heading visual-heading--title">{title}</span>
      {#if body}<span class="visual-desc-body">{body}</span>{/if}
    </p>
  </div>

  <nav class="visual-bullets type-mono-default" aria-label="Visual selector">
    {#each Array(count) as _, i (i)}
      <button
        class="bullet"
        class:active={i === active}
        type="button"
        aria-current={i === active}
        aria-label={`Visual ${i + 1}`}
        onclick={() => onselect(i)}
      >
        <span class="bracket" aria-hidden="true">[</span><span class="number">{i + 1}</span
        ><span class="bracket" aria-hidden="true">]</span>
      </button>
    {/each}
  </nav>
</div>

<style>
  .visual-text {
    position: absolute;
    bottom: var(--grid-margin);
    left: var(--grid-margin);
    right: var(--grid-margin);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-5);
    pointer-events: auto;
    text-align: center;
    color: var(--color-text-default);
    z-index: 2;
  }

  .visual-description {
    display: none;
  }

  .visual-desc {
    margin: 0;
    max-width: 307px;
    opacity: 0;
  }

  .visual-heading {
    display: block;
    font-feature-settings: 'tnum', 'lnum';
  }

  /* Author-controlled line breaks: these captions are short enough that ragging
     them by hand beats whatever the box width decides. */
  .visual-heading--title {
    white-space: pre-line;
  }

  /* `1lh` is exactly one line of the caption's own leading, so the body sits on
     the same baseline grid as the title above it regardless of font size. */
  .visual-desc-body {
    display: block;
    margin-top: 1lh;
  }

  .visual-bullets {
    display: flex;
    gap: 12px;
    align-items: center;
    color: var(--color-text-default);
    font-feature-settings: 'tnum', 'lnum';
  }

  .bullet {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    color: inherit;
    font: inherit;
    font-feature-settings: inherit;
    letter-spacing: inherit;
    white-space: nowrap;
    line-height: inherit;
  }

  /* The active scene's number disappears, leaving `[ ]`. Tabular figures mean
     the empty bracket is exactly as wide as a digit, so the row never reflows —
     which is what lets an absence work as the state indicator. */
  .bullet.active .number {
    visibility: hidden;
  }

  @media (min-width: 1024px) {
    .visual-text {
      left: max(var(--grid-margin), (100vw - var(--layout-max-width)) / 2 + var(--grid-margin));
      right: auto;
      align-items: flex-start;
      text-align: left;
      gap: var(--space-4);
      width: 350px;
    }

    .visual-description {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .visual-desc {
      max-width: 350px;
    }
  }

  @media (hover: hover) and (pointer: fine) {
    .visual-text:hover .visual-desc {
      opacity: 1;
    }
  }
</style>
