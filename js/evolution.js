window.EvolutionManager = {
  scene: null,
  progress: 1.0, // 0: 原恆星, 0.33: 藍超巨星, 0.66: 超新星大爆炸, 1.0: 黑洞
  isPlaying: false,
  playSpeed: 0.08,

  // 演化視覺實體
  protoStarMesh: null,
  supernovaParticles: null,
  supernovaCount: 3000,
  supernovaGeo: null,
  supernovaVels: null,

  stages: [
    { threshold: 0.0, name: '原恆星重力吸積', desc: '星際氣體在萬有引力下塌縮凝聚，核心溫度急劇攀升。' },
    { threshold: 0.33, name: '藍超巨星主序期', desc: '核心進行劇烈熱核融合，向外輻射壓與重力達成流體靜力平衡。' },
    { threshold: 0.66, name: '超新星爆發 (核塌縮)', desc: '鐵核燃料耗盡引發災難性引力塌縮，外層物質以相對論速度轟擊噴發！' },
    { threshold: 1.0, name: '黑洞奇異點 (事件視界)', desc: '殘餘核心質量突破歐本海默極限，核心徹底塌縮形成事件視界與吸積盤。' }
  ],

  init(scene) {
    if (!scene) return;
    this.scene = scene;

    // 1. 原恆星 / 超巨星實體球
    const starGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const starMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.0
    });
    this.protoStarMesh = new THREE.Mesh(starGeo, starMat);
    this.scene.add(this.protoStarMesh);

    // 2. 超新星爆炸噴流粒子系統
    this.supernovaGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.supernovaCount * 3);
    const colors = new Float32Array(this.supernovaCount * 3);
    this.supernovaVels = new Float32Array(this.supernovaCount * 3);

    for (let i = 0; i < this.supernovaCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      // 等方性向外爆發速度向量
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 4.0 + Math.random() * 16.0;

      this.supernovaVels[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      this.supernovaVels[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      this.supernovaVels[i * 3 + 2] = Math.cos(phi) * speed;

      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.6;
      colors[i * 3 + 2] = 0.2;
    }

    this.supernovaGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.supernovaGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const snMat = new THREE.PointsMaterial({
      size: 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.supernovaParticles = new THREE.Points(this.supernovaGeo, snMat);
    this.scene.add(this.supernovaParticles);

    this.applyStageVisuals(1.0);
  },

  setProgress(p) {
    this.progress = Math.min(Math.max(p, 0.0), 1.0);
    const slider = document.getElementById('evolutionSlider');
    if (slider) slider.value = this.progress.toString();
    this.applyStageVisuals(this.progress);
  },

  update(delta) {
    if (!this.isPlaying) return;

    this.progress += delta * this.playSpeed;
    if (this.progress >= 1.0) {
      this.progress = 1.0;
      this.isPlaying = false;
      this.updatePlayBtn();
    }

    const slider = document.getElementById('evolutionSlider');
    if (slider) slider.value = this.progress.toString();
    this.applyStageVisuals(this.progress);
  },

  updatePlayBtn() {
    const btn = document.getElementById('playPauseBtn');
    if (btn) {
      btn.textContent = this.isPlaying ? '⏸ 暫停' : '▶ 演化播放';
    }
  },

  applyStageVisuals(p) {
    // 🌟 核心保證：只操作模型網格與材質透明度，絕不干涉使用者 360 度相機
    const stageText = document.getElementById('evolutionStageText');
    const stageDesc = document.getElementById('evolutionStageDesc');

    let currentStage = this.stages[0];
    if (p >= 0.85) currentStage = this.stages[3];
    else if (p >= 0.5) currentStage = this.stages[2];
    else if (p >= 0.2) currentStage = this.stages[1];

    if (stageText) stageText.textContent = currentStage.name;
    if (stageDesc) stageDesc.textContent = currentStage.desc;

    // 1. 前期：原恆星 / 藍超巨星
    if (p < 0.6) {
      const starScale = p < 0.3 ? 1.0 + p * 3.0 : 2.0 + (p - 0.3) * 4.0;
      if (this.protoStarMesh) {
        this.protoStarMesh.scale.setScalar(starScale);
        this.protoStarMesh.material.opacity = (1.0 - p / 0.6) * 0.95;
        this.protoStarMesh.material.color.setHex(p < 0.3 ? 0x38bdf8 : 0x60a5fa);
      }
      if (window.SceneManager?.blackHoleSphere) window.SceneManager.blackHoleSphere.visible = false;
      if (window.SceneManager?.photonRing) window.SceneManager.photonRing.visible = false;
      if (window.SceneManager?.lensingRingTop) window.SceneManager.lensingRingTop.visible = false;
      if (window.ParticleManager?.particleSystem) window.ParticleManager.particleSystem.visible = false;
      if (this.supernovaParticles) this.supernovaParticles.material.opacity = 0.0;
    }
    // 2. 中期：超新星大爆炸爆發
    else if (p >= 0.6 && p < 0.85) {
      const snProgress = (p - 0.6) / 0.25;
      if (this.protoStarMesh) this.protoStarMesh.material.opacity = Math.max(0.0, 1.0 - snProgress * 3.0);

      if (this.supernovaParticles && this.supernovaGeo) {
        this.supernovaParticles.material.opacity = Math.sin(snProgress * Math.PI) * 0.95;
        const pos = this.supernovaGeo.attributes.position.array;
        for (let i = 0; i < this.supernovaCount; i++) {
          pos[i * 3] = this.supernovaVels[i * 3] * snProgress * 1.5;
          pos[i * 3 + 1] = this.supernovaVels[i * 3 + 1] * snProgress * 1.5;
          pos[i * 3 + 2] = this.supernovaVels[i * 3 + 2] * snProgress * 1.5;
        }
        this.supernovaGeo.attributes.position.needsUpdate = true;
      }

      if (window.SceneManager?.blackHoleSphere) window.SceneManager.blackHoleSphere.visible = false;
      if (window.SceneManager?.photonRing) window.SceneManager.photonRing.visible = false;
      if (window.SceneManager?.lensingRingTop) window.SceneManager.lensingRingTop.visible = false;
      if (window.ParticleManager?.particleSystem) window.ParticleManager.particleSystem.visible = false;
    }
    // 3. 後期：核心塌縮成黑洞與吸積盤旋渦
    else {
      const bhAppear = (p - 0.85) / 0.15;
      if (this.protoStarMesh) this.protoStarMesh.material.opacity = 0.0;
      if (this.supernovaParticles) this.supernovaParticles.material.opacity = 0.0;

      if (window.SceneManager?.blackHoleSphere) {
        window.SceneManager.blackHoleSphere.visible = true;
        window.SceneManager.blackHoleSphere.scale.setScalar(bhAppear);
      }
      if (window.SceneManager?.photonRing) {
        window.SceneManager.photonRing.visible = true;
        window.SceneManager.photonRing.scale.setScalar(bhAppear);
      }
      if (window.SceneManager?.lensingRingTop) {
        window.SceneManager.lensingRingTop.visible = true;
        window.SceneManager.lensingRingTop.scale.setScalar(bhAppear);
      }
      if (window.ParticleManager?.particleSystem) {
        window.ParticleManager.particleSystem.visible = true;
        window.ParticleManager.particleSystem.material.opacity = bhAppear * 0.9;
      }
    }
  }
};
