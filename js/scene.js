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
  raymarchMesh: null,
  raymarchMaterial: null,
  currentMass: 2.5,
  currentSpin: 0.3,

  init() {
    const container = document.getElementById('canvas-container') || document.body;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.scene = new THREE.Scene();

    const isPortrait = height > width;
    this.camera = new THREE.PerspectiveCamera(isPortrait ? 52 : 38, width / height, 0.1, 1500);
    this.camera.position.set(0, isPortrait ? 3.8 : 2.5, isPortrait ? 22.0 : 16.0);

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

    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 60;
      this.controls.minDistance = 4.0;
      this.controls.target.set(0, isPortrait ? 0.6 : 0.2, 0);
      this.controls.update();
    }

    // 1. 黑洞事件視界實體
    const bhGeo = new THREE.SphereGeometry(2.0, 48, 48);
    const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.blackHoleSphere = new THREE.Mesh(bhGeo, bhMat);
    this.scene.add(this.blackHoleSphere);

    // 2. 光子球高溫光環
    const ringGeo = new THREE.RingGeometry(2.01, 2.25, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffbb44,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.photonRing = new THREE.Mesh(ringGeo, ringMat);
    this.scene.add(this.photonRing);

    // 3. 垂直引力透鏡光環
    const lensGeo = new THREE.RingGeometry(2.05, 2.38, 96);
    const lensMat = new THREE.MeshBasicMaterial({
      color: 0xff8811,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
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
      starPos[i] = (Math.random() - 0.5) * 500;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMesh = new THREE.Points(
      starsGeo, 
      new THREE.PointsMaterial({ size: 0.35, color: 0x88ccff, transparent: true, opacity: 0.6 })
    );
    this.scene.add(starMesh);

    // 🌟 5. 注入 KerrShaders 並對齊 Aspect 與 FOV
    if (typeof window.KerrShaders !== 'undefined') {
      const shaderGeo = new THREE.PlaneGeometry(16, 16);
      this.raymarchMaterial = new THREE.ShaderMaterial({
        vertexShader: window.KerrShaders.vertexShader,
        fragmentShader: window.KerrShaders.fragmentShader,
        uniforms: {
          uCameraPos: { value: this.camera.position },
          uCamMatrix: { value: this.camera.matrixWorld },
          uAspect: { value: width / height },
          uFovTan: { value: Math.tan(THREE.MathUtils.degToRad(this.camera.fov * 0.5)) },
          uMass: { value: 1.0 },
          uSpin: { value: 0.3 },
          uTime: { value: 0.0 }
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      this.raymarchMesh = new THREE.Mesh(shaderGeo, this.raymarchMaterial);
      this.scene.add(this.raymarchMesh);
    }

    // 6. 後處理泛光
    try {
      if (typeof THREE.EffectComposer !== 'undefined' && typeof THREE.UnrealBloomPass !== 'undefined') {
        const renderScene = new THREE.RenderPass(this.scene, this.camera);
        this.bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(width, height),
          0.85,
          0.35,
          0.2
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

  renderDualViewport(elapsedTime = 0) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // 🌟 相機正面鎖定與長寬比實時同步
    if (this.raymarchMesh && this.camera && this.raymarchMaterial) {
      const forwardDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
      this.raymarchMesh.position.copy(this.camera.position).add(forwardDir.multiplyScalar(6.0));
      this.raymarchMesh.lookAt(this.camera.position);

      this.raymarchMaterial.uniforms.uCameraPos.value.copy(this.camera.position);
      this.raymarchMaterial.uniforms.uCamMatrix.value.copy(this.camera.matrixWorld);
      this.raymarchMaterial.uniforms.uAspect.value = w / h;
      this.raymarchMaterial.uniforms.uFovTan.value = Math.tan(THREE.MathUtils.degToRad(this.camera.fov * 0.5));
      this.raymarchMaterial.uniforms.uMass.value = this.currentMass / 2.5;
      this.raymarchMaterial.uniforms.uSpin.value = this.currentSpin;
      this.raymarchMaterial.uniforms.uTime.value = elapsedTime;
    }

    // 主畫面渲染
    this.renderer.setViewport(0, 0, w, h);
    this.renderer.setScissor(0, 0, w, h);
    this.renderer.setScissorTest(false);

    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    // 探測器 POV 畫中畫
    if (window.ProbeManager?.activeProbe && window.ProbeManager?.probeCamera) {
      const pipW = Math.min(200, w * 0.32);
      const pipH = pipW * 0.72;
      const pipX = w - pipW - 12;
      const pipY = h - pipH - 65;

      this.renderer.clearDepth();
      this.renderer.setScissorTest(true);
      this.renderer.setScissor(pipX, pipY, pipW, pipH);
      this.renderer.setViewport(pipX, pipY, pipW, pipH);

      if (this.raymarchMesh) this.raymarchMesh.visible = false;

      window.ProbeManager.probeCamera.aspect = pipW / pipH;
      window.ProbeManager.probeCamera.updateProjectionMatrix();
      this.renderer.render(this.scene, window.ProbeManager.probeCamera);

      if (this.raymarchMesh) this.raymarchMesh.visible = true;
      this.renderer.setScissorTest(false);
    }
  },

  updateBlackHoleScale(massScale, spin = 0.3) {
    this.currentMass = massScale * 2.5;
    this.currentSpin = spin;

    if (this.blackHoleSphere) this.blackHoleSphere.scale.setScalar(massScale);
    if (this.photonRing) this.photonRing.scale.setScalar(massScale);
    if (this.lensingRingTop) this.lensingRingTop.scale.setScalar(massScale);
  },

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;

    this.camera.aspect = width / height;
    this.camera.fov = isPortrait ? 52 : 38;
    this.camera.position.set(0, isPortrait ? 3.8 : 2.5, isPortrait ? 22.0 : 16.0);
    if (this.controls) {
      this.controls.target.set(0, isPortrait ? 0.6 : 0.2, 0);
      this.controls.update();
    }
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    if (this.composer) this.composer.setSize(width, height);
  }
};
