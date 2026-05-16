# Operation: Threat Watch

A mobile-first companion web app for **Pandemic Legacy: Season 0**. Track the Threat Deck across a session — see which cities have been drawn, what's in the discard, and what's about to come up again after each Incident.

**Live app:** [michaellomuscio.github.io/pandemic-s0-threat-watch](https://michaellomuscio.github.io/pandemic-s0-threat-watch/)

## Why this exists

In Pandemic Legacy: Season 0, the Threat Deck is the deck you draw from at the end of each turn to place Soviet surveillance on cities. When an **Incident** triggers, the entire discard pile is shuffled and placed *back on top of the deck* — meaning the cities you've seen this round are the next ones coming up.

Knowing which cities are in that "on top" pile is a huge strategic advantage. The board state is already overloaded with cubes and tokens and protocol cards; flipping through a paper discard pile mid-turn slows everything down. This app keeps the deck state on your phone, with one big red button labelled **INCIDENT**.

## What it does

- All 48 base-game cities visualised the way they look on the board — region pattern, faction symbol (◆ NATO · 🌐 UN · ☭ SSR), city label.
- Three live zones:
  - **On Top of Deck** — cards that just came back from a reshuffle. These come up next. Tap when drawn.
  - **Threat Deck** — face-down cards still unseen. Filter by faction or region, or search by name.
  - **Discard** — cards drawn since the last Incident, newest first.
- One-tap **INCIDENT** button that moves the discard pile onto the "On Top" zone (with a stratum badge per Incident, so successive reshuffles stack correctly).
- **Long-press** a card to remove it from the deck (Pandemic Legacy events sometimes do this permanently).
- **Undo** the last action.
- **New Game** to clear state.
- State persists in `localStorage`, so a refresh or accidental close doesn't lose your tracker.

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

Vanilla HTML / CSS / JS. No framework, no build step, no dependencies, no tracking. The whole thing is three files plus a README — open `index.html` to run it. Served via GitHub Pages.

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
