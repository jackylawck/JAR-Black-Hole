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

  init() {
    const container = document.getElementById('canvas-container') || document.body;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.scene = new THREE.Scene();

    // 🌟 1. 調整相機高度與俯角，讓黑洞自然居中偏上，徹底避開底部座艙 HUD
    this.camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1500);
    this.camera.position.set(0, 6.2, 26);

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.autoClear = false;

    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 75;
      this.controls.minDistance = 5.0;
      // 🌟 將視角旋轉中心微微向下偏移，讓黑洞在畫面上方寬闊展示
      this.controls.target.set(0, -1.0, 0);
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
      color: 0xffd060,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.photonRing = new THREE.Mesh(ringGeo, ringMat);
    this.scene.add(this.photonRing);

    // 4. 引力透鏡垂直光環
    const lensGeo = new THREE.RingGeometry(2.05, 2.45, 96);
    const lensMat = new THREE.MeshBasicMaterial({
      color: 0xff9922,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
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
      starPos[i] = (Math.random() - 0.5) * 500;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMesh = new THREE.Points(
      starsGeo, 
      new THREE.PointsMaterial({ size: 0.4, color: 0x88ccff, transparent: true, opacity: 0.6 })
    );
    this.scene.add(starMesh);

    // 6. 後處理發光
    try {
      if (typeof THREE.EffectComposer !== 'undefined' && typeof THREE.UnrealBloomPass !== 'undefined') {
        const renderScene = new THREE.RenderPass(this.scene, this.camera);
        this.bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(width, height),
          2.0,
          0.5,
          0.15
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

  // 🌟 雙重視口渲染管線 (主座艙視角 + 探測器 POV 畫中畫)
  renderDualViewport() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // 1. 全螢幕主座艙視角
    this.renderer.setViewport(0, 0, w, h);
    this.renderer.setScissor(0, 0, w, h);
    this.renderer.setScissorTest(false);

    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    // 2. 右上角畫中畫：探測器第一人稱直墜視角
    if (window.ProbeManager?.activeProbe && window.ProbeManager?.probeCamera) {
      const pipW = Math.min(240, w * 0.38);
      const pipH = pipW * 0.72;
      const pipX = w - pipW - 18;
      const pipY = h - pipH - 72;

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
    if (this.composer) this.composer.setSize(width, height);
  }
};
