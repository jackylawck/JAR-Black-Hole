const RelativisticParticleShader = {
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
    varying float vLife;

    void main() {
      // 1. 動態物質生命週期與流入模擬 (Inflow Lifecycle)
      // 粒子隨時間緩慢向內盤旋，歸零後於外圈重生
      float lifeSpan = 12.0;
      float progress = mod(uTime * 0.4 + aLifeOffset, lifeSpan) / lifeSpan;
      vLife = progress;

      // 徑向動態流入收縮
      float dynamicRadius = mix(aRadius, aRadius * 0.45, progress);
      float currentTheta = aTheta + (aSpeed / max(dynamicRadius * 0.2, 0.5)) * uSpeedFactor * uTime;
      
      vec3 pos = vec3(
        cos(currentTheta) * dynamicRadius * uMassScale,
        aVy * (dynamicRadius / aRadius) * uMassScale,
        sin(currentTheta) * dynamicRadius * uMassScale
      );

      // 切向相對論速度向量
      vVelocity = vec3(
        -sin(currentTheta),
        0.0,
        cos(currentTheta)
      ) * (aSpeed * uSpeedFactor);

      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      vWorldPos = worldPosition.xyz;
      vRadius = length(pos);

      vec4 mvPosition = viewMatrix * worldPosition;

      // 2. 距離與半徑能量動態尺寸衰減 (內圈高能粒子更大)
      float sizeRadialFactor = mix(4.2, 1.8, clamp((vRadius - 3.0 * uMassScale) / (15.0 * uMassScale), 0.0, 1.0));
      gl_PointSize = sizeRadialFactor * (45.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragment: `
    uniform float uMassScale;
    
    varying vec3 vWorldPos;
    varying vec3 vVelocity;
    varying float vRadius;
    varying float vLife;

    void main() {
      vec2 pt = gl_PointCoord - vec2(0.5);
      if(length(pt) > 0.5) discard;

      float Rs = 2.0 * uMassScale;
      float ISCO = 6.0 * uMassScale;
      vec3 viewDir = normalize(cameraPosition - vWorldPos);

      // 1. 都卜勒聚束 (Lorentz Beaming)
      float speed = length(vVelocity);
      float c = 0.5;
      float beta = min(speed / c, 0.999);
      vec3 velDir = normalize(vVelocity);
      float cos_theta = dot(velDir, viewDir);
      
      float gamma = 1.0 / sqrt(1.0 - beta * beta);
      float doppler = 1.0 / (gamma * (1.0 - beta * cos_theta));

      // 2. 引力紅移與 ISCO 幾何溶解
      float redshift = vRadius > Rs ? sqrt(1.0 - Rs / vRadius) : 0.001;
      float efficiency = 1.0;
      if(vRadius < ISCO) {
        efficiency = max(0.0, (vRadius - Rs) / (ISCO - Rs));
      }

      float intensity = pow(doppler, 4.0) * redshift * pow(efficiency, 2.0);

      // 3. 基礎色溫漸變
      vec3 colorInner = vec3(1.0, 1.0, 1.0);
      vec3 colorOuter = vec3(1.0, 0.26, 0.0);
      float t = clamp((vRadius - ISCO) / 15.0, 0.0, 1.0);
      vec3 baseColor = mix(colorInner, colorOuter, t);

      // 4. 都卜勒紫暈與光譜偏移
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

      // 5. 跨越 ISCO 的最後金色閃爍
      if (vRadius < ISCO && vRadius > ISCO * 0.82) {
        float glint = pow((ISCO - vRadius) / (ISCO * 0.18), 2.0) * 0.65;
        baseColor += vec3(1.0, 0.92, 0.75) * glint;
      }

      // 生命週期頭尾淡入淡出 (平滑誕生與吞噬)
      float lifeFade = sin(vLife * 3.1415926);

      baseColor *= min(intensity, 3.5) * (0.6 + 0.4 * lifeFade);
      gl_FragColor = vec4(baseColor, 0.88 * efficiency);
    }
  `
};
