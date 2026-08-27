import { search, middleTruncate } from '../src/lib/find.js';
import assert from 'node:assert/strict';

let fails = 0;
const check = (name, fn) => {
  try { fn(); console.log('  ok  ' + name); }
  catch (e) { fails++; console.log('FAIL  ' + name + '\n      ' + e.message); }
};

const CORPUS = [
  { title: 'About', path: '/about', kind: 'page', text: 'robotics deep tech berkeley' },
  { title: 'Reading', path: '/reading', kind: 'page', text: 'shelf books' },
  { title: 'The Verification Gap', path: '/building#verification-gap', kind: 'building', text: 'agents permitting cad robotics' },
  { title: 'Chip War: The Fight for the World’s Most Critical Technology', path: '/reading#chip-war', kind: 'reading', text: 'Chris Miller' },
  { title: 'Barbarians at the Gate', path: '/reading#barbarians', kind: 'reading', text: 'Bryan Burrough' },
  { title: 'Upriver', path: '/investing#upriver', kind: 'investing', text: 'GTM agents Llama Ventures' }
];

check('an empty query returns nothing', () => {
  assert.deepEqual(search(CORPUS, '   '), []);
});

check('a title prefix outranks a body match', () => {
  const r = search(CORPUS, 'chip');
  assert.equal(r[0].title.startsWith('Chip War'), true);
});

check('matches by author in the body text', () => {
  const r = search(CORPUS, 'burrough');
  assert.equal(r[0].path, '/reading#barbarians');
});

check('does NOT fuzzy-match scattered letters', () => {
  // "brt" appears in Ba-r-bar-i-ans only as scattered letters. A fuzzy matcher
  // would surface it confidently; this must return nothing.
  assert.deepEqual(search(CORPUS, 'brt'), []);
});

check('pages outrank shelf entries on an equal-tier match', () => {
  const r = search(CORPUS, 'robotics');
  assert.equal(r[0].path, '/about');
});

check('respects the result limit', () => {
  assert.equal(search(CORPUS, 'a', 3).length <= 3, true);
});

check('is case-insensitive', () => {
  assert.equal(search(CORPUS, 'CHIP')[0].path, '/reading#chip-war');
});

check('truncation keeps the section for hash paths', () => {
  const t = middleTruncate('/reading#chip-war-the-fight-for-the-worlds-most-critical-technology');
  assert.equal(t.startsWith('/reading#...'), true, t);
});

check('truncation keeps the section for slug paths', () => {
  const t = middleTruncate('/reading/an-extremely-long-book-slug-that-will-not-fit-in-the-column');
  assert.equal(t.startsWith('/reading/...'), true, t);
});

check('short paths are left alone', () => {
  assert.equal(middleTruncate('/about'), '/about');
});

console.log(fails ? `\n${fails} test(s) failed` : '\nfind: all tests passed');
process.exit(fails ? 1 : 0);
