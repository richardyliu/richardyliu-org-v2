<script>
  import { monoDate } from '$lib/content.js';
  import { reveal } from '$lib/actions/reveal.js';

  /** @type {{ data: any }} */
  let { data } = $props();

  const Notes = $derived(data.component);
</script>

<main class="book">
  <div class="book__head layout-grid">
    <div class="book__rail type-semi-mono-small">
      <p>{monoDate(data.book.date)}</p>
      <p>{data.book.author}</p>
      <p><a class="book__back" href="/reading">[←] Reading</a></p>
    </div>

    <div class="book__cover">
      <img src={data.book.coverImage} alt={data.book.title} decoding="async" />
    </div>

    <h1 class="book__title type-article-headline">{data.book.title}</h1>
  </div>

  {#if Notes}
    <div class="book__body layout-grid">
      <div class="book__prose prose type-article-body" data-reveal="" use:reveal>
        <Notes />
      </div>
    </div>
  {/if}
</main>

<style>
  .book__head {
    padding-top: var(--space-6);
    align-items: start;
  }

  .book__rail {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--space-3);
    font-feature-settings: 'lnum', 'tnum';
    color: var(--color-text-muted);
  }

  .book__rail p {
    margin: 0;
    font: inherit;
    letter-spacing: inherit;
  }

  .book__back {
    color: var(--color-text-default);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
  }

  .book__cover {
    grid-column: 1 / span 2;
    margin-top: var(--space-3);
    background: var(--color-media-placeholder);
  }

  .book__cover img {
    width: 100%;
    height: auto;
  }

  .book__title {
    grid-column: 1 / -1;
    margin-top: var(--space-3);
    text-wrap: balance;
  }

  .book__body {
    padding-top: var(--space-6);
  }

  .book__prose {
    grid-column: 1 / -1;
    min-width: 0;
  }

  @media (min-width: 600px) {
    .book__rail {
      grid-column: 1 / span 5;
    }

    .book__cover {
      grid-column: 1 / span 2;
    }

    .book__title {
      grid-column: 3 / span 4;
      margin-top: var(--space-3);
    }

    .book__prose {
      grid-column: 3 / span 4;
    }
  }

  @media (min-width: 1024px) {
    .book__rail {
      grid-column: 1 / span 2;
      display: block;
      position: sticky;
      top: var(--sticky-top-offset);
    }

    .book__cover {
      grid-column: 4 / span 2;
      margin-top: 0;
    }

    .book__title {
      grid-column: 7 / span 4;
      margin-top: 0;
    }

    .book__prose {
      grid-column: 7 / span 4;
    }
  }
</style>
