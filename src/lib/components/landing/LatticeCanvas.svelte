<script>
  /**
   * The landing visual: five generative scenes, one canvas, hairline black on
   * paper white.
   *
   * The reference ships a WebGL custom element here. This is deliberately not
   * that — it is 2D canvas, because every scene below is line work at 1px and
   * WebGL would buy nothing but a shader pipeline to maintain. What it does keep
   * is the reference's actual constraint: no fills, no colour, no easing that
   * draws attention to itself. The drawing should look like something being
   * measured rather than something being animated.
   *
   * Geometry is seeded (`lcg`) rather than `Math.random`, so a scene looks the
   * same on every load and on every machine. Only the phase advances with time.
   *
   * @type {{ mode: number, running?: boolean }}
   */
  let { mode = 0, running = true } = $props();

  const MODE_COUNT = 5;

  let canvas = /** @type {HTMLCanvasElement | undefined} */ ($state());
  let reduced = $state(false);

  /**
   * Every scene has the same shape: draw one frame of itself into `ctx` at time
   * `t`, for a canvas of `w` x `h` CSS pixels. No scene reads any other state.
   *
   * @typedef {(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void} Scene
   */

  /** Deterministic PRNG. Same seed, same scene, forever.
   * @param {number} seed */
  function lcg(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  /* ------------------------------------------------------------------ scenes */

  /**
   * Scene [1] keeps state between frames: the occupancy map *accumulates* as the
   * sweep goes round, and clears when it laps. That is the whole point of the
   * scene — a map being built, not a fan being spun — and it cannot be expressed
   * by a function that only knows the current instant.
   */
  const occ = { key: '', rev: -1, cells: new Set(), walls: /** @type {number[][]} */ ([]) };

  /**
   * An irregular closed room plus a few interior obstacles.
   * @param {number} w @param {number} h @param {number} ox @param {number} oy
   * @returns {number[][]} segments as [x1, y1, x2, y2]
   */
  function buildRoom(w, h, ox, oy) {
    const rnd = lcg(0x51a3);
    /** @type {number[][]} */
    const walls = [];
    const verts = [];
    const n = 15;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      // Per-vertex jitter is what makes the finished map read as a *place*
      // rather than as a circle the algorithm happened to trace.
      const j = 0.72 + rnd() * 0.5;
      verts.push([ox + Math.cos(a) * w * 0.33 * j, oy + Math.sin(a) * h * 0.4 * j]);
    }
    for (let i = 0; i < n; i++) {
      const a = verts[i];
      const b = verts[(i + 1) % n];
      walls.push([a[0], a[1], b[0], b[1]]);
    }
    for (let i = 0; i < 6; i++) {
      const a = rnd() * Math.PI * 2;
      const r = Math.min(w, h) * (0.1 + rnd() * 0.16);
      const len = Math.min(w, h) * (0.06 + rnd() * 0.12);
      const th = rnd() * Math.PI;
      const cx = ox + Math.cos(a) * r * 1.4;
      const cy = oy + Math.sin(a) * r;
      walls.push([
        cx - (Math.cos(th) * len) / 2,
        cy - (Math.sin(th) * len) / 2,
        cx + (Math.cos(th) * len) / 2,
        cy + (Math.sin(th) * len) / 2
      ]);
    }
    return walls;
  }

  /**
   * [1] Occupancy lattice — a sensor sweeping a room, and the grid cells its
   * returns land in. The rays are continuous and the map is not, and everything
   * difficult about spatial perception lives in that gap.
   *
   * @type {Scene}
   */
  function occupancy(ctx, w, h, t) {
    const cell = 24;
    const cols = Math.ceil(w / cell) + 2;
    const ox = w * 0.5;
    const oy = h * 0.5;

    const key = `${Math.round(w)}x${Math.round(h)}`;
    if (occ.key !== key) {
      occ.key = key;
      occ.walls = buildRoom(w, h, ox, oy);
      occ.cells.clear();
      occ.rev = -1;
    }

    // The map is never cleared. There is one seeded room, so wiping it on each
    // lap would only re-reveal the same outline — and a converged map that the
    // beam keeps sweeping is what the real thing does anyway.
    const PERIOD = 16;
    const sweep = Math.min(t / PERIOD, 1);
    const beam = ((t / PERIOD) % 1) * Math.PI * 2;

    const rays = 260;
    const upto = Math.floor(sweep * rays);
    const far = Math.hypot(w, h);

    ctx.lineWidth = 1;

    // Every ray behind the head is re-cast each frame. Idempotent, and cheaper
    // than the bookkeeping needed to cast each one only once.
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.beginPath();
    for (let i = 0; i <= upto; i++) {
      const a = (i / rays) * Math.PI * 2;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      let best = far;
      for (const [x1, y1, x2, y2] of occ.walls) {
        const d = raySegment(ox, oy, dx, dy, x1, y1, x2, y2);
        if (d > 0 && d < best) best = d;
      }
      const hx = ox + dx * best;
      const hy = oy + dy * best;
      ctx.moveTo(ox, oy);
      ctx.lineTo(hx, hy);
      if (best < far) {
        occ.cells.add(Math.floor(hy / cell) * cols + Math.floor(hx / cell));
      }
    }
    ctx.stroke();

    // The bright beam keeps circling after the map has converged, so the scene
    // stays alive without the map having to keep changing.
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    for (let k = 0; k < 14; k++) {
      const a = beam - k * 0.012;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      let best = far;
      for (const [x1, y1, x2, y2] of occ.walls) {
        const d = raySegment(ox, oy, dx, dy, x1, y1, x2, y2);
        if (d > 0 && d < best) best = d;
      }
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + dx * best, oy + dy * best);
      occ.cells.add(Math.floor((oy + dy * best) / cell) * cols + Math.floor((ox + dx * best) / cell));
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.beginPath();
    for (const k of occ.cells) {
      const cx = k % cols;
      const cy = Math.floor(k / cols);
      ctx.rect(cx * cell + 0.5, cy * cell + 0.5, cell - 1, cell - 1);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0,0,0,0.9)';
    ctx.beginPath();
    ctx.arc(ox, oy, 3.5, 0, Math.PI * 2);
    ctx.moveTo(ox - 8, oy);
    ctx.lineTo(ox + 8, oy);
    ctx.moveTo(ox, oy - 8);
    ctx.lineTo(ox, oy + 8);
    ctx.stroke();
  }

  /**
   * Distance along a ray to a segment, or -1 when it misses.
   * @param {number} px @param {number} py @param {number} dx @param {number} dy
   * @param {number} x1 @param {number} y1 @param {number} x2 @param {number} y2
   * @returns {number}
   */
  function raySegment(px, py, dx, dy, x1, y1, x2, y2) {
    const sx = x2 - x1;
    const sy = y2 - y1;
    const den = dx * sy - dy * sx;
    if (Math.abs(den) < 1e-9) return -1;
    const t1 = ((x1 - px) * sy - (y1 - py) * sx) / den;
    const t2 = ((x1 - px) * dy - (y1 - py) * dx) / den;
    return t1 > 0 && t2 >= 0 && t2 <= 1 ? t1 : -1;
  }

  /**
   * [2] Systolic array — a tensor core as it actually behaves: operands march in
   * from two edges and partial sums fall out of the third, one diagonal
   * wavefront at a time. The wave is the computation.
   *
   * @type {Scene}
   */
  function systolic(ctx, w, h, t) {
    const n = 14;
    const pad = Math.min(w, h) * 0.06;
    const size = Math.min(w - pad * 2, h - pad * 2);
    const step = size / n;
    const x0 = (w - size) / 2;
    const y0 = (h - size) / 2;

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.16)';
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      ctx.moveTo(x0 + i * step, y0);
      ctx.lineTo(x0 + i * step, y0 + size);
      ctx.moveTo(x0, y0 + i * step);
      ctx.lineTo(x0 + size, y0 + i * step);
    }
    ctx.stroke();

    // Two wavefronts, offset, so the array never reads as fully idle.
    const heads = [(t * 2.1) % (n * 2), (t * 2.1 + n) % (n * 2)];
    ctx.strokeStyle = 'rgba(0,0,0,0.9)';
    for (const head of heads) {
      ctx.beginPath();
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          const d = r + c;
          const age = head - d;
          if (age < 0 || age > 1.6) continue;
          const k = 1 - age / 1.6;
          const cx = x0 + (c + 0.5) * step;
          const cy = y0 + (r + 0.5) * step;
          const s = step * 0.3 * k;
          ctx.moveTo(cx - s, cy);
          ctx.lineTo(cx + s, cy);
          ctx.moveTo(cx, cy - s);
          ctx.lineTo(cx, cy + s);
        }
      }
      ctx.stroke();
    }

    // Operand feeds along the top and left edges.
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const phase = (t * 2.1 - i) % 6;
      if (phase < 0 || phase > 1) continue;
      const off = (1 - phase) * step * 2.2;
      ctx.moveTo(x0 + (i + 0.5) * step, y0 - off);
      ctx.lineTo(x0 + (i + 0.5) * step, y0 - off + step * 0.4);
      ctx.moveTo(x0 - off, y0 + (i + 0.5) * step);
      ctx.lineTo(x0 - off + step * 0.4, y0 + (i + 0.5) * step);
    }
    ctx.stroke();
  }

  /**
   * [3] Dispersion — a hundred swings at the same target. Individually the arcs
   * look like intent; collectively they are a distribution, and the ellipse is
   * the only honest summary of them.
   *
   * @type {Scene}
   */
  function dispersion(ctx, w, h, t) {
    const rnd = lcg(0x9e37);
    const tee = [w * 0.14, h * 0.82];
    const aim = [w * 0.8, h * 0.3];
    const shots = 120;

    ctx.lineWidth = 1;
    const landings = [];
    for (let i = 0; i < shots; i++) {
      // Box–Muller: the scatter has to be genuinely gaussian or the ellipse
      // below is a lie about it.
      const u1 = Math.max(rnd(), 1e-6);
      const u2 = rnd();
      const mag = Math.sqrt(-2 * Math.log(u1));
      const gx = mag * Math.cos(2 * Math.PI * u2);
      const gy = mag * Math.sin(2 * Math.PI * u2);
      const sx = w * 0.055;
      const sy = h * 0.045;
      landings.push([aim[0] + gx * sx, aim[1] + gy * sy]);
    }

    // Arcs fade in on a rolling cycle rather than all at once.
    const cycle = 9;
    const head = (t / cycle) % 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.16)';
    ctx.beginPath();
    for (let i = 0; i < shots; i++) {
      const frac = i / shots;
      const behind = (head - frac + 1) % 1;
      if (behind > 0.5) continue;
      const [lx, ly] = landings[i];
      const apex = Math.min(tee[1], ly) - h * (0.28 + (i % 7) * 0.012);
      ctx.moveTo(tee[0], tee[1]);
      ctx.quadraticCurveTo((tee[0] + lx) / 2, apex, lx, ly);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.beginPath();
    for (const [lx, ly] of landings) {
      ctx.moveTo(lx - 1.6, ly);
      ctx.lineTo(lx + 1.6, ly);
      ctx.moveTo(lx, ly - 1.6);
      ctx.lineTo(lx, ly + 1.6);
    }
    ctx.stroke();

    // 1σ and 2σ contours, breathing very slightly so the frame is never static.
    const pulse = 1 + Math.sin(t * 0.5) * 0.012;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    for (const k of [1, 2]) {
      ctx.beginPath();
      ctx.ellipse(aim[0], aim[1], w * 0.055 * k * pulse, h * 0.045 * k * pulse, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.moveTo(tee[0], tee[1]);
    ctx.lineTo(aim[0], aim[1]);
    ctx.stroke();
  }

  /**
   * [4] Shelf — the reading list as a graph. Nodes are books, clusters are
   * subjects, edges are shared subject. It drifts on slow orbits, which is the
   * only scene here that is purely ornamental, and it earns it by being the one
   * that maps to something countable.
   *
   * @type {Scene}
   */
  function shelf(ctx, w, h, t) {
    const rnd = lcg(0x2b71);
    const clusters = 8;
    const perCluster = 20;
    const centres = [];
    for (let c = 0; c < clusters; c++) {
      const a = (c / clusters) * Math.PI * 2 + 0.3;
      const r = Math.min(w, h) * 0.24;
      centres.push([w / 2 + Math.cos(a) * r * 1.6, h / 2 + Math.sin(a) * r]);
    }

    /** @type {[number, number, number][]} */
    const nodes = [];
    for (let c = 0; c < clusters; c++) {
      for (let i = 0; i < perCluster; i++) {
        const a = rnd() * Math.PI * 2;
        const r = Math.pow(rnd(), 0.6) * Math.min(w, h) * 0.11;
        const orbit = t * (0.05 + (c % 3) * 0.02) + a;
        nodes.push([
          centres[c][0] + Math.cos(orbit) * r,
          centres[c][1] + Math.sin(orbit) * r * 0.8,
          c
        ]);
      }
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.14)';
    ctx.beginPath();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i][2] !== nodes[j][2]) continue;
        const dx = nodes[i][0] - nodes[j][0];
        const dy = nodes[i][1] - nodes[j][1];
        if (dx * dx + dy * dy > 3400) continue;
        ctx.moveTo(nodes[i][0], nodes[i][1]);
        ctx.lineTo(nodes[j][0], nodes[j][1]);
      }
    }
    ctx.stroke();

    // A handful of cross-cluster edges. Subjects genuinely overlap — a book on
    // Chinese industrial policy belongs to three of these clusters — and without
    // them the ring reads as eight unrelated clouds around an empty middle.
    ctx.strokeStyle = 'rgba(0,0,0,0.07)';
    ctx.beginPath();
    const bridge = lcg(0x4d2);
    for (let k = 0; k < 26; k++) {
      const a = nodes[Math.floor(bridge() * nodes.length)];
      const b = nodes[Math.floor(bridge() * nodes.length)];
      if (!a || !b || a[2] === b[2]) continue;
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.beginPath();
    for (const [x, y] of nodes) {
      ctx.moveTo(x + 1.7, y);
      ctx.arc(x, y, 1.7, 0, Math.PI * 2);
    }
    ctx.stroke();
  }

  /**
   * [5] Task DAG — an agent working a skilled-work pipeline. One token walks a
   * path; some steps fail and get retried, which is drawn as a back-edge. The
   * retries are the honest part: the interesting failure mode of these systems
   * is not reasoning, it is that a step cannot verify its own output.
   *
   * @type {Scene}
   */
  function dag(ctx, w, h, t) {
    const rnd = lcg(0x77c1);
    const layers = 6;
    const marginX = w * 0.16;
    const marginY = h * 0.2;
    const spanX = w - marginX * 2;
    const spanY = h - marginY * 2;

    /** @type {[number, number][][]} */
    const cols = [];
    for (let l = 0; l < layers; l++) {
      const count = l === 0 || l === layers - 1 ? 1 : 2 + Math.floor(rnd() * 3);
      /** @type {[number, number][]} */
      const col = [];
      for (let i = 0; i < count; i++) {
        const y = count === 1 ? marginY + spanY / 2 : marginY + (spanY * (i + 0.5)) / count;
        col.push([marginX + (spanX * l) / (layers - 1), y]);
      }
      cols.push(col);
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    for (let l = 0; l < layers - 1; l++) {
      for (const a of cols[l]) {
        for (const b of cols[l + 1]) {
          ctx.moveTo(a[0], a[1]);
          // Cubic with horizontal handles: reads as a routed wire, not a chord.
          const mid = (a[0] + b[0]) / 2;
          ctx.bezierCurveTo(mid, a[1], mid, b[1], b[0], b[1]);
        }
      }
    }
    ctx.stroke();

    // Nodes.
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.beginPath();
    for (const col of cols) {
      for (const [x, y] of col) {
        ctx.rect(x - 4.5, y - 4.5, 9, 9);
      }
    }
    ctx.stroke();

    // The token. A fixed route, chosen once from the seed, walked on a loop —
    // with one layer that always bounces back before it succeeds.
    const route = cols.map((col, l) => col[Math.floor(lcg(0x31 + l)() * col.length)]);
    const retryAt = 3;
    const legs = layers - 1 + 2; // two extra legs for the retry round trip
    const p = (t * 0.55) % legs;
    const leg = Math.floor(p);
    const f = p - leg;
    const ease = f * f * (3 - 2 * f);

    let from, to;
    if (leg < retryAt) {
      from = route[leg];
      to = route[leg + 1];
    } else if (leg === retryAt) {
      from = route[retryAt];
      to = route[retryAt - 1];
    } else if (leg === retryAt + 1) {
      from = route[retryAt - 1];
      to = route[retryAt];
    } else {
      from = route[leg - 2];
      to = route[leg - 1];
    }

    if (from && to) {
      const mid = (from[0] + to[0]) / 2;
      const [tx, ty] = cubicAt(from, [mid, from[1]], [mid, to[1]], to, ease);
      ctx.strokeStyle = 'rgba(0,0,0,0.95)';
      ctx.beginPath();
      ctx.arc(tx, ty, 4.5, 0, Math.PI * 2);
      ctx.stroke();

      // The back-edge is drawn only while it is being travelled, so a retry is
      // an event rather than a permanent feature of the diagram.
      if (leg === retryAt) {
        ctx.strokeStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        ctx.moveTo(route[retryAt][0], route[retryAt][1] - 12);
        ctx.bezierCurveTo(
          route[retryAt][0],
          route[retryAt][1] - 40,
          route[retryAt - 1][0],
          route[retryAt - 1][1] - 40,
          route[retryAt - 1][0],
          route[retryAt - 1][1] - 12
        );
        ctx.stroke();
      }
    }
  }

  /**
   * Point on a cubic Bezier at parameter `s`.
   * @param {number[]} p0 @param {number[]} p1 @param {number[]} p2 @param {number[]} p3
   * @param {number} s
   * @returns {number[]} [x, y]
   */
  function cubicAt(p0, p1, p2, p3, s) {
    const u = 1 - s;
    const a = u * u * u;
    const b = 3 * u * u * s;
    const c = 3 * u * s * s;
    const d = s * s * s;
    return [
      a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
      a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]
    ];
  }

  /** @type {Scene[]} */
  const SCENES = [occupancy, systolic, dispersion, shelf, dag];

  /* ------------------------------------------------------------------- loop */

  $effect(() => {
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;
    // Re-bound as consts so the closures below (resize, frame) see non-nullable
    // types: narrowing from the guards above does not survive into a callback.
    /** @type {HTMLCanvasElement} */
    const el = canvas;
    /** @type {CanvasRenderingContext2D} */
    const ctx = ctx2d;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced = motion.matches;
    const onMotion = () => (reduced = motion.matches);
    motion.addEventListener('change', onMotion);

    let raf = 0;
    let w = 0;
    let h = 0;

    function resize() {
      const rect = el.getBoundingClientRect();
      // Cap DPR at 2: past that the line work is identical and the fill rate is
      // not, and this canvas is full-viewport.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const start = performance.now();
    let frozen = /** @type {number | null} */ (null);

    /** @param {number} now */
    function frame(now) {
      // Reduced motion still gets the drawing, just held at a fixed phase — the
      // scene is information, the movement is not.
      const t = reduced ? (frozen ??= 6.5) : (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      SCENES[((mode % MODE_COUNT) + MODE_COUNT) % MODE_COUNT](ctx, w, h, t);
      if (!reduced && running) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    // A full-viewport rAF loop in a background tab is pure waste.
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (running && !reduced) raf = requestAnimationFrame(frame);
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      motion.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  });
</script>

<canvas bind:this={canvas} class="lattice" aria-hidden="true"></canvas>

<style>
  .lattice {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
