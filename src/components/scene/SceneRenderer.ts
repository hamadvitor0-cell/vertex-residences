import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { range } from '../../lib/timeline.mjs';

export function createSceneRenderer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  mobile: boolean,
) {
  const context = renderer.getContext();
  const float =
    context instanceof WebGL2RenderingContext && renderer.extensions.has('EXT_color_buffer_float');
  const composer = float
    ? new EffectComposer(
        renderer,
        new THREE.WebGLRenderTarget(1, 1, {
          type: THREE.HalfFloatType,
          samples: Math.min(
            mobile ? 2 : 4,
            context.getInternalformatParameter(
              context.RENDERBUFFER,
              context.RGBA16F,
              context.SAMPLES,
            )?.[0] ?? 0,
          ),
        }),
      )
    : null;
  const base = new RenderPass(scene, camera);
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.27, 0.43, 1.18);
  const output = new OutputPass();
  composer?.addPass(base);
  composer?.addPass(bloom);
  composer?.addPass(output);
  composer?.setPixelRatio(1);
  let lightMode = false;
  let width = 1;
  let height = 1;

  function resize(nextWidth: number, nextHeight: number, warming = false) {
    width = nextWidth;
    height = nextHeight;
    const budget = lightMode ? 900_000 : mobile ? 1_460_000 : 4_400_000;
    const preferred = lightMode
      ? 1
      : mobile
        ? Math.min(Math.max(devicePixelRatio, 1.15), 1.6)
        : Math.min(Math.max(devicePixelRatio, 1.24), 2);
    const pixelRatio = warming ? 0.24 : Math.min(preferred, Math.sqrt(budget / (width * height)));
    renderer.setDrawingBufferSize(width, height, pixelRatio);
    composer?.setSize(Math.floor(width * pixelRatio), Math.floor(height * pixelRatio));
  }

  return {
    resize,
    reduceEffects() {
      if (lightMode) return;
      lightMode = true;
      resize(width, height);
    },
    compile() {
      renderer.setRenderTarget(composer?.readBuffer ?? null);
      try {
        renderer.compile(scene, camera);
      } finally {
        renderer.setRenderTarget(null);
      }
    },
    render(progress: number) {
      // Only high luminance emitters bloom. The color conversion runs once, after the effect.
      const inside = range(progress, 0.86, 1);
      bloom.strength = 0.21 + range(progress, 0.33, 0.75) * 0.1 - inside * 0.22;
      bloom.threshold = 1.18 + inside * 0.39;
      bloom.enabled = !lightMode && bloom.strength > 0.12;
      renderer.toneMappingExposure = 1.1 - range(progress, 0.38, 0.79) * 0.09 - inside * 0.02;
      if (composer) composer.render();
      else renderer.render(scene, camera);
    },
    dispose() {
      composer?.dispose();
      base.dispose();
      bloom.dispose();
      output.dispose();
    },
  };
}
