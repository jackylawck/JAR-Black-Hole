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
      // 軌道角位置推進
      float currentTheta = aTheta + aSpeed * uSpeedFactor * uTime;
      
      // 依質量縮放計算當前 3D 空間位置
      vec3 pos = vec3(
        cos(currentTheta) * aRadius * uMassScale,
        aVy * uMassScale,
        sin(currentTheta) * aRadius * uMassScale
      );

      // 切向速度向量 (用於計算都卜勒效應)
      vVelocity = vec3(
        -sin(currentTheta),
        0.0,
        cos(currentTheta)
      ) * (aSpeed * uSpeedFactor);

      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      vWorldPos = worldPosition.xyz;
      vRadius = length(pos);

      vec4 mvPosition = viewMatrix * worldPosition;
      // 距離衰減大小控制
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
      // 圓形粒子邊界裁剪
      vec2 pt = gl_PointCoord - vec2(0.5);
      if(length(pt) > 0.5) discard;

      float Rs = 2.0 * uMassScale;       // 史瓦西半徑
      float ISCO = 6.0 * uMassScale;     // 最內穩定圓軌道 (3 Rs)
      vec3 viewDir = normalize(cameraPosition - vWorldPos);

      // 1. 都卜勒聚束 (Lorentz Beaming)
      float speed = length(vVelocity);
      float c = 0.5; // 光速常數歸一化
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

      // 3. 基礎色溫漸變 (高能白熱 -> 橙紅吸積邊界)
      vec3 colorInner = vec3(1.0, 1.0, 1.0);
      vec3 colorOuter = vec3(1.0, 0.26, 0.0);
      float t = clamp((vRadius - ISCO) / 15.0, 0.0, 1.0);
      vec3 baseColor = mix(colorInner, colorOuter, t);

      // 4. 非線性都卜勒紫暈與光譜偏移
      float mappedDoppler = pow(doppler, 1.5);
      if(mappedDoppler > 1.5) {
        vec3 purpleGlow = vec3(0.66, 0.0, 1.0); // 高能紫暈
        baseColor = mix(baseColor, purpleGlow, min((mappedDoppler - 1.5) * 0.5, 1.0));
      } else if(mappedDoppler > 1.0) {
        vec3 blueShift = vec3(0.53, 0.8, 1.0);  // 迎面藍移
        baseColor = mix(baseColor, blueShift, mappedDoppler - 1.0);
      } else {
        vec3 redShift = vec3(0.06, 0.0, 0.0);   // 背向暗紅
        baseColor = mix(baseColor, redShift, 1.0 - mappedDoppler);
      }

      // 🌟 5. 物質跨越 ISCO 的最後閃爍 (ISCO Glint / Dying Light)
      if (vRadius < ISCO && vRadius > ISCO * 0.82) {
        float glint = pow((ISCO - vRadius) / (ISCO * 0.18), 2.0) * 0.65;
        baseColor += vec3(1.0, 0.92, 0.75) * glint; // 暖金耀斑閃爍
      }

      // 最終強度合成
      baseColor *= min(intensity, 3.5);
      gl_FragColor = vec4(baseColor, 0.85);
    }
  `
};
