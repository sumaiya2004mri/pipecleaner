# 🌸 Fuzzy Petal Shop (পাইপ ক্লিনার ফ্লাওয়ার শপ)

> Interactive Single Page Application (SPA) & Custom Flower Building Workbench for handcrafted chenille pipe cleaner flowers in Rajshahi, Bangladesh.

[![Live Workbench](https://img.shields.io/badge/Workbench-Interactive_SPA-f7cf2a?style=for-the-badge)](https://sumaiya2004mri.github.io/pipecleaner/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 🎨 Overview & Core Features

**Fuzzy Petal Shop** is a boutique digital flower workshop that blends cozy tactile illustration with a procedural chenille vector rendering engine.

### ✨ Key Capabilities
1. **Interactive Boutique Entrance & Welcome Screen**:
   - Animated hand-drawn shop front with an interactive arched wooden door ("tap the door ↑").
   - Perspective zoom opening animation accompanied by an authentic acoustic door chime.
   - Interior shop with waving shopkeeper, pipe cleaner jars, and dual pathways: **Ready Kits** or **Build My Own**.
   - Touch swipe and keyboard arrow gesture navigation.

2. **Artisan Flower Doors & Varieties**:
   - **Sunflower (সূর্যমুখী)**: Classic golden radiating loops with textured center coil spiral.
   - **Daisy (ডেইজি)**: Fresh meadow petals around a bright yellow core.
   - **Tulip (টিউলিপ)**: Elegantly cupped 3D overlapping petals with slender upright stem.
   - **Lavender Sprig (ল্যাভেন্ডার)**: Calming purple clusters on a tall stalk.
   - Interactive fullness selector modal (*Big & Bold* 1-to-1, *Classic* 2-to-1, *Extra Full* 3-to-1).

3. **Custom Flower Building Workbench**:
   - **Procedural Fuzzy Texture Engine**: Multi-pass layered SVG strokes combined with `feTurbulence` and `feDisplacementMap` filters to faithfully simulate real pipe cleaner fuzz and wire coils.
   - **Petal Customizer**: Real-time slider and counter for petal counts.
   - **Color Palette Drops**: 10 curated chenille wire colors (Yellow, Pink, Red, Blue, Lavender, White, Green, Brown, Orange, Black).
   - **Foliage & Stem Controls**: Stepper controls for leaf count, leaf color swatches, and stem wrapping.
   - **Live Material & Price Estimator**: Instant pipe cleaner count tally and cost breakdown (৳2 per pipe cleaner, ৳10 platform fee).

4. **Checkout Form Panel & Local Storage Engine**:
   - Form fields: Customer Name, Phone (with BD format validation `/^(\+?88)?01[3-9]\d{8}$/`), Delivery City, Area, and Full Street Address.
   - **Regional Delivery Boundary**: Defaulted to Rajshahi (৳50 flat delivery). Dynamic warning banner for unsupported regions with automatic submission protection.
   - **Silent Local Storage Persistence**: Form values persist on the user's device across visits for frictionless return ordering.
   - **Social Order Dispatch**:
     - **Instagram Direct**: Pre-formatted order summary with itemized colors, pricing, and deep link to Instagram DM.
     - **Email Routing**: Prefilled `mailto:` trigger with custom order ID and recipe links.
     - **Recipe Hash Linking**: Bookmarkable, shareable URLs (`#d-sunflower-14-2-yellow-brown-2-green-green`) that instantly restore custom flower configurations.
     - **High-Resolution Card Exporter**: Generates a 960×1260 PNG card on HTML5 Canvas ready to download or share.

5. **Ready Kits Showcase**:
   - Curated ready-to-order floral kits with pipe cleaner material chips and pricing.
   - "Buy this kit" for fast checkout or "Customize on workbench" for instant tailoring.

---

## 🏗️ Architecture & Clean Code Structure

Built according to modern clean frontend architecture principles:

```
pipecleaner/
├── index.html                 # Semantic HTML5 SPA layout, Tailwind CDN, accessible ARIA roles
├── assets/
│   ├── css/
│   │   └── styles.css         # Tactile design tokens, sticker buttons, animations, dark mode
│   ├── js/
│   │   ├── config.js          # Centralized immutable configuration, pricing rules, flower definitions
│   │   ├── audio.js           # Web Audio API procedural sound engine (chimes, pops, mute toggle)
│   │   ├── state.js           # Single-source-of-truth reactive state controller & LocalStorage engine
│   │   ├── renderer.js        # Pure vector SVG chenille generator & Canvas 960x1260 exporter
│   │   └── app.js             # View router, DOM bindings, form validation & checkout coordinator
│   └── img/                   # Supporting vector assets
└── README.md                  # Project documentation & usage manual
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
