# Local Galactic Neighborhood — User Guide

A complete reference for all three viewers and the worldbuilding system.

---

## Contents

1. [Galactic Neighborhood Map](#1-galactic-neighborhood-map)
2. [Solar System Viewer](#2-solar-system-viewer)
3. [Exoplanet System Viewer](#3-exoplanet-system-viewer)
4. [Worldbuilding Panel](#4-worldbuilding-panel)
5. [Quick Reference](#5-quick-reference)

---

## 1. Galactic Neighborhood Map

The main view. Every catalogued star within 120 light years of Sol rendered in true galactic coordinates. One scene unit equals one light year.

### Navigation

| Input | Action |
|-------|--------|
| **Left-drag** | Orbit the view around the scene centre |
| **Right-drag** | Pan (shift the camera's focus point) |
| **Scroll wheel** | Zoom in and out |
| **Click** | Select a star and open its detail panel |
| **Double-click** | Fly the camera focus to that star |
| **Touch drag** | Orbit (mobile/tablet) |
| **Pinch** | Zoom (mobile/tablet) |

The camera always points toward a focus point. Left-dragging orbits around that point. If you get lost, double-clicking Sol re-centres the view.

---

### The Star Field

Stars are rendered in two layers:

**Core** — a sharp point whose size reflects absolute magnitude. Brighter stars appear larger.

**Glow ring** — a soft halo whose colour reflects spectral type. This can be toggled off in the Filters panel to improve performance on older hardware.

**Spectral colour coding:**

| Colour | Type | What it means |
|--------|------|---------------|
| Blue-violet | O/B | Massive, extremely hot, short-lived giant stars |
| Blue-white | A | Hot, luminous — Sirius, Vega, Altair |
| White | F | Slightly hotter than the Sun |
| Yellow | G | Sun-like — the most interesting for habitability |
| Orange | K | Slightly cooler than the Sun, long-lived |
| Red | M | Red dwarfs — the most common star in the galaxy |
| Blue-grey | D | White dwarfs — stellar remnants |

**Planet indicators** — stars with confirmed exoplanets in the NASA Exoplanet Archive show a small green ring around them. This requires the exoplanet catalog to be installed (`sudo bash update-exoplanets.sh`).

---

### Panels and Controls

All panels are fixed to the edges of the screen. On smaller screens they scale down automatically.

#### Spectral Types Panel (top-left)

Toggle star classes on and off. M-class red dwarfs are off by default — there are thousands of them and they add visual clutter without contributing much at the full 120 ly scale. Enable them to see just how crowded the local neighbourhood really is.

#### Filters & Display Panel (below Spectral Types)

**Max Distance** — limits the stars shown to within N light years of Sol. Pulling this down to 20–30 ly makes nearby systems much easier to distinguish and dramatically improves performance on Pi 3B+.

**Max Visual Magnitude** — filters stars by apparent brightness. Lowering this shows only the stars visible to the naked eye from Earth.

**Name Labels** — toggles the text labels on named stars.

**Star Glow** — toggles the spectral glow rings. Disabling this roughly doubles frame rate on Pi 3B+.

**Galactic Grid** — toggles the reference rings (at 30, 60, 90, and 120 ly) and the boundary sphere.

#### Navigation Panel (bottom-right)

A quick control reference. Always visible.

#### Status Bar (bottom-centre)

Shows the active star catalog and star count. Will read "EMBEDDED CATALOG — 133 stars" until the full AT-HYG catalog loads, then switches to "AT-HYG v3.2 — 2,537 stars" (or similar).

---

### Search

The search bar sits below the top header. Type any of the following to search:

- **Proper name** — `Sirius`, `Vega`, `Proxima Centauri`, `Ran`
- **HIP number** — `HIP 70890`
- **HD number** — `HD 22049`
- **Bayer designation** — `alp Cen`, `eps Eri`

Results appear as a dropdown. Use **↑ / ↓** arrow keys to navigate, **Enter** to fly to the selected star, **Escape** to dismiss.

The camera smoothly flies to the selected star and opens its detail panel.

---

### Star Detail Panel

Click any star to open its detail panel on the right side of the screen. It shows:

- **Name and also-known-as** — official IAU name plus common alternatives
- **Catalog IDs** — HIP, HD, HR, and Gliese numbers where available
- **Distance** — in light years and parsecs
- **Spectral type** — e.g. G2V (the Sun's type)
- **Apparent and absolute magnitude**
- **Color index (B-V)** — a precise measure of stellar temperature
- **Galactic XYZ coordinates** — in light years from Sol

Below the data, up to three action buttons may appear:

**⬡ Wikipedia** — opens the star's Wikipedia article in a new tab. Available for all named stars.

**☀ Open Solar System** — appears only on Sol. Opens the Solar System Viewer.

**⬡ View N Planets** — appears on stars with confirmed exoplanets. Opens the Exoplanet System Viewer for that system.

**✎ Worldbuilding Notes** — appears on every star. Opens the Worldbuilding Panel.

---

### Sol

Sol (our Sun) is rendered as an amber pulsing sphere at the origin of the scene. It has a larger invisible hit zone than other stars, making it easy to click even when zoomed out. Sol does not appear in the live AT-HYG catalog (its distance is 0) but remains always clickable through its dedicated mesh.

---

## 2. Solar System Viewer

Opens when you click **☀ Open Solar System** on Sol's detail panel. Renders all eight planets with real Keplerian orbital mechanics, major moons, Saturn's rings, and the asteroid belt in a new browser tab.

### Navigation

Same controls as the galactic map: left-drag to orbit, right-drag to pan, scroll to zoom. The scene starts with a view showing all eight planets. Zoom into any planet to see its moons appear.

**1 scene unit = 1 AU** (astronomical unit, ~150 million km).

### Time Controls

The control bar at the bottom of the screen manages the simulation time.

**⏸ / ▶ Play/Pause** — freezes orbital motion. Use this when you want to click fast-moving inner planets or examine a specific configuration.

**Speed slider** — controls how many simulated days pass per real second. The range spans from very slow (0.01 days/sec — useful for watching inner planets closely) to very fast (1,000 days/sec — lets outer planets visibly move).

**Date picker** — click to open a calendar and jump to any date from 1600 to 2200. When you pick a date, the simulation pauses automatically so you can examine that exact planetary alignment. The display shows the current simulated date during playback.

**↺ Reset** — returns to today's actual date.

### Planets and Orbits

Orbital paths are displayed as faint coloured ellipses. They use real orbital elements (semi-major axis, eccentricity, inclination) from NASA JPL. Planetary positions are computed using Kepler's equation iterated to convergence — accurate to within a degree for most purposes across the supported date range.

Planet sizes are logarithmically scaled for visibility — they are not to scale with orbital distances. Inner rocky planets are boosted further so they remain visible alongside the gas giants.

**The asteroid belt** is represented by ~1,800 points distributed between 2.2 and 3.5 AU.

### Moons

Seven major moons are modelled: **Moon** (Earth), **Io, Europa, Ganymede, Callisto** (Jupiter), **Titan** (Saturn), **Triton** (Neptune).

Moons use a scaled orbital radius based on their parent planet's visual sphere, so they are always visibly separated from the planet. The innermost moon always orbits at approximately 2.4× the planet's visual radius. Relative moon spacings (e.g. the Galilean moon ratios) are preserved.

Moons and their labels appear only when the camera is close enough to their parent planet. Zoom into Jupiter to see the Galilean moons appear and orbit.

**Saturn's rings** are rendered as a semi-transparent disc with a 27° axial tilt.

### Clicking Bodies

Click any planet, moon, or the Sun to open the detail panel on the right side of the screen. It shows physical data, orbital parameters, and a Wikipedia link. **Pause the simulation first** if you want to click fast-moving inner planets — Mercury and Venus move quickly at higher simulation speeds.

---

## 3. Exoplanet System Viewer

Opens in a new tab when you click **⬡ View N Planets** on a host star's detail panel in the galactic map. Requires the exoplanet catalog to be installed.

### What It Shows

The viewer fetches the NASA Exoplanet Archive data for the selected system and renders all confirmed planets with Kepler orbits. The host star sits at the centre.

**Orbits** are at true AU scale — the distances between orbits are accurate. **Body sizes** (star and planets) are magnified for visibility, with the star scaled to 18% of the innermost orbit so it never swallows close-in planets.

The header shows the system name, number of confirmed planets, and distance from Sol.

### Navigation

Same controls as the other viewers.

### Time Controls

**⏸ / ▶ Play/Pause** — pauses orbital motion. Essential for clicking fast-moving hot Jupiters.

**Speed slider** — 0.1 to 50 simulated days per real second.

Hot Jupiters (planets with periods of 2–5 days) move very fast at the default speed. Slow the slider down or pause before trying to click them.

### Planet Detail Panel

Click any planet to see its data:
- **Type** — Earth-sized / Super-Earth / Neptune-like / Gas Giant
- **Orbit** — semi-major axis in AU
- **Period** — orbital period in days or years
- **Radius** — in Earth radii (R⊕), if measured
- **Mass** — in Earth masses (M⊕), if measured
- **Equilibrium temperature** — estimated surface temperature in Kelvin
- **Discovery** — method and year of discovery
- **⬡ Wikipedia** — links to the planet's Wikipedia article if one exists

If a field shows `—` the NASA archive does not have a measured value for that parameter — this is common for planets discovered by radial velocity where radius isn't directly measurable.

### System Matching

The viewer is linked to the galactic map by HIP catalog number (primary) and HD number (fallback). This means the match is unambiguous regardless of how NASA abbreviates the host star name versus how HYG spells the full name.

---

## 4. Worldbuilding Panel

Designed for fiction writers building a universe set in the local galactic neighbourhood. Click **✎ Worldbuilding Notes** on any star's detail panel to open it.

The panel requires the Worldbuilding API to be running (`sudo bash ~/starmap/api/install-api.sh`). If the API is not running, save operations will show an error and data will not persist.

The panel has three tabs.

---

### Tab 1 — Star

Records your fictional annotations for the selected star. Changes to real astronomical data (distance, spectral type, etc.) are made here as overrides — the real data from HYG is never modified.

**Fictional Name** — the name this star has in your universe. Displayed in the worldbuilding panel but does not change the star's label in the 3D map.

**Common Name** — what characters in your story actually call it day-to-day (may differ from the official name).

**Significance** — a five-level flag for how important this system is to your story:
- *None* — background detail, mentioned in passing
- *Minor* — visited or referenced but not central
- *Major* — a significant location with plot relevance
- *Critical* — a key system where important events occur
- *Homeworld* — the origin system of a civilization or major faction

**First Contact / Discovery Era** — which era in your timeline this system was first encountered. Select from eras you've created in the Universe tab. To add a new era without leaving this tab, click **+ new era** next to the label — an inline form expands below the dropdown. Fill in the era name, start and end descriptions (free text — use whatever dating system your story uses), pick a colour for UI coding, and click **Add Era**. The dropdown refreshes immediately.

**Plot Notes** — freeform text for lore, descriptions, draft passages, and anything else you want to record about this system. No length limit.

**Internal Notes** — private reminders and TODOs that are separate from plot-facing content. Useful for tracking what you still need to write or decide about this system.

**Tags** — attach free-form labels to stars. Type a tag name and press **+** to create and attach it. Tags are shared across all stars — once created, the same tag (e.g. "Book 1", "Battle Site", "Unexplored") can be attached to any number of stars. Click **✕** on a tag to remove it from this star (the tag itself is not deleted).

Click **✓ Save Star Notes** to persist all fields. A brief confirmation appears below the button.

---

### Tab 2 — Universe

Manages the universe-wide entities: eras, civilizations, and factions. These are shared across all stars and must be set up before you can use them in the Star and Factions sections.

#### Eras

Eras are named time periods in your story's timeline. Every other entity can be tagged to one or more eras.

Each era has:
- **Name** — "First Expansion", "The Long Night", "Year Zero"
- **Start and end descriptions** — free text, so you can use in-universe dating ("Age of Sails, Year 1" or "2280 CE") or real-world dates, or leave them vague ("sometime after the Collapse")
- **Colour** — used as a visual indicator throughout the UI

Existing eras are listed at the top with a ✕ delete button. Deleting an era removes it and clears all references to it in system control records.

#### Civilizations

Top-level groupings of species and cultures. A civilization may contain multiple factions (e.g. the "Terran Sphere" civilization contains the "Earth Directorate" and "Mars Free State" factions).

Each civilization has:
- **Name** — "Terran Sphere", "The Vorath Hegemony"
- **Founding species** — the dominant or founding species
- **Homeworld name** — their planet of origin (fictional name)
- **Symbol** — a single character or emoji used as a visual identifier
- **Colour** — used in faction listings and future map overlays

#### Factions

Political, military, or corporate entities that control or contest star systems. Each faction belongs to a civilization (optional) and has a type that describes its government structure.

**Faction types:** Empire, Republic, Corporation, Collective, Theocracy, Alliance, Rogue, Other

Each faction has a name, short name (abbreviation), parent civilization, type, and colour.

#### System Control

At the bottom of the Universe tab, under **SYSTEM CONTROL**, you can record which faction controls the currently selected star system in each era of your story.

One system can have a different controller in every era — useful for tracking territorial changes across your timeline.

Each control record contains:
- **Era** — which time period this record applies to
- **Faction** — who controls the system (leave blank for unclaimed or unknown)
- **Status** — Claimed / Contested / Blockaded / Abandoned / Unknown / Restricted
- **Population** — free text ("~2 billion", "uninhabited", "classified")
- **Military Tier** — 0 (None) through 3 (Fortress installation)
- **Notes** — a brief note about the strategic situation

Existing control records are listed above the add form. Click ✕ on any record to delete it.

---

### Tab 3 — Planets

Records fictional or extended planet data for the selected star's system. You can document planets from the NASA exoplanet catalog (adding fictional names and narrative data) or invent entirely new planets that don't exist in the real catalog.

Each planet card shows its fictional name, world type, size class, atmosphere, orbit distance, mass (if entered), and the first few words of its plot notes.

Click **edit** on a card to load it into the form for changes. Click **✕** to delete (with confirmation).

**Planet fields:**

| Field | Description |
|-------|-------------|
| Fictional Name | The planet's name in your universe |
| Common Name | What characters call it informally |
| Orbit (AU) | Distance from the host star in astronomical units |
| Mass | Free text — "0.8 M⊕", "320 M⊕", "1.2 MJ", "~5 Earth masses" |
| World Type | Rocky / Ocean / Desert / Ice / Gas / Jungle / Toxic / Barren / Artificial / Other |
| Size Class | Moonlet / Small / Earth-like / Super-Earth / Neptune-like / Gas Giant |
| Atmosphere | None / Thin / Breathable / Toxic / Dense / Exotic |
| Temperature | Frozen / Cold / Temperate / Warm / Hot / Infernal |
| Native Life | None / Microbial / Plant / Complex / Sentient |
| Habitable | Whether the planet can support your characters without life support |
| Significance | Same five-level scale as the star significance field |
| Plot Notes | Lore, descriptions, narrative details |

Click **✓ Save Planet** to add or update. Click **Cancel** while editing to discard changes and return to the add form.

---

### Data Persistence

All worldbuilding data is stored in a SQLite database at `/var/www/starmap/data/world.db` on the Pi. This file is:

- **Automatically written** whenever you save in the panel — no manual export needed
- **Not included** in the star catalogs or app files — it is yours alone
- **Backed up** by calling `curl http://<YOUR_PI_IP>/api/world/backup > backup.json` which returns the entire database as a JSON file

**Back up your database before any system updates:**
```bash
cp /var/www/starmap/data/world.db ~/worldbuilding-backup-$(date +%Y%m%d).db
```

---

## 5. Quick Reference

### Keyboard Shortcuts (Galactic Map)

| Key | Action |
|-----|--------|
| Type anywhere | Opens search bar |
| ↑ / ↓ | Navigate search results |
| Enter | Fly to selected search result |
| Escape | Close search results |

### Useful URLs (from your Pi)

| URL | What it opens |
|-----|---------------|
| `http://localhost/` | Galactic neighborhood map |
| `http://localhost/solar-system.html` | Solar system viewer |
| `http://localhost/exoplanet-system.html?host=HOSTNAME` | Exoplanet system (by NASA hostname) |
| `http://localhost/api/world/eras` | List all eras (JSON) |
| `http://localhost/api/world/stars` | List all annotated stars (JSON) |
| `http://localhost/api/world/backup` | Full database backup (JSON) |

### Stars with Confirmed Planets (Good Test Cases)

| Star in the map | Distance | What you'll see |
|----------------|----------|-----------------|
| Proxima Centauri | 1.3 ly | Proxima b (possibly habitable), Proxima d |
| Rigil Kentaurus (Alpha Cen A) | 4.4 ly | Historical candidate systems |
| Barnard's Star | 5.9 ly | Barnard b candidate |
| Ran (Epsilon Eridani) | 10.5 ly | AEgir — a Jupiter-mass planet at 3.5 AU |
| Tau Ceti | 11.9 ly | Multiple super-Earth candidates |
| Ross 128 | 11.0 ly | Ross 128 b — possibly habitable |
| Gliese 876 | 15.3 ly | 4 planets including two gas giants |
| 61 Cygni A | 11.4 ly | Historical first parallax measurement star |
| HD 219134 | 21.6 ly | 6 planets — most in this range |
| 55 Cancri A | 41 ly | 5 planets including a super-Earth |
| Upsilon Andromedae | 44 ly | 3 gas giants |

### Solar System Dates Worth Visiting

| Date | Event |
|------|-------|
| 2020-12-21 | Great Conjunction — Jupiter and Saturn closest in 400 years |
| 1977-09-05 | Voyager 1 launch — planets aligned for Grand Tour |
| 2012-06-06 | Venus transit across the Sun |
| 2003-08-27 | Mars closest approach to Earth in 60,000 years |
| 2061-07-28 | Halley's Comet predicted next perihelion |

### API Quick Reference

All endpoints are at `http://localhost/api/world/` (or `http://<PI_IP>/api/world/`).

```bash
# List all eras
curl http://localhost/api/world/eras

# Add an era
curl -X POST http://localhost/api/world/eras \
  -H "Content-Type: application/json" \
  -d '{"name":"First Expansion","start_desc":"2280 CE","color":"#4488cc"}'

# Get worldbuilding data for a star by HIP number
curl http://localhost/api/world/stars/by_hip/70890    # Proxima Centauri

# Full database backup
curl http://localhost/api/world/backup > backup-$(date +%Y%m%d).json
```

---

## Coordinate System

The galactic map uses the **IAU galactic coordinate frame** at epoch J2000:

- **X axis** → points toward the galactic centre (Sagittarius A*)
- **Y axis** → points toward the galactic north pole (perpendicular to the galactic plane, "up" in the scene)
- **Z axis** → points toward galactic east (completing the right-hand system)
- **Origin** → Sol

All distances are in light years. 1 parsec = 3.26156 light years.

The ecliptic plane in the Solar System Viewer uses the **J2000 ecliptic frame** with the Sun at the origin and 1 scene unit = 1 AU.

---

*Star data: AT-HYG v3.2 — Hipparcos, Yale Bright Star, Gliese, Gaia DR3 catalogs*  
*Exoplanet data: NASA Exoplanet Archive PSCompPars table*  
*Orbital elements: NASA JPL J2000 epoch*  
*Rendering: Three.js r128 WebGL*
