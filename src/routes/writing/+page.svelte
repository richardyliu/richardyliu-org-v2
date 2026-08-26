<script>
  import ContentPage from '$lib/components/ContentPage.svelte';
  import Card from '$lib/components/Card.svelte';
  import { monoDate } from '$lib/content.js';

  /** @type {{ data: { essays: import('$lib/content.js').Essay[] } }} */
  let { data } = $props();

  /**
   * Featured is the newest essay at four columns; everything else drops to a
   * two-up grid below. With a single essay the "All" section still renders, and
   * that repetition is intentional — the sections are the site's structure, not
   * a function of how much has been published.
   */
  let featured = $derived(data.essays[0]);
  let rest = $derived(data.essays);

  const SECTIONS = [
    { id: 'featured', label: 'Featured' },
    { id: 'all-writing', label: 'All Writing' }
  ];
</script>

<ContentPage sections={SECTIONS}>
  <section class="layout-grid" id="featured">
    {#if featured}
      <div class="feature">
        <Card
          href={`/writing/${featured.slug}`}
          title={featured.title}
          meta={monoDate(featured.date)}
          sub={featured.description}
          src={featured.cover}
          alt={featured.coverAlt}
          ratio="16 / 10"
        />
      </div>
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
  .feature {
    grid-column: 1 / -1;
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
    .feature {
      grid-column: 1 / span 5;
    }

    .grid-two {
      grid-column: 1 / span 6;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .feature {
      grid-column: 1 / span 5;
    }

    .grid-two {
      grid-column: 1 / span 8;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>
