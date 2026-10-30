import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createBuilding } from './BuildingModel';
import { createInterior } from './InteriorModel';
import { updateCamera } from './CameraController';
import { createLighting } from './LightingSystem';
import { createMaterials } from './materials';
import { range, floorProgress, INTERIOR_LEVEL } from '../../lib/timeline.mjs';

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
        antialias: window.devicePixelRatio <= 1.5,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      onError();
      return;
    }
    let mobile = window.matchMedia('(max-width: 767px)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.35 : 1.65));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.96;
    renderer.shadowMap.enabled = !mobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute(
      'aria-label',
      'Maquete tridimensional do Vertex Residences. A construção, a iluminação e a câmera acompanham a rolagem.',
    );
    renderer.domElement.setAttribute('role', 'img');
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#1b2225', 0.0021);
    const camera = new THREE.PerspectiveCamera(43, 1, 0.05, 600);
    const materials = createMaterials();
    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(environment, 0.04);
    scene.environment = envMap.texture;
    environment.dispose();
    pmrem.dispose();
    const lighting = createLighting(scene, mobile);
    const building = createBuilding(materials, mobile);
    scene.add(building.group);
    const interior = createInterior(materials);
    scene.add(interior.group);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(900, 900),
      new THREE.MeshStandardMaterial({
        color: '#10191b',
        roughness: 0.97,
        envMapIntensity: 0.1,
        transparent: true,
        opacity: 0.23,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.position.y = -0.12;
    scene.add(ground);
    // Sparse, deterministic city silhouettes. No remote model or texture downloads.
    const city = new THREE.Group();
    const cityMaterial = new THREE.MeshBasicMaterial({
      color: '#7b8b83',
      transparent: true,
      opacity: 0.055,
      depthWrite: false,
    });
    for (let i = 0; i < (mobile ? 16 : 28); i++) {
      const height = 5 + ((i * 17) % 21);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(5 + (i % 8), height, 6), cityMaterial);
      mesh.position.set(-180 + i * 14, height / 2, -105 - (i % 3) * 12);
      city.add(mesh);
    }
    scene.add(city);
    const resize = () => {
      const nextMobile = window.matchMedia('(max-width: 767px)').matches;
      if (nextMobile !== mobile) {
        mobile = nextMobile;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.35 : 1.65));
        renderer.shadowMap.enabled = !mobile;
      }
      const width = mount.clientWidth,
        height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      dirty = true;
    };
    let dirty = true;
    let active = true;
    let frame = 0;
    let current = reduced ? 0.69 : progress.current;
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
    const render = () => {
      frame = requestAnimationFrame(render);
      if (!active || document.hidden) return;
      const desired = reduced ? 0.69 : progress.current;
      current += (desired - current) * 0.09;
      if (Math.abs(desired - current) < 0.0001) current = desired;
      if (!dirty && Math.abs(previous - current) < 0.00001) return;
      building.update(current);
      updateCamera(camera, current, mobile);
      lighting.update(current);
      interior.group.visible = floorProgress(current, INTERIOR_LEVEL) > 0.98;
      interior.update(current);
      materials.glow.emissiveIntensity = range(current, 0.56, 0.74) * 2.3;
      city.visible = current < 0.94;
      renderer.render(scene, camera);
      previous = current;
      dirty = false;
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    render();
    onReady();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      const geometries = new Set<THREE.BufferGeometry>();
      const disposedMaterials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.LineSegments ||
          object instanceof THREE.Line
        ) {
          geometries.add(object.geometry);
          (Array.isArray(object.material) ? object.material : [object.material]).forEach(
            (material) => disposedMaterials.add(material),
          );
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      disposedMaterials.forEach((material) => material.dispose());
      envMap.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progress, reduced, onReady, onError]);
  return <div ref={container} className="building-canvas" />;
}
