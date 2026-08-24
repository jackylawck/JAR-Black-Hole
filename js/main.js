document.addEventListener('DOMContentLoaded', () => {
  // 1. 初始化各物理、音訊與視覺模組
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

  // 首次點擊/觸碰時解鎖 Web Audio API
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

  // 2. 核心狀態管理與時間微積分
  let speedFactor = 1.0;
  let massScale = 2.5;
  let lastMass = 2.5;
  let lastIsco = 15.0;
  let lastPhoton = 7.5;
  let lastDoppler = 1.42;
  let lastRedshift = 1.28;

  let lastFrameTime = performance.now();

  // 平滑數值緩動動畫 (Cubic Easing)
  function animateValue(el, start, end, suffix, decimals = 1, duration = 240) {
    if (!el) return;
    const startTime = performance.now();
    const range = end - start;

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const eased = 1.0 - Math.pow(1.0 - progress, 3);
      const currentVal = (start + range * eased).toFixed(decimals);
      
      el.innerHTML = suffix ? `${currentVal} <small>${suffix}</small>` : currentVal;
      if (progress < 1.0) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  // 3. 時空度規曲率狀態機更新 (STABLE -> WARNING -> CRITICAL)
  function updateCurvatureState(mass) {
    const horizonBadge = document.getElementById('horizonState');
    if (!horizonBadge) return;

    horizonBadge.classList.remove('status-stable', 'status-warning', 'status-critical');

    let state = 'STABLE';
    if (mass < 2.2) {
      horizonBadge.textContent = 'STABLE';
      horizonBadge.classList.add('status-stable');
      state = 'STABLE';
    } else if (mass < 2.8) {
      horizonBadge.textContent = 'WARNING';
      horizonBadge.classList.add('status-warning');
      state = 'WARNING';
    } else {
      horizonBadge.textContent = 'CRITICAL';
      horizonBadge.classList.add('status-critical');
      state = 'CRITICAL';
    }

    if (typeof window.AudioManager !== 'undefined') {
      window.AudioManager.updateCurvatureAudio(state, mass / 2.5, speedFactor);
    }
  }

  // 4. 運行模式與多語言切換
  const modeBasicBtn = document.getElementById('mode-basic');
  const modeProBtn = document.getElementById('mode-pro');
  modeBasicBtn?.addEventListener('click', () => {
    modeBasicBtn.classList.add('active');
    modeProBtn?.classList.remove('active');
    document.body.classList.remove('mode-pro');
    window.I18N?.setMode('basic');
  });
  modeProBtn?.addEventListener('click', () => {
    modeProBtn.classList.add('active');
    modeBasicBtn?.classList.remove('active');
    document.body.classList.add('mode-pro');
    window.I18N?.setMode('pro');
  });

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

  // 5. 🧮 接入 GRPhysics 張量與特徵軌道計算
  const speedRange = document.getElementById('speedRange');
  const speedVal = document.getElementById('speedVal');
  speedRange?.addEventListener('input', (e) => {
    speedFactor = parseFloat(e.target.value);
    if (speedVal) speedVal.textContent = speedFactor.toFixed(1) + ' c';
    triggerMetricUpdate();
  });

  const massRange = document.getElementById('massRange');
  const massVal = document.getElementById('massVal');
  const massValDisplay = document.getElementById('massValDisplay');
  const iscoVal = document.getElementById('iscoVal');
  const photonVal = document.getElementById('photonVal');

  function triggerMetricUpdate() {
    const rawMass = parseFloat(massRange ? massRange.value : 2.5);
    massScale = rawMass;

    const spin_a = Math.min(0.98, (speedFactor / 3.0) * 0.9);

    let newIsco = rawMass * 6.0;
    let newPhoton = rawMass * 3.0;
    let newDoppler = 1.42;
    let newRedshift = 1.28;

    if (typeof window.GRPhysics !== 'undefined') {
      newIsco = window.GRPhysics.getISCO(rawMass, spin_a);
      const phObj = window.GRPhysics.getPhotonOrbit(rawMass, spin_a);
      newPhoton = phObj.prograde;
      
      const shiftObj = window.GRPhysics.getSpectralShiftFactor(newIsco * 1.2, Math.PI / 2, 0.45, rawMass, spin_a);
      newDoppler = 1.0 + (1.0 / Math.max(0.1, shiftObj.gFactor) - 1.0) * 0.35;
      newRedshift = shiftObj.gravitationalRedshift;
    }

    animateValue(massValDisplay, lastMass, rawMass, 'M☉', 1);
    animateValue(iscoVal, lastIsco, newIsco, 'Rs', 1);
    animateValue(photonVal, lastPhoton, newPhoton, 'Rs', 1);
    animateValue(document.getElementById('telemetryDoppler'), lastDoppler, newDoppler, '', 2);
    animateValue(document.getElementById('telemetryRedshift'), lastRedshift, newRedshift, '', 2);

    lastMass = rawMass;
    lastIsco = newIsco;
    lastPhoton = newPhoton;
    lastDoppler = newDoppler;
    lastRedshift = newRedshift;

    if (massVal) massVal.textContent = rawMass.toFixed(1) + ' M☉';
    updateCurvatureState(rawMass);

    if (typeof window.SceneManager !== 'undefined') {
      window.SceneManager.updateBlackHoleScale(rawMass / 2.5, spin_a);
    }
  }

  massRange?.addEventListener('input', triggerMetricUpdate);

  // 6. 恆星演化時間軸控制器
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
      if (window.EvolutionManager.progress >= 1.0) window.EvolutionManager.progress = 0.0;
      window.EvolutionManager.isPlaying = !window.EvolutionManager.isPlaying;
      window.EvolutionManager.updatePlayBtn?.();
    }
  });

  document.getElementById('prevStageBtn')?.addEventListener('click', () => {
    if (typeof window.EvolutionManager !== 'undefined') {
      window.EvolutionManager.isPlaying = false;
      window.EvolutionManager.setProgress(window.EvolutionManager.progress - 0.25);
    }
  });
  document.getElementById('nextStageBtn')?.addEventListener('click', () => {
    if (typeof window.EvolutionManager !== 'undefined') {
      window.EvolutionManager.isPlaying = false;
      window.EvolutionManager.setProgress(window.EvolutionManager.progress + 0.25);
    }
  });

  // 7. 發射探測器
  document.getElementById('launchBtn')?.addEventListener('click', () => {
    if (typeof window.ProbeManager !== 'undefined') {
      window.ProbeManager.launch();
    }
    if (typeof window.NarrativeManager !== 'undefined' && typeof window.EvolutionManager !== 'undefined') {
      window.NarrativeManager.onProbeLaunched(window.EvolutionManager.progress);
    }
  });

  // 8. 主動畫迴圈 (高刷新率幀率自適應)
  function animate(now) {
    requestAnimationFrame(animate);

    const rawDelta = (now - lastFrameTime) * 0.001;
    const delta = Math.min(Math.max(rawDelta, 0.001), 0.05);
    lastFrameTime = now;
    const elapsedTime = now * 0.001;

    if (window.SceneManager?.controls) {
      window.SceneManager.controls.update();
    }

    try { window.ParticleManager?.update(delta, speedFactor, massScale / 2.5); } catch (e) {}
    try { window.ProbeManager?.update(massScale / 2.5); } catch (e) {}
    try { window.EvolutionManager?.update(delta, elapsedTime); } catch (e) {}
    try {
      window.AudioManager?.updateListenerAndParams(window.SceneManager?.camera, massScale / 2.5, speedFactor);
      window.AudioManager?.applyAnalogJitter(elapsedTime);
    } catch (e) {}

    if (window.SceneManager?.renderDualViewport) {
      window.SceneManager.renderDualViewport(elapsedTime);
    }
  }

  updateCurvatureState(2.5);
  requestAnimationFrame(animate);
});
