import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp, range, floorProgress, sceneState, FLOOR_COUNT } from '../src/lib/timeline.mjs';

test('construction starts at the foundation and finishes before the camera approaches', () => {
  assert.equal(floorProgress(0, 0), 0);
  for (let floor = 0; floor < FLOOR_COUNT; floor++) {
    assert.equal(floorProgress(0, floor), 0);
    assert.equal(floorProgress(0.63, floor), 1);
  }
  assert.equal(sceneState(0.63).approach, 0);
  assert.equal(sceneState(1).interior, 1);
});
test('each floor grows monotonically and never precedes the floor underneath', () => {
  for (let i = 0; i < FLOOR_COUNT; i++) {
    let previous = 0;
    for (let step = 0; step <= 100; step++) {
      const value = floorProgress(step / 100, i);
      assert.ok(value >= previous && value <= 1);
      if (i > 0) assert.ok(value <= floorProgress(step / 100, i - 1));
      previous = value;
    }
  }
});
test('the journey reverses consistently when scrolling backwards', () => {
  const forwards = Array.from({ length: 101 }, (_, i) => sceneState(i / 100));
  for (let i = 100; i >= 0; i--) assert.deepEqual(sceneState(i / 100), forwards[i]);
});
test('progress values are bounded at both ends', () => {
  assert.equal(clamp(-5), 0);
  assert.equal(clamp(7), 1);
  assert.equal(range(-10, 0, 1), 0);
  assert.equal(range(10, 0, 1), 1);
});
