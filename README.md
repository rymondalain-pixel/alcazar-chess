# Alcázar Chess — tournament web app

Multi-language (العربية · Français · English, full RTL/LTR, instant switching) web app for the
**Alcázar Chess** club, Selouane, Morocco — hosted at Coffee Nisa. Plain HTML/CSS/JS: no build step,
no dependencies. Works on phones and on Firefox/Chrome (incl. Linux Mint).

## Run it

- **Quickest:** double-click `index.html` (works from a folder, `file://`).
- **Or serve it:** `python3 -m http.server 8080` in this folder → open `http://localhost:8080`.
- **For real use:** upload the folder to any static host (GitHub Pages, Netlify, Cloudflare Pages, your own server).

## First-run logins (demo mode)

| Who | Name | Secret |
|---|---|---|
| Admin | `admin` | `alcazar2026` (**change it in Admin → Settings**) |
| Demo participant | shown on the login page | demo codes `ALC-1001`, `ALC-1038`, … |

The first run seeds 24 demo players (12 + 12). For the real tournament set `DEMO_MODE: false` in
`js/config.js` (or use Admin → Settings → "Delete everything") and add your own players; each gets an
access code you give them after payment.

## Features (all of the spec)

**Public:** landing page with logo, description, participant login (Full name + Access code), discreet "Admin" link.
**Participant (6 sections):** Tournament (6 tables × Groups A & B), Order a drink (Coffee Nisa menu, sugar selector,
strict 1 drink — locked after confirmation), Standings (24 players by points), Past results (filter by round/group/player),
Rules (all four sections, 3 languages), Yellow & red cards (lists with counts and reasons).
**Admin:** players (name, Elo, group A/B ≤ 12 each, access code), **Draw** button, results entry, cards, waiter drink list, settings.

### How the draw works (`js/swiss.js`)
- **Round 1:** Elo-sorted neighbours inside each group (1–2, 3–4 …).
- **Round 2+:** points-based Swiss: leaders vs leaders. A backtracking search finds a pairing with **no rematches whenever one exists**;
  rematches are only used (as few as possible) when unavoidable — e.g. round 12 in a 12-player group, where everyone has already met everyone.
- **Colours:** whoever is "owed" White gets it; opponents with opposite colour needs are preferred; the engine avoids 3 identical colours in a row when it can.
- Table 1 = strongest pairing. Banned players still get paired so their opponent receives the automatic point.

### Results entry
Six tables stacked vertically; **left = White wins, right = Black wins, centre/table = Draw** (tap again to undo; this layout stays
left/right even in Arabic). "Absent" records a forfeit win for the opponent. **Submit round results** (enabled when all 12 are in) updates
Standings and Past results. A submitted round can be re-opened to fix a mistake.

### Scoring & cards
Win 1 · draw ½ · yellow card −1 (applied immediately). **2 yellow cards in the same Sunday session** (rounds 1–3, 4–6, …) ⇒ banned from the
*next* round: the next draw gives the opponent 1 point automatically. Removing a card (Admin → Cards → ↩️) cancels its effects. Red cards are recorded and listed.
Standing ties are broken by opponents' points, then Elo.

### Drinks
One drink per player per **ordering round**. Admin → Drink orders shows the summary ("3 × Espresso — Medium sugar"), the per-player list with table numbers,
and **Copy** / **Download .txt** in Arabic, French or English for the waiter. "Open new ordering round" lets everyone order again (e.g. each Sunday).
The menu is editable in Settings.

## Live updates between phones (Firebase / Supabase)

By default (`BACKEND: 'local'`) data lives in the browser's localStorage: tabs of the *same* browser sync live, but phones don't share data.
For real multi-device live updates, set `BACKEND` in `js/config.js`:

**Firebase** — create a Realtime Database, then fill `AC.config.firebase.config` (+ `path`) and set `BACKEND: 'firebase'`.
**Supabase** — create the table below, fill `AC.config.supabase.url / anonKey`, enable Realtime on the table, set `BACKEND: 'supabase'`:

```sql
create table tournament_state (id int primary key, data jsonb not null, updated_at timestamptz default now());
alter publication supabase_realtime add table tournament_state;
```

Both adapters live in `js/sync.js` behind the same 3-method interface (`load`, `save`, `subscribe`).

## Important caveats (please read)

1. **The Firebase/Supabase adapters are written but not tested against a live project** — I had no credentials. The local mode, pairing engine and every screen were tested.
2. **Security:** the whole tournament is one shared document and the admin login is checked in the browser. That is fine for a friendly club event, but anyone who
   inspects the page's network traffic could read access codes or write data. For a harder setup: put the admin behind real auth (Supabase Auth / Firebase Auth),
   store players/codes in a private table, and use security rules / row-level security so participants can only *read* public data and only the admin can write.
3. Last-write-wins: if two admins save at the same instant, the later save wins. Use one admin device during results entry.
4. If a group has an odd number of active players, one player gets a bye worth `BYE_POINTS` (default 1; see `config.js`) — your rules don't cover this, so adjust as you wish.

## Code map

```
index.html            page shell (plain <script> tags, works from file://)
css/styles.css        mobile-first styles, CSS logical properties for RTL/LTR
assets/logo.svg       club emblem
js/config.js          settings (backend, demo mode, format)
js/i18n.js            AR / FR / EN dictionary + RTL switching (rules text lives here)
js/calc.js            scoring, standings, suspension rules (pure functions)
js/swiss.js           Swiss pairing engine (pure functions)
js/sync.js            storage adapters: local / Firebase / Supabase
js/store.js           state + all actions (add player, draw, results, cards, orders…)
js/ui.js              small DOM helpers (toast, modal, clipboard, download)
js/views-public.js    landing + admin login
js/views-participant.js  welcome dashboard + the 6 sections
js/views-admin.js     admin panel
js/app.js             router, session, header, render loop
```
