<script>
  import ContentPage from '$lib/components/ContentPage.svelte';
  import Card from '$lib/components/Card.svelte';
  import ListGridToggle from '$lib/components/ListGridToggle.svelte';
  import { monoDate } from '$lib/content.js';

  /** @type {{ data: { shelf: import('$lib/content.js').ShelfEntry[] } }} */
  let { data } = $props();

  let view = $state(/** @type {'list' | 'grid'} */ ('grid'));

  const slugOf = (/** @type {string} */ s) => s.split('/').filter(Boolean).pop() ?? s;

  let recent = $derived(data.shelf.slice(0, 8));
  let withNotes = $derived(data.shelf.filter((b) => b.hasNotes));

  const SECTIONS = [
    { id: 'recent', label: 'Recent' },
    { id: 'with-notes', label: 'With Notes' },
    { id: 'all-reading', label: 'All Reading' }
  ];
</script>

<ContentPage sections={SECTIONS}>
  <section class="layout-grid" id="recent">
    <h2 class="section-heading type-serif-body">Recent</h2>
    <ul class="shelf-grid">
      {#each recent as book, i (book.slug)}
        <li id={slugOf(book.slug)} class="anchor-row">
          <Card
            href={book.hasNotes ? book.slug : '#recent'}
            title={book.title}
            sub={book.author}
            meta={monoDate(book.date)}
            src={book.coverImage}
            alt={book.title}
            ratio="2 / 3"
            fit="contain"
            delay={i * 40}
          />
        </li>
      {/each}
    </ul>
  </section>

  <section class="layout-grid" id="with-notes">
    <h2 class="section-heading type-serif-body">With Notes</h2>
    <ul class="shelf-grid">
      {#each withNotes as book (book.slug)}
        <li>
          <Card
            href={book.slug}
            title={book.title}
            sub={book.author}
            meta={monoDate(book.date)}
            src={book.coverImage}
            alt={book.title}
            ratio="2 / 3"
            fit="contain"
          />
        </li>
      {/each}
    </ul>
  </section>

  <section class="layout-grid" id="all-reading">
    <!-- The toggle lives in this section's heading row rather than in the page
         rail, because it only governs this section. In the rail it read as a
         page-wide control and then visibly failed to change the two above. -->
    <div class="section-bar">
      <h2 class="section-heading section-heading--inline type-serif-body">
        All Reading <span class="section-count type-semi-mono-small">[{data.shelf.length}]</span>
      </h2>
      <ListGridToggle value={view} onchange={(v) => (view = v)} />
    </div>

    {#if view === 'grid'}
      <ul class="shelf-grid shelf-grid--dense">
        {#each data.shelf as book (book.slug)}
          <li id={slugOf(book.slug)} class="anchor-row">
            <Card
              href={book.hasNotes ? book.slug : '#all-reading'}
              title={book.title}
              sub={book.author}
              src={book.coverImage}
              alt={book.title}
              ratio="2 / 3"
              fit="contain"
            />
          </li>
        {/each}
      </ul>
    {:else}
      <!-- The list view is the one that scales: 272 rows of text read faster
           than 272 covers, and the date column only makes sense here. -->
      <ul class="shelf-list">
        {#each data.shelf as book (book.slug)}
          <li class="shelf-row anchor-row" id={slugOf(book.slug)}>
            <span class="shelf-row__date type-semi-mono-small">{monoDate(book.date)}</span>
            <span class="shelf-row__title type-serif-body">
              {#if book.hasNotes}
                <a class="shelf-row__link" href={book.slug}>{book.title}</a>
              {:else}
                {book.title}
              {/if}
            </span>
            <span class="shelf-row__author type-serif-body">{book.author}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</ContentPage>

<style>
  .section-heading {
    grid-column: 1 / -1;
    color: var(--color-text-muted);
    margin-bottom: var(--space-3);
  }

  .section-bar {
    grid-column: 1 / -1;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--grid-gutter);
    margin-bottom: var(--space-3);
  }

  /* Already spaced by the bar; the heading must not add its own margin. */
  .section-heading--inline {
    grid-column: auto;
    margin-bottom: 0;
  }

  .section-count {
    color: var(--color-text-muted);
    font-feature-settings: 'lnum', 'tnum';
  }

  .shelf-grid {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-5) var(--grid-gutter);
  }

  /* Anchors from Find land on a row, so the row has to clear the header. */
  .anchor-row {
    scroll-margin-top: calc(var(--header-height) + var(--space-3));
  }

  .shelf-list {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
  }

  .shelf-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--color-divider);
  }

  .shelf-row__date {
    color: var(--color-text-muted);
    font-feature-settings: 'lnum', 'tnum';
  }

  .shelf-row__author {
    color: var(--color-text-muted);
  }

  .shelf-row__link {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
  }

  @media (min-width: 600px) {
    .shelf-grid {
      grid-column: 1 / span 6;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .shelf-grid--dense {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .shelf-list,
    .section-bar {
      grid-column: 1 / span 6;
    }

    /* Date column is sized in `ch` off the mono face, so every date occupies the
       same box and the titles form a hard left edge. */
    .shelf-row {
      grid-template-columns: 11ch minmax(0, 1fr) minmax(0, 14em);
      gap: var(--grid-gutter);
      align-items: baseline;
    }
  }

  @media (min-width: 1024px) {
    .shelf-grid {
      grid-column: 1 / span 8;
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .shelf-grid--dense {
      grid-template-columns: repeat(6, minmax(0, 1fr));
    }

    .shelf-list,
    .section-bar {
      grid-column: 1 / span 8;
    }
  }
</style>
