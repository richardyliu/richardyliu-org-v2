import { getBuilds } from '$lib/content.js';

export const load = () => ({
  title: 'Building',
  description:
    'Robots, hardware and the software around them — three FRC seasons, a go kart, a voice-driven rover, a haptic navigation device, an industrial inventory robot, a wiki and a match-display app.',
  builds: getBuilds()
});
