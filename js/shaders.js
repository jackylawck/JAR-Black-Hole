window.KerrShaders = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,

  fragmentShader: `
    precision highp float;
    
    uniform vec3 uCameraPos;
    uniform mat4 uCamMatrix;
    uniform float uAspect;
    uniform float uFovTan;
    uniform float uMass;
    uniform float uSpin;
    uniform float uTime;
    
    varying vec2 vUv;

    const int MAX_STEPS = 160;

    // 🌟 1. Novikov-Thorne (1973) 相對論薄盤通量解析解
    float getNovikovThorneFlux(float r, float M, float r_isco) {
      if (r <= r_isco) return 0.0;
      float x = sqrt(r / M);
      float x0 = sqrt(r_isco / M);
      
      float term1 = (x - x0) - 1.5 * log(x / x0);
      float term2 = 3.0 * (x0 - 1.0) / (x * (x0 + 1.0)) * log((x - 1.0) / (x0 - 1.0));
      float factor = max(0.0, (1.0 / (x * x * x * x * x)) * (term1 - term2));
      
      return pow(factor, 0.25);
    }

    // 🌟 2. 4D 克爾測地線微商
    vec3 evaluateKerrGeodesicAccel(vec3 pos, vec3 dir, float M, float a) {
      float r = length(pos);
      if (r < 0.1) return vec3(0.0);

      float schwForce = (1.5 * M) / (r * r * r);
      vec3 mainAccel = -pos * schwForce;

      vec3 spinAxis = vec3(0.0, 1.0, 0.0);
      vec3 dragAccel = cross(spinAxis, dir) * ((2.0 * M * a) / (r * r * r * r));

      return mainAccel + dragAccel;
    }

    vec3 blackbodyColor(float tempNorm) {
      vec3 colCore = vec3(0.85, 0.95, 1.0);
      vec3 colMid  = vec3(1.0, 0.65, 0.2);
      vec3 colEdge = vec3(0.8, 0.15, 0.02);

      if (tempNorm > 0.6) {
        return mix(colMid, colCore, (tempNorm - 0.6) / 0.4);
      } else {
        return mix(colEdge, colMid, tempNorm / 0.6);
      }
    }

    void main() {
      // 🌟 3. 完美抵消 Aspect 畸變的世界射線生成
      vec2 ndc = (vUv - 0.5) * 2.0;
      vec3 rayDirCam = normalize(vec3(ndc.x * uAspect * uFovTan, ndc.y * uFovTan, -1.0));
      vec3 rayDir = normalize((uCamMatrix * vec4(rayDirCam, 0.0)).xyz);

      vec3 pos = uCameraPos;
      vec3 dir = rayDir;

      float M = max(0.1, uMass);
      float a = clamp(uSpin * 0.4, -0.99, 0.99);

      float Rs = 2.0 * M;
      float r_plus = M + sqrt(max(0.001, M * M - a * a));
      
      float z1 = 1.0 + pow(1.0 - a * a, 1.0 / 3.0) * (pow(1.0 + a, 1.0 / 3.0) + pow(1.0 - a, 1.0 / 3.0));
      float z2 = sqrt(3.0 * a * a + z1 * z1);
      float r_isco = (3.0 + z2 - sign(a) * sqrt(max(0.0, (3.0 - z1) * (3.0 + z1 + 2.0 * z2)))) * M;
      float r_outer = 16.0 * M;

      vec4 accumColor = vec4(0.0);
      float totalOpacity = 0.0;

      for (int i = 0; i < MAX_STEPS; i++) {
        float r = length(pos);

        if (r <= r_plus * 1.005) {
          break;
        }

        // 自適應步長
        float dt = clamp(0.18 * (r / (3.0 * Rs)), 0.025, 0.28);

        // Novikov-Thorne 輻射轉移
        if (abs(pos.y) < 0.28 && r >= r_isco && r <= r_outer) {
          float ntFlux = getNovikovThorneFlux(r, M, r_isco);
          
          if (ntFlux > 0.001) {
            float phi = atan(pos.z, pos.x);
            vec3 orbitalVel = normalize(vec3(-sin(phi), 0.0, cos(phi)));
            
            float beta = clamp(sqrt(M / r), 0.0, 0.72);
            float cosTheta = dot(orbitalVel, -dir);
            float gamma = 1.0 / sqrt(1.0 - beta * beta);
            float dopplerFactor = 1.0 / (gamma * (1.0 - beta * cosTheta));

            float gravRedshift = sqrt(max(0.02, 1.0 - (2.0 * M) / r));
            float gFactor = dopplerFactor * gravRedshift;

            vec3 radColor = blackbodyColor(ntFlux) * pow(gFactor, 3.8);

            float diskDensity = (1.0 - abs(pos.y) / 0.28) * ntFlux;
            float stepAlpha = clamp(diskDensity * 0.22, 0.0, 1.0);

            accumColor.rgb += radColor * stepAlpha * (1.0 - totalOpacity);
            totalOpacity += stepAlpha;

            if (totalOpacity >= 0.98) break;
          }
        }

        // 測地線 RK2 推進
        vec3 k1 = evaluateKerrGeodesicAccel(pos, dir, M, a);
        vec3 midPos = pos + dir * (0.5 * dt);
        vec3 midDir = normalize(dir + k1 * (0.5 * dt));

        vec3 k2 = evaluateKerrGeodesicAccel(midPos, midDir, M, a);
        dir = normalize(dir + k2 * dt);
        pos += dir * dt;

        if (r > 38.0) break;
      }

      gl_FragColor = vec4(accumColor.rgb, totalOpacity);
    }
  `
};
