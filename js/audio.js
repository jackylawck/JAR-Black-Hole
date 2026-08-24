window.AudioManager = {
  ctx: null,
  isInitialized: false,
  humOsc: null,
  humGain: null,
  filterNode: null,
  distortionNode: null,
  pannerNode: null,
  currentState: 'STABLE',

  init() {
    if (this.isInitialized) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();

    this.humOsc = this.ctx.createOscillator();
    this.humOsc.type = 'sawtooth';
    this.humOsc.frequency.setValueAtTime(42, this.ctx.currentTime);

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(180, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(4.0, this.ctx.currentTime);

    this.distortionNode = this.ctx.createWaveShaper();
    this.distortionNode.curve = this.makeDistortionCurve(0);
    this.distortionNode.oversample = '2x';

    this.humGain = this.ctx.createGain();
    this.humGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    if (this.ctx.createPanner) {
      this.pannerNode = this.ctx.createPanner();
      this.pannerNode.panningModel = 'HRTF';
      this.pannerNode.distanceModel = 'inverse';
      this.pannerNode.refDistance = 5;
      this.pannerNode.maxDistance = 100;
      this.pannerNode.rolloffFactor = 1.2;
    }

    this.humOsc.connect(this.distortionNode);
    this.distortionNode.connect(this.filterNode);
    this.filterNode.connect(this.humGain);

    if (this.pannerNode) {
      this.humGain.connect(this.pannerNode);
      this.pannerNode.connect(this.ctx.destination);
    } else {
      this.humGain.connect(this.ctx.destination);
    }

    this.humOsc.start();
    this.isInitialized = true;
  },

  makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  },

  updateCurvatureAudio(state, massScale, speedFactor) {
    if (!this.isInitialized || !this.ctx) return;
    this.currentState = state;
    const now = this.ctx.currentTime;

    const baseFreq = 38 + massScale * 14 + speedFactor * 10;
    this.humOsc.frequency.setTargetAtTime(baseFreq, now, 0.1);

    if (state === 'CRITICAL') {
      this.filterNode.frequency.setTargetAtTime(850, now, 0.08);
      this.filterNode.Q.setTargetAtTime(12.0, now, 0.08);
      this.distortionNode.curve = this.makeDistortionCurve(110);
      this.humGain.gain.setTargetAtTime(0.22, now, 0.08);
    } else if (state === 'WARNING') {
      this.filterNode.frequency.setTargetAtTime(360, now, 0.15);
      this.filterNode.Q.setTargetAtTime(6.0, now, 0.15);
      this.distortionNode.curve = this.makeDistortionCurve(35);
      this.humGain.gain.setTargetAtTime(0.16, now, 0.15);
    } else {
      this.filterNode.frequency.setTargetAtTime(160, now, 0.2);
      this.filterNode.Q.setTargetAtTime(3.0, now, 0.2);
      this.distortionNode.curve = this.makeDistortionCurve(0);
      this.humGain.gain.setTargetAtTime(0.10, now, 0.2);
    }
  },

  applyAnalogJitter(elapsedTime) {
    if (!this.isInitialized || !this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.currentState === 'CRITICAL') {
      const freqJitter = Math.sin(elapsedTime * 16.0) * 14.0 + (Math.random() - 0.5) * 8.0;
      this.filterNode.frequency.setValueAtTime(Math.max(250, 850 + freqJitter), now);

      const qJitter = Math.sin(elapsedTime * 9.0) * 1.5;
      this.filterNode.Q.setValueAtTime(12.0 + qJitter, now);

      const gainJitter = Math.sin(elapsedTime * 22.0) * 0.02 + (Math.random() - 0.5) * 0.01;
      this.humGain.gain.setValueAtTime(Math.max(0.12, 0.22 + gainJitter), now);

      if (Math.random() < 0.08) {
        this.distortionNode.curve = this.makeDistortionCurve(110 + (Math.random() - 0.5) * 20);
      }
    } else if (this.currentState === 'WARNING') {
      const freqJitter = Math.sin(elapsedTime * 7.0) * 5.0;
      const qJitter = Math.sin(elapsedTime * 4.0) * 0.6;
      const gainJitter = Math.sin(elapsedTime * 11.0) * 0.01;

      this.filterNode.frequency.setValueAtTime(360 + freqJitter, now);
      this.filterNode.Q.setValueAtTime(6.0 + qJitter, now);
      this.humGain.gain.setValueAtTime(0.16 + gainJitter, now);
    } else {
      const subtleJitter = Math.sin(elapsedTime * 2.0) * 1.5;
      this.filterNode.frequency.setValueAtTime(160 + subtleJitter, now);
      this.filterNode.Q.setValueAtTime(3.0, now);
      this.humGain.gain.setValueAtTime(0.10, now);
    }
  },

  updateListenerAndParams(camera, massScale, speedFactor) {
    if (!this.isInitialized || !this.ctx || !camera) return;
    if (this.ctx.listener && this.ctx.listener.positionX) {
      this.ctx.listener.positionX.setValueAtTime(camera.position.x, this.ctx.currentTime);
      this.ctx.listener.positionY.setValueAtTime(camera.position.y, this.ctx.currentTime);
      this.ctx.listener.positionZ.setValueAtTime(camera.position.z, this.ctx.currentTime);
    }
  },

  playUITick() {
    if (!this.isInitialized || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);
    g.gain.setValueAtTime(0.08, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.04);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }
};
