import * as THREE from 'three';
import { range } from '../../lib/timeline.mjs';

export function createLighting(scene: THREE.Scene, mobile: boolean) {
  const hemisphere = new THREE.HemisphereLight('#d6e5fb', '#61504b', 1.3);
  const key = new THREE.DirectionalLight('#ffe2bf', 3.55);
  key.position.set(-36, 64, 42);
  key.target.position.set(0, 30, 0);
  key.castShadow = !mobile;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, {
    left: -27,
    right: 27,
    top: 48,
    bottom: -40,
    near: 1,
    far: 155,
  });
  key.shadow.bias = -0.00022;
  key.shadow.normalBias = 0.15;
  const rim = new THREE.DirectionalLight('#9ababf', 1.75);
  rim.position.set(32, 42, -26);
  scene.add(key.target, key, rim, hemisphere);
  return {
    update(progress: number) {
      const dusk = range(progress, 0.38, 0.78);
      const indoors = range(progress, 0.866, 0.962);
      key.intensity = (3.55 - dusk * 1.78) * (1 - indoors * 0.82);
      rim.intensity = 1.75 - dusk * 0.6 - indoors * 0.81;
      hemisphere.intensity = 1.3 - dusk * 0.3 - indoors * 0.51;
      scene.environmentIntensity = 0.57 + dusk * 0.13 - indoors * 0.26;
    },
  };
}
