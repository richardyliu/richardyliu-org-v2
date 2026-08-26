import { nextPinState } from '../src/lib/header-pin.js';
import assert from 'node:assert/strict';

let fails = 0;
const check = (name, fn) => {
  try { fn(); console.log('  ok  ' + name); }
  catch (e) { fails++; console.log('FAIL  ' + name + '\n      ' + e.message); }
};

check('starts pinned and stays pinned near the top', () => {
  const r = nextPinState({ y: 4, lastY: 0, pinned: true });
  assert.equal(r.pinned, true);
});

check('hides when scrolling down past the header', () => {
  const r = nextPinState({ y: 300, lastY: 0, pinned: true });
  assert.deepEqual(r, { pinned: false, lastY: 300 });
});

check('does NOT hide while still inside the header height', () => {
  const r = nextPinState({ y: 40, lastY: 10, pinned: true });
  assert.equal(r.pinned, true, 'a 40px scroll should not steal the header');
});

check('shows again on any upward movement', () => {
  const r = nextPinState({ y: 250, lastY: 300, pinned: false });
  assert.deepEqual(r, { pinned: true, lastY: 250 });
});

check('re-shows on returning to the very top', () => {
  const r = nextPinState({ y: 0, lastY: 300, pinned: false });
  assert.deepEqual(r, { pinned: true, lastY: 0 });
});

check('a zero-delta event changes nothing and does not move lastY', () => {
  const r = nextPinState({ y: 300, lastY: 300, pinned: false });
  assert.deepEqual(r, { pinned: false, lastY: 300 }, 'stray events must not re-show');
});

check('sub-pixel jitter is ignored', () => {
  const r = nextPinState({ y: 300.4, lastY: 300, pinned: false });
  assert.equal(r.pinned, false);
});

check('a full down-up-down cycle ends hidden', () => {
  let s = { y: 0, lastY: 0, pinned: true };
  for (const y of [400, 200, 900]) {
    const r = nextPinState({ ...s, y });
    s = { y, lastY: r.lastY, pinned: r.pinned };
  }
  assert.equal(s.pinned, false);
});

console.log(fails ? `\n${fails} test(s) failed` : '\nheader-pin: all tests passed');
process.exit(fails ? 1 : 0);
