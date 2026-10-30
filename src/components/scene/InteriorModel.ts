import * as THREE from 'three';
import { INTERIOR_Y, range } from '../../lib/timeline.mjs';
import { box } from './materials';
import type { Materials } from './materials';

export function createInterior(m: Materials) {
  const room = new THREE.Group();
  room.position.y = INTERIOR_Y;
  box(room, [14.5, 0.09, 10], [0, 0.3, 0], m.walnut);
  box(room, [14.5, 2.65, 0.15], [0, 1.65, -4.85], m.walnut);
  box(room, [0.18, 2.65, 9.8], [-7.1, 1.65, 0], m.ivory);
  box(room, [0.18, 2.65, 9.8], [7.1, 1.65, 0], m.walnut);
  const ceiling = box(room, [14.5, 0.12, 10], [0, 2.93, 0], m.ivory);
  ceiling.material = m.ivory.clone();
  box(room, [7.6, 0.04, 5.2], [-1.2, 0.37, 0.4], m.rug);
  // Low modular sofa, oriented toward the open balcony and city.
  box(room, [5.8, 0.36, 1.45], [-1.2, 0.62, -2.35], m.ivory);
  box(room, [5.8, 0.65, 0.3], [-1.2, 0.95, -2.98], m.ivory);
  for (const x of [-3.95, 1.55]) box(room, [0.32, 0.55, 1.45], [x, 0.85, -2.35], m.ivory);
  for (const x of [-2.9, -1.1, 0.7]) {
    const cushion = box(room, [1.65, 0.18, 1.15], [x, 0.88, -2.28], m.ivory);
    cushion.rotation.x = -0.04;
  }
  const table = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.18, 0.12, 40), m.stone);
  table.position.set(-1.2, 0.82, 0.1);
  room.add(table);
  box(room, [0.6, 0.36, 0.6], [-1.2, 0.58, 0.1], m.stone);
  box(room, [0.65, 0.06, 0.4], [-1, 0.91, 0.12], m.dark);
  box(room, [1.3, 0.26, 1.3], [3.9, 0.7, 0.5], m.walnut);
  box(room, [1.1, 0.18, 1.1], [3.9, 0.91, 0.5], m.ivory);
  box(room, [1.3, 0.65, 0.18], [3.9, 1.1, -0.1], m.ivory);
  box(room, [2.6, 0.1, 1.2], [-4.8, 1.15, -0.4], m.walnut);
  for (const x of [-5.7, -3.9]) box(room, [0.12, 0.8, 0.9], [x, 0.7, -0.4], m.bronze);
  for (let x = -6.5; x < 7; x += 0.32) box(room, [0.045, 2.55, 0.08], [x, 1.6, -4.72], m.bronze);
  const art = box(room, [2.8, 1.6, 0.08], [0, 1.8, -4.6], m.ivory);
  const accent = box(room, [1.05, 1.3, 0.09], [0.5, 1.8, -4.53], m.dark);
  accent.rotation.z = 0.19;
  art.castShadow = true;
  const strip = new THREE.MeshStandardMaterial({
    color: '#ffe7b5',
    emissive: '#ffc57f',
    emissiveIntensity: 2.3,
  });
  box(room, [13.8, 0.025, 0.035], [0, 2.78, -4.55], strip);
  for (const x of [-6.4, 6.4]) {
    box(room, [0.06, 2.4, 0.06], [x, 1.5, 4.4], m.bronze);
    for (let i = 0; i < 7; i++) box(room, [0.065, 2.45, 0.1], [x + i * 0.07, 1.6, 4.35], m.ivory);
  }
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.23, 24, 1, true), m.ivory);
  shade.position.set(4.1, 2.35, -2.2);
  room.add(shade);
  box(room, [0.025, 0.5, 0.025], [4.1, 2.65, -2.2], m.bronze);
  const light = new THREE.PointLight('#ffd9a4', 22, 16, 2);
  light.position.set(0, 2.2, -0.5);
  room.add(light);
  const lampLight = new THREE.PointLight('#ffca89', 6, 7, 2);
  lampLight.position.set(4.1, 2.1, -2.2);
  room.add(lampLight);
  const doors = [-1, 1].map((side) => {
    const panel = new THREE.Group();
    box(panel, [6, 2.55, 0.08], [0, 1.6, 4.98], m.glass);
    for (const x of [-3, 3]) box(panel, [0.045, 2.58, 0.14], [x, 1.6, 5.02], m.bronze);
    panel.position.x = side * 3;
    room.add(panel);
    return { panel, side };
  });
  return {
    group: room,
    update(progress: number) {
      const opening = range(progress, 0.82, 0.94);
      doors.forEach(({ panel, side }) => {
        panel.position.x = side * (3 + opening * 3.15);
      });
    },
  };
}
