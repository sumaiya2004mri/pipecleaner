/**
 * Fuzzy Petal Shop - Reactive State Controller & Local Storage Engine
 * Clean Architecture: Predictable single-source-of-truth state container with pub/sub.
 */

import { CFG, FL, COL } from './config.js';

const STORAGE_KEYS = {
  CHECKOUT: 'fp_checkout_details',
  MUTED: 'fp-muted',
  RECENT_FLOWER: 'fp_recent_flower'
};

class StateStore {
  constructor() {
    this.listeners = new Set();
    this.cameFrom = 'doors'; // Tracks back button navigation
    this.currentScreen = 'door';
    this.activeTab = 'petals';
    this.pendingDoorFlower = 'sunflower';

    // Flower state default
    this.flower = this.getDefaultFlowerState('sunflower');

    // Customer checkout state
    this.checkout = {
      name: '',
      phone: '',
      city: CFG.defaultCity,
      area: '',
      addr: ''
    };

    this.loadPersistedCheckout();
  }

  getDefaultFlowerState(flowerKey = 'sunflower') {
    const spec = FL[flowerKey] || FL.sunflower;
    return {
      flower: spec.id,
      petals: spec.petals,
      lpc: 2, // 2 petals per cleaner
      pc: spec.pc,
      pc2: spec.pc2 || 'white',
      petalMode: spec.petalMode || 'single', // 'single', 'alternate', 'duo_layer'
      cc: spec.cc,
      leaves: 2,
      lc: 'green',
      sc: 'green'
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(changeType = 'all') {
    this.listeners.forEach(fn => fn(this, changeType));
  }

  setScreen(screenId) {
    this.currentScreen = screenId;
    this.notify('screen');
  }

  setFlower(stateUpdates) {
    this.flower = {
      ...this.flower,
      ...stateUpdates
    };

    // Keep petals within valid range
    const spec = FL[this.flower.flower] || FL.sunflower;
    if (this.flower.petals < (spec.minPetals || 4)) {
      this.flower.petals = spec.minPetals || 4;
    }
    if (this.flower.petals > (spec.maxPetals || 36)) {
      this.flower.petals = spec.maxPetals || 36;
    }

    this.persistFlowerState();
    this.notify('flower');
  }

  selectFlowerType(flowerKey, lpc = 2) {
    const def = this.getDefaultFlowerState(flowerKey);
    def.lpc = lpc;
    this.flower = def;
    this.persistFlowerState();
    this.notify('flower');
  }

  setCheckoutField(field, value) {
    if (this.checkout[field] !== value) {
      this.checkout[field] = value;
      this.persistCheckout();
      this.notify('checkout');
    }
  }

  loadPersistedCheckout() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHECKOUT);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.checkout = {
          name: parsed.name || '',
          phone: parsed.phone || '',
          city: parsed.city || CFG.defaultCity,
          area: parsed.area || '',
          addr: parsed.addr || ''
        };
      }
    } catch {
      // Fallback gracefully on storage issues
    }
  }

  persistCheckout() {
    try {
      localStorage.setItem(STORAGE_KEYS.CHECKOUT, JSON.stringify(this.checkout));
    } catch {}
  }

  persistFlowerState() {
    try {
      localStorage.setItem(STORAGE_KEYS.RECENT_FLOWER, JSON.stringify(this.flower));
    } catch {}
  }

  /**
   * Real-time pricing calculations based on pipe-cleaner materials
   */
  calculateCost() {
    const s = this.flower;
    const spec = FL[s.flower] || FL.sunflower;
    const parts = [];

    // 1. Petals pipe cleaner count (supports Multi-Color Petal Matrix)
    const petalCleaners = Math.ceil(s.petals / s.lpc);
    if (!s.petalMode || s.petalMode === 'single' || s.pc === s.pc2) {
      parts.push([s.pc, petalCleaners]);
    } else {
      const primaryCount = Math.ceil(petalCleaners / 2);
      const secondaryCount = Math.floor(petalCleaners / 2);
      parts.push([s.pc, primaryCount]);
      if (secondaryCount > 0) {
        parts.push([s.pc2, secondaryCount]);
      }
    }

    // 2. Center coil pipe cleaners (if flower has a center)
    if (spec.centre) {
      const centerCleaners = 2 + Math.ceil(Math.max(0, s.petals - 12) / 8);
      parts.push([s.cc, centerCleaners]);
    }

    // 3. Stem pipe cleaner
    parts.push([s.sc, 1]);

    // 4. Leaves pipe cleaners (1 cleaner yields 2 leaves)
    if (s.leaves > 0) {
      const leafCleaners = Math.ceil(s.leaves / 2);
      parts.push([s.lc, leafCleaners]);
    }

    // Group count by color
    const colorMap = new Map();
    parts.forEach(([color, count]) => {
      colorMap.set(color, (colorMap.get(color) || 0) + count);
    });

    const lines = Array.from(colorMap.entries()).map(([col, n]) => ({
      col,
      n,
      cost: n * CFG.pricePerCleaner
    }));

    const totalCleaners = lines.reduce((acc, line) => acc + line.n, 0);
    const subtotal = totalCleaners * CFG.pricePerCleaner;
    const isRajshahi = this.checkout.city === 'rajshahi';
    const delivery = isRajshahi ? CFG.deliveryFee : 0;
    const grandTotal = subtotal + CFG.platformFee + delivery;

    return {
      lines,
      totalCleaners,
      subtotal,
      platformFee: CFG.platformFee,
      deliveryFee: delivery,
      grandTotal,
      isRajshahi
    };
  }

  /**
   * Generates a unique shareable URL hash representing the flower recipe
   * Format: #d-{flower}-{petals}-{lpc}-{pc}-{pc2}-{petalMode}-{cc}-{leaves}-{lc}-{sc}
   */
  getShareableHash() {
    const s = this.flower;
    return `#d-${[
      s.flower,
      s.petals,
      s.lpc,
      s.pc,
      s.pc2 || s.pc,
      s.petalMode || 'single',
      s.cc,
      s.leaves,
      s.lc,
      s.sc
    ].join('-')}`;
  }

  /**
   * Parses recipe from window.location.hash
   * Supports both 10-part multi-color recipes and legacy 8-part hashes
   */
  loadFromHash(hash = window.location.hash) {
    // 10-part hash: flower, petals, lpc, pc, pc2, petalMode, cc, leaves, lc, sc
    const m10 = /^#d-([a-z_]+)-(\d+)-([123])-([a-z]+)-([a-z]+)-([a-z_]+)-([a-z]+)-(\d+)-([a-z]+)-([a-z]+)$/.exec(hash);
    if (m10) {
      const [, flowerKey, petals, lpc, pc, pc2, petalMode, cc, leaves, lc, sc] = m10;
      if (FL[flowerKey] && COL[pc] && COL[pc2] && COL[cc] && COL[lc] && COL[sc]) {
        const spec = FL[flowerKey];
        this.flower = {
          flower: flowerKey,
          petals: Math.min(spec.maxPetals, Math.max(spec.minPetals || 4, parseInt(petals, 10))),
          lpc: parseInt(lpc, 10),
          pc,
          pc2,
          petalMode,
          cc,
          leaves: Math.min(8, Math.max(0, parseInt(leaves, 10))),
          lc,
          sc
        };
        this.notify('flower');
        return true;
      }
    }

    // Legacy 8-part hash
    const m8 = /^#d-([a-z_]+)-(\d+)-([123])-([a-z]+)-([a-z]+)-(\d+)-([a-z]+)-([a-z]+)$/.exec(hash);
    if (m8) {
      const [, flowerKey, petals, lpc, pc, cc, leaves, lc, sc] = m8;
      if (FL[flowerKey] && COL[pc] && COL[cc] && COL[lc] && COL[sc]) {
        const spec = FL[flowerKey];
        this.flower = {
          flower: flowerKey,
          petals: Math.min(spec.maxPetals, Math.max(spec.minPetals || 4, parseInt(petals, 10))),
          lpc: parseInt(lpc, 10),
          pc,
          pc2: pc,
          petalMode: 'single',
          cc,
          leaves: Math.min(8, Math.max(0, parseInt(leaves, 10))),
          lc,
          sc
        };
        this.notify('flower');
        return true;
      }
    }

    return false;
  }

  /**
   * Automated Canvas Capture Utility
   * Programmatically renders and returns an image snapshot of the custom workbench layout.
   */
  async captureSnapshot(options = {}) {
    const { exportCurrentWorkbenchSnapshot } = await import('./renderer.js');
    const cost = this.calculateCost();
    const snapshot = await exportCurrentWorkbenchSnapshot(this.flower, cost, options);
    return snapshot;
  }
}

export const store = new StateStore();

