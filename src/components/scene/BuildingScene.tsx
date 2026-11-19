import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createBuilding } from './BuildingModel';
import { createInterior } from './InteriorModel';
import { createCity } from './CityEnvironment';
import { updateCamera } from './CameraController';
import { createLighting } from './LightingSystem';
import { createMaterials } from './materials';
import { disposeScene, loadSceneAssets } from './SceneAssets';
import { range } from '../../lib/timeline.mjs';

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
        antialias: devicePixelRatio < 2,
        powerPreference: 'high-performance',
      });
    } catch {
      onError();
      return;
    }
    const mobile = matchMedia('(max-width: 767px)').matches;
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.2 : 1.65));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.03;
    renderer.shadowMap.enabled = !mobile;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute(
      'aria-label',
      'Cena 3D do Vertex Residences, da fundação ao interior do apartamento.',
    );
    renderer.domElement.setAttribute('role', 'img');
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#526273', 0.00195);
    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 760);
    const materials = createMaterials();
    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(environment, 0.12);
    scene.environment = envMap.texture;
    environment.dispose();
    pmrem.dispose();
    let dirty = true;
    const assets = loadSceneAssets(() => {
      dirty = true;
    });
    const lighting = createLighting(scene, mobile);
    const building = createBuilding(materials, mobile);
    const city = createCity(scene, materials, mobile);
    const interior = createInterior(materials, assets, mobile);
    scene.add(building.group, interior.group);

    let width = 1;
    let height = 1;
    const resize = () => {
      width = Math.max(mount.clientWidth, 1);
      height = Math.max(mount.clientHeight, 1);
      renderer.setSize(width, height);
      dirty = true;
    };
    let active = true;
    let frame = 0;
    let current = reduced ? 0.69 : progress.current;
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
      const desired = reduced ? 0.69 : progress.current;
      current = THREE.MathUtils.damp(current, desired, 10.5, elapsed / 1000);
      if (Math.abs(desired - current) < 0.0002) current = desired;
      if (!dirty && previous === current) return;
      materials.glow.emissiveIntensity = range(current, 0.52, 0.74) * 1.08;
      building.update(current);
      interior.group.visible = current > 0.49;
      interior.update(current);
      updateCamera(camera, current, width, height);
      lighting.update(current);
      city.update(current);
      renderer.render(scene, camera);
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
      observer.disconnect();
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      assets.dispose();
      disposeScene(scene);
      envMap.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progress, reduced, onReady, onError]);
  return <div ref={container} className="building-canvas" />;
}
