/* ============================================================
   OPERATION: THREAT WATCH — v2
   Mobile-first Pandemic Legacy: Season 0 Threat Deck tracker
   No build step, no dependencies. State persists in localStorage.
   ============================================================ */

'use strict';

// ----- City data (the 48 base Threat Deck cities) -----
// Extracted from the actual board photo. Affiliations match the legend (14 NATO / 20 UN / 14 SSR).
const CITIES = [
  // North America (8)
  { id: 'san-francisco', name: 'San Francisco', faction: 'nato', region: 'na' },
  { id: 'los-angeles',   name: 'Los Angeles',   faction: 'nato', region: 'na' },
  { id: 'toronto',       name: 'Toronto',       faction: 'nato', region: 'na' },
  { id: 'new-york',      name: 'New York',      faction: 'nato', region: 'na' },
  { id: 'washington',    name: 'Washington',    faction: 'nato', region: 'na' },
  { id: 'atlanta',       name: 'Atlanta',       faction: 'nato', region: 'na' },
  { id: 'mexico-city',   name: 'Mexico City',   faction: 'un',   region: 'na' },
  { id: 'havana',        name: 'Havana',        faction: 'ssr',  region: 'na' },

  // South America (5) — all Neutral
  { id: 'bogota',        name: 'Bogotá',        faction: 'un',   region: 'sa' },
  { id: 'lima',          name: 'Lima',          faction: 'un',   region: 'sa' },
  { id: 'sao-paulo',     name: 'São Paulo',     faction: 'un',   region: 'sa' },
  { id: 'santiago',      name: 'Santiago',      faction: 'un',   region: 'sa' },
  { id: 'buenos-aires',  name: 'Buenos Aires',  faction: 'un',   region: 'sa' },

  // Europe (11)
  { id: 'london',        name: 'London',        faction: 'nato', region: 'europe' },
  { id: 'paris',         name: 'Paris',         faction: 'nato', region: 'europe' },
  { id: 'rome',          name: 'Rome',          faction: 'nato', region: 'europe' },
  { id: 'istanbul',      name: 'Istanbul',      faction: 'nato', region: 'europe' },
  { id: 'madrid',        name: 'Madrid',        faction: 'un',   region: 'europe' },
  { id: 'east-berlin',   name: 'East Berlin',   faction: 'ssr',  region: 'europe' },
  { id: 'warsaw',        name: 'Warsaw',        faction: 'ssr',  region: 'europe' },
  { id: 'prague',        name: 'Prague',        faction: 'ssr',  region: 'europe' },
  { id: 'leningrad',     name: 'Leningrad',     faction: 'ssr',  region: 'europe' },
  { id: 'moscow',        name: 'Moscow',        faction: 'ssr',  region: 'europe' },
  { id: 'kiev',          name: 'Kiev',          faction: 'ssr',  region: 'europe' },

  // Africa (6)
  { id: 'algiers',       name: 'Algiers',       faction: 'nato', region: 'africa' },
  { id: 'johannesburg',  name: 'Johannesburg',  faction: 'nato', region: 'africa' },
  { id: 'lagos',         name: 'Lagos',         faction: 'un',   region: 'africa' },
  { id: 'khartoum',      name: 'Khartoum',      faction: 'un',   region: 'africa' },
  { id: 'leopoldville',  name: 'Léopoldville',  faction: 'un',   region: 'africa' },
  { id: 'cairo',         name: 'Cairo',         faction: 'ssr',  region: 'africa' },

  // Asia (13)
  { id: 'saigon',        name: 'Saigon',        faction: 'nato', region: 'asia' },
  { id: 'riyadh',        name: 'Riyadh',        faction: 'un',   region: 'asia' },
  { id: 'karachi',       name: 'Karachi',       faction: 'un',   region: 'asia' },
  { id: 'delhi',         name: 'Delhi',         faction: 'un',   region: 'asia' },
  { id: 'bombay',        name: 'Bombay',        faction: 'un',   region: 'asia' },
  { id: 'calcutta',      name: 'Calcutta',      faction: 'un',   region: 'asia' },
  { id: 'bangkok',       name: 'Bangkok',       faction: 'un',   region: 'asia' },
  { id: 'baghdad',       name: 'Baghdad',       faction: 'ssr',  region: 'asia' },
  { id: 'novosibirsk',   name: 'Novosibirsk',   faction: 'ssr',  region: 'asia' },
  { id: 'peking',        name: 'Peking',        faction: 'ssr',  region: 'asia' },
  { id: 'pyongyang',     name: 'Pyongyang',     faction: 'ssr',  region: 'asia' },
  { id: 'shanghai',      name: 'Shanghai',      faction: 'ssr',  region: 'asia' },
  { id: 'hanoi',         name: 'Hanoi',         faction: 'ssr',  region: 'asia' },

  // Pacific Rim (5)
  { id: 'sydney',        name: 'Sydney',        faction: 'nato', region: 'pacific' },
  { id: 'tokyo',         name: 'Tokyo',         faction: 'un',   region: 'pacific' },
  { id: 'osaka',         name: 'Osaka',         faction: 'un',   region: 'pacific' },
  { id: 'manila',        name: 'Manila',        faction: 'un',   region: 'pacific' },
  { id: 'jakarta',       name: 'Jakarta',       faction: 'un',   region: 'pacific' },
];

const CITY_BY_ID = Object.fromEntries(CITIES.map(c => [c.id, c]));
const REGION_ORDER = ['na', 'sa', 'europe', 'africa', 'asia', 'pacific'];
const MONTHS = ['Prologue', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DRAW_RATE = [2, 2, 2, 3, 3, 4]; // threatLevel 1-6 → draws per turn

const STORAGE_KEY = 'threat-watch.v2';
const HISTORY_LIMIT = 50;
const ACTION_LOG_LIMIT = 100;
const SURVEILLANCE_MAX = 3;

// ----- State -----
const defaultState = () => ({
  cards: Object.fromEntries(CITIES.map(c => [c.id, {
    zone: 'deck',
    surveillance: 0,
    safehouse: false,
  }])),
  drawCount: 0,
  incidentCount: 0,
  peekStratum: 0,
  threatLevel: 1,
  monthIndex: 0, // 0 = Prologue, 1-12 = Jan-Dec
  actionLog: [], // [{ts, text, type}]
  settings: {
    autoSurveillance: false, // opt-in — keeps default experience simple
    soundOn: false,
    advancedMode: false,
  },
});

let state = defaultState();
let history = []; // bounded undo stack of state snapshots
const filters = { faction: 'all', region: 'all', search: '' };
const ui = { historyOpen: false, filtersOpen: false, hudOpen: false };

// ----- Persistence -----
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save state:', e);
  }
}

function loadState() {
  try {
    // Try v2 first, then migrate from v1 if found
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const v1 = localStorage.getItem('threat-watch.v1');
      if (v1) raw = v1;
    }
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.cards) return false;
    const fresh = defaultState();
    Object.assign(fresh, parsed);
    CITIES.forEach(c => {
      const existing = fresh.cards[c.id];
      if (!existing) {
        fresh.cards[c.id] = { zone: 'deck', surveillance: 0, safehouse: false };
      } else {
        if (typeof existing.surveillance !== 'number') existing.surveillance = 0;
        if (typeof existing.safehouse !== 'boolean') existing.safehouse = false;
      }
    });
    fresh.settings = Object.assign({ autoSurveillance: false, soundOn: false, advancedMode: false }, parsed.settings || {});
    if (!Array.isArray(fresh.actionLog)) fresh.actionLog = [];
    state = fresh;
    return true;
  } catch (e) {
    console.warn('Could not load state:', e);
    return false;
  }
}

function snapshot() { return JSON.parse(JSON.stringify(state)); }

function pushHistory() {
  history.push(snapshot());
  if (history.length > HISTORY_LIMIT) history.shift();
  updateUndoButton();
}

function updateUndoButton() {
  const btn = document.getElementById('undo-btn');
  if (btn) btn.disabled = history.length === 0;
}

function logAction(text, type = 'info') {
  state.actionLog.unshift({ ts: Date.now(), text, type });
  if (state.actionLog.length > ACTION_LOG_LIMIT) state.actionLog.length = ACTION_LOG_LIMIT;
}

// ----- Card-state actions -----
function drawCard(cityId) {
  const card = state.cards[cityId];
  if (!card) return;
  const city = CITY_BY_ID[cityId];
  pushHistory();
  const fromZone = card.zone;
  state.drawCount += 1;
  card.zone = 'discard';
  card.drawOrder = state.drawCount;
  card.drawnAt = Date.now();
  delete card.peekStratum;
  // Auto-increment surveillance on draw (if enabled and not safehoused)
  let surveillanceMsg = '';
  if (state.settings.autoSurveillance && !card.safehouse) {
    if (card.surveillance < SURVEILLANCE_MAX) {
      card.surveillance += 1;
      surveillanceMsg = ` (+1 surveillance → ${card.surveillance}/${SURVEILLANCE_MAX})`;
    } else {
      surveillanceMsg = ` ⚠ already at MAX surveillance — would trigger Incident`;
    }
  }
  logAction(`Drew ${city.name}${surveillanceMsg}`, 'draw');
  saveState();
  render();
  // Quieter toast when auto-surveillance is off — just confirm the draw
  const toastMsg = state.settings.autoSurveillance ? `Drawn: ${city.name}${surveillanceMsg}` : `Drawn: ${city.name}`;
  toast(toastMsg, surveillanceMsg.includes('⚠') ? 'warning' : 'default');
}

function returnToDeck(cityId, opts = {}) {
  const card = state.cards[cityId];
  if (!card) return;
  const city = CITY_BY_ID[cityId];
  pushHistory();
  card.zone = 'deck';
  delete card.drawOrder;
  delete card.drawnAt;
  delete card.peekStratum;
  logAction(`Returned ${city.name} to deck`, 'return');
  saveState();
  render();
  if (!opts.silent) toast(`Returned: ${city.name} → deck`);
}

function removeCard(cityId) {
  const card = state.cards[cityId];
  if (!card) return;
  const city = CITY_BY_ID[cityId];
  pushHistory();
  card.zone = 'removed';
  delete card.peekStratum;
  logAction(`Removed ${city.name} from play (legacy)`, 'remove');
  saveState();
  render();
  toast(`Removed: ${city.name}`, 'warning');
}

function adjustSurveillance(cityId, delta) {
  const card = state.cards[cityId];
  if (!card) return;
  const city = CITY_BY_ID[cityId];
  const newValue = Math.max(0, Math.min(SURVEILLANCE_MAX, (card.surveillance || 0) + delta));
  if (newValue === card.surveillance) return;
  pushHistory();
  card.surveillance = newValue;
  logAction(`${city.name} surveillance ${delta > 0 ? '+1' : '-1'} → ${newValue}/${SURVEILLANCE_MAX}`, 'surveillance');
  saveState();
  render();
}

function toggleSafehouse(cityId) {
  const card = state.cards[cityId];
  if (!card) return;
  const city = CITY_BY_ID[cityId];
  pushHistory();
  card.safehouse = !card.safehouse;
  logAction(`${city.name} safehouse ${card.safehouse ? 'BUILT' : 'removed'}`, 'safehouse');
  saveState();
  render();
}

function incident() {
  const discardIds = CITIES.filter(c => state.cards[c.id].zone === 'discard').map(c => c.id);
  if (discardIds.length === 0) {
    toast('Nothing in the discard pile to reshuffle.', 'warning');
    return;
  }
  pushHistory();
  state.incidentCount += 1;
  state.peekStratum += 1;
  const newStratum = state.peekStratum;
  discardIds.forEach(id => {
    const card = state.cards[id];
    card.zone = 'peek';
    card.peekStratum = newStratum;
    delete card.drawOrder;
    delete card.drawnAt;
  });
  logAction(`⚠ INCIDENT #${state.incidentCount} — ${discardIds.length} card${discardIds.length === 1 ? '' : 's'} reshuffled on top`, 'incident');
  saveState();
  render();
  triggerIncidentAnimation();
  toast(`INCIDENT #${state.incidentCount} — ${discardIds.length} card${discardIds.length === 1 ? '' : 's'} on top`, 'warning');
}

function advanceMonth() {
  if (state.monthIndex >= MONTHS.length - 1) return;
  pushHistory();
  state.monthIndex += 1;
  logAction(`Advanced to ${MONTHS[state.monthIndex]}`, 'month');
  saveState();
  render();
}

function regressMonth() {
  if (state.monthIndex <= 0) return;
  pushHistory();
  state.monthIndex -= 1;
  saveState();
  render();
}

function setThreatLevel(level) {
  level = Math.max(1, Math.min(DRAW_RATE.length, level));
  if (level === state.threatLevel) return;
  pushHistory();
  state.threatLevel = level;
  logAction(`Threat level → ${level} (draw ${DRAW_RATE[level - 1]} per turn)`, 'threat');
  saveState();
  render();
}

function advanceThreatLevel() { setThreatLevel(state.threatLevel + 1); }
function regressThreatLevel() { setThreatLevel(state.threatLevel - 1); }

function undo() {
  if (history.length === 0) return;
  state = history.pop();
  saveState();
  render();
  toast('Last action undone');
}

function resetGame() {
  if (!confirm('Start a new game? This erases the current tracker (your saved state will be wiped).')) return;
  history = [];
  state = defaultState();
  saveState();
  render();
  toast('New game started');
}

// ----- Rendering -----
function render() {
  renderCounts();
  renderCampaignHud();
  renderPeekZone();
  renderDeckZone();
  renderDiscardZone();
  renderRemovedZone();
  renderActionLog();
  updateUndoButton();
}

function renderCounts() {
  const counts = { deck: 0, peek: 0, discard: 0, removed: 0 };
  Object.values(state.cards).forEach(c => { counts[c.zone] = (counts[c.zone] || 0) + 1; });
  setText('count-deck', counts.deck);
  setText('count-peek', counts.peek);
  setText('count-discard', counts.discard);
  setText('count-removed', counts.removed);
  setText('count-incidents', state.incidentCount);
}

function renderCampaignHud() {
  setText('month-label', MONTHS[state.monthIndex]);
  setText('month-index', state.monthIndex === 0 ? '—' : `${state.monthIndex}/12`);
  const track = document.getElementById('threat-track');
  if (track) {
    track.innerHTML = '';
    DRAW_RATE.forEach((rate, i) => {
      const pip = document.createElement('button');
      const level = i + 1;
      pip.type = 'button';
      pip.className = 'threat-pip' + (level === state.threatLevel ? ' threat-pip-active' : '') + (level < state.threatLevel ? ' threat-pip-past' : '');
      pip.dataset.level = String(level);
      pip.setAttribute('aria-label', `Set threat level to ${level} (${rate} draws/turn)`);
      pip.innerHTML = `<span class="threat-pip-rate">${rate}</span>`;
      pip.addEventListener('click', () => setThreatLevel(level));
      track.appendChild(pip);
    });
  }
  setText('draw-rate-value', DRAW_RATE[state.threatLevel - 1]);
}

function renderPeekZone() {
  const grid = document.getElementById('peek-grid');
  if (!grid) return;
  const peekCards = CITIES.filter(c => state.cards[c.id].zone === 'peek');
  if (peekCards.length === 0) {
    grid.innerHTML = '<div class="empty-state">No active intel. After an <strong>Incident</strong>, reshuffled cards will appear here — the cities you can plan around.</div>';
    return;
  }
  // Sort by stratum descending (newest on top), then alphabetical
  const sorted = peekCards.slice().sort((a, b) => {
    const sa = state.cards[a.id].peekStratum || 0;
    const sb = state.cards[b.id].peekStratum || 0;
    if (sa !== sb) return sb - sa;
    return a.name.localeCompare(b.name);
  });
  grid.innerHTML = '';
  let currentStratum = null;
  sorted.forEach(city => {
    const stratum = state.cards[city.id].peekStratum;
    if (stratum !== currentStratum) {
      currentStratum = stratum;
      const peers = sorted.filter(c => state.cards[c.id].peekStratum === stratum);
      grid.appendChild(makeStratumBanner(stratum, peers));
    }
    grid.appendChild(makeCard(city, 'peek', { badge: `#${stratum}`, probability: 1 / sorted.filter(c => state.cards[c.id].peekStratum === stratum).length }));
  });
}

function makeStratumBanner(stratum, peers) {
  const banner = document.createElement('div');
  banner.className = 'stratum-banner';
  const pct = Math.round((1 / peers.length) * 100);
  let detailHtml = '';
  // Only show the faction/region breakdown when it actually adds info (4+ cards)
  if (peers.length >= 4) {
    const factionCounts = { nato: 0, un: 0, ssr: 0 };
    peers.forEach(c => factionCounts[c.faction] += 1);
    const factionBits = [
      factionCounts.nato ? `<span class="banner-chip banner-chip-nato">${svgIcon('nato')} ${factionCounts.nato}</span>` : '',
      factionCounts.un ? `<span class="banner-chip banner-chip-un">${svgIcon('un')} ${factionCounts.un}</span>` : '',
      factionCounts.ssr ? `<span class="banner-chip banner-chip-ssr">${svgIcon('ssr')} ${factionCounts.ssr}</span>` : '',
    ].filter(Boolean).join('');
    detailHtml = `<div class="banner-chip-row">${factionBits}</div>`;
  }
  banner.innerHTML = `
    <div class="stratum-banner-title">
      <span class="stratum-badge">INCIDENT #${stratum}</span>
      <span class="stratum-stats">${peers.length} card${peers.length === 1 ? '' : 's'} · ${pct}% each</span>
    </div>
    ${detailHtml}
  `;
  return banner;
}

function renderDeckZone() {
  const grid = document.getElementById('deck-grid');
  if (!grid) return;
  const searchTerm = filters.search.trim().toLowerCase();
  const deckCards = CITIES.filter(c => state.cards[c.id].zone === 'deck')
    .filter(c => filters.faction === 'all' || c.faction === filters.faction)
    .filter(c => filters.region === 'all' || c.region === filters.region)
    .filter(c => !searchTerm || c.name.toLowerCase().includes(searchTerm) || c.id.includes(searchTerm))
    .sort((a, b) => {
      if (a.region !== b.region) return REGION_ORDER.indexOf(a.region) - REGION_ORDER.indexOf(b.region);
      return a.name.localeCompare(b.name);
    });
  if (deckCards.length === 0) {
    grid.innerHTML = '<div class="empty-state">No cities match these filters.</div>';
    return;
  }
  grid.innerHTML = '';
  deckCards.forEach(city => grid.appendChild(makeCard(city, 'deck')));
}

function renderDiscardZone() {
  const grid = document.getElementById('discard-grid');
  if (!grid) return;
  const discardCards = CITIES.filter(c => state.cards[c.id].zone === 'discard');
  if (discardCards.length === 0) {
    grid.innerHTML = '<div class="empty-state">No draws yet.</div>';
    return;
  }
  discardCards.sort((a, b) => (state.cards[b.id].drawOrder || 0) - (state.cards[a.id].drawOrder || 0));
  grid.innerHTML = '';
  discardCards.forEach(city => {
    grid.appendChild(makeCard(city, 'discard', { badge: `#${state.cards[city.id].drawOrder}` }));
  });
}

function renderRemovedZone() {
  const grid = document.getElementById('removed-grid');
  const section = document.getElementById('zone-removed');
  if (!grid) return;
  const removedCards = CITIES.filter(c => state.cards[c.id].zone === 'removed');
  // Hide entire section when empty — keep default view simple
  if (removedCards.length === 0) {
    if (section) section.classList.add('zone-hidden');
    grid.innerHTML = '';
    return;
  }
  if (section) section.classList.remove('zone-hidden');
  grid.innerHTML = '';
  removedCards.forEach(city => grid.appendChild(makeCard(city, 'removed')));
}

function renderActionLog() {
  const list = document.getElementById('log-list');
  if (!list) return;
  if (!state.actionLog.length) {
    list.innerHTML = '<li class="log-empty">No actions yet.</li>';
    return;
  }
  list.innerHTML = state.actionLog.slice(0, 30).map(entry => {
    return `<li class="log-entry log-entry-${entry.type}">
      <time>${formatTime(entry.ts)}</time>
      <span>${escapeHtml(entry.text)}</span>
    </li>`;
  }).join('');
  setText('log-count', state.actionLog.length);
}

function formatTime(ts) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// ----- Card builder -----
function makeCard(city, zone, opts = {}) {
  const data = state.cards[city.id];
  const btn = document.createElement('button');
  btn.className = `card card-region-${city.region} card-faction-${city.faction} card-zone-${zone}`;
  if (data.surveillance >= SURVEILLANCE_MAX) btn.classList.add('card-surveillance-max');
  if (data.safehouse) btn.classList.add('card-safehouse');
  btn.type = 'button';
  btn.dataset.cityId = city.id;
  const survDots = Array.from({ length: SURVEILLANCE_MAX }, (_, i) => {
    const filled = i < (data.surveillance || 0);
    return `<span class="card-surv-dot${filled ? ' card-surv-dot-filled' : ''}"></span>`;
  }).join('');
  const probBadge = opts.probability ? `<span class="card-prob">${Math.round(opts.probability * 100)}%</span>` : '';
  btn.setAttribute('aria-label', `${city.name} — ${factionLabel(city.faction)} — ${regionLabel(city.region)} — ${zoneLabel(zone)} — surveillance ${data.surveillance}/${SURVEILLANCE_MAX}${data.safehouse ? ' — safehouse' : ''}`);
  btn.innerHTML = `
    <div class="card-top">
      <span class="card-faction-icon" aria-hidden="true">${svgIcon(city.faction)}</span>
      <span class="card-surv-row" aria-hidden="true">${survDots}</span>
    </div>
    ${data.safehouse ? '<span class="card-safehouse-icon" title="Safehouse">⌂</span>' : ''}
    <div class="card-name">${escapeHtml(city.name)}</div>
    ${opts.badge ? `<span class="card-badge">${escapeHtml(opts.badge)}</span>` : ''}
    ${probBadge}
  `;
  attachCardHandlers(btn, city, zone);
  return btn;
}

function attachCardHandlers(btn, city, zone) {
  let longPressTimer = null;
  let didLongPress = false;

  const startPress = () => {
    didLongPress = false;
    btn.classList.add('card-pressing');
    longPressTimer = setTimeout(() => {
      didLongPress = true;
      btn.classList.remove('card-pressing');
      if (navigator.vibrate) try { navigator.vibrate(15); } catch (e) {}
      openInspector(city.id);
    }, 550);
  };

  const cancelPress = () => {
    clearTimeout(longPressTimer);
    longPressTimer = null;
    btn.classList.remove('card-pressing');
  };

  btn.addEventListener('pointerdown', startPress);
  btn.addEventListener('pointerup', cancelPress);
  btn.addEventListener('pointercancel', cancelPress);
  btn.addEventListener('pointerleave', cancelPress);

  btn.addEventListener('click', (ev) => {
    if (didLongPress) { ev.preventDefault(); return; }
    handleCardTap(city.id, zone);
  });

  btn.addEventListener('contextmenu', ev => { ev.preventDefault(); openInspector(city.id); });
}

function handleCardTap(cityId, fromZone) {
  switch (fromZone) {
    case 'deck':
    case 'peek':
      drawCard(cityId);
      break;
    case 'discard':
    case 'removed':
      returnToDeck(cityId);
      break;
  }
}

// ----- Inspector modal -----
function openInspector(cityId) {
  const city = CITY_BY_ID[cityId];
  const data = state.cards[cityId];
  if (!city) return;
  const modal = document.getElementById('inspector');
  if (!modal) return;
  modal.dataset.cityId = cityId;
  modal.innerHTML = `
    <div class="modal-card card-region-${city.region}" role="dialog" aria-modal="true" aria-labelledby="inspector-title">
      <button class="modal-close" type="button" aria-label="Close">✕</button>
      <div class="modal-top">
        <span class="modal-faction-icon" aria-hidden="true">${svgIcon(city.faction)}</span>
        <h3 id="inspector-title" class="modal-title">${escapeHtml(city.name)}</h3>
        <p class="modal-meta">${factionLabel(city.faction)} · ${regionLabel(city.region)} · <span class="modal-zone modal-zone-${data.zone}">${zoneLabel(data.zone).toUpperCase()}</span></p>
      </div>
      <div class="modal-section">
        <div class="modal-section-label">SURVEILLANCE</div>
        <div class="modal-surv-row">
          <button class="modal-surv-btn" data-action="surv-down" aria-label="Decrement surveillance">−</button>
          <div class="modal-surv-display">
            ${Array.from({ length: SURVEILLANCE_MAX }, (_, i) =>
              `<span class="modal-surv-dot${i < data.surveillance ? ' modal-surv-dot-filled' : ''}"></span>`
            ).join('')}
            <span class="modal-surv-count">${data.surveillance}/${SURVEILLANCE_MAX}</span>
          </div>
          <button class="modal-surv-btn" data-action="surv-up" aria-label="Increment surveillance">+</button>
        </div>
      </div>
      <div class="modal-section">
        <label class="modal-toggle">
          <input type="checkbox" data-action="safehouse-toggle" ${data.safehouse ? 'checked' : ''}>
          <span class="modal-toggle-label">Safehouse in this city</span>
          <span class="modal-toggle-hint">Cities with safehouses ignore Incident effects</span>
        </label>
      </div>
      <div class="modal-actions">
        ${data.zone !== 'discard' ? '<button class="modal-action modal-action-draw" data-action="draw">Mark drawn</button>' : ''}
        ${data.zone !== 'deck' ? '<button class="modal-action" data-action="return">Return to deck</button>' : ''}
        ${data.zone !== 'removed' ? '<button class="modal-action modal-action-danger" data-action="remove">Remove from deck</button>' : ''}
      </div>
    </div>
  `;
  modal.classList.add('inspector-open');
  attachInspectorHandlers(cityId);
}

function attachInspectorHandlers(cityId) {
  const modal = document.getElementById('inspector');
  if (!modal) return;
  const closeBtn = modal.querySelector('.modal-close');
  closeBtn?.addEventListener('click', closeInspector);
  modal.addEventListener('click', (ev) => {
    if (ev.target === modal) closeInspector();
  });
  modal.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const action = el.dataset.action;
      if (action === 'surv-up') { adjustSurveillance(cityId, +1); refreshInspector(cityId); }
      else if (action === 'surv-down') { adjustSurveillance(cityId, -1); refreshInspector(cityId); }
      else if (action === 'safehouse-toggle') { toggleSafehouse(cityId); refreshInspector(cityId); }
      else if (action === 'draw') { drawCard(cityId); closeInspector(); }
      else if (action === 'return') { returnToDeck(cityId); closeInspector(); }
      else if (action === 'remove') { removeCard(cityId); closeInspector(); }
    });
  });
}

function refreshInspector(cityId) {
  // Re-open with fresh data
  openInspector(cityId);
}

function closeInspector() {
  const modal = document.getElementById('inspector');
  if (modal) {
    modal.classList.remove('inspector-open');
    modal.innerHTML = '';
  }
}

// ----- SVG icons -----
function svgIcon(faction) {
  switch (faction) {
    case 'nato':
      return `<svg viewBox="0 0 24 24" aria-hidden="true" class="faction-svg faction-svg-nato"><polygon points="12,2 14,11 23,12 14,13 12,22 10,13 1,12 10,11" fill="currentColor"/></svg>`;
    case 'un':
      return `<svg viewBox="0 0 24 24" aria-hidden="true" class="faction-svg faction-svg-un">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/>
        <ellipse cx="12" cy="12" rx="9" ry="3.5" fill="none" stroke="currentColor" stroke-width="1.2"/>
        <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" stroke-width="1.2"/>
        <ellipse cx="12" cy="12" rx="3.5" ry="9" fill="none" stroke="currentColor" stroke-width="1.2"/>
      </svg>`;
    case 'ssr':
      return `<svg viewBox="0 0 24 24" aria-hidden="true" class="faction-svg faction-svg-ssr">
        <polygon points="12,2 14.7,9.3 22,9.5 16,14 18.5,21.5 12,16.8 5.5,21.5 8,14 2,9.5 9.3,9.3" fill="currentColor"/>
      </svg>`;
    default:
      return '';
  }
}

function factionLabel(f) {
  return { nato: 'NATO/Allied', un: 'UN/Neutral', ssr: 'SSR/Soviet' }[f] || f;
}

function regionLabel(r) {
  return { na: 'North America', sa: 'South America', europe: 'Europe', africa: 'Africa', asia: 'Asia', pacific: 'Pacific Rim' }[r] || r;
}

function regionShort(r) {
  return { na: 'N.AM', sa: 'S.AM', europe: 'EUR', africa: 'AFR', asia: 'ASIA', pacific: 'PAC' }[r] || r.toUpperCase();
}

function zoneLabel(z) {
  return { deck: 'in deck', peek: 'on top of deck', discard: 'in discard', removed: 'removed' }[z] || z;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// ----- Toast -----
let toastTimer = null;
function toast(message, kind = 'default') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.toggle('toast-warning', kind === 'warning');
  el.classList.add('toast-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('toast-show'), 2400);
}

// ----- Incident animation -----
function triggerIncidentAnimation() {
  const overlay = document.getElementById('incident-stamp');
  if (!overlay) return;
  overlay.classList.remove('stamp-fire');
  void overlay.offsetWidth; // restart animation
  overlay.classList.add('stamp-fire');
  if (navigator.vibrate) try { navigator.vibrate([20, 60, 20]); } catch (e) {}
}

// ----- Event wiring -----
function wireEvents() {
  document.getElementById('incident-btn').addEventListener('click', incident);
  document.getElementById('undo-btn').addEventListener('click', undo);
  document.getElementById('reset-btn').addEventListener('click', resetGame);

  document.getElementById('month-prev')?.addEventListener('click', regressMonth);
  document.getElementById('month-next')?.addEventListener('click', advanceMonth);

  // Collapsible HUD (campaign tracker) — off by default
  const hudToggle = document.getElementById('hud-toggle');
  if (hudToggle) {
    hudToggle.addEventListener('click', () => {
      ui.hudOpen = !ui.hudOpen;
      document.getElementById('hud').classList.toggle('hud-open', ui.hudOpen);
      hudToggle.setAttribute('aria-expanded', String(ui.hudOpen));
      hudToggle.classList.toggle('toggle-active', ui.hudOpen);
    });
  }

  // Collapsible filter bars — off by default
  const filtersToggle = document.getElementById('filters-toggle');
  if (filtersToggle) {
    filtersToggle.addEventListener('click', () => {
      ui.filtersOpen = !ui.filtersOpen;
      document.getElementById('filter-stack').classList.toggle('filters-open', ui.filtersOpen);
      filtersToggle.setAttribute('aria-expanded', String(ui.filtersOpen));
      filtersToggle.classList.toggle('toggle-active', ui.filtersOpen);
    });
  }

  // Surveillance auto-track setting toggle
  const survToggle = document.getElementById('surv-toggle');
  if (survToggle) {
    survToggle.checked = !!state.settings.autoSurveillance;
    survToggle.addEventListener('change', () => {
      state.settings.autoSurveillance = survToggle.checked;
      saveState();
      toast(`Auto-track surveillance: ${survToggle.checked ? 'ON' : 'OFF'}`);
    });
  }

  document.getElementById('search-input').addEventListener('input', (ev) => {
    filters.search = ev.target.value || '';
    renderDeckZone();
  });

  document.querySelectorAll('[data-filter-faction]').forEach(btn => {
    btn.addEventListener('click', () => {
      filters.faction = btn.dataset.filterFaction;
      document.querySelectorAll('[data-filter-faction]').forEach(b => b.classList.toggle('filter-active', b === btn));
      renderDeckZone();
    });
  });

  document.querySelectorAll('[data-filter-region]').forEach(btn => {
    btn.addEventListener('click', () => {
      filters.region = btn.dataset.filterRegion;
      document.querySelectorAll('[data-filter-region]').forEach(b => b.classList.toggle('filter-active', b === btn));
      renderDeckZone();
    });
  });

  const logToggle = document.getElementById('log-toggle');
  if (logToggle) {
    logToggle.addEventListener('click', () => {
      ui.historyOpen = !ui.historyOpen;
      document.getElementById('log-panel').classList.toggle('log-open', ui.historyOpen);
      logToggle.setAttribute('aria-expanded', String(ui.historyOpen));
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (ev) => {
    if (ev.target.matches('input, textarea')) return;
    if (ev.key === 'Escape') { closeInspector(); return; }
    if (ev.key === 'z' || ev.key === 'Z') { undo(); }
    else if (ev.key === 'i' || ev.key === 'I') { incident(); }
  });
}

// ----- Service worker (for offline play) -----
function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;
  navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW registration failed:', err));
}

// ----- Bootstrap -----
function init() {
  loadState();
  wireEvents();
  render();
  registerSW();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
