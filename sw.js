const CACHE_NAME = 'jar-black-hole-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './jarBlackHole192icon.png',
  './jarBlackHole512icon.png',
  './js/i18n.js',
  './js/physics.js',
  './js/audio.js',
  './js/narrative.js',
  './js/evolution.js',
  './js/shaders.js',
  './js/probe.js',
  './js/scene.js',
  './js/particles.js',
  './js/main.js',
  // CDN 核心依賴
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/controls/OrbitControls.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/postprocessing/EffectComposer.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/postprocessing/RenderPass.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/postprocessing/ShaderPass.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/shaders/CopyShader.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/shaders/LuminosityHighPassShader.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/postprocessing/UnrealBloomPass.js'
];
