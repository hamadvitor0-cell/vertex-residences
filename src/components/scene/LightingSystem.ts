import * as THREE from 'three';
import { range } from '../../lib/timeline.mjs';

export function createLighting(scene: THREE.Scene, mobile: boolean) {
  const hemisphere = new THREE.HemisphereLight('#c3d9ff', '#726057', 1.02);
  const key = new THREE.DirectionalLight('#ffca97', 3.43);
  key.position.set(-49, 45, 38);
  key.target.position.set(0, 30, 0);
  key.castShadow = !mobile;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {
    left: -35,
    right: 35,
    top: 48,
    bottom: -42,
    near: 1,
    far: 155,
  });
  key.shadow.bias = -0.00022;
  key.shadow.normalBias = 0.08;
  key.shadow.radius = 2;
  const rim = new THREE.DirectionalLight('#afcaf7', 1.48);
  rim.position.set(32, 39, -26);
  scene.add(key.target, key, rim, hemisphere);
  return {
    update(progress: number) {
      const dusk = range(progress, 0.38, 0.78);
      const indoors = range(progress, 0.866, 0.962);
      key.intensity = (3.43 - dusk * 2.02) * (1 - indoors * 0.85);
      rim.intensity = 1.48 - dusk * 0.25 - indoors * 0.6;
      hemisphere.intensity = 1.02 - dusk * 0.28 - indoors * 0.27;
      scene.environmentIntensity = 0.53 + dusk * 0.12 - indoors * 0.19;
    },
  };
}
