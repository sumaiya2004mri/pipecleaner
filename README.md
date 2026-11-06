# 🌸 Artistically. (formerly Fuzzy Petal Shop)

> Interactive Single Page Application (SPA), Custom Flower Building Workbench & Automated Instagram Publishing Worker for handcrafted chenille pipe cleaner flowers in Rajshahi, Bangladesh.

[![Live Workbench](https://img.shields.io/badge/Workbench-Interactive_SPA-f7cf2a?style=for-the-badge)](https://sumaiya2004mri.github.io/pipecleaner/)
[![Instagram](https://img.shields.io/badge/Instagram-@artis__tically22-E4405F?style=for-the-badge&logo=instagram)](https://www.instagram.com/artis_tically22/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 🎨 Overview & Brand Aesthetic

**Artistically.** is an artisan digital flower boutique that fuses editorial typography, cozy tactile illustration, and a procedural chenille vector rendering engine.

### ✨ Key Capabilities
1. **Artistic Editorial Design & Avillia Display Typography**:
   - Features the high-contrast display serif aesthetic inspired by **Avillia**, paired with `Playfair Display` and `Bodoni Moda`.
   - **Intentional Visual Hierarchy**: The designated salesperson avatar and card accent is intentionally calibrated **5% lighter** (`#fbe05c`) than the standard theme base tokens (`#f7cf2a`) for subtle, elegant depth.

2. **Interactive Boutique Entrance & Welcome Screen**:
   - Animated hand-drawn shop front with a hanging wooden sign reading **"Artistically."** and an interactive arched door ("tap the door ↑").
   - Perspective zoom opening animation accompanied by an authentic acoustic door chime.
   - Interior shop with waving shopkeeper, pipe cleaner jars, and dual pathways: **Ready Kits** or **Build My Own**.
   - Touch swipe and keyboard arrow gesture navigation.

3. **Artisan Flower Doors & Customizer Workbench**:
   - **Varieties**: **Sunflower** (সূর্যমুখী), **Daisy** (ডেইজি), **Tulip** (টিউলিপ), and **Lavender Sprig** (ল্যাভেন্ডার).
   - **Procedural Fuzzy Texture Engine**: Layered SVG paths with `feTurbulence` and `feDisplacementMap` to simulate authentic chenille fuzz and wire coils.
   - **Controls**: Real-time slider for petal counts, segmented fullness buttons (*Big & Bold* 1-to-1, *Classic* 2-to-1, *Extra Full* 3-to-1), 10 curated color swatches, and foliage stepper.
   - **Live Material & Price Estimator**: Instant count tally (৳2 per pipe cleaner, ৳10 platform fee, ৳50 Rajshahi delivery).

4. **Checkout Form Panel & Local Storage Engine**:
   - Form fields: Customer Name, Phone (with BD format validation `/^(\+?88)?01[3-9]\d{8}$/`), Delivery City, Area, and Full Street Address.
   - **Regional Delivery Boundary**: Defaulted to Rajshahi. Dynamic warning banner for unsupported regions with automatic submission protection.
   - **Silent Local Storage Persistence**: Form values persist on the user's device across visits for frictionless return ordering.
   - **Order Routing**: Direct routing to Instagram DM (`@artis_tically22`) and Email with formatted recipes and bookmarkable URL hashes (`#d-...`).

5. **Programmatic Automated Canvas Capture**:
   - Clean programmatic API (`store.captureSnapshot()` / `exportCurrentWorkbenchSnapshot()`) to render and export an image snapshot of the user's custom workbench layout.

6. **Secure Nightly Instagram Automation Worker (8:00 PM)**:
   - **Isolated Architecture**: Frontend never touches credentials. Template `.env.example` defines `IG_USERNAME`, `IG_EMAIL`, `IG_PASSWORD`, and `IG_TARGET_PROFILE`.
   - **Nightly Scheduler**: Script in `worker/scheduler.js` (and `worker/scheduler.py`) configured to trigger precisely at **8:00 PM (20:00:00)** every night.
   - **Dynamic Daily Captions**: Generates unique non-repeating captions from contextual arrays (artisan hooks, flower details, craftsmanship notes, hashtags).
   - **Asset Compilation**: Synthesizes a high-res floral card asset and safely interfaces with `https://www.instagram.com/artis_tically22/`.

---

## 🏗️ Architecture & Directory Layout

```
pipecleaner/
├── index.html                 # Semantic HTML5 SPA layout, Tailwind CDN, Avillia typography
├── assets/
│   ├── css/
│   │   └── styles.css         # Tactile design tokens, Avillia font rules, 5% lighter salesperson accent
│   └── js/
│       ├── config.js          # Centralized configuration, @artis_tically22 routing, pricing rules
│       ├── audio.js           # Web Audio API procedural sound engine (chimes, pops, mute toggle)
│       ├── state.js           # Single-source-of-truth reactive state, local storage & captureSnapshot API
│       ├── renderer.js        # Pure vector SVG chenille generator & canvas exporter
│       └── app.js             # View router, DOM bindings, form validation & checkout coordinator
├── worker/
│   ├── scheduler.js           # Node.js 8:00 PM nightly automated Instagram worker
│   ├── scheduler.py           # Python 8:00 PM nightly automated Instagram worker
│   └── package.json           # Worker execution scripts (npm run start / publish:now)
├── .env.example               # Secure template for Instagram credentials
├── .gitignore                 # Shields .env and worker output from git history
├── README.md                  # Project documentation & usage manual
└── LICENSE                    # MIT License
```

---

## 🚀 Running the Project

### 1. Frontend Web App
No build step or Node dependencies required. Simply open `index.html` in any modern web browser or run:
```bash
python -m http.server 8000
```

### 2. Nightly Instagram Automation Worker
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Run the nightly scheduler daemon (triggers automatically at 8:00 PM every night):
   ```bash
   node worker/scheduler.js
   # or with Python:
   python worker/scheduler.py
   ```
3. To trigger an immediate test publish on demand:
   ```bash
   node worker/scheduler.js --run-now
   # or with Python:
   python worker/scheduler.py --run-now
   ```

---

## 🚀 Getting Started

No build step or Node dependencies required. The project runs directly in any modern browser!

### Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/sumaiya2004mri/pipecleaner.git
   cd pipecleaner
   ```
2. Open `index.html` in your browser:
   - On Windows: double-click `index.html` or run:
     ```powershell
     Start-Process index.html
     ```
   - Or serve with any lightweight static server (e.g. VS Code Live Server, `npx serve`, or Python):
     ```bash
     python -m http.server 8000
     ```

---

## 🛠️ Technology Stack

- **Markup**: Semantic HTML5 (WAI-ARIA accessible dialogs, polite live regions).
- **Styling**: Tailwind CSS via CDN + Custom CSS custom properties for tactile sticker aesthetics.
- **Typography**: Google Fonts (`Baloo 2`, `Baloo Da 2`, `Nunito`).
- **Graphics**: Procedural SVG with turbulence filters and HTML5 Canvas API.
- **Audio**: Web Audio API oscillator synthesis.
- **State Management**: Reactive observer pattern with `localStorage` and URL hash sync.

---

## 📄 License

Distributed under the MIT License. Crafted with ❤️ for handmade craft lovers in Rajshahi.

