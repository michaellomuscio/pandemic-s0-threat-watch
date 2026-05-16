/* ============================================================
   OPERATION: THREAT WATCH — app logic
   Mobile-first Pandemic Legacy: Season 0 Threat Deck tracker
   No build step, no dependencies. State persists in localStorage.
   ============================================================ */

'use strict';

// ----- City data (the 48 base Threat Deck cities) -----
// Extracted from the actual board photo. Affiliations confirmed against legend (14 NATO / 20 UN / 14 SSR).
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

// ----- Persistent state -----
const STORAGE_KEY = 'threat-watch.v1';
const HISTORY_LIMIT = 30;

const defaultState = () => ({
  cards: Object.fromEntries(CITIES.map(c => [c.id, { zone: 'deck' }])),
  drawCount: 0,
  incidentCount: 0,
  peekStratum: 0,
});

let state = defaultState();
let history = []; // [{ snapshot }] — bounded undo log
const filters = { faction: 'all', region: 'all', search: '' };

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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.cards) return false;
    // Merge with defaults to handle schema additions
    const fresh = defaultState();
    Object.assign(fresh, parsed);
    // Ensure every known city is represented; fill any new ones as 'deck'
    CITIES.forEach(c => {
      if (!fresh.cards[c.id]) fresh.cards[c.id] = { zone: 'deck' };
    });
    state = fresh;
    return true;
  } catch (e) {
    console.warn('Could not load state:', e);
    return false;
  }
}

function snapshot() {
  return JSON.parse(JSON.stringify(state));
}

function pushHistory() {
  history.push(snapshot());
  if (history.length > HISTORY_LIMIT) history.shift();
  updateUndoButton();
}

function updateUndoButton() {
  const btn = document.getElementById('undo-btn');
  if (btn) btn.disabled = history.length === 0;
}

// ----- Actions -----
function drawCard(cityId) {
  const card = state.cards[cityId];
  if (!card) return;
  pushHistory();
  state.drawCount += 1;
  card.zone = 'discard';
  card.drawOrder = state.drawCount;
  card.drawnAt = Date.now();
  delete card.peekStratum;
  saveState();
  render();
  toast(`Drawn: ${CITY_BY_ID[cityId].name}`);
}

function returnToDeck(cityId) {
  const card = state.cards[cityId];
  if (!card) return;
  pushHistory();
  card.zone = 'deck';
  delete card.drawOrder;
  delete card.drawnAt;
  delete card.peekStratum;
  saveState();
  render();
}

function removeCard(cityId) {
  const card = state.cards[cityId];
  if (!card) return;
  pushHistory();
  card.zone = 'removed';
  delete card.peekStratum;
  saveState();
  render();
  toast(`Removed: ${CITY_BY_ID[cityId].name}`, 'warning');
}

function incident() {
  // Move all discard → peek with the new stratum
  const discardIds = CITIES.filter(c => state.cards[c.id].zone === 'discard').map(c => c.id);
  if (discardIds.length === 0) {
    toast('Nothing in the discard pile yet.', 'warning');
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
  saveState();
  render();
  toast(`INCIDENT #${state.incidentCount} — ${discardIds.length} card${discardIds.length === 1 ? '' : 's'} reshuffled on top`, 'warning');
}

function undo() {
  if (history.length === 0) return;
  state = history.pop();
  saveState();
  render();
  toast('Last action undone');
}

function resetGame() {
  if (!confirm('Start a new game? This clears the current tracker (saved state will be erased).')) return;
  history = [];
  state = defaultState();
  saveState();
  render();
  toast('New game started');
}

// ----- Rendering -----
function render() {
  renderCounts();
  renderPeekZone();
  renderDeckZone();
  renderDiscardZone();
  renderRemovedZone();
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

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
}

function renderPeekZone() {
  const grid = document.getElementById('peek-grid');
  if (!grid) return;
  const peekCards = CITIES.filter(c => state.cards[c.id].zone === 'peek');
  if (peekCards.length === 0) {
    grid.innerHTML = '<div class="empty-state">No active intel. After an Incident, reshuffled cards will appear here.</div>';
    return;
  }
  grid.innerHTML = '';
  // Sort by stratum descending (newest on top), then alphabetical
  const sorted = peekCards.slice().sort((a, b) => {
    const sa = state.cards[a.id].peekStratum || 0;
    const sb = state.cards[b.id].peekStratum || 0;
    if (sa !== sb) return sb - sa;
    return a.name.localeCompare(b.name);
  });
  let currentStratum = null;
  sorted.forEach(city => {
    const stratum = state.cards[city.id].peekStratum;
    if (stratum !== currentStratum) {
      currentStratum = stratum;
      const peerCount = sorted.filter(c => state.cards[c.id].peekStratum === stratum).length;
      const divider = document.createElement('div');
      divider.className = 'stratum-divider';
      divider.textContent = `INCIDENT #${stratum} · ${peerCount} card${peerCount === 1 ? '' : 's'}`;
      grid.appendChild(divider);
    }
    grid.appendChild(makeCard(city, 'peek', { badge: `#${stratum}` }));
  });
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
      // Group by region, then alphabetical
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
  // Most-recent first
  discardCards.sort((a, b) => (state.cards[b.id].drawOrder || 0) - (state.cards[a.id].drawOrder || 0));
  grid.innerHTML = '';
  discardCards.forEach(city => {
    grid.appendChild(makeCard(city, 'discard', { badge: `#${state.cards[city.id].drawOrder}` }));
  });
}

function renderRemovedZone() {
  const grid = document.getElementById('removed-grid');
  if (!grid) return;
  const removedCards = CITIES.filter(c => state.cards[c.id].zone === 'removed');
  if (removedCards.length === 0) {
    grid.innerHTML = '<div class="empty-state">Nothing removed.</div>';
    return;
  }
  grid.innerHTML = '';
  removedCards.forEach(city => grid.appendChild(makeCard(city, 'removed')));
}

const REGION_ORDER = ['na', 'sa', 'europe', 'africa', 'asia', 'pacific'];

function makeCard(city, zone, opts = {}) {
  const btn = document.createElement('button');
  btn.className = `card card-region-${city.region} card-faction-${city.faction} card-zone-${zone}`;
  btn.type = 'button';
  btn.dataset.cityId = city.id;
  btn.setAttribute('aria-label', `${city.name} — ${factionLabel(city.faction)} — ${regionLabel(city.region)} — currently ${zoneLabel(zone)}`);
  btn.innerHTML = `
    <div class="card-top">
      <span class="card-faction-icon" aria-hidden="true"></span>
      <span class="card-dots" aria-hidden="true"><span></span><span></span><span></span></span>
    </div>
    <div class="card-name">${escapeHtml(city.name)}</div>
    ${opts.badge ? `<span class="card-badge">${escapeHtml(opts.badge)}</span>` : ''}
  `;
  attachCardHandlers(btn, city, zone);
  return btn;
}

function attachCardHandlers(btn, city, zone) {
  let longPressTimer = null;
  let didLongPress = false;

  const startPress = () => {
    didLongPress = false;
    longPressTimer = setTimeout(() => {
      didLongPress = true;
      if (zone === 'removed') {
        // Long-pressing a removed card just returns it
        return;
      }
      if (confirm(`Remove "${city.name}" from the deck? (Legacy event)`)) {
        removeCard(city.id);
      }
    }, 650);
  };

  const cancelPress = () => {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  };

  btn.addEventListener('pointerdown', startPress);
  btn.addEventListener('pointerup', cancelPress);
  btn.addEventListener('pointercancel', cancelPress);
  btn.addEventListener('pointerleave', cancelPress);

  btn.addEventListener('click', (ev) => {
    if (didLongPress) {
      ev.preventDefault();
      return;
    }
    handleCardTap(city.id, zone);
  });

  // Prevent context menu on long-press (mobile)
  btn.addEventListener('contextmenu', ev => ev.preventDefault());
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

function factionLabel(f) {
  return { nato: 'NATO/Allied', un: 'UN/Neutral', ssr: 'SSR/Soviet' }[f] || f;
}

function regionLabel(r) {
  return {
    na: 'North America',
    sa: 'South America',
    europe: 'Europe',
    africa: 'Africa',
    asia: 'Asia',
    pacific: 'Pacific Rim',
  }[r] || r;
}

function zoneLabel(z) {
  return { deck: 'in deck', peek: 'on top of deck', discard: 'in discard', removed: 'removed' }[z] || z;
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
  toastTimer = setTimeout(() => el.classList.remove('toast-show'), 2200);
}

// ----- Event wiring -----
function wireEvents() {
  document.getElementById('incident-btn').addEventListener('click', incident);
  document.getElementById('undo-btn').addEventListener('click', undo);
  document.getElementById('reset-btn').addEventListener('click', resetGame);

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

  // Keyboard shortcuts: Z = undo, I = incident
  document.addEventListener('keydown', (ev) => {
    if (ev.target.matches('input, textarea')) return;
    if (ev.key === 'z' || ev.key === 'Z') { undo(); }
    if (ev.key === 'i' || ev.key === 'I') { incident(); }
  });
}

// ----- Bootstrap -----
function init() {
  loadState();
  wireEvents();
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
