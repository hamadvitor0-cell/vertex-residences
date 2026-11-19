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

export function loadSceneAssets() {
  const textures = new THREE.TextureLoader();
  const models = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const textureCache = new Map<string, THREE.Texture>();
  const modelCache = new Map<string, Promise<THREE.Object3D | undefined>>();
  const pending: Promise<unknown>[] = [];
  let disposed = false;

  function track<T>(task: Promise<T>) {
    pending.push(task);
    return task;
  }

  return {
    texture(name: string, color: boolean, repeat: [number, number]) {
      let source = textureCache.get(name);
      // Materials share the decoded pixels even when their UV repeat differs.
      if (!source) {
        const texture = new THREE.Texture();
        textureCache.set(name, texture);
        source = texture;
        track(
          textures.loadAsync(`/scene/${name}.webp`).then(
            (loaded) => {
              if (!disposed) {
                texture.image = loaded.image;
                texture.needsUpdate = true;
              }
              loaded.dispose();
            },
            () => {
              if (disposed) return;
              const pixel = document.createElement('canvas');
              pixel.width = pixel.height = 1;
              const context = pixel.getContext('2d');
              if (context) {
                context.fillStyle = name.endsWith('-normal') ? '#8080ff' : '#fff';
                context.fillRect(0, 0, 1, 1);
              }
              texture.image = pixel;
              texture.needsUpdate = true;
            },
          ),
        );
      }
      const texture = source.clone();
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
      let model = modelCache.get(name);
      if (!model) {
        model = models.loadAsync(`/scene/${name}.glb`).then(
          ({ scene }) => {
            if (disposed) {
              disposeScene(scene);
              return undefined;
            }
            scene.traverse((object) => {
              if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
              }
            });
            return scene;
          },
          () => undefined,
        );
        modelCache.set(name, model);
      }
      track(
        model.then((source) => {
          if (!source || disposed) return;
          const pivot = new THREE.Group();
          pivot.add(source.clone(true));
          pivot.rotation.y = turn;
          const bounds = new THREE.Box3().setFromObject(pivot);
          const center = bounds.getCenter(new THREE.Vector3());
          const size = bounds.getSize(new THREE.Vector3());
          const wrapper = new THREE.Group();
          wrapper.add(pivot);
          pivot.position.set(-center.x, -bounds.min.y, -center.z);
          wrapper.scale.setScalar(width / Math.max(size.x, size.z));
          if (placeholder) placeholder.visible = false;
          slot.add(wrapper);
        }),
      );
    },
    track,
    async ready(onProgress: (fraction: number) => void) {
      const total = pending.length;
      let completed = 0;
      await Promise.all(
        pending.map(async (task) => {
          try {
            await task;
          } finally {
            completed++;
            if (!disposed) onProgress(completed / total);
          }
        }),
      );
    },
    dispose() {
      disposed = true;
      for (const texture of textureCache.values()) texture.dispose();
    },
  };
}

export type SceneAssets = ReturnType<typeof loadSceneAssets>;
