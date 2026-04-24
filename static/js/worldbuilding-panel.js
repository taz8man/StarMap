/*
 * worldbuilding-panel.js
 * Injects the WB panel HTML into the page.
 * Call wbInjectPanel() before DOMContentLoaded completes,
 * or append to body after load.
 * Used by: index.html, exoplanet-system.html
 */

function wbInjectPanel(){
  // Don't double-inject
  if(document.getElementById('wb-panel')) return;
  const div = document.createElement('div');
  div.innerHTML = `<div id="wb-panel" style="display:none;flex-direction:column">

  <!-- Panel header -->
  <div style="display:flex;align-items:center;justify-content:space-between;
       padding:10px 14px 8px;border-bottom:1px solid rgba(160,80,220,.2);flex-shrink:0">
    <span style="font-family:'Orbitron',sans-serif;font-size:var(--fs-sm);
          color:#cc88ff;letter-spacing:.12em">✎ WORLDBUILDING</span>
    <div style="display:flex;gap:6px;align-items:center">
      <span id="wb-star-label" style="font-size:var(--fs-sm);color:var(--pdm)">—</span>
      <button id="wb-close" style="background:none;border:none;color:var(--pdm);
        font-size:var(--fs-lg);cursor:pointer;padding:0 4px">✕</button>
    </div>
  </div>

  <!-- Tabs -->
  <div style="display:flex;border-bottom:1px solid rgba(160,80,220,.15);flex-shrink:0">
    <button class="wb-tab active" data-tab="wb-tab-star"
      style="flex:1;padding:7px 4px;font-family:'Space Mono',monospace;
             font-size:var(--fs-sm);background:none;border:none;
             color:#cc88ff;cursor:pointer;border-bottom:2px solid #cc88ff">Star</button>
    <button class="wb-tab" data-tab="wb-tab-control"
      style="flex:1;padding:7px 4px;font-family:'Space Mono',monospace;
             font-size:var(--fs-sm);background:none;border:none;
             color:var(--pdm);cursor:pointer;border-bottom:2px solid transparent">Universe</button>
    <button class="wb-tab" data-tab="wb-tab-planets"
      style="flex:1;padding:7px 4px;font-family:'Space Mono',monospace;
             font-size:var(--fs-sm);background:none;border:none;
             color:var(--pdm);cursor:pointer;border-bottom:2px solid transparent">Planets</button>
    <button class="wb-tab" data-tab="wb-tab-moons"
      style="flex:1;padding:7px 4px;font-family:'Space Mono',monospace;
             font-size:var(--fs-sm);background:none;border:none;
             color:var(--pdm);cursor:pointer;border-bottom:2px solid transparent">Moons</button>
  </div>

  <!-- Scrollable content area -->
  <div style="overflow-y:auto;flex:1;padding:12px 14px">

    <!-- ── TAB: Star ─────────────────────────────────────────────────── -->
    <div id="wb-tab-star" class="wb-tab-content">
      <!-- HYG catalog reference data — read-only, auto-populated -->
      <div id="wb-hyg-box" style="display:none;margin-bottom:10px;padding:8px;
           background:rgba(255,255,255,.03);border:1px solid rgba(100,150,255,.15);
           border-radius:4px;font-size:var(--fs-sm)">
        <div style="color:#88bbff;letter-spacing:.07em;margin-bottom:5px">★ CATALOG DATA (HYG)</div>
        <div id="wb-hyg-rows"></div>
      </div>
      <div class="wb-field">
        <label class="wb-lbl">Fictional Name</label>
        <input id="wb-fname" class="wb-inp" type="text" placeholder="Ashkar, The Beacon…">
      </div>
      <div class="wb-field">
        <label class="wb-lbl">Common Name (in-universe)</label>
        <input id="wb-cname" class="wb-inp" type="text" placeholder="What characters call it">
      </div>
      <div class="wb-field">
        <label class="wb-lbl">Significance</label>
        <select id="wb-sig" class="wb-inp">
          <option value="NONE">None</option>
          <option value="MINOR">Minor</option>
          <option value="MAJOR">Major</option>
          <option value="CRITICAL">Critical</option>
          <option value="HOMEWORLD">Homeworld</option>
        </select>
      </div>
      <div class="wb-field">
        <label class="wb-lbl">First Contact / Discovery Era
          <button id="wb-era-toggle" class="wb-btn-sm"
            style="float:right;font-size:var(--fs-sm);padding:1px 7px;margin-top:-2px"
            title="Add new era">+ new era</button>
        </label>
        <select id="wb-era-fc" class="wb-inp">
          <option value="">— none —</option>
        </select>
        <!-- Inline add-era form -->
        <div id="wb-era-form" style="display:none;margin-top:6px;padding:8px;
             background:rgba(255,255,255,.04);border:1px solid rgba(160,80,220,.2);border-radius:4px">
          <div style="font-size:var(--fs-sm);color:#cc88ff;margin-bottom:6px">NEW ERA</div>
          <input id="wb-era-name" class="wb-inp" type="text" placeholder="Era name…"
            style="margin-bottom:5px">
          <div style="display:flex;gap:5px;margin-bottom:5px">
            <input id="wb-era-start" class="wb-inp" type="text" placeholder="Start (e.g. 2280 CE)" style="flex:1">
            <input id="wb-era-end"   class="wb-inp" type="text" placeholder="End" style="flex:1">
          </div>
          <div style="display:flex;gap:5px">
            <input id="wb-era-color" class="wb-inp" type="color" value="#4488cc"
              style="width:36px;padding:2px;cursor:pointer">
            <button id="wb-era-save" class="wb-btn-primary" style="flex:1">Add Era</button>
            <button id="wb-era-cancel" class="wb-btn-sm">Cancel</button>
          </div>
        </div>
      </div>
      <div class="wb-field">
        <label class="wb-lbl">Plot Notes <span style="color:var(--pdm);font-size:var(--fs-sm)">(lore, passages)</span></label>
        <textarea id="wb-plot" class="wb-inp" rows="4"
          style="resize:vertical;font-size:var(--fs-sm);line-height:1.5"></textarea>
      </div>
      <div class="wb-field">
        <label class="wb-lbl">Internal Notes <span style="color:var(--pdm);font-size:var(--fs-sm)">(reminders, TODOs)</span></label>
        <textarea id="wb-internal" class="wb-inp" rows="2"
          style="resize:vertical;font-size:var(--fs-sm);line-height:1.5"></textarea>
      </div>
      <!-- Tags -->
      <div class="wb-field">
        <label class="wb-lbl">Tags</label>
        <div id="wb-tags-display" style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:5px"></div>
        <div style="display:flex;gap:5px">
          <input id="wb-tag-input" class="wb-inp" type="text"
            placeholder="Add tag…" style="flex:1;font-size:var(--fs-sm)">
          <button id="wb-tag-add" class="wb-btn-sm">+</button>
        </div>
      </div>
      <button id="wb-save-star" class="wb-btn-primary" style="margin-top:10px;width:100%">
        ✓ Save Star Notes
      </button>
      <div id="wb-save-status" style="font-size:var(--fs-sm);color:#44cc88;text-align:center;margin-top:5px;min-height:1.4em"></div>
    </div>

    <!-- ── TAB: Universe ────────────────────────────────────────────── -->
    <div id="wb-tab-control" class="wb-tab-content" style="display:none">

      <!-- ── Eras ── -->
      <div style="font-size:var(--fs-sm);color:#cc88ff;letter-spacing:.09em;margin-bottom:6px">ERAS</div>
      <div id="wb-era-list" style="margin-bottom:8px;font-size:var(--fs-sm);color:var(--pdm)">Loading…</div>
      <div style="border:1px solid rgba(160,80,220,.18);border-radius:4px;padding:8px;margin-bottom:14px">
        <div style="font-size:var(--fs-sm);color:#cc88ff;margin-bottom:6px">ADD ERA</div>
        <input id="wb-u-era-name"  class="wb-inp" type="text" placeholder="Era name…" style="margin-bottom:5px">
        <div style="display:flex;gap:5px;margin-bottom:5px">
          <input id="wb-u-era-start" class="wb-inp" type="text" placeholder="Start" style="flex:1">
          <input id="wb-u-era-end"   class="wb-inp" type="text" placeholder="End"   style="flex:1">
        </div>
        <div style="display:flex;gap:5px">
          <input id="wb-u-era-color" class="wb-inp" type="color" value="#4488cc" style="width:36px;padding:2px;cursor:pointer">
          <button id="wb-u-era-save" class="wb-btn-primary" style="flex:1">+ Add Era</button>
        </div>
      </div>

      <!-- ── Civilizations ── -->
      <div style="font-size:var(--fs-sm);color:#cc88ff;letter-spacing:.09em;margin-bottom:6px">CIVILIZATIONS</div>
      <div id="wb-civ-list" style="margin-bottom:8px;font-size:var(--fs-sm);color:var(--pdm)">Loading…</div>
      <div style="border:1px solid rgba(160,80,220,.18);border-radius:4px;padding:8px;margin-bottom:14px">
        <div style="font-size:var(--fs-sm);color:#cc88ff;margin-bottom:6px">ADD CIVILIZATION</div>
        <input id="wb-civ-name"    class="wb-inp" type="text" placeholder="Civilization name…"  style="margin-bottom:5px">
        <input id="wb-civ-species" class="wb-inp" type="text" placeholder="Founding species…"   style="margin-bottom:5px">
        <input id="wb-civ-home"    class="wb-inp" type="text" placeholder="Homeworld name…"     style="margin-bottom:5px">
        <div style="display:flex;gap:5px">
          <input id="wb-civ-symbol" class="wb-inp" type="text" placeholder="★" style="width:50px;text-align:center">
          <input id="wb-civ-color"  class="wb-inp" type="color" value="#888888" style="width:36px;padding:2px;cursor:pointer">
          <button id="wb-civ-save" class="wb-btn-primary" style="flex:1">+ Add Civilization</button>
        </div>
      </div>

      <!-- ── Factions ── -->
      <div style="font-size:var(--fs-sm);color:#cc88ff;letter-spacing:.09em;margin-bottom:6px">FACTIONS</div>
      <div id="wb-faction-list" style="margin-bottom:8px;font-size:var(--fs-sm);color:var(--pdm)">Loading…</div>
      <div style="border:1px solid rgba(160,80,220,.18);border-radius:4px;padding:8px;margin-bottom:14px">
        <div style="font-size:var(--fs-sm);color:#cc88ff;margin-bottom:6px">ADD FACTION</div>
        <input id="wb-fac-name"  class="wb-inp" type="text" placeholder="Faction name…"   style="margin-bottom:5px">
        <input id="wb-fac-short" class="wb-inp" type="text" placeholder="Short name (EDI)" style="margin-bottom:5px">
        <div style="display:flex;gap:5px;margin-bottom:5px">
          <select id="wb-fac-civ" class="wb-inp" style="flex:1">
            <option value="">— No civilization —</option>
          </select>
          <select id="wb-fac-type" class="wb-inp" style="flex:1">
            <option>Empire</option><option>Republic</option><option>Corporation</option>
            <option>Collective</option><option>Theocracy</option><option>Alliance</option>
            <option>Rogue</option><option>Other</option>
          </select>
        </div>
        <div style="display:flex;gap:5px">
          <input id="wb-fac-color" class="wb-inp" type="color" value="#888888" style="width:36px;padding:2px;cursor:pointer">
          <button id="wb-fac-save" class="wb-btn-primary" style="flex:1">+ Add Faction</button>
        </div>
      </div>

      <!-- ── System Control (for selected star) ── -->
      <div style="font-size:var(--fs-sm);color:#cc88ff;letter-spacing:.09em;margin-bottom:4px">SYSTEM CONTROL
        <span id="wb-ctrl-star-name" style="color:var(--pdm);font-weight:normal;margin-left:6px"></span>
      </div>
      <div style="font-size:var(--fs-sm);color:var(--pdm);margin-bottom:8px">Who controls this system per era.</div>
      <div id="wb-control-list" style="margin-bottom:12px"></div>
      <div style="border:1px solid rgba(160,80,220,.2);border-radius:5px;padding:10px">
        <div style="font-size:var(--fs-sm);color:#cc88ff;margin-bottom:8px;letter-spacing:.08em">ADD ERA CONTROL</div>
        <div class="wb-field">
          <label class="wb-lbl">Era</label>
          <select id="wb-ctrl-era" class="wb-inp"></select>
        </div>
        <div class="wb-field">
          <label class="wb-lbl">Faction</label>
          <select id="wb-ctrl-faction" class="wb-inp">
            <option value="">— Unclaimed —</option>
          </select>
        </div>
        <div class="wb-field">
          <label class="wb-lbl">Status</label>
          <select id="wb-ctrl-status" class="wb-inp">
            <option>Claimed</option><option>Contested</option>
            <option>Blockaded</option><option>Abandoned</option>
            <option>Unknown</option><option>Restricted</option>
          </select>
        </div>
        <div class="wb-field">
          <label class="wb-lbl">Population</label>
          <input id="wb-ctrl-pop" class="wb-inp" type="text" placeholder="~2 billion, uninhabited…">
        </div>
        <div class="wb-field">
          <label class="wb-lbl">Military Tier</label>
          <select id="wb-ctrl-mil" class="wb-inp">
            <option value="0">0 — None</option><option value="1">1 — Outpost</option>
            <option value="2">2 — Garrison</option><option value="3">3 — Fortress</option>
          </select>
        </div>
        <div class="wb-field">
          <label class="wb-lbl">Notes</label>
          <input id="wb-ctrl-notes" class="wb-inp" type="text" placeholder="Brief note…">
        </div>
        <button id="wb-add-control" class="wb-btn-primary" style="width:100%">+ Add Control Record</button>
      </div>
    </div>

    <!-- ── TAB: Planets ──────────────────────────────────────────────── -->
    <div id="wb-tab-planets" class="wb-tab-content" style="display:none">
      <div style="font-size:var(--fs-sm);color:var(--pdm);margin-bottom:10px">
        Fictional or extended planet data for this system.
      </div>
      <div id="wb-planet-list" style="margin-bottom:12px"></div>
      <div id="wb-planet-form" style="border:1px solid rgba(160,80,220,.2);border-radius:5px;padding:10px">
        <div style="font-size:var(--fs-sm);color:#cc88ff;margin-bottom:8px;letter-spacing:.08em" id="wb-pf-title">ADD PLANET</div>
        <input type="hidden" id="wb-pf-id" value="">
        <div class="wb-field"><label class="wb-lbl">Fictional Name</label>
          <input id="wb-pf-fname" class="wb-inp" type="text" placeholder="Ashkar Prime"></div>
        <div class="wb-field"><label class="wb-lbl">Common Name</label>
          <input id="wb-pf-cname" class="wb-inp" type="text" placeholder="The Cradle"></div>
        <div class="wb-field"><label class="wb-lbl">Orbit (AU)</label>
          <input id="wb-pf-au" class="wb-inp" type="number" step="0.001" placeholder="1.0"></div>
        <!-- Physical properties -->
        <div style="font-size:var(--fs-sm);color:var(--pdm);margin:6px 0 4px;letter-spacing:.04em">PHYSICAL PROPERTIES</div>
        <div style="display:flex;gap:6px">
          <div class="wb-field" style="flex:1"><label class="wb-lbl">Radius (R⊕)</label>
            <input id="wb-pf-radius" class="wb-inp" type="number" step="0.01" min="0" placeholder="1.0"
              oninput="wbUpdateSizeClass()"></div>
          <div class="wb-field" style="flex:1"><label class="wb-lbl">Mass (M⊕)</label>
            <input id="wb-pf-massval" class="wb-inp" type="number" step="0.01" min="0" placeholder="1.0"
              oninput="wbUpdateMassDesc()"></div>
        </div>
        <!-- Size class derived from radius — read only -->
        <div class="wb-field">
          <label class="wb-lbl">Size Class <span style="color:var(--pdm);font-size:var(--fs-sm)">(auto from radius)</span></label>
          <div id="wb-pf-size-display" style="font-size:var(--fs-sm);color:#88bbff;padding:4px 0;min-height:1.4em">Earth-like</div>
          <input type="hidden" id="wb-pf-size" value="Earth-like">
        </div>
        <div class="wb-field"><label class="wb-lbl">Mass desc <span style="color:var(--pdm);font-size:var(--fs-sm)">(auto or override)</span></label>
          <input id="wb-pf-mass" class="wb-inp" type="text" placeholder="e.g. 0.8 M⊕, 1.2 MJ"></div>
        <!-- Orbital elements — used by exoplanet system viewer -->
        <div style="font-size:var(--fs-sm);color:var(--pdm);margin:6px 0 4px;letter-spacing:.04em">ORBITAL ELEMENTS</div>
        <div style="display:flex;gap:6px">
          <div class="wb-field" style="flex:1"><label class="wb-lbl">Period (days)</label>
            <input id="wb-pf-period" class="wb-inp" type="number" step="0.001" placeholder="365.25"></div>
          <div class="wb-field" style="flex:1"><label class="wb-lbl">Eccentricity</label>
            <input id="wb-pf-ecc" class="wb-inp" type="number" step="0.001" min="0" max="0.99" placeholder="0.0"></div>
        </div>
        <div style="display:flex;gap:6px">
          <div class="wb-field" style="flex:1"><label class="wb-lbl">Inclination (°)</label>
            <input id="wb-pf-inc" class="wb-inp" type="number" step="0.1" placeholder="0.0"></div>
          <div class="wb-field" style="flex:1"><label class="wb-lbl">Arg. Periastron (°)</label>
            <input id="wb-pf-argp" class="wb-inp" type="number" step="0.1" placeholder="0.0"></div>
        </div>
        <div class="wb-field"><label class="wb-lbl">World Type</label>
          <select id="wb-pf-type" class="wb-inp">
            <option>Rocky</option><option>Ocean</option><option>Desert</option>
            <option>Ice</option><option>Gas</option><option>Jungle</option>
            <option>Toxic</option><option>Barren</option><option>Artificial</option><option>Other</option>
          </select></div>

        <div class="wb-field"><label class="wb-lbl">Atmosphere</label>
          <select id="wb-pf-atm" class="wb-inp">
            <option>None</option><option>Thin</option><option>Breathable</option>
            <option>Toxic</option><option>Dense</option><option>Exotic</option>
          </select></div>
        <div class="wb-field"><label class="wb-lbl">Temperature</label>
          <select id="wb-pf-temp" class="wb-inp">
            <option>Frozen</option><option>Cold</option><option>Temperate</option>
            <option>Warm</option><option>Hot</option><option>Infernal</option>
          </select></div>
        <div class="wb-field"><label class="wb-lbl">Native Life</label>
          <select id="wb-pf-life" class="wb-inp">
            <option>None</option><option>Microbial</option><option>Plant</option>
            <option>Complex</option><option>Sentient</option>
          </select></div>
        <div class="wb-field"><label class="wb-lbl">Habitable</label>
          <select id="wb-pf-hab" class="wb-inp"><option value="0">No</option><option value="1">Yes</option></select>
        </div>
        <div class="wb-field"><label class="wb-lbl">Significance</label>
          <select id="wb-pf-sig" class="wb-inp">
            <option value="NONE">None</option><option value="MINOR">Minor</option>
            <option value="MAJOR">Major</option><option value="CRITICAL">Critical</option>
            <option value="HOMEWORLD">Homeworld</option>
          </select></div>
        <div class="wb-field"><label class="wb-lbl">Plot Notes</label>
          <textarea id="wb-pf-notes" class="wb-inp" rows="3" style="resize:vertical;font-size:var(--fs-sm)"></textarea></div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button id="wb-save-planet" class="wb-btn-primary" style="flex:1">✓ Save Planet</button>
          <button id="wb-cancel-planet" class="wb-btn-sm" style="display:none">Cancel</button>
        </div>
      </div>
    </div>

    <!-- ── TAB: Moons ─────────────────────────────────────────────── -->
    <div id="wb-tab-moons" class="wb-tab-content" style="display:none">
      <div style="font-size:var(--fs-sm);color:var(--pdm);margin-bottom:10px">
        Moons for the selected planet. Select a planet from the Planets tab first.
      </div>
      <div id="wb-moon-context" style="margin-bottom:10px;padding:6px 8px;
        background:rgba(255,255,255,.04);border-radius:4px;display:none">
        <span style="font-size:var(--fs-sm);color:#88bbff">🌙 Planet: </span>
        <span id="wb-moon-planet-label" style="font-size:var(--fs-sm);color:var(--ptx)">—</span>
      </div>
      <div id="wb-moon-list" style="margin-bottom:12px">
        <div style="font-size:var(--fs-sm);color:var(--pdm)">Select a planet from the Planets tab to manage its moons.</div>
      </div>
      <!-- Moon form -->
      <div id="wb-moon-form" style="border:1px solid rgba(100,150,255,.2);border-radius:5px;padding:10px;display:none">
        <div style="font-size:var(--fs-sm);color:#88bbff;margin-bottom:8px;letter-spacing:.08em" id="wb-mf-title">ADD MOON</div>
        <input type="hidden" id="wb-mf-id" value="">
        <div class="wb-field"><label class="wb-lbl">Fictional Name</label>
          <input id="wb-mf-fname" class="wb-inp" type="text" placeholder="Aethon"></div>
        <div class="wb-field"><label class="wb-lbl">Common Name</label>
          <input id="wb-mf-cname" class="wb-inp" type="text" placeholder="The Pale Shepherd"></div>
        <div style="font-size:var(--fs-sm);color:var(--pdm);margin:6px 0 4px;letter-spacing:.04em">ORBITAL ELEMENTS</div>
        <div style="display:flex;gap:6px">
          <div class="wb-field" style="flex:1"><label class="wb-lbl">Orbit (Rp)</label>
            <input id="wb-mf-orbit" class="wb-inp" type="number" step="0.01" placeholder="10.0"></div>
          <div class="wb-field" style="flex:1"><label class="wb-lbl">Period (days)</label>
            <input id="wb-mf-period" class="wb-inp" type="number" step="0.001" placeholder="7.0"></div>
        </div>
        <div style="display:flex;gap:6px">
          <div class="wb-field" style="flex:1"><label class="wb-lbl">Eccentricity</label>
            <input id="wb-mf-ecc" class="wb-inp" type="number" step="0.001" min="0" max="0.99" placeholder="0.0"></div>
          <div class="wb-field" style="flex:1"><label class="wb-lbl">Inclination (°)</label>
            <input id="wb-mf-inc" class="wb-inp" type="number" step="0.1" placeholder="0.0"></div>
        </div>
        <div style="font-size:var(--fs-sm);color:var(--pdm);margin:6px 0 4px;letter-spacing:.04em">PHYSICAL PROPERTIES</div>
        <div style="display:flex;gap:6px">
          <div class="wb-field" style="flex:1"><label class="wb-lbl">Radius (km)</label>
            <input id="wb-mf-radius" class="wb-inp" type="number" step="1" placeholder="500"></div>
          <div class="wb-field" style="flex:1"><label class="wb-lbl">Mass (M⊕)</label>
            <input id="wb-mf-mass" class="wb-inp" type="number" step="0.0001" placeholder="0.012"></div>
        </div>
        <div class="wb-field"><label class="wb-lbl">World Type</label>
          <select id="wb-mf-type" class="wb-inp">
            <option>Rocky</option><option>Ice</option><option>Ocean</option>
            <option>Desert</option><option>Toxic</option><option>Artificial</option><option>Other</option>
          </select></div>
        <div class="wb-field"><label class="wb-lbl">Atmosphere</label>
          <select id="wb-mf-atm" class="wb-inp">
            <option>None</option><option>Thin</option><option>Breathable</option>
            <option>Toxic</option><option>Dense</option><option>Exotic</option>
          </select></div>
        <div style="display:flex;gap:6px">
          <div class="wb-field" style="flex:1"><label class="wb-lbl">Native Life</label>
            <select id="wb-mf-life" class="wb-inp">
              <option>None</option><option>Microbial</option><option>Simple</option>
              <option>Complex</option><option>Sapient</option>
            </select></div>
          <div class="wb-field" style="flex:1"><label class="wb-lbl">Habitable</label>
            <select id="wb-mf-hab" class="wb-inp">
              <option value="0">No</option><option value="1">Yes</option>
            </select></div>
        </div>
        <div style="font-size:var(--fs-sm);color:var(--pdm);margin:6px 0 4px;letter-spacing:.04em">WORLDBUILDING</div>
        <div class="wb-field"><label class="wb-lbl">Significance</label>
          <select id="wb-mf-sig" class="wb-inp">
            <option value="NONE">None</option><option value="MINOR">Minor</option>
            <option value="MAJOR">Major</option><option value="CRITICAL">Critical</option>
          </select></div>
        <div class="wb-field"><label class="wb-lbl">Plot Notes</label>
          <textarea id="wb-mf-notes" class="wb-inp" rows="2" style="resize:vertical;font-size:var(--fs-sm)"></textarea></div>
        <div class="wb-field"><label class="wb-lbl">Internal Notes</label>
          <textarea id="wb-mf-inotes" class="wb-inp" rows="2" style="resize:vertical;font-size:var(--fs-sm)"></textarea></div>
        <div style="font-size:var(--fs-sm);color:var(--pdm);margin:6px 0 4px;letter-spacing:.04em">ERA CONTROL</div>
        <div id="wb-moon-era-rows" style="margin-bottom:6px"></div>
        <div style="font-size:var(--fs-sm);color:var(--pdm);margin:6px 0 4px;letter-spacing:.04em">SURFACE MAP</div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <label id="wb-mf-map-label" style="cursor:pointer;padding:4px 10px;border-radius:8px;
            font-size:var(--fs-sm);background:rgba(0,102,204,0.18);color:#003388;
            border:1.5px solid rgba(0,102,204,0.40)">
            🌍 Upload Map
            <input type="file" id="wb-mf-map-input" accept="image/*" style="display:none">
          </label>
          <a id="wb-mf-map-clear" href="#" style="display:none;font-size:var(--fs-sm);color:#cc4444">✕ Remove</a>
        </div>
        <div id="wb-mf-map-name" style="font-size:calc(var(--fs)*0.78);color:var(--pdm)">No map · equirectangular PNG/JPG</div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button id="wb-save-moon" class="wb-btn-primary" style="flex:1">✓ Save Moon</button>
          <button id="wb-cancel-moon" class="wb-btn-sm" style="display:none">Cancel</button>
        </div>
      </div>
      <button id="wb-add-moon-btn" class="wb-btn-sm" style="width:100%;margin-top:8px;display:none">
        + Add Moon
      </button>
    </div>

  </div><!-- end scroll area -->
</div>`;
  document.body.appendChild(div.firstElementChild);
  // Wire up all panel event listeners immediately after injection
  if(typeof wbWirePanel === 'function') wbWirePanel();
}
