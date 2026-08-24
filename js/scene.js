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

  // 🌟 原生球坐標旋轉狀態機 (保證 100% 任何裝置流暢 360 度旋轉)
  cameraRadius: 16.0,
  cameraTheta: 0.0,      // 水平角
  cameraPhi: Math.PI / 2 - 0.2, // 俯仰角 (微俯視)
  targetY: 1.2,          // 視線焦點抬高，黑洞置中

  init() {
    const container = document.getElementById('canvas-container') || document.body;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;

    this.scene = new THREE.Scene();

    this.cameraRadius = isPortrait ? 15.0 : 12.0;
    this.targetY = isPortrait ? 1.6 : 0.8;
    this.camera = new THREE.PerspectiveCamera(isPortrait ? 60 : 42, width / height, 0.1, 2000);
    this.updateCameraTransform();

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

    // 🌟 核心：原生 Touch & Pointer 360 度無死角滑動事件
    this.initNativeGestures();

    // 1. 黑洞事件視界
    const bhGeo = new THREE.SphereGeometry(2.0, 48, 48);
    const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.blackHoleSphere = new THREE.Mesh(bhGeo, bhMat);
    this.scene.add(this.blackHoleSphere);

    // 2. 光子球高溫光環
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

    // 3. 垂直透鏡光環
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

    // 4. 背景星空
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

    // 5. 後處理泛光
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

  updateCameraTransform() {
    const x = this.cameraRadius * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta);
    const y = this.targetY + this.cameraRadius * Math.cos(this.cameraPhi);
    const z = this.cameraRadius * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, this.targetY, 0);
  },

  initNativeGestures() {
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let initPinchDist = null;
    let initRadius = this.cameraRadius;

    // 滑鼠事件
    window.addEventListener('mousedown', (e) => {
      if (e.target.closest('#bottom-command-hud') || e.target.closest('#top-telemetry-hud')) return;
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevX;
      const deltaY = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      this.cameraTheta -= deltaX * 0.006;
      this.cameraPhi = Math.max(0.08, Math.min(Math.PI - 0.08, this.cameraPhi - deltaY * 0.006));
      this.updateCameraTransform();
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    // 滑鼠滾輪縮放
    window.addEventListener('wheel', (e) => {
      this.cameraRadius = Math.max(3.5, Math.min(50.0, this.cameraRadius + e.deltaY * 0.02));
      this.updateCameraTransform();
    }, { passive: true });

    // 🌟 手機觸控事件 (單指旋轉 + 雙指縮放)
    window.addEventListener('touchstart', (e) => {
      if (e.target.closest('#bottom-command-hud') || e.target.closest('#top-telemetry-hud')) return;

      if (e.touches.length === 1) {
        isDragging = true;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initPinchDist = Math.hypot(dx, dy);
        initRadius = this.cameraRadius;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && isDragging) {
        const deltaX = e.touches[0].clientX - prevX;
        const deltaY = e.touches[0].clientY - prevY;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;

        this.cameraTheta -= deltaX * 0.008;
        this.cameraPhi = Math.max(0.08, Math.min(Math.PI - 0.08, this.cameraPhi - deltaY * 0.008));
        this.updateCameraTransform();
      } else if (e.touches.length === 2 && initPinchDist) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        const factor = initPinchDist / currentDist;
        this.cameraRadius = Math.max(3.5, Math.min(50.0, initRadius * factor));
        this.updateCameraTransform();
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        isDragging = false;
        initPinchDist = null;
      }
    }, { passive: true });
  },

  renderDualViewport() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.renderer.setViewport(0, 0, w, h);
    this.renderer.setScissor(0, 0, w, h);
    this.renderer.setScissorTest(false);

    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

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
    this.camera.fov = isPortrait ? 60 : 42;
    this.cameraRadius = isPortrait ? 15.0 : 12.0;
    this.targetY = isPortrait ? 1.6 : 0.8;
    this.camera.updateProjectionMatrix();
    this.updateCameraTransform();

    this.renderer.setSize(width, height);
    if (this.composer) this.composer.setSize(width, height);
  }
};
