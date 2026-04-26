/*
// v0.9.4
 * worldbuilding.js
 * Shared Worldbuilding Panel logic.
 * Used by: index.html, exoplanet-system.html
 *
 * Requires:
 *   - $ helper: const $=id=>document.getElementById(id)
 *   - WB_API const or /api/world base
 *   - worldbuilding.css loaded
 *
 * Context-aware:
 *   - loadWbPlanetHips() called only if defined (index.html only)
 *   - btn-wb handler attached only if element exists
 */

//  WORLDBUILDING PANEL
// ══════════════════════════════════════════════════════════════════════════════
// $ helper — safe to redeclare since pages may define it too
if(typeof $ === 'undefined') var $ = id => document.getElementById(id);
// WB_API — use page-defined value if present, else default
if(typeof WB_API === 'undefined') var WB_API = '/api/world';
// exoCsvText — declared by each page (index.html uses let, exo viewer uses window.exoCsvText)
// worldbuilding.js reads it via typeof guard in wbGetNasaPlanets
let wbState = { star:null, starRecord:null, eras:[], factions:[], tags:[], planets:[] };
let wbCurrentStarHip = null;

// ── API helpers ───────────────────────────────────────────────────────────────
async function wbGet(path){ try{ const r=await fetch(WB_API+path); return r.ok?r.json():null; }catch(e){ return null; } }
async function wbPost(path,body){ try{ const r=await fetch(WB_API+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); if(!r.ok){console.warn('wbPost',path,r.status,await r.text().catch(()=>'')); return null;} return r.json(); }catch(e){ console.warn('wbPost error',path,e.message); return null; } }
async function wbPut(path,body){ try{ const r=await fetch(WB_API+path,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); if(!r.ok){console.warn('wbPut',path,r.status,await r.text().catch(()=>'')); return null;} return r.json(); }catch(e){ console.warn('wbPut error',path,e.message); return null; } }
async function wbDelete(path){ try{ const r=await fetch(WB_API+path,{method:'DELETE'}); return r.ok?r.json():null; }catch(e){ return null; } }

// ── Load reference data (eras, factions, tags) ────────────────────────────────
// ── Auto-create star record if it doesn't exist ───────────────────────────────
async function wbEnsureStarRecord(){
  if(wbState.starRecord) return true;
  const star = wbState.star;
  if(!star) return false;

  // Try to create the star record
  const r = await fetch(WB_API+'/stars',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      hip: star.hip||null, hd: star.hd||null,
      fictional_name:'', common_name:'',
      significance:'NONE', plot_notes:'', internal_notes:''
    })
  }).catch(()=>null);

  // Whether POST succeeded (201) or failed (e.g. 500 UNIQUE constraint),
  // always try to fetch the record — it may already exist
  const fresh = star.hip ? await wbGet('/stars/by_hip/'+star.hip) : null;
  if(fresh){ wbState.starRecord = fresh; return true; }

  // If we get here, both POST and GET failed — API is genuinely down
  if(r) console.warn('wbEnsureStarRecord POST', r.status);
  return false;
}

async function wbLoadRefs(){
  const [eras, factions, tags] = await Promise.all([
    wbGet('/eras'), wbGet('/factions'), wbGet('/tags')
  ]);
  wbState.eras     = eras     || [];
  wbState.factions = factions || [];
  wbState.tags     = tags     || [];
  wbPopulateEraSelects();
  wbPopulateFactionSelects();
}

function wbPopulateEraSelects(){
  const opts = wbState.eras.map(e=>`<option value="${e.id}">${e.name}</option>`).join('');
  $('wb-era-fc').innerHTML  = '<option value="">— none —</option>' + opts;
  $('wb-ctrl-era').innerHTML = opts || '<option value="">No eras — add one in settings</option>';
}

function wbPopulateFactionSelects(){
  const opts = wbState.factions.map(f=>`<option value="${f.id}">${f.name}${f.civ_name?' ('+f.civ_name+')':''}</option>`).join('');
  $('wb-ctrl-faction').innerHTML = '<option value="">— Unclaimed —</option>' + opts;
}

// ── Open panel for a star ────────────────────────────────────────────────────
async function wbOpenForStar(star){
  wbCurrentStarHip = star.hip || null;
  $('wb-star-label').textContent = star.name || 'Unknown';
  $('wb-panel').style.display = 'flex';

  await wbLoadRefs();

  // Fetch existing record by HIP
  const rec = star.hip ? await wbGet('/stars/by_hip/'+star.hip) : null;
  wbState.starRecord = rec;
  wbState.star = star;

  // ── HYG catalog reference box ────────────────────────────────────────────
  const hyg = [
    ['Spectral',    star.spect || '—'],
    ['Distance',    star.dist_ly ? star.dist_ly.toFixed(3)+' ly' : '—'],
    ['Abs Mag',     isFinite(star.absmag) ? star.absmag.toFixed(2) : '—'],
    ['Luminosity',  star.lum ? (star.lum < 0.01 ? star.lum.toExponential(2) : star.lum.toFixed(3))+' L☉' : '—'],
    ['HIP / HD',    (star.hip?'HIP '+star.hip:'—')+(star.hd?' · HD '+star.hd:'')],
  ];
  // Habitable zone from luminosity (Kopparapu conservative edges)
  if(star.lum && star.lum>0){
    const inner = Math.sqrt(star.lum/1.1).toFixed(2);
    const outer = Math.sqrt(star.lum/0.53).toFixed(2);
    hyg.push(['Hab Zone', `${inner} – ${outer} AU`]);
  }
  $('wb-hyg-rows').innerHTML = hyg.map(([lbl,val])=>
    `<div style="display:flex;justify-content:space-between;margin-bottom:3px">
       <span style="color:var(--pdm);min-width:80px">${lbl}</span>
       <span style="color:var(--ptx);text-align:right">${val}</span>
     </div>`
  ).join('');
  $('wb-hyg-box').style.display = '';

  // Populate star tab
  $('wb-fname').value    = rec?.fictional_name  || '';
  $('wb-cname').value    = rec?.common_name     || '';
  $('wb-sig').value      = rec?.significance    || 'NONE';
  $('wb-era-fc').value   = rec?.first_contact_era || '';
  $('wb-plot').value     = rec?.plot_notes      || '';
  $('wb-internal').value = rec?.internal_notes  || '';

  // Tags
  wbState.tags = (await wbGet('/tags')) || [];
  wbRenderTags(rec?.tags || []);

  // Render control, planet tabs, and connections
  wbRenderControls(rec?.era_control || []);
  await wbLoadPlanets();
  await wbLoadConnections();

  // Switch to star tab
  wbSwitchTab('wb-tab-star');
}

// ── Tab switching ─────────────────────────────────────────────────────────────
function wbSwitchTab(tabId){
  document.querySelectorAll('.wb-tab-content').forEach(el=>el.style.display='none');
  document.querySelectorAll('.wb-tab').forEach(btn=>{
    const active = btn.dataset.tab === tabId;
    btn.classList.toggle('active', active);
    btn.style.color = active ? '#cc88ff' : 'var(--pdm)';
    btn.style.borderBottomColor = active ? '#cc88ff' : 'transparent';
  });
  $(tabId).style.display = '';
  // Side effects per tab
  if(tabId === 'wb-tab-control'){
    // Always refresh refs so era/faction/civ forms have current data
    wbLoadRefs().then(()=>wbRenderUniverseLists());
  }
  if(tabId === 'wb-tab-planets' && wbState.star){
    wbLoadPlanets();
  }
  if(tabId === 'wb-tab-moons' && wbMoonPlanet){
    wbLoadMoons();
  }
  if(tabId === 'wb-tab-links'){
    wbLoadConnections();
  }
}


// ── Wire up DOM event listeners after panel is injected ────────────────────
function wbRenderTags(activeTags){
  const box = $('wb-tags-display');
  box.innerHTML = '';
  (activeTags||[]).forEach(t=>{
    const el = document.createElement('span');
    el.className = 'wb-tag';
    el.style.background = (t.color||'#888888')+'33';
    el.style.border = '1px solid '+(t.color||'#888888')+'66';
    el.style.color = t.color||'#aaaaaa';
    el.innerHTML = `${t.name} <button title="Remove">✕</button>`;
    el.querySelector('button').onclick = async()=>{
      if(!wbState.starRecord) return;
      await wbPost('/tags/unlink',{tag_id:t.id,entity_type:'star',entity_id:wbState.starRecord.id});
      wbOpenForStar(wbState.star);
    };
    box.appendChild(el);
  });
}

function wbRenderControls(controls){
  const box = $('wb-control-list');
  if(!controls.length){ box.innerHTML = '<div style="font-size:var(--fs-sm);color:var(--pdm);margin-bottom:8px">No era control records yet.</div>'; return; }
  box.innerHTML = controls.map(c=>`
    <div class="wb-ctrl-row">
      <div class="wb-ctrl-hdr">
        <span style="font-size:var(--fs-sm);color:#cc88ff">${c.era_name||'Era '+c.era_id}</span>
        <button onclick="wbDeleteControl(${c.id})" class="wb-btn-sm" style="font-size:11px;padding:1px 6px">✕</button>
      </div>
      <div style="font-size:var(--fs-sm);color:var(--ptx)">
        ${c.faction_name||'Unclaimed'} · <span style="color:var(--pdm)">${c.status}</span>
        ${c.population?'<br>Pop: '+c.population:''}
        ${c.military_tier?'<br>Mil tier: '+c.military_tier:''}
        ${c.notes?'<br><em style="color:var(--pdm)">'+c.notes+'</em>':''}
      </div>
    </div>`).join('');
}

function wbGetNasaPlanets(star){
  if(typeof exoCsvText === 'undefined' || !exoCsvText) return [];
  const lines = exoCsvText.split('\n');
  const cols  = lines[0].split(',').map(c=>c.trim().replace(/"/g,'').toLowerCase());
  const ci = n => cols.indexOf(n);
  const pf = s => parseFloat((s||'').replace(/"/g,'').trim()) || 0;
  const ps = s => (s||'').replace(/"/g,'').trim();

  const iName=ci('pl_name'), iHost=ci('hostname');
  const iHip=ci('hip_name'), iHd=ci('hd_name');
  const iA=ci('pl_orbsmax'), iPer=ci('pl_orbper'), iEcc=ci('pl_orbeccen');
  const iRad=ci('pl_rade'),  iMas=ci('pl_bmasse'), iEqt=ci('pl_eqt');
  const iDm=ci('discoverymethod'), iDy=ci('disc_year');

  const results = [];
  for(let i=1;i<lines.length;i++){
    const p = lines[i].split(','); if(p.length<5) continue;
    const hip = ps(p[iHip]).replace(/^HIP\s*/i,'').trim();
    const hd  = ps(p[iHd ]).replace(/^HD\s*/i, '').trim();
    const host= ps(p[iHost]);
    const match =
      (star.hip && hip && String(star.hip)===hip) ||
      (star.hd  && hd  && String(star.hd )===hd ) ||
      (host && star.name && host.toLowerCase()===star.name.toLowerCase());
    if(!match) continue;

    const r_e=pf(p[iRad]), m_e=pf(p[iMas]), eqt=pf(p[iEqt]);
    // Auto-classify
    const sizeClass = r_e>10?'Gas Giant':r_e>3.5?'Neptune-like':r_e>1.7?'Super-Earth':'Earth-like';
    const tempClass = eqt<150?'Frozen':eqt<273?'Cold':eqt<350?'Temperate':eqt<500?'Warm':eqt<1000?'Hot':'Infernal';
    const habitable = (eqt>273&&eqt<370&&r_e>0&&r_e<2.5) ? 1 : 0;
    const massDesc  = m_e>=318 ? (m_e/318).toFixed(2)+' MJ' : m_e>0 ? m_e.toFixed(2)+' M⊕' : '';

    results.push({
      nasa_pl_name: ps(p[iName]),
      host, orbit_au: pf(p[iA])||null,
      period_days:  pf(p[iPer])||null,
      eccentricity: pf(p[iEcc])||0,
      radius_earth: r_e||null, mass_earth: m_e||null,
      mass_desc: massDesc, size_class: sizeClass,
      temperature: tempClass, habitable,
      dm: ps(p[iDm]), dy: ps(p[iDy]),
    });
  }
  return results;
}

function wbRenderPlanets(planets){
  const box  = $('wb-planet-list');
  const star = wbState.star;
  const nasa = star ? wbGetNasaPlanets(star) : [];

  // Saved planet nasa_pl_names — to know which NASA ones are already imported
  const importedNames = new Set(planets.map(p=>p.nasa_pl_name).filter(Boolean));
  const unimported = nasa.filter(n=>!importedNames.has(n.nasa_pl_name));

  let html = '';

  // ── NASA catalog section ─────────────────────────────────────────────────
  if(nasa.length){
    html += `<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
        <span style="font-size:var(--fs-sm);color:#88bbff;letter-spacing:.07em">
          ⬡ NASA CATALOG — ${nasa.length} CONFIRMED PLANET${nasa.length>1?'S':''}
        </span>
        ${unimported.length ? `<button onclick="wbImportAll()" class="wb-btn-sm"
          style="font-size:10px;padding:1px 8px">Import All</button>` : ''}
      </div>`;

    html += nasa.map(n => {
      const already = importedNames.has(n.nasa_pl_name);
      return `<div class="wb-planet-card" style="border-color:rgba(68,153,255,.2);opacity:${already?'.5':'1'}">
        <div class="wb-planet-hdr">
          <span style="font-size:var(--fs-sm);color:#88bbff">${n.nasa_pl_name}
            ${already?'<span style="color:var(--pdm);font-size:10px"> · imported</span>':''}</span>
          ${!already?`<button onclick="wbImportNasa(${JSON.stringify(n).replace(/"/g,'&quot;')})"
            class="wb-btn-sm" style="font-size:10px;padding:1px 6px">Import</button>`:''}
        </div>
        <div style="font-size:var(--fs-sm);color:var(--pdm)">
          ${n.size_class} · ${n.temperature}
          ${n.orbit_au?'· '+n.orbit_au.toFixed(3)+' AU':''}
          ${n.mass_desc?'· '+n.mass_desc:''}
          ${n.radius_earth?'· '+n.radius_earth.toFixed(2)+' R⊕':''}
          ${n.habitable?'<span style="color:#44cc88"> · ★ Hab candidate</span>':''}
          <br>${n.dm||'unknown method'}${n.dy?' ('+n.dy+')':''}
        </div>
      </div>`;
    }).join('');
    html += '</div>';
  }

  // ── User saved planets section ───────────────────────────────────────────
  if(planets.length){
    html += `<div style="font-size:var(--fs-sm);color:#44ffaa;letter-spacing:.07em;margin-bottom:5px">
      YOUR PLANETS (${planets.length})</div>`;
    html += planets.map(p=>`
      <div class="wb-planet-card">
        <div class="wb-planet-hdr">
          <span style="font-size:var(--fs-sm);color:#44ffaa">
            ${p.fictional_name||p.nasa_pl_name||'Planet '+p.id}
            ${p.nasa_pl_name&&p.fictional_name?`<span style="color:var(--pdm);font-size:10px"> (${p.nasa_pl_name})</span>`:''}
          </span>
          <div style="display:flex;gap:4px">
            <button onclick="wbEditPlanet(${p.id})" class="wb-btn-sm" style="font-size:10px;padding:1px 5px">edit</button>
            <button onclick="wbOpenMoons(${p.id},'${(p.fictional_name||p.nasa_pl_name||'Planet '+p.id).replace(/'/g,"\\\'")}')" class="wb-btn-sm" style="font-size:10px;padding:1px 5px">🌙</button>
            <button onclick="wbDeletePlanet(${p.id})" class="wb-btn-sm" style="font-size:10px;padding:1px 5px">✕</button>
          </div>
        </div>
        <div style="font-size:var(--fs-sm);color:var(--pdm)">
          ${p.world_type} · ${p.size_class} · ${p.atmosphere}
          ${p.orbit_au?'<br>'+p.orbit_au.toFixed(3)+' AU':''}
          ${p.period_days?'· '+p.period_days.toFixed(2)+'d':''}
          ${p.eccentricity?'· e='+p.eccentricity.toFixed(3):''}
          ${p.radius_earth?'<br>'+p.radius_earth.toFixed(2)+' R⊕':''}${p.mass_earth?' · '+p.mass_earth.toFixed(2)+' M⊕':''}
          ${p.mass_desc?'<br>Mass: <span style="color:var(--ptx)">'+p.mass_desc+'</span>':''}
          ${p.plot_notes?'<br><em>'+p.plot_notes.slice(0,80)+(p.plot_notes.length>80?'…':'')+'</em>':''}
        </div>
      </div>`).join('');
  } else if(!nasa.length){
    html = '<div style="font-size:var(--fs-sm);color:var(--pdm);margin-bottom:8px">No planets added yet.</div>';
  }

  box.innerHTML = html;
}

function sizeClassFromRadius(r){
  if(!r || r<=0)  return 'Earth-like'; // default when no radius given
  if(r < 0.5)    return 'Moonlet';
  if(r < 1.25)   return 'Small';
  if(r < 1.7)    return 'Earth-like';
  if(r < 3.5)    return 'Super-Earth';
  if(r < 10)     return 'Neptune-like';
  return 'Gas Giant';
}

function wbUpdateSizeClass(){
  const r = parseFloat($('wb-pf-radius').value)||0;
  const sc = sizeClassFromRadius(r);
  $('wb-pf-size').value = sc;
  $('wb-pf-size-display').textContent = sc;
}

function wbUpdateMassDesc(){
  // Only auto-fill mass desc if user hasn't typed their own
  const m = parseFloat($('wb-pf-massval').value)||0;
  if(!m) return;
  const desc = m >= 318 ? (m/318).toFixed(2)+' MJ' : m.toFixed(2)+' M⊕';
  $('wb-pf-mass').value = desc;
}

// ── Universe tab: render lists ────────────────────────────────────────────────
async function wbRenderUniverseLists(){
  await wbLoadRefs();

  // Eras list
  const eraBox=$('wb-era-list');
  eraBox.innerHTML = wbState.eras.length
    ? wbState.eras.map(e=>`
        <div style="display:flex;justify-content:space-between;align-items:center;
             padding:4px 0;border-bottom:1px solid rgba(160,80,220,.1)">
          <span>
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;
              background:${e.color||'#4488cc'};margin-right:6px;vertical-align:middle"></span>
            <b style="color:var(--ptx)">${e.name}</b>
            ${e.start_desc?`<span style="color:var(--pdm);font-size:var(--fs-sm)"> · ${e.start_desc}${e.end_desc?' – '+e.end_desc:''}</span>`:''}
          </span>
          <button onclick="wbDeleteEra(${e.id})" class="wb-btn-sm"
            style="font-size:10px;padding:1px 5px">✕</button>
        </div>`).join('')
    : '<span style="color:var(--pdm)">No eras yet.</span>';

  // Civs list
  const civBox=$('wb-civ-list');
  const civs = wbState.factions.length
    ? [...new Set(wbState.factions.map(f=>f.civ_name).filter(Boolean))] : [];
  const allCivs = await wbGet('/civilizations') || [];
  civBox.innerHTML = allCivs.length
    ? allCivs.map(c=>`
        <div style="display:flex;justify-content:space-between;align-items:center;
             padding:4px 0;border-bottom:1px solid rgba(160,80,220,.1)">
          <span>
            <span style="color:${c.color||'#888'};margin-right:5px">${c.symbol||'★'}</span>
            <b style="color:var(--ptx)">${c.name}</b>
            ${c.species?`<span style="color:var(--pdm);font-size:var(--fs-sm)"> · ${c.species}</span>`:''}
          </span>
          <button onclick="wbDeleteCiv(${c.id})" class="wb-btn-sm"
            style="font-size:10px;padding:1px 5px">✕</button>
        </div>`).join('')
    : '<span style="color:var(--pdm)">No civilizations yet.</span>';

  // Populate civ select in faction form
  $('wb-fac-civ').innerHTML = '<option value="">— No civilization —</option>' +
    allCivs.map(c=>`<option value="${c.id}">${c.symbol||''} ${c.name}</option>`).join('');

  // Factions list
  const facBox=$('wb-faction-list');
  facBox.innerHTML = wbState.factions.length
    ? wbState.factions.map(f=>`
        <div style="display:flex;justify-content:space-between;align-items:center;
             padding:4px 0;border-bottom:1px solid rgba(160,80,220,.1)">
          <span>
            <span style="display:inline-block;width:10px;height:10px;border-radius:2px;
              background:${f.color||'#888'};margin-right:6px;vertical-align:middle"></span>
            <b style="color:var(--ptx)">${f.name}</b>${f.short_name?' ('+f.short_name+')':''}
            ${f.civ_name?`<span style="color:var(--pdm);font-size:var(--fs-sm)"> · ${f.civ_name}</span>`:''}
            <span style="color:var(--pdm);font-size:var(--fs-sm)"> · ${f.type||''}</span>
          </span>
          <button onclick="wbDeleteFaction(${f.id})" class="wb-btn-sm"
            style="font-size:10px;padding:1px 5px">✕</button>
        </div>`).join('')
    : '<span style="color:var(--pdm)">No factions yet.</span>';

  // Show current star name in control section
  const sn = wbState.star?.name||'';
  $('wb-ctrl-star-name').textContent = sn ? '— '+sn : '';
}

async function wbLoadPlanets(){
  const box = $('wb-planet-list');
  if(!wbState.starRecord){
    // No WB record yet — still show NASA planets if available
    wbRenderPlanets([]);
    return;
  }
  const planets = await wbGet('/planets/by_star/'+wbState.starRecord.id) || [];
  wbState.planets = planets;
  wbRenderPlanets(planets);
}


// ══════════════════════════════════════════════════════════════════════════════
//  MOON TAB
// ══════════════════════════════════════════════════════════════════════════════

let wbMoonPlanet = null;  // {id, name} of currently selected planet for moons

// Called when user clicks "🌙 Moons" on a planet card
window.wbOpenMoons = async(planetId, planetName)=>{
  wbMoonPlanet = {id: planetId, name: planetName};
  // Show context label
  const ctx = $('wb-moon-context');
  if(ctx){ ctx.style.display=''; }
  const lbl = $('wb-moon-planet-label');
  if(lbl) lbl.textContent = planetName;
  // Show add button and form
  const addBtn = $('wb-add-moon-btn');
  if(addBtn) addBtn.style.display='';
  const form = $('wb-moon-form');
  if(form) form.style.display='';
  // Switch to moons tab
  const t = document.querySelector('.wb-tab[data-tab="wb-tab-moons"]');
  if(t) t.click();
  await wbLoadMoons();
};

async function wbLoadMoons(){
  const box = $('wb-moon-list');
  if(!box) return;
  if(!wbMoonPlanet){
    box.innerHTML='<div style="font-size:var(--fs-sm);color:var(--pdm)">Select a planet from the Planets tab to manage its moons.</div>';
    return;
  }
  const moons = await wbGet('/moons/by_planet/'+wbMoonPlanet.id) || [];
  wbRenderMoons(moons);
}


window.wbEditMoon = async(id)=>{
  const moons = await wbGet('/moons/by_planet/'+wbMoonPlanet.id) || [];
  const m = moons.find(x=>x.id===id);
  if(!m) return;
  $('wb-mf-title').textContent='EDIT MOON';
  $('wb-mf-id').value       = m.id;
  $('wb-mf-fname').value    = m.fictional_name||'';
  $('wb-mf-cname').value    = m.common_name||'';
  $('wb-mf-orbit').value    = m.orbit_radii||'';
  $('wb-mf-period').value   = m.period_days||'';
  $('wb-mf-ecc').value      = m.eccentricity||'';
  $('wb-mf-inc').value      = m.inclination||'';
  $('wb-mf-radius').value   = m.radius_km||'';
  if($('wb-mf-mass'))  $('wb-mf-mass').value  = m.mass_earth||'';
  $('wb-mf-type').value     = m.world_type||'Rocky';
  $('wb-mf-atm').value      = m.atmosphere||'None';
  if($('wb-mf-life'))  $('wb-mf-life').value  = m.native_life||'None';
  if($('wb-mf-hab'))   $('wb-mf-hab').value   = m.habitable?'1':'0';
  $('wb-mf-sig').value      = m.significance||'NONE';
  $('wb-mf-notes').value    = m.plot_notes||'';
  if($('wb-mf-inotes')) $('wb-mf-inotes').value = m.internal_notes||'';
  // Surface map
  if($('wb-mf-map-name')){
    if(m.surface_map){
      $('wb-mf-map-name').textContent = m.surface_map;
      if($('wb-mf-map-clear')) $('wb-mf-map-clear').style.display='';
    } else {
      $('wb-mf-map-name').textContent = 'No map · equirectangular PNG/JPG';
      if($('wb-mf-map-clear')) $('wb-mf-map-clear').style.display='none';
    }
  }
  // Era state
  await wbRenderMoonEraRows(m.id);
  if($('wb-cancel-moon')) $('wb-cancel-moon').style.display='';
  $('wb-mf-fname').focus();
};

window.wbDeleteMoon = async(id)=>{
  if(!confirm('Delete this moon?')) return;
  await wbDelete('/moons/'+id);
  await wbLoadMoons();
};

// ── MOON SURFACE MAP HELPERS ──────────────────────────────────────────────────
let wbMoonPendingMap = null;  // File object staged for upload on save
let wbMoonClearMap   = false; // flag: remove map on next save

async function wbUploadMoonMap(moonId, file){
  return new Promise((resolve)=>{
    const reader = new FileReader();
    reader.onload = async e=>{
      try{
        await fetch(`/api/world/moons/${moonId}/surface_map`,{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({data_url:e.target.result})
        });
      }catch(err){ console.warn('Moon map upload failed:',err); }
      resolve();
    };
    reader.readAsDataURL(file);
  });
}

// ── MOON ERA STATE HELPERS ────────────────────────────────────────────────────
async function wbRenderMoonEraRows(moonId){
  const box = $('wb-moon-era-rows');
  if(!box || !moonId) return;
  const eras     = await wbGet('/eras') || [];
  const factions = await wbGet('/factions') || [];
  const states   = await wbGet(`/moons/${moonId}/era_states`) || [];
  if(!eras.length){ box.innerHTML='<div style="font-size:var(--fs-sm);color:var(--pdm)">No eras defined.</div>'; return; }

  const stateMap = {};
  states.forEach(s=>{ stateMap[s.era_id]=s; });

  box.innerHTML = eras.map(era=>{
    const st = stateMap[era.id]||{};
    const facOptions = factions.map(f=>
      `<option value="${f.id}" ${st.faction_id===f.id?'selected':''}>${f.name}</option>`
    ).join('');
    return `<div style="background:rgba(0,0,0,0.04);border-radius:6px;padding:6px 8px;margin-bottom:5px">
      <div style="font-size:var(--fs-sm);font-weight:600;color:#4466aa;margin-bottom:4px">${era.name}</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap">
        <select class="wb-inp" style="flex:1;font-size:var(--fs-sm)" onchange="wbSaveMoonEraState(${moonId},${era.id},this.closest('div.mes-row'))">
          <option value="">— Unclaimed —</option>${facOptions}
        </select>
        <select class="wb-inp mes-stype" style="flex:1;font-size:var(--fs-sm)" onchange="wbSaveMoonEraState(${moonId},${era.id},this.closest('div.mes-row'))">
          ${['None','Outpost','Colony','Settled','Industrialised','Core World'].map(s=>
            `<option ${(st.settlement_type||'None')===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <input class="wb-inp mes-pop" type="text" placeholder="Population" value="${st.population||''}"
        style="width:100%;margin-top:3px;font-size:var(--fs-sm)"
        onblur="wbSaveMoonEraState(${moonId},${era.id},this.closest('div'))">
    </div>`.replace('<div style="background', '<div class="mes-row" style="background');
  }).join('');
}

window.wbSaveMoonEraState = async(moonId, eraId, row)=>{
  if(!row) return;
  const selects = row.querySelectorAll('select');
  const factionId = selects[0]?parseInt(selects[0].value)||null:null;
  const stype     = selects[1]?selects[1].value:'None';
  const pop       = row.querySelector('.mes-pop');
  await wbPost(`/moons/${moonId}/era_states`,{
    era_id:eraId, faction_id:factionId,
    settlement_type:stype, population:pop?pop.value:''
  });
};

// ── MOON CARD RENDER UPDATE ───────────────────────────────────────────────────
function wbRenderMoons(moons){
  const box = $('wb-moon-list');
  if(!box) return;
  if(!moons.length){
    box.innerHTML='<div style="font-size:var(--fs-sm);color:var(--pdm);margin-bottom:8px">No moons added yet.</div>';
    return;
  }
  box.innerHTML = moons.map(m=>{
    const badges = [
      m.habitable?'<span style="color:#44bb66;font-size:10px">★ Habitable</span>':'',
      m.native_life&&m.native_life!=='None'?`<span style="color:#aa66ff;font-size:10px">🧬 ${m.native_life}</span>`:'',
      m.surface_map?'<span style="color:#2288cc;font-size:10px">🌍 Map</span>':'',
    ].filter(Boolean).join(' ');
    return `<div class="wb-planet-card" style="border-color:rgba(100,150,255,.2)">
      <div class="wb-planet-hdr">
        <span style="font-size:var(--fs-sm);color:#88ccff">
          🌙 ${m.fictional_name||m.nasa_moon_name||'Moon '+m.id}
          ${m.nasa_moon_name&&m.fictional_name?'<span style="color:var(--pdm);font-size:10px"> ('+m.nasa_moon_name+')</span>':''}
        </span>
        <div style="display:flex;gap:4px">
          <button onclick="wbEditMoon(${m.id})" class="wb-btn-sm" style="font-size:10px;padding:1px 5px">edit</button>
          <button onclick="wbDeleteMoon(${m.id})" class="wb-btn-sm" style="font-size:10px;padding:1px 5px">✕</button>
        </div>
      </div>
      <div style="font-size:var(--fs-sm);color:var(--pdm)">
        ${m.world_type} · ${m.atmosphere}
        ${m.orbit_radii?'<br>'+m.orbit_radii.toFixed(2)+' Rp':''}
        ${m.period_days?'· '+m.period_days.toFixed(3)+'d':''}
        ${m.radius_km?'· '+m.radius_km.toFixed(0)+' km':''}
        ${badges?'<br>'+badges:''}
        ${m.plot_notes?'<br><em>'+m.plot_notes.slice(0,80)+(m.plot_notes.length>80?'…':'')+'</em>':''}
      </div>
    </div>`;
  }).join('');
}

// ── FACTION CONNECTIONS ───────────────────────────────────────────────────────
async function wbLoadConnections(){
  const hip = wbState.star?.hip;
  if(!hip || !$('wb-conn-list')) return;
  const conns = await wbGet('/connections/for_star/'+hip) || [];
  wbRenderConnections(conns, hip);
}

function wbRenderConnections(conns, myHip){
  const box = $('wb-conn-list');
  if(!box) return;
  if(!conns.length){
    box.innerHTML='<div style="font-size:var(--fs-sm);color:var(--pdm);margin-bottom:4px">No connections yet.</div>';
    return;
  }
  const CONN_ICONS = {Territory:'⬡', 'Trade Route':'↔', Military:'⚔', Other:'—'};
  box.innerHTML = conns.map(c=>{
    const otherHip = c.star_hip_a===myHip ? c.star_hip_b : c.star_hip_a;
    const icon = CONN_ICONS[c.conn_type]||'—';
    const dot = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;
      background:${c.faction_color||'#888'};margin-right:5px;flex-shrink:0"></span>`;
    return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;
      font-size:var(--fs-sm);padding:4px 6px;background:rgba(0,0,0,.04);border-radius:6px">
      ${dot}
      <span style="flex:1;color:var(--ptx)">${icon} HIP ${otherHip}
        <span style="color:var(--pdm)">· ${c.conn_type} · ${c.era_name}</span>
        <span style="color:#6699cc"> via ${c.faction_name}</span>
      </span>
      <button onclick="wbDeleteConnection(${c.id})" style="background:none;border:none;
        color:#cc4444;cursor:pointer;font-size:11px;padding:0 2px">✕</button>
    </div>`;
  }).join('');
}

window.wbDeleteConnection = async(id)=>{
  await wbDelete('/connections/'+id);
  await wbLoadConnections();
  if(typeof wbRefreshConnectionLines==='function') wbRefreshConnectionLines();
};

function wbWireConnections(){
  const addBtn   = $('wb-conn-add-btn');
  const form     = $('wb-conn-form');
  const cancelBtn= $('wb-conn-cancel');
  const saveBtn  = $('wb-conn-save');
  const search   = $('wb-conn-search');
  const results  = $('wb-conn-results');
  const hipBInput= $('wb-conn-hip-b');
  const selected = $('wb-conn-selected');
  const eraEl    = $('wb-conn-era');
  const facEl    = $('wb-conn-faction');
  if(!addBtn) return;

  addBtn.addEventListener('click',()=>{
    // Populate era and faction dropdowns
    if(eraEl) eraEl.innerHTML = wbState.eras.map(e=>
      `<option value="${e.id}">${e.name}</option>`).join('');
    if(facEl) facEl.innerHTML = wbState.factions.map(f=>
      `<option value="${f.id}">${f.name}</option>`).join('');
    form.style.display='';
    addBtn.style.display='none';
    if(search) search.focus();
  });

  cancelBtn.addEventListener('click',()=>{
    form.style.display='none';
    addBtn.style.display='';
    if(search) search.value='';
    if(hipBInput) hipBInput.value='';
    if(selected) selected.textContent='';
    if(results) results.style.display='none';
  });

  // Star search — queries the main map's allStars via the global
  let _searchTimer = null;
  if(search) search.addEventListener('input',()=>{
    clearTimeout(_searchTimer);
    const q = search.value.trim().toLowerCase();
    if(q.length < 2){ results.style.display='none'; return; }
    _searchTimer = setTimeout(()=>{
      // Search allStars if available (injected from index.html)
      const pool = typeof wbAllStars!=='undefined' ? wbAllStars : [];
      const matches = pool.filter(s=>
        (s.name||'').toLowerCase().includes(q) ||
        (s.proper||'').toLowerCase().includes(q) ||
        (s.bf||'').toLowerCase().includes(q)
      ).slice(0,8);
      if(!matches.length){ results.style.display='none'; return; }
      results.innerHTML = matches.map(s=>`
        <div data-hip="${s.hip}" data-name="${s.name||s.proper||'HIP '+s.hip}"
          style="padding:5px 8px;cursor:pointer;border-bottom:1px solid rgba(0,0,0,.06)"
          onmouseover="this.style.background='rgba(0,0,0,.05)'"
          onmouseout="this.style.background=''"
          onclick="wbSelectConnStar(${s.hip},'${(s.name||s.proper||'HIP '+s.hip).replace(/'/g,"\\'")}')">
          ${s.name||s.proper||'HIP '+s.hip}
          <span style="color:var(--pdm);font-size:10px"> · ${s.spect||'?'} · ${s.dist_ly?.toFixed(1)||'?'} ly</span>
        </div>`).join('');
      results.style.display='';
    }, 200);
  });

  saveBtn.addEventListener('click', async()=>{
    const hip_a = wbState.star?.hip;
    const hip_b = parseInt($('wb-conn-hip-b')?.value||'0');
    const era_id = parseInt($('wb-conn-era')?.value||'0');
    const faction_id = parseInt($('wb-conn-faction')?.value||'0');
    if(!hip_a||!hip_b||!era_id||!faction_id){
      alert('Please select an era, faction, and destination star.'); return;
    }
    if(hip_a===hip_b){ alert('Cannot connect a star to itself.'); return; }
    await wbPost('/connections',{
      faction_id, era_id, star_hip_a:hip_a, star_hip_b:hip_b,
      conn_type: $('wb-conn-type')?.value||'Territory',
      notes: $('wb-conn-notes')?.value||''
    });
    cancelBtn.click();
    await wbLoadConnections();
    if(typeof wbRefreshConnectionLines==='function') wbRefreshConnectionLines();
  });
}

window.wbSelectConnStar = (hip, name)=>{
  const hipBInput = $('wb-conn-hip-b');
  const search    = $('wb-conn-search');
  const results   = $('wb-conn-results');
  const selected  = $('wb-conn-selected');
  if(hipBInput) hipBInput.value = hip;
  if(search)    search.value = name;
  if(results)   results.style.display='none';
  if(selected)  selected.textContent = '✓ '+name+' (HIP '+hip+')';
};

// Called by wbInjectPanel() after HTML is in the DOM
let _wbWired = false;
function wbWirePanel(){
  if(_wbWired) return;
  _wbWired = true;
  wbWireConnections();

  document.querySelectorAll('.wb-tab').forEach(btn=>{
    btn.addEventListener('click', ()=>wbSwitchTab(btn.dataset.tab));
  });

  // ── Tags ──────────────────────────────────────────────────────────────────────
  if($('wb-tag-add')) $('wb-tag-add').addEventListener('click', async()=>{
    const name = $('wb-tag-input').value.trim();
    if(!name || !wbState.starRecord) return;
    const tag = await wbPost('/tags',{name, color:'#9966cc'});
    if(tag){
      await wbPost('/tags/link',{tag_id:tag.id,entity_type:'star',entity_id:wbState.starRecord.id});
      $('wb-tag-input').value = '';
      wbOpenForStar(wbState.star);
    }
  });

  // ── Save star ─────────────────────────────────────────────────────────────────
  if($('wb-save-star')) $('wb-save-star').addEventListener('click', async()=>{
    const star = wbState.star;
    if(!star) return;
    const payload = {
      hip: star.hip || null,
      hd:  star.hd  || null,
      fictional_name:   $('wb-fname').value.trim(),
      common_name:      $('wb-cname').value.trim(),
      significance:     $('wb-sig').value,
      first_contact_era:$('wb-era-fc').value || null,
      plot_notes:       $('wb-plot').value.trim(),
      internal_notes:   $('wb-internal').value.trim(),
    };

    let ok;
    if(wbState.starRecord){
      ok = await wbPut('/stars/'+wbState.starRecord.id, payload);
    } else {
      ok = await wbPost('/stars', payload);
      if(ok){
        // POST succeeded — fetch the new record
        const fresh = star.hip ? await wbGet('/stars/by_hip/'+star.hip) : null;
        wbState.starRecord = fresh;
      } else if(star.hip){
        // POST may have failed due to UNIQUE constraint (record already exists)
        // Try fetching the existing record and doing a PUT instead
        const existing = await wbGet('/stars/by_hip/'+star.hip);
        if(existing){
          wbState.starRecord = existing;
          ok = await wbPut('/stars/'+existing.id, payload);
        }
      }
    }

    const statusEl = $('wb-save-status');
    if(ok){
      statusEl.textContent = '✓ Saved';
      statusEl.style.color = '#44cc88';
      if(!wbState.starRecord && star.hip){
        wbState.starRecord = await wbGet('/stars/by_hip/'+star.hip);
      }
    } else {
      statusEl.textContent = '✗ API not reachable — is starmap-api running?';
      statusEl.style.color = '#cc4444';
    }
    setTimeout(()=>statusEl.textContent='', 3000);
  });

  // ── Era control ───────────────────────────────────────────────────────────────
  window.wbDeleteControl = async(id)=>{
    await wbDelete('/control/'+id);
    const fresh = wbState.star?.hip ? await wbGet('/stars/by_hip/'+wbState.star.hip) : null;
    wbState.starRecord = fresh;
    wbRenderControls(fresh?.era_control||[]);
  };

  if($('wb-add-control')) $('wb-add-control').addEventListener('click', async()=>{
    if(!wbState.starRecord){
      // Auto-save the star first
      await $('wb-save-star').click();
      // Refresh
      const fresh = wbState.star?.hip ? await wbGet('/stars/by_hip/'+wbState.star.hip) : null;
      wbState.starRecord = fresh;
    }
    if(!wbState.starRecord){ $('wb-save-status').textContent='Save star first'; return; }
    const payload = {
      era_id:       +$('wb-ctrl-era').value,
      faction_id:   $('wb-ctrl-faction').value || null,
      status:       $('wb-ctrl-status').value,
      population:   $('wb-ctrl-pop').value.trim(),
      military_tier:+$('wb-ctrl-mil').value,
      notes:        $('wb-ctrl-notes').value.trim(),
    };
    await wbPost('/stars/'+wbState.starRecord.id+'/control', payload);
    const fresh = await wbGet('/stars/by_hip/'+wbState.star.hip);
    wbState.starRecord = fresh;
    wbRenderControls(fresh?.era_control||[]);
    // Reset form
    $('wb-ctrl-pop').value = '';
    $('wb-ctrl-notes').value = '';
  });

  // ── Planets ───────────────────────────────────────────────────────────────────


  // ── Parse NASA catalog for the current star ───────────────────────────────────
  // ── Import a NASA planet into wb_planets ──────────────────────────────────────
  window.wbImportNasa = async(n)=>{
    if(!await wbEnsureStarRecord()){ alert('Could not create star record — is API running?'); return; }
    const payload = {
      star_id:      wbState.starRecord.id,
      nasa_pl_name: n.nasa_pl_name,
      fictional_name: '',
      common_name:  '',
      orbit_au:     n.orbit_au,
      period_days:  n.period_days,
      eccentricity: n.eccentricity||0,
      inclination:  0,
      arg_peri:     0,
      radius_earth: n.radius_earth||null,
      mass_earth:   n.mass_earth||null,
      mass_desc:    n.mass_desc||'',
      world_type:   'Rocky',
      size_class:   sizeClassFromRadius(n.radius_earth||0),
      gravity_class:'Standard',
      atmosphere:   'Unknown',
      temperature:  n.temperature||'Temperate',
      habitable:    n.habitable||0,
      native_life:  'None',
      significance: 'NONE',
      plot_notes:   '',
      internal_notes:'',
    };
    await wbPost('/planets', payload);
    await wbLoadPlanets();
    if(typeof loadWbPlanetHips==="function") loadWbPlanetHips();
  };

  window.wbImportAll = async()=>{
    // wbImportNasa will auto-create the star record if needed
    const star = wbState.star;
    const nasa = wbGetNasaPlanets(star);
    const importedNames = new Set((wbState.planets||[]).map(p=>p.nasa_pl_name).filter(Boolean));
    const toImport = nasa.filter(n=>!importedNames.has(n.nasa_pl_name));
    for(const n of toImport) await wbImportNasa(n);
    if(typeof loadWbPlanetHips==="function") loadWbPlanetHips(); // refresh map rings after batch import
  };

  // ── Planet size classification from radius ────────────────────────────────────
  window.wbUpdateSizeClass = wbUpdateSizeClass;
  window.wbUpdateMassDesc  = wbUpdateMassDesc;

  window.wbEditPlanet = (id)=>{
    const p = wbState.planets.find(x=>x.id===id);
    if(!p) return;
    $('wb-pf-title').textContent = 'EDIT PLANET';
    $('wb-pf-id').value      = p.id;
    $('wb-pf-fname').value   = p.fictional_name||'';
    $('wb-pf-cname').value   = p.common_name||'';
    $('wb-pf-au').value      = p.orbit_au||'';
    $('wb-pf-radius').value  = p.radius_earth||'';
    $('wb-pf-massval').value = p.mass_earth||'';
    $('wb-pf-mass').value    = p.mass_desc||'';
    $('wb-pf-period').value  = p.period_days||'';
    $('wb-pf-ecc').value     = p.eccentricity||'';
    $('wb-pf-inc').value     = p.inclination||'';
    $('wb-pf-argp').value    = p.arg_peri||'';
    $('wb-pf-type').value    = p.world_type||'Rocky';
    const sc = p.radius_earth ? sizeClassFromRadius(p.radius_earth) : (p.size_class||'Earth-like');
    $('wb-pf-size').value = sc;
    $('wb-pf-size-display').textContent = sc;
    $('wb-pf-atm').value     = p.atmosphere||'Breathable';
    $('wb-pf-temp').value    = p.temperature||'Temperate';
    $('wb-pf-life').value    = p.native_life||'None';
    $('wb-pf-hab').value     = p.habitable||0;
    $('wb-pf-sig').value     = p.significance||'NONE';
    $('wb-pf-notes').value   = p.plot_notes||'';
    $('wb-cancel-planet').style.display='';
    $('wb-pf-fname').focus();
  };

  window.wbDeletePlanet = async(id)=>{
    if(!confirm('Delete this planet?')) return;
    await wbDelete('/planets/'+id);
    await wbLoadPlanets();
  };

  if($('wb-cancel-planet')) $('wb-cancel-planet').addEventListener('click',()=>{
    $('wb-pf-id').value='';
    $('wb-pf-title').textContent='ADD PLANET';
    ['wb-pf-fname','wb-pf-cname','wb-pf-au','wb-pf-mass','wb-pf-radius','wb-pf-massval',
     'wb-pf-period','wb-pf-ecc','wb-pf-inc','wb-pf-argp','wb-pf-notes']
      .forEach(id=>$(id).value='');
    $('wb-pf-size').value = 'Earth-like';
    $('wb-pf-size-display').textContent = 'Earth-like';
    $('wb-cancel-planet').style.display='none';
  });

  if($('wb-save-planet')) $('wb-save-planet').addEventListener('click', async()=>{
    if(!await wbEnsureStarRecord()){ alert('Could not create star record — is API running?'); return; }
    const id = $('wb-pf-id').value;
    const payload = {
      star_id:      wbState.starRecord.id,
      fictional_name:$('wb-pf-fname').value.trim(),
      common_name:  $('wb-pf-cname').value.trim(),
      orbit_au:     parseFloat($('wb-pf-au').value)||null,
      radius_earth: parseFloat($('wb-pf-radius').value)||null,
      mass_earth:   parseFloat($('wb-pf-massval').value)||null,
      mass_desc:    $('wb-pf-mass').value.trim(),
      size_class:   $('wb-pf-size').value,  // derived from radius
      period_days:  parseFloat($('wb-pf-period').value)||null,
      eccentricity: parseFloat($('wb-pf-ecc').value)||0,
      inclination:  parseFloat($('wb-pf-inc').value)||0,
      arg_peri:     parseFloat($('wb-pf-argp').value)||0,
      world_type:   $('wb-pf-type').value,
      atmosphere:   $('wb-pf-atm').value,
      temperature:  $('wb-pf-temp').value,
      native_life:  $('wb-pf-life').value,
      habitable:    +$('wb-pf-hab').value,
      significance: $('wb-pf-sig').value,
      plot_notes:   $('wb-pf-notes').value.trim(),
    };
    if(id){ await wbPut('/planets/'+id, payload); }
    else   { await wbPost('/planets', payload); }
    $('wb-cancel-planet').click();
    await wbLoadPlanets();
    if(typeof loadWbPlanetHips==="function") loadWbPlanetHips();
  });

  // ── Star tab: inline era form ─────────────────────────────────────────────────
  if($('wb-era-toggle')) $('wb-era-toggle').addEventListener('click',()=>{
    const f=$('wb-era-form');
    f.style.display = f.style.display==='none' ? '' : 'none';
    if(f.style.display!=='none') $('wb-era-name').focus();
  });
  if($('wb-era-cancel')) $('wb-era-cancel').addEventListener('click',()=>{
    $('wb-era-form').style.display='none';
    $('wb-era-name').value='';
  });
  if($('wb-era-save')) $('wb-era-save').addEventListener('click', async()=>{
    const name = $('wb-era-name').value.trim();
    if(!name) return;
    const r = await wbPost('/eras',{
      name, order_index: wbState.eras.length,
      start_desc:$('wb-era-start').value.trim(),
      end_desc:  $('wb-era-end').value.trim(),
      color:     $('wb-era-color').value,
    });
    if(r){ await wbLoadRefs(); $('wb-era-form').style.display='none'; $('wb-era-name').value=''; }
  });



  window.wbDeleteEra = async(id)=>{
    if(!confirm('Delete this era? This will also clear era references.')) return;
    await wbDelete('/eras/'+id);
    wbRenderUniverseLists();
  };
  window.wbDeleteCiv = async(id)=>{
    if(!confirm('Delete this civilization?')) return;
    await wbDelete('/civilizations/'+id);
    wbRenderUniverseLists();
  };
  window.wbDeleteFaction = async(id)=>{
    if(!confirm('Delete this faction?')) return;
    await wbDelete('/factions/'+id);
    wbRenderUniverseLists();
  };

  // Universe tab add handlers
  if($('wb-u-era-save')) $('wb-u-era-save').addEventListener('click', async()=>{
    const name=$('wb-u-era-name').value.trim();if(!name)return;
    await wbPost('/eras',{name,order_index:wbState.eras.length,
      start_desc:$('wb-u-era-start').value.trim(),
      end_desc:  $('wb-u-era-end').value.trim(),
      color:     $('wb-u-era-color').value});
    $('wb-u-era-name').value=$('wb-u-era-start').value=$('wb-u-era-end').value='';
    wbRenderUniverseLists();
    wbLoadRefs(); // refresh era dropdowns in Star tab
  });

  if($('wb-civ-save')) $('wb-civ-save').addEventListener('click', async()=>{
    const name=$('wb-civ-name').value.trim();if(!name)return;
    await wbPost('/civilizations',{name,
      species:        $('wb-civ-species').value.trim(),
      homeworld_name: $('wb-civ-home').value.trim(),
      symbol:         $('wb-civ-symbol').value.trim()||'★',
      color:          $('wb-civ-color').value});
    $('wb-civ-name').value=$('wb-civ-species').value=$('wb-civ-home').value=$('wb-civ-symbol').value='';
    wbRenderUniverseLists();
  });

  if($('wb-fac-save')) $('wb-fac-save').addEventListener('click', async()=>{
    const name=$('wb-fac-name').value.trim();if(!name)return;
    await wbPost('/factions',{name,
      short_name:     $('wb-fac-short').value.trim(),
      civilization_id:$('wb-fac-civ').value||null,
      type:           $('wb-fac-type').value,
      color:          $('wb-fac-color').value});
    $('wb-fac-name').value=$('wb-fac-short').value='';
    wbRenderUniverseLists();
    wbLoadRefs(); // refresh faction dropdown in control form
  });

  // Switch to Universe tab triggers list render
  document.querySelectorAll('.wb-tab').forEach(btn=>{
    if(btn.dataset.tab==='wb-tab-control'){
      const orig = btn.onclick;
      btn.addEventListener('click',()=>wbRenderUniverseLists());
    }
  });
  if($('btn-wb')){
    if($('btn-wb')) $('btn-wb').addEventListener('click', ()=>{
      if(wbState.star) wbOpenForStar(wbState.star);
    });
  }

  if($('wb-close')) $('wb-close').addEventListener('click', ()=>{
    $('wb-panel').style.display='none';
  });

  // ── Moon tab buttons ──────────────────────────────────────────────────────────
  if($('wb-add-moon-btn')) $('wb-add-moon-btn').addEventListener('click',()=>{
    $('wb-mf-title').textContent='ADD MOON';
    $('wb-mf-id').value='';
    ['wb-mf-fname','wb-mf-cname','wb-mf-orbit','wb-mf-period',
     'wb-mf-ecc','wb-mf-inc','wb-mf-radius','wb-mf-notes','wb-mf-mass','wb-mf-inotes']
      .forEach(id=>{ if($(id)) $(id).value=''; });
    if($('wb-mf-type'))  $('wb-mf-type').value='Rocky';
    if($('wb-mf-atm'))   $('wb-mf-atm').value='None';
    if($('wb-mf-sig'))   $('wb-mf-sig').value='NONE';
    if($('wb-mf-life'))  $('wb-mf-life').value='None';
    if($('wb-mf-hab'))   $('wb-mf-hab').value='0';
    if($('wb-mf-map-name')) $('wb-mf-map-name').textContent='No map · equirectangular PNG/JPG';
    if($('wb-mf-map-clear')) $('wb-mf-map-clear').style.display='none';
    if($('wb-moon-era-rows')) $('wb-moon-era-rows').innerHTML='';
    wbMoonPendingMap=null; wbMoonClearMap=false;
    if($('wb-cancel-moon')) $('wb-cancel-moon').style.display='none';
    if($('wb-moon-form')) $('wb-moon-form').style.display='';
    if($('wb-mf-fname')) $('wb-mf-fname').focus();
  });

  if($('wb-cancel-moon')) $('wb-cancel-moon').addEventListener('click',()=>{
    $('wb-mf-id').value='';
    $('wb-mf-title').textContent='ADD MOON';
    ['wb-mf-fname','wb-mf-cname','wb-mf-orbit','wb-mf-period',
     'wb-mf-ecc','wb-mf-inc','wb-mf-radius','wb-mf-notes','wb-mf-mass','wb-mf-inotes']
      .forEach(id=>{ if($(id)) $(id).value=''; });
    if($('wb-mf-map-name')) $('wb-mf-map-name').textContent='No map · equirectangular PNG/JPG';
    if($('wb-mf-map-clear')) $('wb-mf-map-clear').style.display='none';
    if($('wb-moon-era-rows')) $('wb-moon-era-rows').innerHTML='';
    wbMoonPendingMap=null; wbMoonClearMap=false;
    if($('wb-cancel-moon')) $('wb-cancel-moon').style.display='none';
  });

  // Moon surface map upload input
  if($('wb-mf-map-input')){
    $('wb-mf-map-input').addEventListener('change',e=>{
      const f=e.target.files[0]; if(!f) return;
      wbMoonPendingMap=f;
      wbMoonClearMap=false;
      if($('wb-mf-map-name')) $('wb-mf-map-name').textContent=f.name+' (will save on ✓ Save Moon)';
      if($('wb-mf-map-clear')) $('wb-mf-map-clear').style.display='';
      e.target.value='';
    });
  }
  if($('wb-mf-map-clear')){
    $('wb-mf-map-clear').addEventListener('click',e=>{
      e.preventDefault();
      wbMoonPendingMap=null; wbMoonClearMap=true;
      if($('wb-mf-map-name')) $('wb-mf-map-name').textContent='No map · equirectangular PNG/JPG';
      $('wb-mf-map-clear').style.display='none';
    });
  }

  if($('wb-save-moon')) $('wb-save-moon').addEventListener('click', async()=>{
    if(!wbMoonPlanet){ alert('Select a planet first'); return; }
    const id = $('wb-mf-id').value;
    const payload = {
      planet_id:      wbMoonPlanet.id,
      fictional_name: $('wb-mf-fname').value.trim(),
      common_name:    $('wb-mf-cname').value.trim(),
      orbit_radii:    parseFloat($('wb-mf-orbit').value)||null,
      period_days:    parseFloat($('wb-mf-period').value)||null,
      eccentricity:   parseFloat($('wb-mf-ecc').value)||0,
      inclination:    parseFloat($('wb-mf-inc').value)||0,
      radius_km:      parseFloat($('wb-mf-radius').value)||null,
      mass_earth:     parseFloat($('wb-mf-mass')?$('wb-mf-mass').value:'')||null,
      world_type:     $('wb-mf-type').value,
      atmosphere:     $('wb-mf-atm').value,
      native_life:    $('wb-mf-life')?$('wb-mf-life').value:'None',
      habitable:      $('wb-mf-hab')?parseInt($('wb-mf-hab').value)||0:0,
      significance:   $('wb-mf-sig').value,
      plot_notes:     $('wb-mf-notes').value.trim(),
      internal_notes: $('wb-mf-inotes')?$('wb-mf-inotes').value.trim():'',
    };
    let moonId;
    if(id){ await wbPut('/moons/'+id, payload); moonId=parseInt(id); }
    else   { const r=await wbPost('/moons', payload); moonId=r&&r.id; }

    // Upload surface map if a new file was selected
    if(moonId && wbMoonPendingMap){
      await wbUploadMoonMap(moonId, wbMoonPendingMap);
      wbMoonPendingMap = null;
    }
    // Handle map removal
    if(moonId && wbMoonClearMap){
      await wbDelete(`/moons/${moonId}/surface_map`);
      wbMoonClearMap = false;
    }

    if($('wb-cancel-moon')) $('wb-cancel-moon').click();
    await wbLoadMoons();
  });

  // Expose so openD can stash the star
  window._wbSetStar = (s)=>{ wbState.star = s; };
}

// Also wire on DOMContentLoaded in case panel was already injected
document.addEventListener('DOMContentLoaded', ()=>{
  if(document.getElementById('wb-panel')) wbWirePanel();
});

