/**
 * Scroll-in reveal, as an action rather than a wrapper component.
 *
 * A wrapper would have been wrong twice over: an element with
 * `display: contents` generates no box, so `opacity` and `transform` on it do
 * nothing at all; and giving it a box instead would make *it* the grid item,
 * stealing the column placement from the child it wraps. Applying the effect to
 * the real element sidesteps both.
 *
 * The hidden state is set in markup (`data-reveal=""`), not here, so the element
 * is already invisible at first paint and never flashes in before fading in.
 * With scripting off the attribute stays as-is and base.css's `html:not(.js)`
 * rule keeps it fully visible.
 *
 * @type {import('svelte/action').Action<HTMLElement, { delay?: number } | undefined>}
 */
export function reveal(node, params) {
  const delay = params?.delay ?? 0;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    node.dataset.reveal = 'shown';
    return {};
  }

  const io = new IntersectionObserver(
    (records) => {
      for (const r of records) {
        if (!r.isIntersecting) continue;
        const el = /** @type {HTMLElement} */ (r.target);
        if (delay) setTimeout(() => (el.dataset.reveal = 'shown'), delay);
        else el.dataset.reveal = 'shown';
        io.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }
  );
  io.observe(node);

  return { destroy: () => io.disconnect() };
}
