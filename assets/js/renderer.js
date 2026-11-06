/**
 * Fuzzy Petal Shop - SVG & Canvas Procedural Flower Renderer
 * Clean Architecture: Pure functional vector generation of chenille wire pipe cleaners.
 */

import { FL, COL, CFG } from './config.js';

function rgb(hex) {
  const num = parseInt(hex.slice(1), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function mix(hex, factor, to = 'w') {
  const [r, g, b] = rgb(hex);
  const target = to === 'w' ? 255 : 0;
  const blend = c => Math.round(c + (target - c) * factor);
  return '#' + [blend(r), blend(g), blend(b)]
    .map(val => val.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Procedural 3-layer fuzzy pipe cleaner stroke
 */
export function fuzz(d, colorHex, baseWidth = 8) {
  const darkCore = mix(colorHex, 0.32, 'b');
  const lightHighlight = mix(colorHex, 0.45, 'w');

  return `
    <path d="${d}" fill="none" stroke="${darkCore}" stroke-width="${baseWidth + 2}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${colorHex}" stroke-width="${baseWidth}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${lightHighlight}" stroke-width="${Math.max(2, baseWidth - 2.5)}" stroke-linecap="round" stroke-dasharray="1 3.2" opacity="0.75"/>
  `.trim();
}

/**
 * Generate full SVG string of the customized flower
 */
export function flowerSVG(state, options = {}) {
  const bg = options.bg !== false;
  const uid = options.uid || ('f_' + Math.random().toString(36).slice(2, 7));
  const vb = options.vb || '0 0 480 560';

  const spec = FL[state.flower] || FL.sunflower;
  const N = state.petals;
  const cx = 240;
  const cy = spec.tulip ? 330 : 290;

  // Filter definition for organic tactile chenille fuzziness
  let out = `
    <defs>
      <filter id="fz_${uid}" x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="1" seed="4" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.8" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <linearGradient id="stem_sh_${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.15"/>
      </linearGradient>
    </defs>
  `;

  // Studio background & pedestal surface
  if (bg) {
    const stageBg = spec.bg || '#e9f4fc';
    const softHalo = mix(stageBg, 0.5, 'w');
    out += `
      <rect width="480" height="560" fill="${stageBg}" rx="20"/>
      <circle cx="${cx}" cy="${cy}" r="210" fill="${softHalo}" opacity="0.65"/>
      <!-- Wooden studio table table surface -->
      <rect y="540" width="480" height="20" fill="#c4895a"/>
      <rect y="540" width="480" height="4" fill="#a46f44"/>
      <ellipse cx="${cx}" cy="545" rx="54" ry="7" fill="#2a1f33" opacity="0.2"/>
    `;
  }

  out += `<g filter="url(#fz_${uid})">`;

  // 1. Stem
  const stemColor = COL[state.sc] || COL.green;
  out += fuzz(`M${cx} ${cy} L${cx} 546`, stemColor, 9.5);

  // 2. Foliage / Leaves
  const leafColor = COL[state.lc] || COL.green;
  for (let i = 0; i < state.leaves; i++) {
    const side = i % 2 ? 1 : -1;
    const yPos = spec.tulip ? 520 - i * 32 : 510 - i * 28;

    const leafPath = spec.tulip
      ? `M0 0 C${side * 8} -70 ${side * 36} -130 ${side * 88} -162 C${side * 74} -96 ${side * 42} -34 0 0Z`
      : `M0 0 C${side * 28} -48 ${side * 94} -54 ${side * 98} -14 C${side * 100} 22 ${side * 42} 26 0 0Z`;

    const scale = spec.tulip ? 0.88 : 1.0;
    out += `<g transform="translate(${cx} ${yPos}) scale(${scale})">${fuzz(leafPath, leafColor, 7)}</g>`;
  }

  // 3. Flower Blossom Head
  const petalColor = COL[state.pc] || COL.yellow;

  if (spec.tulip) {
    // Sculpted multi-layered cupped petals
    const ph = [132, 116, 100][(state.lpc || 2) - 1] || 116;
    const pw = [40, 34, 30][(state.lpc || 2) - 1] || 34;
    const spread = Math.min(58, 14 + N * 3.4);

    const angles = Array.from({ length: N }, (_, i) =>
      N === 1 ? 0 : -spread + (2 * spread * i) / (N - 1)
    ).sort((a, b) => Math.abs(b) - Math.abs(a));

    const PetalPath = k =>
      `M0 0 C${-pw * k} ${-ph * k * 0.12} ${-pw * k} ${-ph * k * 0.86} 0 ${-ph * k} C${pw * k} ${-ph * k * 0.86} ${pw * k} ${-ph * k * 0.12} 0 0Z`;

    angles.forEach(ang => {
      out += `
        <g transform="translate(${cx} ${cy}) rotate(${ang.toFixed(1)})">
          <path d="${PetalPath(1)}" fill="${petalColor}" opacity="0.95"/>
          ${fuzz(PetalPath(1), petalColor, 7.5)}
          ${fuzz(PetalPath(0.72), petalColor, 6)}
          ${fuzz(PetalPath(0.44), petalColor, 5)}
        </g>
      `;
    });
  } else {
    // Radial flower (Sunflower, Daisy)
    const centerCleaners = 2 + Math.ceil(Math.max(0, N - 12) / 8);
    const rc = 18 + 8 * centerCleaners; // Center radius

    const fullnessWidth = [1.25, 1.0, 0.8][(state.lpc || 2) - 1] || 1.0;
    const loopLength = [88, 66, 52][(state.lpc || 2) - 1] || 66;

    const r0 = Math.max(rc + 6, (N * 26 * fullnessWidth) / (2 * Math.PI));
    const petalWidth = Math.min((2 * Math.PI * r0) / N * 0.94, 42);
    const outerReach = r0 + loopLength;
    const autoScale = Math.min(1.0, 226 / outerReach);
    const strokeWidth = state.lpc === 3 ? 6 : 7;

    const loopPath = `M0 0 C${-petalWidth * 0.62} ${-loopLength * 0.12} ${-petalWidth * 0.62} ${-loopLength * 0.92} 0 ${-loopLength} C${petalWidth * 0.62} ${-loopLength * 0.92} ${petalWidth * 0.62} ${-loopLength * 0.12} 0 0Z`;

    out += `<g transform="translate(${cx} ${cy}) scale(${autoScale.toFixed(3)}) translate(${-cx} ${-cy})">`;

    // Radial petals
    for (let i = 0; i < N; i++) {
      const angle = (i * 360) / N;
      out += `
        <g transform="rotate(${angle.toFixed(2)} ${cx} ${cy}) translate(${cx} ${(cy - r0).toFixed(1)})">
          ${fuzz(loopPath, petalColor, strokeWidth)}
        </g>
      `;
    }

    // Coiled Pipe Cleaner Center Disc
    const centerColor = COL[state.cc] || COL.brown;
    out += `<circle cx="${cx}" cy="${cy}" r="${rc + 3.5}" fill="${mix(centerColor, 0.28, 'b')}"/>`;

    // Genuine spiral coil path
    const turns = rc / 7;
    const maxTheta = turns * 2 * Math.PI;
    let coilPath = '';
    for (let t = 0; t <= maxTheta; t += 0.24) {
      const r = 3 + ((rc - 3) * t) / maxTheta;
      const x = (cx + r * Math.cos(t)).toFixed(1);
      const y = (cy + r * Math.sin(t)).toFixed(1);
      coilPath += (t === 0 ? 'M' : 'L') + `${x} ${y}`;
    }

    out += fuzz(coilPath, centerColor, 7.5);
    out += `</g>`;
  }

  out += `</g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${spec.name} with ${N} petals">${out}</svg>`;
}

/**
 * Exports a high-resolution 960x1260 PNG card of the customized flower
 */
export function exportFlowerCanvas(state, costSummary) {
  return new Promise((resolve, reject) => {
    try {
      const svgString = flowerSVG(state, { uid: 'exp_' + Date.now(), bg: true });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 960;
        canvas.height = 1260;
        const ctx = canvas.getContext('2d');

        // Crisp warm boutique card background
        ctx.fillStyle = '#fffdf7';
        ctx.fillRect(0, 0, 960, 1260);

        // Frame border
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#2a1f33';
        ctx.strokeRect(20, 20, 920, 1220);

        // Draw rendered flower artwork
        ctx.drawImage(img, 60, 40, 840, 980);

        // Badge & Typography featuring Artistically. Avillia aesthetic
        const spec = FL[state.flower] || FL.sunflower;
        ctx.fillStyle = '#2a1f33';
        ctx.textAlign = 'center';

        // Elegant "Artistically." brand mark at top/bottom
        ctx.font = '700 48px "Avillia", "Playfair Display", "Bodoni Moda", Didot, serif';
        ctx.fillText('Artistically.', 480, 1060);

        ctx.font = '700 32px "Baloo 2", system-ui, sans-serif';
        ctx.fillStyle = '#4a3d56';
        ctx.fillText(`${spec.name} (${spec.banglaName || ''}) · ${state.petals} Petals`, 480, 1106);

        ctx.font = '600 24px "Nunito", system-ui, sans-serif';
        ctx.fillStyle = '#7a6e84';
        const colorBreakdown = costSummary.lines.map(l => `${l.n} ${l.col}`).join(' · ');
        ctx.fillText(colorBreakdown, 480, 1148);

        ctx.font = '800 28px "Baloo 2", system-ui, sans-serif';
        ctx.fillStyle = '#d93a3a';
        ctx.fillText(`Materials: ${costSummary.totalCleaners} Pipe Cleaners · ৳${costSummary.grandTotal}`, 480, 1190);

        ctx.font = '700 18px "Nunito", system-ui, sans-serif';
        ctx.fillStyle = '#9b8fa5';
        ctx.fillText(`@artis_tically22 — Handcrafted in Rajshahi`, 480, 1222);

        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = err => {
        URL.revokeObjectURL(url);
        reject(err);
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Programmatic Automated Canvas Snapshot Capture Utility
 * Exposes a clean API for background jobs, testing harnesses, and automation workers.
 */
export async function exportCurrentWorkbenchSnapshot(state, costSummary, options = {}) {
  const dataUrl = await exportFlowerCanvas(state, costSummary);
  const metadata = {
    flower: state.flower,
    petals: state.petals,
    lpc: state.lpc,
    colors: costSummary.lines.map(l => ({ color: l.col, count: l.n })),
    totalCleaners: costSummary.totalCleaners,
    totalPrice: costSummary.grandTotal,
    timestamp: new Date().toISOString(),
    instagramTarget: CFG.instagramUrl,
    exportedBy: 'Artistically. Workbench Engine'
  };

  return {
    dataUrl,
    metadata,
    mimeType: 'image/png'
  };
}

