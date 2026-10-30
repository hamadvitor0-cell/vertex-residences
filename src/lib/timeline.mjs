/** Deterministic scroll mapping, shared by the 3D scene and its verification. */
export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
export const range = (value, from, to) => smooth((value - from) / (to - from));
export const FLOOR_COUNT = 22;
export const FLOOR_HEIGHT = 2.9;
export const BASE_HEIGHT = 4.4;
export const INTERIOR_LEVEL = 13;
export const INTERIOR_Y = BASE_HEIGHT + INTERIOR_LEVEL * FLOOR_HEIGHT;

export function floorProgress(progress, index) {
  return range(progress, 0.045 + index * 0.019, 0.14 + index * 0.019);
}

export function sceneState(progress) {
  return {
    foundation: range(progress, 0, 0.08),
    facade: range(progress, 0.43, 0.64),
    lights: range(progress, 0.57, 0.74),
    orbit: range(progress, 0.72, 0.84),
    approach: range(progress, 0.84, 0.95),
    interior: range(progress, 0.95, 1),
  };
}
