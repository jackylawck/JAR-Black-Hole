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

    const maxTrailPoints = 200;
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

    // 從較遠穩定外軌道發射
    const initialRadius = 22.0;
    const initialAngle = Math.random() * Math.PI * 2;
    const startX = Math.cos(initialAngle) * initialRadius;
    const startZ = Math.sin(initialAngle) * initialRadius;

    probeMesh.position.set(startX, 0.3, startZ);

    this.scene.add(probeMesh);
    this.scene.add(trailLine);

    const probe = {
      mesh: probeMesh,
      trail: trailLine,
      radius: initialRadius,
      theta: initialAngle,
      y: 0.3,
      // 🌟 降低徑向墜落速度，提高角速度，使探測器繞行多圈穩定衰減
      radialVelocity: 0.015,
      angularVelocity: 0.035,
      history: [],
      maxHistory: maxTrailPoints,
      freezeCounter: 0,
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

      // 廣義相對論引力加速度（適度平滑）
      const gravityPull = (Rs * 1.5) / Math.max(p.radius * p.radius, 0.2);
      
      // 🌟 當接近事件視界時，強烈時間膨脹 (Gravitational Time Dilation Freeze)
      let timeDilation = 1.0;
      if (p.radius < Rs * 1.25) {
        timeDilation = Math.max(0.04, (p.radius - Rs) / (Rs * 0.25));
      }

      p.radialVelocity += gravityPull * 0.012 * timeDilation;
      p.angularVelocity += gravityPull * 0.008 * timeDilation;

      p.radius -= p.radialVelocity * timeDilation;
      p.theta += p.angularVelocity * timeDilation;

      // 意粉化拉伸變形
      if (p.radius < ISCO) {
        const tidalFactor = Math.min(8.0, ISCO / Math.max(p.radius, 0.1));
        p.mesh.scale.set(1.0 / Math.sqrt(tidalFactor), tidalFactor, 1.0 / Math.sqrt(tidalFactor));
        p.mesh.material.color.setHex(0xf43f5e);
      }

      p.mesh.position.x = Math.cos(p.theta) * p.radius;
      p.mesh.position.z = Math.sin(p.theta) * p.radius;
      p.mesh.position.y *= 0.98;

      // 🌟 推流 PiP 儀表板
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
        if (pipVel) pipVel.textContent = `${Math.min(0.99, currentSpeed * 2.8).toFixed(2)} c`;
        if (pipTidal) pipTidal.textContent = `${(gravityPull * 16.0).toFixed(1)} g`;
        if (pipTemp) pipTemp.textContent = `${estimatedTemp.toLocaleString()} K`;

        if (pipAlert) {
          if (p.radius < Rs * 1.1) {
            pipAlert.textContent = 'FREEZING (1+z)';
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

      // 在視界臨界處停留觀測時間（凍結紅移）
      if (p.radius <= Rs * 1.02) {
        p.freezeCounter++;
        p.mesh.material.opacity = Math.max(0, 1.0 - p.freezeCounter / 80);
      }

      if (p.freezeCounter > 80) {
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
