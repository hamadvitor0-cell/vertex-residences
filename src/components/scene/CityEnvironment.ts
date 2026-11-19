import * as THREE from 'three';
import { range } from '../../lib/timeline.mjs';
import { box } from './materials';
import type { Materials } from './materials';

function random(seed: number) {
  const value = Math.sin(seed * 127.1 + 31.7) * 43758.5453;
  return value - Math.floor(value);
}

export function createCity(scene: THREE.Scene, materials: Materials, mobile: boolean) {
  const evening = { value: 0 };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(490, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { evening },
      vertexShader: `
        varying vec3 direction;
        void main() {
          direction = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        }`,
      fragmentShader: `
        varying vec3 direction;
        uniform float evening;
        float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        float noise(vec2 p) {
          vec2 i=floor(p), f=fract(p);
          f=f*f*(3.-2.*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);
        }
        void main() {
          vec3 d = normalize(direction);
          float h = d.y;
          float glow = pow(max(dot(normalize(vec3(d.x,0.,d.z)), normalize(vec3(1.,0.,-.56))),0.),4.);
          vec3 upper = mix(vec3(.061,.105,.158),vec3(.014,.034,.078),evening);
          vec3 horizon = mix(vec3(.158,.235,.276),vec3(.087,.129,.213),evening);
          vec3 color = mix(horizon,upper,smoothstep(-.025,.56,h));
          color += exp(-abs(h-.018)*9.) * glow * mix(vec3(.42,.20,.08),vec3(.38,.12,.046),evening);
          vec2 p = vec2(atan(d.z,d.x)*12., h*25.);
          float clouds = smoothstep(.43,.72,noise(p)+noise(p*2.19)*.29+noise(p*4.3)*.11);
          color *= 1. - .33 * clouds * smoothstep(-.07,.045,h) * (1.-smoothstep(.24,.69,h));
          color *= mix(.66,1.,smoothstep(-.27,.0,h));
          gl_FragColor = vec4(color,1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }),
  );
  sky.renderOrder = -20;
  scene.add(sky);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(840, 840),
    new THREE.MeshStandardMaterial({ color: '#273139', roughness: 0.96, envMapIntensity: 0.12 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.16;
  ground.receiveShadow = true;
  scene.add(ground);

  const street = new THREE.Group();
  scene.add(street);
  const asphalt = new THREE.MeshStandardMaterial({
    color: '#191f24',
    roughness: 0.86,
    envMapIntensity: 0.18,
  });
  const path = new THREE.MeshStandardMaterial({ color: '#515753', roughness: 0.88 });
  const markings = new THREE.MeshStandardMaterial({ color: '#818278', roughness: 0.85 });
  box(street, [105, 0.07, 12.5], [0, -0.09, 21.2], asphalt);
  box(street, [11.5, 0.08, 116], [21.4, -0.085, -26.7], asphalt);
  box(street, [104, 0.13, 2.2], [0, -0.063, 13.85], path);
  box(street, [2.15, 0.13, 67], [14.55, -0.063, -20.4], path);
  for (let i = -6; i <= 5; i++) {
    box(street, [2.1, 0.014, 0.062], [i * 6, -0.047, 21.3], markings);
  }

  const buildingMaterial = new THREE.ShaderMaterial({
    uniforms: { evening },
    vertexShader: `
      varying vec3 point;
      varying vec3 surface;
      varying vec3 origin;
      varying float cameraDistance;
      void main() {
        vec4 world = modelMatrix * instanceMatrix * vec4(position,1.);
        point = world.xyz;
        surface = normal;
        origin = instanceMatrix[3].xyz;
        cameraDistance = distance(world.xyz,cameraPosition);
        gl_Position = projectionMatrix * viewMatrix * world;
      }`,
    fragmentShader: `
      varying vec3 point;
      varying vec3 surface;
      varying vec3 origin;
      varying float cameraDistance;
      uniform float evening;
      float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      void main() {
        vec2 uv = vec2(abs(surface.x)>.5 ? point.z : point.x,point.y)/vec2(2.03,3.02);
        vec2 cell = fract(uv);
        float seed = hash(origin.xz);
        float pane = smoothstep(.18,.24,cell.x)*(1.-smoothstep(.73,.81,cell.x))*smoothstep(.29,.34,cell.y)*(1.-smoothstep(.7,.76,cell.y));
        float windows = step(.76-evening*.13,hash(floor(uv)+seed*47.))*pane*(1.-abs(surface.y));
        vec3 color = mix(vec3(.03,.044,.06),vec3(.084,.104,.125),seed);
        color *= .7 + .23 * abs(surface.z) + .2 * max(surface.y,0.);
        color += windows * vec3(.36,.22,.11) * (.32+evening*.63);
        vec3 haze = mix(vec3(.13,.187,.23),vec3(.091,.127,.177),evening);
        color = mix(color,haze,1.-exp(-cameraDistance*.0038));
        gl_FragColor = vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const massing = [];
  for (let z = -12; z <= 12; z++) {
    for (let x = -12; x <= 12; x++) {
      const distance = Math.hypot(x, z);
      const index = x + 25 * z;
      // Keep the entire approach above the open avenue, with the skyline behind and to the east.
      if (distance < 2.5 || distance > 13 || z > 0 || random(index) < (mobile ? 0.38 : 0.24))
        continue;
      const width = 5 + random(index + 19) * 8;
      const depth = 5 + random(index + 41) * 8;
      const height = 5 + random(index + 7) ** 1.9 * (distance < 4 ? 29 : 51);
      const centerX = x * 17.5 + random(index + 2) * 4;
      const centerZ = z * 17.5 + random(index + 3) * 4;
      massing.push([centerX, height / 2, centerZ, width, height, depth]);
      if (height > 23 && random(index + 64) > 0.35) {
        massing.push([centerX, height + 1.1, centerZ, width * 0.55, 2.2, depth * 0.67]);
      }
    }
  }
  const city = new THREE.InstancedMesh(new THREE.BoxGeometry(), buildingMaterial, massing.length);
  const transform = new THREE.Object3D();
  massing.forEach(([x, y, z, w, h, d], i) => {
    transform.position.set(x, y, z);
    transform.scale.set(w, h, d);
    transform.updateMatrix();
    city.setMatrixAt(i, transform.matrix);
  });
  scene.add(city);

  const lamp = new THREE.MeshBasicMaterial({ color: '#ffca8d' });
  for (const x of [-10.5, 11.3, 30]) {
    box(street, [0.085, 4.2, 0.085], [x, 2.1, 13.9], materials.dark);
    box(street, [0.09, 0.09, 0.89], [x, 4.17, 14.29], materials.dark);
    box(street, [0.17, 0.07, 0.31], [x, 4.13, 14.67], lamp);
  }
  return {
    update(progress: number) {
      evening.value = range(progress, 0.2, 0.74);
    },
  };
}
