<script>
  import { goto } from '$app/navigation';
  import { ui } from '$lib/state/ui.svelte.js';
  import { FIND_PROMPT } from '$lib/site.js';
  import { loadIndex, search, middleTruncate } from '$lib/find.js';

  /**
   * Find. A shell prompt, not a search box: the field is prefixed with
   * `richardyliu/` and the caret is a block, so typing reads as completing a
   * path rather than filling in a form. That framing is the whole reason the
   * results show paths on the right instead of snippets.
   */

  let query = $state('');
  let selected = $state(0);
  let entries = $state(/** @type {import('$lib/find.js').Entry[]} */ ([]));
  let showShortcuts = $state(false);
  let inputEl = /** @type {HTMLInputElement | undefined} */ ($state());

  let results = $derived(search(entries, query));

  // Index is fetched lazily on first open — it is dead weight for a visitor who
  // never presses F, and it is ~100KB of book titles.
  $effect(() => {
    if (ui.findOpen && entries.length === 0) loadIndex().then((e) => (entries = e));
  });

  $effect(() => {
    if (ui.findOpen) {
      inputEl?.focus();
    } else {
      query = '';
      selected = 0;
      showShortcuts = false;
    }
  });

  // Clamp rather than reset: retyping a character should not throw the user
  // back to the first row if their selection is still in range.
  $effect(() => {
    if (selected >= results.length) selected = Math.max(0, results.length - 1);
  });

  function visit(/** @type {number} */ i) {
    const hit = results[i];
    if (!hit) return;
    ui.closeFind();
    goto(hit.path);
  }

  function onKeydown(/** @type {KeyboardEvent} */ e) {
    if (!ui.findOpen) return;
    if (e.key === 'Escape') {
      if (showShortcuts) showShortcuts = false;
      else ui.closeFind();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length) selected = (selected + 1) % results.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length) selected = (selected - 1 + results.length) % results.length;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      visit(selected);
    } else if (e.key === '?' && query === '') {
      e.preventDefault();
      showShortcuts = !showShortcuts;
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if ui.findOpen}
  <!-- The backdrop closes on click; the card stops propagation so clicks inside
       it never reach here. No separate hit-testing needed. -->
  <div
    class="overlay"
    role="presentation"
    onclick={() => ui.closeFind()}
    onkeydown={() => {}}
  >
    <div class="overlay__anchor">
      <div
        class="overlay__card"
        class:overlay__card--has-results={results.length > 0}
        role="dialog"
        aria-modal="true"
        aria-label="Find"
        tabindex="-1"
        onclick={(e) => e.stopPropagation()}
        onkeydown={() => {}}
      >
        <div class="overlay__input-row type-semi-mono-default">
          <!-- Prefix and input share one flex box with no gap, so the typed text
               continues the path instead of sitting a word away from it. The
               row's own gap is for the ✕ only. -->
          <div class="overlay__input field">
            <span class="field__prefix" aria-hidden="true">{FIND_PROMPT}/</span>
            <!-- svelte-ignore a11y_autofocus -->
            <input
              bind:this={inputEl}
              bind:value={query}
              class="field__input"
              type="text"
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
              aria-label="Find on this site"
              autofocus
            />
          </div>
          <button
            class="overlay__x"
            type="button"
            aria-label="Close find"
            onclick={() => ui.closeFind()}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1" />
            </svg>
          </button>
        </div>

        {#if results.length}
          <ul class="overlay__list type-semi-mono-default">
            <!--
              Keyed on title *and* path, not path alone. Two index entries can
              legitimately share a URL — the homepage is both `Richard Liu` and
              `About` while the prose lives at `/` — and a duplicate key does
              not merely warn: Svelte stops being able to map a row's index to
              its DOM node, so `--selected` lands on the wrong row and two rows
              light up at once. In dev it throws `each_key_duplicate` and the
              list renders nothing at all.

              The index dedupes paths at build time now, so this should never
              fire. It stays composite anyway: the results list must not be one
              bad index away from corrupting itself.
            -->
            {#each results as hit, i (`${hit.path}\u0000${hit.title}`)}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <li
                class="overlay__item"
                class:overlay__item--selected={i === selected}
                role="option"
                aria-selected={i === selected}
                tabindex="-1"
                onmouseenter={() => (selected = i)}
                onclick={() => visit(i)}
              >
                <span class="overlay__item-title">{hit.title}</span>
                <span class="overlay__item-path">{middleTruncate(hit.path)}</span>
              </li>
            {/each}
          </ul>
        {/if}

        <div class="overlay__footer type-semi-mono-default">
          <span class="overlay__footer-left">
            <span class="overlay__footer-group">[↓] [↑]</span>
            <button
              class="overlay__footer-group overlay__footer-btn"
              type="button"
              onclick={() => (showShortcuts = !showShortcuts)}>[?] Shortcuts</button
            >
          </span>
          <span class="overlay__footer-group">[enter] to visit</span>
        </div>
      </div>
    </div>

    <button
      class="btn btn--medium overlay__close-btn"
      type="button"
      onclick={() => ui.closeFind()}>Close [esc]</button
    >
  </div>

  {#if showShortcuts}
    <div class="shortcuts type-semi-mono-default" role="dialog" aria-label="Keyboard shortcuts">
      <div class="shortcuts__stage">
        <div class="shortcuts__group">
          <p class="shortcuts__label">Anywhere</p>
          <p class="shortcuts__row"><span class="shortcuts__key">[F]</span>Find</p>
          <p class="shortcuts__row"><span class="shortcuts__key">[M]</span>Menu</p>
          <p class="shortcuts__row"><span class="shortcuts__key">[?]</span>This list</p>
          <p class="shortcuts__row"><span class="shortcuts__key">[esc]</span>Close</p>
        </div>
        <div class="shortcuts__group">
          <p class="shortcuts__label">In Find</p>
          <p class="shortcuts__row"><span class="shortcuts__key">[↓][↑]</span>Move</p>
          <p class="shortcuts__row"><span class="shortcuts__key">[enter]</span>Visit</p>
        </div>
        <div class="shortcuts__group">
          <p class="shortcuts__label">On a page</p>
          <p class="shortcuts__row"><span class="shortcuts__key">[1-9]</span>Jump to section</p>
          <p class="shortcuts__row"><span class="shortcuts__key">[S]</span>Share</p>
        </div>
        <div class="shortcuts__group">
          <p class="shortcuts__label">On the landing page</p>
          <p class="shortcuts__row"><span class="shortcuts__key">[1-5]</span>Switch visual</p>
        </div>
      </div>
      <button
        class="btn btn--medium shortcuts__close"
        type="button"
        onclick={() => (showShortcuts = false)}>Close [esc]</button
      >
    </div>
  {/if}
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: calc(var(--z-index-modal) + 30);
    background: var(--color-surface-overlay);
    backdrop-filter: blur(var(--blur-min));
    -webkit-backdrop-filter: blur(var(--blur-min));
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .overlay__anchor {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 0;
  }

  /* Square corners on purpose. Everything transient in this system is a rounded
     pill; the card is the one surface that behaves like a window. */
  .overlay__card {
    background: var(--color-surface-default);
    box-sizing: border-box;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    padding: 0;
    border-radius: 0;
  }

  .overlay__card--has-results {
    padding-bottom: 12px;
  }

  .overlay__input-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    min-height: 56px;
    box-sizing: border-box;
  }

  .overlay__input {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 0;
  }

  .field__prefix {
    white-space: pre;
    pointer-events: none;
    font-size: 16px;
  }

  .field__input {
    flex: 1 1 0;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--color-text-default);
    caret-color: var(--color-text-default);
    /* Progressive: browsers without it just show a bar caret. */
    caret-shape: block;
    padding: 0;
    margin: 0;
    appearance: none;
    font: inherit;
    font-size: 16px;
    letter-spacing: inherit;
  }

  .field__input::selection {
    background: var(--color-text-default);
    color: var(--color-surface-default);
  }

  @media (min-width: 1024px) {
    .field__prefix,
    .field__input {
      font-size: var(--type-semi-mono-default-size);
    }
  }

  .overlay__x {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    border-radius: 4px;
    transition: color 0.15s ease;
  }

  .overlay__x:hover {
    color: var(--color-text-default);
  }

  .overlay__list {
    list-style: none;
    margin: 8px 0 0;
    padding: 0 8px;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .overlay__item {
    display: flex;
    align-items: center;
    gap: 16px;
    height: 32px;
    padding: 0 8px;
    box-sizing: border-box;
    cursor: pointer;
    min-width: 0;
    overflow: hidden;
  }

  .overlay__item--selected {
    background: var(--color-surface-subtle);
  }

  .overlay__item-title {
    flex: 1 1 0;
    min-width: 0;
    color: var(--color-text-default);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .overlay__item-path {
    flex: 0 1 auto;
    max-width: 60%;
    min-width: 0;
    margin-left: auto;
    color: var(--color-text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: right;
  }

  .overlay__footer {
    display: none;
    justify-content: space-between;
    align-items: center;
    margin-top: 36px;
    padding: 0 16px 12px;
    color: var(--color-text-muted);
  }

  .overlay__footer-left {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
  }

  .overlay__footer-group {
    display: inline-flex;
    align-items: center;
    color: var(--color-text-muted);
  }

  .overlay__footer-btn {
    border: 0;
    background: none;
    padding: 0;
    font: inherit;
    letter-spacing: inherit;
    cursor: pointer;
  }

  .overlay__footer-btn:hover {
    color: var(--color-text-default);
  }

  .overlay__close-btn {
    display: none;
    position: fixed;
    bottom: var(--grid-margin);
    left: 50%;
    transform: translateX(-50%);
    padding: 0 var(--btn-padding-lg);
    font-size: var(--type-mono-button-size);
    line-height: 1.25;
  }

  /* Mobile keeps the card full-bleed at the top of the screen, where the
     keyboard leaves room. Desktop floats it a third of the way down and
     constrains it to four of twelve columns. */
  @media (min-width: 1024px) {
    .overlay__anchor {
      max-width: var(--grid-max-width);
      padding-inline: var(--grid-margin);
      align-items: center;
      margin-top: 33vh;
    }

    .overlay__card {
      width: 624px;
      max-width: 100%;
    }

    .overlay__footer {
      display: flex;
    }

    .overlay__close-btn {
      display: inline-flex;
    }
  }

  /* ------------------------------------------------------------- shortcuts */
  /* Annotates the chrome in place rather than listing keys in a table: each
     group sits near the control it describes once there is room for it. */
  .shortcuts {
    position: fixed;
    inset: 0;
    z-index: calc(var(--z-index-modal) + 40);
    background: var(--color-surface-default);
    color: var(--color-text-default);
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .shortcuts__stage {
    position: relative;
    min-height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: calc(var(--header-height) + var(--space-6)) var(--grid-margin)
      calc(var(--btn-height) + var(--grid-margin) + var(--space-4));
  }

  .shortcuts__label {
    margin: 0 0 4px;
    color: var(--color-text-muted);
    font: inherit;
    letter-spacing: inherit;
  }

  .shortcuts__row {
    margin: 0;
    font: inherit;
    letter-spacing: inherit;
  }

  /* Fixed-width key column so the labels form a straight edge without a table. */
  .shortcuts__key {
    display: inline-block;
    width: calc(var(--nav-marker-width) * 2);
  }

  .shortcuts__close {
    position: fixed;
    bottom: var(--grid-margin);
    left: 50%;
    transform: translateX(-50%);
  }

  @media (min-width: 1024px) {
    .shortcuts__stage {
      max-width: var(--grid-max-width);
      margin-inline: auto;
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      align-content: center;
      gap: var(--grid-gutter);
      padding-block: calc(var(--header-height) + var(--space-6));
    }
  }
</style>
