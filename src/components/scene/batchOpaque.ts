import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function batchOpaque(group: THREE.Group) {
  const batches = new Map<string, THREE.Mesh[]>();
  for (const child of group.children) {
    if (
      !(child instanceof THREE.Mesh) ||
      child instanceof THREE.InstancedMesh ||
      Array.isArray(child.material) ||
      child.material.transparent ||
      child.geometry.type === 'ExtrudeGeometry'
    )
      continue;
    const key = `${child.material.id}:${child.castShadow}:${child.receiveShadow}`;
    const batch = batches.get(key) ?? [];
    batch.push(child);
    batches.set(key, batch);
  }
  for (const meshes of batches.values()) {
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
    const combined = new THREE.Mesh(geometry, meshes[0].material);
    combined.castShadow = meshes[0].castShadow;
    combined.receiveShadow = meshes[0].receiveShadow;
    for (const mesh of meshes) {
      group.remove(mesh);
      mesh.geometry.dispose();
    }
    group.add(combined);
  }
}
