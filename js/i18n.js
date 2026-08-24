const I18N = {
  currentLang: 'zh-HK',
  dict: {
    'zh-HK': {
      title: '🌌 J.A.R. 黑洞 3D',
      subtitle: '聯合應用科學探索 • 天體物理分部',
      desc: '實時計算愛因斯坦廣義相對論「重力透鏡」、RK4 測地線光線彎曲與相對論性都卜勒聚束效應。',
      speedLabel: '自轉速度 (Rotation Speed)',
      massLabel: '引力質量 (Gravitational Mass)',
      bloomLabel: '輝光強度 (Bloom Intensity)',
      statsTitle: '🔬 即時相對論數據 (Live Metrics)',
      iscoLabel: 'ISCO 內邊界 (3 Rs):',
      photonRadiusLabel: '光子球半徑 (1.5 Rs):',
      dopplerStatus: '都卜勒效應狀態: 左側藍移 (增亮) / 右側紅移 (衰減)',
      spaghettiBtn: '🚀 發射探測器 (意粉化測試)'
    },
    'en': {
      title: '🌌 J.A.R. Black Hole 3D',
      subtitle: 'JOINT APPLIED RESEARCH • ASTROPHYSICS DIVISION',
      desc: 'Real-time simulation of Einstein\'s General Relativity, RK4 raymarching, gravitational lensing, and Doppler beaming.',
      speedLabel: 'Rotation Speed',
      massLabel: 'Gravitational Mass',
      bloomLabel: 'Bloom Intensity',
      statsTitle: '🔬 Live Relativistic Metrics',
      iscoLabel: 'ISCO Inner Edge (3 Rs):',
      photonRadiusLabel: 'Photon Sphere (1.5 Rs):',
      dopplerStatus: 'Doppler State: Left Blueshift (Brighter) / Right Redshift (Dimmer)',
      spaghettiBtn: '🚀 Launch Probe (Spaghettification)'
    }
  },

  init() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.setLanguage(e.target.dataset.lang);
      });
    });
    this.applyLanguage();
  },

  setLanguage(lang) {
    if (this.dict[lang]) {
      this.currentLang = lang;
      this.applyLanguage();
    }
  },

  applyLanguage() {
    const data = this.dict[this.currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (data[key]) el.textContent = data[key];
    });
  }
};
