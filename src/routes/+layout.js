// Everything here is content-derived and has no per-request state, so the whole
// site prerenders to static HTML. adapter-static will fail the build if any
// route stops being prerenderable, which is the check we want.
export const prerender = true;
export const trailingSlash = 'never';
