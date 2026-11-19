import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
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

function batchOpaque(group: THREE.Group) {
  const batches = new Map<THREE.Material, THREE.Mesh[]>();
  for (const child of group.children) {
    if (
      !(child instanceof THREE.Mesh) ||
      Array.isArray(child.material) ||
      child.material.transparent ||
      child.geometry.type === 'ExtrudeGeometry'
    )
      continue;
    const batch = batches.get(child.material) ?? [];
    batch.push(child);
    batches.set(child.material, batch);
  }
  for (const [material, meshes] of batches) {
    if (meshes.length < 2) continue;
    const parts = meshes.map((mesh) => {
      mesh.updateMatrix();
      return (
        mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone()
      ).applyMatrix4(mesh.matrix);
    });
    const geometry = mergeGeometries(parts);
    parts.forEach((part) => part.dispose());
    if (!geometry) continue;
    const combined = new THREE.Mesh(geometry, material);
    combined.castShadow = meshes.some((mesh) => mesh.castShadow);
    combined.receiveShadow = true;
    for (const mesh of meshes) {
      group.remove(mesh);
      mesh.geometry.dispose();
    }
    group.add(combined);
  }
}

export function createBuilding(m: Materials, mobile: boolean) {
  const group = new THREE.Group();
  const floors: { frame: THREE.Group; facade: THREE.Group }[] = [];
  const slabs = roundedSlab(16.8, 12.5, 0.25, 1.15);
  const smoke = m.facade.clone();
  smoke.color.set('#346078');
  smoke.roughness = 0.27;
  const fascia = m.stone.clone();
  fascia.color.set('#736655');
  const lightCurtain = m.glow.clone();
  lightCurtain.color.set('#9e7855');
  const foundation = new THREE.Group();
  box(foundation, [27, 0.38, 23], [0, 0.17, 0], fascia, true);
  box(foundation, [22, 0.34, 17], [0, 0.51, 0], m.stone);
  box(foundation, [18.6, 0.25, 14.3], [0, 4.14, 0], m.stone, true);
  box(foundation, [14.4, 3.32, 10.1], [0, 2.54, -0.77], m.facade, true);
  for (let i = -3; i <= 3; i++) {
    box(foundation, [1.95, 3.07, 0.07], [i * 2.07, 2.32, 4.34], i % 2 === 0 ? m.glow : smoke);
    box(foundation, [0.071, 3.2, 0.09], [i * 2.07 + 1.01, 2.32, 4.4], m.bronze);
  }
  box(foundation, [15.7, 0.18, 2.3], [0, 3.75, 5.07], fascia, true);
  box(foundation, [13.2, 0.031, 0.055], [0, 3.648, 6.14], m.glow);
  for (let i = 0; i < 4; i++) {
    box(foundation, [7.4 - i * 0.15, 0.12, 0.49], [0, 0.42 + i * 0.1, 9.98 - i * 0.47], m.stone);
  }
  for (const x of [-9.1, 9.1])
    for (const z of [-6.4, 6.4]) {
      box(foundation, [2.6, 0.46, 2.65], [x, 0.84, z], fascia);
      box(foundation, [0.15, 2.47, 0.15], [x, 2.13, z], m.walnut);
      for (let i = 0; i < 9; i++) {
        const angle = i * 2.4;
        const leaf = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.61 + (i % 3) * 0.115, 2),
          m.leaves,
        );
        leaf.position.set(
          x + Math.cos(angle) * 0.76,
          3.01 + (i % 4) * 0.29,
          z + Math.sin(angle) * 0.72,
        );
        leaf.scale.set(1.14, 0.72 + (i % 3) * 0.11, 0.81);
        leaf.rotation.set(angle, angle, 0);
        leaf.castShadow = !mobile;
        foundation.add(leaf);
      }
    }
  batchOpaque(foundation);
  group.add(foundation);

  for (let i = 0; i < FLOOR_COUNT; i++) {
    const frame = new THREE.Group();
    const deck = new THREE.Mesh(slabs, m.stone);
    deck.castShadow = !mobile;
    deck.receiveShadow = true;
    frame.add(deck);
    if (i !== INTERIOR_LEVEL) box(frame, [8.5, 2.64, 8.3], [0, 1.46, -0.36], m.dark);
    for (const x of [-6.9, 6.9])
      for (const z of [-4.6, 4.6]) {
        box(frame, [0.32, 2.69, 0.31], [x, 1.53, z], m.bronze);
      }
    const facade = new THREE.Group();
    if (i !== INTERIOR_LEVEL) {
      for (let j = 0; j < 6; j++) {
        const x = (j - 2.5) * 2.28;
        box(facade, [2.27, 2.48, 0.08], [x, 1.54, 4.96], j % 3 === 1 ? smoke : m.facade);
        if ((i * 17 + j * 7) % 19 < 7) {
          box(facade, [1.24, 1.95, 0.06], [x + 0.1, 1.43, 5.005], m.glow);
          box(facade, [0.37, 1.95, 0.06], [x - 0.78, 1.43, 5.004], lightCurtain);
        }
        box(facade, [0.056, 2.54, 0.12], [x - 1.129, 1.54, 5.025], m.bronze);
      }
      box(facade, [15.6, 0.88, 0.025], [0, 0.77, 6.045], m.glass);
      box(facade, [15.63, 0.042, 0.071], [0, 1.217, 6.05], m.bronze);
    }
    for (const x of [-7.43, 7.43]) {
      if (i !== INTERIOR_LEVEL || x < 0) {
        box(facade, [0.076, 2.48, 9.9], [x, 1.53, 0], smoke);
        for (let z = -3.86; z < 4.1; z += 1.94) {
          box(facade, [0.15, 2.52, 0.06], [x, 1.53, z], m.bronze);
        }
        if (i % 4 !== 1)
          box(facade, [0.082, 1.78, 1.61], [x * 1.007, 1.43, ((i % 4) - 2) * 1.67], m.glow);
      }
      box(facade, [0.066, 0.043, 11.2], [x * 1.093, 1.22, 0], m.bronze);
    }
    box(facade, [14.85, 2.52, 0.09], [0, 1.53, -4.94], m.facade);
    box(facade, [14.3, 0.09, 0.14], [0, 2.679, 5.03], m.bronze);
    box(facade, [15.5, 0.075, 0.11], [0, 0.232, 6.075], fascia);
    for (let j = 0; j < (mobile ? 3 : 5); j++) {
      const z = -3.91 + j * (mobile ? 1.08 : 0.53);
      box(facade, [0.59, 2.9, 0.14], [8.06, 1.45, z], m.bronze, !mobile);
    }
    if (i % 3 !== 1 && i !== INTERIOR_LEVEL) {
      const x = i % 2 === 0 ? -5.8 : 5.8;
      box(facade, [2.35, 0.25, 0.61], [x, 0.41, 5.61], fascia);
      for (let j = 0; j < 5; j++) {
        const leaf = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.23 + (j % 3) * 0.052, 1),
          m.leaves,
        );
        leaf.position.set(x + (j - 2) * 0.42, 0.63 + (j % 3) * 0.075, 5.6);
        leaf.scale.set(1.2, 0.71, 0.79);
        facade.add(leaf);
      }
    }
    batchOpaque(frame);
    batchOpaque(facade);
    frame.add(facade);
    floors.push({ frame, facade });
    group.add(frame);
  }

  const roof = new THREE.Group();
  roof.position.y = BASE_HEIGHT + FLOOR_COUNT * FLOOR_HEIGHT;
  const crown = new THREE.Mesh(roundedSlab(17.4, 13, 0.39, 1.28), m.stone);
  crown.castShadow = true;
  crown.receiveShadow = true;
  roof.add(crown);
  box(roof, [8.8, 0.15, 6.1], [-2, 0.49, 0.05], m.pool);
  box(roof, [4.63, 2.39, 5.28], [4.8, 1.59, -2.55], m.facade, true);
  for (const x of [2.43, 7.61])
    for (const z of [-4.8, 4.15]) {
      box(roof, [0.16, 2.47, 0.16], [x, 1.61, z], m.bronze);
    }
  for (let z = -5.05; z < 4.38; z += 0.42) {
    box(roof, [5.62, 0.14, 0.12], [5.03, 2.86, z], m.bronze);
  }
  for (const x of [2.26, 7.76]) box(roof, [0.17, 0.19, 9.58], [x, 2.85, -0.35], m.bronze);
  for (const x of [-7.95, 7.95]) {
    box(roof, [0.038, 1.0, 10.15], [x, 0.94, 0], m.glass);
    box(roof, [0.081, 0.045, 10.17], [x, 1.44, 0], m.bronze);
  }
  batchOpaque(roof);
  group.add(roof);

  const wireMaterial = new THREE.LineBasicMaterial({
    color: '#c1ae86',
    transparent: true,
    opacity: 0.27,
  });
  const outline = new THREE.Group();
  for (let i = 0; i <= FLOOR_COUNT; i += 2) {
    const slab = new THREE.BoxGeometry(16.8, 0.045, 12.5);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(slab), wireMaterial);
    slab.dispose();
    edge.position.y = BASE_HEIGHT + i * FLOOR_HEIGHT;
    outline.add(edge);
  }
  for (const x of [-8.4, 8.4])
    for (const z of [-6.25, 6.25]) {
      const edge = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, 0.15, z),
        new THREE.Vector3(x, BASE_HEIGHT + FLOOR_COUNT * FLOOR_HEIGHT, z),
      ]);
      outline.add(new THREE.Line(edge, wireMaterial));
    }
  group.add(outline);

  return {
    group,
    update(progress: number) {
      for (let i = 0; i < FLOOR_COUNT; i++) {
        const { frame, facade } = floors[i];
        const amount = floorProgress(progress, i);
        const finish = range(progress, 0.32 + i * 0.01, 0.42 + i * 0.01);
        frame.visible = amount > 0.001;
        frame.scale.y = Math.max(0.001, amount);
        frame.position.y = BASE_HEIGHT + i * FLOOR_HEIGHT - (1 - amount) * 2;
        facade.visible = finish > 0.01;
        facade.scale.y = Math.max(0.001, finish);
      }
      foundation.scale.y = 0.38 + range(progress, 0, 0.09) * 0.62;
      roof.visible = progress > 0.51;
      roof.scale.y = Math.max(0.001, range(progress, 0.51, 0.59));
      wireMaterial.opacity = 0.27 * (1 - range(progress, 0.32, 0.54));
      outline.visible = progress < 0.54;
      lightCurtain.emissiveIntensity = m.glow.emissiveIntensity * 0.58;
    },
  };
}
