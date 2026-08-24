const ParticleManager = {
  disk: null,
  material: null,

  init(scene, baseRadius) {
    const particleCount = 25000;
    
    const radii = new Float32Array(particleCount);
    const thetas = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const vYs = new Float32Array(particleCount);

    const minR = baseRadius * 1.25;
    const maxR = 18.0;

    for (let i = 0; i < particleCount; i++) {
      const r = minR + Math.pow(Math.random(), 2) * (maxR - minR);
      radii[i] = r;
      thetas[i] = Math.random() * Math.PI * 2;
      speeds[i] = Physics.calculateOrbitalVelocity(r, 15);
      vYs[i] = (Math.random() - 0.5) * (r * 0.08);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1));
    geometry.setAttribute('aTheta', new THREE.BufferAttribute(thetas, 1));
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute('aVy', new THREE.BufferAttribute(vYs, 1));
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(particleCount * 3), 3));

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

    this.disk = new THREE.Points(geometry, this.material);
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
