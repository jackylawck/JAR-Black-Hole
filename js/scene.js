window.SceneManager = {
  scene: null,
  camera: null,
  renderer: null,
  composer: null,
  bloomPass: null,
  controls: null,
  blackHoleSphere: null,
  photonRing: null,
  lensingRingTop: null,
  backgroundStars: null,

  init() {
    const container = document.getElementById('canvas-container') || document.body;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.scene = new THREE.Scene();

    // 相機平視微仰角
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1500);
    this.camera.position.set(0, 2.8, 22);

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      powerPreference: 'high-performance',
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.6;

    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 65;
      this.controls.minDistance = 4.5;
    }

    // 1. 事件視界本體
    const bhGeo = new THREE.SphereGeometry(2.0, 64, 64);
    const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.blackHoleSphere = new THREE.Mesh(bhGeo, bhMat);
    this.scene.add(this.blackHoleSphere);

    // 2. 🌟 熾熱光子球光環 (高溫金白光暈)
    const ringGeo = new THREE.RingGeometry(2.01, 2.25, 128);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffe099,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.photonRing = new THREE.Mesh(ringGeo, ringMat);
    this.scene.add(this.photonRing);

    // 3. 🌟 立體引力透鏡垂直頂環 (Interstellar Vertical Lens Arc)
    const lensGeo = new THREE.RingGeometry(2.05, 2.4, 128);
    const lensMat = new THREE.MeshBasicMaterial({
      color: 0xffaa33,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.lensingRingTop = new THREE.Mesh(lensGeo, lensMat);
    this.lensingRingTop.rotation.y = Math.PI / 2; // 垂直跨越黑洞
    this.scene.add(this.lensingRingTop);

    // 4. 背景星空
    const starsCount = 2500;
    const starsGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 500;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    this.backgroundStars = new THREE.Points(
      starsGeo, 
      new THREE.PointsMaterial({ size: 0.3, color: 0x88bbff, transparent: true, opacity: 0.6 })
    );
    this.scene.add(this.backgroundStars);

    // 5. 🌟 調整 UnrealBloom 輝光參數：降低閾值以觸發極致發光
    try {
      if (typeof THREE.EffectComposer !== 'undefined' && typeof THREE.UnrealBloomPass !== 'undefined') {
        const renderScene = new THREE.RenderPass(this.scene, this.camera);
        this.bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(width, height),
          2.2,   // 輝光強度
          0.6,   // 擴散半徑
          0.15   // 🌟 閾值大幅降低 (0.82 -> 0.15)，讓等離子徹底發光溢出
        );
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(this.bloomPass);
      }
    } catch (e) {
      this.composer = {
        render: () => this.renderer.render(this.scene, this.camera),
        setSize: (w, h) => this.renderer.setSize(w, h)
      };
    }

    window.addEventListener('resize', () => this.onWindowResize());
  },

  updateBlackHoleScale(massScale) {
    if (this.blackHoleSphere) this.blackHoleSphere.scale.setScalar(massScale);
    if (this.photonRing) this.photonRing.scale.setScalar(massScale);
    if (this.lensingRingTop) this.lensingRingTop.scale.setScalar(massScale);
  },

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    if (this.composer && this.composer.setSize) this.composer.setSize(width, height);
  }
};
