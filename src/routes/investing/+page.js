import { getInvestments } from '$lib/content.js';

export const load = () => ({
  title: 'Investing',
  description: 'Robotics, deep tech, infrastructure, and applications.',
  investments: getInvestments()
});
