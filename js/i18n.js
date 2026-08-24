window.I18N = {
  currentLang: 'zh',
  currentMode: 'basic',

  dict: {
    zh: {
      brandTitle: "J.A.R. 黑洞 3D",
      brandSubtitle: "廣義相對論實時模擬器",
      modeBasic: "🚀 探索模式",
      modePro: "⚛️ 科研模式",
      drawerTitle: "⚙️ 控制台 (點擊展開/收起)",
      mobMass: "質量",
      mobIsco: "ISCO",
      mobStage: "演化階段",
      missionBadge: "MISSION",
      missionText: "任務：發射探測器收集 3 顆相對論光譜數據！",
      massTitle: "引力質量",
      iscoTitle: "ISCO 軌道",
      photonTitle: "光子球臨界",
      massLabel: "質量調節",
      speedLabel: "自轉速度",
      launchBtn: "🚀 發射探測器 (意粉化遙測)",
      noteText: "* 當物質穿越 ISCO (最內穩定圓軌道) 後，軌道失去穩定性直墜事件視界。",
      evoTitle: "🌌 恆星演化歷程",
      evoPrev: "⏮ 上一階段",
      evoPlay: "▶ 演化播放",
      evoPause: "⏸ 暫停",
      evoNext: "⏭ 下一階段"
    },
    en: {
      brandTitle: "J.A.R. Black Hole 3D",
      brandSubtitle: "General Relativity Real-Time Simulator",
      modeBasic: "🚀 Explorer",
      modePro: "⚛️ Research",
      drawerTitle: "⚙️ Console (Tap to Expand/Collapse)",
      mobMass: "MASS",
      mobIsco: "ISCO",
      mobStage: "STAGE",
      missionBadge: "MISSION",
      missionText: "Mission: Launch probes to capture 3 relativistic spectral data points!",
      massTitle: "Core Mass",
      iscoTitle: "ISCO Orbit",
      photonTitle: "Photon Sphere",
      massLabel: "Mass Tuning",
      speedLabel: "Spin Speed",
      launchBtn: "🚀 Launch Probe (Spaghettification)",
      noteText: "* Inside ISCO (Innermost Stable Circular Orbit), orbital stability is lost into the horizon.",
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

    // 官方品牌標題
    setText('ui-title', d.brandTitle);
    setText('ui-subtitle', d.brandSubtitle);

    // 模式切換按鈕
    setText('mode-basic', d.modeBasic);
    setText('mode-pro', d.modePro);

    // 手機頂部標籤
    const mobChips = document.querySelectorAll('.mobile-hud-bar .chip-label');
    if (mobChips.length >= 3) {
      mobChips[0].textContent = d.mobMass;
      mobChips[1].textContent = d.mobIsco;
      mobChips[2].textContent = d.mobStage;
    }

    // 抽屜標題
    const drawerTitle = document.querySelector('.handle-title');
    if (drawerTitle) drawerTitle.textContent = d.drawerTitle;

    // 任務與遙測大字
    const missionBadge = document.querySelector('.mission-badge');
    if (missionBadge) missionBadge.textContent = d.missionBadge;
    setText('missionText', d.missionText);

    setText('label-mass-title', d.massTitle);
    setText('label-isco', d.iscoTitle);
    setText('label-photon', d.photonTitle);

    // 控制項與註腳
    setText('label-mass', d.massLabel);
    setText('label-speed', d.speedLabel);
    setText('btn-launch-text', d.launchBtn);
    setText('ui-note', d.noteText);

    // 演化控制器
    const evoTitle = document.querySelector('.evolution-title');
    if (evoTitle) evoTitle.textContent = d.evoTitle;
    setText('prevStageBtn', d.evoPrev);
    setText('nextStageBtn', d.evoNext);

    const playBtn = document.getElementById('playPauseBtn');
    if (playBtn && typeof window.EvolutionManager !== 'undefined') {
      playBtn.textContent = window.EvolutionManager.isPlaying ? d.evoPause : d.evoPlay;
    }
  }
};
