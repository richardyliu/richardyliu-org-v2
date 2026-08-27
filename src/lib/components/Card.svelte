<script>
  import { reveal } from '$lib/actions/reveal.js';

  /**
   * One item in a list: media block, mono meta line, serif title.
   *
   * The media block always renders, even with no image — an empty grey field at
   * a fixed ratio. That is on purpose: it holds the grid, so a list of items
   * with and without artwork still lines up, and a page does not reflow as
   * covers load in.
   *
   * Without an `href` the card renders as a plain block: no link, no hover
   * response. That is for entries that exist on the shelf but have nothing to
   * open — pointing them at a placeholder anchor made them advertise a
   * destination they do not have.
   *
   * @type {{
   *   href?: string | null,
   *   title: string,
   *   meta?: string,
   *   sub?: string,
   *   src?: string | null,
   *   alt?: string,
   *   ratio?: string,
   *   fit?: 'cover' | 'contain',
   *   external?: boolean,
   *   compact?: boolean,
   *   delay?: number
   * }}
   */
  let {
    href = null,
    title,
    meta = '',
    sub = '',
    src = null,
    alt = '',
    ratio = '1 / 1',
    fit = 'cover',
    external = false,
    compact = false,
    delay = 0
  } = $props();
</script>

<svelte:element
  this={href ? 'a' : 'div'}
  class="card"
  href={href || undefined}
  target={href && external ? '_blank' : undefined}
  rel={href && external ? 'noreferrer noopener' : undefined}
  data-reveal=""
  use:reveal={{ delay }}
>
  <div class="card__media" style:aspect-ratio={ratio}>
    {#if src}
      <img class="card__image" style:object-fit={fit} {src} {alt} loading="lazy" decoding="async" />
    {/if}
  </div>

  {#if meta}
    <p class="card__meta type-semi-mono-small">{meta}</p>
  {/if}
  <p class="card__title type-serif-body">{title}</p>
  {#if sub}
    <p class="card__sub {compact ? 'type-serif-small' : 'type-serif-body'}">{sub}</p>
  {/if}
</svelte:element>

<style>
  .card {
    display: block;
    color: inherit;
    text-decoration: none;
    min-width: 0;
  }

  .card__media {
    position: relative;
    width: 100%;
    background: var(--color-media-placeholder);
    overflow: hidden;
  }

  .card__image {
    width: 100%;
    height: 100%;
  }

  /* A 4% black wash on hover. Just enough to register as a response on a white
     page without introducing a second colour anywhere in the system. */
  .card__media::after {
    content: '';
    position: absolute;
    inset: 0;
    background: #000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s var(--ease-standard);
  }

  a.card:hover .card__media::after,
  a.card:focus-visible .card__media::after {
    opacity: 0.04;
  }

  .card__meta {
    margin: var(--space-1) 0 0;
    color: var(--color-text-default);
  }

  .card__title {
    margin: var(--space-1) 0 0;
  }

  a.card:hover .card__title,
  a.card:focus-visible .card__title {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
  }

  .card__sub {
    margin: 0;
    color: var(--color-text-muted);
  }

  .card:focus-visible {
    outline: none;
  }

  .card:focus-visible .card__media {
    outline: 2px solid var(--color-focus-outline);
    outline-offset: 2px;
  }
</style>
