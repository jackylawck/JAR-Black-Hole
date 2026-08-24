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
  currentMass: 2.5,

  init() {
    const container = document.getElementById('canvas-container') || document.body;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.scene = new THREE.Scene();

    const isPortrait = height > width;
    // 🌟 1. 相機視角拉遠並向上抬高，黑洞穩坐畫面正中央（上半部 50%~55%）
    this.camera = new THREE.PerspectiveCamera(isPortrait ? 58 : 40, width / height, 0.1, 2000);
    this.camera.position.set(0, isPortrait ? 6.5 : 3.8, isPortrait ? 28.0 : 18.0);

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.autoClear = false;

    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // 🌟 2. 核心修復：直接綁定 window，確保 iOS / Android 手勢 100% 觸發 360 度自由旋轉
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, window);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;
      this.controls.enableRotate = true;
      this.controls.enableZoom = true;
      this.controls.enablePan = false;
      this.controls.rotateSpeed = 0.9;
      this.controls.zoomSpeed = 1.2;
      this.controls.maxDistance = 80;
      this.controls.minDistance = 3.0;

      // 🌟 焦點抬高到 Y = 1.5，令星體同黑洞居於屏幕正中，絕不跌落底欄
      this.controls.target.set(0, isPortrait ? 1.5 : 0.6, 0);
      this.controls.update();
    }

    // 2. 黑洞本體 (事件視界)
    const bhGeo = new THREE.SphereGeometry(2.0, 48, 48);
    const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.blackHoleSphere = new THREE.Mesh(bhGeo, bhMat);
    this.scene.add(this.blackHoleSphere);

    // 3. 光子球高溫光環
    const ringGeo = new THREE.RingGeometry(2.01, 2.3, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffbb44,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.photonRing = new THREE.Mesh(ringGeo, ringMat);
    this.scene.add(this.photonRing);

    // 4. 垂直透鏡光環
    const lensGeo = new THREE.RingGeometry(2.05, 2.45, 96);
    const lensMat = new THREE.MeshBasicMaterial({
      color: 0xff8811,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.lensingRingTop = new THREE.Mesh(lensGeo, lensMat);
    this.lensingRingTop.rotation.y = Math.PI / 2;
    this.scene.add(this.lensingRingTop);

    // 5. 背景星空
    const starsCount = 2000;
    const starsGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 600;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMesh = new THREE.Points(
      starsGeo, 
      new THREE.PointsMaterial({ size: 0.35, color: 0x88ccff, transparent: true, opacity: 0.6 })
    );
    this.scene.add(starMesh);

    // 6. 後處理泛光
    try {
      if (typeof THREE.EffectComposer !== 'undefined' && typeof THREE.UnrealBloomPass !== 'undefined') {
        const renderScene = new THREE.RenderPass(this.scene, this.camera);
        this.bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(width, height),
          1.1,
          0.4,
          0.18
        );
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(this.bloomPass);
      } else {
        throw new Error('Fallback');
      }
    } catch (e) {
      this.composer = null;
    }

    window.addEventListener('resize', () => this.onWindowResize());
  },

  renderDualViewport() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // 1. 全螢幕主畫面渲染
    this.renderer.setViewport(0, 0, w, h);
    this.renderer.setScissor(0, 0, w, h);
    this.renderer.setScissorTest(false);

    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    // 2. 右上角探測器畫中畫
    if (window.ProbeManager?.activeProbe && window.ProbeManager?.probeCamera) {
      const isLandscape = w > h;
      const pipW = Math.min(170, w * 0.32);
      const pipH = pipW * 0.72;
      const topOffset = isLandscape ? 38 : 64;
      const pipX = w - pipW - 12;
      const pipY = h - pipH - topOffset;

      this.renderer.clearDepth();
      this.renderer.setScissorTest(true);
      this.renderer.setScissor(pipX, pipY, pipW, pipH);
      this.renderer.setViewport(pipX, pipY, pipW, pipH);

      window.ProbeManager.probeCamera.aspect = pipW / pipH;
      window.ProbeManager.probeCamera.updateProjectionMatrix();
      this.renderer.render(this.scene, window.ProbeManager.probeCamera);

      this.renderer.setScissorTest(false);
    }
  },

  updateBlackHoleScale(massScale) {
    this.currentMass = massScale * 2.5;

    if (this.blackHoleSphere) this.blackHoleSphere.scale.setScalar(massScale);
    if (this.photonRing) this.photonRing.scale.setScalar(massScale);
    if (this.lensingRingTop) this.lensingRingTop.scale.setScalar(massScale);
  },

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;

    this.camera.aspect = width / height;
    this.camera.fov = isPortrait ? 58 : 40;
    this.camera.position.set(0, isPortrait ? 6.5 : 3.8, isPortrait ? 28.0 : 18.0);
    if (this.controls) {
      this.controls.target.set(0, isPortrait ? 1.5 : 0.6, 0);
      this.controls.update();
    }
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    if (this.composer) this.composer.setSize(width, height);
  }
};
