# 🌌 J.A.R. 黑洞 3D | JAR Black Hole 3D

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![WebGL](https://img.shields.io/badge/WebGL-Three.js-cyan.svg)](https://threejs.org/)
[![Physics](https://img.shields.io/badge/Physics-General_Relativity-purple.svg)](#-科研級物理模型--research-grade-physics)
[![Status](https://img.shields.io/badge/Status-10.0_Legendary_Gold-gold.svg)](#)

---

## 📖 關於本專案 (About This Project)

### 繁體中文
這是為了我和兒子共渡美好時光而開發的非商業個人專案！希望透過親手打造的 3D 廣義相對論黑洞與時空彎曲模擬器，讓孩子在探索前沿天文物理與深空探測的過程中感受創造的快樂。誠摯邀請所有朋友一起體驗穿越事件視界、目睹光子環與意粉化撕裂的震撼與樂趣，共創無價的探索回憶！

### English
This project is a non-commercial, personal endeavor created to spend quality, inspiring moments with my son! By building an interactive 3D General Relativity black hole sandbox together, we aim to ignite curiosity and the joy of scientific creation. We warmly invite friends to experience the awe of crossing the event horizon, witnessing photon spheres, and exploring spacetime curvature together!

---

## 🌟 核心特色 (Key Features)

### 繁體中文
* **🎬 AAA 工業級電影光影與相對論著色器 (Photorealistic Relativistic Visuals)**：
  * 基於 Three.js 的 ACES Filmic 色調映射與 UnrealBloom 高階光暈管線。
  * 自定義 GLSL 相對論吸積盤著色器：實時引力透鏡（Gravitational Lensing）光線偏折與時空扭曲。
  * 物理級都卜勒射束（Doppler Beaming）增亮與引力紅移（Gravitational Redshift）高溫色溫漸變。
  * 3D 全息事件視界（Event Horizon）、光子球（Photon Sphere）與動態引力透鏡垂直環。

* **🔬 廣義相對論科研級黑洞物理引擎 (Research-Grade Physics Engine)**：
  * **史瓦西度規（Schwarzschild Metric）**：精確計算事件視界半徑 $R_s = \frac{2GM}{c^2}$、光子球半徑 $r_{ph} = 1.5 R_s$ 及最內穩定圓軌道 $r_{ISCO} = 3 R_s$。
  * **潮汐力意粉化模型（Spaghettification）**：探測器穿越 ISCO 軌道後的切向壓縮與徑向極限拉伸物理形變。
  * **引力時間膨脹（Gravitational Time Dilation Freeze）**：探測器逼近視界臨界時的相對論凍結與訊號衰減。
  * **動態度規曲率狀態機**：根據天體引力質量自動切換 `STABLE`（穩定）$\to$ `WARNING`（潮汐警示）$\to$ `CRITICAL`（暴縮臨界）。

* **🛰️ 探測器第一人稱畫中畫與虛擬遙測 (Probe POV & PiP Diagnostics)**：
  * **WebGL Scissor Test 雙重視口渲染**：右上角實時子畫面呈現探測器直墜黑洞的第一人稱視角（POV）。
  * **探測器全息座艙 HUD Overlay**：前掠翼與天線投影、動態瞄準準星、全息 CRT 掃描線。
  * **4 聯實時深空遙測儀表**：軌道距離（$R_s$）、相對論速度（$c$）、潮汐張力（$g$）與黑體輻射溫度（$K$）。

* **🎧 空間音訊與類比電路動態抖動引擎 (Spatial Audio & Analog Jitter)**：
  * Web Audio API 打造的低頻引力共振脈動與 HRTF 3D 空間定位定位。
  * 結合 BiquadFilter 與 WaveShaper 的四維非線性失真管線，隨度規狀態產生真實的類比電路熱噪聲與共振漂移。

* **🎮 完整閉環操作、恆星演化與雙模式 (Interactive Gamification & Evolution)**：
  * **恆星演化時間軸**：滑動體驗從主序星、紅超巨星、超新星爆發到黑洞奇異點的 5 大演化歷程。
  * **智能捲起模式（Telemetry-Only Mode）**：一鍵折疊繁複滑塊，僅保留頂部狀態與核心數據，100% 視野還給黑洞。
  * **雙模式切換**：🚀 探索模式（任務指引） / ⚛️ 科研模式（實時推流 $g_{\mu\nu}$ 度規張量與測地線演算日誌）。
  * **手機與橫屏深度適配**：直屏置頂空間防遮擋、橫屏左右分翼太空艙架構（支援 iOS 安全區）。

---

### English
* **🎬 AAA Industrial Photorealistic Relativistic Visuals**:
  * ACES Filmic Tone Mapping and UnrealBloom post-processing pipeline in Three.js.
  * Custom GLSL shaders for relativistic accretion disk, real-time gravitational lensing, and spacetime warping.
  * Relativistic Doppler beaming and temperature-dependent gravitational redshift gradients.
  * Volumetric photon sphere, event horizon shadow, and dynamic vertical gravitational lensing rings.

* **🔬 Research-Grade General Relativity Physics**:
  * **Schwarzschild Metric Solver**: Real-time evaluation of $R_s$, Photon Sphere ($1.5 R_s$), and ISCO ($3 R_s$).
  * **Tidal Spaghettification Model**: Radial elongation and tangential compression physics past the ISCO limit.
  * **Gravitational Time Dilation**: Asymptotic freeze and redshift fade for probes approaching the horizon.
  * **Curvature Finite State Machine**: Dynamic state transitions across `STABLE`, `WARNING`, and `CRITICAL`.

* **🛰️ Probe POV Dual-Viewport & Telemetry Diagnostics**:
  * **WebGL Scissor-Test Dual Viewport**: Real-time top-right Picture-in-Picture (PiP) feed for probe first-person descent.
  * **Probe Chassis HUD Overlay**: V-wing silhouette, antenna projection, targeting crosshair, and CRT scanlines.
  * **4-Axis Live Flight Telemetry**: Radial Distance ($R_s$), Relativistic Speed ($c$), Tidal G-Force ($g$), and Blackbody Temp ($K$).

* **🎧 Spatial Audio & Analog Circuit Jitter Engine**:
  * Web Audio API procedural gravitational drone with full HRTF 3D spatial panning.
  * Non-linear BiquadFilter/WaveShaper distortion pipeline with analog thermal noise modulation.

* **🎮 Full Interactive Console & Stellar Evolution**:
  * **Stellar Lifecycle Timeline**: Interactive scrubbing through 5 evolutionary stages from Main Sequence to Singularity.
  * **Telemetry-Only Collapsible Mode**: Minimizes control drawers while keeping real-time metrics visible.
  * **Dual Operating Modes**: 🚀 Explorer Mode (Mission narrative) / ⚛️ Research Mode (Live geodesic tensor log stream).
  * **Mobile & Landscape Optimization**: Responsive cockpit layout, landscape split wings, and iOS safe area support.

---

## 🗂️ 模組架構 (Architecture)

```text
JAR-Black-Hole/
├── index.html              # 應用程式入口、全息 HUD、PiP 畫中畫佈局 / App Entry & HUD Layout
├── style.css               # 3A 駕駛艙透視 UI、PiP 覆蓋層、手機與橫屏適配 / Styles & RWD
├── manifest.json           # PWA 漸進式應用設定 / PWA Configuration
├── sw.js                   # Service Worker 離線快取 / Offline Service Worker
└── js/
    ├── main.js             # 主動畫迴圈、數值平滑緩動、度規狀態機 / Main Loop & State Machine
    ├── scene.js            # Three.js 渲染管線、相機避障、雙重視口渲染 / 3D Pipeline & Dual Viewport
    ├── shaders.js          # 吸積盤 GLSL 頂點與片元相對論著色器 / Relativistic GLSL Shaders
    ├── particles.js        # GPGPU 粒子吸積盤系統 / Particle Accretion Disk System
    ├── probe.js            # 探測器軌道衰減、時間膨脹與第一人稱鏡頭 / Probe Mechanics & POV Camera
    ├── audio.js            # Web Audio API 空間音效與四維非線性抖動 / Procedural Soundscape & Jitter
    ├── evolution.js        # 恆星演化時間軸與光學階段更新 / Stellar Evolution Timeline
    ├── physics.js          # 相對論幾何常數計算庫 / Relativistic Physics Constants
    ├── i18n.js             # 雙語多語言系統 (繁中 / EN) / Localization System
    └── narrative.js        # 深空探索任務鏈與數據收集系統 / Mission Narrative Dispatcher

```

---

## 📜 授權條款 (License)

本專案採用 MIT License 授權開源。歡迎教育機構、物理愛好者自由使用、修改與二次開發！

This project is open source under the MIT License.

---

## 🛡️ 法律合規與免責聲明 (Compliance & Disclaimers)

* 法律免責聲明 (DISCLAIMER.md)
* AI 與科普教育合規評估 (COMPLIANCE.md)
* 數據隱私保護政策 (PRIVACY.md)
