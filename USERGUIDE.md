# Local Galactic Neighborhood — User Guide

**Version 1.2** · A complete reference for all features.

---

## Contents

1. [Galactic Neighborhood Map](#1-galactic-neighborhood-map)
2. [Multi-Star System Viewer](#2-multi-star-system-viewer)
3. [Exoplanet System Viewer](#3-exoplanet-system-viewer)
4. [Solar System Viewer](#4-solar-system-viewer)
5. [Moon System Viewer](#5-moon-system-viewer)
6. [Worldbuilding Panel — Star Tab](#6-worldbuilding-panel--star-tab)
7. [Worldbuilding Panel — Planets Tab](#7-worldbuilding-panel--planets-tab)
8. [Worldbuilding Panel — Moons Tab](#8-worldbuilding-panel--moons-tab)
9. [Worldbuilding Panel — Universe Tab](#9-worldbuilding-panel--universe-tab)
10. [Planet Rings & Indicators](#10-planet-rings--indicators)
11. [Habitable Zone](#11-habitable-zone)
12. [Data & Catalogs](#12-data--catalogs)
13. [Controls Reference](#13-controls-reference)

---

## 1. Galactic Neighborhood Map

The main view. Every catalogued star within 120 light years of Sol rendered in true galactic coordinates using real HYG v4.2 catalog data.

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
| ⬡ Star System | Orange | Opens multi-star system viewer |
| ⬡ Planets | Green/Blue | Opens exoplanet system viewer |
| ✎ Notes | Purple | Opens worldbuilding panel |

### Search Bar (bottom-center)

Type any star name, designation, or catalog number. Results open upward. Click to fly to that star.

### Planet & System Rings

Stars display colored rings indicating their status:

| Ring | Color | Meaning |
|---|---|---|
| 🟢 Green | `#00dd88` | NASA confirmed + user-created planets |
| 🔵 Blue | `#1188ff` | NASA confirmed planets only |
| 🟣 Purple | `#aa66ff` | User-created planets only |
| 🟡 Amber | `#ffaa00` | Multi-star system, no planets |

Planet rings take priority over the amber multi-star ring. Stars with any ring always show name labels regardless of distance or brightness.

---

## 2. Multi-Star System Viewer

Opens in a new tab from **⬡ Star System** on any star that is part of a binary or multiple star system. Shows 2–4 stars at true relative scale with connecting lines and separation distances.

### What's Shown

- All renderable member stars positioned in true relative scale (1 scene unit = mean pairwise separation)
- Stars colored by spectral type with glow halos and dark-tinted labels
- A connecting line between stars with the AU separation labeled at the midpoint

### Navigation

Left-drag to orbit, right-drag to pan, scroll to zoom.

### System Overview Panel (bottom-left)

Lists every member of the system:
- **Rendered stars** — spectral type, luminosity, separation from primary, planet indicator
- **NOT SHOWN** — excluded members with reason:
  - *White dwarf* — excluded by default
  - *Brown dwarf* — excluded by default
  - *N AU — gravitationally marginal* — separation > 10,000 AU
  - *Catalog distance unreliable — not loaded* — bad parallax in catalog

Clicking a star row in the panel selects that star and opens its detail panel.

### Star Detail Panel (right)

Click any star in the scene to open its DP:
- Spectral type, Abs Mag, Luminosity
- Separation from primary in AU
- Habitable Zone range in AU
- **⬡ Planets** button — if the star has NASA or user-created planets
- **✎ Notes** button — opens worldbuilding panel for that star

### Multi-Star System Detection

Systems are identified by matching Gliese catalog root numbers (`base` column in HYG v4.2). Stars sharing the same base Gliese number with distances within 0.05 pc of each other are grouped. A supplement table covers known planet-hosting binaries whose companions lack Gliese numbers in the catalog (Gamma Cephei, Gliese 86, 55 Cancri).

**Exclusion rules:**
- White dwarfs (spectral D) — noted but not rendered
- Brown dwarfs (spectral L/T/Y) — noted but not rendered
- Companions > 10,000 AU separation — noted but not rendered

---

## 3. Exoplanet System Viewer

Opens in a new tab from **⬡ Planets**. Shows confirmed exoplanets and user-created planets orbiting their host star in 3D with Keplerian orbital mechanics.

### Navigation

Left-drag to orbit, right-drag to pan, scroll to zoom.

### Playback Controls (bottom-center glass panel)

- **⏸ / ▶** — pause/resume orbital animation
- **Speed slider** — simulation speed in days/second

### Detail Panel

**Click the host star** → Distance, Spectral type, Abs Mag, Luminosity, Habitable Zone, planet count. Button: **✎ Notes** opens WB panel on Star tab.

**Click a planet** → Type, Orbit (AU), Period, Radius, Mass, Eq. Temperature, Discovery. Buttons: **⬡ Wikipedia**, **⬡ Moons**, **✎ Notes**.

### Habitable Zone

A faint green band in the orbital plane shows the conservative habitable zone (Kopparapu 2013).

---

## 4. Solar System Viewer

Opens from Sol's detail panel. Shows the 8 planets with accurate orbital periods. Same navigation controls.

**Click a planet** → type, diameter, mass, day/year length, moon count. **⬡ Moons** opens the moon viewer.

---

## 5. Moon System Viewer

Opens from **⬡ Moons** in either the exoplanet viewer or solar system viewer. Shows moons orbiting a planet with Keplerian orbital mechanics.

### Known Moons Catalog

Pre-loaded with major moons of solar system planets (Earth, Mars, Jupiter, Saturn, Uranus, Neptune). User-created moons appear alongside catalog moons.

### Surface Map Upload

Click the **planet body** to open its detail panel. At the bottom of the panel a **Surface Map** section lets you upload an equirectangular texture image (PNG or JPG, ideally 2:1 ratio — e.g. 2048×1024 or 4096×2048). NASA's Solar System texture maps work perfectly. Once loaded the planet renders with the texture and slowly spins on its axis. Use **✕ Remove texture** to revert to flat color. Textures are session-only.

### Playback Controls

Same glass panel as exoplanet viewer — ⏸/▶ and speed slider.

---

## 6. Worldbuilding Panel — Star Tab

Opens from **✎ Notes** on any star in any viewer. Four tabs: Star, Universe, Planets, Moons.

### HYG Catalog Reference Box (read-only)

Auto-populated: Spectral type, Distance, Abs Mag, Luminosity, HIP/HD numbers, Habitable Zone AU range.

### Editable Fields

Fictional Name, Common Name, Significance, First Contact Era, Plot Notes, Internal Notes, Tags, Era Control.

---

## 7. Worldbuilding Panel — Planets Tab

### NASA Catalog Section

Stars with confirmed exoplanets show each planet with size class, temperature zone, orbit, mass, radius, hab zone badge, discovery info. **Import** / **Import All** buttons.

### Your Planets Section

User-created and imported planets. Edit, 🌙 (Moons), ✕ (delete) buttons per card.

### Size Class Thresholds

| Radius | Class |
|---|---|
| < 0.5 R⊕ | Moonlet |
| 0.5–1.25 | Small |
| 1.25–1.7 | Earth-like |
| 1.7–3.5 | Super-Earth |
| 3.5–10 | Neptune-like |
| > 10 | Gas Giant |

---

## 8. Worldbuilding Panel — Moons Tab

Available in the exoplanet viewer. Activate via **🌙** on a planet card. Add moons with orbital elements (semi-major axis in parent planet radii, period, eccentricity, inclination), physical properties (radius km, world type, atmosphere), and narrative notes.

**Orbit reference (Rp = parent planet radii):**
- Earth's Moon: 60.3 Rp · Io: 5.9 Rp (Jupiter) · Titan: 20.3 Rp (Saturn)

---

## 9. Worldbuilding Panel — Universe Tab

Define eras, civilizations, and factions. Used in Star tab for First Contact era and Era Control records.

---

## 10. Planet Rings & Indicators

| Ring | Color | Condition |
|---|---|---|
| 🟢 Green | `#00dd88` | NASA confirmed + user-created planets |
| 🔵 Blue | `#1188ff` | NASA confirmed planets only |
| 🟣 Purple | `#aa66ff` | User-created planets only |
| 🟡 Amber | `#ffaa00` | Multi-star system, no planets |

Planet rings take priority over amber. All ring-bearing stars always show name labels.

---

## 11. Habitable Zone

**Calculation:**
1. Bolometric correction applied to visual abs mag by spectral type (Flower 1996)
2. Luminosity: `L = 10^((4.83 - absmag_bol) / 2.5)`
3. Inner: `√(L / 1.1)` AU · Outer: `√(L / 0.53)` AU
4. Kopparapu et al. (2013) conservative limits

---

## 12. Data & Catalogs

### Star Catalog
- **Source:** HYG v4.2 (Hipparcos + Yale Bright Star + Gliese)
- **Coverage:** ~120,000 stars, filtered to 120 ly for display
- **Update:** `sudo bash /var/www/starmap/update-catalog.sh`
- **Fallback:** 133-star embedded catalog if CSV not downloaded

### Exoplanet Catalog
- **Source:** NASA Exoplanet Archive (TAP API, PSCompPars table)
- **Coverage:** Confirmed planets within ~120 ly (37 parsecs)
- **Update:** `sudo bash /var/www/starmap/update-exoplanets.sh`

### Multi-Star Grouping
- **Primary method:** HYG `base` column (shared Gliese root number)
- **Fallback:** `gl` column root stripping for stars without `base`
- **Supplement:** Hardcoded HIP pairs for known planet-hosting binaries whose companions lack catalog Gliese numbers (Gamma Cephei, Gliese 86, 55 Cancri)

### Worldbuilding Database
- **Location:** `/var/www/starmap/data/world.db` (SQLite)
- **Backup:** `curl http://localhost/api/world/backup > backup.json`

---

## 13. Controls Reference

### All Viewers

| Action | Control |
|---|---|
| Orbit | Left-drag |
| Pan | Right-drag |
| Zoom | Scroll wheel |
| Select object | Click |
| Close tab | ✕ Close button |

### Galactic Map Only

| Action | Control |
|---|---|
| Focus star | Double-click |
| Search | Bottom search bar |
| Open menu | ☰ top-left |

### Exoplanet / Solar / Moon Viewers

| Action | Control |
|---|---|
| Play/Pause | ⏸/▶ button |
| Speed | Speed slider |
