// 防禦性依賴檢查
if (typeof I18N === 'undefined') console.error('CRITICAL: i18n.js 未載入');
if (typeof Physics === 'undefined') console.error('CRITICAL: physics.js 未載入');
if (typeof SceneManager === 'undefined') console.error('CRITICAL: scene.js 未載入');
if (typeof ParticleManager === 'undefined') console.error('CRITICAL: particles.js 未載入');
if (typeof ProbeManager === 'undefined') console.error('CRITICAL: probe.js 未載入');

document.addEventListener('DOMContentLoaded', () => {
  // 1. 初始化多語言
  I18N.init();

  // 2. 初始化場景與渲染管線
  SceneManager.init();

  // 3. 初始化 GPU 粒子吸積盤
  ParticleManager.init(SceneManager.scene, 2.5);

  // 4. 初始化探測器模組
  ProbeManager.init(SceneManager.scene);

  // 5. 狀態控制變數
  let speedFactor = 1.0;
  let massScale = 1.0;
  let clock = new THREE.Clock();

  // 6. UI 事件監聽
  const speedRange = document.getElementById('speedRange');
  const speedVal = document.getElementById('speedVal');
  speedRange.addEventListener('input', (e) => {
    speedFactor = parseFloat(e.target.value);
    speedVal.textContent = speedFactor.toFixed(1) + ' c';
  });

  const massRange = document.getElementById('massRange');
  const massVal = document.getElementById('massVal');
  const iscoVal = document.getElementById('iscoVal');
  const photonVal = document.getElementById('photonVal');

  massRange.addEventListener('input', (e) => {
    const rawMass = parseFloat(e.target.value);
    massScale = rawMass / 2.5; // 標準化為縮放係數
    massVal.textContent = rawMass.toFixed(1) + ' M☉';
    
    // 即時更新數值看板
    iscoVal.textContent = (rawMass * 6.0).toFixed(1) + ' Rs';
    photonVal.textContent = (rawMass * 3.0).toFixed(1) + ' Rs';

    SceneManager.updateBlackHoleScale(massScale);
  });

  const bloomRange = document.getElementById('bloomRange');
  const bloomVal = document.getElementById('bloomVal');
  bloomRange.addEventListener('input', (e) => {
    const bloom = parseFloat(e.target.value);
    bloomVal.textContent = bloom.toFixed(1);
    SceneManager.bloomPass.strength = bloom;
  });

  // 7. 動畫主迴圈
  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    SceneManager.controls.update();

    // 更新 GPU 吸積盤
    ParticleManager.update(delta, speedFactor, massScale);

    // 更新探測器與意粉化
    ProbeManager.update(massScale);

    // 後處理渲染
    SceneManager.composer.render();
  }

  animate();
});
