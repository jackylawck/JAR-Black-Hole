window.I18N = {
  currentLang: 'zh',
  currentMode: 'basic',

  dict: {
    zh: {
      basic: {
        title: "J.A.R. 黑洞大冒險 🚀",
        subtitle: "宇宙神秘黑洞探索系統",
        massLabel: "黑洞重量 (太陽倍數)",
        speedLabel: "旋轉速度",
        iscoText: "安全觀測邊界",
        photonText: "光線轉彎圓環",
        massTitle: "黑洞重量",
        launchBtn: "🚀 發射探測小飛船",
        noteText: "* 太靠近黑洞會被強大引力扯成拉麵（意粉化）！",
        voiceWelcome: "J.A.R. 艦載助理已啟動！今天我們一起探索宇宙中最神奇的黑洞！"
      },
      pro: {
        title: "J.A.R. 數值相對論黑洞終端 ⚛️",
        subtitle: "GR Tensor Metric Solver // Real-Time Geodesic Engine",
        massLabel: "引力質量 M (M☉)",
        speedLabel: "吸積盤角動量 (c)",
        iscoText: "ISCO 軌道 (r_isco)",
        photonText: "光子球半徑 (r_ph)",
        massTitle: "幾何質量 M",
        launchBtn: "📡 注入測地線遙測探針 (RK4 Geodesic)",
        noteText: "* 測地線於 r < r_isco 區域失去約束，四維動量切向量直墜事件視界 r_+。",
        voiceWelcome: "J.A.R. 相對論科研終端已鎖定。克爾度規張量初始化完畢。"
      }
    },
    en: {
      basic: {
        title: "J.A.R. Black Hole Adventure 🚀",
        subtitle: "Space Explorer Simulator",
        massLabel: "Black Hole Mass",
        speedLabel: "Spin Speed",
        iscoText: "Safe Orbit Zone",
        photonText: "Light Bending Ring",
        massTitle: "Core Mass",
        launchBtn: "🚀 Launch Little Probe",
        noteText: "* Getting too close will stretch the probe like spaghetti!",
        voiceWelcome: "J.A.R. Space Assistant active! Let's explore the cosmic black hole!"
      },
      pro: {
        title: "J.A.R. General Relativity Terminal ⚛️",
        subtitle: "Tensor Metric Solver // RK4 Geodesic Stream",
        massLabel: "Gravitational Mass M (M☉)",
        speedLabel: "Disk Angular Velocity (c)",
        iscoText: "ISCO Radius (r_isco)",
        photonText: "Photon Sphere (r_ph)",
        massTitle: "Metric Mass M",
        launchBtn: "📡 Inject Telemetry Probe (RK4 Geodesic)",
        noteText: "* Geodesics become unconstrained inside r < r_isco, plunging past r_+.",
        voiceWelcome: "Relativistic core online. Metric tensor initialized."
      }
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
  },

  // 🌟 玩法與規則差異化控制
  applyModeRules() {
    const massRange = document.getElementById('massRange');
    if (!massRange) return;

    if (this.currentMode === 'basic') {
      // 探索者模式：限制安全範圍 1.0 - 3.0 M☉
      massRange.min = "1.0";
      massRange.max = "3.0";
      if (parseFloat(massRange.value) > 3.0) {
        massRange.value = "2.5";
        massRange.dispatchEvent(new Event('input'));
      }
    } else {
      // 科研者模式：解鎖極限引力 1.0 - 10.0 M☉
      massRange.min = "1.0";
      massRange.max = "10.0";
    }
  },

  updateUI() {
    const data = this.dict[this.currentLang][this.currentMode];
    
    const titleEl = document.getElementById('ui-title');
    const subEl = document.getElementById('ui-subtitle');
    const massLbl = document.getElementById('label-mass');
    const speedLbl = document.getElementById('label-speed');
    const iscoLbl = document.getElementById('label-isco');
    const photonLbl = document.getElementById('label-photon');
    const massTitle = document.getElementById('label-mass-title');
    const launchTxt = document.getElementById('btn-launch-text');
    const noteEl = document.getElementById('ui-note');

    if (titleEl) titleEl.textContent = data.title;
    if (subEl) subEl.textContent = data.subtitle;
    if (massLbl) massLbl.textContent = data.massLabel;
    if (speedLbl) speedLbl.textContent = data.speedLabel;
    if (iscoLbl) iscoLbl.textContent = data.iscoText;
    if (photonLbl) photonLbl.textContent = data.photonText;
    if (massTitle) massTitle.textContent = data.massTitle;
    if (launchTxt) launchTxt.textContent = data.launchBtn;
    if (noteEl) noteEl.textContent = data.noteText;
  }
};
