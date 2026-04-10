#!/bin/bash
# Galactic Neighborhood — Uninstaller
set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RESET='\033[0m'
if [ "$EUID" -ne 0 ]; then exec sudo bash "$0" "$@"; fi

echo -e "\n${YELLOW}Uninstalling Galactic Neighborhood Star Map...${RESET}\n"

# Remove nginx site
rm -f /etc/nginx/sites-enabled/starmap
rm -f /etc/nginx/sites-available/starmap

# Re-enable default nginx site (optional)
# ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Remove app files
rm -rf /var/www/starmap

# Reload nginx
systemctl reload nginx 2>/dev/null || true

echo -e "${GREEN}✓ Uninstall complete.${RESET}"
echo "  nginx is still running. Re-enable the default site manually if needed."
