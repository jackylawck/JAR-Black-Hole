window.SceneManager = {
  scene: null,
  camera: null,
  renderer: null,
  composer: null,
  bloomPass: null,
  controls: null,
  blackHoleSphere: null,
  photonRing: null,
  backgroundStars: null,

  init() {
    const container = document.getElementById('canvas-container') || document.body;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // 1. 場景初始化
    this.scene = new THREE.Scene();

    // 2. 電影級平視相機視角 (Cinematic Horizon View)
    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1500);
    this.camera.position.set(0, 3.5, 24);

    // 3. 高性能抗鋸齒渲染器
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      powerPreference: 'high-performance',
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // 清空並掛載畫布
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // 4. 軌道控制器 (平滑阻尼相容檢查)
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 70;
      this.controls.minDistance = 4.5;
      this.controls.maxPolarAngle = Math.PI * 0.85;
    } else {
      console.warn('OrbitControls 未正確加載，使用默認相機視角');
    }

    // 5. 事件視界本體 (絕對吸光黑體)
    const bhGeo = new THREE.SphereGeometry(2.0, 64, 64);
    const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.blackHoleSphere = new THREE.Mesh(bhGeo, bhMat);
    this.scene.add(this.blackHoleSphere);

    // 6. 光子環 (Photon Ring)
    const ringGeo = new THREE.RingGeometry(1.98, 2.12, 128);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x99ddff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.photonRing = new THREE.Mesh(ringGeo, ringMat);
    this.photonRing.rotation.x = Math.PI / 2;
    this.scene.add(this.photonRing);

    // 7. 3D 深空背景星點矩陣
    const starsCount = 3000;
    const starsGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 600;
      starPos[i + 1] = (Math.random() - 0.5) * 600;
      starPos[i + 2] = (Math.random() - 0.5) * 600;

      const colorType = Math.random();
      if (colorType > 0.8) {
        starColors[i] = 0.6; starColors[i+1] = 0.8; starColors[i+2] = 1.0;
      } else if (colorType > 0.6) {
        starColors[i] = 1.0; starColors[i+1] = 0.7; starColors[i+2] = 0.4;
      } else {
        starColors[i] = 0.9; starColors[i+1] = 0.95; starColors[i+2] = 1.0;
      }
    }

    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starsGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starsMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.backgroundStars = new THREE.Points(starsGeo, starsMat);
    this.scene.add(this.backgroundStars);

    // 8. UnrealBloom 後處理輝光管線 (附帶防禦性降級)
    try {
      if (typeof THREE.EffectComposer !== 'undefined' && typeof THREE.UnrealBloomPass !== 'undefined') {
        const renderScene = new THREE.RenderPass(this.scene, this.camera);
        this.bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(width, height),
          1.6,
          0.45,
          0.82
        );
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(this.bloomPass);
      } else {
        throw new Error('後處理模組未載入');
      }
    } catch (e) {
      console.warn('EffectComposer 啟用失敗，降級為普通渲染模式:', e);
      this.composer = {
        render: () => this.renderer.render(this.scene, this.camera),
        setSize: (w, h) => this.renderer.setSize(w, h)
      };
    }

    // 9. 視窗縮放監聽
    window.addEventListener('resize', () => this.onWindowResize());
  },

  updateBlackHoleScale(massScale) {
    if (this.blackHoleSphere) {
      this.blackHoleSphere.scale.set(massScale, massScale, massScale);
    }
    if (this.photonRing) {
      this.photonRing.scale.set(massScale, massScale, massScale);
    }
  },

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    if (this.composer && this.composer.setSize) {
      this.composer.setSize(width, height);
    }
  }
};
