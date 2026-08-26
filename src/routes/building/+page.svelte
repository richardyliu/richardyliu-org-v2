<script>
  import ContentPage from '$lib/components/ContentPage.svelte';
  import RichTextModule from '$lib/components/RichTextModule.svelte';
  import { reveal } from '$lib/actions/reveal.js';

  /**
   * /building — the things I have built, one cell per project.
   *
   * A grid rather than the full-width rows this page started as. Nine entries at
   * one row each ran to about six screens of scrolling, and these are not nine
   * equally weighted showpieces: three are competition robots from consecutive
   * seasons and three are screenshots of software. A grid lets the set be read
   * as a set.
   *
   * @type {{ data: { builds: { slug: string, title: string, caption: string, image: string, alt: string, url: string }[] } }}
   */
  let { data } = $props();

  const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'builds', label: 'Builds' }
  ];
</script>

<ContentPage sections={SECTIONS}>
  <RichTextModule id="overview" half>
    <p>
      Machines, and the software and documentation that grew up around them: three
      seasons of competition robots with
      <a href="https://www.thebluealliance.com/team/6353" target="_blank" rel="noreferrer noopener"
        >FRC 6353</a
      >, a go kart, a voice-driven rover, a haptic navigation device, an industrial
      robot for warehouse inventory, and the wiki, handbook and match-display app the
      robotics work needed.
    </p>
  </RichTextModule>

  <section class="layout-grid" id="builds">
    <h2 class="section-heading type-serif-body">
      Builds <span class="section-count type-semi-mono-small">[{data.builds.length}]</span>
    </h2>

    <ol class="builds">
      {#each data.builds as build, i (build.slug)}
        <li class="build" id={build.slug} data-reveal="" use:reveal={{ delay: (i % 3) * 60 }}>
          <figure class="build__figure">
            <div class="build__media">
              <img
                class="build__image"
                src={build.image}
                alt={build.alt}
                loading={i < 3 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
            <figcaption class="build__caption">
              <span class="build__index type-semi-mono-small">[{i + 1}]</span>
              <span class="build__body">
                <span class="build__title type-serif-body">
                  {#if build.url}
                    <a
                      class="build__link"
                      href={build.url}
                      target="_blank"
                      rel="noreferrer noopener">{build.title}</a
                    >
                  {:else}
                    {build.title}
                  {/if}
                </span>
                {#if build.caption}
                  <span class="build__text type-serif-small">{build.caption}</span>
                {/if}
              </span>
            </figcaption>
          </figure>
        </li>
      {/each}
    </ol>
  </section>
</ContentPage>

<style>
  .section-heading {
    grid-column: 1 / -1;
    margin: 0 0 var(--space-4);
    color: var(--color-text-muted);
  }

  .section-count {
    color: var(--color-text-muted);
    font-feature-settings: 'tnum', 'lnum';
  }

  /* Stops at the same column as the reading shelf so the detached [M] pill,
     which is fixed to the content container's right edge, never sits over a
     build image on scroll. */
  .builds {
    grid-column: 1 / -1;
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-6, 48px) var(--grid-gutter, 20px);
  }

  .build__figure {
    margin: 0;
    display: grid;
    row-gap: var(--space-3, 16px);
  }

  /*
   * A fixed-ratio well with the image *contained*, not covering it. The nine
   * pictures run from 3:4 phone photos of robots to 16:10 desktop screenshots;
   * cropping them to a common ratio would take the top off a tall robot and the
   * chrome off a screenshot. Containing them costs some grey and keeps every
   * cell the same height, which is what makes the grid read as a grid.
   */
  .build__media {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    background: var(--color-media-placeholder);
    overflow: hidden;
  }

  .build__image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .build__caption {
    display: grid;
    grid-template-columns: var(--nav-marker-width) 1fr;
    align-items: baseline;
  }

  .build__index {
    color: var(--color-text-muted);
    font-feature-settings: 'tnum', 'lnum';
  }

  .build__body {
    display: grid;
    row-gap: 2px;
    min-width: 0;
  }

  .build__title {
    min-width: 0;
  }

  .build__link {
    color: inherit;
    text-decoration: none;
  }

  .build__link:hover,
  .build__link:focus-visible {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
  }

  .build__text {
    color: var(--color-text-muted);
    min-width: 0;
  }

  @media (min-width: 600px) {
    .builds {
      grid-column: 1 / span 6;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .builds {
      grid-column: 1 / span 8;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>
