import * as THREE from 'three';
import { sceneState } from '../../lib/timeline.mjs';

export function createLighting(scene: THREE.Scene, mobile: boolean) {
  const hemisphere = new THREE.HemisphereLight('#d6e2e1', '#494039', 2.4);
  scene.add(hemisphere);
  const sun = new THREE.DirectionalLight('#ffe2bd', 4.8);
  sun.position.set(-36, 65, 42);
  sun.castShadow = !mobile;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -42, right: 42, top: 85, bottom: -15, far: 170 });
  sun.shadow.bias = -0.002;
  scene.add(sun);
  const rim = new THREE.DirectionalLight('#8cb5d1', 2.1);
  rim.position.set(32, 34, -20);
  scene.add(rim);
  return {
    update(progress: number) {
      const evening = sceneState(progress).lights;
      sun.intensity = 4.8 - evening * 2.8;
      hemisphere.intensity = 2.4 - evening * 0.9;
      rim.intensity = 2.1 + evening * 0.7;
    },
  };
}
