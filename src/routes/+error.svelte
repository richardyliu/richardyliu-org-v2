<script>
  import { page } from '$app/state';
</script>

<main class="error layout-grid">
  <div class="error__body">
    <p class="error__code type-semi-mono-small">[{page.status}]</p>
    <h1 class="type-article-headline">{page.error?.message ?? 'Something went wrong'}</h1>
    <p class="error__links type-semi-mono-small">
      <a class="error__link" href="/">[←] Home</a>
    </p>
  </div>
</main>

<style>
  .error {
    padding-top: var(--space-9);
  }

  .error__body {
    grid-column: 1 / -1;
  }

  .error__code {
    color: var(--color-text-muted);
    margin-bottom: var(--space-2);
  }

  .error__links {
    margin-top: var(--space-5);
  }

  .error__link {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
  }

  @media (min-width: 1024px) {
    .error__body {
      grid-column: 1 / span 5;
    }
  }
</style>
