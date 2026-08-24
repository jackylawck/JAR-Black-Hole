window.ProbeManager = {
  scene: null,
  probes: [],
  activeProbe: null,
  probeCamera: null,
  isInitialized: false,

  init(scene) {
    this.scene = scene;
    this.probes = [];
    this.activeProbe = null;
    this.probeCamera = new THREE.PerspectiveCamera(75, 4 / 3, 0.05, 500);
    this.isInitialized = true;
  },

  launch() {
    if (!this.scene) return;

    const probeGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const probeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const probeMesh = new THREE.Mesh(probeGeo, probeMat);

    const maxTrailPoints = 120;
    const trailPositions = new Float32Array(maxTrailPoints * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));

    const trailMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const trailLine = new THREE.Line(trailGeo, trailMat);

    const initialRadius = 18.0;
    const initialAngle = Math.random() * Math.PI * 2;
    const startX = Math.cos(initialAngle) * initialRadius;
    const startZ = Math.sin(initialAngle) * initialRadius;

    probeMesh.position.set(startX, 0.4, startZ);

    this.scene.add(probeMesh);
    this.scene.add(trailLine);

    const probe = {
      mesh: probeMesh,
      trail: trailLine,
      radius: initialRadius,
      theta: initialAngle,
      y: 0.4,
      radialVelocity: 0.05,
      angularVelocity: 0.02,
      history: [],
      maxHistory: maxTrailPoints,
      isDestroyed: false
    };

    this.probes.push(probe);
    this.activeProbe = probe;

    const pipEl = document.getElementById('probePipContainer');
    if (pipEl) pipEl.classList.add('pip-active');

    if (typeof window.AudioManager !== 'undefined') {
      window.AudioManager.playUITick();
    }
  },

  update(massScale = 1.0) {
    if (!this.scene || this.probes.length === 0) {
      const pipEl = document.getElementById('probePipContainer');
      if (pipEl) pipEl.classList.remove('pip-active');
      return;
    }

    const Rs = 2.0 * massScale;
    const ISCO = 6.0 * massScale;

    for (let i = this.probes.length - 1; i >= 0; i--) {
      const p = this.probes[i];
      if (p.isDestroyed) continue;

      const gravityPull = (Rs * 2.2) / Math.max(p.radius * p.radius, 0.1);
      p.radialVelocity += gravityPull * 0.06;
      p.angularVelocity += gravityPull * 0.025;

      p.radius -= p.radialVelocity;
      p.theta += p.angularVelocity;

      // 意粉化拉伸與潮汐撕裂
      if (p.radius < ISCO) {
        const tidalFactor = Math.min(8.0, ISCO / Math.max(p.radius, 0.1));
        p.mesh.scale.set(1.0 / Math.sqrt(tidalFactor), tidalFactor, 1.0 / Math.sqrt(tidalFactor));
        p.mesh.material.color.setHex(0xf43f5e);
      }

      p.mesh.position.x = Math.cos(p.theta) * p.radius;
      p.mesh.position.z = Math.sin(p.theta) * p.radius;
      p.mesh.position.y *= 0.96;

      // 🌟 同步推流探測器四聯儀表板 Overlay
      if (this.activeProbe === p && this.probeCamera) {
        this.probeCamera.position.copy(p.mesh.position);
        this.probeCamera.lookAt(0, 0, 0);

        const pipDist = document.getElementById('pipDistance');
        const pipVel = document.getElementById('pipVelocity');
        const pipTidal = document.getElementById('pipTidal');
        const pipTemp = document.getElementById('pipTemp');
        const pipAlert = document.getElementById('pipHorizonAlert');

        const currentSpeed = Math.sqrt(p.radialVelocity * p.radialVelocity + Math.pow(p.radius * p.angularVelocity, 2));
        const estimatedTemp = Math.floor(2800 + (ISCO / Math.max(p.radius, 0.2)) * 14500);

        if (pipDist) pipDist.textContent = `${p.radius.toFixed(2)} Rs`;
        if (pipVel) pipVel.textContent = `${Math.min(0.99, currentSpeed * 2.5).toFixed(2)} c`;
        if (pipTidal) pipTidal.textContent = `${(gravityPull * 18.5).toFixed(1)} g`;
        if (pipTemp) pipTemp.textContent = `${estimatedTemp.toLocaleString()} K`;

        if (pipAlert) {
          if (p.radius < Rs * 1.3) {
            pipAlert.textContent = 'PLUNGING';
            pipAlert.style.color = '#f43f5e';
          } else if (p.radius < ISCO) {
            pipAlert.textContent = 'SPAGHETTI';
            pipAlert.style.color = '#fbbf24';
          } else {
            pipAlert.textContent = 'APPROACHING';
            pipAlert.style.color = '#38bdf8';
          }
        }
      }

      p.history.unshift(p.mesh.position.clone());
      if (p.history.length > p.maxHistory) p.history.pop();

      const positions = p.trail.geometry.attributes.position.array;
      for (let j = 0; j < p.history.length; j++) {
        positions[j * 3] = p.history[j].x;
        positions[j * 3 + 1] = p.history[j].y;
        positions[j * 3 + 2] = p.history[j].z;
      }
      p.trail.geometry.attributes.position.needsUpdate = true;

      // 穿越事件視界吞噬銷毀
      if (p.radius <= Rs) {
        this.scene.remove(p.mesh);
        this.scene.remove(p.trail);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        p.trail.geometry.dispose();
        p.trail.material.dispose();
        p.isDestroyed = true;
        this.probes.splice(i, 1);

        if (this.activeProbe === p) {
          this.activeProbe = null;
          const pipEl = document.getElementById('probePipContainer');
          if (pipEl) pipEl.classList.remove('pip-active');
        }
      }
    }
  }
};
