import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { gunzipSync } from 'three/addons/libs/fflate.module.js';
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
import { buildingProgress, tourStops } from '../../lib/apartmentTour.mjs';

type Playback = { progress: RefObject<number>; reduced: boolean };
type SceneEvents = {
  onProgress: (percent: number) => void;
  onReady: () => void;
  onError: () => void;
};

async function loadSky(signal: AbortSignal) {
  const response = await fetch('/scene/dusk-sky-hdr.bin', { signal });
  if (!response.ok || !response.body) throw new Error('Could not load the sky');
  const bytes =
    typeof DecompressionStream === 'undefined'
      ? gunzipSync(new Uint8Array(await response.arrayBuffer())).slice().buffer
      : await new Response(
          response.body.pipeThrough(new DecompressionStream('gzip')),
        ).arrayBuffer();
  const { data, width, height } = new HDRLoader().parse(bytes);
  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.HalfFloatType);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.LinearSRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.flipY = true;
  texture.needsUpdate = true;
  return texture;
}

function initScene(mount: HTMLDivElement, playback: RefObject<Playback>, events: SceneEvents) {
  const { onProgress, onReady, onError } = events;
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });
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
  onProgress(8);

  let disposed = false;
  const abort = new AbortController();
  const assets = loadSceneAssets();
  const sky = assets.track(loadSky(abort.signal).catch(() => undefined));
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#536370', 0.00165);
  const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 760);
  const materials = createMaterials();
  RectAreaLightUniformsLib.init();
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
  const pmrem = new THREE.PMREMGenerator(renderer);
  let environment: THREE.WebGLRenderTarget | undefined;

  let width = 1;
  let height = 1;
  let ready = false;
  let dirty = true;
  let active = true;
  let frame = 0;
  let current = playback.current.progress.current;
  let previous = Number.NaN;
  let previousExterior = Number.NaN;
  let lastTime = 0;
  let slowFrames = 0;
  let qualityReduced = false;

  const resize = () => {
    width = Math.max(mount.clientWidth, 8);
    height = Math.max(mount.clientHeight, 8);
    view.resize(width, height, !ready);
    dirty = true;
  };
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

  function placeCamera(value: number) {
    const exterior = buildingProgress(value);
    const changesOutside = exterior !== previousExterior;
    renderer.shadowMap.needsUpdate = changesOutside;
    if (changesOutside) {
      materials.glow.emissiveIntensity = range(exterior, 0.52, 0.74) * 1.08;
      building.update(exterior);
      street.update(exterior);
      interior.group.visible = exterior > 0.49;
      interior.update(exterior);
      lighting.update(exterior);
      city.update(exterior);
    }
    updateCamera(camera, value, width, height);
    previous = value;
    previousExterior = exterior;
    return exterior;
  }

  const render = (time: number) => {
    frame = requestAnimationFrame(render);
    const duration = time - lastTime;
    lastTime = time;
    if (!active || document.hidden) return;

    const { progress, reduced } = playback.current;
    const desired = progress.current;
    const elapsed = Math.min(duration, 80) / 1000;
    current = reduced ? desired : THREE.MathUtils.damp(current, desired, 10.5, elapsed);
    if (Math.abs(desired - current) < 0.0002) current = desired;
    if (!dirty && previous === current) {
      slowFrames = 0;
      return;
    }

    if (!qualityReduced && !dirty && duration > 38) {
      slowFrames++;
      if (slowFrames >= 5) {
        view.reduceEffects();
        qualityReduced = true;
      }
    } else {
      slowFrames = Math.max(0, slowFrames - 1);
    }
    view.render(placeCamera(current));
    dirty = false;
  };

  const contextLost = (event: Event) => {
    event.preventDefault();
    onError();
  };
  renderer.domElement.addEventListener('webglcontextlost', contextLost);

  const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  async function waitForFirstFrame() {
    const context = renderer.getContext();
    if (!(context instanceof WebGL2RenderingContext)) return;
    const fence = context.fenceSync(context.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (!fence) return;

    context.flush();
    const started = performance.now();
    try {
      while (
        !disposed &&
        performance.now() - started < 1800 &&
        context.clientWaitSync(fence, 0, 0) === context.TIMEOUT_EXPIRED
      ) {
        await nextFrame();
      }
    } finally {
      context.deleteSync(fence);
    }
  }

  onProgress(13);
  async function prepare() {
    await assets.ready((fraction) => onProgress(13 + Math.floor(61 * fraction)));
    const panorama = await sky;
    if (disposed) return;
    if (panorama) {
      environment = pmrem.fromEquirectangular(panorama);
      scene.environmentRotation.y = Math.PI * 0.26;
      city.setPanorama(panorama);
    } else {
      const studio = new RoomEnvironment();
      environment = pmrem.fromScene(studio);
      studio.dispose();
    }
    scene.environment = environment.texture;
    onProgress(77);

    // Build the lighting variants, then draw every camera stop with a small buffer.
    const previewStops = [0.24, 0.433, ...tourStops.map((stop) => stop.at)];
    for (const [index, stop] of previewStops.entries()) {
      await nextFrame();
      if (disposed) return;
      const exterior = placeCamera(stop);
      if (index < 2) view.compile();
      view.render(exterior);
      onProgress(78 + Math.floor((16 * (index + 1)) / previewStops.length));
    }
    await nextFrame();
    if (disposed) return;

    ready = true;
    resize();
    current = playback.current.progress.current;
    view.render(placeCamera(current));
    await waitForFirstFrame();
    if (disposed) return;
    onProgress(100);
    await nextFrame();
    if (disposed) return;
    dirty = false;
    lastTime = performance.now();
    onReady();
    frame = requestAnimationFrame(render);
  }
  void prepare().catch(() => {
    if (!disposed) onError();
  });

  return () => {
    disposed = true;
    abort.abort();
    cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    assets.dispose();
    disposeScene(scene);
    view.dispose();
    environment?.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    void sky.then((texture) => texture?.dispose());
  };
}

export default function BuildingScene({
  progress,
  reduced,
  onProgress,
  onReady,
  onError,
}: SceneEvents & Playback) {
  const container = useRef<HTMLDivElement>(null);
  const playback = useRef({ progress, reduced });
  useEffect(() => {
    playback.current = { progress, reduced };
  }, [progress, reduced]);

  useEffect(() => {
    const mount = container.current!;
    let dispose: (() => void) | undefined;
    const start = requestAnimationFrame(() => {
      try {
        dispose = initScene(mount, playback, { onProgress, onReady, onError });
      } catch {
        onError();
      }
    });
    return () => {
      cancelAnimationFrame(start);
      dispose?.();
    };
  }, [onProgress, onReady, onError]);
  return <div ref={container} className="building-canvas" />;
}
