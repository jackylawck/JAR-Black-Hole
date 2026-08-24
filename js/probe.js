const ProbeManager = {
  probes: [],
  scene: null,
  probeGeometry: new THREE.CylinderGeometry(0.15, 0.25, 1.2, 12),
  
  init(scene) {
    this.scene = scene;
    const launchBtn = document.getElementById('launchBtn');
    if (launchBtn) {
      launchBtn.addEventListener('click', () => this.launchProbe());
    }
  },

  launchProbe() {
    if (this.probes.length >= 5) {
      const oldest = this.probes.shift();
      this.scene.remove(oldest.mesh);
      if (oldest.trail) this.scene.remove(oldest.trail);
    }

    const material = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      emissive: 0x4488ff,
      emissiveIntensity: 0.8
    });
    
    const probe = new THREE.Mesh(this.probeGeometry, material);
    const angle = Math.random() * Math.PI * 2;
    const distance = 25.0;
    probe.position.set(Math.cos(angle) * distance, (Math.random() - 0.5) * 4.0, Math.sin(angle) * distance);
    probe.lookAt(0, 0, 0);
    probe.rotateX(Math.PI / 2);

    this.scene.add(probe);
    
    const trailGeo = new THREE.BufferGeometry();
    const trailMat = new THREE.LineBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.0 });
    const trail = new THREE.Line(trailGeo, trailMat);
    this.scene.add(trail);
    
    this.probes.push({
      mesh: probe,
      trail: trail,
      trailPoints: [],
      velocity: 0.06,
      isDestroyed: false
    });
  },

  update(massScale) {
    const Rs = 2.0 * massScale;
    const ISCO = 6.0 * massScale;
    const G_M = massScale * 10.0;

    for (let i = this.probes.length - 1; i >= 0; i--) {
      const p = this.probes[i];
      if (p.isDestroyed) continue;

      const currentR = p.mesh.position.length();

      // 引力加速
      p.velocity += (G_M / Math.pow(currentR, 2)) * 0.02;
      const fallDir = p.mesh.position.clone().normalize().multiplyScalar(-p.velocity);
      p.mesh.position.add(fallDir);

      // 物質尾跡
      p.trailPoints.push(p.mesh.position.clone());
      if (p.trailPoints.length > 18) p.trailPoints.shift();
      p.trail.geometry.setFromPoints(p.trailPoints);

      // 潮汐力拉伸 (Spaghettification)
      if (currentR < ISCO * 1.5) {
        const tidalForce = (2.0 * G_M) / Math.pow(currentR, 3);
        const stretchZ = 1.0 + Math.pow(tidalForce, 1.3) * 12.0;
        const compressXY = 1.0 / Math.sqrt(stretchZ);
        p.mesh.scale.set(compressXY, compressXY, stretchZ);

        const redshift = Math.max(0, (currentR - Rs) / (ISCO - Rs));
        p.mesh.material.color.lerp(new THREE.Color(0x220000), 1.0 - redshift);
        p.mesh.material.emissive.lerp(new THREE.Color(0x000000), 1.0 - redshift);
        
        p.trail.material.opacity = (1.0 - redshift) * 0.8;
        p.trail.material.color = p.mesh.material.color;
      }

      // 事件視界吞噬
      if (currentR < Rs) {
        this.scene.remove(p.mesh);
        this.scene.remove(p.trail);
        p.isDestroyed = true;
        this.probes.splice(i, 1);
      }
    }
  }
};
