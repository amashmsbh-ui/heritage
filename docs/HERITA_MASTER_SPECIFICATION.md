# HERITA — System Architecture & Complete Master Specification
**Smart India Hackathon (SIH 2026) | Living Cultural Preservation Platform**

---

## 1. Executive Summary & Problem Statement

Traditional heritage platforms suffer from three systemic flaws:
1. **Passive "Wikipedia-Style" Stagnation**: Static encyclopedia entries that inform without engaging.
2. **Disconnected Tourism**: Generic travel itineraries prioritizing commercial monuments over living local traditions.
3. **Open-Loop Archiving**: Heritage is documented once, then forgotten, without any mechanism to revitalize practitioner communities or prevent endangerment.

**Herita** resolves these flaws by introducing a **closed-loop cultural preservation ecosystem** anchored around three core actions:

$$\mathbf{DISCOVER} \longrightarrow \mathbf{EXPERIENCE} \longrightarrow \mathbf{PRESERVE}$$

---

## 2. Core Triad & Feature Mapping

### 🧭 Pillar 1: DISCOVER
- **Cultural Radius**: Dynamic geospatial query engine ($1\text{ km}$, $5\text{ km}$, $10\text{ km}$, $25\text{ km}$, and City-wide) that surfaces living culture within walking or transit distance.
- **Categories**:
  - 🎵 **Music**: Folk traditions, rare instruments, gharanas, living performers.
  - 📚 **Literature**: Spatial literature map connecting poets to streets, libraries, and oral traditions.
  - 🏛️ **History**: Interactive century timeline (1500 $\to$ 2000 $\to$ Today).
  - 👥 **Keepers**: Verified profiles of craftspeople, storytellers, historians, and folk artists.
  - 🎨 **Arts & Crafts**: Endangered artisanal traditions.
  - 🎮 **Traditional Games**: Regional games, rules, cultural origin, and matchmaking.
  - 🍴 **Food Heritage**: Ancestral recipes and historic culinary lanes.

### 🗺️ Pillar 2: EXPERIENCE
- **AI Cultural Trip Planner**: Input budget (₹), duration (6h, 1d, 2d), transport mode (Walking, Rickshaw, Car), and cultural interests.
- **"Why You Should Visit" Context**: Every stop details historical context, community significance, and nearby living masters.
- **Experience Mode**: In-transit live audio guide that detects proximity to historical landmarks and streams oral narratives.
- **Cultural Guide Marketplace**: Connects travelers with verified local human keepers and storytellers.

### 🚨 Pillar 3: PRESERVE
- **Heritage at Risk Submission**: Conversational AI interview tool that collects structured records of disappearing traditions.
- **AI Verification Pipeline**:
  1. Multimodal feature extraction (identifies dialect, era, technique).
  2. Vector duplicate screening against national archives (IGNCA, ASI).
  3. Source cross-referencing.
  4. Regional moderator validation.
- **Cultural Survival Score (CSS)**: Quantifiable, multi-indicator metric tracking the vitality of vulnerable traditions.
- **Heritage Passport & Gamification**: Rewards verified cultural preservation with XP, badges, and civic honors.

---

## 3. Mathematical Formulation of the Cultural Survival Score (CSS)

The Cultural Survival Score ($CSS \in [0, 100]$) is computed using a weighted composite index:

$$CSS = \sum_{i=1}^{6} w_i \cdot I_i$$

### Indicator Weights & Definitions:
1. $I_1$ (**Active Practitioner Density**, $w_1 = 0.25$): Ratio of certified active practitioners to regional population.
2. $I_2$ (**Age Demographics Index**, $w_2 = 0.20$): 
   $$I_2 = \max\left(0, 1 - \frac{\text{Median Practitioner Age} - 18}{80}\right)$$
3. $I_3$ (**Youth Transmission Rate**, $w_3 = 0.20$): Active apprentices registered and documented within the preceding 12 months.
4. $I_4$ (**Performance & Practice Frequency**, $w_4 = 0.15$): Documented exhibitions, rituals, or public performances in the last 180 days.
5. $I_5$ (**Documentation Coverage**, $w_5 = 0.10$): Completeness of audiovisual archives, written notation, and oral genealogies.
6. $I_6$ (**Economic Sustainability Index**, $w_6 = 0.10$): Average monthly artisan income generated through workshops, tours, and patron support.

### Classification Tiers:
- **80 – 100**: Thriving (Green)
- **60 – 79**: Stable (Blue)
- **40 – 59**: Vulnerable (Yellow)
- **20 – 39**: At Risk (Orange)
- **0 – 19**: Critical (Red)

---

## 4. Verification & Moderation Pipeline

1. **Submission Phase**: User uploads photos, audio recordings, or oral descriptions.
2. **AI Pre-Processing**:
   - Audio is transcribed and tagged for dialect.
   - Text is structured into standardized cultural taxonomies.
   - Embedding generation checks for existing duplicates in the vector database.
3. **Scholar / Regional Moderator Review**:
   - Assigned to local academic experts or authenticated master practitioners.
   - Moderator verifies citations or requests community corroboration.
4. **Knowledge Graph Integration**:
   - Approved submission enters Herita Knowledge Base.
   - Community contributor receives +25 to +50 Heritage XP.
   - Recalculates the tradition's Cultural Survival Score.

---

## 5. Security & Product Rules

1. **Non-blocking Geolocation**: Users can browse any city without granting location permissions.
2. **Hard Constraint Trip Planning**: AI recommendations never exceed user budget or allotted time.
3. **Attribution Transparency**: Every cultural data point cites its primary source (Museum, Archive, Scholar, or Community Contributor).
4. **Separation of Upvotes and Veracity**: Popularity drives homepage spotlight; verified scholarship drives factual acceptance.
