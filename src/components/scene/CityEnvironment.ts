import * as THREE from 'three';
import { range } from '../../lib/timeline.mjs';

function random(seed: number) {
  const value = Math.sin(seed * 127.1 + 31.7) * 43758.5453;
  return value - Math.floor(value);
}

export function createCity(scene: THREE.Scene, mobile: boolean) {
  const evening = { value: 0 };
  const panorama = { value: null as THREE.Texture | null };
  const skyBlend = { value: 0 };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(490, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { evening, panorama, skyBlend },
      vertexShader: `
        varying vec3 direction;
        void main() {
          direction = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        }`,
      fragmentShader: `
        varying vec3 direction;
        uniform float evening;
        uniform sampler2D panorama;
        uniform float skyBlend;
        float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        float noise(vec2 p) {
          vec2 i=floor(p), f=fract(p);
          f=f*f*(3.-2.*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);
        }
        void main() {
          vec3 d = normalize(direction);
          float h = d.y;
          float glow = pow(max(dot(normalize(vec3(d.x,0.,d.z)), normalize(vec3(-.72,0.,-.69))),0.),4.);
          vec3 upper = mix(vec3(.096,.160,.239),vec3(.019,.043,.093),evening);
          vec3 horizon = mix(vec3(.37,.35,.33),vec3(.128,.176,.264),evening);
          vec3 color = mix(horizon,upper,smoothstep(-.025,.56,h));
          color += exp(-abs(h-.018)*9.) * glow * mix(vec3(.42,.20,.08),vec3(.38,.12,.046),evening);
          vec2 p = vec2(atan(d.z,d.x)*12., h*25.);
          float clouds = smoothstep(.43,.72,noise(p)+noise(p*2.19)*.29+noise(p*4.3)*.11);
          color *= 1. - .33 * clouds * smoothstep(-.07,.045,h) * (1.-smoothstep(.24,.69,h));
          color *= mix(.66,1.,smoothstep(-.27,.0,h));
          if (skyBlend > 0.) {
            vec2 uv = vec2(atan(d.z,d.x)/6.2831853 + .63,asin(clamp(d.y,-1.,1.))/3.14159265 + .5);
            vec3 photo = texture2D(panorama,vec2(fract(uv.x),uv.y)).rgb;
            photo = photo * mix(.34,.17,evening);
            color = mix(color,photo,skyBlend * .70);
          }
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
    new THREE.MeshStandardMaterial({ color: '#283331', roughness: 0.96, envMapIntensity: 0.2 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.049;
  ground.receiveShadow = true;
  scene.add(ground);

  const buildingMaterial = new THREE.ShaderMaterial({
    uniforms: { evening },
    vertexShader: `
      varying vec3 point;
      varying vec3 surface;
      varying vec3 origin;
      varying vec3 local;
      varying float cameraDistance;
      void main() {
        vec4 world = modelMatrix * instanceMatrix * vec4(position,1.);
        point = world.xyz;
        local = position;
        surface = normal;
        origin = instanceMatrix[3].xyz;
        cameraDistance = distance(world.xyz,cameraPosition);
        gl_Position = projectionMatrix * viewMatrix * world;
      }`,
    fragmentShader: `
      varying vec3 point;
      varying vec3 surface;
      varying vec3 origin;
      varying vec3 local;
      varying float cameraDistance;
      uniform float evening;
      float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      void main() {
        float seed = hash(origin.xz);
        bool face = abs(surface.y) < .5;
        float front = abs(surface.z);
        float panelWidth = mix(1.68,2.63,seed);
        vec2 uv = vec2(abs(surface.x)>.5 ? point.z : point.x, point.y) / vec2(panelWidth,3.05);
        vec2 cell = fract(uv + vec2(seed*.63,0.));
        vec2 pixel = max(fwidth(uv),vec2(.006));
        float pane = smoothstep(.14-pixel.x,.14+pixel.x,cell.x)*(1.-smoothstep(.83-pixel.x,.83+pixel.x,cell.x))
          *smoothstep(.28-pixel.y,.28+pixel.y,cell.y)*(1.-smoothstep(.81-pixel.y,.81+pixel.y,cell.y));
        vec2 id = floor(uv + vec2(seed*.63,0.));
        float occupied = step(.86-evening*.145,hash(id+seed*47.));
        vec3 plaster = mix(vec3(.041,.054,.065),vec3(.133,.128,.11),seed);
        plaster *= .73 + .37 * front + .15 * max(surface.y,0.);
        float cornice = 1.-smoothstep(.016,.071,cell.y);
        vec3 glass = mix(vec3(.041,.066,.096), vec3(.091,.131,.167), seed);
        glass += vec3(.018,.028,.046) * smoothstep(.38,.78,cell.y);
        float mullion = mix(1.,.72,1.-smoothstep(.019,.039,abs(cell.x-.48)));
        vec3 bulb = mix(vec3(.34,.17,.065),vec3(.36,.30,.21),hash(id+2.81));
        vec3 color = face ? mix(plaster*(1.-cornice*.22),glass*mullion + occupied * bulb * (.39 + evening*.71),pane) : plaster*.68;
        color *= 1.-smoothstep(.42,.50,abs(front > .5 ? local.x : local.z))*.13;
        vec3 haze = mix(vec3(.182,.213,.232),vec3(.092,.121,.175),evening);
        float distanceFog = 1.-exp(-max(0.,cameraDistance-30.)*.0045);
        color = mix(color,haze,distanceFog);
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

  return {
    setPanorama(texture: THREE.Texture) {
      panorama.value = texture;
      skyBlend.value = 1;
    },
    update(progress: number) {
      evening.value = range(progress, 0.2, 0.74);
    },
  };
}
