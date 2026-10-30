import * as THREE from 'three';
import { INTERIOR_Y, range, sceneState } from '../../lib/timeline.mjs';

const initial = new THREE.Vector3(83, 34, 103);
const elevated = new THREE.Vector3(78, 51, 101);
const facade = new THREE.Vector3(7, INTERIOR_Y + 5, 37);
const threshold = new THREE.Vector3(0.1, INTERIOR_Y + 1.7, 7.7);
const inside = new THREE.Vector3(0.05, INTERIOR_Y + 1.6, 3.7);
const target = new THREE.Vector3();

export function updateCamera(camera: THREE.PerspectiveCamera, progress: number, mobile: boolean) {
  const { orbit, approach, interior: enter } = sceneState(progress);
  const rise = range(progress, 0.05, 0.61);
  camera.position.copy(initial).lerp(elevated, rise);
  if (mobile) camera.position.multiplyScalar(1.65);
  camera.position.lerp(facade, orbit).lerp(threshold, approach).lerp(inside, enter);
  target.set(0, 25 + rise * 8, 0);
  target.lerp(new THREE.Vector3(0, INTERIOR_Y + 1.3, 0), orbit);
  target.lerp(new THREE.Vector3(-0.75, INTERIOR_Y + 1.25, -3), approach);
  camera.lookAt(target);
  const width = document.documentElement.clientWidth,
    height = window.innerHeight;
  const close = range(progress, 0.7, 0.92);
  camera.setViewOffset(
    width,
    height,
    -(mobile ? 0.16 : 0.22) * width * (1 - close),
    -(mobile ? 0.2 : 0) * height * (1 - close),
    width,
    height,
  );
  const fov = 43 + enter * 17;
  if (camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
}
