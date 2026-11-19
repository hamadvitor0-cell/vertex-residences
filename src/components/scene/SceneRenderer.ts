import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { range } from '../../lib/timeline.mjs';
import { createMobileBloom } from './MobileBloom';

const mobileRatios = [1.6, 1.42, 1.25, 1.1];

export function createSceneRenderer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  mobile: boolean,
) {
  const context = renderer.getContext();
  const float =
    context instanceof WebGL2RenderingContext && renderer.extensions.has('EXT_color_buffer_float');
  const target = float
    ? new THREE.WebGLRenderTarget(1, 1, {
        type: THREE.HalfFloatType,
        samples: Math.min(
          mobile ? 2 : 4,
          context.getInternalformatParameter(
            context.RENDERBUFFER,
            context.RGBA16F,
            context.SAMPLES,
          )?.[0] ?? 0,
        ),
        resolveDepthBuffer: false,
      })
    : null;
  const composer = target && !mobile ? new EffectComposer(renderer, target) : null;
  const bloom = composer ? new UnrealBloomPass(new THREE.Vector2(1, 1), 0.27, 0.43, 1.18) : null;
  const output = composer ? new OutputPass() : null;
  if (composer && bloom && output) {
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(bloom);
    composer.addPass(output);
    composer.setPixelRatio(1);
  }
  const mobileTarget = mobile ? target : null;
  const mobileBloom = mobileTarget ? createMobileBloom(renderer, mobileTarget.texture) : null;
  let quality = 0;
  let width = 1;
  let height = 1;

  function resize(nextWidth: number, nextHeight: number, warming = false) {
    width = nextWidth;
    height = nextHeight;
    const budget = mobile ? 1_460_000 : quality ? 900_000 : 4_400_000;
    const preferred = mobile
      ? Math.min(Math.max(devicePixelRatio, 1.15), mobileRatios[quality])
      : quality
        ? 1
        : Math.min(Math.max(devicePixelRatio, 1.24), 2);
    const pixelRatio = warming ? 0.24 : Math.min(preferred, Math.sqrt(budget / (width * height)));
    const bufferWidth = Math.max(1, Math.floor(width * pixelRatio));
    const bufferHeight = Math.max(1, Math.floor(height * pixelRatio));
    renderer.setDrawingBufferSize(width, height, pixelRatio);
    composer?.setSize(bufferWidth, bufferHeight);
    mobileTarget?.setSize(bufferWidth, bufferHeight);
    mobileBloom?.resize(bufferWidth, bufferHeight);
  }

  return {
    resize,
    reduceResolution() {
      const limit = mobile ? mobileRatios.length - 1 : 1;
      if (quality < limit) {
        quality++;
        resize(width, height);
      }
      return quality === limit;
    },
    compile() {
      renderer.setRenderTarget(composer?.readBuffer ?? mobileTarget);
      try {
        renderer.compile(scene, camera);
      } finally {
        renderer.setRenderTarget(null);
      }
    },
    render(progress: number) {
      // Only high luminance emitters bloom. The color conversion runs once, after the effect.
      const inside = range(progress, 0.86, 1);
      const strength = 0.21 + range(progress, 0.33, 0.75) * 0.1 - inside * 0.22;
      const threshold = 1.18 + inside * 0.39;
      renderer.toneMappingExposure = 1.1 - range(progress, 0.38, 0.79) * 0.09 - inside * 0.02;
      if (mobileTarget && mobileBloom) {
        renderer.setRenderTarget(mobileTarget);
        renderer.render(scene, camera);
        mobileBloom.render(strength > 0.12 ? strength * 1.25 : 0, threshold);
      } else if (composer && bloom) {
        bloom.strength = strength;
        bloom.threshold = threshold;
        bloom.enabled = !quality && strength > 0.12;
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    },
    dispose() {
      composer?.dispose();
      bloom?.dispose();
      output?.dispose();
      mobileTarget?.dispose();
      mobileBloom?.dispose();
    },
  };
}
