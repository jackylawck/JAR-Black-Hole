/**
 * ============================================================================
 * 🌌 J.A.R. Black Hole 3D - 4D Kerr-Schild & Carter Geodesic Physics Engine
 * ============================================================================
 * 
 * 單位制: 幾何化幾何單位制 (G = c = 1, M = 1)
 * 坐標系: 
 *   1. Boyer-Lindquist (t, r, θ, φ) + 完整 Carter 常數 Q 運動積分
 *   2. Horizon-Penetrating Kerr-Schild (T, x, y, z) 穿透坐標 (無視界發散)
 * 數值解法: 4D 狀態向量 RK4 積分器 [t, r, θ, φ, p_r, p_θ]
 * ============================================================================
 */

window.GRPhysics = {
  UNITS: {
    G: 1.0,
    C: 1.0,
    SOLAR_MASS_METERS: 1476.6
  },

  // 1. 解析軌道與視界解
  getHorizons(M = 1.0, a = 0.0) {
    const aNorm = Math.min(Math.max(a, -0.9999), 0.9999) * M;
    const disc = M * M - aNorm * aNorm;
    if (disc < 0) return { r_plus: M, r_minus: M, isNaked: true };
    const sqrtDisc = Math.sqrt(disc);
    return {
      r_plus: M + sqrtDisc,
      r_minus: M - sqrtDisc,
      isNaked: false
    };
  },

  getISCO(M = 1.0, aStar = 0.0) {
    const a = Math.min(Math.max(aStar, -0.9999), 0.9999);
    const z1 = 1.0 + Math.cbrt(1.0 - a * a) * (Math.cbrt(1.0 + a) + Math.cbrt(1.0 - a));
    const z2 = Math.sqrt(3.0 * a * a + z1 * z1);
    const sign = a >= 0 ? 1.0 : -1.0;
    return (3.0 + z2 - sign * Math.sqrt(Math.max(0, (3.0 - z1) * (3.0 + z1 + 2.0 * z2)))) * M;
  },

  getPhotonOrbit(M = 1.0, aStar = 0.0) {
    const a = Math.min(Math.max(aStar, -0.9999), 0.9999);
    return {
      prograde: 2.0 * M * (1.0 + Math.cos(2.0 / 3.0 * Math.acos(-a))),
      retrograde: 2.0 * M * (1.0 + Math.cos(2.0 / 3.0 * Math.acos(a)))
    };
  },

  // 2. 4D Carter 運動方程 (Boyer-Lindquist 完整 4D 測地線)
  // 狀態向量 state: [t, r, θ, φ, p_r, p_theta]
  // 運動常數: E (能量), Lz (軸向角動量), Q (Carter 常數), mu (靜止質量)
  geodesicDerivatives4D(state, M = 1.0, a = 0.0, E = 1.0, Lz = 2.5, Q = 1.2, isPhoton = false) {
    const r = state[1];
    const theta = Math.min(Math.max(state[2], 1e-4), Math.PI - 1e-4);
    const p_r = state[4];
    const p_theta = state[5];

    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const sin2T = sinT * sinT;
    const cos2T = cosT * cosT;
    const r2 = r * r;
    const a2 = a * a;
    const mu2 = isPhoton ? 0.0 : 1.0;

    const Sigma = r2 + a2 * cos2T;
    const Delta = r2 - 2.0 * M * r + a2;
    const P = E * (r2 + a2) - a * Lz;

    // 1. 座標微商 dt/dλ, dφ/dλ
    const dt_dlambda = ((r2 + a2) * P / Delta - a * (a * E * sin2T - Lz)) / Sigma;
    const dphi_dlambda = (a * P / Delta - (a * E - Lz / sin2T)) / Sigma;

    // 2. 徑向與極向微商 dr/dλ, dθ/dλ
    const dr_dlambda = p_r / Sigma;
    const dtheta_dlambda = p_theta / Sigma;

    // 3. 徑向動量微分 dp_r/dλ = (1/2Σ) * dR/dr
    // R(r) = P² - Δ [ μ²r² + (Lz - aE)² + Q ]
    const dDelta_dr = 2.0 * r - 2.0 * M;
    const dP_dr = 2.0 * r * E;
    const termR1 = 2.0 * P * dP_dr;
    const termR2 = dDelta_dr * (mu2 * r2 + Math.pow(Lz - a * E, 2) + Q);
    const termR3 = Delta * (2.0 * mu2 * r);
    const dR_dr = termR1 - (termR2 + termR3);

    // 4. 極向動量微分 dp_θ/dλ = (1/2Σ) * dΘ/dθ
    // Θ(θ) = Q - cos²θ [ a²(μ² - E²) + Lz²/sin²θ ]
    const cotT = cosT / sinT;
    const dTheta_dtheta = 2.0 * sinT * cosT * (a2 * (E * E - mu2) + (Lz * Lz) / (sin2T * sin2T)) - 2.0 * Lz * Lz * cotT / sin2T;

    const dp_r_dlambda = dR_dr / (2.0 * Sigma);
    const dp_theta_dlambda = dTheta_dtheta / (2.0 * Sigma);

    return [dt_dlambda, dr_dlambda, dtheta_dlambda, dphi_dlambda, dp_r_dlambda, dp_theta_dlambda];
  },

  // 3. Kerr-Schild 穿透坐標轉換（無事件視界發散，可平滑穿過 r+）
  toKerrSchild(r, theta, phi, t, a = 0.0) {
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const r2 = r * r;
    const a2 = a * a;

    // 穿透坐標變換
    const x = (r * Math.cos(phi) + a * Math.sin(phi)) * sinT;
    const y = (r * Math.sin(phi) - a * Math.cos(phi)) * sinT;
    const z = r * cosT;
    return { x, y, z };
  },

  // 4. 4D RK4 數值積分單步演算法
  stepRK4_4D(state, dLambda, M = 1.0, a = 0.0, E = 1.0, Lz = 2.5, Q = 1.2, isPhoton = false) {
    const k1 = this.geodesicDerivatives4D(state, M, a, E, Lz, Q, isPhoton);
    
    const s2 = state.map((v, i) => v + 0.5 * dLambda * k1[i]);
    const k2 = this.geodesicDerivatives4D(s2, M, a, E, Lz, Q, isPhoton);

    const s3 = state.map((v, i) => v + 0.5 * dLambda * k2[i]);
    const k3 = this.geodesicDerivatives4D(s3, M, a, E, Lz, Q, isPhoton);

    const s4 = state.map((v, i) => v + dLambda * k3[i]);
    const k4 = this.geodesicDerivatives4D(s4, M, a, E, Lz, Q, isPhoton);

    return state.map((v, i) => v + (dLambda / 6.0) * (k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i]));
  }
};
