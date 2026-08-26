/**
 * Decides whether the mobile header should be showing.
 *
 * Pulled out of the component as a pure function because it is the one piece of
 * chrome logic with real state — a direction, a threshold, and a rest position —
 * and it is not testable inside a scroll listener.
 *
 * Rules, in order:
 *   near the top      -> always showing (there is nothing to reclaim yet)
 *   moving down, past
 *   the header height  -> hide it
 *   moving up          -> show it
 *   no movement        -> unchanged
 *
 * @param {{ y: number, lastY: number, pinned: boolean, headerHeight?: number }} s
 * @returns {{ pinned: boolean, lastY: number }}
 */
export function nextPinState({ y, lastY, pinned, headerHeight = 68 }) {
  const delta = y - lastY;

  // A zero-delta event carries no direction, so it must not be read as either.
  // Treating it as "up" (which `y > lastY` being false does) let any stray or
  // duplicate scroll event re-show a header the reader had scrolled away.
  if (Math.abs(delta) < 1) return { pinned, lastY };

  if (y < 8) return { pinned: true, lastY: y };
  if (delta > 0 && y > headerHeight) return { pinned: false, lastY: y };
  if (delta < 0) return { pinned: true, lastY: y };
  return { pinned, lastY: y };
}
