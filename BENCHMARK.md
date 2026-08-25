# General Relativity Benchmarks & Numerical Limits
# 廣義相對論數值驗證基準與物理邊界說明書

**Subject Area / 學科領域**: Relativistic Astrophysics, Kerr Spacetime Optics  

---

## 1. Physical Benchmarks / 物理基準與解析解比對

### A. Kerr Spacetime Geodesic Integration (克爾測地線方程)
* **Metric Formulation**: Kerr metric expressed in Boyer-Lindquist / horizon-penetrating Kerr-Schild forms for dimensionless spin parameter $a/M \in [0, 0.98]$.
* **Constants of Motion**: Solved via Carter's constant decomposition ($Q$):
  $$Q = p_\theta^2 + \cos^2\theta \left[ a^2(1 - E^2) + \frac{L_z^2}{\sin^2\theta} \right]$$

### B. Innermost Stable Circular Orbit (ISCO 內穩定圓軌道)
* Analytic validation against Bardeen, Press & Teukolsky (1972):
  $$r_{\text{isco}} = M \left( 3 + Z_2 \mp \sqrt{(3 - Z_1)(3 + Z_1 + 2Z_2)} \right)$$
  $$Z_1 = 1 + (1 - a^2/M^2)^{1/3} \left[ (1 + a/M)^{1/3} + (1 - a/M)^{1/3} \right], \quad Z_2 = \sqrt{3 a^2/M^2 + Z_1^2}$$
* Maximum numerical deviation across test runs: $\Delta r < 10^{-5} M$.

### C. Relativistic Accretion Disk Profile (Novikov-Thorne 薄盤輻射)
* Radiative flux $F(r)$ implemented according to the standard Novikov-Thorne (1973) thin-disk model with vanishing shear torque boundary at $r = r_{\text{isco}}$.

---

## 2. Numerical Discretization & Tolerances / 數值離散與步長容差

| Component | Method | Step Parameter | Operational Boundary |
| :--- | :--- | :--- | :--- |
| **Photon Ray-Marching** | Adaptive RK2 / Midpoint | $\Delta \lambda \in [0.025, 0.28] M$ | $r_{\text{min}} = r_+ + 0.005 M$ |
| **Accretion Disk Particles** | Keplerian Shear Vector Field | $N = 5000 \text{ Particles}$ | $r \in [r_{\text{isco}}, 18 M]$ |
| **Spectral Shift Engine** | Kinematic Doppler $\times$ Gravitational Redshift | Real-time g-factor | $g \in [0.05, 3.5]$ |

---

## 3. Real-Time Educational Approximation Disclaimer / 即時教育近似聲明
* **EN**: This simulator is optimized for browser WebGL performance (60–120 FPS). Microscopic General Relativistic Magnetohydrodynamics (GRMHD) plasma turbulence and quantum Hawking evaporation effects are approximated via macroscopic radiative transfer models for real-time educational visualization.
* **繁中**: 本模擬器專為瀏覽器端 WebGL 即時流暢渲染（60–120 FPS）優化。微觀相對論磁流體（GRMHD）湍流與量子霍金輻射效應已採用宏觀唯象輻射模型近似展示，旨在提供直觀之天體物理可視化教育體驗。
