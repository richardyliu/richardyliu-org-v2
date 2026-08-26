<script>
  import BrandMark from './BrandMark.svelte';
  import { LEGAL_ROWS, SITE_NAME_FULL } from '$lib/site.js';

  const YEAR = 2026;
</script>

<footer class="footer">
  <div class="footer__left">
    <a href="/" class="footer__brand" aria-label="Richard Liu — home">
      <BrandMark variant="seal" size={25} />
    </a>
    <div class="footer__legal type-semi-mono-default">
      <p>{SITE_NAME_FULL}</p>
      <p class="footer__legal-spacer"></p>
      {#each LEGAL_ROWS as row, i (i)}
        <p>
          {#each row as link, j (link.href)}{#if j > 0}{', '}{/if}<a
              class="footer__link"
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer noopener' : undefined}>{link.label}</a
            >{/each}
        </p>
      {/each}
      <p class="footer__legal-spacer"></p>
      <p>&copy; {YEAR}</p>
    </div>
  </div>
</footer>

<style>
  .footer {
    background: var(--color-surface-default);
    color: var(--color-text-default);
    padding: var(--space-4) 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: var(--grid-max-width);
    box-sizing: border-box;
    margin-inline: auto;
  }

  /* On mobile the wrapper dissolves so mark and legal become direct children of
     the column flow and can be ordered independently. */
  .footer__left {
    display: contents;
  }

  .footer__brand {
    order: 1;
    margin: 0;
    padding: 0 var(--grid-margin);
    color: inherit;
    text-decoration: none;
    display: flex;
    align-items: center;
  }

  .footer__legal {
    order: 3;
    margin-top: 57px;
    padding: 0 var(--grid-margin);
    line-height: 1.35;
    letter-spacing: 0;
    font-feature-settings: 'lnum', 'tnum';
  }

  .footer__legal p {
    margin: 0;
    font: inherit;
    letter-spacing: inherit;
  }

  /* An empty line of exactly one line-height, so blank rows in the legal block
     land on the same rhythm as the text rows. */
  .footer__legal-spacer {
    height: 1.35em;
  }

  .footer__link {
    color: inherit;
    text-decoration: none;
  }

  .footer__link:hover,
  .footer__link:focus-visible {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
  }

  .footer__link:focus-visible {
    outline: none;
  }

  @media (min-width: 600px) {
    .footer {
      padding: var(--space-4) var(--grid-margin);
      display: grid;
      grid-template-columns: var(--grid-template-columns);
      column-gap: var(--space-4);
      align-items: start;
    }

    .footer__left {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      grid-column: 1 / span 3;
      align-self: start;
    }

    .footer__brand {
      order: initial;
      padding: 0;
    }

    .footer__legal {
      order: initial;
      margin-top: 0;
      padding: 0;
      max-width: 315px;
    }
  }
</style>
