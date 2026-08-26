<script>
  import LatticeCanvas from './LatticeCanvas.svelte';
  import VisualText from './VisualText.svelte';
  import { SITE_NAME, SITE_DESCRIPTION } from '$lib/site.js';

  /**
   * The five-scene landing drawing. Currently unmounted, not deleted: the
   * homepage renders the About prose instead. Flip `LANDING_ENABLED` in
   * $lib/site.js back to true and both the route and the layout's
   * full-viewport/no-footer treatment come back with it.
   *
   * Everything a reader or a crawler needs is in the `.sr-only` block: a real
   * h1, the one-line description, and the caption for whichever scene is
   * showing. The visible caption is hover-only and desktop-only, so it cannot
   * be the only copy on the page.
   */

  const SCENES = [
    {
      title: 'Occupancy lattice from a single\nsweeping range sensor',
      body: 'The rays are continuous; the map is not. Everything hard about spatial perception lives in that gap.'
    },
    {
      title: 'Systolic array resolving one\ndiagonal wavefront at a time',
      body: 'Operands march in from two edges, partial sums fall out of the third. The wave is the computation.'
    },
    {
      title: '120 swings at the same target,\nand the ellipse that summarises them',
      body: 'Individually the arcs look like intent. Collectively they are a distribution.'
    },
    {
      title: '272 books, clustered by subject',
      body: 'Politics, history, economics, philosophy, psychology, biography, natural science, engineering.'
    },
    {
      title: 'An agent working a skilled-work\npipeline, retries included',
      body: 'The interesting failure is not reasoning. It is that a step cannot verify its own output.'
    }
  ];

  let active = $state(0);

  /**
   * Auto-advance, restarted by the effect whenever `active` changes — so a
   * manual pick resets the dwell time instead of being cut short by a timer
   * that was already most of the way through.
   */
  $effect(() => {
    void active;
    const id = setTimeout(() => (active = (active + 1) % SCENES.length), 20000);
    return () => clearTimeout(id);
  });

  function onKeydown(/** @type {KeyboardEvent} */ e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const target = /** @type {HTMLElement | null} */ (e.target);
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    const n = Number(e.key);
    if (!Number.isInteger(n) || n < 1 || n > SCENES.length) return;
    e.preventDefault();
    active = n - 1;
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="landing-page">
  <div class="sr-only">
    <h1>{SITE_NAME}</h1>
    <p>{SITE_DESCRIPTION}</p>
    <p>{SCENES[active].title.replace(/\n/g, ' ')}. {SCENES[active].body}</p>
  </div>

  <div class="visual-wrapper">
    <LatticeCanvas mode={active} />
  </div>

  <VisualText
    title={SCENES[active].title}
    body={SCENES[active].body}
    count={SCENES.length}
    {active}
    onselect={(i) => (active = i)}
  />
</div>

<style>
  .landing-page {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
  }

  .visual-wrapper {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
</style>
