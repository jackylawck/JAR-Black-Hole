// 防禦性依賴檢查
const requiredModules = ['I18N', 'Physics', 'SceneManager', 'ParticleManager', 'ProbeManager'];
requiredModules.forEach(mod => {
  if (typeof window[mod] === 'undefined') {
    console.error(`CRITICAL ERROR: 缺少核心依賴模組 -> ${mod}.js`);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const uiPanel = document.getElementById('ui-panel');
  if (uiPanel) {
    uiPanel.style.opacity = '0';
    uiPanel.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
  }

  // 1. 初始化核心模組 (音訊採使用者首觸延遲初始化)
  try {
    if (typeof I18N !== 'undefined') I18N.init();
    if (typeof SceneManager !== 'undefined') SceneManager.init();
    if (typeof ParticleManager !== 'undefined') ParticleManager.init(SceneManager.scene, 2.5);
    if (typeof ProbeManager !== 'undefined') ProbeManager.init(SceneManager.scene);
  } catch (err) {
    console.error('初始化流程發生異常:', err);
  }

  // 使用者首觸啟動音頻引擎 (符合 Autoplay Policy)
  const unlockAndInitAudio = () => {
    if (typeof AudioManager !== 'undefined') {
      if (!AudioManager.isInitialized) {
        AudioManager.init();
      } else if (AudioManager.ctx && AudioManager.ctx.state === 'suspended') {
        AudioManager.ctx.resume();
      }
    }
  };
  window.addEventListener('click', unlockAndInitAudio, { once: true });
  window.addEventListener('touchstart', unlockAndInitAudio, { once: true });

  // 載入完成淡入
  requestAnimationFrame(() => {
    if (uiPanel) uiPanel.style.opacity = '1';
  });

  // 2. 狀態管理
  let speedFactor = 1.0;
  let massScale = 1.0;
  let clock = new THREE.Clock();
  let lastTickTime = 0;

  // 數值閃爍 + 微音效觸發
  function triggerFlash(el) {
    if (!el) return;
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');

    if (typeof AudioManager !== 'undefined') {
      AudioManager.playUITick?.();
    }
  }

  // 3. UI 互動事件監聽
  const speedRange = document.getElementById('speedRange');
  const speedVal = document.getElementById('speedVal');
  if (speedRange && speedVal) {
    speedRange.addEventListener('input', (e) => {
      speedFactor = parseFloat(e.target.value);
      speedVal.textContent = speedFactor.toFixed(1) + ' c';
      triggerFlash(speedVal);
    });
  }

  const massRange = document.getElementById('massRange');
  const massVal = document.getElementById('massVal');
  const massValDisplay = document.getElementById('massValDisplay');
  const iscoVal = document.getElementById('iscoVal');
  const photonVal = document.getElementById('photonVal');

  if (massRange) {
    massRange.addEventListener('input', (e) => {
      const rawMass = parseFloat(e.target.value);
      massScale = rawMass / 2.5;

      if (massVal) massVal.textContent = rawMass.toFixed(1) + ' M☉';
      if (massValDisplay) massValDisplay.innerHTML = `${rawMass.toFixed(1)} <small>M☉</small>`;
      if (iscoVal) iscoVal.innerHTML = `${(rawMass * 6.0).toFixed(1)} <small>Rs</small>`;
      if (photonVal) photonVal.innerHTML = `${(rawMass * 3.0).toFixed(1)} <small>Rs</small>`;

      triggerFlash(massVal);
      if (massValDisplay) triggerFlash(massValDisplay);
      if (iscoVal) triggerFlash(iscoVal);
      if (photonVal) triggerFlash(photonVal);

      if (typeof AudioManager !== 'undefined') {
        AudioManager.triggerGravityPulse?.();
      }

      if (typeof SceneManager !== 'undefined') {
        SceneManager.updateBlackHoleScale(massScale);
      }
    });
  }

  const bloomRange = document.getElementById('bloomRange');
  const bloomVal = document.getElementById('bloomVal');
  if (bloomRange && bloomVal) {
    bloomRange.addEventListener('input', (e) => {
      const bloom = parseFloat(e.target.value);
      bloomVal.textContent = bloom.toFixed(1);
      triggerFlash(bloomVal);
      if (SceneManager && SceneManager.bloomPass) {
        SceneManager.bloomPass.strength = bloom;
      }
    });
  }

  // 4. 100ms 系統心跳引擎 (星空微漂移與音訊健康度檢查)
  function onSystemTick() {
    if (SceneManager && SceneManager.backgroundStars) {
      SceneManager.backgroundStars.rotation.y += 0.0003;
      SceneManager.backgroundStars.rotation.x += 0.0001;
    }

    if (typeof AudioManager !== 'undefined' && AudioManager.isInitialized && AudioManager.ctx) {
      if (AudioManager.ctx.state === 'interrupted') {
        AudioManager.ctx.resume();
      }
    }
  }

  // 5. 具備錯誤隔離的動畫主迴圈
  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const now = performance.now();

    // 系統週期 Tick
    if (now - lastTickTime > 100) {
      lastTickTime = now;
      onSystemTick();
    }

    // 控制器更新
    if (SceneManager && SceneManager.controls) {
      SceneManager.controls.update();
    }

    // 光子環 Billboard 對齊
    if (SceneManager && SceneManager.photonRing && SceneManager.camera) {
      SceneManager.photonRing.quaternion.copy(SceneManager.camera.quaternion);
    }

    // 粒子系統更新
    try {
      if (typeof ParticleManager !== 'undefined') {
        ParticleManager.update(delta, speedFactor, massScale);
      }
    } catch (err) {
      console.warn('ParticleManager update 異常:', err);
    }

    // 探測器系統更新
    try {
      if (typeof ProbeManager !== 'undefined') {
        ProbeManager.update(massScale);
      }
    } catch (err) {
      console.warn('ProbeManager update 異常:', err);
    }

    // 空間聽覺每幀調製
    try {
      if (typeof AudioManager !== 'undefined' && SceneManager && SceneManager.camera) {
        AudioManager.updateListenerAndParams(SceneManager.camera, massScale, speedFactor);
      }
    } catch (err) {
      console.warn('AudioManager update 異常:', err);
    }

    // 後處理渲染
    if (SceneManager && SceneManager.composer) {
      SceneManager.composer.render();
    }
  }

  animate();
});
