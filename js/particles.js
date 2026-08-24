window.ParticleManager = {
  particleSystem: null,
  geometry: null,
  material: null,
  particleCount: 5000,
  positions: null,
  colors: null,
  radii: null,
  angles: null,
  speeds: null,

  init(scene, mass = 2.5) {
    if (!scene) return;

    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.particleCount * 3);
    this.colors = new Float32Array(this.particleCount * 3);
    this.radii = new Float32Array(this.particleCount);
    this.angles = new Float32Array(this.particleCount);
    this.speeds = new Float32Array(this.particleCount);

    const minRadius = 3.2 * (mass / 2.5);
    const maxRadius = 18.0 * (mass / 2.5);

    for (let i = 0; i < this.particleCount; i++) {
      // 冪次分佈：粒子高度集中在 ISCO 內緣，向外逐漸稀疏
      const normDist = Math.pow(Math.random(), 2.2);
      const r = minRadius + normDist * (maxRadius - minRadius);
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * (0.15 + (r / maxRadius) * 0.8);

      this.radii[i] = r;
      this.angles[i] = theta;
      // 相對論克卜勒角速度 v ~ 1 / sqrt(r^3)
      this.speeds[i] = Math.sqrt(mass / Math.pow(r, 2.5)) * 0.85;

      this.positions[i * 3] = Math.cos(theta) * r;
      this.positions[i * 3 + 1] = y;
      this.positions[i * 3 + 2] = Math.sin(theta) * r;

      // 顏色漸變：內圈熾熱金白 -> 中圈亮橙黃 -> 外圈深紅
      const colorRatio = (r - minRadius) / (maxRadius - minRadius);
      if (colorRatio < 0.25) {
        this.colors[i * 3] = 1.0;
        this.colors[i * 3 + 1] = 0.95;
        this.colors[i * 3 + 2] = 0.7; // 熾白
      } else if (colorRatio < 0.65) {
        this.colors[i * 3] = 1.0;
        this.colors[i * 3 + 1] = 0.6;
        this.colors[i * 3 + 2] = 0.1; // 金黃
      } else {
        this.colors[i * 3] = 0.85;
        this.colors[i * 3 + 1] = 0.25;
        this.colors[i * 3 + 2] = 0.05; // 深紅
      }
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    // 粒子發光材質
    this.material = new THREE.PointsMaterial({
      size: 0.24,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particleSystem = new THREE.Points(this.geometry, this.material);
    scene.add(this.particleSystem);
  },

  update(delta, speedFactor = 1.0, massScale = 1.0) {
    if (!this.geometry) return;

    const pos = this.geometry.attributes.position.array;
    const col = this.geometry.attributes.color.array;

    for (let i = 0; i < this.particleCount; i++) {
      this.angles[i] += this.speeds[i] * speedFactor * delta * 2.5;
      const r = this.radii[i] * massScale;
      const theta = this.angles[i];

      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      pos[i * 3] = x;
      pos[i * 3 + 2] = z;

      // 實時都卜勒藍移/紅移發光微調
      const doppler = Math.cos(theta); // 迎面而來 vs 遠離
      const baseIdx = i * 3;
      if (doppler > 0.3) {
        col[baseIdx] = Math.min(1.0, col[baseIdx] * 1.08);     // 藍白增亮
        col[baseIdx + 1] = Math.min(1.0, col[baseIdx + 1] * 1.05);
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }
};
