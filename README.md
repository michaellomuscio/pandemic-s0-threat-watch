# Operation: Threat Watch

A mobile-first companion web app for **Pandemic Legacy: Season 0**. Track the Threat Deck across a session — see which cities have been drawn, what's in the discard, and what's about to come up again after each Incident.

**Live app:** [michaellomuscio.github.io/pandemic-s0-threat-watch](https://michaellomuscio.github.io/pandemic-s0-threat-watch/)

Installable as a PWA on iOS/Android — "Add to Home Screen" gives you an offline app.

## Why this exists

In Pandemic Legacy: Season 0, the Threat Deck is the deck you draw from at the end of each turn to place Soviet surveillance on cities. When an **Incident** triggers, the entire discard pile is shuffled and placed *back on top of the deck* — meaning the cities you've seen this round are the next ones coming up.

Knowing which cities are in that "on top" pile is a huge strategic advantage. The board state is already overloaded with cubes and tokens and protocol cards; flipping through a paper discard pile mid-turn slows everything down. This app keeps the deck state on your phone, with one big red button labelled **INCIDENT**.

## What it does

### The simple flow (default view)
- All 48 base-game cities, styled like the actual board — region pattern, faction icon (◆ NATO · ◯ UN · ★ SSR), city label.
- **Tap a city** → moves it to the Discard pile.
- **Press ⚠ INCIDENT** → the Discard pile reshuffles onto "On Top of Deck."
- **Tap On-Top cards** as they come up — these are the only cards that can come out until the pile is empty.
- **Long-press** a card → opens an inspector with details and actions (adjust surveillance, toggle safehouse, remove from deck).
- **Undo / New Game** buttons in the bottom action bar.
- State persists in `localStorage`. A refresh or accidental close doesn't lose your tracker.

### Power-user features (opt-in, hidden by default)
- **Campaign tracker** — current month (Prologue → December) and threat-level escalation track (2/2/2/3/3/4 draw rate). Toggle on with the small "⊞ Campaign tracker" button up top.
- **Surveillance auto-track** — when ON, drawing a card auto-increments that city's surveillance counter (0–3 dots). Off by default; flip the "Auto-surveillance" checkbox to enable.
- **Filters** — narrow the deck by faction (NATO/UN/SSR) or region. Hidden behind a "⌖ Filters" toggle next to the search bar.
- **Action log** — collapsible history of every action taken this session. Toggle from the bottom-right log chip.
- **Probability + faction summary** — when there are cards "On Top of Deck," each stratum gets a banner showing % chance per card and (for 4+ cards) the faction mix coming up.
- **Stratified Incidents** — each reshuffle gets its own #1/#2/#3 badge so when multiple Incidents stack, you can still see which cards came from which reshuffle.

## How to play with it

1. Open the app on your phone (one phone for the table is enough).
2. When a threat card is drawn, find that city and tap it. It moves to the discard pile.
3. When an Incident triggers, tap the **⚠ INCIDENT** button. Every card in the discard moves to the "On Top of Deck" zone — these are the cities your group can now plan defenses around.
4. As cards come up from the on-top pile, tap them. They move back to discard.
5. When the on-top pile is empty, draws are coming from the rest of the unseen deck again.
6. The next Incident reshuffles the new discard back on top. Older "on top" cards (if any remain) stay below the newest stratum — the badges (`#1`, `#2`, …) make the strata visible.

## Keyboard shortcuts

- `I` — Incident
- `Z` — Undo

## Design notes

The visual language is Cold-War declassified-dossier: navy briefing-room background, manila folder body, red censor stamps, Bebas Neue / Special Elite / IBM Plex Mono. City tiles mirror the actual Pandemic Legacy: Season 0 board art (purple stripes for North America, gold harlequin for Europe, green dots for Africa, salmon waves for Pacific Rim, etc.).

## Tech

Vanilla HTML / CSS / JS. No framework, no build step, no dependencies, no tracking. Three files of source plus a service worker and a manifest for the PWA — open `index.html` to run it locally. Served via GitHub Pages.

The service worker caches the app shell, so once you've opened the app once it works fully offline. Bump the `CACHE_VERSION` in `sw.js` when releasing a new build.

## Future ideas

- Add cards as the campaign progresses (some legacy events introduce new Threat Cards)
- Track surveillance / safehouse state per city
- Multiple save slots per group
- Tablet layout (currently mobile + desktop responsive, but tablet could be tighter)

## Caveats

- This is an unofficial fan tool. **Pandemic Legacy: Season 0** is © Z-Man Games / Asmodee. This project is not affiliated with the publisher and uses no proprietary art.
- The base city list is the 48 cities printed on the board. The campaign adds and removes cards as you play — use the long-press to remove a card from your deck, or just ignore cities you've never added.

## License

MIT — see `LICENSE`.
