<script>
  import ContentPage from '$lib/components/ContentPage.svelte';
  import Card from '$lib/components/Card.svelte';
  import { monoDate } from '$lib/content.js';

  /**
   * @type {{ data: {
   *   essays: import('$lib/content.js').Essay[],
   *   featured: import('$lib/content.js').Essay[]
   * } }}
   */
  let { data } = $props();

  /**
   * Which essays are featured is decided in +page.js — the newest plus anything
   * inside the recency window. This file only lays them out: feature cards at
   * roughly five columns, two to a row, and everything else in the two-up grid
   * below.
   *
   * Featured essays appear in "All Writing" as well, and that repetition is
   * intentional — the sections are the site's structure, not a function of how
   * much has been published.
   */
  let featured = $derived(data.featured);
  let rest = $derived(data.essays);

  const SECTIONS = [
    { id: 'featured', label: 'Featured' },
    { id: 'all-writing', label: 'All Writing' }
  ];
</script>

<ContentPage sections={SECTIONS}>
  <section class="layout-grid" id="featured">
    {#if featured.length}
      <ul class="feature-grid">
        {#each featured as essay, i (essay.slug)}
          <li>
            <Card
              href={`/writing/${essay.slug}`}
              title={essay.title}
              meta={monoDate(essay.date)}
              sub={essay.description}
              src={essay.cover}
              alt={essay.coverAlt}
              ratio="16 / 10"
              delay={i * 60}
            />
          </li>
        {/each}
      </ul>
    {:else}
      <p class="empty type-serif-body">Nothing published yet.</p>
    {/if}
  </section>

  <section class="layout-grid" id="all-writing">
    <h2 class="section-heading type-serif-body">All Writing</h2>
    <ul class="grid-two">
      {#each rest as essay, i (essay.slug)}
        <li>
          <Card
            href={`/writing/${essay.slug}`}
            title={essay.title}
            meta={monoDate(essay.date)}
            src={essay.cover}
            alt={essay.coverAlt}
            ratio="4 / 3"
            delay={i * 60}
          />
        </li>
      {/each}
    </ul>
  </section>
</ContentPage>

<style>
  /* One feature card per row until there is room for two. The desktop track is
     eleven columns rather than twelve so each card lands near the five columns
     a single feature used to occupy, and a lone feature still matches the old
     layout because it simply takes the first track. */
  .feature-grid {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-6) var(--grid-gutter);
  }

  .section-heading {
    grid-column: 1 / -1;
    color: var(--color-text-muted);
    margin-bottom: var(--space-3);
  }

  .grid-two {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-5) var(--grid-gutter);
  }

  .empty {
    grid-column: 1 / -1;
    color: var(--color-text-muted);
  }

  @media (min-width: 600px) {
    .feature-grid {
      grid-column: 1 / span 5;
    }

    .grid-two {
      grid-column: 1 / span 6;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .feature-grid {
      grid-column: 1 / span 11;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .grid-two {
      grid-column: 1 / span 8;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>
