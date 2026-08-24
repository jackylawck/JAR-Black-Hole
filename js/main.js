// 雙模式切換監聽 (含 HUD 重組閃爍與語音播報)
  const modeBasicBtn = document.getElementById('mode-basic');
  const modeProBtn = document.getElementById('mode-pro');
  const uiPanel = document.getElementById('ui-panel');

  function triggerModeSwitch(mode) {
    if (uiPanel) {
      uiPanel.classList.remove('hud-reconfiguring');
      void uiPanel.offsetWidth;
      uiPanel.classList.add('hud-reconfiguring');
    }

    if (mode === 'pro') {
      modeProBtn.classList.add('active');
      modeBasicBtn.classList.remove('active');
      document.body.classList.remove('mode-basic');
      document.body.classList.add('mode-pro');
      I18N.setMode('pro');
    } else {
      modeBasicBtn.classList.add('active');
      modeProBtn.classList.remove('active');
      document.body.classList.remove('mode-pro');
      document.body.classList.add('mode-basic');
      I18N.setMode('basic');
    }

    if (typeof AudioManager !== 'undefined') AudioManager.playUITick?.();

    // 語音播報模式就緒
    if (window.speechSynthesis) {
      const utterText = I18N.dict[I18N.currentLang][mode].voiceWelcome;
      const utter = new SpeechSynthesisUtterance(utterText);
      utter.lang = I18N.currentLang === 'en' ? 'en-US' : 'zh-HK';
      utter.rate = mode === 'pro' ? 1.1 : 1.0;
      utter.pitch = mode === 'pro' ? 0.85 : 1.05;
      window.speechSynthesis.speak(utter);
    }
  }

  if (modeBasicBtn && modeProBtn) {
    modeBasicBtn.addEventListener('click', () => triggerModeSwitch('basic'));
    modeProBtn.addEventListener('click', () => triggerModeSwitch('pro'));
  }

  // 科研模式下，每幀在主迴圈更新相對論實時數據
  function updateProTelemetry(massScale, speedFactor) {
    if (I18N.currentMode !== 'pro') return;
    
    const dopplerEl = document.getElementById('telemetryDoppler');
    const redshiftEl = document.getElementById('telemetryRedshift');

    if (dopplerEl) {
      const delta = (1.0 + (speedFactor / 3.0) * 0.42).toFixed(3);
      dopplerEl.textContent = `γ⁻¹(1 - β·cosθ)⁻¹ = ${delta}`;
    }
    if (redshiftEl) {
      const z = (1.0 / Math.sqrt(Math.max(0.1, 1.0 - (2.0 * massScale) / 12.0))).toFixed(3);
      redshiftEl.textContent = `(1 - 2M/r)⁻¹/² = ${z}`;
    }
  }
