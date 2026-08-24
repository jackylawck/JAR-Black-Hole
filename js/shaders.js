const RelativisticParticleShader = {
  vertex: `
    uniform float uTime;
    uniform float uSpeedFactor;
    uniform float uMassScale;

    attribute float aRadius;
    attribute float aTheta;
    attribute float aSpeed;
    attribute float aVy;

    varying vec3 vWorldPos;
    varying vec3 vVelocity;
    varying float vRadius;

    void main() {
      float currentTheta = aTheta + aSpeed * uSpeedFactor * uTime;
      
      vec3 pos = vec3(
        cos(currentTheta) * aRadius * uMassScale,
        aVy * uMassScale,
        sin(currentTheta) * aRadius * uMassScale
      );

      vVelocity = vec3(
        -sin(currentTheta),
        0.0,
        cos(currentTheta)
      ) * (aSpeed * uSpeedFactor);

      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      vWorldPos = worldPosition.xyz;
      vRadius = length(pos);

      vec4 mvPosition = viewMatrix * worldPosition;
      gl_PointSize = 3.2 * (40.0 / -mvPosition.z);
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
      if(length(pt) > 0.5) discard;

      float Rs = 2.0 * uMassScale;
      float ISCO = 6.0 * uMassScale;
      vec3 viewDir = normalize(cameraPosition - vWorldPos);

      // 都卜勒聚束 (Lorentz Beaming)
      float speed = length(vVelocity);
      float c = 0.5;
      float beta = min(speed / c, 0.999);
      vec3 velDir = normalize(vVelocity);
      float cos_theta = dot(velDir, viewDir);
      
      float gamma = 1.0 / sqrt(1.0 - beta * beta);
      float doppler = 1.0 / (gamma * (1.0 - beta * cos_theta));

      // 引力紅移與 ISCO 溶解
      float redshift = vRadius > Rs ? sqrt(1.0 - Rs / vRadius) : 0.001;
      float efficiency = 1.0;
      if(vRadius < ISCO) {
        efficiency = max(0.0, (vRadius - Rs) / (ISCO - Rs));
      }

      float intensity = pow(doppler, 4.0) * redshift * pow(efficiency, 2.0);

      // 色溫與紫暈
      vec3 colorInner = vec3(1.0, 1.0, 1.0);
      vec3 colorOuter = vec3(1.0, 0.26, 0.0);
      float t = clamp((vRadius - ISCO) / 15.0, 0.0, 1.0);
      vec3 baseColor = mix(colorInner, colorOuter, t);

      float mappedDoppler = pow(doppler, 1.5);
      if(mappedDoppler > 1.5) {
        vec3 purpleGlow = vec3(0.66, 0.0, 1.0);
        baseColor = mix(baseColor, purpleGlow, min((mappedDoppler - 1.5) * 0.5, 1.0));
      } else if(mappedDoppler > 1.0) {
        vec3 blueShift = vec3(0.53, 0.8, 1.0);
        baseColor = mix(baseColor, blueShift, mappedDoppler - 1.0);
      } else {
        vec3 redShift = vec3(0.06, 0.0, 0.0);
        baseColor = mix(baseColor, redShift, 1.0 - mappedDoppler);
      }

      baseColor *= min(intensity, 3.5);
      gl_FragColor = vec4(baseColor, 0.85);
    }
  `
};
