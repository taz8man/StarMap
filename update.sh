#!/bin/bash
# Galactic Neighborhood — Update script (replaces HTML files from current directory)
set -e
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RESET='\033[0m'
if [ "$EUID" -ne 0 ]; then exec sudo bash "$0" "$@"; fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo -e "\n${YELLOW}Updating star map...${RESET}"
cp "$SCRIPT_DIR/index.html" /var/www/starmap/index.html
chown www-data:www-data /var/www/starmap/index.html
echo -e "${GREEN}✓ index.html updated${RESET}"

if [ -f "$SCRIPT_DIR/solar-system.html" ]; then
  cp "$SCRIPT_DIR/solar-system.html" /var/www/starmap/solar-system.html
  chown www-data:www-data /var/www/starmap/solar-system.html
  echo -e "${GREEN}✓ solar-system.html updated${RESET}"
fi

if [ -f "$SCRIPT_DIR/exoplanet-system.html" ]; then
  cp "$SCRIPT_DIR/exoplanet-system.html" /var/www/starmap/exoplanet-system.html
  chown www-data:www-data /var/www/starmap/exoplanet-system.html
  echo -e "${GREEN}✓ exoplanet-system.html updated${RESET}"
fi
echo -e "${GREEN}Refresh your browser.${RESET}"
