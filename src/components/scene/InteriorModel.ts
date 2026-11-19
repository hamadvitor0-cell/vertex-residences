import * as THREE from 'three';
import { LIVING_RUG } from '../../lib/apartmentTour.mjs';
import { INTERIOR_Y, range } from '../../lib/timeline.mjs';
import { box, softBox } from './materials';
import { furnishApartment } from './ApartmentRooms';
import { contactShadows } from './ContactShadows';
import { batchOpaque } from './batchOpaque';
import type { Materials } from './materials';
import type { SceneAssets } from './SceneAssets';

export const ENTRY_Z = 4.95;
const floorY = 0.32;

export function createInterior(m: Materials, assets: SceneAssets, mobile: boolean) {
  const room = new THREE.Group();
  room.position.y = INTERIOR_Y;

  function surface(name: string, color: string, repeat: [number, number], relief: number) {
    return new THREE.MeshStandardMaterial({
      color,
      map: assets.texture(name + '-color', true, repeat),
      normalMap: assets.texture(name + '-normal', false, repeat),
      normalScale: new THREE.Vector2(relief, relief),
      roughness: 0.78,
    });
  }
  const timber = surface('walnut', '#c2b09d', [5.5, 1.2], 0.46);
  const floor = surface('oak', '#cbb299', [4, 3], 0.34);
  const plaster = surface('plaster', '#e9d7bd', [2, 1], 0.32);
  const cloth = surface('wool', '#ded1b9', [5, 4], 0.48);
  const upholstery = surface('wool', '#eae1cb', [4, 3], 0.32);
  const travertine = surface('plaster', '#b7a282', [1, 1], 0.23);
  const clay = new THREE.MeshStandardMaterial({ color: '#93573a', roughness: 0.92 });
  const olive = new THREE.MeshStandardMaterial({ color: '#5b6248', roughness: 0.92 });
  const linen = new THREE.MeshStandardMaterial({
    color: '#cfc4ad',
    side: THREE.DoubleSide,
    roughness: 1,
  });
  const warmStrip = new THREE.MeshStandardMaterial({
    color: '#ffdbad',
    emissive: '#ffab5e',
    emissiveIntensity: 3,
  });
  const glazing = m.glass.clone();
  glazing.side = THREE.DoubleSide;
  glazing.opacity = 0.115;
  glazing.roughness = 0.23;
  glazing.clearcoat = 0.14;
  glazing.specularIntensity = 0.6;

  box(room, [14.7, 0.08, 9.9], [0, floorY - 0.04, 0], floor);
  box(room, [14.7, 0.11, 1.2], [0, floorY - 0.03, 5.55], travertine);
  const ceiling = new THREE.MeshStandardMaterial({ color: '#b1aa9c', roughness: 0.95 });
  box(room, [14.8, 0.14, 10.1], [0, 2.84, -0.02], ceiling);
  box(room, [14.8, 2.52, 0.16], [0, 1.55, -4.82], m.dark, true);
  box(room, [6.1, 2.38, 0.14], [3.25, 1.51, -4.67], timber);
  box(room, [6.8, 2.38, 0.13], [-3.45, 1.51, -4.67], plaster);
  for (let i = 0; i < 5; i++) {
    box(room, [0.014, 2.38, 0.014], [0.62 + i * 1.19, 1.51, -4.592], m.dark);
  }

  // The eastern wall is a continuous window. The neighboring slabs and city remain in view.
  const windowWall = new THREE.Group();
  windowWall.position.x = 7.23;
  for (let z = -4.9; z < 5; z += 1.96) {
    box(windowWall, [0.092, 2.48, 0.065], [0, 1.53, z], m.dark);
    if (z < 3.9) box(windowWall, [0.012, 2.36, 1.89], [0, 1.54, z + 0.98], glazing);
  }
  for (const y of [0.36, 2.72]) box(windowWall, [0.115, 0.08, 9.9], [0, y, 0], m.dark);
  room.add(windowWall);

  function curtain(x: number, z: number, width: number, angle: number) {
    const geometry = new THREE.PlaneGeometry(width, 2.38, 35, 8);
    const points = geometry.attributes.position;
    for (let i = 0; i < points.count; i++) {
      const u = points.getX(i);
      points.setZ(i, Math.sin(u * 46) * 0.041 + Math.cos(u * 16) * 0.015);
    }
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, linen);
    mesh.position.set(x, 1.53, z);
    mesh.rotation.y = angle;
    room.add(mesh);
  }
  curtain(7.05, -4.26, 0.98, Math.PI / 2);
  curtain(7.05, 4.32, 1.05, Math.PI / 2);
  curtain(-3.68, 4.72, 0.54, 0);
  curtain(5.72, 4.71, 1.03, 0);

  const rug = LIVING_RUG;
  softBox(room, [rug.width, 0.044, rug.depth], [rug.x, 0.341, rug.z], 0.022, cloth);
  const shade = contactShadows();
  shade(room, [2.52, 0.366, -3.29, 4.92, 1.97]);
  shade(room, [2.62, 0.366, -1.19, 1.98, 1.19]);
  shade(room, [5.03, 0.366, -0.06, 1.43, 1.21]);
  shade(room, [6.12, 0.322, -3.98, 1.12, 1.07]);
  // Low, upholstered modular sofa with separate seats and shaped throw pillows.
  softBox(room, [3.96, 0.18, 1.27], [2.52, 0.45, -3.52], 0.08, m.walnut);
  softBox(room, [4.24, 0.31, 1.43], [2.52, 0.63, -3.51], 0.145, upholstery);
  for (const x of [0.32, 4.72]) {
    softBox(room, [0.31, 0.41, 1.45], [x, 0.85, -3.48], 0.135, upholstery);
  }
  for (const x of [1.07, 2.52, 3.97]) {
    softBox(room, [1.41, 0.19, 1.16], [x, 0.83, -3.38], 0.093, upholstery);
    const back = softBox(room, [1.42, 0.51, 0.33], [x, 1.06, -3.96], 0.125, upholstery);
    back.rotation.x = -0.15;
  }
  for (const [x, turn, material] of [
    [0.58, -0.22, olive],
    [1.2, 0.15, clay],
    [3.92, 0.3, olive],
  ] as const) {
    const pillow = softBox(room, [0.48, 0.45, 0.22], [x + 0.27, 1.086, -3.67], 0.105, material);
    pillow.rotation.set(-0.31, turn, turn);
  }

  function slot(x: number, y: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    room.add(group);
    return group;
  }
  const table = slot(2.62, 0.365, -1.19);
  const tablePlaceholder = softBox(table, [1.52, 0.52, 0.81], [0, 0.26, 0], 0.06, travertine);
  assets.model('coffee-table', table, 1.63, Math.PI / 2, tablePlaceholder);
  const monograph = box(table, [0.32, 0.037, 0.22], [-0.34, 0.55, -0.04], m.walnut);
  monograph.rotation.y = -0.12;
  const pages = box(table, [0.307, 0.02, 0.21], [-0.339, 0.549, -0.032], plaster);
  pages.rotation.y = monograph.rotation.y;
  const bowl = new THREE.Mesh(
    new THREE.LatheGeometry(
      [
        [0, 0],
        [0.085, 0],
        [0.135, 0.047],
        [0.152, 0.082],
        [0.141, 0.082],
        [0.099, 0.042],
        [0, 0.015],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      28,
    ),
    clay,
  );
  bowl.position.set(0.26, 0.53, 0.078);
  table.add(bowl);
  const chair = slot(5.03, 0.365, -0.06);
  const chairPlaceholder = new THREE.Group();
  chair.add(chairPlaceholder);
  softBox(chairPlaceholder, [0.84, 0.17, 0.77], [0, 0.42, 0], 0.08, olive);
  softBox(chairPlaceholder, [0.84, 0.47, 0.17], [0, 0.65, -0.33], 0.08, olive);
  box(chairPlaceholder, [0.67, 0.35, 0.56], [0, 0.17, 0], m.walnut);
  assets.model('lounge-chair', chair, 1.15, -0.93, chairPlaceholder);
  const plantSlot = slot(6.12, floorY, -3.98);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.18, 0.37, 24), clay);
  pot.position.y = 0.185;
  plantSlot.add(pot);
  assets.model('potted-plant', plantSlot, 1.24, -0.85, pot);

  // Textured wall relief behind the living-room sofa.
  box(room, [2.3, 1.07, 0.035], [2.49, 1.87, -4.55], m.walnut);
  box(room, [2.23, 1.0, 0.046], [2.49, 1.87, -4.517], travertine);
  for (let i = 0; i < 18; i++) {
    const t = (i / 17) * Math.PI;
    const relief = softBox(
      room,
      [0.065, 0.29 + Math.sin(t) * 0.36, 0.028],
      [1.68 + i * 0.094, 1.8 + Math.sin(t) * 0.1, -4.477],
      0.012,
      i % 3 ? plaster : travertine,
    );
    relief.rotation.z = -0.31;
  }

  box(room, [6.1, 0.014, 0.021], [3.25, 2.759, -4.4], warmStrip);
  box(room, [0.026, 0.017, 6.1], [6.73, 2.756, -0.75], warmStrip);
  for (const x of [1.15, 3.55, 5.35]) {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.019, 24), warmStrip);
    plate.position.set(x, 2.752, -2.85);
    room.add(plate);
  }
  const lampShade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.34, 0.24, 40, 1, true),
    linen,
  );
  lampShade.position.set(5.6, 1.91, -3.35);
  room.add(lampShade);
  box(room, [0.024, 1.19, 0.024], [5.6, 1.01, -3.35], m.bronze, true);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), warmStrip);
  bulb.position.set(5.6, 1.86, -3.35);
  room.add(bulb);

  const lampLight = new THREE.PointLight('#ffb66d', 3.1, 6, 2);
  lampLight.position.set(5.6, 1.77, -3.31);
  room.add(lampLight);
  const bounce = new THREE.PointLight('#ffd1a0', 13.5, 14, 2);
  bounce.position.set(1.7, 1.98, -2.2);
  room.add(bounce);
  const key = new THREE.SpotLight('#ffe2ba', 29, 12, 0.91, 0.87, 2);
  key.position.set(3.45, 2.6, 0.79);
  key.target.position.set(2.8, 0.36, -2.23);
  key.castShadow = true;
  key.shadow.autoUpdate = false;
  key.shadow.mapSize.setScalar(mobile ? 768 : 1536);
  key.shadow.radius = 2;
  key.shadow.bias = -0.00015;
  key.shadow.normalBias = 0.022;
  room.add(key, key.target);
  const windowFill = new THREE.RectAreaLight('#c0d8f5', 1.65, 5.4, 2.2);
  windowFill.position.set(7.18, 1.55, -0.4);
  windowFill.lookAt(new THREE.Vector3(1.0, 1.35, -0.4));
  room.add(windowFill);

  furnishApartment(
    room,
    m,
    { timber, plaster, cloth, upholstery, travertine, glazing, warmStrip },
    shade,
    assets,
  );

  const doors = [-1, 1].map((side) => {
    const panel = new THREE.Group();
    box(panel, [3.26, 2.35, 0.023], [0, 1.54, ENTRY_Z], glazing);
    for (const x of [-1.645, 1.645]) box(panel, [0.057, 2.46, 0.078], [x, 1.53, ENTRY_Z], m.bronze);
    for (const y of [0.35, 2.72]) box(panel, [3.35, 0.056, 0.09], [0, y, ENTRY_Z], m.dark);
    room.add(panel);
    return { panel, side };
  });
  for (const x of [-5.1, 5.1]) {
    box(room, [3.4, 2.37, 0.026], [x, 1.54, ENTRY_Z], glazing);
    box(room, [0.082, 2.43, 0.09], [x / 1.5, 1.54, ENTRY_Z], m.dark);
  }
  for (const y of [0.35, 2.73]) box(room, [13.7, 0.048, 0.22], [0, y, ENTRY_Z], m.dark);
  for (const x of [-5.02, 5.02]) {
    box(room, [4.55, 0.94, 0.025], [x, 0.78, 6.03], glazing);
    box(room, [4.59, 0.046, 0.076], [x, 1.25, 6.03], m.bronze);
  }
  batchOpaque(room);

  let lastOpening = -1;
  return {
    group: room,
    shadow: key.shadow,
    update(progress: number) {
      const opening = range(progress, 0.855, 0.943);
      if (opening === lastOpening) return false;
      lastOpening = opening;
      doors.forEach(({ panel, side }) => {
        panel.position.x = side * (1.68 + opening * 3.25);
        panel.position.z = side === -1 ? 0.075 : 0;
      });
      return true;
    },
  };
}
