# Local Galactic Neighborhood — Raspberry Pi Installation Guide

**Version:** 1.0  
**Tested on:** Raspberry Pi OS Bookworm (64-bit), Bullseye (32 & 64-bit)  
**Hardware:** Raspberry Pi 3B+, 4, 5 (all work; Pi 5 recommended for smooth WebGL)

---

## What You're Installing

An interactive 3D star map rendered in WebGL (Three.js) showing every catalogued star within 120 light years of Sol, using real coordinates from the HYG stellar database (Hipparcos + Yale + Gliese catalogs). nginx serves it as a local website accessible from any browser on your network.

---

## Files in This Package

```
starmap/
├── index.html          ← The star map application (self-contained)
├── nginx.conf          ← Web server configuration
├── install.sh          ← Main installer (run this first)
├── kiosk-setup.sh      ← Optional: auto-launch full-screen on boot
├── update.sh           ← Replace the app after edits
└── uninstall.sh        ← Remove everything cleanly
```

---

## Prerequisites

### Hardware
- Raspberry Pi 3B+, 4, or 5
- MicroSD card (8GB+ recommended)
- Network connection (Ethernet or Wi-Fi) — needed during install to download Three.js and fonts

### Software
- Raspberry Pi OS (Bookworm or Bullseye, Desktop or Lite)
- Fresh install recommended (though not required)

---

## Step-by-Step Installation

### 1. Copy the package to your Pi

**Option A — USB drive:**
```bash
# Insert USB drive, then on the Pi:
cp -r /media/pi/YOUR_DRIVE/starmap ~/starmap
cd ~/starmap
```

**Option B — scp from your computer (replace PI_IP):**
```bash
scp -r ./starmap/ pi@PI_IP:~/starmap
ssh pi@PI_IP
cd ~/starmap
```

**Option C — Direct download (if you prefer):**
```bash
# On the Pi, create the folder and copy files manually from a USB or share
mkdir ~/starmap
```

### 2. Make scripts executable
```bash
chmod +x ~/starmap/install.sh
chmod +x ~/starmap/kiosk-setup.sh
chmod +x ~/starmap/uninstall.sh
chmod +x ~/starmap/update.sh
```

### 3. Run the installer
```bash
cd ~/starmap
sudo bash install.sh
```

The installer will:
- Update your package list
- Install nginx (the web server)
- Download Three.js r128 (~600 KB) from cdnjs.cloudflare.com
- Download web fonts (Orbitron + Space Mono) from Google Fonts
- Copy all files to `/var/www/starmap/`
- Configure and start nginx

**Typical install time:** 2–5 minutes on Pi 4 with decent internet.

### 4. Open the star map

From the Pi's own browser:
```
http://localhost/
```

From any device on the same network:
```
http://RASPBERRY_PI_IP/
```

To find your Pi's IP address:
```bash
hostname -I
```

Or try the hostname shortcut (works on most local networks):
```
http://raspberrypi.local/
```

---

## Optional: Kiosk Mode (Full-Screen on Boot)

If you want the Pi to boot directly into the star map full-screen (great for a dedicated display):

```bash
sudo bash ~/starmap/kiosk-setup.sh
sudo reboot
```

After rebooting, the Pi will automatically open Chromium in full-screen kiosk mode pointing to the star map. The mouse cursor will hide after 5 seconds of inactivity.

**To exit kiosk mode:** Press `Alt+F4` or `Ctrl+W`  
**To disable kiosk permanently:**
```bash
rm ~/.config/autostart/starmap-kiosk.desktop
```

---

## Enabling the Live Star Catalog (Optional)

The app ships with 133 well-known stars embedded. When served from a real web server with internet access, it will automatically attempt to download the full HYG v3.8 catalog (~3,000+ stars within 120 ly) from Codeberg in the background.

If the Pi has internet access, this happens automatically — you'll see the star count increase after a few seconds and the status bar will update to show "HYG v3.8 LIVE".

No configuration needed.

---

## Useful Commands

### Check if the server is running
```bash
sudo systemctl status nginx
```

### Restart the server
```bash
sudo systemctl restart nginx
```

### Watch live access logs
```bash
sudo tail -f /var/log/nginx/starmap_access.log
```

### Update the star map (after editing index.html)
```bash
cd ~/starmap
sudo bash update.sh
```

### Check what's installed
```bash
ls -lh /var/www/starmap/
ls -lh /var/www/starmap/static/js/
ls -lh /var/www/starmap/static/fonts/
```

---

## Uninstalling

```bash
sudo bash ~/starmap/uninstall.sh
```

This removes:
- `/var/www/starmap/` (all app files)
- The nginx site configuration
- Restores nginx to its default state

nginx itself is NOT removed (it may be used by other services).

---

## Performance Notes

| Pi Model | Expected FPS | Notes |
|----------|-------------|-------|
| Pi 3B+   | 20–40 fps   | Smooth for the 133-star embedded set; may slow on 3000+ stars |
| Pi 4     | 50–60 fps   | Excellent for full catalog |
| Pi 5     | 60 fps      | Best experience |

**If performance is poor on Pi 3B+:**
- Use the embedded catalog (default, no internet needed)
- Keep the "Max Distance" slider below 60 ly
- Disable "Star Glow" in the Filters panel

---

## Troubleshooting

### "Site can't be reached" from another device
```bash
# Check nginx is running
sudo systemctl status nginx

# Check firewall (Pi OS usually has none, but just in case)
sudo ufw status

# Get the Pi's actual IP
hostname -I
```

### Star map shows but Three.js fails to load
```bash
# Verify Three.js was downloaded
ls -lh /var/www/starmap/static/js/three.min.js

# If missing, download manually:
sudo curl -fsSL https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js \
     -o /var/www/starmap/static/js/three.min.js
sudo chown www-data:www-data /var/www/starmap/static/js/three.min.js
```

### Fonts look wrong (falling back to monospace)
Fonts are cosmetic only — the app works fine without them. To download manually:
```bash
# Orbitron Regular
sudo curl -fsSL "https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nysimBoWgz.woff2" \
     -o /var/www/starmap/static/fonts/Orbitron-Regular.woff2
```

### nginx config test fails
```bash
sudo nginx -t
# Fix any errors shown, then:
sudo systemctl restart nginx
```

### Check nginx error logs
```bash
sudo tail -50 /var/log/nginx/starmap_error.log
```

---

## Network Access Options

### Access from local network (default)
Works immediately after install. Use `http://PI_IP/` from any device on the same Wi-Fi or Ethernet network.

### Make accessible from internet (advanced)
Not recommended for most users. Requires:
1. Port forwarding on your router (port 80 → Pi's IP)
2. A domain name or dynamic DNS service
3. An SSL certificate (Let's Encrypt / Certbot)

For a local home display, the default local-only setup is ideal.

### Static IP for the Pi (recommended for permanent installs)
Assign a fixed IP to the Pi from your router's DHCP settings, or set a static IP on the Pi:
```bash
# Find your current network settings
ip route show default
# Then edit /etc/dhcpcd.conf to set a static IP — see your Pi OS docs
```

---

## File Locations Summary

| Item | Location |
|------|----------|
| Star map HTML | `/var/www/starmap/index.html` |
| Three.js library | `/var/www/starmap/static/js/three.min.js` |
| Web fonts | `/var/www/starmap/static/fonts/` |
| nginx site config | `/etc/nginx/sites-available/starmap` |
| nginx access log | `/var/log/nginx/starmap_access.log` |
| nginx error log | `/var/log/nginx/starmap_error.log` |

---

*Star data: HYG Database v3.8 — Hipparcos, Yale Bright Star, Gliese catalogs*  
*Rendering: Three.js r128 — WebGL 3D engine*  
*Coordinates: IAU J2000 galactic frame (X=toward galactic center, Y=north pole, Z=east)*
