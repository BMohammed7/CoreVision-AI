# CoreVision AI | Advanced Nuclear Control Interface

**CoreVision AI** is a next-generation, cognitive-aware digital control room prototype designed for nuclear power plants. Developed for the **Cognitive Innovation Competition 2026**, this system addresses the critical challenge of operator "alarm fatigue" and cognitive overload during high-stress incidents.

---

## System Overview
The system acts as a digital twin, monitoring the reactor's health in real-time. By combining live telemetry with advanced AI, CoreVision AI ensures that the human-in-the-loop receives exact support when it matters most.

### **Key Features**
* **Live Telemetry Panel:** Displays critical core data such as Pressure, Temperature, and Radiation levels.
* **Cognitive Load Meter:** Monitors the operator's mental burden in real-time based on alarm rates and system phases.
* **Smart HUD:** Automatically activates during high cognitive load (>60%) to simplify the interface and remove visual noise.
* **AI Decision Support (XAI):** Utilizes Explainable AI to provide step-by-step recommendations with a logical "Reasoning Trace" for every action.
* **Root Cause Analysis:** An engine that filters through hundreds of secondary alarms to isolate the actual source of the problem (e.g., Small Break LOCA).

---

## Technical Architecture
This is a full-stack application built with modern industry standards to ensure type-safety and rapid performance.

* **Languages:** TypeScript and React.
* **Styling:** Tailwind CSS with "scanline" overlays for a professional industrial aesthetic.
* **Animations:** Framer Motion for seamless transitions between emergency phases.
* **Simulation Engine:** A custom-built TypeScript physics engine that models reactor pressure, temperature, and radiation cascading effects.

---

## How to Use

### 1. Installation
Ensure you have [Node.js](https://nodejs.org/) installed.
```bash
git clone [https://github.com/BMohammed7/CoreVision-AI.git](https://github.com/BMohammed7/CoreVision-AI.git)
cd CoreVision-AI
npm install
```
### 2. Running Locally
Start the development server:
```bash
npm run dev
```
Open your browser to http://localhost:5173.

### 3. Running the Competition Demo
1. Nominal State: Start by showing the reactor's digital twin in the "Nominal" phase.

2. Start Simulation: Click the " Start Simulation" button in the top right corner.

3. Observation: Watch as pressure drops and alarms trigger. Point out the rising "Cognitive Load" meter.

4. Smart HUD Activation: After the 15-second mark, the system will enter a critical phase. Demonstrate how the AI automatically simplifies the screen and presents an 8-step action plan to stabilize the facility.

---

## Project Structure
* src/lib/simulation.ts: The core engine for simulating reactor states and alarm generation.

* src/components/HUDDashboard.tsx: The primary interface controller managing the "Smart HUD" state.

* src/components/CognitiveLoadMeter.tsx: Calculates and visualizes operator stress levels.

---

Developed by: Burhanuddin Mohammed
Challenge: Cognitive Innovation Competition 2026 - Stream 1
