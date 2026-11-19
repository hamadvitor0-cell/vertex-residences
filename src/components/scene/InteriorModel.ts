import * as THREE from 'three';
import { INTERIOR_Y, range } from '../../lib/timeline.mjs';
import { box, softBox } from './materials';
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
  glazing.opacity = 0.12;

  box(room, [14.7, 0.08, 9.9], [0, floorY - 0.04, 0], floor);
  box(room, [14.7, 0.11, 1.2], [0, floorY - 0.03, 5.55], travertine);
  const ceiling = new THREE.MeshStandardMaterial({ color: '#c0b7a6', roughness: 0.92 });
  box(room, [14.8, 0.14, 10.1], [0, 2.84, -0.02], ceiling);
  box(room, [14.8, 2.52, 0.16], [0, 1.55, -4.82], m.dark, true);
  box(room, [0.14, 2.52, 9.8], [-7.3, 1.55, 0], plaster, true);
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
  curtain(-5.72, 4.71, 1.03, 0);
  curtain(5.72, 4.71, 1.03, 0);

  softBox(room, [6.05, 0.044, 4.5], [2.43, 0.341, -1.15], 0.022, cloth);
  const contact = document.createElement('canvas');
  contact.width = contact.height = 64;
  const context = contact.getContext('2d')!;
  const falloff = context.createRadialGradient(32, 32, 3, 32, 32, 31);
  falloff.addColorStop(0, 'rgba(38, 27, 20, .73)');
  falloff.addColorStop(0.55, 'rgba(38, 27, 20, .39)');
  falloff.addColorStop(1, 'rgba(38, 27, 20, 0)');
  context.fillStyle = falloff;
  context.fillRect(0, 0, 64, 64);
  const shadowMap = new THREE.CanvasTexture(contact);
  shadowMap.colorSpace = THREE.SRGBColorSpace;
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowMap,
    transparent: true,
    depthWrite: false,
  });
  for (const [x, y, z, w, d] of [
    [2.26, 0.366, -3.29, 4.86, 1.98],
    [2.62, 0.366, -1.19, 1.98, 1.19],
    [5.03, 0.366, -0.06, 1.43, 1.21],
    [6.12, 0.322, -3.98, 1.12, 1.07],
  ]) {
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(w, d), shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(x, y, z);
    room.add(shadow);
  }
  // Low, upholstered modular sofa with separate seats and shaped throw pillows.
  softBox(room, [3.96, 0.18, 1.27], [2.25, 0.45, -3.52], 0.08, m.walnut);
  softBox(room, [4.24, 0.31, 1.43], [2.25, 0.63, -3.51], 0.145, upholstery);
  for (const x of [0.05, 4.45]) {
    softBox(room, [0.31, 0.41, 1.45], [x, 0.85, -3.48], 0.135, upholstery);
  }
  for (const x of [0.8, 2.25, 3.7]) {
    softBox(room, [1.41, 0.19, 1.16], [x, 0.83, -3.38], 0.093, upholstery);
    const back = softBox(room, [1.42, 0.51, 0.33], [x, 1.06, -3.96], 0.125, upholstery);
    back.rotation.x = -0.15;
  }
  for (const [x, turn, material] of [
    [0.58, -0.22, olive],
    [1.2, 0.15, clay],
    [3.92, 0.3, olive],
  ] as const) {
    const pillow = softBox(room, [0.48, 0.45, 0.22], [x, 1.086, -3.67], 0.105, material);
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

  // A shallow bookcase and three-dimensional wall relief give the back of the room depth.
  box(room, [0.95, 2.4, 0.4], [-0.72, 1.52, -4.48], m.walnut);
  box(room, [0.81, 2.13, 0.31], [-0.72, 1.65, -4.3], m.dark);
  for (let row = 0; row < 4; row++) {
    const y = 0.58 + row * 0.53;
    box(room, [0.93, 0.049, 0.42], [-0.72, y, -4.44], timber);
    box(room, [0.77, 0.014, 0.018], [-0.72, y + 0.02, -4.22], warmStrip);
    for (let i = 0; i < 4; i++) {
      const h = 0.19 + ((i * 3 + row) % 5) * 0.029;
      box(
        room,
        [0.043, h, 0.105],
        [-1.02 + i * 0.056 + (row % 2) * 0.31, y + 0.025 + h / 2, -4.29],
        [plaster, olive, clay, m.stone][i],
      );
    }
  }
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

  const sideboard = box(room, [2.54, 0.5, 0.52], [-2.85, 0.68, -4.25], timber, true);
  sideboard.receiveShadow = true;
  for (const x of [-4.03, -1.67]) box(room, [0.037, 0.18, 0.39], [x, 0.41, -4.25], m.dark);
  const vessel = new THREE.Mesh(
    new THREE.LatheGeometry(
      [
        [0, 0],
        [0.13, 0],
        [0.18, 0.17],
        [0.14, 0.29],
        [0.065, 0.34],
        [0.07, 0.44],
        [0.048, 0.44],
        [0.042, 0.34],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      36,
    ),
    clay,
  );
  vessel.position.set(-3.03, 0.94, -4.19);
  room.add(vessel);

  box(room, [12.6, 0.014, 0.021], [0, 2.759, -4.4], warmStrip);
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
  const key = new THREE.SpotLight('#ffdda9', 31, 13, 0.96, 0.84, 2);
  key.position.set(3.45, 2.6, 0.79);
  key.target.position.set(2.8, 0.36, -2.23);
  key.castShadow = !mobile;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.00015;
  key.shadow.normalBias = 0.022;
  room.add(key, key.target);
  const windowFill = new THREE.PointLight('#a4c6f5', 8.5, 12, 2);
  windowFill.position.set(7.35, 1.71, 0.22);
  room.add(windowFill);

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

  return {
    group: room,
    update(progress: number) {
      const opening = range(progress, 0.855, 0.943);
      doors.forEach(({ panel, side }) => {
        panel.position.x = side * (1.68 + opening * 3.25);
        panel.position.z = side === -1 ? 0.075 : 0;
      });
    },
  };
}
