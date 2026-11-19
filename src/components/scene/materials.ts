import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createMaterials() {
  return {
    stone: new THREE.MeshStandardMaterial({ color: '#c3b5a0', roughness: 0.68 }),
    dark: new THREE.MeshStandardMaterial({ color: '#20282a', roughness: 0.55, metalness: 0.24 }),
    bronze: new THREE.MeshStandardMaterial({ color: '#8d623d', roughness: 0.31, metalness: 0.73 }),
    facade: new THREE.MeshPhysicalMaterial({
      color: '#263641',
      metalness: 0.62,
      roughness: 0.18,
      clearcoat: 0.83,
      clearcoatRoughness: 0.13,
      envMapIntensity: 1.6,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: '#7c99a0',
      metalness: 0.26,
      roughness: 0.1,
      transparent: true,
      opacity: 0.19,
      depthWrite: false,
      clearcoat: 0.7,
      envMapIntensity: 1,
    }),
    glow: new THREE.MeshStandardMaterial({
      color: '#75624c',
      emissive: '#ffc487',
      emissiveIntensity: 0,
      roughness: 0.7,
    }),
    ivory: new THREE.MeshStandardMaterial({ color: '#ded5c4', roughness: 0.94 }),
    walnut: new THREE.MeshStandardMaterial({ color: '#463024', roughness: 0.8 }),
    rug: new THREE.MeshStandardMaterial({ color: '#b9a98e', roughness: 1 }),
    leaves: new THREE.MeshStandardMaterial({ color: '#394c35', roughness: 0.94 }),
    pool: new THREE.MeshPhysicalMaterial({
      color: '#365f62',
      metalness: 0.25,
      roughness: 0.1,
      clearcoat: 1,
    }),
  };
}
export type Materials = ReturnType<typeof createMaterials>;

export function box(
  parent: THREE.Object3D,
  size: [number, number, number],
  position: [number, number, number],
  material: THREE.Material | THREE.Material[],
  castShadow = false,
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function softBox(
  parent: THREE.Object3D,
  size: [number, number, number],
  position: [number, number, number],
  radius: number,
  material: THREE.Material,
) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 3, radius), material);
  mesh.position.set(...position);
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function roundedSlab(width: number, depth: number, height: number, radius: number) {
  const shape = new THREE.Shape();
  const x = -width / 2,
    z = -depth / 2;
  shape.moveTo(x + radius, z);
  shape.lineTo(x + width - radius, z);
  shape.quadraticCurveTo(x + width, z, x + width, z + radius);
  shape.lineTo(x + width, z + depth - radius);
  shape.quadraticCurveTo(x + width, z + depth, x + width - radius, z + depth);
  shape.lineTo(x + radius, z + depth);
  shape.quadraticCurveTo(x, z + depth, x, z + depth - radius);
  shape.lineTo(x, z + radius);
  shape.quadraticCurveTo(x, z, x + radius, z);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.045,
    bevelSegments: 2,
    curveSegments: 8,
  });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}
