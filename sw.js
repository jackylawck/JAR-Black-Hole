* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  overflow: hidden;
  background: #020617;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  user-select: none;
  -webkit-user-select: none;
  color: #f8fafc;
  touch-action: none;
  overscroll-behavior: none;
}

/* 🌟 核心保證：Canvas 獨佔全螢幕手勢層 */
#canvas-container {
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  touch-action: none;
  pointer-events: auto;
}

#starfield-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(56, 189, 248, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(168, 85, 247, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, #020617 0%, #01040d 100%);
}

/* ============================================================
   頂部極簡狀態列
   ============================================================ */
.top-hud-bar {
  position: fixed;
  top: env(safe-area-inset-top, 10px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  width: min(800px, 92vw);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(6, 12, 30, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(56, 189, 248, 0.16);
  border-radius: 10px;
  padding: 5px 14px;
  pointer-events: auto;
}

.sys-status { display: flex; align-items: center; gap: 5px; }
.status-dot {
  width: 5px; height: 5px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 8px #38bdf8; animation: pulseDot 2s infinite ease-in-out;
}
@keyframes pulseDot {
  0%, 100% { opacity: 0.4; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.15); }
}

.status-text {
  font-size: 0.5rem; font-weight: 800; letter-spacing: 1.2px; color: #64748b; font-family: 'Courier New', monospace;
}

.mode-switcher {
  display: flex; background: rgba(0, 0, 0, 0.4); border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.06); padding: 1px;
}
.mode-btn {
  background: transparent; border: none; color: #64748b; font-size: 0.5rem; font-weight: 700; padding: 2px 10px; border-radius: 3px; cursor: pointer;
}
.mode-btn.active {
  background: linear-gradient(135deg, #0284c7, #7c3aed); color: #fff; box-shadow: 0 0 12px rgba(56, 189, 248, 0.25);
}

.top-mission-pill {
  font-size: 0.5rem; color: #94a3b8; font-family: 'Courier New', monospace;
}
.top-mission-pill .highlight { color: #fbbf24; font-weight: 700; }

.lang-switcher { display: flex; gap: 2px; }
.lang-btn {
  background: transparent; border: 1px solid rgba(255, 255, 255, 0.06); color: #64748b; font-size: 0.45rem; font-weight: 600; padding: 1px 6px; border-radius: 3px; cursor: pointer;
}
.lang-btn.active { border-color: #38bdf8; color: #f8fafc; }

/* ============================================================
   🌟 右上角探測器畫中畫
   ============================================================ */
.probe-pip-deck {
  position: fixed;
  top: calc(env(safe-area-inset-top, 10px) + 54px);
  right: 12px;
  width: min(180px, 34vw);
  height: calc(min(180px, 34vw) * 0.72);
  z-index: 25;
  border: 1px solid rgba(56, 189, 248, 0.4);
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 8px;
  padding: 4px 6px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.9) translateY(-8px);
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.9), 0 0 10px rgba(56, 189, 248, 0.2);
  overflow: hidden;
}

.probe-pip-deck.pip-active {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.pip-crosshair {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 16px; height: 16px;
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 50%;
  pointer-events: none;
}

.pip-header {
  display: flex; justify-content: space-between; align-items: center; z-index: 3;
}
.pip-title-wrap { display: flex; align-items: center; gap: 4px; }
.pip-live-dot {
  width: 4px; height: 4px; border-radius: 50%; background: #f43f5e; box-shadow: 0 0 6px #f43f5e; animation: pipDot 0.8s infinite;
}
@keyframes pipDot {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.pip-title { font-family: 'Courier New', monospace; font-size: 0.44rem; font-weight: 800; color: #38bdf8; }
.pip-status-tag {
  font-family: 'Courier New', monospace; font-size: 0.38rem; color: #fbbf24;
  background: rgba(251, 191, 36, 0.12); border: 1px solid rgba(251, 191, 36, 0.25); padding: 1px 3px; border-radius: 3px;
}

.pip-dashboard-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1px 3px;
  font-family: 'Courier New', monospace; font-size: 0.4rem; color: #94a3b8;
  background: rgba(2, 6, 23, 0.75); padding: 2px 4px; border-radius: 4px;
}
.pip-metric-item { display: flex; justify-content: space-between; }
.pip-metric-item .val { color: #f8fafc; font-weight: 700; }
.pip-metric-item .val-hot { color: #f43f5e; text-shadow: 0 0 6px rgba(244, 63, 94, 0.5); }

/* ============================================================
   底部 3A 一體化太空艙 HUD
   ============================================================ */
.bottom-hud-bar {
  position: fixed;
  bottom: env(safe-area-inset-bottom, 12px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  width: min(860px, 95vw);
  background: linear-gradient(180deg, rgba(8, 15, 38, 0.82) 0%, rgba(4, 8, 20, 0.96) 100%);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-top: 2px solid rgba(56, 189, 248, 0.35);
  border-radius: 16px 16px 12px 12px;
  padding: 8px 14px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.85), 0 0 30px rgba(56, 189, 248, 0.06);
  display: flex;
  flex-direction: column;
  gap: 5px;
  pointer-events: auto;
}

.telemetry-deck-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 0.8fr 0.8fr 0.8fr;
  gap: 5px;
}

.telemetry-card {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 4px 6px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.telemetry-card.primary-reactor {
  background: radial-gradient(circle at center, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%);
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.telemetry-card .deck-tag {
  font-size: 0.4rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-family: 'Courier New', monospace; font-weight: 700;
}
.telemetry-card.primary-reactor .deck-tag { color: #38bdf8; }

.telemetry-card .deck-val { font-family: 'Courier New', monospace; font-size: 1.05rem; font-weight: 800; line-height: 1.1; }
.telemetry-card.primary-reactor .deck-val { font-size: 1.25rem; color: #f8fafc; text-shadow: 0 0 12px rgba(255, 255, 255, 0.3); }
.telemetry-card .deck-val small { font-size: 0.5rem; font-weight: 500; opacity: 0.5; }

.val-cyan { color: #38bdf8; text-shadow: 0 0 8px rgba(56, 189, 248, 0.3); }
.val-purple { color: #c084fc; text-shadow: 0 0 8px rgba(192, 132, 252, 0.3); }
.val-amber { color: #fbbf24; text-shadow: 0 0 8px rgba(251, 191, 36, 0.3); }

.val-chip {
  font-family: 'Courier New', monospace; font-size: 0.48rem; font-weight: 800; padding: 1px 6px; border-radius: 3px; display: inline-block;
}
.val-chip.status-stable { color: #38bdf8; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.2); }
.val-chip.status-warning { color: #fbbf24; background: rgba(251, 191, 36, 0.12); border: 1px solid rgba(251, 191, 36, 0.3); }
.val-chip.status-critical { color: #f43f5e; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.4); }

.bottom-evolution-strip {
  display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 3px 0; border-top: 1px solid rgba(255, 255, 255, 0.04); border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}
.evo-mini-meta { display: flex; align-items: center; gap: 5px; font-size: 0.48rem; font-family: 'Courier New', monospace; flex-shrink: 0; }
.evo-mini-title { color: #c084fc; font-weight: 700; }
.evo-mini-badge { color: #38bdf8; }

.evo-mini-actions { display: flex; align-items: center; gap: 4px; flex: 1; }
.evo-btn {
  background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.06); color: #94a3b8; font-size: 0.5rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; cursor: pointer; white-space: nowrap;
}
.evo-btn.play-btn { background: rgba(56, 189, 248, 0.12); border-color: rgba(56, 189, 248, 0.3); color: #38bdf8; }

#evolutionSlider {
  flex: 1; height: 2px; background: linear-gradient(90deg, #38bdf8 0%, #ea580c 40%, #f43f5e 70%, #a855f7 100%); border-radius: 1px; outline: none; min-width: 60px;
}

.bottom-controls-strip {
  display: grid; grid-template-columns: 1.2fr 1.2fr 1.4fr; gap: 8px; align-items: center;
}
.mini-slider-box { display: flex; flex-direction: column; gap: 1px; }
.slider-info { display: flex; justify-content: space-between; align-items: center; }
.slider-info label { font-size: 0.48rem; color: #94a3b8; font-weight: 700; }
.slider-badge {
  font-family: 'Courier New', monospace; font-size: 0.48rem; font-weight: 800; color: #38bdf8; background: rgba(56, 189, 248, 0.08); padding: 0 4px; border-radius: 2px;
}

input[type="range"] {
  -webkit-appearance: none; appearance: none; width: 100%; height: 2px; background: rgba(255, 255, 255, 0.06); border-radius: 1px; outline: none;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none; width: 11px; height: 11px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #ffffff, #38bdf8); border: 2px solid rgba(2, 6, 23, 0.8); box-shadow: 0 0 10px #38bdf8; cursor: pointer; margin-top: -4.5px;
}

.bottom-launch-action {
  position: relative; width: 100%; padding: 6px 12px; background: linear-gradient(135deg, #0284c7 0%, #7c3aed 100%); border: 1px solid rgba(125, 211, 252, 0.35); border-radius: 8px; color: #ffffff; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.5px; cursor: pointer; overflow: hidden; box-shadow: 0 4px 16px rgba(2, 132, 199, 0.25); white-space: nowrap;
}

.btn-glow {
  position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 60%); animation: pulseGlow 3s infinite ease-in-out; pointer-events: none;
}
@keyframes pulseGlow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }

/* ============================================================
   📱 手機與橫屏自適應
   ============================================================ */
@media (max-width: 640px) and (orientation: portrait) {
  .top-mission-pill { display: none; }
  .bottom-hud-bar { bottom: 6px; width: 96vw; padding: 6px 10px; gap: 4px; border-radius: 12px; }
  .telemetry-deck-row { grid-template-columns: 1.2fr 1fr 1fr; gap: 4px; }
  .telemetry-card.sub-pill { display: none; }
  .bottom-controls-strip { grid-template-columns: 1fr 1fr; gap: 6px; }
  .bottom-launch-action { grid-column: span 2; padding: 8px; font-size: 0.65rem; }
  .evo-mini-meta .evo-mini-badge { max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}

@media (orientation: landscape) and (max-height: 520px) {
  .top-hud-bar { top: 4px; padding: 3px 10px; }
  .probe-pip-deck { top: 38px; width: 140px; height: 100px; }
  .bottom-hud-bar { bottom: 4px; padding: 4px 10px; gap: 3px; }
  .telemetry-deck-row { grid-template-columns: repeat(6, 1fr); gap: 3px; }
  .telemetry-card .deck-val { font-size: 0.8rem; }
  .bottom-controls-strip { grid-template-columns: 1fr 1fr 1.2fr; gap: 6px; }
  .bottom-launch-action { padding: 4px 8px; font-size: 0.55rem; }
}
