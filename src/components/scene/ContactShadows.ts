import * as THREE from 'three';

export function contactShadows() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d')!;
  const falloff = context.createRadialGradient(64, 64, 4, 64, 64, 63);
  falloff.addColorStop(0, 'rgba(32, 23, 18, .68)');
  falloff.addColorStop(0.42, 'rgba(32, 23, 18, .49)');
  falloff.addColorStop(0.75, 'rgba(32, 23, 18, .2)');
  falloff.addColorStop(1, 'rgba(32, 23, 18, 0)');
  context.fillStyle = falloff;
  context.fillRect(0, 0, 128, 128);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false });
  const geometry = new THREE.PlaneGeometry(1, 1);

  return (
    parent: THREE.Object3D,
    [x, y, z, width, depth]: [number, number, number, number, number],
  ) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    mesh.scale.set(width, depth, 1);
    parent.add(mesh);
  };
}
