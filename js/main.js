document.addEventListener('DOMContentLoaded', () => {
  // 1. 安全初始化各模組
  try {
    if (typeof window.I18N !== 'undefined' && window.I18N.init) window.I18N.init();
    if (typeof window.SceneManager !== 'undefined' && window.SceneManager.init) window.SceneManager.init();
    if (typeof window.ParticleManager !== 'undefined' && window.ParticleManager.init && window.SceneManager?.scene) {
      window.ParticleManager.init(window.SceneManager.scene, 2.5);
    }
    if (typeof window.ProbeManager !== 'undefined' && window.ProbeManager.init && window.SceneManager?.scene) {
      window.ProbeManager.init(window.SceneManager.scene);
    }
    if (typeof window.EvolutionManager !== 'undefined' && window.EvolutionManager.init && window.SceneManager?.scene) {
      window.EvolutionManager.init(window.SceneManager.scene);
    }
    if (typeof window.NarrativeManager !== 'undefined' && window.NarrativeManager.init) {
      window.NarrativeManager.init();
    }
  } catch (err) {
    console.error('模組初始化異常:', err);
  }

  // 首次點擊解鎖音訊
  const unlockAudio = () => {
    if (typeof window.AudioManager !== 'undefined') {
      if (!window.AudioManager.isInitialized) {
        window.AudioManager.init();
      } else if (window.AudioManager.ctx && window.AudioManager.ctx.state === 'suspended') {
        window.AudioManager.ctx.resume();
      }
    }
  };
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });

  // 🌟 2. 抽屜展開 / 捲起邏輯
  const uiDrawer = document.getElementById('ui-drawer');
  const toggleDrawerBtn = document.getElementById('toggleDrawerBtn');
  const drawerToggleText = document.getElementById('drawerToggleText');
  const drawerToggleIcon = document.getElementById('drawerToggleIcon');

  function toggleDrawer() {
    if (!uiDrawer) return;
    const isClosed = uiDrawer.classList.contains('drawer-closed');
    if (isClosed) {
      uiDrawer.classList.remove('drawer-closed');
      if (drawerToggleText) drawerToggleText.textContent = window.I18N?.currentLang === 'en' ? 'Hide Controls' : '收起控制台';
      if (drawerToggleIcon) drawerToggleIcon.textContent = '✖';
    } else {
      uiDrawer.classList.add('drawer-closed');
      if (drawerToggleText) drawerToggleText.textContent = window.I18N?.currentLang === 'en' ? 'Show Controls' : '展開控制台';
      if (drawerToggleIcon) drawerToggleIcon.textContent = '⚙️';
    }
    if (typeof window.AudioManager !== 'undefined') window.AudioManager.playUITick?.();
  }

  toggleDrawerBtn?.addEventListener('click', toggleDrawer);

  // 🌟 觸控/拖曳畫布旋轉黑洞時，自動捲起收起抽屜
  const canvasContainer = document.getElementById('canvas-container');
  if (canvasContainer && uiDrawer) {
    canvasContainer.addEventListener('pointerdown', () => {
      if (!uiDrawer.classList.contains('drawer-closed')) {
        uiDrawer.classList.add('drawer-closed');
        if (drawerToggleText) drawerToggleText.textContent = window.I18N?.currentLang === 'en' ? 'Show Controls' : '展開控制台';
        if (drawerToggleIcon) drawerToggleIcon.textContent = '⚙️';
      }
    });
  }

  // 3. 狀態管理
  let speedFactor = 1.0;
  let massScale = 1.0;
  const clock = typeof THREE !== 'undefined' ? new THREE.Clock() : { getDelta: () => 0.016, getElapsedTime: () => performance.now() * 0.001 };

  function triggerFlash(el) {
    if (!el) return;
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }

  // 4. 雙模式切換
  const modeBasicBtn = document.getElementById('mode-basic');
  const modeProBtn = document.getElementById('mode-pro');

  function switchMode(mode) {
    if (mode === 'pro') {
      modeProBtn?.classList.add('active');
      modeBasicBtn?.classList.remove('active');
      document.body.classList.remove('mode-basic');
      document.body.classList.add('mode-pro');
      window.I18N?.setMode('pro');
    } else {
      modeBasicBtn?.classList.add('active');
      modeProBtn?.classList.remove('active');
      document.body.classList.remove('mode-pro');
      document.body.classList.add('mode-basic');
      window.I18N?.setMode('basic');
    }
    if (typeof window.AudioManager !== 'undefined') window.AudioManager.playUITick?.();
  }

  modeBasicBtn?.addEventListener('click', () => switchMode('basic'));
  modeProBtn?.addEventListener('click', () => switchMode('pro'));

  // 5. 語言切換
  const btnZh = document.getElementById('btn-zh');
  const btnEn = document.getElementById('btn-en');
  btnZh?.addEventListener('click', () => {
    btnZh.classList.add('active');
    btnEn?.classList.remove('active');
    window.I18N?.setLang('zh');
  });
  btnEn?.addEventListener('click', () => {
    btnEn.classList.add('active');
    btnZh?.classList.remove('active');
    window.I18N?.setLang('en');
  });

  // 6. 滑塊綁定
  const speedRange = document.getElementById('speedRange');
  const speedVal = document.getElementById('speedVal');
  speedRange?.addEventListener('input', (e) => {
    speedFactor = parseFloat(e.target.value);
    if (speedVal) speedVal.textContent = speedFactor.toFixed(1) + ' c';
    triggerFlash(speedVal);
  });

  const massRange = document.getElementById('massRange');
  const massVal = document.getElementById('massVal');
  const massValDisplay = document.getElementById('massValDisplay');
  const iscoVal = document.getElementById('iscoVal');
  const photonVal = document.getElementById('photonVal');

  massRange?.addEventListener('input', (e) => {
    const rawMass = parseFloat(e.target.value);
    massScale = rawMass / 2.5;

    if (massVal) massVal.textContent = rawMass.toFixed(1) + ' M☉';
    if (massValDisplay) massValDisplay.innerHTML = `${rawMass.toFixed(1)} <small>M☉</small>`;
    if (iscoVal) iscoVal.innerHTML = `${(rawMass * 6.0).toFixed(1)} <small>Rs</small>`;
    if (photonVal) photonVal.innerHTML = `${(rawMass * 3.0).toFixed(1)} <small>Rs</small>`;

    triggerFlash(massVal);
    if (typeof window.SceneManager !== 'undefined') {
      window.SceneManager.updateBlackHoleScale(massScale);
    }
  });

  // 7. 演化時間軸控制器
  const evoSlider = document.getElementById('evolutionSlider');
  evoSlider?.addEventListener('input', (e) => {
    if (typeof window.EvolutionManager !== 'undefined') {
      window.EvolutionManager.isPlaying = false;
      window.EvolutionManager.updatePlayBtn?.();
      window.EvolutionManager.setProgress(parseFloat(e.target.value));
    }
  });

  const playPauseBtn = document.getElementById('playPauseBtn');
  playPauseBtn?.addEventListener('click', () => {
    if (typeof window.EvolutionManager !== 'undefined') {
      if (window.EvolutionManager.progress >= 1.0) {
        window.EvolutionManager.progress = 0.0;
      }
      window.EvolutionManager.isPlaying = !window.EvolutionManager.isPlaying;
      window.EvolutionManager.updatePlayBtn?.();
    }
  });

  const prevBtn = document.getElementById('prevStageBtn');
  const nextBtn = document.getElementById('nextStageBtn');
  prevBtn?.addEventListener('click', () => {
    if (typeof window.EvolutionManager !== 'undefined') {
      window.EvolutionManager.isPlaying = false;
      window.EvolutionManager.updatePlayBtn?.();
      window.EvolutionManager.setProgress(window.EvolutionManager.progress - 0.25);
    }
  });
  nextBtn?.addEventListener('click', () => {
    if (typeof window.EvolutionManager !== 'undefined') {
      window.EvolutionManager.isPlaying = false;
      window.EvolutionManager.updatePlayBtn?.();
      window.EvolutionManager.setProgress(window.EvolutionManager.progress + 0.25);
    }
  });

  // 8. 發射探測器
  const launchBtn = document.getElementById('launchBtn');
  launchBtn?.addEventListener('click', () => {
    if (typeof window.ProbeManager !== 'undefined') {
      window.ProbeManager.launch();
    }
    if (typeof window.NarrativeManager !== 'undefined' && typeof window.EvolutionManager !== 'undefined') {
      window.NarrativeManager.onProbeLaunched(window.EvolutionManager.progress);
    }
  });

  // 9. 科研模式遙測
  function updateProTelemetry() {
    if (window.I18N?.currentMode !== 'pro') return;
    const dopplerEl = document.getElementById('telemetryDoppler');
    const redshiftEl = document.getElementById('telemetryRedshift');

    if (dopplerEl) {
      const delta = (1.0 + (speedFactor / 3.0) * 0.42).toFixed(3);
      dopplerEl.textContent = delta;
    }
    if (redshiftEl) {
      const z = (1.0 / Math.sqrt(Math.max(0.1, 1.0 - (2.0 * massScale) / 12.0))).toFixed(3);
      redshiftEl.textContent = z;
    }
  }

  // 10. 動畫主迴圈
  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    if (window.SceneManager?.controls) {
      window.SceneManager.controls.update();
    }

    if (window.SceneManager?.photonRing && window.SceneManager?.camera) {
      window.SceneManager.photonRing.quaternion.copy(window.SceneManager.camera.quaternion);
    }

    try { window.ParticleManager?.update(delta, speedFactor, massScale); } catch (e) {}
    try { window.ProbeManager?.update(massScale); } catch (e) {}
    try { window.EvolutionManager?.update(delta, elapsedTime); } catch (e) {}
    try { window.AudioManager?.updateListenerAndParams(window.SceneManager?.camera, massScale, speedFactor); } catch (e) {}

    updateProTelemetry();

    if (window.SceneManager?.composer) {
      window.SceneManager.composer.render();
    }
  }

  animate();
});
