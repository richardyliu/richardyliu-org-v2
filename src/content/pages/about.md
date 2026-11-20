<script module>
  /**
   * The rail down the right-hand side of the page, declared here rather than in
   * the route. Every section below is one entry, in order. Add a section to the
   * prose and add its row here — the two live in the same file precisely so
   * they cannot drift, which is what happened when the rail was in the route
   * and the copy was in three separate partials.
   *
   * `id` has to match the `id` on the RichTextModule it points at: that is what
   * `/#now` and `/#contact` resolve to.
   */
  export const SECTIONS = [
    { id: 'now', label: 'About' },
    { id: 'probing', label: 'Interests' }
  ];
</script>

<script>
  import RichTextModule from '$lib/components/RichTextModule.svelte';
</script>

<!--
  The whole About page, prose and structure, in one file.

  Each section is a RichTextModule, which is what puts the copy on the page grid
  at the narrow five-column measure. The blank lines around the opening and
  closing tags are load-bearing: mdsvex only parses the block between them as
  markdown if the tags are their own paragraphs. Delete a blank line and that
  section renders as literal asterisks and pipes.

  So: write plain markdown between the tags, and leave the tags alone.
-->

<RichTextModule id="now" half>

**About me and my past work:**

1. I study computer science and statistics at [UC Berkeley](https://www.berkeley.edu/). At [Berkeley Artificial Intelligence Research](https://bair.berkeley.edu/), I work on agents that can do skilled work (legal, finance, permitting, CAD), faster on-device compute and inference, and spatial perception for robots.
2. I help start and invest in robotics, deep tech, infrastructure, and application companies at [Niche Venture Partners](https://www.nichevp.com/), a multimillion-dollar firm that invests in high-slope people. Before that I was an investor at [Llama Ventures](https://www.llamaventures.vc/).
3. I used to build industrial robots and Mars rover bots, and I trained financial and VLA models. Our robotics team was lucky to be backed by [Luminous Ventures](https://www.luminousvc.com/), formerly [Lightspeed China Partners](https://lsvp.com/).
4. I play competitive golf and like coding, venture capital, and starting companies. I've competed in the Informatics, Linguistics, and Artificial Intelligence Olympiads at the state, national, and international levels.
5. I [read](/reading) a lot of history, politics, economics, philosophy, (auto)biography, business and investing, technology and engineering, and literature, especially about China and East Asia.

</RichTextModule>

<RichTextModule id="probing" half>

**What I'm digging into:**

1. **Robotics and the physical economy.** Between SLAM and today's robot foundation models, robots have mostly solved perception, locomotion, and planning. Reliable dexterous manipulation is still open, and real-world data holds it back more than algorithms do. I'm interested in the layers every robot company needs, like data infrastructure, evaluation, and robot operations. I also think robots should be judged on how reliably they work, which a demo rarely shows.
2. **Deep learning and AI compute.** I trace modern AI back to what limits it (data, compute, and energy) and to what turns those inputs into capability. Inference is now most of AI's compute, and the bottleneck has moved down the stack to memory, packaging, and interconnect. So I focus on what decides how much useful intelligence a dollar of hardware produces.
3. **Energy and industrial infrastructure.** Energy is the most basic constraint on economic growth. After two flat decades, electricity demand is rising again, and the grid, transformers, and field crews that connect and maintain it are a bigger bottleneck than generation technology. I'm studying how software and autonomy can rebuild and run that physical infrastructure.
4. **Finding incredible people and working with them.** Backing ambitious, capable people who push humanity forward is, to me, the highest form of altruism and aesthetics, and the best way to spend a life.

</RichTextModule>


<!--
<RichTextModule id="contact" half>

I'm on [X](https://x.com/richard_yliu), [GitHub](https://github.com/richardyliu), and [LinkedIn](https://www.linkedin.com/in/richard-yliu/).

</RichTextModule>
-->