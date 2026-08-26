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

**Things, facts, and my past work:**

1. I'm studying computer science and statistics at [UC Berkeley](https://cdss.berkeley.edu/), and I invest in robotics, deep tech, infrastructure, and applications at [Llama Ventures](https://www.llamaventures.vc/).
2. I'm also researching how to make agents more capable at skilled work (legal, finance, permitting, CAD, etc.) and how to make robotics smarter at spatial perception at [Berkeley Artificial Intelligence Research](https://bair.berkeley.edu/).
3. Previously, I built industrial robots and Mars rover bots, and I trained financial and VLA models; our robotics team was fortunate to be backed by [Luminous Ventures](https://www.luminousvc.com/), formerly [Lightspeed China Partners](https://lsvp.com/).
4. I enjoy competitive golf, coding, venture capital, and entrepreneurship, and I have competed in the Informatics, Linguistics, and Artificial Intelligence Olympiads at the state, national, and international levels.
5. I [read](/reading) extensively in politics, history, economics, philosophy, psychology, (auto)biography, natural science, and engineering.

</RichTextModule>

<RichTextModule id="probing" half>

**I'm probing deeply into:**

1. **Beautiful engineering.** I want to build beautiful things — code, hardware, and firmware — that improve how people live and work.
2. **Education, cognition, and developmental trajectories.** I want to understand how early exposure to thoughtful conversation and scientific knowledge shapes a person's long-term success — or, put more directly: what patterns recur among world-historical figures?
3. **Learning from great texts and people.** I enjoy reading history and (auto)biography, and talking with fund managers across venture capital, private equity, and hedge funds about how they see society, economics, humanity, and politics.
4. **Identifying incredible people and working with them.** Supporting ambitious, capable people who push humanity forward is, to me, the highest form of altruism, aesthetics, and life well spent.

</RichTextModule>


<!--
<RichTextModule id="contact" half>

I'm on [X](https://x.com/richard_yliu), [GitHub](https://github.com/richardyliu), and [LinkedIn](https://www.linkedin.com/in/richard-yliu/).

</RichTextModule>
-->