window.I18N = {
  currentLang: 'zh',
  currentMode: 'basic',

  dict: {
    zh: {
      modeBasic: "🚀 探索模式",
      modePro: "⚛️ 科研模式",
      massTitle: "引力質量",
      iscoTitle: "ISCO 軌道",
      photonTitle: "光子球臨界",
      massLabel: "質量調節",
      speedLabel: "自轉速度",
      launchBtn: "🚀 發射探測器",
      missionText: "任務：發射探測器收集 <span class='highlight'>3 顆相對論光譜</span>！",
      evoTitle: "🌌 恆星演化歷程",
      evoPrev: "⏮ 上一階段",
      evoPlay: "▶ 演化播放",
      evoPause: "⏸ 暫停",
      evoNext: "⏭ 下一階段"
    },
    en: {
      modeBasic: "🚀 Explorer",
      modePro: "⚛️ Research",
      massTitle: "Core Mass",
      iscoTitle: "ISCO Orbit",
      photonTitle: "Photon Sphere",
      massLabel: "Mass Tuning",
      speedLabel: "Spin Speed",
      launchBtn: "🚀 Launch Probe",
      missionText: "Mission: Launch probes to collect <span class='highlight'>3 Spectral Data Points</span>!",
      evoTitle: "🌌 Stellar Evolution Timeline",
      evoPrev: "⏮ Prev Stage",
      evoPlay: "▶ Play Evolution",
      evoPause: "⏸ Pause",
      evoNext: "⏭ Next Stage"
    }
  },

  setMode(mode) {
    this.currentMode = mode;
    this.applyModeRules();
    this.updateUI();
  },

  setLang(lang) {
    this.currentLang = lang;
    this.updateUI();
    if (typeof window.EvolutionManager !== 'undefined') {
      window.EvolutionManager.syncUI();
    }
  },

  applyModeRules() {
    const massRange = document.getElementById('massRange');
    if (!massRange) return;
    if (this.currentMode === 'basic') {
      massRange.min = "1.0";
      massRange.max = "3.0";
      if (parseFloat(massRange.value) > 3.0) {
        massRange.value = "2.5";
        massRange.dispatchEvent(new Event('input'));
      }
    } else {
      massRange.min = "1.0";
      massRange.max = "5.0";
    }
  },

  updateUI() {
    const d = this.dict[this.currentLang];
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    const setHTML = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };

    setText('mode-basic', d.modeBasic);
    setText('mode-pro', d.modePro);
    setHTML('missionText', d.missionText);

    setText('label-mass-title', d.massTitle);
    setText('label-isco', d.iscoTitle);
    setText('label-photon', d.photonTitle);
    setText('label-mass', d.massLabel);
    setText('label-speed', d.speedLabel);
    setText('btn-launch-text', d.launchBtn);

    const evoTitle = document.querySelector('.evo-title');
    if (evoTitle) evoTitle.textContent = d.evoTitle;
    setText('prevStageBtn', d.evoPrev);
    setText('nextStageBtn', d.evoNext);

    const playBtn = document.getElementById('playPauseBtn');
    if (playBtn && typeof window.EvolutionManager !== 'undefined') {
      playBtn.textContent = window.EvolutionManager.isPlaying ? d.evoPause : d.evoPlay;
    }
  }
};
