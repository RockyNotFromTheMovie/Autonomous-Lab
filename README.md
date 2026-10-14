***This project is not yet optimized to be viewed on a mobile phone. It is best viewed on a desktop computer for this moment.***

# Autonomous Energy Materials Lab

Autonomous materials discovery protocol with high-throughput nanoparticle synthesis and characterization simulation. Rewritten as a modern React SPA using TypeScript, Vite, and Tailwind CSS.

## Features

- **Elements Database & PubChem CSV Parser**:
  - Live CSV upload and parsing (`PubChemElements_all.csv`) via PapaParse.
  - Preloaded standard Periodic Table elements reference library (118 elements) for instant exploration without needing an external file.
  - Real-time search across element symbols, names, and periodic blocks.
  - Multi-element selection rules (2 to 5 elements required for alloy formulation).

- **Autonomous AI Workflow**:
  - Proposes novel alloy stoichiometry, synthesis parameters, and characterization plans based on selected elemental constituents.
  - Step-by-step nanoparticle aerosol jet printing parameters and thermal annealing envelope.
  - Micro-XRF (X-ray fluorescence) compositional mapping and Field-Emission SEM (Scanning Electron Microscopy) inspection plans.

- **Hardware Simulation & Telemetry**:
  - Multi-stage physical hardware simulator (Synthesizing → Characterizing → Analyzing).
  - Dynamic ambient laboratory glow effects reacting to simulation stages.
  - Realistic outcome assessment (`Success`, `Partial Success`, `Failure`) with confetti celebration for successful runs.
  - Interactive terminal-style system logs with auto-scrolling and category color coding (`info`, `llm`, `hardware`, `success`, `error`).

- **Database & Experiment Results**:
  - Persistent experiment history storage in local storage with instant synchronization.
  - Search, filter by outcome, and modal inspector for reviewing past recipes and plans.
  - Export experiment history to structured JSON format.

## Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React + FontAwesome
- **CSV Engine**: PapaParse
- **Visuals**: Canvas Confetti

## Getting Started

1. Clone or open the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
