<script>
  /**
   * The numbered section rail. Two details carry it:
   *
   * 1. The active row hides its own number, leaving `[ ]` — an empty slot where
   *    the digit was. Because the brackets stay put and the mono font is
   *    tabular, nothing shifts; the marker reads as "you are here" without
   *    adding a dot, arrow, or colour.
   * 2. The digits are live shortcuts. Pressing 1–9 jumps to that section, which
   *    is why they are numbers at all rather than bullets.
   *
   * @type {{ sections: { id: string, label: string }[] }}
   */
  let { sections } = $props();

  /**
   * Empty until the observer reports something. The *effective* active section
   * falls back to the first one, derived rather than seeded — seeding from
   * `sections` would capture only its initial value and go stale if the page
   * ever changed its section list.
   */
  let activeId = $state('');
  let active = $derived(activeId || sections[0]?.id || '');

  function jump(/** @type {string} */ id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Optimistic: the observer would get here eventually, but not until the
    // smooth scroll settles, and the rail should respond to the click at once.
    activeId = id;
  }

  function onKeydown(/** @type {KeyboardEvent} */ e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const target = /** @type {HTMLElement | null} */ (e.target);
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    const n = Number(e.key);
    if (!Number.isInteger(n) || n < 1 || n > sections.length) return;
    e.preventDefault();
    jump(sections[n - 1].id);
  }

  $effect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el) => el !== null);
    if (!els.length) return;

    // rootMargin pulls the trip line down to just under the header, so a
    // section becomes active when its heading reaches the top of the readable
    // area — not when it first peeks in from the bottom.
    const io = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((r) => r.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target?.id) activeId = visible[0].target.id;
      },
      { rootMargin: '-68px 0px -60% 0px', threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
</script>

<svelte:window onkeydown={onKeydown} />

<div class="page-sidebar">
  <ol class="page-sidebar__nav type-mono-navigation">
    {#each sections as section, i (section.id)}
      <li class="page-sidebar__item">
        <a
          class="page-sidebar__link"
          class:page-sidebar__link--active={active === section.id}
          href={`#${section.id}`}
          onclick={(e) => {
            e.preventDefault();
            jump(section.id);
          }}
        >
          <span class="page-sidebar__marker" aria-hidden="true"
            >[<span class="page-sidebar__number">{i + 1}</span>]</span
          >
          <span class="page-sidebar__label">{section.label}</span>
        </a>
      </li>
    {/each}
  </ol>
</div>

<style>
  /* Not sticky itself — ContentPage's rail owns that, so this nav and anything
     else in the rail (the List/Grid toggle) stay pinned as one block. */
  .page-sidebar {
    display: none;
  }

  .page-sidebar__nav {
    list-style: none;
    margin: 0;
    padding: 0;
    font-feature-settings: 'lnum', 'tnum';
  }

  .page-sidebar__item {
    margin: 0;
    font: inherit;
    letter-spacing: inherit;
  }

  .page-sidebar__link {
    display: flex;
    gap: 0;
    color: inherit;
    text-decoration: none;
  }

  .page-sidebar__marker {
    display: inline-block;
    width: var(--nav-marker-width);
    flex-shrink: 0;
  }

  /* `visibility` keeps the digit's advance width, so `[1]` and `[ ]` occupy the
     identical box and the labels never jog left or right. */
  .page-sidebar__link--active .page-sidebar__number {
    visibility: hidden;
  }

  .page-sidebar__link--active .page-sidebar__label,
  .page-sidebar__link:hover .page-sidebar__label,
  .page-sidebar__link:focus-visible .page-sidebar__label {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
  }

  .page-sidebar__link:focus-visible {
    outline: none;
  }

  @media (min-width: 600px) {
    .page-sidebar {
      display: block;
    }
  }
</style>
