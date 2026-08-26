<script>
  import { page } from '$app/state';
  import { monoDate } from '$lib/content.js';
  import { reveal } from '$lib/actions/reveal.js';

  /** @type {{ data: any }} */
  let { data } = $props();

  const Body = $derived(data.component);

  /**
   * Share, keyed to `[S]`. Uses the platform sheet where there is one and falls
   * back to copying the URL, because a bare "share" that silently does nothing
   * is worse than no control at all. The label reports which happened.
   */
  let shareState = $state(/** @type {'idle' | 'copied' | 'failed'} */ ('idle'));

  async function share() {
    const url = page.url.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: data.meta.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      shareState = 'copied';
    } catch {
      // AbortError from a dismissed share sheet is not a failure worth showing.
      if (shareState !== 'copied') shareState = 'failed';
    }
    setTimeout(() => (shareState = 'idle'), 2000);
  }

  function onKeydown(/** @type {KeyboardEvent} */ e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = /** @type {HTMLElement | null} */ (e.target);
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (e.key.toLowerCase() === 's') {
      e.preventDefault();
      share();
    }
  }

  let shareLabel = $derived(
    shareState === 'copied' ? 'Copied' : shareState === 'failed' ? 'Copy failed' : 'Share'
  );
</script>

<svelte:window onkeydown={onKeydown} />

<main class="article">
  <div class="article__head layout-grid">
    <div class="article__rail type-semi-mono-small">
      <p class="article__date">{monoDate(data.meta.date)}</p>
      <p class="article__by">By Richard Liu</p>
      {#if data.meta.readingTime}
        <p class="article__read">{data.meta.readingTime} min</p>
      {/if}
      <p class="article__actions">
        <button class="article__action js-only" type="button" onclick={share}>
          <span class="article__key" aria-hidden="true">[S]</span>{shareLabel}
        </button>
      </p>
    </div>

    <h1 class="article__title type-article-title">{data.meta.title}</h1>
  </div>

  {#if data.meta.sample}
    <!-- Placeholder marker. This is a written-to-order sample so the layout can
         be judged with real prose in it; delete the flag when the piece is
         replaced by something Richard actually wrote. -->
    <div class="article__notice layout-grid">
      <p class="article__notice-body type-semi-mono-small">
        Sample article — written to exercise this template, not a published position.
      </p>
    </div>
  {/if}

  <div class="article__body layout-grid">
    <div class="article__prose prose type-article-body" data-reveal="" use:reveal>
      <Body />
    </div>
  </div>
</main>

<style>
  .article__head {
    padding-top: var(--space-6);
    align-items: start;
  }

  .article__title {
    grid-column: 1 / -1;
    grid-row: 2;
    text-align: center;
    text-wrap: balance;
    margin-top: var(--space-5);
  }

  .article__rail {
    grid-column: 1 / -1;
    grid-row: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--space-3);
    font-feature-settings: 'lnum', 'tnum';
  }

  .article__rail p {
    margin: 0;
    font: inherit;
    letter-spacing: inherit;
  }

  .article__action {
    border: 0;
    background: none;
    padding: 0;
    font: inherit;
    letter-spacing: inherit;
    color: inherit;
    cursor: pointer;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
  }

  /* The keycap sits in a fixed-width slot so stacked actions align, matching
     the numbered rail on the section pages. */
  .article__key {
    display: inline-block;
    width: var(--nav-marker-width);
  }

  .article__notice {
    margin-top: var(--space-5);
  }

  .article__notice-body {
    grid-column: 1 / -1;
    color: var(--color-text-muted);
    border-top: 1px solid var(--color-divider);
    border-bottom: 1px solid var(--color-divider);
    padding: var(--space-2) 0;
  }

  .article__body {
    padding-top: var(--space-7);
  }

  .article__prose {
    grid-column: 1 / -1;
    min-width: 0;
  }

  @media (min-width: 600px) {
    .article__title {
      grid-column: 2 / span 6;
    }

    .article__prose,
    .article__notice-body {
      grid-column: 2 / span 6;
    }
  }

  @media (min-width: 1024px) {
    .article__head {
      padding-top: var(--space-5);
    }

    /* The rail leaves the flow and stacks at column 1, level with the title —
       the reference's arrangement, and the reason the title can be optically
       centred on the full grid rather than on the text column. */
    .article__rail {
      grid-column: 1 / span 2;
      grid-row: 2;
      display: block;
      position: sticky;
      top: var(--sticky-top-offset);
      margin-top: var(--space-5);
    }

    .article__title {
      grid-column: 4 / span 6;
      grid-row: 2;
    }

    .article__prose,
    .article__notice-body {
      grid-column: 5 / span 4;
    }

    /* Prose reads at four columns; a data table does not. Columns 9-12 are
       empty at this breakpoint, so a wide table is allowed to bleed two columns
       to the right rather than wrap every cell to three words. Four columns is
       `4c + 3g` wide, so two more columns and their gutter come to
       `50% + g/2` of that — hence the 150%. Anything wider than the bleed still
       scrolls inside itself. */
    :global(.article__prose table) {
      max-width: calc(150% + var(--grid-gutter) / 2);
    }

    .article__body {
      padding-top: var(--space-8);
    }
  }
</style>
