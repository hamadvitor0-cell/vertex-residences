import * as THREE from 'three';
import { INTERIOR_Y, range, sceneState } from '../../lib/timeline.mjs';
import { ENTRY_Z } from './InteriorModel';

const exteriorStart = new THREE.Vector3(91, 42, 114);
const exteriorEnd = new THREE.Vector3(82, 51, 121);
const atFacade = new THREE.Vector3(11, INTERIOR_Y + 4.2, 42);
const beforeDoor = new THREE.Vector3(-0.24, INTERIOR_Y + 1.96, ENTRY_Z + 1.47);
const inside = new THREE.Vector3(-2.55, INTERIOR_Y + 1.87, 3.15);
const facadeTarget = new THREE.Vector3(0.25, INTERIOR_Y + 1.5, ENTRY_Z - 0.4);
const livingTarget = new THREE.Vector3(2.8, INTERIOR_Y + 1.5, -2.65);
const target = new THREE.Vector3();

export function updateCamera(
  camera: THREE.PerspectiveCamera,
  progress: number,
  width: number,
  height: number,
) {
  const { orbit, approach, interior: enter } = sceneState(progress);
  const portrait = width / height < 0.85;
  const build = range(progress, 0.02, 0.6);
  camera.position.copy(exteriorStart).lerp(exteriorEnd, build);
  if (portrait) camera.position.multiplyScalar(1.48);
  camera.position.lerp(atFacade, orbit).lerp(beforeDoor, approach);
  // Cross the center of the threshold before moving sideways for the reveal.
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, inside.z, enter);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, inside.y, enter);
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, inside.x, range(enter, 0.32, 1));
  target.set(0, 28 + build * 5, 0);
  target.lerp(facadeTarget, orbit);
  target.lerp(livingTarget, range(progress, 0.921, 0.993));
  camera.lookAt(target);
  camera.fov = 39 + range(progress, 0.87, 1) * (portrait ? 19 : 16);
  const centered = range(progress, 0.73, 0.91);
  const horizontal = -(portrait ? 0.115 : 0.23) * (1 - centered) - (portrait ? 0 : 0.11) * enter;
  const vertical = -(portrait ? 0.175 : 0) * (1 - centered) + (portrait ? 0.14 : 0) * enter;
  camera.setViewOffset(width, height, horizontal * width, vertical * height, width, height);
}
