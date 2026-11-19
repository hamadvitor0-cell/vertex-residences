import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

export function disposeScene(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
      geometries.add(object.geometry);
      for (const material of [object.material].flat() as THREE.Material[]) materials.add(material);
    }
    if (object instanceof THREE.Light && 'shadow' in object) {
      (object as THREE.SpotLight).shadow.dispose();
    }
    if (object instanceof THREE.InstancedMesh) object.dispose();
  });
  for (const material of materials) {
    for (const value of Object.values(material))
      if (value instanceof THREE.Texture) textures.add(value);
    material.dispose();
  }
  for (const geometry of geometries) geometry.dispose();
  for (const texture of textures) {
    if (texture.image instanceof ImageBitmap) texture.image.close();
    texture.dispose();
  }
}

export function loadSceneAssets(onChange: () => void) {
  const textures = new THREE.TextureLoader();
  const models = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  let disposed = false;
  return {
    texture(name: string, color: boolean, repeat: [number, number]) {
      const texture = textures.load(`/scene/${name}.webp`, (loaded) => {
        if (disposed) loaded.dispose();
        else onChange();
      });
      texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(...repeat);
      texture.anisotropy = 4;
      return texture;
    },
    model(
      name: string,
      slot: THREE.Group,
      width: number,
      turn: number,
      placeholder?: THREE.Object3D,
    ) {
      models.load(
        `/scene/${name}.glb`,
        ({ scene }) => {
          if (disposed) {
            disposeScene(scene);
            return;
          }
          const pivot = new THREE.Group();
          pivot.add(scene);
          pivot.rotation.y = turn;
          const bounds = new THREE.Box3().setFromObject(pivot);
          const center = bounds.getCenter(new THREE.Vector3());
          const size = bounds.getSize(new THREE.Vector3());
          const wrapper = new THREE.Group();
          wrapper.add(pivot);
          pivot.position.set(-center.x, -bounds.min.y, -center.z);
          wrapper.scale.setScalar(width / Math.max(size.x, size.z));
          scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.castShadow = true;
              object.receiveShadow = true;
            }
          });
          if (placeholder) placeholder.visible = false;
          slot.add(wrapper);
          onChange();
        },
        undefined,
        () => {
          /* Keep the modeled placeholder if a download fails. */
        },
      );
    },
    dispose() {
      disposed = true;
    },
  };
}

export type SceneAssets = ReturnType<typeof loadSceneAssets>;
