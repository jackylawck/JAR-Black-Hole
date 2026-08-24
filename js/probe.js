window.ProbeManager = {
  scene: null,
  probes: [],
  isInitialized: false,

  init(scene) {
    this.scene = scene;
    this.probes = [];
    this.isInitialized = true;
  },

  // 發射探測器 (對接 main.js 的 launch 調用)
  launch() {
    if (!this.scene) return;

    // 1. 探測器本體 (高亮微型光子晶體)
    const probeGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const probeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: false
    });
    const probeMesh = new THREE.Mesh(probeGeo, probeMat);

    // 2. 意粉化拖尾光束 (Spaghettification Trail)
    const maxTrailPoints = 80;
    const trailPositions = new Float32Array(maxTrailPoints * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));

    const trailMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      linewidth: 2
    });
    const trailLine = new THREE.Line(trailGeo, trailMat);

    // 初始位置：從遠處軌道向黑洞墜落
    const initialRadius = 16.0;
    const initialAngle = Math.random() * Math.PI * 2;
    const startX = Math.cos(initialAngle) * initialRadius;
    const startZ = Math.sin(initialAngle) * initialRadius;

    probeMesh.position.set(startX, 0.5, startZ);

    this.scene.add(probeMesh);
    this.scene.add(trailLine);

    const probe = {
      mesh: probeMesh,
      trail: trailLine,
      radius: initialRadius,
      theta: initialAngle,
      y: 0.5,
      radialVelocity: 0.08,
      angularVelocity: 0.03,
      history: [],
      maxHistory: maxTrailPoints,
      isDestroyed: false
    };

    this.probes.push(probe);

    // 發射音效
    if (typeof window.AudioManager !== 'undefined') {
      window.AudioManager.playUITick?.();
    }
  },

  update(massScale = 1.0) {
    if (!this.scene || this.probes.length === 0) return;

    const Rs = 2.0 * massScale;
    const ISCO = 6.0 * massScale;

    for (let i = this.probes.length - 1; i >= 0; i--) {
      const p = this.probes[i];
      if (p.isDestroyed) continue;

      // 廣義相對論強引力加速
      const gravityPull = (Rs * 1.8) / (p.radius * p.radius);
      p.radialVelocity += gravityPull * 0.08;
      p.angularVelocity += gravityPull * 0.03;

      p.radius -= p.radialVelocity;
      p.theta += p.angularVelocity;

      // 意粉化（垂直方向極限拉伸，切向擠壓）
      if (p.radius < ISCO) {
        const tidalFactor = Math.min(6.0, ISCO / Math.max(p.radius, 0.1));
        p.mesh.scale.set(1.0 / Math.sqrt(tidalFactor), tidalFactor, 1.0 / Math.sqrt(tidalFactor));
        p.mesh.material.color.setHex(0xf43f5e); // 潮汐撕裂變為熾熱紅
      }

      p.mesh.position.x = Math.cos(p.theta) * p.radius;
      p.mesh.position.z = Math.sin(p.theta) * p.radius;
      p.mesh.position.y *= 0.98;

      // 更新尾跡
      p.history.unshift(p.mesh.position.clone());
      if (p.history.length > p.maxHistory) p.history.pop();

      const positions = p.trail.geometry.attributes.position.array;
      for (let j = 0; j < p.history.length; j++) {
        positions[j * 3] = p.history[j].x;
        positions[j * 3 + 1] = p.history[j].y;
        positions[j * 3 + 2] = p.history[j].z;
      }
      p.trail.geometry.attributes.position.needsUpdate = true;

      // 穿越事件視界：完全被黑洞吞噬銷毀
      if (p.radius <= Rs) {
        this.scene.remove(p.mesh);
        this.scene.remove(p.trail);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        p.trail.geometry.dispose();
        p.trail.material.dispose();
        p.isDestroyed = true;
        this.probes.splice(i, 1);
      }
    }
  }
};
