<script>
  import ContentPage from '$lib/components/ContentPage.svelte';
  import RichTextModule from '$lib/components/RichTextModule.svelte';
  import { reveal } from '$lib/actions/reveal.js';

  /** @type {{ data: { investments: {name: string, description: string, year: number, via: string, url: string}[] } }} */
  let { data } = $props();

  const slugify = (/** @type {string} */ s) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const SECTIONS = [
    { id: 'thesis', label: 'Thesis' },
    { id: 'companies', label: 'Companies' }
  ];
</script>

<ContentPage sections={SECTIONS}>
  <RichTextModule id="thesis" half>
    <p>
      I invest in robotics, deep tech, infrastructure, and applications at
      <a href="https://www.llamaventures.vc/" target="_blank" rel="noreferrer noopener"
        >Llama Ventures</a
      >. What I look for is a team close enough to the metal that they can tell me which
      part of their own system they do not yet trust.
    </p>
  </RichTextModule>

  <section class="layout-grid" id="companies">
    <h2 class="section-heading type-serif-body">
      Companies <span class="section-count type-semi-mono-small"
        >[{data.investments.length}]</span
      >
    </h2>

    <!-- Rows, not cards: portfolio names carry no artwork, and a grid of empty
         media blocks would be a list pretending to be a gallery. -->
    <ul class="portfolio">
      {#each data.investments as inv, i (inv.name)}
        <li
          class="portfolio__row"
          id={slugify(inv.name)}
          data-reveal=""
          use:reveal={{ delay: i * 50 }}
        >
          <span class="portfolio__year type-semi-mono-small">{inv.year}</span>
          <span class="portfolio__name type-serif-body">
            {#if inv.url}
              <a
                class="portfolio__link"
                href={inv.url}
                target="_blank"
                rel="noreferrer noopener">{inv.name}</a
              >
            {:else}
              {inv.name}
            {/if}
          </span>
          <span class="portfolio__desc type-serif-body">{inv.description}</span>
          <span class="portfolio__via type-semi-mono-small">{inv.via}</span>
        </li>
      {/each}
    </ul>
  </section>
</ContentPage>

<style>
  .section-heading {
    grid-column: 1 / -1;
    color: var(--color-text-muted);
    margin-bottom: var(--space-3);
  }

  .section-count {
    color: var(--color-text-muted);
    font-feature-settings: 'lnum', 'tnum';
  }

  .portfolio {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
  }

  .portfolio__row {
    display: grid;
    grid-template-columns: 1fr;
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--color-divider);
    scroll-margin-top: calc(var(--header-height) + var(--space-3));
  }

  .portfolio__year,
  .portfolio__via {
    color: var(--color-text-muted);
    font-feature-settings: 'lnum', 'tnum';
  }

  .portfolio__desc {
    color: var(--color-text-muted);
  }

  .portfolio__link {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
  }

  @media (min-width: 600px) {
    .portfolio {
      grid-column: 1 / span 6;
    }

    .portfolio__row {
      grid-template-columns: 6ch minmax(0, 10em) minmax(0, 1fr) minmax(0, 10em);
      gap: var(--grid-gutter);
      align-items: baseline;
    }

    .portfolio__via {
      text-align: right;
    }
  }

  @media (min-width: 1024px) {
    .portfolio {
      grid-column: 1 / span 8;
    }
  }
</style>
