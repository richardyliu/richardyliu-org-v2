<script>
  import ContentPage from '$lib/components/ContentPage.svelte';
  import LandingScenes from '$lib/components/landing/LandingScenes.svelte';
  import { getPage, getPageSections } from '$lib/content.js';
  import { LANDING_ENABLED } from '$lib/site.js';

  /**
   * The homepage is the About prose. The five-scene landing drawing it replaced
   * is still here, behind `LANDING_ENABLED` in $lib/site.js — flip that flag and
   * the drawing comes back, along with the layout's full-viewport treatment.
   *
   * The prose, the section structure and the rail all come out of one file,
   * src/content/pages/about.md. This route deliberately knows nothing about
   * what sections exist — it renders whatever that file declares, so editing
   * the page never means editing the route.
   */
  const About = getPage('about');
  const SECTIONS = getPageSections('about');
</script>

{#if LANDING_ENABLED}
  <LandingScenes />
{:else}
  <ContentPage sections={SECTIONS}>
    <About />
  </ContentPage>
{/if}
