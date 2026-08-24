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

    const minRadius = 3.0 * (mass / 2.5);
    const maxRadius = 18.0 * (mass / 2.5);

    for (let i = 0; i < this.particleCount; i++) {
      // 冪次分佈：粒子高度密集於 ISCO 內緣
      const normDist = Math.pow(Math.random(), 2.0);
      const r = minRadius + normDist * (maxRadius - minRadius);
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * (0.2 + (r / maxRadius) * 0.9);

      this.radii[i] = r;
      this.angles[i] = theta;
      this.speeds[i] = Math.sqrt(mass / Math.pow(r, 2.5)) * 0.9;

      this.positions[i * 3] = Math.cos(theta) * r;
      this.positions[i * 3 + 1] = y;
      this.positions[i * 3 + 2] = Math.sin(theta) * r;

      // 顏色階梯：ISCO 熾白金 -> 中圈明亮橙金 -> 外緣暗金紅
      const colorRatio = (r - minRadius) / (maxRadius - minRadius);
      if (colorRatio < 0.22) {
        this.colors[i * 3] = 1.0;
        this.colors[i * 3 + 1] = 0.98;
        this.colors[i * 3 + 2] = 0.75;
      } else if (colorRatio < 0.6) {
        this.colors[i * 3] = 1.0;
        this.colors[i * 3 + 1] = 0.65;
        this.colors[i * 3 + 2] = 0.12;
      } else {
        this.colors[i * 3] = 0.9;
        this.colors[i * 3 + 1] = 0.28;
        this.colors[i * 3 + 2] = 0.06;
      }
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    this.material = new THREE.PointsMaterial({
      size: 0.36,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
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
      this.angles[i] += this.speeds[i] * speedFactor * delta * 2.8;
      const r = this.radii[i] * massScale;
      const theta = this.angles[i];

      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 2] = Math.sin(theta) * r;

      // 都卜勒藍移/紅移微調
      const doppler = Math.cos(theta);
      const baseIdx = i * 3;
      if (doppler > 0.2) {
        col[baseIdx] = Math.min(1.0, col[baseIdx] * 1.05);
        col[baseIdx + 1] = Math.min(1.0, col[baseIdx + 1] * 1.03);
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }
};
