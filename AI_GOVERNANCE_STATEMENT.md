# Algorithm Determinism & AI Regulatory Exemption Statement
# 演算法確定性與 AI 法規適用性說明

**Framework References / 參考框架**: EU AI Act (Regulation EU 2024/1689), ISO/IEC 42001, ISO/IEC 22989, ISO/IEC 23894  

---

## 1. Statutory Exemption: Deterministic Physics vs. AI Systems
## 法規界定：確定性幾何物理求解器 vs. 人工智能系統

### [English]
* **Legal Definition Exemption (EU AI Act Art. 3(1) & ISO/IEC 22989)**:  
  An Artificial Intelligence system is defined as a system designed to operate with autonomy and infer from inputs how to generate outputs (such as predictions, content, or decisions) via machine learning or probabilistic statistical logic.  
  **J.A.R. Black Hole 3D is strictly a deterministic numerical solver for classical General Relativity.** It utilizes analytical mathematical closed forms (Boyer-Lindquist / Kerr-Schild metrics) and numerical Runge-Kutta ray-marching. It contains **zero machine learning algorithms, zero probabilistic inference models, and zero black-box neural networks**.
* **Risk Tiering**:  
  Because the application is a deterministic mathematical visualization, it is **exempt from the scope of the EU AI Act**. Furthermore, it complies fully with Article 2(6) (Scientific Research & Development Safe Harbor).

---

### [繁體中文]
* **法規定義排除 (歐盟 AI 法案第 3(1) 條及 ISO/IEC 22989:2022)**：  
  AI 系統被明確定義為具備自主性、能透過機器學習或概率統計模型推斷生成決策、預測或內容之系統。  
  **J.A.R. Black Hole 3D 本質上為經典廣義相對論幾何之確定性數值求解器**（採用 Boyer-Lindquist / Kerr-Schild 解析度規與 RK2 測地線步進），**完全不含任何機器學習演算法、自適應權重、概率統計模型或黑盒神經網絡**。
* **風險等級與科研豁免**：  
  本專案純屬確定性數學幾何視覺化工具，**不落入歐盟《人工智能法案》之 AI 監管範疇**，同時完全符合法案第 2(6) 條關於科學研究與開源技術開發之豁免原則。

---

## 2. ISO/IEC 42001 Trustworthy Principles Alignment
## ISO/IEC 42001 可信演算法治理指標

| Metric / 指標 | J.A.R. Black Hole Implementation / 實現標準 | Governance Reference / 治理規範 |
| :--- | :--- | :--- |
| **Mathematical Explainability (數學可解釋性)** | 100% white-box analytic equations with peer-reviewed derivations. | EU AI Act Recital 47 / ISO 42001 |
| **Numerical Determinism (數值確定性)** | Identical initial conditions yield bit-exact trajectories across identical WebGL IEEE 754 precision runs. | ISO/IEC 22989 |
| **Boundary Clamping (物理邊界截斷)** | Adaptive step-size clamping at the event horizon ($r \le r_+$) to prevent numerical singularities ($1/0$). | ISO/IEC 23894 (Risk Management) |
| **User Agency (使用者掌控度)** | Real-time interactive parameters (Mass $M$, Spin $a$) governed entirely by human inputs. | EU AI Act Art. 14 |
