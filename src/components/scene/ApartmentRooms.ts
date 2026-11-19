import * as THREE from 'three';
import {
  BATH_DOOR_Z,
  BATH_EAST_X,
  BATH_WALL_THICKNESS,
  BATH_X,
  PARTITION_X,
  bedrooms,
} from '../../lib/apartmentTour.mjs';
import { box, softBox } from './materials';
import { batchOpaque } from './batchOpaque';
import type { Materials } from './materials';
import type { contactShadows } from './ContactShadows';
import type { SceneAssets } from './SceneAssets';

type Finishes = {
  timber: THREE.Material;
  plaster: THREE.MeshStandardMaterial;
  cloth: THREE.Material;
  upholstery: THREE.Material;
  travertine: THREE.Material;
  glazing: THREE.Material;
  warmStrip: THREE.Material;
};

const wallHeight = 2.45;
const floorY = 0.32;

function quilt(width: number, length: number, overhang: number, material: THREE.Material) {
  const shape = new THREE.PlaneGeometry(width + 0.27, length + 0.1, 36, 24);
  shape.rotateX(-Math.PI / 2);
  const points = shape.attributes.position;
  for (let i = 0; i < points.count; i++) {
    const x = points.getX(i);
    const z = points.getZ(i);
    const side = THREE.MathUtils.smoothstep(Math.abs(x), width * 0.43, width * 0.5 + 0.12);
    const foot = THREE.MathUtils.smoothstep(-z, length * 0.4, length * 0.54);
    const wrinkle = Math.sin(x * 19 + z * 3.5) * 0.014 + Math.cos(z * 13 + x * 2.1) * 0.013;
    points.setY(i, wrinkle * (0.44 + side * 1.28) - Math.max(side, foot * 0.5) * overhang);
    points.setX(i, x + Math.sin(z * 10 + x) * side * 0.019);
  }
  shape.computeVertexNormals();
  const cloth = new THREE.Mesh(shape, material);
  cloth.castShadow = cloth.receiveShadow = true;
  return cloth;
}

export function furnishApartment(
  apartment: THREE.Group,
  m: Materials,
  f: Finishes,
  shade: ReturnType<typeof contactShadows>,
  assets: SceneAssets,
) {
  const linen = new THREE.MeshStandardMaterial({ color: '#e9e1d2', roughness: 0.95 });
  const terracotta = new THREE.MeshStandardMaterial({ color: '#945643', roughness: 0.9 });
  const moss = new THREE.MeshStandardMaterial({ color: '#656f59', roughness: 0.89 });
  const blue = new THREE.MeshStandardMaterial({ color: '#526575', roughness: 0.88 });
  const duvet = f.upholstery.clone();
  duvet.side = THREE.DoubleSide;
  for (const material of [terracotta, moss, blue]) material.side = THREE.DoubleSide;
  const ceramic = new THREE.MeshPhysicalMaterial({
    color: '#ece8e0',
    roughness: 0.26,
    clearcoat: 0.56,
  });
  const stainless = new THREE.MeshStandardMaterial({
    color: '#a2a5a3',
    metalness: 0.82,
    roughness: 0.26,
  });

  function light(color: string, intensity: number, reach: number, x: number, y: number, z: number) {
    const lamp = new THREE.PointLight(color, intensity, reach);
    lamp.position.set(x, y, z);
    apartment.add(lamp);
  }

  function divider(
    home: THREE.Group,
    x: number,
    minZ: number,
    maxZ: number,
    doorZ: number,
    width: number,
  ) {
    for (const [a, b] of [
      [minZ, doorZ - width / 2],
      [doorZ + width / 2, maxZ],
    ]) {
      box(
        home,
        [0.13, wallHeight, b - a],
        [x, floorY + wallHeight / 2, (a + b) / 2],
        f.plaster,
        true,
      );
    }
    box(home, [0.13, 0.35, width], [x, 2.58, doorZ], f.plaster, true);
    for (const side of [-1, 1]) {
      box(home, [0.155, 2.12, 0.043], [x, 1.37, doorZ + (side * width) / 2], m.walnut);
    }
    box(home, [0.16, 0.045, width + 0.075], [x, 2.435, doorZ], m.walnut);
  }

  // The three bedrooms open onto a single hall. Door gaps are shared with the camera route.
  bedrooms.forEach(({ minZ, maxZ, doorZ, bedX, bedWidth: width, desk }, index) => {
    const home = new THREE.Group();
    apartment.add(home);
    const center = (minZ + maxZ) / 2;
    divider(home, PARTITION_X, minZ, maxZ, doorZ, 1.06);
    if (index > 0) box(home, [4.42, wallHeight, 0.12], [-5.13, 1.54, minZ], f.plaster, true);

    box(home, [0.14, 0.59, maxZ - minZ], [-7.26, 0.61, center], f.plaster, true);
    box(home, [0.08, 1.8, maxZ - minZ - 0.15], [-7.24, 1.79, center], f.glazing);
    for (const z of [minZ + 0.08, center, maxZ - 0.08]) {
      box(home, [0.1, 1.84, 0.065], [-7.22, 1.78, z], m.dark);
    }
    for (const y of [0.88, 2.7]) box(home, [0.1, 0.075, maxZ - minZ], [-7.2, y, center], m.dark);
    box(home, [0.19, 0.059, maxZ - minZ], [-7.16, 0.84, center], f.travertine);
    for (const end of [minZ + 0.22, maxZ - 0.22]) {
      for (let i = 0; i < 6; i++) {
        const fold = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.055, 2.38, 9), linen);
        fold.position.set(-7.1 + Math.cos(i * 1.96) * 0.039, 1.53, end + (i - 2.5) * 0.069);
        home.add(fold);
      }
    }

    const bedZ = maxZ - 1.14;
    const color = [terracotta, moss, blue][index];
    softBox(home, [width + 0.11, 0.27, 2.14], [bedX, 0.49, bedZ], 0.075, f.timber);
    softBox(home, [width, 0.22, 2.09], [bedX, 0.68, bedZ - 0.01], 0.098, linen);
    const duvetMesh = quilt(width, 1.49, 0.18, duvet);
    duvetMesh.position.set(bedX, 0.858, bedZ - 0.27);
    home.add(duvetMesh);
    const throwMesh = quilt(width - 0.045, 0.46, 0.135, color);
    throwMesh.position.set(bedX + 0.035, 0.887, bedZ - 0.63);
    home.add(throwMesh);
    softBox(home, [width + 0.16, 0.84, 0.19], [bedX, 0.84, bedZ + 1.015], 0.088, f.upholstery);
    const pillows = index === 0 ? [-0.46, 0.46] : [0];
    for (const offset of pillows) {
      const pillow = softBox(
        home,
        [0.67, 0.21, 0.39],
        [bedX + offset, 0.88, bedZ + 0.68],
        0.095,
        linen,
      );
      pillow.rotation.x = -0.26;
    }
    softBox(home, [width + 0.68, 0.024, 2.57], [bedX, 0.334, bedZ - 0.21], 0.012, f.cloth);
    shade(home, [bedX, 0.347, bedZ, width + 0.55, 2.6]);

    const nightstands =
      index === 0 ? [bedX - 1.23, bedX + 1.23] : [index === 2 ? bedX - 1.05 : bedX + 0.82];
    for (const x of nightstands) {
      softBox(home, [0.43, 0.42, 0.42], [x, 0.57, bedZ + 0.78], 0.023, f.timber);
      box(home, [0.31, 0.021, 0.016], [x, 0.62, bedZ + 0.56], m.bronze);
      box(home, [0.026, 0.27, 0.026], [x, 0.9, bedZ + 0.78], m.bronze);
      const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.096, 0.155, 0.17, 24), f.warmStrip);
      shade.position.set(x, 1.09, bedZ + 0.78);
      home.add(shade);
    }

    const wallZ = maxZ - 0.096;
    if (index === 2) {
      box(home, [2.17, 2.45, 0.13], [-6.16, 1.545, maxZ - 0.02], f.plaster, true);
      box(home, [2.11, 0.044, 0.15], [-6.16, 0.38, maxZ - 0.085], m.walnut);
    }
    box(home, [width + 0.44, 1.14, 0.055], [bedX, 1.18, wallZ], f.timber);
    box(home, [width + 0.43, 0.017, 0.04], [bedX, 1.77, wallZ - 0.038], f.warmStrip);
    const picture = new THREE.Group();
    const pictureWidth = index === 0 ? 0.53 : 0.43;
    picture.position.set(bedX, 1.84, wallZ - 0.035);
    home.add(picture);
    const artPlaceholder = box(picture, [pictureWidth, 0.57, 0.025], [0, 0.285, 0], m.walnut);
    assets.model('picture-frame', picture, pictureWidth, Math.PI, artPlaceholder);

    if (desk) {
      const deskZ = maxZ - desk.fromWall;
      const workstation = new THREE.Group();
      workstation.position.set(desk.x, floorY, deskZ);
      home.add(workstation);
      const table = new THREE.Group();
      workstation.add(table);
      box(table, [desk.width, 0.062, 0.61], [0, 0.72, 0], f.timber);
      for (const x of [-desk.width * 0.4, desk.width * 0.4])
        box(table, [0.044, 0.68, 0.5], [x, 0.34, 0], m.dark);
      box(table, [0.44, 0.25, 0.032], [0.06, 0.95, 0.14], m.dark);
      box(table, [0.19, 0.027, 0.16], [0.06, 0.77, 0.11], stainless);
      batchOpaque(table);
      assets.model('office-desk', workstation, desk.width, Math.PI, table);

      const chair = new THREE.Group();
      chair.position.set(desk.x + 0.08, floorY, deskZ - 0.65);
      chair.rotation.y = index === 2 ? 0.22 : -0.31;
      home.add(chair);
      softBox(chair, [0.46, 0.085, 0.43], [0, 0.46, 0], 0.04, color);
      const backrest = softBox(chair, [0.43, 0.38, 0.078], [0, 0.722, -0.2], 0.037, color);
      backrest.rotation.x = 0.12;
      for (const x of [-0.177, 0.177]) {
        box(chair, [0.025, 0.028, 0.422], [x, 0.026, -0.004], m.dark);
        box(chair, [0.025, 0.42, 0.028], [x, 0.221, 0.18], m.dark);
        box(chair, [0.025, 0.22, 0.028], [x, 0.51, -0.184], m.dark);
      }
      batchOpaque(chair);
      shade(home, [desk.x, floorY + 0.003, deskZ - 0.3, desk.width, 1.26]);
      if (index === 1) {
        box(home, [1.38, 2.21, 0.49], [-4.07, 1.425, minZ + 0.29], f.timber);
        box(home, [0.014, 2.09, 0.021], [-4.07, 1.425, minZ + 0.543], m.dark);
        for (const x of [-4.13, -4.01]) {
          box(home, [0.024, 0.23, 0.031], [x, 1.21, minZ + 0.56], m.bronze);
        }
      }
    } else {
      box(home, [1.15, 0.035, 0.87], [-5.38, 2.72, center], f.warmStrip);
    }
    light('#ffe0b7', index === 0 ? 13.8 : 12.0, 4.2, -5.12, 2.35, center - 0.19);
    light('#ffb981', 4.8, 2.25, bedX - 0.19, 1.68, bedZ + 0.53);
    light('#adcbfa', 6.4, 4.15, -7.08, 1.93, center);
    batchOpaque(home);
  });

  // Bath opposite the primary bedroom, with a recessed shower behind its own glass.
  const home = new THREE.Group();
  apartment.add(home);
  const bathEnd = -1.59;
  const bathRear = -4.74;
  const bathEast = BATH_EAST_X;
  const bathCenter = (BATH_X + bathEast) / 2;
  const hallPlaster = f.plaster.clone();
  hallPlaster.emissive.set('#b79a76');
  hallPlaster.emissiveIntensity = 0.18;
  divider(home, BATH_X, bathRear, bathEnd, BATH_DOOR_Z, 1.02);
  box(
    home,
    [BATH_WALL_THICKNESS, wallHeight, bathEnd - bathRear],
    [bathEast, 1.54, (bathRear + bathEnd) / 2],
    [hallPlaster, f.travertine, hallPlaster, hallPlaster, hallPlaster, hallPlaster],
    true,
  );
  box(
    home,
    [1.54, wallHeight, 0.12],
    [bathCenter, 1.54, bathEnd],
    [hallPlaster, hallPlaster, hallPlaster, hallPlaster, hallPlaster, f.travertine],
    true,
  );
  box(
    home,
    [0.018, 0.075, bathEnd - bathRear + 0.065],
    [bathEast + 0.066, floorY + 0.036, (bathRear + bathEnd) / 2],
    f.timber,
  );
  box(home, [1.554, 0.075, 0.018], [bathCenter, floorY + 0.036, bathEnd + 0.061], f.timber);
  box(
    home,
    [1.51, 0.032, bathEnd - bathRear],
    [bathCenter, 0.344, (bathRear + bathEnd) / 2],
    f.travertine,
  );
  for (let z = -4.26; z < -1.95; z += 0.45) {
    box(home, [1.46, 0.005, 0.009], [bathCenter, 0.362, z], m.stone);
  }
  softBox(home, [0.49, 0.36, 0.83], [-0.21, 0.96, -3.68], 0.038, f.timber);
  softBox(home, [0.54, 0.065, 0.9], [-0.23, 1.17, -3.68], 0.024, ceramic);
  const sink = new THREE.Mesh(
    new THREE.LatheGeometry(
      [
        [0, 0.012],
        [0.13, 0.012],
        [0.173, 0.08],
        [0.175, 0.093],
        [0.157, 0.093],
        [0.127, 0.041],
        [0.025, 0.025],
        [0, 0.025],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      32,
    ),
    ceramic,
  );
  sink.position.set(-0.27, 1.206, -3.68);
  home.add(sink);
  box(home, [0.033, 0.155, 0.034], [-0.083, 1.285, -3.68], stainless);
  box(home, [0.11, 0.025, 0.03], [-0.13, 1.354, -3.68], stainless);
  const mirror = new THREE.MeshPhysicalMaterial({
    color: '#8a9a98',
    metalness: 0.92,
    roughness: 0.09,
  });
  softBox(home, [0.03, 0.72, 0.75], [0.038, 1.9, -3.68], 0.012, mirror);
  box(home, [0.028, 0.025, 0.73], [0.011, 2.28, -3.68], f.warmStrip);
  box(home, [0.68, 0.025, 0.017], [-0.83, 1.42, -4.5], m.bronze);
  softBox(home, [0.46, 0.55, 0.028], [-0.85, 1.15, -4.5], 0.013, linen);
  box(home, [0.88, 1.96, 0.023], [-0.32, 1.4, -2.46], f.glazing);
  box(home, [0.89, 0.044, 0.047], [-0.32, 2.39, -2.46], m.bronze);
  box(home, [0.035, 2.04, 0.036], [-0.76, 1.39, -2.46], m.bronze);
  box(home, [0.029, 0.88, 0.033], [-0.61, 1.45, -1.683], stainless);
  box(home, [0.028, 0.029, 0.2], [-0.61, 1.91, -1.77], stainless);
  box(home, [0.23, 0.035, 0.17], [-0.61, 1.88, -1.889], stainless);
  box(home, [0.42, 0.25, 0.018], [-0.36, 1.135, -1.651], m.dark);
  box(home, [0.44, 0.025, 0.15], [-0.36, 1.01, -1.72], f.travertine);
  for (const x of [-0.576, -0.144]) {
    box(home, [0.021, 0.25, 0.151], [x, 1.135, -1.72], f.travertine);
  }
  box(home, [0.44, 0.023, 0.15], [-0.36, 1.26, -1.72], f.travertine);
  box(home, [0.055, 0.12, 0.057], [-0.32, 1.082, -1.718], moss);
  light('#fff0d6', 9.4, 2.9, -0.75, 2.53, -3.08);
  for (const z of [-3.15, 0, 2.75]) {
    box(home, [0.57, 0.018, 0.075], [-2.18, 2.755, z], f.warmStrip);
    light('#ffc58c', 4.3, 2.75, -2.18, 2.57, z);
  }

  // Kitchen in the open social area beside the balcony.
  const kitchen = new THREE.Group();
  apartment.add(kitchen);
  shade(kitchen, [4.6, 0.323, 3.49, 1.91, 2.53]);
  shade(kitchen, [6.65, 0.322, 3.72, 1.31, 2.79]);
  box(kitchen, [0.61, 0.75, 2.54], [6.72, 0.7, 3.44], f.timber);
  box(kitchen, [0.69, 0.075, 2.63], [6.69, 1.111, 3.44], f.travertine);
  for (const z of [2.49, 3.1, 3.73, 4.37]) {
    box(kitchen, [0.028, 0.68, 0.55], [6.399, 0.72, z], f.timber);
    box(kitchen, [0.052, 0.028, 0.22], [6.371, 0.96, z], m.bronze);
  }
  box(kitchen, [0.48, 0.023, 0.48], [6.68, 1.156, 2.77], m.dark);
  for (const x of [6.55, 6.79])
    for (const z of [2.65, 2.88]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.071, 0.006, 6, 18), stainless);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, 1.17, z);
      kitchen.add(ring);
    }
  box(kitchen, [0.39, 0.019, 0.44], [6.66, 1.16, 3.93], stainless);
  box(kitchen, [0.29, 0.022, 0.33], [6.66, 1.172, 3.93], m.dark);
  box(kitchen, [0.033, 0.18, 0.032], [6.882, 1.25, 3.94], stainless);
  box(kitchen, [0.15, 0.027, 0.025], [6.83, 1.33, 3.94], stainless);
  softBox(kitchen, [0.93, 0.82, 1.82], [4.6, 0.75, 3.49], 0.061, f.timber);
  softBox(kitchen, [1.12, 0.085, 2.05], [4.56, 1.2, 3.49], 0.039, f.travertine);
  box(kitchen, [0.055, 0.06, 1.51], [4.071, 1.146, 3.49], f.warmStrip);
  softBox(kitchen, [0.31, 0.025, 0.39], [4.47, 1.253, 3.14], 0.011, f.timber);
  const fruit = new THREE.SphereGeometry(0.062, 12, 8);
  for (let i = 0; i < 3; i++) {
    const lime = new THREE.Mesh(fruit, moss);
    lime.position.set(4.42 + i * 0.069, 1.318, 3.12 + (i % 2) * 0.072);
    kitchen.add(lime);
  }
  for (const z of [3.05, 3.9]) {
    softBox(kitchen, [0.34, 0.065, 0.35], [3.69, 0.921, z], 0.029, f.upholstery);
    box(kitchen, [0.039, 0.54, 0.041], [3.69, 0.61, z], m.bronze);
    box(kitchen, [0.29, 0.045, 0.32], [3.69, 0.341, z], m.dark);
    box(kitchen, [0.021, 0.52, 0.022], [4.56, 2.49, z], m.bronze);
    const pendant = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.17, 0.17, 22), f.warmStrip);
    pendant.position.set(4.56, 2.16, z);
    kitchen.add(pendant);
  }
  light('#ffcb95', 18.7, 4.9, 4.5, 2.3, 3.66);
  batchOpaque(home);
  batchOpaque(kitchen);
}
