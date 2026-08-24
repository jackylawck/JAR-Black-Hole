window.NarrativeManager = {
  synth: window.speechSynthesis || null,
  isVoiceEnabled: true,
  currentMissionIndex: 0,
  collectedData: 0,
  targetData: 100,

  lines: {
    0: {
      zh: "J.A.R. 系統啟動。前方是一片低溫原始分子星雲，引力塌縮正在醞釀。",
      en: "J.A.R. Systems online. Cold molecular nebula detected. Gravitational collapse in progress."
    },
    1: {
      zh: "藍色主序星點亮！核心每秒燃燒數億噸氫，那是生命與能量的極致咆哮。",
      en: "Blue Supergiant ignition confirmed. Outward radiation pressure balances inward gravity."
    },
    2: {
      zh: "警告：鐵核聚變停止，紅超巨星開始失去平衡，劇烈脈動已無法遏制！",
      en: "Warning: Iron fusion complete. Red Supergiant destabilizing with massive pulsations!"
    },
    3: {
      zh: "超新星衝擊波爆發！核心塌縮引發巨大反彈，太空站正在承受極限衝擊！",
      en: "Supernova shockwave released! Catastrophic rebound in progress. Shield critical!"
    },
    4: {
      zh: "事件視界凝結完成。物質跨越最後的臨界，黑洞奇異點已經誕生。",
      en: "Event Horizon established. Matter crossed the point of no return. Singularity born."
    }
  },

  init() {
    this.updateMissionUI();
  },

  speakStage(stageIndex) {
    if (!this.synth || !this.isVoiceEnabled) return;
    this.synth.cancel();

    const isEn = window.I18N?.currentLang === 'en';
    const text = this.lines[stageIndex] ? (isEn ? this.lines[stageIndex].en : this.lines[stageIndex].zh) : '';
    if (!text) return;

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = isEn ? 1.05 : 1.0;
    utter.pitch = 0.95;
    utter.lang = isEn ? 'en-US' : 'zh-HK';

    try {
      this.synth.speak(utter);
    } catch (e) {}
  },

  onProbeLaunched(currentEvolutionProgress) {
    if (this.currentMissionIndex === 0) {
      if (currentEvolutionProgress < 0.82) {
        this.collectedData = Math.min(100, this.collectedData + 35);
        this.updateMissionUI();
      }
    }
  },

  updateMissionUI() {
    const missionText = document.getElementById('missionText');
    if (!missionText) return;

    const isEn = window.I18N?.currentLang === 'en';
    if (this.collectedData >= 100) {
      missionText.innerHTML = isEn 
        ? `<span style="color:#10b981;">🎉 Mission Complete! Achievement Unlocked: [Spectra Guardian]</span>`
        : `<span style="color:#10b981;">🎉 任務完成！獲得成就：【光譜守望者】</span>`;
    } else {
      missionText.textContent = isEn
        ? `Mission: Launch probes before supernova to gather spectral data! [${this.collectedData}% / ${this.targetData}%]`
        : `任務：在超新星爆發前發射探測器收集光譜數據！[${this.collectedData}% / ${this.targetData}%]`;
    }
  }
};
