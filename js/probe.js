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
    // 記憶體防護：最多同時存在 5 枚探測器，超額自動回收最舊探測器
    if (this.probes.length >= 5) {
      const oldest = this.probes.shift();
      this.cleanupProbe(oldest);
    }

    // 獨立材質實例化，避免多探測器色彩狀態互相污染
    const material = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(0xffffff),
      emissive: new THREE.Color(0x4488ff),
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8
    });
    
    const probe = new THREE.Mesh(this.probeGeometry, material);
    const angle = Math.random() * Math.PI * 2;
    const distance = 26.0;
    
    probe.position.set(
      Math.cos(angle) * distance, 
      (Math.random() - 0.5) * 4.0, 
      Math.sin(angle) * distance
    );
    probe.lookAt(0, 0, 0);
    probe.rotateX(Math.PI / 2);

    this.scene.add(probe);
    
    // 獨立尾跡材質
    const trailGeo = new THREE.BufferGeometry();
    const trailMat = new THREE.LineBasicMaterial({ 
      color: new THREE.Color(0x4488ff), 
      transparent: true, 
      opacity: 0.7 
    });
    const trail = new THREE.Line(trailGeo, trailMat);
    this.scene.add(trail);
    
    this.probes.push({
      mesh: probe,
      material: material,
      trail: trail,
      trailMat: trailMat,
      trailPoints: [],
      velocity: 0.055,
      spinSpeedX: (Math.random() - 0.5) * 2.0,
      spinSpeedY: 2.5 + Math.random() * 2.0,
      isCollapsing: false,
      collapseProgress: 0.0,
      isDestroyed: false
    });

    // 空間定位發射音效
    if (typeof AudioManager !== 'undefined') {
      AudioManager.playLaunch(probe.position);
    }
  },

  update(massScale) {
    const Rs = 2.0 * massScale;              // 史瓦西半徑
    const ISCO = 6.0 * massScale;            // ISCO 內邊界 (3 Rs)
    const tidalThreshold = 10.0 * massScale; // 10 Rs 開始漸進式潮汐力拉伸
    const G_M = massScale * 10.0;

    for (let i = this.probes.length - 1; i >= 0; i--) {
      const p = this.probes[i];
      if (p.isDestroyed) continue;

      // 0.3s 極限塌縮消亡動畫
      if (p.isCollapsing) {
        p.collapseProgress += 0.05;
        const shrink = Math.max(0.001, 1.0 - p.collapseProgress);
        p.mesh.scale.multiplyScalar(shrink);
        p.material.opacity = shrink;
        p.trailMat.opacity = shrink * 0.5;

        if (p.collapseProgress >= 1.0) {
          this.cleanupProbe(p);
          p.isDestroyed = true;
          this.probes.splice(i, 1);
        }
        continue;
      }

      const currentR = p.mesh.position.length();

      // 1. 引力加速度推進 (a = GM / r^2)
      p.velocity += (G_M / Math.pow(currentR, 2)) * 0.022;
      const fallDir = p.mesh.position.clone().normalize().multiplyScalar(-p.velocity);
      p.mesh.position.add(fallDir);

      // 2. 角動量守恆自轉加速 (越接近黑洞自轉越快)
      const spinMultiplier = Math.min(15.0, 30.0 / Math.max(currentR, 1.0));
      p.mesh.rotateY(p.spinSpeedY * spinMultiplier * 0.01);
      p.mesh.rotateX(p.spinSpeedX * spinMultiplier * 0.01);

      // 3. 物質尾跡點陣維護
      p.trailPoints.push(p.mesh.position.clone());
      if (p.trailPoints.length > 20) p.trailPoints.shift();
      p.trail.geometry.setFromPoints(p.trailPoints);

      // 4. 漸進式非線性潮汐力意粉化拉伸 (10 Rs ~ ISCO ~ Rs)
      if (currentR < tidalThreshold) {
        const tidalForce = (2.0 * G_M) / Math.pow(currentR, 3);
        const stretchZ = 1.0 + Math.pow(tidalForce, 1.25) * 14.0;
        const compressXY = 1.0 / Math.sqrt(stretchZ);
        p.mesh.scale.set(compressXY, compressXY, stretchZ);

        // 光譜紅移與尾跡顏色嚴格同步
        const redshift = Math.max(0.0, (currentR - Rs) / (tidalThreshold - Rs));
        
        // 探測器本體顏色演化：冷白藍 -> 高溫橙紅 -> 瀕死暗紅
        const targetColor = new THREE.Color(0xffffff).lerp(new THREE.Color(0x330000), 1.0 - redshift);
        const targetEmissive = new THREE.Color(0x4488ff).lerp(new THREE.Color(0x110000), 1.0 - redshift);
        
        p.material.color.copy(targetColor);
        p.material.emissive.copy(targetEmissive);

        // 尾跡同步紅移與淡出
        p.trailMat.color.copy(targetColor);
        p.trailMat.opacity = Math.max(0.05, redshift * 0.7);
      }

      // 5. 跨越事件視界 (r <= Rs) 進入塌縮階段
      if (currentR <= Rs && !p.isCollapsing) {
        p.isCollapsing = true;

        // 觸發意粉化失真音效與 0.5s 全頻深淵留白
        if (typeof AudioManager !== 'undefined') {
          AudioManager.playSpaghettification();
        }
      }
    }
  },

  cleanupProbe(p) {
    if (p.mesh) {
      this.scene.remove(p.mesh);
      if (p.material) p.material.dispose();
    }
    if (p.trail) {
      this.scene.remove(p.trail);
      if (p.trail.geometry) p.trail.geometry.dispose();
      if (p.trailMat) p.trailMat.dispose();
    }
  }
};
