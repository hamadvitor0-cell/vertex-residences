import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { createBuilding } from './BuildingModel';
import { createInterior } from './InteriorModel';
import { createCity } from './CityEnvironment';
import { createStreet } from './StreetScene';
import { createSceneRenderer } from './SceneRenderer';
import { updateCamera } from './CameraController';
import { createLighting } from './LightingSystem';
import { createMaterials } from './materials';
import { disposeScene, loadSceneAssets } from './SceneAssets';
import { range } from '../../lib/timeline.mjs';
import { buildingProgress } from '../../lib/apartmentTour.mjs';

export default function BuildingScene({
  progress,
  reduced,
  onReady,
  onError,
}: {
  progress: RefObject<number>;
  reduced: boolean;
  onReady: () => void;
  onError: () => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mount = container.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      onError();
      return;
    }
    const mobile = matchMedia('(max-width: 767px)').matches;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.03;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute(
      'aria-label',
      'Cena 3D do Vertex Residences, da fundação ao interior do apartamento.',
    );
    renderer.domElement.setAttribute('role', 'img');
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#536370', 0.00165);
    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 760);
    const materials = createMaterials();
    RectAreaLightUniformsLib.init();
    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(environment, 0.12);
    scene.environment = envMap.texture;
    environment.dispose();
    let dirty = true;
    let disposed = false;
    let skyTexture: THREE.DataTexture | undefined;
    let skyReflections: THREE.WebGLRenderTarget | undefined;
    const assets = loadSceneAssets(() => {
      dirty = true;
    });
    materials.stone.map = assets.texture('facade-stone-color', true, [0.7, 0.7]);
    materials.stone.normalMap = assets.texture('facade-stone-normal', false, [0.7, 0.7]);
    materials.stone.normalScale.set(0.24, 0.24);
    const lighting = createLighting(scene, mobile);
    const building = createBuilding(materials, mobile);
    const city = createCity(scene, mobile);
    const street = createStreet(materials, assets, mobile);
    const interior = createInterior(materials, assets, mobile);
    scene.add(building.group, street.group, interior.group);
    const view = createSceneRenderer(renderer, scene, camera, mobile);
    new HDRLoader().load(
      '/scene/dusk-sky.hdr',
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        skyTexture = texture;
        skyReflections = pmrem.fromEquirectangular(texture);
        scene.environment = skyReflections.texture;
        scene.environmentRotation.y = Math.PI * 0.26;
        city.setPanorama(texture);
        dirty = true;
      },
      undefined,
      () => {
        /* The procedural sky and studio reflections cover a missing HDRI. */
      },
    );

    let width = 1;
    let height = 1;
    const resize = () => {
      width = Math.max(mount.clientWidth, 1);
      height = Math.max(mount.clientHeight, 1);
      view.resize(width, height);
      dirty = true;
    };
    let active = true;
    let frame = 0;
    let current = progress.current;
    let lastTime = 0;
    let previous = -1;
    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active) dirty = true;
      },
      { rootMargin: '100px' },
    );
    observer.observe(mount);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const render = (time: number) => {
      frame = requestAnimationFrame(render);
      const elapsed = Math.min(time - lastTime, 80);
      lastTime = time;
      if (!active || document.hidden) return;
      const desired = progress.current;
      current = reduced ? desired : THREE.MathUtils.damp(current, desired, 10.5, elapsed / 1000);
      if (Math.abs(desired - current) < 0.0002) current = desired;
      if (!dirty && previous === current) return;
      const exterior = buildingProgress(current);
      // During the interior walk the models are static; reuse their shadow maps as the camera turns.
      renderer.shadowMap.needsUpdate = dirty || exterior !== buildingProgress(previous);
      materials.glow.emissiveIntensity = range(exterior, 0.52, 0.74) * 1.08;
      building.update(exterior);
      street.update(exterior);
      interior.group.visible = exterior > 0.49;
      interior.update(exterior);
      updateCamera(camera, current, width, height);
      lighting.update(exterior);
      city.update(exterior);
      view.render(exterior);
      previous = current;
      dirty = false;
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    render(performance.now());
    onReady();
    return () => {
      cancelAnimationFrame(frame);
      disposed = true;
      observer.disconnect();
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      assets.dispose();
      disposeScene(scene);
      view.dispose();
      skyReflections?.dispose();
      skyTexture?.dispose();
      envMap.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progress, reduced, onReady, onError]);
  return <div ref={container} className="building-canvas" />;
}
