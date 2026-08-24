window.RelativisticParticleShader = {
  vertex: `
    uniform float uTime;
    uniform float uSpeedFactor;
    uniform float uMassScale;

    attribute float aRadius;
    attribute float aTheta;
    attribute float aSpeed;
    attribute float aVy;
    attribute float aLifeOffset;

    varying vec3 vWorldPos;
    varying vec3 vVelocity;
    varying float vRadius;

    void main() {
      float lifeSpan = 10.0;
      float progress = mod(uTime * 0.5 + aLifeOffset, lifeSpan) / lifeSpan;

      float dynamicRadius = mix(aRadius, aRadius * 0.45, progress);
      float currentTheta = aTheta + (aSpeed / max(dynamicRadius * 0.25, 0.5)) * uSpeedFactor * uTime;

      float zDist = sin(currentTheta);
      float lensWarp = 0.0;
      if (zDist < 0.0) {
        lensWarp = sin(progress * 3.14159) * (1.6 * uMassScale) * (-zDist);
      }

      vec3 pos = vec3(
        cos(currentTheta) * dynamicRadius * uMassScale,
        (aVy + lensWarp * (aVy >= 0.0 ? 1.0 : -1.0)) * uMassScale,
        sin(currentTheta) * dynamicRadius * uMassScale
      );

      vVelocity = vec3(-sin(currentTheta), 0.0, cos(currentTheta)) * (aSpeed * uSpeedFactor);

      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      vWorldPos = worldPosition.xyz;
      vRadius = length(pos);

      vec4 mvPosition = viewMatrix * worldPosition;
      gl_PointSize = mix(6.0, 2.5, clamp((vRadius - 2.5 * uMassScale) / (16.0 * uMassScale), 0.0, 1.0)) * (60.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragment: `
    uniform float uMassScale;
    
    varying vec3 vWorldPos;
    varying vec3 vVelocity;
    varying float vRadius;

    void main() {
      vec2 pt = gl_PointCoord - vec2(0.5);
      float dist = length(pt);
      if(dist > 0.5) discard;

      float alpha = smoothstep(0.5, 0.05, dist);
      float Rs = 2.0 * uMassScale;
      float ISCO = 6.0 * uMassScale;

      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      vec3 velDir = normalize(vVelocity);
      float cos_theta = dot(velDir, viewDir);
      float doppler = clamp(1.0 + cos_theta * 0.6, 0.5, 2.0);

      float normR = clamp((vRadius - Rs) / (14.0 * uMassScale), 0.0, 1.0);
      
      vec3 coreWhite = vec3(1.0, 0.95, 0.85);
      vec3 goldPlasma = vec3(1.0, 0.55, 0.1);
      vec3 deepOrange = vec3(0.9, 0.2, 0.02);

      vec3 color = mix(coreWhite, goldPlasma, smoothstep(0.0, 0.35, normR));
      color = mix(color, deepOrange, smoothstep(0.35, 1.0, normR));

      if (doppler > 1.2) {
        color = mix(color, vec3(0.4, 0.7, 1.0), (doppler - 1.2) * 0.5);
      }

      float brightness = pow(doppler, 2.0) * 2.0;
      if (vRadius < ISCO) {
        brightness *= smoothstep(Rs, ISCO, vRadius) * 1.5;
      }

      gl_FragColor = vec4(color * brightness, alpha * 0.9);
    }
  `
};
