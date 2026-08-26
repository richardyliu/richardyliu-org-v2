<script>
  import ContentPage from '$lib/components/ContentPage.svelte';
  import RichTextModule from '$lib/components/RichTextModule.svelte';

  const SECTIONS = [
    { id: 'type', label: 'Type' },
    { id: 'system', label: 'System' }
  ];
</script>

<ContentPage sections={SECTIONS}>
  <RichTextModule id="type" half heading="Type">
    <p>
      Set in <a href="https://fonts.google.com/specimen/Newsreader" target="_blank" rel="noreferrer noopener">Newsreader</a>
      and <a href="https://fonts.google.com/specimen/Geist+Mono" target="_blank" rel="noreferrer noopener">Geist Mono</a>,
      both self-hosted and subset to Latin. Nothing on this site is bold: hierarchy comes
      from size, tracking, and whitespace, and the mono face carries every label,
      date, and control.
    </p>
    <p>
      Han characters fall through to the system serif — Songti SC, then Source Han
      Serif — because neither Latin face covers them.
    </p>
  </RichTextModule>

  <RichTextModule id="system" half heading="System">
    <p>
      SvelteKit, prerendered to static files. No CSS framework: the whole visual
      system is about two hundred custom properties resolving through a
      mobile-first cascade, on a 6/8/12-column grid that caps at 1752px.
    </p>
    <p>
      Find is a build-time JSON index over the content sources, scored on the
      client. It is not fuzzy — on a corpus that is mostly book titles, fuzzy
      matching produces confident nonsense.
    </p>
    <p>
      The landing page is a 2D canvas: five seeded scenes, hairline strokes, no
      fills. It holds a fixed frame under <em>prefers-reduced-motion</em> and
      stops entirely in a background tab.
    </p>
  </RichTextModule>
</ContentPage>
