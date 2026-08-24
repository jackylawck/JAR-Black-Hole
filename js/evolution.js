window.EvolutionManager = {
  isPlaying: false,
  progress: 1.0,
  currentStageIndex: 4,
  shakeIntensity: 0.0,
  
  starTransitionMesh: null,
  supernovaShockwaveRing: null,
  supernovaFlashMesh: null,

  keyframes: [
    {
      p: 0.0,
      titleZh: '原始分子星雲',
      titleEn: 'Stellar Molecular Nebula',
      descZh: '星際低溫氣體在萬有引力作用下聚集成核，引力勢能轉化為內能。',
      descEn: 'Cold interstellar gas collapses under gravity, converting potential energy into thermal energy.',
      starScale: 0.9,
      starColor: new THREE.Color(0x38bdf8),
      starOpacity: 0.35,
      flashOpacity: 0.0,
      shockwaveScale: 0.1,
      shockwaveOpacity: 0.0,
      bhScale: 0.0,
      diskOpacity: 0.0,
      ringOpacity: 0.0,
      bloomStrength: 0.8,
      audioFreq: 300,
      speedRate: 0.09
    },
    {
      p: 0.28,
      titleZh: '藍色大質量主序星',
      titleEn: 'Blue Supergiant Star',
      descZh: '核心啟動強烈氫核聚變，輻射壓與向心重力達成流體靜力平衡。',
      descEn: 'Core hydrogen fusion ignites; outward radiation pressure balances inward gravity.',
      starScale: 2.2,
      starColor: new THREE.Color(0x93c5fd),
      starOpacity: 1.0,
      flashOpacity: 0.0,
      shockwaveScale: 0.1,
      shockwaveOpacity: 0.0,
      bhScale: 0.0,
      diskOpacity: 0.0,
      ringOpacity: 0.0,
      bloomStrength: 1.2,
      audioFreq: 220,
      speedRate: 0.06
    },
    {
      p: 0.62,
      titleZh: '紅超巨星 (鐵核聚變塌縮)',
      titleEn: 'Red Supergiant (Iron Core)',
      descZh: '核心氫耗盡轉為矽/鐵聚變，外層劇烈膨脹數百倍並呼吸式脈動。',
      descEn: 'Core transitions to silicon/iron fusion; outer layers expand rapidly with intense pulsation.',
      starScale: 5.6,
      starColor: new THREE.Color(0xea580c),
      starOpacity: 0.95,
      flashOpacity: 0.0,
      shockwaveScale: 0.1,
      shockwaveOpacity: 0.0,
      bhScale: 0.0,
      diskOpacity: 0.0,
      ringOpacity: 0.0,
      bloomStrength: 1.6,
      audioFreq: 90,
      speedRate: 0.035
    },
    {
      p: 0.82,
      titleZh: '超新星爆發 (核塌縮衝擊波)',
      titleEn: 'Core-Collapse Supernova',
      descZh: '鐵核聚變停止引發劇烈塌縮反彈，釋放超強衝擊波炸裂外層！',
      descEn: 'Iron fusion ceases, triggering a catastrophic gravitational rebound shockwave!',
      starScale: 0.2,
      starColor: new THREE.Color(0xffffff),
      starOpacity: 0.0,
      flashOpacity: 1.0,
      shockwaveScale: 18.0,
      shockwaveOpacity: 0.9,
      bhScale: 0.35,
      diskOpacity: 0.3,
      ringOpacity: 0.3,
      bloomStrength: 4.5,
      audioFreq: 35,
      speedRate: 0.12
    },
    {
      p: 1.0,
      titleZh: '黑洞奇異點 (事件視界與吸積盤)',
      titleEn: 'Black Hole Singularity & Accretion Disk',
      descZh: '殘餘核心突破歐本海默極限，形成絕對吸光的事件視界與熾熱吸積盤。',
      descEn: 'Remnant core exceeds the TOV limit, forming an Event Horizon and blazing accretion disk.',
      starScale: 0.0,
      starColor: new THREE.Color(0x000000),
      starOpacity: 0.0,
      flashOpacity: 0.0,
      shockwaveScale: 35.0,
      shockwaveOpacity: 0.0,
      bhScale: 1.0,
      diskOpacity: 1.0,
      ringOpacity: 1.0,
      bloomStrength: 2.2,
      audioFreq: 42,
      speedRate: 0.06
    }
  ],

  init(scene) {
    const starGeo = new THREE.SphereGeometry(1.0, 64, 64);
    const starMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });
    this.starTransitionMesh = new THREE.Mesh(starGeo, starMat);
    scene.add(this.starTransitionMesh);

    const ringGeo = new THREE.RingGeometry(0.9, 1.3, 128);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffaa44,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.supernovaShockwaveRing = new THREE.Mesh(ringGeo, ringMat);
    scene.add(this.supernovaShockwaveRing);

    const flashGeo = new THREE.SphereGeometry(16.0, 32, 32);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    this.supernovaFlashMesh = new THREE.Mesh(flashGeo, flashMat);
    scene.add(this.supernovaFlashMesh);

    this.applyInterpolation(this.progress, 0);
  },

  update(delta, totalTime) {
    if (this.isPlaying) {
      const currentRate = this.keyframes[this.currentStageIndex]?.speedRate || 0.06;
      this.progress += delta * currentRate;
      if (this.progress >= 1.0) {
        this.progress = 1.0;
        this.isPlaying = false;
        this.updatePlayBtn();
      }
      this.syncUI();
    }
    this.applyInterpolation(this.progress, totalTime);
    this.applyCameraShake(delta);
  },

  setProgress(val) {
    this.progress = THREE.MathUtils.clamp(val, 0.0, 1.0);
    this.applyInterpolation(this.progress, performance.now() * 0.001);
    this.syncUI();
  },

  applyInterpolation(p, time) {
    let k1 = this.keyframes[0];
    let k2 = this.keyframes[this.keyframes.length - 1];
    let newStageIdx = 0;

    for (let i = 0; i < this.keyframes.length - 1; i++) {
      if (p >= this.keyframes[i].p && p <= this.keyframes[i + 1].p) {
        k1 = this.keyframes[i];
        k2 = this.keyframes[i + 1];
        newStageIdx = i;
        break;
      }
    }

    if (newStageIdx !== this.currentStageIndex) {
      this.currentStageIndex = newStageIdx;
      this.triggerStageTransitionEffect();
    }

    const range = k2.p - k1.p;
    const t = range === 0 ? 0 : (p - k1.p) / range;
    const smoothT = THREE.MathUtils.smoothstep(t, 0, 1);

    let pulsation = 1.0;
    if (p >= 0.45 && p <= 0.8) {
      pulsation = 1.0 + Math.sin(time * 3.5) * 0.06 + Math.sin(time * 7.0) * 0.02;
    }

    if (this.starTransitionMesh) {
      const baseScale = THREE.MathUtils.lerp(k1.starScale, k2.starScale, smoothT);
      this.starTransitionMesh.scale.setScalar(Math.max(baseScale * pulsation, 0.001));
      this.starTransitionMesh.material.color.lerpColors(k1.starColor, k2.starColor, smoothT);
      this.starTransitionMesh.material.opacity = THREE.MathUtils.lerp(k1.starOpacity, k2.starOpacity, smoothT);
    }

    if (this.supernovaFlashMesh) {
      this.supernovaFlashMesh.material.opacity = THREE.MathUtils.lerp(k1.flashOpacity, k2.flashOpacity, smoothT);
    }
    if (this.supernovaShockwaveRing) {
      const ringScale = THREE.MathUtils.lerp(k1.shockwaveScale, k2.shockwaveScale, smoothT);
      const ringOpacity = THREE.MathUtils.lerp(k1.shockwaveOpacity, k2.shockwaveOpacity, smoothT);
      this.supernovaShockwaveRing.scale.setScalar(ringScale);
      this.supernovaShockwaveRing.material.opacity = ringOpacity;
      if (window.SceneManager?.camera) {
        this.supernovaShockwaveRing.quaternion.copy(window.SceneManager.camera.quaternion);
      }
    }

    if (p >= 0.78 && p <= 0.88) {
      this.shakeIntensity = Math.max(this.shakeIntensity, (1.0 - Math.abs(p - 0.82) / 0.06) * 0.4);
    }

    const bhScale = THREE.MathUtils.lerp(k1.bhScale, k2.bhScale, smoothT);
    const diskOpacity = THREE.MathUtils.lerp(k1.diskOpacity, k2.diskOpacity, smoothT);
    const ringOpacity = THREE.MathUtils.lerp(k1.ringOpacity, k2.ringOpacity, smoothT);

    if (window.SceneManager?.blackHoleSphere) {
      window.SceneManager.blackHoleSphere.scale.setScalar(Math.max(bhScale, 0.0001));
    }
    if (window.SceneManager?.photonRing?.material) {
      window.SceneManager.photonRing.scale.setScalar(Math.max(bhScale, 0.0001));
      window.SceneManager.photonRing.material.opacity = ringOpacity * 0.95;
    }
    if (window.SceneManager?.lensingRingTop?.material) {
      window.SceneManager.lensingRingTop.scale.setScalar(Math.max(bhScale, 0.0001));
      window.SceneManager.lensingRingTop.material.opacity = ringOpacity * 0.75;
    }
    if (window.ParticleManager?.material) {
      window.ParticleManager.material.opacity = diskOpacity;
    }

    if (window.SceneManager?.bloomPass) {
      window.SceneManager.bloomPass.strength = THREE.MathUtils.lerp(k1.bloomStrength, k2.bloomStrength, smoothT);
    }

    if (typeof window.AudioManager !== 'undefined' && window.AudioManager.humOsc && window.AudioManager.ctx) {
      const freq = THREE.MathUtils.lerp(k1.audioFreq, k2.audioFreq, smoothT);
      window.AudioManager.humOsc.frequency.setTargetAtTime(freq, window.AudioManager.ctx.currentTime, 0.1);
    }
  },

  applyCameraShake(delta) {
    if (this.shakeIntensity > 0.001 && window.SceneManager?.camera) {
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      window.SceneManager.camera.position.x += shakeX;
      window.SceneManager.camera.position.y += shakeY;
      this.shakeIntensity *= Math.pow(0.05, delta);
    }
  },

  triggerStageTransitionEffect() {
    const badge = document.getElementById('evolutionStageText');
    if (badge) {
      badge.classList.remove('stage-pulse');
      void badge.offsetWidth;
      badge.classList.add('stage-pulse');
    }
    if (typeof window.NarrativeManager !== 'undefined') {
      window.NarrativeManager.speakStage(this.currentStageIndex);
    }
    if (typeof window.AudioManager !== 'undefined') {
      window.AudioManager.playUITick?.();
    }
  },

  syncUI() {
    const slider = document.getElementById('evolutionSlider');
    const stageLabel = document.getElementById('evolutionStageText');
    const descLabel = document.getElementById('evolutionStageDesc');
    const mobStage = document.getElementById('mob-stage');

    if (slider) slider.value = this.progress;

    const kf = this.keyframes[this.currentStageIndex] || this.keyframes[0];
    const isEn = window.I18N?.currentLang === 'en';

    const title = isEn ? kf.titleEn : kf.titleZh;
    const desc = isEn ? kf.descEn : kf.descZh;

    if (stageLabel) stageLabel.textContent = title;
    if (descLabel) descLabel.textContent = desc;
    if (mobStage) mobStage.textContent = title;
  },

  updatePlayBtn() {
    const btn = document.getElementById('playPauseBtn');
    if (!btn) return;
    const isEn = window.I18N?.currentLang === 'en';
    const dict = window.I18N?.dict[isEn ? 'en' : 'zh'];
    btn.textContent = this.isPlaying ? (dict?.evoPause || '⏸ Pause') : (dict?.evoPlay || '▶ Play');
  }
};
