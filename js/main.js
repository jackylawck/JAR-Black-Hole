document.addEventListener('DOMContentLoaded', () => {
  const uiPanel = document.getElementById('ui-panel');
  if (uiPanel) {
    uiPanel.style.opacity = '0';
    uiPanel.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
  }

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

  // 解鎖音訊 (首次使用者互動)
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

  requestAnimationFrame(() => {
    if (uiPanel) uiPanel.style.opacity = '1';
  });

  // 2. 狀態管理
  let speedFactor = 1.0;
  let massScale = 1.0;
  let lastMass = 2.5;
  let lastIsco = 15.0;
  let lastPhoton = 7.5;
  let lastDoppler = 1.42;
  let lastRedshift = 1.28;

  const clock = typeof THREE !== 'undefined' ? new THREE.Clock() : { getDelta: () => 0.016, getElapsedTime: () => performance.now() * 0.001 };

  // 🌟 獨立平滑數值緩動動畫管線 (Cubic Easing)
  function animateValue(el, start, end, suffix, decimals = 1, duration = 280) {
    if (!el) return;
    const startTime = performance.now();
    const range = end - start;

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const eased = 1.0 - Math.pow(1.0 - progress, 3);
      const currentVal = (start + range * eased).toFixed(decimals);
      
      el.innerHTML = `${currentVal} <small>${suffix}</small>`;
      if (progress < 1.0) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  // 🌟 度規曲率狀態機更新 (STABLE -> WARNING -> CRITICAL) 與音訊聯動
  function updateCurvatureState(mass) {
    const horizonBadge = document.getElementById('horizonState');
    if (!horizonBadge) return;

    horizonBadge.classList.remove('status-stable', 'status-warning', 'status-critical');

    let state = 'STABLE';
    if (mass < 3.0) {
      horizonBadge.textContent = 'STABLE';
      horizonBadge.classList.add('status-stable');
      state = 'STABLE';
    } else if (mass < 4.5) {
      horizonBadge.textContent = 'WARNING';
      horizonBadge.classList.add('status-warning');
      state = 'WARNING';
    } else {
      horizonBadge.textContent = 'CRITICAL';
      horizonBadge.classList.add('status-critical');
      state = 'CRITICAL';
    }

    if (typeof window.AudioManager !== 'undefined') {
      window.AudioManager.updateCurvatureAudio(state, massScale, speedFactor);
    }
  }

  // 3. 雙模式切換
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

  // 4. 語言切換
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

  // 5. 滑塊互動綁定與全指標獨立滾動
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
    massScale = rawMass / 2.5;

    const newIsco = rawMass * 6.0;
    const newPhoton = rawMass * 3.0;
    const newDoppler = 1.0 + (speedFactor / 3.0) * 0.42;
    const newRedshift = 1.0 / Math.sqrt(Math.max(0.1, 1.0 - (2.0 * massScale) / 12.0));

    animateValue(massValDisplay, lastMass, rawMass, 'M☉', 1);
    animateValue(iscoVal, lastIsco, newIsco, 'Rs', 1);
    animateValue(photonVal, lastPhoton, newPhoton, 'Rs', 1);
    animateValue(document.getElementById('telemetryDoppler'), lastDoppler, newDoppler, 'δ', 2);
    animateValue(document.getElementById('telemetryRedshift'), lastRedshift, newRedshift, '1+z', 2);

    lastMass = rawMass;
    lastIsco = newIsco;
    lastPhoton = newPhoton;
    lastDoppler = newDoppler;
    lastRedshift = newRedshift;

    if (massVal) massVal.textContent = rawMass.toFixed(1) + ' M☉';
    updateCurvatureState(rawMass);

    if (typeof window.SceneManager !== 'undefined') {
      window.SceneManager.updateBlackHoleScale(massScale);
    }
  }

  massRange?.addEventListener('input', triggerMetricUpdate);

  // 6. 演化時間軸控制器
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

  // 7. 發射探測器
  const launchBtn = document.getElementById('launchBtn');
  launchBtn?.addEventListener('click', () => {
    if (typeof window.ProbeManager !== 'undefined') {
      window.ProbeManager.launch();
    }
    if (typeof window.NarrativeManager !== 'undefined' && typeof window.EvolutionManager !== 'undefined') {
      window.NarrativeManager.onProbeLaunched(window.EvolutionManager.progress);
    }
  });

  // 8. ⚛️ 科研模式：動態滾動測地線張量日誌
  let logTimer = 0;
  function updateProTerminalStream(delta) {
    if (window.I18N?.currentMode !== 'pro') return;

    logTimer += delta;
    if (logTimer >= 0.6) {
      logTimer = 0;
      const logContainer = document.getElementById('proTerminalLog');
      if (!logContainer) return;

      const g00 = (-(1.0 - (2.0 * massScale) / 10.0)).toFixed(4);
      const christoffel = (0.012 * massScale * Math.random()).toFixed(5);
      const timeStamp = (performance.now() * 0.001).toFixed(2);

      const logTemplates = [
        `[${timeStamp}s] GEODESIC RK4: g_00=${g00} | Γ^r_tt=${christoffel}`,
        `[${timeStamp}s] FLUX DENSITY: ${ (1420 * massScale).toFixed(0) } Jy | POLARIZATION: ${(speedFactor * 33.2).toFixed(1)}%`,
        `[${timeStamp}s] FRAME-DRAGGING: ω=${(speedFactor * 0.12).toFixed(4)} rad/s | r_+=${(2 * massScale).toFixed(2)}Rs`
      ];

      const newLine = document.createElement('div');
      newLine.className = 'pro-stream-line';
      newLine.textContent = `>> ` + logTemplates[Math.floor(Math.random() * logTemplates.length)];

      logContainer.insertBefore(newLine, logContainer.firstChild);
      while (logContainer.children.length > 3) {
        logContainer.removeChild(logContainer.lastChild);
      }
    }
  }

  // 9. 動畫主迴圈
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
    try {
      window.AudioManager?.updateListenerAndParams(window.SceneManager?.camera, massScale, speedFactor);
      window.AudioManager?.applyAnalogJitter(elapsedTime);
    } catch (e) {}

    updateProTerminalStream(delta);

    // 雙重視口渲染（主座艙視角 + 探測器 POV PiP）
    if (window.SceneManager?.renderDualViewport) {
      window.SceneManager.renderDualViewport();
    }
  }

  updateCurvatureState(2.5);
  animate();
});
