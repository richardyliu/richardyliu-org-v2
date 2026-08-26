<script>
  /**
   * The identity, in two forms. The reference ships its wordmark as an SVG path
   * so it is immune to font loading; ours is live text instead, because the
   * serif is a substitute and a traced outline of it would just be a worse copy
   * of the same font. The seal is drawn: a filled square with the character
   * reversed out, which is what a 印章 actually looks like, and it holds up at
   * 26px where a thin-stroked glyph would not.
   *
   * @type {{ variant?: 'word' | 'seal', size?: number }}
   */
  let { variant = 'word', size = 26 } = $props();
</script>

{#if variant === 'seal'}
  <svg
    width={size}
    height={size}
    viewBox="0 0 26 26"
    role="img"
    aria-label="Richard Liu"
    class="seal"
  >
    <rect x="0.5" y="0.5" width="25" height="25" rx="1.5" fill="currentColor" />
    <text
      x="13"
      y="13"
      text-anchor="middle"
      dominant-baseline="central"
      font-size="17"
      class="seal__glyph">劉</text
    >
  </svg>
{:else}
  <span class="wordmark">Richard Liu</span>
{/if}

<style>
  /* Size, leading and tracking all come from --brand-* tokens, which the
     breadcrumb beside it uses too. Sharing them is what keeps the two line
     boxes identical, and therefore their baselines on the same line. */
  .wordmark {
    font-family: var(--font-family-serif);
    font-size: var(--brand-font-size);
    line-height: 1;
    letter-spacing: -0.02em;
    white-space: nowrap;
  }

  .seal {
    display: block;
  }

  /* The reversed character has to come from the surface colour, not white, or
     it disappears when the seal is used inside a dark subtree. */
  .seal__glyph {
    fill: var(--color-surface-default);
    font-family: 'Songti SC', 'Source Han Serif SC', 'Noto Serif CJK SC', serif;
    font-weight: 400;
  }
</style>
