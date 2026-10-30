import * as THREE from 'three';
import {
  BASE_HEIGHT,
  FLOOR_COUNT,
  FLOOR_HEIGHT,
  INTERIOR_LEVEL,
  floorProgress,
  range,
} from '../../lib/timeline.mjs';
import { box, roundedSlab } from './materials';
import type { Materials } from './materials';

export function createBuilding(materials: Materials, mobile: boolean) {
  const group = new THREE.Group();
  const floors: THREE.Group[] = [];
  const facades: THREE.Group[] = [];
  const slabs = roundedSlab(16.8, 12.5, 0.27, 1.25);
  const glassRail = materials.glass.clone();
  glassRail.opacity = 0.38;
  const foundation = new THREE.Group();
  box(foundation, [25, 0.7, 21], [0, 0.35, 0], materials.dark);
  box(foundation, [20, 0.4, 16], [0, 0.9, 0], materials.stone);
  box(foundation, [14.5, 3.3, 10], [0, 2.65, -0.5], materials.glass);
  for (const x of [-7.4, 7.4]) box(foundation, [0.36, 3.7, 11], [x, 2.7, -0.5], materials.bronze);
  for (let x = -6; x <= 6; x += 3)
    box(foundation, [0.18, 3.4, 0.18], [x, 2.65, 4.6], materials.bronze);
  box(foundation, [19, 0.28, 15], [0, 4.15, 0], materials.stone);
  for (const x of [-9, 9])
    for (const z of [-7, 7]) {
      box(foundation, [2.8, 0.7, 2.8], [x, 1.15, z], materials.dark);
      const tree = new THREE.Mesh(new THREE.IcosahedronGeometry(1.45, 1), materials.leaves);
      tree.position.set(x, 2.2, z);
      tree.scale.set(0.8, 1.25, 0.8);
      foundation.add(tree);
    }
  group.add(foundation);
  for (let i = 0; i < FLOOR_COUNT; i++) {
    const floor = new THREE.Group();
    floor.position.y = BASE_HEIGHT + i * FLOOR_HEIGHT;
    const slab = new THREE.Mesh(slabs, materials.stone);
    slab.receiveShadow = true;
    floor.add(slab);
    box(floor, [3.3, FLOOR_HEIGHT, 4.2], [0, FLOOR_HEIGHT / 2, -2.6], materials.dark);
    for (const x of [-6.8, 6.8])
      for (const z of [-4.8, 4.8])
        box(floor, [0.25, FLOOR_HEIGHT, 0.25], [x, FLOOR_HEIGHT / 2, z], materials.bronze);
    const facade = new THREE.Group();
    // A real opening on level 14 allows the camera to cross into the decorated room.
    if (i !== INTERIOR_LEVEL) {
      for (let j = 0; j < 5; j++) {
        const x = -5.5 + j * 2.75;
        box(facade, [2.58, 2.35, 0.09], [x, 1.45, 4.95], materials.glass);
        if ((i * 7 + j * 3) % 5 < 2) box(facade, [2.25, 1.9, 0.05], [x, 1.4, 4.75], materials.glow);
        box(facade, [0.055, 2.6, 0.14], [x - 1.35, 1.45, 5.02], materials.bronze);
      }
    } else {
      for (const x of [-6, 6]) box(facade, [1.4, 2.6, 0.08], [x, 1.5, 4.97], materials.glass);
    }
    for (const x of [-7.45, 7.45]) {
      box(facade, [0.09, 2.45, 9.4], [x, 1.5, 0], materials.glass);
      for (let z = -3.8; z <= 4; z += 1.9)
        box(facade, [0.13, 2.65, 0.055], [x, 1.5, z], materials.bronze);
      box(facade, [0.13, 0.055, 11.2], [x * 1.09, 1.22, 0], materials.bronze);
    }
    // Slender balcony rails emphasize horizontal architecture without obscuring the entry.
    if (i !== INTERIOR_LEVEL) box(facade, [15.6, 0.95, 0.06], [0, 0.75, 5.99], glassRail);
    if (i !== INTERIOR_LEVEL) box(facade, [15.7, 0.045, 0.09], [0, 1.24, 6], materials.bronze);
    for (let j = 0; j < (mobile ? 2 : 4); j++) {
      const z = -3.8 + j * (mobile ? 7 : 2.3);
      box(facade, [0.32, 2.7, 0.17], [8.1, 1.55, z], materials.bronze);
    }
    floor.add(facade);
    facades.push(facade);
    floors.push(floor);
    group.add(floor);
  }
  const rooftop = new THREE.Group();
  rooftop.position.y = BASE_HEIGHT + FLOOR_COUNT * FLOOR_HEIGHT;
  rooftop.add(new THREE.Mesh(roundedSlab(17.4, 13, 0.4, 1.4), materials.stone));
  box(rooftop, [9, 0.15, 6], [-2, 0.5, 0], materials.pool);
  box(rooftop, [4.7, 2.5, 8], [5.2, 1.5, -1], materials.dark);
  for (let z = -5; z < 4; z += 0.45) box(rooftop, [5.6, 0.1, 0.12], [5, 2.85, z], materials.bronze);
  for (const x of [-7, 7]) box(rooftop, [0.1, 1.25, 11], [x, 0.8, 0], glassRail);
  group.add(rooftop);

  const wireMaterial = new THREE.LineBasicMaterial({
    color: '#b39870',
    transparent: true,
    opacity: 0.11,
  });
  const wire = new THREE.Group();
  for (let i = 0; i <= FLOOR_COUNT; i += 2) {
    const geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(16.8, 0.05, 12.5));
    const line = new THREE.LineSegments(geometry, wireMaterial);
    line.position.y = BASE_HEIGHT + i * FLOOR_HEIGHT;
    wire.add(line);
  }
  for (const x of [-8.4, 8.4])
    for (const z of [-6.25, 6.25]) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, BASE_HEIGHT, z),
        new THREE.Vector3(x, BASE_HEIGHT + FLOOR_COUNT * FLOOR_HEIGHT, z),
      ]);
      wire.add(new THREE.Line(geometry, wireMaterial));
    }
  group.add(wire);
  return {
    group,
    update(progress: number) {
      for (let i = 0; i < FLOOR_COUNT; i++) {
        const amount = floorProgress(progress, i);
        floors[i].visible = amount > 0.001;
        floors[i].scale.y = Math.max(0.001, amount);
        floors[i].position.y = BASE_HEIGHT + i * FLOOR_HEIGHT - (1 - amount) * 2;
        facades[i].visible = range(progress, 0.34 + i * 0.009, 0.43 + i * 0.009) > 0.01;
        facades[i].scale.y = Math.max(0.001, range(progress, 0.34 + i * 0.009, 0.43 + i * 0.009));
      }
      foundation.scale.y = 0.5 + range(progress, 0, 0.06) * 0.5;
      rooftop.visible = progress > 0.51;
      rooftop.scale.y = Math.max(0.001, range(progress, 0.51, 0.59));
      wireMaterial.opacity = 0.14 * (1 - range(progress, 0.35, 0.6));
      wire.visible = progress < 0.6;
    },
  };
}
