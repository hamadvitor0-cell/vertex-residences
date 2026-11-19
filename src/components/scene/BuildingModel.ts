import * as THREE from 'three';
import { batchOpaque } from './batchOpaque';
import {
  BASE_HEIGHT,
  FLOOR_COUNT,
  FLOOR_HEIGHT,
  INTERIOR_LEVEL,
  floorProgress,
  range,
} from '../../lib/timeline.mjs';
import { box, roundedSlab, softBox } from './materials';
import type { Materials } from './materials';

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
  const lobbyLight = new THREE.MeshStandardMaterial({
    color: '#f1cb95',
    emissive: '#ffbc72',
    emissiveIntensity: 2.8,
    roughness: 0.73,
  });
  const lobbyWall = m.stone.clone();
  lobbyWall.color.set('#ae9476');
  const lobbyGlass = m.glass.clone();
  lobbyGlass.opacity = 0.13;
  const foundation = new THREE.Group();
  box(foundation, [27, 0.38, 23], [0, 0.17, 0], fascia, true);
  box(foundation, [22, 0.34, 17], [0, 0.51, 0], m.stone);
  box(foundation, [18.6, 0.25, 14.3], [0, 4.14, 0], m.stone, true);
  box(foundation, [14.4, 3.32, 5.4], [0, 2.54, -3.36], m.facade, true);
  box(foundation, [13.91, 3.12, 0.16], [0, 2.31, -0.65], lobbyWall, true);
  box(foundation, [14.14, 0.14, 5.05], [0, 0.79, 1.75], m.stone);
  box(foundation, [14.17, 0.14, 4.92], [0, 3.91, 1.8], lobbyWall);
  for (const x of [-7.02, 7.02]) {
    box(foundation, [0.2, 3.05, 5.06], [x, 2.32, 1.78], fascia, true);
  }
  for (let i = -16; i <= 16; i++) {
    box(foundation, [0.052, 2.54, 0.069], [i * 0.34, 2.29, -0.55], m.walnut);
  }
  for (const x of [-5.3, 0, 5.3]) {
    box(foundation, [2.49, 0.029, 0.033], [x, 3.805, 3.31], lobbyLight);
    box(foundation, [2.49, 0.029, 0.033], [x, 3.805, 1.1], lobbyLight);
  }
  softBox(foundation, [3.1, 1.03, 0.78], [3.4, 1.395, 1.52], 0.068, fascia);
  box(foundation, [2.76, 0.041, 0.052], [3.4, 1.74, 1.925], lobbyLight);
  softBox(foundation, [2.28, 0.58, 0.77], [-4.06, 1.167, 1.64], 0.18, m.ivory);
  softBox(foundation, [2.32, 0.45, 0.24], [-4.06, 1.49, 1.26], 0.108, m.ivory);
  const entry = new THREE.PointLight('#ffd19d', 21, 11);
  entry.position.set(1.8, 3.51, 3.6);
  foundation.add(entry);
  for (let i = -3; i <= 3; i++) {
    box(foundation, [1.99, 3.06, 0.023], [i * 2.07, 2.32, 4.34], lobbyGlass);
    box(foundation, [0.071, 3.2, 0.09], [i * 2.07 + 1.01, 2.32, 4.4], m.bronze);
  }
  box(foundation, [15.7, 0.21, 2.3], [0, 3.75, 5.07], fascia, true);
  box(foundation, [13.2, 0.031, 0.055], [0, 3.625, 6.14], lobbyLight);
  for (const x of [-6.19, 6.19])
    box(foundation, [0.17, 2.95, 0.18], [x, 2.21, 6.11], m.bronze, true);
  for (const x of [-1.1, 1.1]) box(foundation, [0.045, 0.55, 0.065], [x, 2.15, 4.43], m.bronze);
  for (let i = 0; i < 4; i++) {
    box(foundation, [7.4 - i * 0.15, 0.12, 0.49], [0, 0.42 + i * 0.1, 9.98 - i * 0.47], m.stone);
  }
  for (const x of [-9.1, 9.1])
    for (const z of [-6.4, 6.4]) {
      box(foundation, [2.6, 0.46, 2.65], [x, 0.84, z], fascia);
      box(foundation, [0.11, 1.5, 0.11], [x, 1.74, z], m.walnut);
      for (let i = 0; i < 26; i++) {
        const angle = i * 2.4;
        const leaf = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.23 + (i % 5) * 0.062, 1),
          m.leaves,
        );
        leaf.position.set(
          x + Math.cos(angle) * (i % 7) * 0.137,
          2.15 + (i % 7) * 0.127,
          z + Math.sin(angle) * (i % 7) * 0.127,
        );
        leaf.scale.set(1.14, 0.72 + (i % 3) * 0.11, 0.81);
        leaf.rotation.set(angle, angle, 0);
        leaf.castShadow = !mobile;
        foundation.add(leaf);
      }
    }
  const sign = document.createElement('canvas');
  sign.width = 768;
  sign.height = 192;
  const lettering = sign.getContext('2d')!;
  lettering.textAlign = 'center';
  lettering.fillStyle = '#d8b180';
  lettering.font = '56px Georgia';
  Array.from('VERTEX').forEach((letter, i) => lettering.fillText(letter, 151 + i * 92, 114));
  lettering.font = '19px sans-serif';
  lettering.fillText('R E S I D E N C E S', 384, 151);
  const signMap = new THREE.CanvasTexture(sign);
  signMap.colorSpace = THREE.SRGBColorSpace;
  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(4.18, 1.045),
    new THREE.MeshBasicMaterial({
      map: signMap,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  plaque.position.set(4.54, 1.27, 8.886);
  box(foundation, [4.13, 1.03, 0.24], [4.54, 1.27, 8.756], m.dark);
  foundation.add(plaque);
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
          const opening = 0.46 + ((i + j * 3) % 6) * 0.14;
          box(facade, [opening, 1.88, 0.06], [x + 0.17, 1.5, 5.005], m.glow);
          box(facade, [0.44, 2.01, 0.06], [x - 0.65, 1.44, 5.004], lightCurtain);
          box(facade, [1.2, 0.021, 0.071], [x - 0.21, 2.45, 5.023], m.glow);
        }
        box(facade, [0.056, 2.54, 0.12], [x - 1.129, 1.54, 5.025], m.bronze);
        box(facade, [0.039, 2.45, 0.094], [x + 0.47, 1.54, 5.025], m.dark);
      }
      box(facade, [15.6, 0.88, 0.025], [0, 0.77, 6.045], m.glass);
      box(facade, [15.63, 0.042, 0.071], [0, 1.217, 6.05], m.bronze);
    }
    for (const x of [-7.43, 7.43]) {
      if (i !== INTERIOR_LEVEL) {
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
    if (i % 3 === 0) box(facade, [13.8, 0.028, 0.041], [0, 2.853, 5.98], m.glow);
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
  for (const x of [-5.66, -3.96]) {
    softBox(roof, [0.74, 0.18, 1.88], [x, 0.61, -4.18], 0.075, m.ivory);
    const backrest = softBox(roof, [0.73, 0.14, 0.65], [x, 0.78, -4.8], 0.052, m.ivory);
    backrest.rotation.x = -0.42;
  }
  for (const x of [-6.75, 6.31]) {
    box(roof, [1.75, 0.39, 1.03], [x, 0.61, 4.46], fascia);
    for (let j = 0; j < 8; j++) {
      const planting = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.23 + (j % 3) * 0.061, 1),
        m.leaves,
      );
      planting.position.set(
        x + (j - 3.5) * 0.175,
        0.91 + (j % 4) * 0.072,
        4.46 + Math.cos(j) * 0.2,
      );
      roof.add(planting);
    }
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

  let construction = -1;
  return {
    group,
    update(progress: number) {
      lightCurtain.emissiveIntensity = m.glow.emissiveIntensity * 0.58;
      const next = Math.min(progress, 0.64);
      if (next === construction) return false;
      construction = next;
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
      foundation.scale.y = 0.83 + range(progress, 0, 0.085) * 0.17;
      roof.visible = progress > 0.51;
      roof.scale.y = Math.max(0.001, range(progress, 0.51, 0.59));
      wireMaterial.opacity =
        (0.09 + range(progress, 0.045, 0.22) * 0.21) * (1 - range(progress, 0.32, 0.54));
      outline.visible = progress < 0.54;
      return true;
    },
  };
}
