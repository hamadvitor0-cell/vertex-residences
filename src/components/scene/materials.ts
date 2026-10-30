import * as THREE from 'three';

export function createMaterials() {
  return {
    stone: new THREE.MeshStandardMaterial({ color: '#aaa397', roughness: 0.72, metalness: 0.08 }),
    dark: new THREE.MeshStandardMaterial({ color: '#262c2d', roughness: 0.61, metalness: 0.3 }),
    bronze: new THREE.MeshStandardMaterial({ color: '#9b7855', roughness: 0.4, metalness: 0.68 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: '#485f60',
      metalness: 0.58,
      roughness: 0.13,
      transparent: true,
      opacity: 0.64,
      clearcoat: 1,
      envMapIntensity: 1.3,
      side: THREE.DoubleSide,
    }),
    glow: new THREE.MeshStandardMaterial({
      color: '#9b7a4e',
      emissive: '#efb86b',
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
  material: THREE.Material,
  castShadow = false,
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
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
    bevelEnabled: false,
    curveSegments: 5,
  });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}
