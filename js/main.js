// 防禦性依賴檢查
if (typeof I18N === 'undefined') console.error('CRITICAL: i18n.js 未載入');
if (typeof Physics === 'undefined') console.error('CRITICAL: physics.js 未載入');
if (typeof SceneManager === 'undefined') console.error('CRITICAL: scene.js 未載入');
if (typeof ParticleManager === 'undefined') console.error('CRITICAL: particles.js 未載入');
if (typeof ProbeManager === 'undefined') console.error('CRITICAL: probe.js 未載入');

document.addEventListener('DOMContentLoaded', () => {
  // 1. 初始化多語言字典
  I18N.init();

  // 2. 初始化 Three.js 場景與 Bloom 後處理
  SceneManager.init();

  // 3. 初始化 GPU 驅動吸積盤 (25,000 相對論粒子)
  ParticleManager.init(SceneManager.scene, 2.5);

  // 4. 初始化探測器與意粉化管理系統
  ProbeManager.init(SceneManager.scene);

  // 5. 狀態變數與時鐘
  let speedFactor = 1.0;
  let massScale = 1.0;
  let clock = new THREE.Clock();

  // 6. UI 動態回饋輔助函數
  const physicsCard = document.querySelector('.physics-card');

  function triggerFlash(el) {
    if (!el) return;
    el.classList.remove('flash');
    void el.offsetWidth; // 強制重繪 (Reflow)
    el.classList.add('flash');
  }

  function triggerCardPulse() {
    if (!physicsCard) return;
    physicsCard.classList.remove('data-pulse');
    void physicsCard.offsetWidth; // 強制重繪
    physicsCard.classList.add('data-pulse');
  }

  // 7. UI 事件監聽
  const speedRange = document.getElementById('speedRange');
  const speedVal = document.getElementById('speedVal');
  speedRange.addEventListener('input', (e) => {
    speedFactor = parseFloat(e.target.value);
    speedVal.textContent = speedFactor.toFixed(1) + ' c';
    triggerFlash(speedVal);
    triggerCardPulse();
  });

  const massRange = document.getElementById('massRange');
  const massVal = document.getElementById('massVal');
  const iscoVal = document.getElementById('iscoVal');
  const photonVal = document.getElementById('photonVal');

  massRange.addEventListener('input', (e) => {
    const rawMass = parseFloat(e.target.value);
    massScale = rawMass / 2.5; // 標準化為縮放係數
    massVal.textContent = rawMass.toFixed(1) + ' M☉';
    triggerFlash(massVal);

    // 即時更新數值看板
    iscoVal.textContent = (rawMass * 6.0).toFixed(1) + ' Rs';
    photonVal.textContent = (rawMass * 3.0).toFixed(1) + ' Rs';
    triggerFlash(iscoVal);
    triggerFlash(photonVal);

    // 觸發面板瞬態能量脈衝
    triggerCardPulse();

    // 更新黑洞事件視界幾何
    SceneManager.updateBlackHoleScale(massScale);
  });

  const bloomRange = document.getElementById('bloomRange');
  const bloomVal = document.getElementById('bloomVal');
  bloomRange.addEventListener('input', (e) => {
    const bloom = parseFloat(e.target.value);
    bloomVal.textContent = bloom.toFixed(1);
    triggerFlash(bloomVal);
    SceneManager.bloomPass.strength = bloom;
  });

  // 8. 核心動畫渲染迴圈
  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    SceneManager.controls.update();

    // 更新 GPU 吸積盤
    ParticleManager.update(delta, speedFactor, massScale);

    // 更新探測器與意粉化
    ProbeManager.update(massScale);

    // 執行後處理合成渲染
    SceneManager.composer.render();
  }

  animate();
});
