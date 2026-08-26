<script>
  /**
   * `List/Grid`. Rendered as one line of text with a slash, not two buttons or
   * a segmented control: at 10px mono, chrome around the words would outweigh
   * them. The inactive half is the link; the active half is plain text, which
   * is the whole state indicator.
   *
   * @type {{ value: 'list' | 'grid', onchange: (v: 'list' | 'grid') => void }}
   */
  let { value, onchange } = $props();
</script>

<div class="toggle type-mono-navigation">
  <button
    class="toggle__half"
    class:toggle__half--active={value === 'list'}
    type="button"
    aria-pressed={value === 'list'}
    onclick={() => onchange('list')}>List</button
  ><span class="toggle__sep" aria-hidden="true">/</span><button
    class="toggle__half"
    class:toggle__half--active={value === 'grid'}
    type="button"
    aria-pressed={value === 'grid'}
    onclick={() => onchange('grid')}>Grid</button
  >
</div>

<style>
  .toggle {
    display: inline-flex;
    align-items: baseline;
  }

  .toggle__half {
    border: 0;
    background: none;
    padding: 0;
    margin: 0;
    font: inherit;
    letter-spacing: inherit;
    color: inherit;
    cursor: pointer;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
  }

  /* The active half loses its underline — it is where you already are, so there
     is nothing to travel to. */
  .toggle__half--active {
    text-decoration: none;
    cursor: default;
  }

  .toggle__half:not(.toggle__half--active):hover {
    color: var(--color-text-muted);
  }

  .toggle__sep {
    padding: 0 0.15em;
  }
</style>
