const ParticleManager = {
  disk: null,
  material: null,
  geometry: null,

  init(scene, baseRadius) {
    // 🌟 優化 1: 根據裝置效能自動適配粒子負載
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const particleCount = isMobile ? 8000 : 28000;
    
    const radii = new Float32Array(particleCount);
    const thetas = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const vYs = new Float32Array(particleCount);
    const lifeOffsets = new Float32Array(particleCount);

    const minR = baseRadius * 1.25;
    const maxR = 19.5;

    for (let i = 0; i < particleCount; i++) {
      // 指數分佈使內圈吸積盤具備更高的粒子密度
      const r = minR + Math.pow(Math.random(), 2.2) * (maxR - minR);
      radii[i] = r;
      thetas[i] = Math.random() * Math.PI * 2;
      speeds[i] = Physics.calculateOrbitalVelocity(r, 16);
      vYs[i] = (Math.random() - 0.5) * (r * 0.07);
      lifeOffsets[i] = Math.random() * 12.0; // 隨機生命偏移
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1));
    this.geometry.setAttribute('aTheta', new THREE.BufferAttribute(thetas, 1));
    this.geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    this.geometry.setAttribute('aVy', new THREE.BufferAttribute(vYs, 1));
    this.geometry.setAttribute('aLifeOffset', new THREE.BufferAttribute(lifeOffsets, 1));
    this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(particleCount * 3), 3));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uSpeedFactor: { value: 1.0 },
        uMassScale: { value: 1.0 }
      },
      vertexShader: RelativisticParticleShader.vertex,
      fragmentShader: RelativisticParticleShader.fragment,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.disk = new THREE.Points(this.geometry, this.material);
    scene.add(this.disk);
  },

  update(timeDelta, speedFactor, massScale) {
    if (this.material) {
      this.material.uniforms.uTime.value += timeDelta;
      this.material.uniforms.uSpeedFactor.value = speedFactor;
      this.material.uniforms.uMassScale.value = massScale;
    }
  }
};
