# Local Galactic Neighborhood — User Guide

**Version 0.9.6** · A complete reference for all features.

---

## Contents

1. [Galactic Neighborhood Map](#1-galactic-neighborhood-map)
2. [Exoplanet System Viewer](#2-exoplanet-system-viewer)
3. [Solar System Viewer](#3-solar-system-viewer)
4. [Worldbuilding Panel — Star Tab](#4-worldbuilding-panel--star-tab)
5. [Worldbuilding Panel — Planets Tab](#5-worldbuilding-panel--planets-tab)
6. [Worldbuilding Panel — Universe Tab](#6-worldbuilding-panel--universe-tab)
7. [Planet Rings & Indicators](#7-planet-rings--indicators)
8. [Habitable Zone](#8-habitable-zone)
9. [Data & Catalogs](#9-data--catalogs)
10. [Keyboard & Controls Reference](#10-keyboard--controls-reference)

---

## 1. Galactic Neighborhood Map

The main view. Every catalogued star within 120 light years of Sol rendered in true galactic coordinates using real HYG catalog data.

### Navigation

| Input | Action |
|---|---|
| Left-drag | Orbit the view |
| Right-drag | Pan (shift focus point) |
| Scroll wheel | Zoom in/out |
| Click | Select star → open detail panel |
| Double-click | Fly camera to that star |

### Menu Panel (☰ top-left)

- **Spectral Types** — toggle star types O/B, A, F, G, K, M, D on/off
- **Filters & Display** — max distance slider (10–120 ly), max visual magnitude, name labels, star glow, galactic grid, auto-rotate
- **Navigation** — control reference

### Star Detail Panel (`#dp`, top-right)

Appears when you click a star. Shows:
- Star name and alternate names
- Catalog IDs (HIP, HD, HR, GL, Bayer-Flamsteed)
- Distance (ly and pc)
- Spectral type, apparent/absolute magnitude, color index
- Galactic XYZ coordinates
- Wikipedia link (when available)
- **⬡ View Planetary System** — opens exoplanet viewer (appears for stars with NASA or user-created planets)
- **☀ Solar System** — opens solar system viewer (Sol only)
- **✎ Worldbuilding** — opens the worldbuilding panel

### Search Bar (bottom-center)

Type any star name, designation, or catalog number. Results dropdown opens upward. Click a result to fly to that star.

### Planet Rings

Colored rings appear around stars with planets:
- **Green ring** — confirmed NASA exoplanets
- **Blue ring** — user-created planets only (no NASA data)
- **Green ring** — both NASA and user planets (green always wins)

Rings update live when you add or import planets in the worldbuilding panel.

---

## 2. Exoplanet System Viewer

Opens in a new tab when you click **⬡ View Planetary System**. Shows confirmed exoplanets (and user-created planets) orbiting their host star in 3D with Keplerian orbital mechanics.

### Navigation

Same controls as the main map: left-drag to orbit, right-drag to pan, scroll to zoom.

### Playback Controls (bottom-center)

- **⏸ / ▶** — pause/resume orbital animation
- **Speed slider** — simulation speed in days/second (0.1× to 50×)

### Clicking Objects

**Click the host star:**
- Detail panel shows: Distance, Spectral type, Abs Mag, Luminosity, Habitable Zone, planet count
- **✎ System Notes** opens the WB panel on the Star tab

**Click a planet:**
- Detail panel shows: Type, Orbit (AU), Period, Radius, Mass, Eq. Temperature, Discovery method/year
- NASA planets show a Wikipedia link
- User-created planets show **✎ User Created** badge
- **✎ Notes** opens the WB panel on the Planets tab

### Habitable Zone

A faint green band renders in the orbital plane showing the conservative habitable zone (Kopparapu 2013 limits). Luminosity is derived from the star's absolute magnitude with bolometric corrections by spectral type.

---

## 3. Solar System Viewer

Opens from the Sol detail panel. Shows the 8 planets of our solar system with accurate orbital periods. Same navigation controls. Click any planet for its detail panel.

---

## 4. Worldbuilding Panel — Star Tab

The WB panel opens from the **✎ Worldbuilding** button in the star detail panel. It has three tabs: **Star**, **Planets**, **Universe**.

### HYG Catalog Box

Read-only reference data pulled from the star catalog:
- Spectral type, distance, absolute magnitude, luminosity
- HIP / HD catalog numbers
- **Habitable Zone** (AU range, calculated from luminosity)

### Star Fields

| Field | Description |
|---|---|
| Fictional Name | Your worldbuilding name for this star |
| Common Name | Short colloquial name |
| Significance | NONE / MINOR / MAJOR / CRITICAL |
| First Contact Era | Dropdown of eras you've defined in Universe tab |
| Plot Notes | Free-text narrative notes |
| Internal Notes | GM/author notes (hidden from players) |

### Tags

Add color-coded tags to classify stars (e.g. "Explored", "Hostile", "Trade Route"). Tags appear on the star card.

### Era Control

Record which faction controls this system and when. Links to eras and factions defined in the Universe tab.

### Saving

Click **✓ Save Star**. A green checkmark confirms the save. The star record is created automatically — you don't need to save the star before adding planets.

---

## 5. Worldbuilding Panel — Planets Tab

### NASA Catalog Section

For stars with confirmed exoplanets, a **⬡ NASA CATALOG** section appears at the top showing each confirmed planet with:
- Size class (auto-derived from radius)
- Temperature zone, orbit in AU, mass, radius
- **★ Hab candidate** badge (if in habitable zone)
- Discovery method and year
- **Import** button — imports this planet into your worldbuilding database
- **Import All** button — imports all planets at once

Once imported, a planet moves to the **YOUR PLANETS** section and can be fully edited.

### Your Planets Section

Shows all planets you've created or imported. Each card displays:
- Fictional name (and NASA name if imported)
- World type, size class, atmosphere
- Orbit, period, eccentricity
- Radius and mass

### Adding / Editing a Planet

**Physical Properties:**
| Field | Description |
|---|---|
| Radius (R⊕) | Planet radius in Earth radii |
| Mass (M⊕) | Planet mass in Earth masses |
| Size Class | **Auto-derived from radius** — read only |
| Mass desc | Auto-fills from mass field (can override) |

**Size Class thresholds:**
| Radius | Class |
|---|---|
| < 0.5 R⊕ | Moonlet |
| 0.5 – 1.25 | Small |
| 1.25 – 1.7 | Earth-like |
| 1.7 – 3.5 | Super-Earth |
| 3.5 – 10 | Neptune-like |
| > 10 | Gas Giant |

**Orbital Elements** (used by exoplanet viewer):
| Field | Description |
|---|---|
| Orbit (AU) | Semi-major axis |
| Period (days) | Orbital period |
| Eccentricity | 0 = circular, max 0.99 |
| Inclination (°) | Orbital inclination |
| Arg. Periastron (°) | Argument of periapsis |

**Worldbuilding:**
World Type, Atmosphere, Temperature, Native Life, Habitable (Yes/No), Significance, Plot Notes

### User-Created Planets in the Exo Viewer

After saving a planet, click **⬡ View Planetary System** from the star detail panel. Your planet will appear as an orbiting body. If you've given it a fictional name, that name shows as the label. The detail panel shows **✎ User Created**.

---

## 6. Worldbuilding Panel — Universe Tab

Define the meta-structure of your fictional universe.

### Eras

Time periods in your universe's history (e.g. "First Expansion", "The Collapse", "Rebuilding"). Eras are used to timestamp first contact and control records.

### Civilizations

Spacefaring species/nations. Each has a name, species, homeworld, color, and symbol. Civilizations group factions.

### Factions

Political/military entities that control star systems. Each faction belongs to a civilization and has a type (Empire, Republic, Corporation, etc.).

---

## 7. Planet Rings & Indicators

The main map shows colored rings around stars with planets:

| Ring Color | Meaning |
|---|---|
| **Green** | Confirmed NASA exoplanets (with or without user planets) |
| **Blue** | User-created planets only |

Rings appear automatically when:
- The NASA exoplanet catalog is installed (`update-exoplanets.sh`)
- You save or import a planet in the WB panel

The **⬡ View Planetary System** button in the detail panel appears for any star with a green or blue ring.

---

## 8. Habitable Zone

Displayed in two places:

**WB Panel — Star Tab (HYG box):** Shows the AU range calculated from luminosity.

**Exoplanet Viewer:** A faint green band renders in the orbital plane.

**Calculation method:**
- Luminosity derived from absolute magnitude: `L = 10^((4.83 - absmag_bol) / 2.5)`
- Bolometric correction applied by spectral type (M dwarfs emit mostly infrared — visual magnitude understates their total luminosity)
- Inner edge: `sqrt(L / 1.1)` AU
- Outer edge: `sqrt(L / 0.53)` AU
- Based on Kopparapu et al. (2013) conservative limits

**Expected hab zones for nearby stars:**
| Star | Spectral | Hab Zone |
|---|---|---|
| Sol | G2V | 0.95 – 1.37 AU |
| Tau Ceti | G8V | 0.63 – 0.93 AU |
| Epsilon Eridani | K2V | 0.51 – 0.73 AU |
| GJ 411 (Lalande 21185) | M2V | 0.14 – 0.20 AU |
| Ross 128 | M4.5V | 0.04 – 0.06 AU |
| Proxima Centauri | M5.5V | 0.03 – 0.04 AU |

---

## 9. Data & Catalogs

### Star Catalog
- **Source:** AT-HYG v3.2 (Hipparcos + Yale Bright Star + Gliese merged)
- **Coverage:** ~4,500 stars within 120 ly of Sol
- **Update:** `sudo bash update-catalog.sh`
- **Fallback:** 133-star embedded catalog (loads if CSV not found)

### Exoplanet Catalog
- **Source:** NASA Exoplanet Archive (TAP API, PSCompPars table)
- **Coverage:** All confirmed planets within 37 parsecs (~120 ly)
- **Update:** `sudo bash update-exoplanets.sh`
- **Matching:** HIP number → HD number → hostname (in priority order)

### Worldbuilding Database
- **Location:** `/var/www/starmap/data/world.db` (SQLite)
- **Backup:** `curl http://localhost/api/world/backup > backup.json`

---

## 5. Moon Viewer

Opened from two entry points — clicking **⬡ View Moon System** on a planet in the exoplanet viewer, or **⬡ View N Moons** on a planet in the solar system viewer. Renders known catalog moons and user-created moons orbiting their parent planet in 3D with Keplerian orbital mechanics.

### Navigation

Same controls as all other viewers: left-drag to orbit, right-drag to pan, scroll to zoom.

### Playback Controls

Play/pause and speed slider work identically to the exoplanet viewer (days per second).

### Clicking Objects

**Click the planet** (center body):
- Detail panel shows Type, Diameter, Orbit, Period, Moon count

**Click a moon:**
- Detail panel shows Type, Orbit (in planet radii and km), Period, Radius, Atmosphere
- Known catalog moons show a Wikipedia link
- User-created moons show **✎ User Created** badge and a **✎ Worldbuilding Notes** button

### Known Moon Catalog

The following solar system moons are embedded and render automatically:

| Planet | Moons |
|---|---|
| Earth | Moon |
| Mars | Phobos, Deimos |
| Jupiter | Io, Europa, Ganymede, Callisto |
| Saturn | Mimas, Enceladus, Tethys, Dione, Rhea, Titan, Iapetus |
| Uranus | Miranda, Ariel, Umbriel, Titania, Oberon |
| Neptune | Proteus, Triton, Nereid |

For exoplanet systems there are no confirmed moons — the viewer will show a message prompting you to add moons via the Worldbuilding panel.

### Scale

1 scene unit = the semi-major axis of the innermost moon. Orbits are shown in **planet radii (Rp)**. Moon sizes are magnified relative to their orbits to be visible.

### Back Button

Returns to the previous viewer, or closes the tab if opened fresh.

---

## 6. Worldbuilding Panel — Moons Tab

The WB panel inside any viewer now has a fourth tab: **Star · Universe · Planets · Moons**.

### Activating the Moons Tab

Go to the **Planets tab** → find a saved planet card → click the **🌙** button. This switches to the Moons tab and sets the planet context.

### Moon Context Bar

Shows which planet's moons you are currently managing. Always visible at the top of the Moons tab.

### Adding a Moon

Click **+ Add Moon** to open the form:

| Field | Description |
|---|---|
| Fictional Name | Your worldbuilding name |
| Common Name | Short colloquial name |
| Orbit (Rp) | Semi-major axis in parent planet radii |
| Period (days) | Orbital period |
| Eccentricity | 0 = circular |
| Inclination (°) | Orbital inclination |
| Radius (km) | Moon radius in kilometres |
| World Type | Rocky, Ice, Ocean, Desert, Toxic, Artificial, Other |
| Atmosphere | None, Thin, Breathable, Toxic, Dense, Exotic |
| Significance | None / Minor / Major / Critical |
| Plot Notes | Narrative notes |

**Orbit units — Rp (planet radii):** If adding a moon to an Earth-sized planet (6,371 km radius), an orbit of `10 Rp` = 63,710 km. For reference, Earth's Moon orbits at ~60 Rp.

### Moon Cards

Each saved moon shows as a card with name, world type, atmosphere, orbit, period, radius, and plot notes excerpt. Cards have **edit** and **✕** (delete) buttons.

### Moons in the Moon Viewer

After saving moons via the WB panel, open the moon viewer for that planet — user-created moons appear as orbiting bodies alongside any known catalog moons.

---

## 10. Keyboard & Controls Reference

### Main Map
| Action | Control |
|---|---|
| Orbit | Left-drag |
| Pan | Right-drag |
| Zoom | Scroll wheel |
| Select star | Click |
| Focus star | Double-click |
| Search | Type in bottom search bar |
| Open menu | ☰ button (top-left) |
| Close detail | ✕ on panel |
| Close WB panel | ✕ on WB panel |

### Exoplanet Viewer
| Action | Control |
|---|---|
| Orbit | Left-drag |
| Pan | Right-drag |
| Zoom | Scroll wheel |
| Select object | Click |
| Play/Pause | ⏸/▶ button |
| Change speed | Speed slider |
| Back to map | ← Back button |
| Open WB panel | ✎ button in detail panel |

### Worldbuilding Panel
| Action | Description |
|---|---|
| Switch tabs | Click Star / Planets / Universe |
| Save star | ✓ Save Star button |
| Add planet | Fill form → ✓ Save Planet |
| Edit planet | Click **edit** on planet card |
| Delete planet | Click **✕** on planet card |
| Import NASA planet | Click **Import** on NASA card |
| Import all NASA | Click **Import All** |
| Close panel | ✕ top-right of panel |
