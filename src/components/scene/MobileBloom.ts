import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

const screenVertex = `
  varying vec2 screenUV;
  void main() {
    screenUV = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export function createMobileBloom(renderer: THREE.WebGLRenderer, sceneColor: THREE.Texture) {
  const settings = { type: THREE.HalfFloatType, depthBuffer: false };
  const horizontal = new THREE.WebGLRenderTarget(1, 1, settings);
  const glow = new THREE.WebGLRenderTarget(1, 1, settings);
  const blur = new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    uniforms: {
      source: { value: sceneColor },
      stepUV: { value: new THREE.Vector2() },
      threshold: { value: 0 },
    },
    vertexShader: screenVertex,
    fragmentShader: `
      uniform sampler2D source;
      uniform vec2 stepUV;
      uniform float threshold;
      varying vec2 screenUV;

      vec3 sampleLight(vec2 uv) {
        vec3 color = texture2D(source, uv).rgb;
        if (threshold <= 0.0) return color;
        float light = dot(color, vec3(0.2126, 0.7152, 0.0722));
        return color * smoothstep(threshold - 0.1, threshold + 0.12, light);
      }

      void main() {
        vec3 color = sampleLight(screenUV) * 0.24;
        color += (sampleLight(screenUV - stepUV * 1.4) +
                  sampleLight(screenUV + stepUV * 1.4)) * 0.26;
        color += (sampleLight(screenUV - stepUV * 3.3) +
                  sampleLight(screenUV + stepUV * 3.3)) * 0.12;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
  const output = new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      sceneColor: { value: sceneColor },
      glow: { value: glow.texture },
      strength: { value: 0 },
    },
    vertexShader: screenVertex,
    fragmentShader: `
      uniform sampler2D sceneColor;
      uniform sampler2D glow;
      uniform float strength;
      varying vec2 screenUV;

      void main() {
        gl_FragColor = texture2D(sceneColor, screenUV);
        if (strength > 0.0) gl_FragColor.rgb += texture2D(glow, screenUV).rgb * strength;
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const quad = new FullScreenQuad(blur);

  return {
    resize(width: number, height: number) {
      const w = Math.max(1, Math.round(width / 4));
      const h = Math.max(1, Math.round(height / 4));
      horizontal.setSize(w, h);
      glow.setSize(w, h);
    },
    render(strength: number, threshold: number) {
      if (strength > 0) {
        quad.material = blur;
        blur.uniforms.source.value = sceneColor;
        blur.uniforms.stepUV.value.set(1 / horizontal.width, 0);
        blur.uniforms.threshold.value = threshold;
        renderer.setRenderTarget(horizontal);
        quad.render(renderer);

        blur.uniforms.source.value = horizontal.texture;
        blur.uniforms.stepUV.value.set(0, 1 / glow.height);
        blur.uniforms.threshold.value = 0;
        renderer.setRenderTarget(glow);
        quad.render(renderer);
      }
      quad.material = output;
      output.uniforms.strength.value = strength;
      renderer.setRenderTarget(null);
      quad.render(renderer);
    },
    dispose() {
      quad.dispose();
      blur.dispose();
      output.dispose();
      horizontal.dispose();
      glow.dispose();
    },
  };
}
