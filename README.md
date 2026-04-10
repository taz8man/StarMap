# Local Galactic Neighborhood — Star Map

**Version:** 0.9.6  
**Tested on:** Raspberry Pi OS Bookworm (64-bit), Bullseye (32 & 64-bit)  
**Hardware:** Raspberry Pi 3B+, 4, 5 · Pi 4 or 5 recommended for smooth WebGL

---

## What This Is

An interactive 3D star map rendered in WebGL (Three.js) showing every catalogued star within 120 light years of Sol in true galactic coordinates, served as a local website from a Raspberry Pi. Layered on top of real astronomical data is a full **worldbuilding system** — a creative tool for science fiction writers, game masters, and world-builders to annotate stars, create fictional planets, define civilizations, factions, and eras, and view planetary systems in a dedicated 3D orbital viewer.

---

## Package Contents

```
starmap/
├── index.html                  ← Galactic neighborhood map (main app)
├── exoplanet-system.html       ← Planetary system 3D viewer
├── solar-system.html           ← Solar system viewer
├── nginx.conf                  ← Web server configuration
├── install.sh                  ← Full installer (7 steps)
├── uninstall.sh                ← Clean uninstaller
├── update.sh                   ← Deploy HTML updates to Pi
├── update-data.sh              ← Run all catalog updates (called by cron)
├── update-catalog.sh           ← Update HYG star catalog only
├── update-exoplanets.sh        ← Update NASA exoplanet catalog only
├── kiosk-setup.sh              ← Optional full-screen kiosk mode
├── api/
│   ├── world_api.py            ← Flask worldbuilding REST API
│   ├── init_db.py              ← SQLite schema + migrations
│   └── install-api.sh          ← API service installer
└── static/
    ├── css/
    │   └── worldbuilding.css   ← Shared WB panel styles
    └── js/
        ├── worldbuilding.js    ← Shared WB panel logic
        └── worldbuilding-panel.js ← WB panel HTML injection
```

---

## Quick Install

```bash
scp starmap-raspberrypi.tar.gz pi@<PI_IP>:~/
ssh pi@<PI_IP>
tar -xzf starmap-raspberrypi.tar.gz
sudo bash starmap/install.sh
```

The installer runs 7 steps automatically:
1. Install nginx
2. Download Three.js r128
3. Download web fonts (Orbitron, Space Mono)
4. Download HYG star catalog (~14 MB)
5. Download NASA exoplanet catalog
6. Install app files and configure nginx
7. Install worldbuilding API (Flask + SQLite + systemd)

After install, open a browser to `http://<PI_IP>/` or `http://<hostname>.local/`

---

## Updating

**HTML and static files:**
```bash
scp starmap-raspberrypi.tar.gz pi@<PI_IP>:~/
ssh pi@<PI_IP> "
  cd ~ && tar -xzf starmap-raspberrypi.tar.gz
  sudo bash starmap/update.sh
  sudo cp starmap/static/css/worldbuilding.css /var/www/starmap/static/css/
  sudo cp starmap/static/js/worldbuilding.js /var/www/starmap/static/js/
  sudo cp starmap/static/js/worldbuilding-panel.js /var/www/starmap/static/js/
"
```

**API updates:**
```bash
sudo cp starmap/api/world_api.py /var/www/starmap/api/world_api.py
sudo systemctl restart starmap-api
```

---

## Nightly Updates

Catalog data updates automatically at **2:00 AM** via cron:

```bash
cat /etc/cron.d/starmap-update        # verify cron is installed
sudo bash /var/www/starmap/update-data.sh   # run manually
cat /var/log/starmap/update-data.log  # view log
```

---

## Architecture

| Component | Technology | Location |
|---|---|---|
| Web server | nginx | `/etc/nginx/sites-available/starmap` |
| Star map | Three.js r128 (WebGL) | `/var/www/starmap/index.html` |
| Worldbuilding API | Flask (Python) | `/var/www/starmap/api/world_api.py` |
| Database | SQLite | `/var/www/starmap/data/world.db` |
| Star catalog | HYG / AT-HYG v3.2 | `/var/www/starmap/static/data/hyg.csv` |
| Exoplanet catalog | NASA Exoplanet Archive | `/var/www/starmap/static/data/exoplanets.csv` |
| Shared WB styles | CSS | `/var/www/starmap/static/css/worldbuilding.css` |
| Shared WB logic | JavaScript | `/var/www/starmap/static/js/worldbuilding.js` |

**API base URL:** `http://<PI_IP>/api/world/`

---

## Useful Commands

```bash
sudo systemctl status nginx
sudo systemctl status starmap-api
sudo journalctl -u starmap-api -f
sudo systemctl restart starmap-api
curl http://localhost/api/world/backup > world_backup.json
```

---

## Troubleshooting

**Only 133 stars visible**  
```bash
sudo bash /var/www/starmap/update-catalog.sh
```

**No planet rings on stars**  
```bash
sudo bash /var/www/starmap/update-exoplanets.sh
```

**Worldbuilding panel shows "API not reachable"**  
```bash
sudo systemctl restart starmap-api
sudo journalctl -u starmap-api -n 30
```

**API missing after reinstall**  
```bash
sudo bash ~/starmap/api/install-api.sh
```

---

## Version History

| Version | Description |
|---|---|
| 0.9.6 | Moon viewer (planet-system.html), WB moon tab, moon API endpoints, solar/exo viewer moon links |
| 0.9.5 | Habitable zone in exo viewer, bolometric corrections, star DP redesign |
| 0.9.4 | Shared CSS/JS, full WB panel in exo viewer, bug fixes |
| 0.9.3 | Radius/mass fields, auto size class from radius |
| 0.9.2 | Blue/green planet rings, with_planets API endpoint |
| 0.9.1 | View Planetary System button for user-planet stars |
| 0.9.0 | User planets in exo viewer, allplanets API endpoint |
| 0.8.6 | NASA planet catalog in WB panel, Import/Import All |
| 0.8.5 | Orbital fields (period, eccentricity, inclination, arg_peri) |
| 0.8.4 | Nightly cron updates, exoplanet download in installer |
| 0.8.3 | Search bar to bottom, version in status bar |
| 0.8.2 | Hamburger menu, panel layout fixes |
| 0.8.1 | HYG catalog auto-fill in WB star tab |
