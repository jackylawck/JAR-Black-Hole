window.I18N = {
  currentLang: 'zh',
  currentMode: 'basic',

  dict: {
    zh: {
      hudOnline: 'HUD ONLINE',
      explorer: '🚀 探索模式',
      research: '⚛️ 科研模式',
      massTitle: '質量 (MASS)',
      isco: 'ISCO 軌道',
      photon: '光子球',
      doppler: '都卜勒 (δ)',
      redshift: '紅移 (1+z)',
      metric: '度規',
      massTuning: '質量調節',
      spinSpeed: '自轉速度',
      launchProbe: '🚀 發射探測器',
      prevStage: '⏮ 上一階段',
      nextStage: '⏭ 下一階段',
      playEvolution: '▶ 演化播放',
      pauseEvolution: '⏸ 暫停',
      timelineTitle: '🌌 恆星演化:',
      stages: [
        { name: '原恆星重力吸積', desc: '星際氣體在萬有引力下塌縮凝聚，核心溫度急劇攀升。' },
        { name: '藍超巨星主序期', desc: '核心進行劇烈熱核融合，向外輻射壓與重力達成流體靜力平衡。' },
        { name: '超新星爆發 (核塌縮)', desc: '鐵核燃料耗盡引發災難性引力塌縮，外層物質以相對論速度轟擊噴發！' },
        { name: '黑洞奇異點 (事件視界與吸積盤)', desc: '殘餘核心質量突破歐本海默極限，核心徹底塌縮形成事件視界與吸積盤。' }
      ]
    },
    en: {
      hudOnline: 'HUD ONLINE',
      explorer: '🚀 Explorer',
      research: '⚛️ Research',
      massTitle: 'CORE MASS',
      isco: 'ISCO ORBIT',
      photon: 'PHOTON SPHERE',
      doppler: 'DOPPLER (δ)',
      redshift: 'REDSHIFT (1+z)',
      metric: 'METRIC',
      massTuning: 'Mass Tuning',
      spinSpeed: 'Spin Speed',
      launchProbe: '🚀 Launch Probe',
      prevStage: '⏮ Prev Stage',
      nextStage: '⏭ Next Stage',
      playEvolution: '▶ Play Evolution',
      pauseEvolution: '⏸ Pause',
      timelineTitle: '🌌 Stellar Evolution:',
      stages: [
        { name: 'Protostar Accretion', desc: 'Interstellar gas collapses under gravity, core temperature surges rapidly.' },
        { name: 'Blue Supergiant', desc: 'Thermonuclear fusion balances immense gravitational collapse in hydrostatic equilibrium.' },
        { name: 'Supernova Explosion', desc: 'Iron core collapse triggers catastrophic shockwave ejecting outer envelope at relativistic speeds!' },
        { name: 'Black Hole Singularity', desc: 'Remnant core exceeds Oppenheimer limit, collapsing completely into event horizon & accretion disk.' }
      ]
    }
  },

  init() {
    this.updateDOM();
  },

  setLang(lang) {
    this.currentLang = lang;
    this.updateDOM();
    if (window.EvolutionManager?.applyStageVisuals) {
      window.EvolutionManager.applyStageVisuals(window.EvolutionManager.progress);
    }
  },

  setMode(mode) {
    this.currentMode = mode;
  },

  updateDOM() {
    const t = this.dict[this.currentLang];
    if (!t) return;

    const elModeBasic = document.getElementById('mode-basic');
    if (elModeBasic) elModeBasic.textContent = t.explorer;

    const elModePro = document.getElementById('mode-pro');
    if (elModePro) elModePro.textContent = t.research;

    const elMassTitle = document.getElementById('label-mass-title');
    if (elMassTitle) elMassTitle.textContent = t.massTitle;

    const elIsco = document.getElementById('label-isco');
    if (elIsco) elIsco.textContent = t.isco;

    const elPhoton = document.getElementById('label-photon');
    if (elPhoton) elPhoton.textContent = t.photon;

    const elMassLabel = document.getElementById('label-mass');
    if (elMassLabel) elMassLabel.textContent = t.massTuning;

    const elSpeedLabel = document.getElementById('label-speed');
    if (elSpeedLabel) elSpeedLabel.textContent = t.spinSpeed;

    const elLaunch = document.getElementById('btn-launch-text');
    if (elLaunch) elLaunch.textContent = t.launchProbe;

    const elPrev = document.getElementById('prevStageBtn');
    if (elPrev) elPrev.textContent = t.prevStage;

    const elNext = document.getElementById('nextStageBtn');
    if (elNext) elNext.textContent = t.nextStage;

    const elPlay = document.getElementById('playPauseBtn');
    if (elPlay && window.EvolutionManager) {
      elPlay.textContent = window.EvolutionManager.isPlaying ? t.pauseEvolution : t.playEvolution;
    }

    const evoTitle = document.querySelector('.evo-mini-title');
    if (evoTitle) evoTitle.textContent = t.timelineTitle;
  }
};
