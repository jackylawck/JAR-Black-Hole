const AudioManager = {
  ctx: null,
  isInitialized: false,
  isMuted: false,

  // 1. 空間與總線節點
  panner: null,
  masterGain: null,
  proximityGain: null, // 🌟 距離壓迫感增益

  // 2. 時空引力次低音與 LFO 呼吸
  humOsc: null,
  humGain: null,
  humLFO: null,

  // 3. 吸積盤摩擦等離子噪聲
  noiseNode: null,
  noiseFilter: null,
  noiseGain: null,

  // 4. 動態配樂情緒狀態機 (Ambient Chord Pad + 動態濾波)
  padOscs: [],
  padFilter: null,
  padGain: null,
  currentState: 'idle',
  isSilenceActive: false, // 🌟 吞噬後的深淵留白狀態

  init() {
    if (this.isInitialized) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // 總線增益控制
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // 距離壓迫感調製節點
    this.proximityGain = this.ctx.createGain();
    this.proximityGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.proximityGain.connect(this.masterGain);

    // HRTF 3D 空間定位 (黑洞中心: 0, 0, 0)
    this.panner = this.ctx.createPanner();
    this.panner.panningModel = 'HRTF';
    this.panner.distanceModel = 'inverse';
    this.panner.refDistance = 5;
    this.panner.maxDistance = 120;
    this.panner.rolloffFactor = 1.2;
    this.panner.positionX.setValueAtTime(0, this.ctx.currentTime);
    this.panner.positionY.setValueAtTime(0, this.ctx.currentTime);
    this.panner.positionZ.setValueAtTime(0, this.ctx.currentTime);
    this.panner.connect(this.proximityGain);

    // -------------------------------------------------------------
    // 音軌 A: 42Hz 時空引力次低音 + 0.25Hz LFO 呼吸震顫
    // -------------------------------------------------------------
    this.humOsc = this.ctx.createOscillator();
    this.humOsc.type = 'sine';
    this.humOsc.frequency.setValueAtTime(42, this.ctx.currentTime);

    this.humGain = this.ctx.createGain();
    this.humGain.gain.setValueAtTime(0.045, this.ctx.currentTime);

    this.humLFO = this.ctx.createOscillator();
    this.humLFO.frequency.setValueAtTime(0.25, this.ctx.currentTime); // 4 秒週期引力波動
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(2.5, this.ctx.currentTime);
    this.humLFO.connect(lfoGain);
    lfoGain.connect(this.humOsc.frequency);

    this.humOsc.connect(this.humGain);
    this.humGain.connect(this.panner);

    this.humOsc.start();
    this.humLFO.start();

    // -------------------------------------------------------------
    // 音軌 B: 吸積盤高能摩擦噪聲 + 帶通濾波動態掃描
    // -------------------------------------------------------------
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
    this.noiseFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

    this.noiseNode.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.panner);
    this.noiseNode.start();

    // -------------------------------------------------------------
    // 音軌 C: Hans Zimmer 風格微失諧 Ambient Pad (D 小調 + 動態濾波)
    // -------------------------------------------------------------
    this.padFilter = this.ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.setValueAtTime(400, this.ctx.currentTime);

    this.padGain = this.ctx.createGain();
    this.padGain.gain.setValueAtTime(0.025, this.ctx.currentTime);

    const freqs = [73.42, 110.00, 146.83, 220.00]; // D2, A2, D3, A3
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f + (Math.random() - 0.5) * 0.8, this.ctx.currentTime);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(this.padFilter);
      osc.start();
      this.padOscs.push(osc);
    });

    this.padFilter.connect(this.padGain);
    this.padGain.connect(this.proximityGain);

    // 瀏覽器自動播放政策解鎖
    const unlockAudio = () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });

    this.isInitialized = true;
  },

  // 滑塊引力波脈衝 (Gravity Pulse)
  triggerGravityPulse() {
    if (!this.isInitialized || this.isMuted || this.isSilenceActive) return;
    this.humGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.humGain.gain.setTargetAtTime(0.085, this.ctx.currentTime, 0.015);
    this.humGain.gain.setTargetAtTime(0.045, this.ctx.currentTime + 0.08, 0.25);
  },

  // 動態配樂情緒狀態機
  setMusicState(state) {
    if (!this.isInitialized || this.isMuted || this.currentState === state || this.isSilenceActive) return;
    this.currentState = state;

    switch (state) {
      case 'idle':
        this.padFilter.frequency.setTargetAtTime(400, this.ctx.currentTime, 0.5);
        this.padGain.gain.setTargetAtTime(0.025, this.ctx.currentTime, 0.5);
        break;

      case 'launch':
        this.padFilter.frequency.setTargetAtTime(750, this.ctx.currentTime, 0.3);
        this.padGain.gain.setTargetAtTime(0.04, this.ctx.currentTime, 0.3);
        break;

      case 'spaghettification':
        this.padFilter.frequency.setTargetAtTime(1600, this.ctx.currentTime, 0.1);
        this.padGain.gain.setTargetAtTime(0.055, this.ctx.currentTime, 0.1);
        break;
    }
  },

  // 🌟 核心升級 1：聽覺距離壓迫感調製 (Proximity Weight)
  updateListenerAndParams(camera, massScale, speedFactor) {
    if (!this.isInitialized || this.isMuted || this.isSilenceActive) return;

    if (this.ctx.listener.positionX) {
      this.ctx.listener.positionX.setValueAtTime(camera.position.x, this.ctx.currentTime);
      this.ctx.listener.positionY.setValueAtTime(camera.position.y, this.ctx.currentTime);
      this.ctx.listener.positionZ.setValueAtTime(camera.position.z, this.ctx.currentTime);
    }

    // 視距越近，低頻壓迫感與總音量指數級增強
    const dist = camera.position.length();
    const proxScale = Math.min(2.0, Math.max(0.6, 25.0 / dist));
    this.proximityGain.gain.setTargetAtTime(proxScale, this.ctx.currentTime, 0.1);

    const targetFreq = Math.max(20, 50 - massScale * 7.5);
    this.humOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.15);

    const filterFreq = 300 + speedFactor * 400;
    this.noiseFilter.frequency.setTargetAtTime(filterFreq, this.ctx.currentTime, 0.15);

    const noiseVol = 0.01 + (speedFactor / 3.0) * 0.025;
    this.noiseGain.gain.setTargetAtTime(noiseVol, this.ctx.currentTime, 0.15);
  },

  // 探測器發射脈衝音
  playLaunch(position) {
    if (!this.isInitialized || this.isMuted || this.isSilenceActive) return;
    this.setMusicState('launch');

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const panner = this.ctx.createPanner();

    if (position) {
      panner.positionX.setValueAtTime(position.x, this.ctx.currentTime);
      panner.positionY.setValueAtTime(position.y, this.ctx.currentTime);
      panner.positionZ.setValueAtTime(position.z, this.ctx.currentTime);
    }

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(920, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  },

  // 🌟 核心升級 2：意粉化失真撕裂 + 0.5s 深淵寂靜 (The Void of Silence)
  playSpaghettification() {
    if (!this.isInitialized || this.isMuted) return;
    this.setMusicState('spaghettification');

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const dist = this.ctx.createWaveShaper();

    dist.curve = this.makeDistortionCurve(25);
    dist.oversample = '4x';

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(28, this.ctx.currentTime + 0.7);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(270, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(32, this.ctx.currentTime + 0.7);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);

    osc1.connect(dist);
    osc2.connect(dist);
    dist.connect(gain);
    gain.connect(this.panner);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.7);
    osc2.stop(this.ctx.currentTime + 0.7);

    // 0.7 秒撕裂結束後，觸發 0.5 秒全頻深淵留白
    setTimeout(() => {
      this.isSilenceActive = true;
      this.masterGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.05);

      setTimeout(() => {
        // 0.5 秒後環境音柔和漸入 (Fade in)
        this.masterGain.gain.setTargetAtTime(0.85, this.ctx.currentTime, 0.4);
        this.isSilenceActive = false;
        this.setMusicState('idle');
      }, 500);
    }, 700);
  },

  makeDistortionCurve(amount) {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
};
