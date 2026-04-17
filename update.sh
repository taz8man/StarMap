#!/bin/bash
# Galactic Neighborhood — Update script (replaces HTML files from current directory)
set -e
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RESET='\033[0m'
if [ "$EUID" -ne 0 ]; then exec sudo bash "$0" "$@"; fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="/var/www/starmap"
echo -e "\n${YELLOW}Updating star map...${RESET}"

for page in index.html solar-system.html exoplanet-system.html planet-system.html stellar-system.html; do
  if [ -f "$SCRIPT_DIR/$page" ]; then
    cp "$SCRIPT_DIR/$page" "$DEST/$page"
    chown www-data:www-data "$DEST/$page"
    echo -e "${GREEN}✓ $page updated${RESET}"
  fi
done

# Shared CSS/JS
for f in static/css/worldbuilding.css static/js/worldbuilding.js static/js/worldbuilding-panel.js; do
  if [ -f "$SCRIPT_DIR/$f" ]; then
    cp "$SCRIPT_DIR/$f" "$DEST/$f"
    chown www-data:www-data "$DEST/$f"
    echo -e "${GREEN}✓ $f updated${RESET}"
  fi
done

# Images
if [ -d "$SCRIPT_DIR/images" ]; then
  mkdir -p "$DEST/images"
  cp -r "$SCRIPT_DIR/images/." "$DEST/images/"
  chown -R www-data:www-data "$DEST/images"
  echo -e "${GREEN}✓ images updated${RESET}"
fi

echo -e "${GREEN}Done — refresh your browser.${RESET}"
