import * as THREE from 'three';
import { range } from '../../lib/timeline.mjs';
import { box, softBox } from './materials';
import { contactShadows } from './ContactShadows';
import { batchOpaque } from './batchOpaque';
import type { Materials } from './materials';
import type { SceneAssets } from './SceneAssets';

function scattering(seed: number) {
  const n = Math.sin(seed * 28.325 + 19.17) * 7537.12;
  return n - Math.floor(n);
}

function paving(
  street: THREE.Group,
  material: THREE.Material,
  bounds: [number, number, number, number],
  elevation: number,
  tileSize: number,
) {
  const [x, z, width, depth] = bounds;
  const geometry = new THREE.PlaneGeometry(width, depth);
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(
      i,
      (x + (uv.getX(i) - 0.5) * width) / tileSize,
      (-z + (uv.getY(i) - 0.5) * depth) / tileSize,
    );
  }
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, elevation, z);
  mesh.receiveShadow = true;
  street.add(mesh);
}

function vehicle(m: Materials, color: string) {
  const car = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.54,
    roughness: 0.21,
    clearcoat: 1,
    clearcoatRoughness: 0.09,
  });
  const tyre = new THREE.MeshStandardMaterial({ color: '#141617', roughness: 0.96 });
  const head = new THREE.MeshStandardMaterial({
    color: '#e8e5d5',
    emissive: '#fff2d1',
    emissiveIntensity: 4.7,
  });
  const tail = new THREE.MeshStandardMaterial({
    color: '#8f291a',
    emissive: '#ff3f20',
    emissiveIntensity: 2.75,
  });
  const cabin = m.facade.clone();
  cabin.color.set('#27313a');
  cabin.roughness = 0.18;

  softBox(car, [1.82, 0.47, 4.38], [0, 0.62, 0], 0.206, paint);
  softBox(car, [1.77, 0.24, 3.84], [0, 0.9, 0.017], 0.112, paint);
  softBox(car, [1.34, 0.15, 1.59], [0, 1.43, -0.17], 0.068, paint);
  const top = new THREE.Mesh(
    new THREE.BufferGeometry()
      .setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
          [
            -0.65, 1.4, 0.58, 0.65, 1.4, 0.58, 0.82, 1.0, 1.16, -0.82, 1.0, 1.16, -0.65, 1.4, -0.93,
            0.65, 1.4, -0.93, 0.8, 1.0, -1.43, -0.8, 1.0, -1.43,
          ],
          3,
        ),
      )
      .setIndex([0, 3, 2, 0, 2, 1, 4, 5, 6, 4, 6, 7, 0, 4, 7, 0, 7, 3, 1, 2, 6, 1, 6, 5]),
    cabin,
  );
  top.geometry.computeVertexNormals();
  car.add(top);
  for (const x of [-0.84, 0.84]) {
    for (const z of [-1.36, 1.38]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.335, 0.335, 0.197, 22), tyre);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.335, z);
      car.add(wheel);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.198, 0.198, 0.025, 16), m.bronze);
      rim.rotation.z = Math.PI / 2;
      rim.position.set(x * 1.127, 0.335, z);
      car.add(rim);
    }
    box(car, [0.07, 0.34, 0.044], [x * 0.866, 1.2, -0.06], paint);
    softBox(car, [0.17, 0.081, 0.21], [x * 1.095, 1.05, 0.64], 0.039, cabin);
    softBox(car, [0.44, 0.085, 0.065], [x * 0.73, 0.88, 2.147], 0.03, head);
    softBox(car, [0.48, 0.082, 0.07], [x * 0.73, 0.86, -2.148], 0.03, tail);
  }
  softBox(car, [1.1, 0.14, 0.078], [0, 0.67, 2.155], 0.037, m.dark);
  softBox(car, [1.2, 0.071, 0.092], [0, 0.53, -2.147], 0.028, m.dark);
  batchOpaque(car);
  return car;
}

function landscape(street: THREE.Group, mobile: boolean) {
  const rows = [
    [-31, 13.26, 1.04],
    [-20, 13.21, 1.13],
    [10.69, 12.68, 0.89],
    [13.62, 4.58, 0.87],
    [-20, 29.19, 0.93],
    [-34, 29.19, 0.97],
    [34, -5.55, 1.15],
    [34, -21.7, 1.02],
    [34, 10.0, 1.02],
  ];
  const leafCount = mobile ? 107 : 183;
  const leaves = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 1),
    new THREE.MeshStandardMaterial({ roughness: 0.99, color: '#ffffff', envMapIntensity: 0.48 }),
    rows.length * leafCount,
  );
  const trunk = new THREE.MeshStandardMaterial({ color: '#4d3f31', roughness: 0.96 });
  const bark = new THREE.CylinderGeometry(0.41, 0.73, 1, 8);
  const colors = ['#344635', '#465840', '#536643', '#667449', '#3d5140'].map(
    (c) => new THREE.Color(c),
  );
  const up = new THREE.Vector3(0, 1, 0);
  const dummy = new THREE.Object3D();
  const start = new THREE.Vector3(),
    finish = new THREE.Vector3(),
    direction = new THREE.Vector3();
  const branch = (a: THREE.Vector3, b: THREE.Vector3, thickness: number) => {
    const mesh = new THREE.Mesh(bark, trunk);
    direction.subVectors(b, a);
    mesh.position.copy(a).addScaledVector(direction, 0.5);
    mesh.quaternion.setFromUnitVectors(up, direction.clone().normalize());
    mesh.scale.set(thickness, direction.length(), thickness);
    mesh.castShadow = !mobile;
    street.add(mesh);
  };
  rows.forEach(([x, z, scale], index) => {
    start.set(x, 0.14, z);
    finish.set(x + 0.13, 3.67 * scale, z + 0.14);
    branch(start, finish, 0.235 * scale);
    for (let j = 0; j < 5; j++) {
      const angle = j * 2.4 + index;
      start.set(x + 0.09, 2.34 * scale + (j % 2) * 0.38, z + 0.07);
      finish.set(
        x + Math.cos(angle) * 1.24 * scale,
        (3.24 + (j % 3) * 0.39) * scale,
        z + Math.sin(angle) * 1.1 * scale,
      );
      branch(start, finish, 0.113 * scale);
    }
    const earth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.94, 0.97, 0.08, 18),
      new THREE.MeshStandardMaterial({ color: '#373831', roughness: 1 }),
    );
    earth.position.set(x, 0.145, z);
    street.add(earth);
    for (let j = 0; j < leafCount; j++) {
      const seed = index * 442 + j * 17;
      const angle = scattering(seed) * Math.PI * 2;
      const radius = Math.sqrt(scattering(seed + 1)) * 1.78 * scale;
      const size = (0.14 + scattering(seed + 2) * 0.27) * scale;
      dummy.position.set(
        x + Math.cos(angle) * radius,
        (3.32 + scattering(seed + 3) * 1.38 - radius * 0.22) * scale,
        z + Math.sin(angle) * radius * 0.84,
      );
      dummy.rotation.set(angle * 0.763, angle, scattering(seed + 4));
      dummy.scale.set(size * 1.38, size * 0.72, size * 0.92);
      dummy.updateMatrix();
      const slot = index * leafCount + j;
      leaves.setColorAt(slot, colors[Math.floor(scattering(seed + 9) * colors.length)]);
      leaves.setMatrixAt(slot, dummy.matrix);
    }
  });
  leaves.castShadow = !mobile;
  leaves.receiveShadow = true;
  street.add(leaves);
}

export function createStreet(m: Materials, assets: SceneAssets, mobile: boolean) {
  const street = new THREE.Group();
  const asphalt = new THREE.MeshPhysicalMaterial({
    color: '#8a9091',
    roughness: 0.81,
    clearcoat: 0.31,
    clearcoatRoughness: 0.36,
    envMapIntensity: 0.85,
    map: assets.texture('street-asphalt-color', true, [1, 1]),
    normalMap: assets.texture('street-asphalt-normal', false, [1, 1]),
    normalScale: new THREE.Vector2(0.35, 0.35),
    roughnessMap: assets.texture('street-asphalt-rough', false, [1, 1]),
  });
  const sidewalk = new THREE.MeshStandardMaterial({
    color: '#c4baa5',
    roughness: 0.79,
    map: assets.texture('street-paving-color', true, [1, 1]),
    normalMap: assets.texture('street-paving-normal', false, [1, 1]),
    normalScale: new THREE.Vector2(0.47, 0.47),
  });
  const curbstone = new THREE.MeshStandardMaterial({ color: '#9e998c', roughness: 0.86 });
  const painted = new THREE.MeshStandardMaterial({ color: '#c7c8bd', roughness: 0.81 });
  const lane = new THREE.MeshStandardMaterial({ color: '#bd9e59', roughness: 0.76 });
  const roadY = 0.002;
  paving(street, asphalt, [-12, 21.46, 406, 12.42], roadY, 2.3);
  paving(street, asphalt, [22.3, -99.42, 11.58, 229.3], roadY, 2.3);
  paving(street, asphalt, [22.3, 105.78, 11.58, 156.24], roadY, 2.3);

  const sidewalks = [
    [-99.0, 13.22, 231.7, 4.34],
    [109.8, 13.22, 163.2, 4.34],
    [-99.0, 29.61, 231.7, 3.83],
    [109.8, 29.61, 163.2, 3.83],
    [14.9, -99.43, 3.25, 229.3],
    [29.88, -99.43, 3.57, 229.3],
    [0, 10.0, 25.5, 2.1],
  ] as const;
  for (const [x, z, w, d] of sidewalks) {
    box(street, [w, 0.13, d], [x, 0.015, z], curbstone);
    paving(street, sidewalk, [x, z, w - 0.15, d - 0.15], 0.082, 2.5);
  }
  for (let n = -18; n <= 13; n++) {
    const x = n * 4.27;
    if (x > 12 && x < 31) continue;
    box(street, [2.16, 0.006, 0.083], [x, 0.008, 21.12], lane);
    box(street, [2.16, 0.006, 0.083], [x, 0.008, 21.32], lane);
  }
  for (let n = -16; n <= 2; n++) {
    box(street, [0.09, 0.006, 1.56], [22.37, 0.008, n * 4.27], painted);
  }
  for (let n = 0; n < 8; n++) {
    box(street, [2.68, 0.008, 0.37], [13.65, 0.009, 16.32 + n * 1.38], painted);
    box(street, [0.39, 0.008, 2.51], [17.48 + n * 1.34, 0.01, 12.98], painted);
  }
  box(street, [0.19, 0.006, 5.1], [11.68, 0.008, 18.26], painted);

  const iron = new THREE.MeshStandardMaterial({
    color: '#2e3333',
    metalness: 0.67,
    roughness: 0.44,
  });
  for (const x of [-23.83, 6.52, 42.42]) {
    box(street, [0.48, 0.015, 0.77], [x, 0.009, 15.75], iron);
    for (let i = -3; i <= 3; i++)
      box(street, [0.385, 0.015, 0.025], [x, 0.018, 15.75 + i * 0.098], m.dark);
  }
  const brassLamp = new THREE.MeshStandardMaterial({
    color: '#ffddb6',
    emissive: '#ffc084',
    emissiveIntensity: 5.2,
  });
  const lampHousing = new THREE.MeshStandardMaterial({
    color: '#313b3a',
    roughness: 0.48,
    metalness: 0.4,
  });
  for (const [x, z] of [
    [-43, 14.08],
    [-23, 14.08],
    [-7, 14.08],
    [11.71, 14.08],
    [30.72, 12.87],
    [30.72, -9.7],
    [49, 14.08],
    [-12, 28.7],
    [7.5, 28.7],
  ]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.071, 4.91, 12), lampHousing);
    pole.position.set(x, 2.54, z);
    street.add(pole);
    box(street, [0.12, 0.13, 0.24], [x, 0.134, z], m.bronze);
    box(street, [0.055, 0.057, 0.8], [x, 4.94, z + 0.38], lampHousing);
    softBox(street, [0.19, 0.097, 0.43], [x, 4.92, z + 0.8], 0.037, lampHousing);
    box(street, [0.14, 0.028, 0.36], [x, 4.86, z + 0.8], brassLamp);
    if (x === -7 || x === 11.71 || x === 7.5) {
      const light = new THREE.PointLight('#ffbd79', 12, 11.2);
      light.position.set(x, 4.73, z + 0.79);
      street.add(light);
    }
  }
  const benchBase = new THREE.MeshStandardMaterial({ color: '#494b42', roughness: 0.58 });
  for (const x of [-10.69, 4.43]) {
    for (const offset of [-0.68, 0.68])
      box(street, [0.09, 0.37, 0.4], [x + offset, 0.267, 12.29], benchBase);
    for (let k = 0; k < 4; k++)
      box(street, [1.72, 0.065, 0.087], [x, 0.47, 12.07 + k * 0.113], m.walnut);
  }
  for (let i = 0; i <= 5; i++) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.053, 0.069, 0.77, 12), m.dark);
    post.position.set(-5.36 + i * 2.12, 0.477, 11.6);
    street.add(post);
    box(street, [0.093, 0.04, 0.092], [post.position.x, 0.845, 11.6], m.bronze);
  }
  landscape(street, mobile);

  const westbound = vehicle(m, '#363c40');
  const eastbound = vehicle(m, '#6f7778');
  const shade = contactShadows();
  shade(westbound, [0, 0.003, 0, 2.4, 4.87]);
  shade(eastbound, [0, 0.003, 0, 2.4, 4.87]);
  westbound.rotation.y = -Math.PI / 2;
  eastbound.rotation.y = Math.PI / 2;
  street.add(westbound, eastbound);
  batchOpaque(street);
  return {
    group: street,
    update(progress: number) {
      westbound.position.set(5.5 - range(progress, 0, 0.4) * 58, 0.01, 23.7);
      eastbound.position.set(-16.8 + range(progress, 0, 0.52) * 69, 0.01, 18.05);
    },
  };
}
