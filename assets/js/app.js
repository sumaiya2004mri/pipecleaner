/**
 * Fuzzy Petal Shop - Main Application Coordinator
 * Clean Code Architecture: Modular event management, reactive view sync & checkout integration.
 */

import { CFG, FL, COL, COLNAMES, FULL, PARTS, KITS } from './config.js';
import { store } from './state.js';
import { audio } from './audio.js';
import { flowerSVG, exportFlowerCanvas } from './renderer.js';

// DOM utility helpers
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));
const formatTk = num => `৳${num}`;
const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

class AppController {
  constructor() {
    this.initElements();
    this.bindEvents();
    this.initShelfJars();
    this.syncFromState();
  }

  initElements() {
    // Screens
    this.screens = $$('.screen');

    // Audio & Header
    this.soundBtn = $('#soundBtn');

    // Door Scene
    this.doorScene = $('#doorScene');
    this.doorBtn = $('#doorBtn');

    // Interior Shop
    this.shopScene = $('#shopScene');
    this.goBuildBtn = $('#goBuild');
    this.goKitsBtn = $('#goKits');

    // Doors & Fullness Modal
    this.doorList = $('#doorList');
    this.fullDlg = $('#fullDlg');
    this.fullOpts = $('#fullOpts');
    this.fullCancel = $('#fullCancel');

    // Workbench
    this.stage = $('#stage');
    this.priceTag = $('#tag');
    this.buildTitle = $('#buildTitle');
    this.buildBack = $('#buildBack');
    this.tabs = $('#tabs');
    this.petalRange = $('#petalRange');
    this.petalVal = $('#petalVal');
    this.fullSeg = $('#fullSeg');
    this.leafMinus = $('#leafMinus');
    this.leafPlus = $('#leafPlus');
    this.leafVal = $('#leafVal');
    this.doneBtn = $('#doneBtn');

    // Checkout
    this.checkBack = $('#checkBack');
    this.miniFlower = $('#miniFlower');
    this.billName = $('#billName');
    this.billTable = $('#bill');
    this.savePicBtn = $('#savePic');
    this.orderForm = $('#orderForm');
    this.citySelect = $('#f-city');
    this.regionNote = $('#regionNote');
    this.formErr = $('#formErr');
    this.orderIG = $('#orderIG');
    this.orderMail = $('#orderMail');

    // Overlays & Toasts
    this.orderDlg = $('#orderDlg');
    this.orderTitle = $('#orderTitle');
    this.orderHelp = $('#orderHelp');
    this.orderText = $('#orderText');
    this.copyMsg = $('#copyMsg');
    this.copyBtn = $('#copyBtn');
    this.openLink = $('#openLink');
    this.mailBox = $('#mailBox');
    this.mailAddr = $('#mailAddr');
    this.orderClose = $('#orderClose');

    this.picDlg = $('#picDlg');
    this.picImg = $('#picImg');
    this.picClose = $('#picClose');
    this.toastEl = $('#toast');

    // Kits List
    this.kitList = $('#kitList');
  }

  bindEvents() {
    // State subscription
    store.subscribe((state, changeType) => {
      if (changeType === 'screen') {
        this.renderScreen(state.currentScreen);
      } else if (changeType === 'flower') {
        this.renderWorkbench();
        this.renderBill();
      } else if (changeType === 'checkout') {
        this.syncCheckoutForm();
        this.renderBill();
      }
    });

    // Sound toggle
    this.soundBtn.addEventListener('click', () => {
      const isMuted = audio.toggleMute();
      this.soundBtn.textContent = isMuted ? '🔕' : '🔔';
      this.soundBtn.setAttribute('aria-label', isMuted ? 'Turn sound on' : 'Turn sound off');
      this.showToast(isMuted ? 'Sound turned off' : 'Sound turned on');
    });

    // Door Open Event
    const handleDoorOpen = () => {
      if (this.doorScene.classList.contains('open')) return;
      this.doorScene.classList.add('open');
      audio.bell();
      setTimeout(() => {
        store.setScreen('shop');
        this.doorScene.classList.remove('open');
      }, 950);
    };

    this.doorBtn.addEventListener('click', handleDoorOpen);
    this.doorBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleDoorOpen();
      }
    });

    // Interior Greeting Navigation
    this.goBuildBtn.addEventListener('click', () => {
      audio.pop();
      this.renderFlowerDoors();
      store.setScreen('doors');
    });

    this.goKitsBtn.addEventListener('click', () => {
      audio.pop();
      this.renderKitsList();
      store.setScreen('kits');
    });

    // Swipe & Arrow gesture navigation in Shop
    this.bindShopGestures();

    // Generic Back Buttons
    document.addEventListener('click', e => {
      const backBtn = e.target.closest('[data-go]');
      if (backBtn) {
        audio.pop();
        store.setScreen(backBtn.dataset.go);
      }
    });

    // Door selection clicks
    this.doorList.addEventListener('click', e => {
      const card = e.target.closest('[data-flower]');
      if (!card) return;
      audio.pop();
      store.pendingDoorFlower = card.dataset.flower;
      this.openFullnessModal();
    });

    // Fullness Modal choices
    this.fullOpts.addEventListener('click', e => {
      const opt = e.target.closest('[data-lpc]');
      if (!opt) return;
      const lpc = parseInt(opt.dataset.lpc, 10);
      store.selectFlowerType(store.pendingDoorFlower, lpc);
      this.fullDlg.hidden = true;
      store.cameFrom = 'doors';
      store.setScreen('build');
      audio.pop(620);
    });

    this.fullCancel.addEventListener('click', () => {
      this.fullDlg.hidden = true;
    });

    // Workbench Tabs
    this.tabs.addEventListener('click', e => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      audio.pop();
      store.activeTab = tab.dataset.part;
      this.switchWorkbenchTab();
    });

    // Workbench Slider
    this.petalRange.addEventListener('input', e => {
      store.setFlower({ petals: parseInt(e.target.value, 10) });
      audio.tick();
    });

    // Workbench Fullness segment buttons
    this.fullSeg.addEventListener('click', e => {
      const btn = e.target.closest('[data-lpc]');
      if (!btn) return;
      store.setFlower({ lpc: parseInt(btn.dataset.lpc, 10) });
      audio.pop();
    });

    // Swatches selection (petals, center, leaves, stem)
    $$('.swatches').forEach(container => {
      container.addEventListener('click', e => {
        const sw = e.target.closest('.sw');
        if (!sw) return;
        const part = container.dataset.part;
        const color = sw.dataset.c;
        store.setFlower({ [part]: color });
        audio.pop(580);
      });
    });

    // Leaf Stepper
    this.leafMinus.addEventListener('click', () => {
      if (store.flower.leaves > 0) {
        store.setFlower({ leaves: store.flower.leaves - 1 });
        audio.pop(480);
      }
    });

    this.leafPlus.addEventListener('click', () => {
      if (store.flower.leaves < 8) {
        store.setFlower({ leaves: store.flower.leaves + 1 });
        audio.pop(640);
      }
    });

    // Build done -> Checkout
    this.doneBtn.addEventListener('click', () => {
      store.cameFrom = 'build';
      audio.bell();
      store.setScreen('checkout');
    });

    this.buildBack.addEventListener('click', () => {
      audio.pop();
      if (store.cameFrom === 'kits') {
        this.renderKitsList();
        store.setScreen('kits');
      } else {
        this.renderFlowerDoors();
        store.setScreen('doors');
      }
    });

    this.checkBack.addEventListener('click', () => {
      audio.pop();
      if (store.cameFrom === 'kits') {
        store.setScreen('kits');
      } else {
        store.setScreen('build');
      }
    });

    // Checkout Form live persistence
    ['name', 'phone', 'city', 'area', 'addr'].forEach(field => {
      const input = $(`#f-${field}`);
      if (input) {
        input.addEventListener('input', e => {
          store.setCheckoutField(field, e.target.value);
        });
        input.addEventListener('change', e => {
          store.setCheckoutField(field, e.target.value);
        });
      }
    });

    this.citySelect.addEventListener('change', () => {
      this.renderBill();
    });

    // Order actions
    this.orderIG.addEventListener('click', () => this.handleOrderSubmission('ig'));
    this.orderMail.addEventListener('click', () => this.handleOrderSubmission('mail'));

    this.copyBtn.addEventListener('click', () => {
      this.copyOrderText();
    });

    this.orderClose.addEventListener('click', () => {
      this.orderDlg.hidden = true;
    });

    // Export flower picture
    this.savePicBtn.addEventListener('click', () => this.handleSavePicture());
    this.picClose.addEventListener('click', () => {
      this.picDlg.hidden = true;
    });

    // Ready Kits actions
    this.kitList.addEventListener('click', e => {
      const buyBtn = e.target.closest('[data-do="buy"]');
      const editBtn = e.target.closest('[data-do="edit"]');
      const kitCard = e.target.closest('[data-kit]');
      if (!kitCard) return;

      const kitId = kitCard.dataset.kit;
      const kitData = KITS.find(k => k.id === kitId);
      if (!kitData) return;

      audio.pop();

      // Load kit state into store
      store.setFlower({
        flower: kitData.flower,
        petals: kitData.petals,
        lpc: kitData.lpc,
        pc: kitData.pc,
        cc: kitData.cc,
        leaves: kitData.leaves,
        lc: kitData.lc,
        sc: kitData.sc
      });

      if (buyBtn) {
        store.cameFrom = 'kits';
        store.setScreen('checkout');
      } else if (editBtn) {
        store.cameFrom = 'kits';
        store.setScreen('build');
      }
    });

    // Close overlays with Escape or outside click
    $$('.overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.hidden = true;
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        $$('.overlay').forEach(o => { o.hidden = true; });
      }
    });

    // Deep link hash support
    window.addEventListener('hashchange', () => {
      if (store.loadFromHash()) {
        store.cameFrom = 'doors';
        store.setScreen('build');
        this.showToast('Custom flower recipe loaded!');
      }
    });
  }

  syncFromState() {
    // Initial sound UI sync
    this.soundBtn.textContent = audio.muted ? '🔕' : '🔔';

    // Populate checkout fields from local storage
    this.syncCheckoutForm();

    // Check deep link hash on startup
    if (window.location.hash && store.loadFromHash()) {
      store.cameFrom = 'doors';
      store.setScreen('build');
    } else {
      store.setScreen('door');
    }

    this.renderFlowerDoors();
    this.renderKitsList();
    this.renderWorkbench();
    this.renderBill();
  }

  renderScreen(screenId) {
    this.screens.forEach(s => {
      const match = s.id === `s-${screenId}`;
      s.classList.toggle('active', match);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  bindShopGestures() {
    let startX = null;
    let startY = null;

    this.shopScene.addEventListener('pointerdown', e => {
      startX = e.clientX;
      startY = e.clientY;
    });

    this.shopScene.addEventListener('pointerup', e => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = null;

      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        if (dx > 0) {
          // Swipe right -> Build
          audio.pop();
          this.renderFlowerDoors();
          store.setScreen('doors');
        } else {
          // Swipe left -> Kits
          audio.pop();
          this.renderKitsList();
          store.setScreen('kits');
        }
      }
    });

    document.addEventListener('keydown', e => {
      if (!$('#s-shop').classList.contains('active')) return;
      if (e.key === 'ArrowRight') {
        this.renderFlowerDoors();
        store.setScreen('doors');
      } else if (e.key === 'ArrowLeft') {
        this.renderKitsList();
        store.setScreen('kits');
      }
    });
  }

  initShelfJars() {
    const jarColors = ['yellow', 'white', 'pink', 'green', 'red', 'blue', 'brown', 'lavender'];
    let jarsHtml = '';
    const shelves = [[250, 0], [350, 3], [450, 5]];

    shelves.forEach(([yPos, offset], rowIndex) => {
      for (let i = 0; i < 3; i++) {
        const colorKey = jarColors[(offset + i) % jarColors.length];
        const colorHex = COL[colorKey];
        const xPos = 196 + i * 50;

        jarsHtml += `
          <rect x="${xPos}" y="${yPos - 62}" width="38" height="62" rx="6" fill="#ffffff" opacity="0.82" stroke="#2a1f33" stroke-width="2.5"/>
        `;
        for (let k = 0; k < 5; k++) {
          const stickHeight = yPos - 52 - ((k * 7 + rowIndex * 3) % 12);
          jarsHtml += `
            <path d="${`M${xPos + 7 + k * 6} ${yPos - 4}V${stickHeight}`}" stroke="${colorHex}" stroke-width="4.5" stroke-linecap="round"/>
          `;
        }
      }
    });

    const jarContainer = $('#jars');
    if (jarContainer) {
      jarContainer.innerHTML = jarsHtml;
    }
  }

  renderFlowerDoors() {
    this.doorList.innerHTML = Object.keys(FL).map(key => {
      const spec = FL[key];
      const previewState = store.getDefaultFlowerState(key);
      const svgThumb = flowerSVG(previewState, {
        bg: false,
        uid: 'door_' + key,
        vb: '20 90 440 400'
      });

      return `
        <button class="doorcard group" type="button" data-flower="${key}" aria-label="${spec.name}: Open customizable workbench">
          <div class="doorframe group-hover:scale-105 group-hover:-rotate-1 transition-transform" style="background:${spec.card}">
            ${svgThumb}
          </div>
          <b class="text-base sm:text-lg font-bold">${spec.name}</b>
          <span class="text-xs sm:text-sm text-muted font-bold">${spec.tag}</span>
        </button>
      `;
    }).join('');
  }

  openFullnessModal() {
    this.fullOpts.innerHTML = FULL.map(f => {
      const isSelected = f.n === 2;
      return `
        <button class="opt ${isSelected ? 'sel' : ''} text-left" type="button" data-lpc="${f.n}">
          <div>
            <b>${f.name}</b>
            <span class="text-xs block text-muted">${f.desc}</span>
          </div>
          <span class="text-xs font-bold px-2 py-1 bg-white/70 rounded-full border border-line">${f.badge}</span>
        </button>
      `;
    }).join('');
    this.fullDlg.hidden = false;
  }

  renderWorkbench() {
    const s = store.flower;
    const spec = FL[s.flower] || FL.sunflower;

    this.buildTitle.textContent = `${spec.name} Workbench`;

    // Render tabs based on flower variety (center coil hidden for tulips/sprigs)
    const validPartKeys = Object.keys(PARTS).filter(k => k !== 'centre' || spec.centre);
    this.tabs.innerHTML = validPartKeys.map(k => `
      <button class="tab" role="tab" type="button" data-part="${k}" aria-selected="${k === store.activeTab}">
        ${PARTS[k]}
      </button>
    `).join('');

    if (!validPartKeys.includes(store.activeTab)) {
      store.activeTab = 'petals';
    }
    this.switchWorkbenchTab();

    // Slider bounds
    this.petalRange.min = spec.minPetals || 4;
    this.petalRange.max = spec.maxPetals || 36;
    this.petalRange.value = s.petals;
    this.petalVal.textContent = s.petals;

    // Fullness segments
    this.fullSeg.innerHTML = FULL.map(f => `
      <button type="button" data-lpc="${f.n}" aria-pressed="${s.lpc === f.n}">
        <b>${f.name}</b>
        <span>${f.desc}</span>
      </button>
    `).join('');

    // Swatches
    $$('.swatches').forEach(box => {
      const partKey = box.dataset.part;
      box.innerHTML = COLNAMES.map(c => `
        <button class="sw" type="button" data-c="${c}" style="background:${COL[c]}" aria-label="${capitalize(c)}" aria-pressed="${s[partKey] === c}"></button>
      `).join('');
    });

    // Leaf Stepper
    this.leafVal.textContent = s.leaves;
    this.leafMinus.disabled = s.leaves <= 0;
    this.leafPlus.disabled = s.leaves >= 8;

    // Live Vector Stage
    this.stage.innerHTML = flowerSVG(s, { uid: 'stage_' + s.flower });

    // Price estimate badge
    const cost = store.calculateCost();
    this.priceTag.innerHTML = `
      <span class="font-extrabold text-ink">${cost.totalCleaners} Pipe Cleaners · ${formatTk(cost.subtotal)}</span>
      <small class="block text-xs text-muted font-bold">+ ৳${CFG.platformFee} platform fee</small>
    `;
  }

  switchWorkbenchTab() {
    $$('#tabs .tab').forEach(tab => {
      tab.setAttribute('aria-selected', tab.dataset.part === store.activeTab);
    });
    Object.keys(PARTS).forEach(k => {
      const pane = $(`#pane-${k}`);
      if (pane) {
        pane.hidden = k !== store.activeTab;
      }
    });
  }

  syncCheckoutForm() {
    const d = store.checkout;
    ['name', 'phone', 'city', 'area', 'addr'].forEach(field => {
      const input = $(`#f-${field}`);
      if (input && input.value !== d[field]) {
        input.value = d[field];
      }
    });
  }

  renderBill() {
    const s = store.flower;
    const spec = FL[s.flower] || FL.sunflower;
    const cost = store.calculateCost();

    this.billName.textContent = `${spec.name} (${s.petals} Petals, ${s.leaves} Leaves)`;
    this.miniFlower.innerHTML = flowerSVG(s, { uid: 'mini_' + s.flower, bg: false, vb: '40 60 400 480' });

    // Build itemized table
    let rowsHtml = cost.lines.map(l => `
      <tr>
        <td>
          <span class="dot" style="background:${COL[l.col]}"></span>
          ${capitalize(l.col)} Pipe Cleaners
        </td>
        <td class="q">× ${l.n}</td>
        <td>${formatTk(l.cost)}</td>
      </tr>
    `).join('');

    rowsHtml += `
      <tr>
        <td colspan="2">Platform Handling Fee</td>
        <td>${formatTk(cost.platformFee)}</td>
      </tr>
      <tr>
        <td colspan="2">Delivery (${CFG.deliveryCityName})</td>
        <td>${cost.isRajshahi ? formatTk(cost.deliveryFee) : '<span class="text-danger font-bold">Unavailable</span>'}</td>
      </tr>
      <tr class="total">
        <td colspan="2">Grand Total</td>
        <td class="text-accent-ink font-black">${formatTk(cost.grandTotal)}</td>
      </tr>
    `;

    this.billTable.innerHTML = rowsHtml;

    // Regional Delivery Warning
    this.regionNote.hidden = cost.isRajshahi;
    this.orderIG.disabled = !cost.isRajshahi;
    this.orderMail.disabled = !cost.isRajshahi;
  }

  validateForm() {
    const val = f => ($(`#f-${f}`).value || '').trim();
    const phone = val('phone').replace(/[\s-]/g, '');
    let errMsg = '';

    if (!val('name')) {
      errMsg = 'Please enter your name.';
      $('#f-name').focus();
    } else if (!/^(\+?88)?01[3-9]\d{8}$/.test(phone)) {
      errMsg = 'Please provide a valid Bangladesh mobile number (e.g. 01XXXXXXXXX).';
      $('#f-phone').focus();
    } else if (this.citySelect.value !== 'rajshahi') {
      errMsg = 'Deliveries are currently limited to Rajshahi.';
      this.citySelect.focus();
    } else if (!val('area')) {
      errMsg = 'Please enter your neighborhood/area in Rajshahi.';
      $('#f-area').focus();
    } else if (!val('addr')) {
      errMsg = 'Please enter your full delivery address.';
      $('#f-addr').focus();
    }

    this.formErr.textContent = errMsg;
    return !errMsg;
  }

  formatOrderSummary() {
    const s = store.flower;
    const spec = FL[s.flower] || FL.sunflower;
    const cost = store.calculateCost();
    const orderId = 'FP' + Date.now().toString(36).slice(-4).toUpperCase();
    const details = store.checkout;

    const materialsSummary = cost.lines.map(l => `${l.n} ${l.col}`).join(', ');
    const shareableUrl = `${window.location.origin}${window.location.pathname}${store.getShareableHash()}`;

    return `🌸 *Fuzzy Petal Shop Order #${orderId}*
------------------------------
Flower: ${spec.name} (${s.petals} Petals, ${s.leaves} Leaves)
Pipe Cleaners: ${materialsSummary}
Total Materials: ${cost.totalCleaners} pieces
Total Payable: ${formatTk(cost.grandTotal)} (incl. ৳10 platform fee & ৳50 Rajshahi delivery)

Customer Details:
Name: ${details.name}
Phone: ${details.phone}
City: Rajshahi (${details.area})
Full Address: ${details.addr}

Interactive Design Recipe:
${shareableUrl}`;
  }

  handleOrderSubmission(mode = 'ig') {
    if (!this.validateForm()) return;

    audio.celebrate();
    const orderText = this.formatOrderSummary();
    this.orderText.value = orderText;
    this.copyMsg.textContent = '';

    if (mode === 'ig') {
      this.orderTitle.textContent = 'Send Order via Instagram Direct';
      this.orderHelp.textContent = 'Your order text has been formatted. Copy it below, tap "Open Instagram", and paste it into our DM! We confirm each handcrafted flower within minutes.';
      this.mailBox.hidden = true;

      this.openLink.textContent = 'Open Instagram DM';
      const igUsername = CFG.instagram;
      this.openLink.href = igUsername ? `https://ig.me/m/${encodeURIComponent(igUsername)}` : 'https://instagram.com';
      this.openLink.hidden = false;
    } else {
      this.orderTitle.textContent = 'Send Order via Email';
      this.orderHelp.textContent = 'Email your order details directly to our studio mailbox. The design recipe link lets our florists assemble your exact custom flower!';
      this.mailBox.hidden = false;
      this.mailAddr.value = CFG.email;

      const subject = encodeURIComponent(`New Flower Order #${Date.now().toString(36).slice(-4).toUpperCase()} - ${store.checkout.name}`);
      const body = encodeURIComponent(orderText);
      this.openLink.textContent = 'Open Mail App';
      this.openLink.href = `mailto:${CFG.email}?subject=${subject}&body=${body}`;
      this.openLink.hidden = false;
    }

    this.orderDlg.hidden = false;
    this.copyOrderText();
  }

  copyOrderText() {
    const text = this.orderText.value;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          this.copyMsg.textContent = '✓ Order details copied to clipboard!';
          this.showToast('Order details copied!');
        })
        .catch(() => {
          this.fallbackCopy();
        });
    } else {
      this.fallbackCopy();
    }
  }

  fallbackCopy() {
    this.orderText.focus();
    this.orderText.select();
    try {
      document.execCommand('copy');
      this.copyMsg.textContent = '✓ Order details copied to clipboard!';
      this.showToast('Order details copied!');
    } catch {
      this.copyMsg.textContent = 'Please manually select and copy the text above.';
    }
  }

  async handleSavePicture() {
    audio.pop();
    this.showToast('Rendering high-res flower card...');
    try {
      const cost = store.calculateCost();
      const dataUrl = await exportFlowerCanvas(store.flower, cost);
      this.picImg.src = dataUrl;
      this.picDlg.hidden = false;
    } catch {
      this.showToast('Could not export image. Please take a screenshot.');
    }
  }

  renderKitsList() {
    this.kitList.innerHTML = KITS.map(kit => {
      const tempState = {
        flower: kit.flower,
        petals: kit.petals,
        lpc: kit.lpc,
        pc: kit.pc,
        cc: kit.cc,
        leaves: kit.leaves,
        lc: kit.lc,
        sc: kit.sc
      };
      const svgCard = flowerSVG(tempState, {
        uid: 'kit_' + kit.id,
        bg: true,
        vb: '20 30 440 500'
      });

      // Calculate materials
      const dummyStore = { flower: tempState, checkout: { city: 'rajshahi' } };
      const cost = store.calculateCost.call(dummyStore);

      return `
        <article class="kit" data-kit="${kit.id}">
          <div class="w-full aspect-square bg-[#fffdf7] border-b-2 border-line overflow-hidden p-2">
            ${svgCard}
          </div>
          <div class="body">
            <div class="flex items-center justify-between gap-2">
              <h3 class="text-xl font-bold font-display">${kit.title}</h3>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-accent/30 border border-line">${kit.tag}</span>
            </div>
            <p class="text-sm text-muted">${kit.desc}</p>
            <div class="chips">
              ${cost.lines.map(l => `
                <span class="chip">
                  <i style="background:${COL[l.col]}"></i>
                  ${l.n} ${capitalize(l.col)}
                </span>
              `).join('')}
            </div>
            <div class="price font-black text-lg">
              ${cost.totalCleaners} Pipe Cleaners · ${formatTk(cost.subtotal)}
            </div>
            <div class="btns">
              <button class="btn primary small" type="button" data-kit="${kit.id}" data-do="buy">
                Buy this kit
              </button>
              <button class="btn small" type="button" data-kit="${kit.id}" data-do="edit">
                Customize on workbench
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  showToast(message) {
    this.toastEl.textContent = message;
    this.toastEl.hidden = false;
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastEl.hidden = true;
    }, 2800);
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new AppController();
});
