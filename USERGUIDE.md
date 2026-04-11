# Local Galactic Neighborhood — User Guide

**Version 1.0** · A complete reference for all features.

---

## Contents

1. [Galactic Neighborhood Map](#1-galactic-neighborhood-map)
2. [Exoplanet System Viewer](#2-exoplanet-system-viewer)
3. [Solar System Viewer](#3-solar-system-viewer)
4. [Moon System Viewer](#4-moon-system-viewer)
5. [Worldbuilding Panel — Star Tab](#5-worldbuilding-panel--star-tab)
6. [Worldbuilding Panel — Planets Tab](#6-worldbuilding-panel--planets-tab)
7. [Worldbuilding Panel — Moons Tab](#7-worldbuilding-panel--moons-tab)
8. [Worldbuilding Panel — Universe Tab](#8-worldbuilding-panel--universe-tab)
9. [Planet Rings & Indicators](#9-planet-rings--indicators)
10. [Habitable Zone](#10-habitable-zone)
11. [Data & Catalogs](#11-data--catalogs)
12. [Controls Reference](#12-controls-reference)

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

The click target for each star scales with zoom level — at close range the hit area is tight, preventing accidentally selecting a background star.

### Menu Panel (☰ top-left)

- **Spectral Types** — toggle O/B, A, F, G, K, M, D star types on/off. Toggle switches show a blue outline when off, solid blue fill when on.
- **Filters** — max distance slider (10–120 ly), max visual magnitude slider
- **Display** — Name Labels, Star Glow, Galactic Grid, Auto-Rotate toggles

### Star Detail Panel (top-right)

Appears when you click a star. Shows name, alternate names, catalog IDs, distance, spectral type, magnitudes, color index, galactic XYZ. Action buttons:

| Button | Color | Action |
|---|---|---|
| ⬡ Wikipedia | Blue | Opens Wikipedia article |
| ☀ Sol System | Amber | Opens solar system viewer (Sol only) |
| ⬡ [Name] System | Green | Opens exoplanet system viewer |
| ✎ Notes | Purple | Opens worldbuilding panel |

### Search Bar (bottom-center)

Type any star name, designation, or catalog number. Results open upward. Click to fly to that star.

### Planet Rings

Stars with planets show colored rings:
- **Green ring** — confirmed NASA exoplanets
- **Blue ring** — user-created planets only

Stars with green rings always get name labels, regardless of distance or brightness.

---

## 2. Exoplanet System Viewer

Opens in a new tab from **⬡ [Name] System**. Shows confirmed exoplanets and user-created planets orbiting their host star in 3D with Keplerian orbital mechanics.

### Navigation

Left-drag to orbit, right-drag to pan, scroll to zoom.

### Playback Controls (bottom-center glass panel)

- **⏸ / ▶** — pause/resume orbital animation
- **Speed slider** — simulation speed in days/second

### Detail Panel

**Click the host star** → shows Distance, Spectral type, Abs Mag, Luminosity, Habitable Zone, planet count. Button: **✎ Notes** opens WB panel on Star tab.

**Click a planet** → shows Type, Orbit (AU), Period, Radius, Mass, Eq. Temperature, Discovery. Buttons: **⬡ Wikipedia**, **⬡ Moons**, **✎ Notes**.

### Habitable Zone

A faint green band in the orbital plane shows the conservative habitable zone (Kopparapu 2013). See [Section 10](#10-habitable-zone) for details.

---

## 3. Solar System Viewer

Opens from Sol's detail panel. Shows the 8 planets with accurate orbital periods. Same navigation controls.

**Click a planet** → shows type, diameter, mass, day length, year length, moon count. For planets with moons, a **⬡ Moons** button opens the moon viewer.

**Click a moon** (visible in the scene) → shows satellite info and Wikipedia link.

---

## 4. Moon System Viewer

Opens from **⬡ Moons** in either the exoplanet viewer or solar system viewer. Shows moons orbiting a planet with Keplerian orbital mechanics.

### Known Moons Catalog

Pre-loaded with major moons of solar system planets:

| Planet | Moons included |
|---|---|
| Earth | Moon |
| Mars | Phobos, Deimos |
| Jupiter | Io, Europa, Ganymede, Callisto |
| Saturn | Mimas, Enceladus, Tethys, Dione, Rhea, Titan, Iapetus |
| Uranus | Miranda, Ariel, Umbriel, Titania, Oberon |
| Neptune | Proteus, Triton, Nereid |

User-created moons (added via WB panel Moons tab) appear alongside catalog moons.

### Detail Panel

**Click the planet** → Type, diameter, orbit, period, moon count.

**Click a moon** → Type (Large/Mid/Small/Moonlet), Orbit in planet radii (Rp) and km, Period, Radius, Atmosphere, Wikipedia link (known moons). **✎ Notes** button opens WB panel.

### Playback Controls

Same glass panel as exoplanet viewer — ⏸/▶ and speed slider.

---

## 5. Worldbuilding Panel — Star Tab

Opens from **✎ Notes** on any star. Three tabs in the main map (Star, Universe, Planets) and four tabs in the exoplanet viewer (Star, Universe, Planets, Moons).

### HYG Catalog Reference Box (read-only)

Auto-populated from the star catalog: Spectral type, Distance, Abs Mag, Luminosity, HIP/HD numbers, Habitable Zone AU range.

### Editable Fields

| Field | Description |
|---|---|
| Fictional Name | Your worldbuilding name for this star |
| Common Name | Short colloquial name |
| Significance | NONE / MINOR / MAJOR / CRITICAL |
| First Contact Era | Links to eras defined in Universe tab |
| Plot Notes | Free-text narrative notes |
| Internal Notes | GM/author-only notes |

### Tags

Color-coded tags to classify stars. Add via the tag input, remove with ✕.

### Era Control

Records which faction controls the system per era. Links to eras and factions from the Universe tab.

### Saving

Click **✓ Save Star**. Confirmation appears briefly. Stars are created automatically — no need to save before adding planets.

---

## 6. Worldbuilding Panel — Planets Tab

### NASA Catalog Section

For stars with confirmed exoplanets, a **NASA CATALOG** section shows each planet with:
- Size class (auto from radius), temperature zone, orbit, mass, radius
- **★ Hab candidate** badge (if in habitable zone)
- Discovery method and year
- **Import** — imports into your WB database
- **Import All** — imports all at once

### Your Planets Section

User-created and imported planets, each showing fictional name, world type, size class, atmosphere, orbit, and period. Buttons: **edit**, **🌙** (open Moons tab for this planet), **✕** (delete).

### Planet Form Fields

**Physical:**
- Radius (R⊕) and Mass (M⊕) — Size class auto-derives from radius
- World Type, Atmosphere, Temperature, Native Life, Habitable (Yes/No)

**Size Class thresholds:**

| Radius | Class |
|---|---|
| < 0.5 R⊕ | Moonlet |
| 0.5–1.25 | Small |
| 1.25–1.7 | Earth-like |
| 1.7–3.5 | Super-Earth |
| 3.5–10 | Neptune-like |
| > 10 | Gas Giant |

**Orbital Elements** (used by exoplanet viewer):
Orbit (AU), Period (days), Eccentricity, Inclination (°), Arg. Periastron (°)

**Worldbuilding:** Significance, Plot Notes

---

## 7. Worldbuilding Panel — Moons Tab

Available in the exoplanet viewer. Activate by clicking **🌙** on a planet card in the Planets tab.

### Context Bar

Shows which planet's moons you're managing.

### Moon Form Fields

| Field | Description |
|---|---|
| Fictional Name | Your name for this moon |
| Common Name | Short nickname |
| Orbit (Rp) | Semi-major axis in parent planet radii |
| Period (days) | Orbital period |
| Eccentricity | 0 = circular, max 0.99 |
| Inclination (°) | Orbital inclination |
| Radius (km) | Moon radius in kilometres |
| World Type | Rocky, Ice, Ocean, Desert, Toxic, Artificial, Other |
| Atmosphere | None, Thin, Breathable, Toxic, Dense, Exotic |
| Significance | NONE / MINOR / MAJOR / CRITICAL |
| Plot Notes | Narrative notes |

After saving, open **⬡ Moons** in the exoplanet viewer to see your moons rendered in the scene alongside any catalog moons.

**Orbit reference (Rp = parent planet radii):**
- Earth's Moon: 60.3 Rp
- Io: 5.9 Rp (Jupiter)
- Titan: 20.3 Rp (Saturn)

---

## 8. Worldbuilding Panel — Universe Tab

Define the meta-structure of your fictional universe.

### Eras

Time periods (e.g. "First Expansion", "The Collapse"). Used to timestamp first contact and era control records. Add via **+ new era** in the Star tab, or manage the full list here.

### Civilizations

Spacefaring species/nations with name, species, homeworld, color, and symbol.

### Factions

Political/military entities that control star systems. Belong to a civilization. Used in Era Control records.

---

## 9. Planet Rings & Indicators

| Ring Color | Meaning |
|---|---|
| **Green** | Confirmed NASA exoplanets |
| **Blue** | User-created planets only |

Rings appear automatically when the NASA catalog is installed or when you save/import a planet. Green-ring stars always show a name label in the galactic map.

---

## 10. Habitable Zone

Shown in two places:

**WB Panel → Star Tab** — AU range in the HYG reference box.

**Exoplanet Viewer** — faint green band in the orbital plane.

**Calculation:**
1. Visual absolute magnitude converted to bolometric using spectral type correction (Flower 1996)
2. Luminosity: `L = 10^((4.83 - absmag_bol) / 2.5)`
3. Inner edge: `√(L / 1.1)` AU
4. Outer edge: `√(L / 0.53)` AU
5. Based on Kopparapu et al. (2013) conservative limits

**Reference values:**

| Star | Spectral | Hab Zone |
|---|---|---|
| Sol | G2V | 0.95–1.37 AU |
| Tau Ceti | G8V | 0.63–0.93 AU |
| Epsilon Eridani | K2V | 0.51–0.73 AU |
| GJ 411 | M2V | 0.14–0.20 AU |
| Ross 128 | M4.5V | 0.04–0.06 AU |

---

## 11. Data & Catalogs

### Star Catalog
- **Source:** AT-HYG v3.2 (Hipparcos + Yale Bright Star + Gliese merged)
- **Coverage:** ~4,500 stars within 120 ly of Sol
- **Update:** `sudo bash /var/www/starmap/update-catalog.sh`
- **Fallback:** 133-star embedded catalog if CSV not found

### Exoplanet Catalog
- **Source:** NASA Exoplanet Archive (TAP API, PSCompPars table)
- **Coverage:** Confirmed planets within ~120 ly (37 parsecs)
- **Update:** `sudo bash /var/www/starmap/update-exoplanets.sh`
- **Matching:** HIP number → HD number → hostname (priority order)
- **Binary guard:** Component stars (A/B/C suffix) only match via catalog ID, not by name

### Worldbuilding Database
- **Location:** `/var/www/starmap/data/world.db` (SQLite)
- **Tables:** eras, civilizations, factions, wb_stars, wb_planets, wb_moons, tags, era_control
- **Backup:** `curl http://localhost/api/world/backup > backup.json`

---

## 12. Controls Reference

### Galactic Map

| Action | Control |
|---|---|
| Orbit | Left-drag |
| Pan | Right-drag |
| Zoom | Scroll wheel |
| Select star | Click |
| Focus star | Double-click |
| Search | Bottom search bar |
| Open menu | ☰ (top-left) |
| Close detail | ✕ on panel |

### All Viewers (Exoplanet / Solar / Moon)

| Action | Control |
|---|---|
| Orbit | Left-drag |
| Pan | Right-drag |
| Zoom | Scroll wheel |
| Select object | Click |
| Play/Pause | ⏸/▶ button |
| Speed | Speed slider |
| Close tab | ✕ Close button |

### Worldbuilding Panel

| Action | Description |
|---|---|
| Switch tabs | Click Star / Universe / Planets / Moons |
| Save star | ✓ Save Star |
| Add planet | Fill form → ✓ Save Planet |
| Edit planet | **edit** on planet card |
| Open moon tab | **🌙** on planet card |
| Delete | **✕** on card |
| Import NASA planet | **Import** on NASA card |
| Import all | **Import All** |
| Close panel | ✕ top-right |
