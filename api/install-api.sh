#!/bin/bash
# ============================================================================
#  Worldbuilding API — Installer
#  Installs the Flask API as a systemd service on the Pi.
#  Run AFTER the main install.sh
# ============================================================================
set -e
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'
BOLD='\033[1m'; NC='\033[0m'
ok()  { echo -e "  ${GREEN}✓${NC} $1"; }
info(){ echo -e "  ${YELLOW}→${NC} $1"; }

if [ "$EUID" -ne 0 ]; then exec sudo bash "$0" "$@"; fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="/var/www/starmap/api"
DB_DIR="/var/www/starmap/data"

echo ""
echo -e "${BOLD}${CYAN}  ✦ Worldbuilding API Installer${NC}"
echo ""

# ── Dependencies ──────────────────────────────────────────────────────────────
info "Installing Python dependencies..."
apt-get install -y -qq python3-pip python3-flask 2>/dev/null || \
    pip3 install flask --break-system-packages -q
ok "Flask installed"

# ── Install API files ─────────────────────────────────────────────────────────
mkdir -p "$API_DIR" "$DB_DIR"
cp "$SCRIPT_DIR/world_api.py" "$API_DIR/world_api.py"
cp "$SCRIPT_DIR/init_db.py"   "$API_DIR/init_db.py"
chown -R www-data:www-data "$API_DIR" "$DB_DIR"
chmod 755 "$API_DIR" "$DB_DIR"
ok "API files installed to $API_DIR"

# ── Initialise database (skip if exists) ──────────────────────────────────────
info "Initialising database..."
WORLD_DB="$DB_DIR/world.db" python3 "$API_DIR/init_db.py"
chown www-data:www-data "$DB_DIR/world.db" 2>/dev/null || true
ok "Database ready at $DB_DIR/world.db"

# ── systemd service ───────────────────────────────────────────────────────────
cat > /etc/systemd/system/starmap-api.service << SERVICE
[Unit]
Description=Galactic Neighborhood Worldbuilding API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/starmap/api
Environment=WORLD_DB=/var/www/starmap/data/world.db
ExecStart=/usr/bin/python3 /var/www/starmap/api/world_api.py
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable starmap-api --quiet
systemctl restart starmap-api
ok "systemd service enabled and started"

# ── nginx proxy ───────────────────────────────────────────────────────────────
# Add /api/world/ proxy to existing nginx config
NGINX_CONF="/etc/nginx/sites-available/starmap"
if ! grep -q "api/world" "$NGINX_CONF"; then
    # Insert proxy block before the closing brace
    sed -i '/^}$/i\
\
    # Worldbuilding API — proxied to Flask on :5000\
    location /api/world/ {\
        proxy_pass http://127.0.0.1:5000/api/world/;\
        proxy_set_header Host $host;\
        add_header Cache-Control "no-store";\
    }' "$NGINX_CONF"
    nginx -t 2>/dev/null && systemctl reload nginx
    ok "nginx proxy configured for /api/world/"
else
    ok "nginx proxy already configured"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "  ${GREEN}${BOLD}Worldbuilding API is running!${NC}"
echo ""
echo -e "  API base URL : ${CYAN}http://localhost/api/world/${NC}"
echo -e "  Database     : ${CYAN}$DB_DIR/world.db${NC}"
echo ""
echo -e "  ${YELLOW}Useful commands:${NC}"
echo -e "    sudo systemctl status starmap-api"
echo -e "    sudo journalctl -u starmap-api -f     — live logs"
echo -e "    sudo systemctl restart starmap-api"
echo ""
