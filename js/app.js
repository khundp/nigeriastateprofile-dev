const grid=document.getElementById('stateGrid');
const search=document.getElementById('search');
const zone=document.getElementById('zone');
const type=document.getElementById('type');
const stateMap=document.getElementById('stateMap');
const browseButtons=document.querySelectorAll('[data-browse-view]');
let states=[];
let nigeriaMap=null;
let mapMarkers=[];
const stateCoords={
  abia:[5.4527,7.5248], adamawa:[9.3265,12.3984], akwaibom:[5.0077,7.8497], anambra:[6.2209,6.9369], bauchi:[10.3158,9.8442], bayelsa:[4.7719,6.0699], benue:[7.7322,8.5391], borno:[11.8846,13.1510], crossriver:[5.8702,8.5988], delta:[5.7040,5.9339], ebonyi:[6.2649,8.0137], edo:[6.6342,5.9304], ekiti:[7.7190,5.3110], enugu:[6.5364,7.4356], fct:[9.0765,7.3986], gombe:[10.2897,11.1673], imo:[5.5720,7.0588], jigawa:[12.2280,9.5616], kaduna:[10.5105,7.4165], kano:[11.9964,8.5167], katsina:[12.3797,7.6306], kebbi:[12.4504,4.1996], kogi:[7.7337,6.6906], kwara:[8.9669,4.3874], lagos:[6.5244,3.3792], nasarawa:[8.4998,8.1997], niger:[9.9309,5.5983], ogun:[7.1557,3.3451], ondo:[7.2508,5.2103], osun:[7.5629,4.5200], oyo:[8.1574,3.6147], plateau:[9.2182,9.5179], rivers:[4.8581,6.9209], sokoto:[13.0059,5.2476], taraba:[8.8937,11.3590], yobe:[12.1871,11.7068], zamfara:[12.1704,6.6641]
};
const zonePalette={
 'North Central':['#0052cc','#89cbd0'], 'North East':['#6a5acd','#f6c453'],
 'North West':['#0b7285','#8bc34a'], 'South East':['#7c3aed','#f59e0b'],
 'South South':['#006eb5','#2fb7c8'], 'South West':['#0052cc','#e7796f']
};
function placeholderFor(s){
 const [a,b]=zonePalette[s.zone]||['#0052cc','#89cbd0'];
 const initials=s.name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><pattern id="p" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M0 44L44 0M-11 11L11 -11M33 55L55 33" stroke="rgba(255,255,255,.18)" stroke-width="3"/></pattern></defs><rect width="640" height="420" fill="url(#g)"/><rect width="640" height="420" fill="url(#p)"/><circle cx="515" cy="95" r="100" fill="rgba(255,255,255,.14)"/><circle cx="95" cy="340" r="145" fill="rgba(255,255,255,.10)"/><text x="48" y="78" fill="white" font-family="Arial, sans-serif" font-size="22" font-weight="700" opacity=".9">Nigeria State Profile</text><text x="48" y="238" fill="white" font-family="Arial, sans-serif" font-size="112" font-weight="900" letter-spacing="-6">${initials}</text><text x="48" y="300" fill="white" font-family="Arial, sans-serif" font-size="42" font-weight="800">${s.name}</text><text x="48" y="344" fill="white" font-family="Arial, sans-serif" font-size="24" opacity=".88">${s.zone}</text></svg>`;
 return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
}
function imageFor(s){ return s.image || placeholderFor(s); }
function profileLink(s){ return s.availableProfile ? 'lagos.html' : '#states'; }
function initNigeriaMap(){
 if(nigeriaMap || !document.getElementById('stateMapCanvas') || typeof L==='undefined') return;
 nigeriaMap=L.map('stateMapCanvas',{scrollWheelZoom:false, zoomControl:false, attributionControl:true}).setView([9.0820,8.6753],6);
 L.control.zoom({position:'bottomright'}).addTo(nigeriaMap);
 L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:9,minZoom:5,attribution:'© OpenStreetMap contributors © CARTO'}).addTo(nigeriaMap);
}
function renderMap(list){
 initNigeriaMap();
 if(!nigeriaMap) return;
 mapMarkers.forEach(m=>nigeriaMap.removeLayer(m));
 mapMarkers=[];
 list.forEach(s=>{
   const coords=stateCoords[s.slug];
   if(!coords) return;
   const active=s.availableProfile;
   const initials=s.name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
   const marker=L.marker(coords,{icon:L.divIcon({className:`profile-map-marker ${active?'active':'inactive'}`, html:`<span>${initials}</span><em>${s.name}</em>`, iconSize:[46,46], iconAnchor:[23,23]})});
   const action=active?`<a class="popup-action" href="${profileLink(s)}">Open ${s.name} profile →</a>`:`<span class="popup-muted">Profile coming soon</span>`;
   marker.bindPopup(`<div class="profile-popup"><img src="${imageFor(s)}" alt="${s.name}" onerror="this.style.display='none'"><div><strong>${s.name}</strong><small>${s.zone}</small>${action}</div></div>`,{maxWidth:280, closeButton:true});
   marker.addTo(nigeriaMap);
   mapMarkers.push(marker);
 });
 if(mapMarkers.length){
   const group=L.featureGroup(mapMarkers);
   nigeriaMap.fitBounds(group.getBounds().pad(0.18));
 }
}
const fallbackStates=[{"slug":"abia","name":"Abia","zone":"South East","image":"assets/state-images/abia.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"adamawa","name":"Adamawa","zone":"North East","image":"assets/state-images/adamawa.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"akwaibom","name":"Akwa Ibom","zone":"South South","image":"assets/state-images/akwaibom.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"anambra","name":"Anambra","zone":"South East","image":"assets/state-images/anambra.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"bauchi","name":"Bauchi","zone":"North East","image":"assets/state-images/bauchi.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"bayelsa","name":"Bayelsa","zone":"South South","image":"assets/state-images/bayelsa.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"benue","name":"Benue","zone":"North Central","image":"assets/state-images/benue.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"borno","name":"Borno","zone":"North East","image":"assets/state-images/borno.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"crossriver","name":"Cross River","zone":"South South","image":"assets/state-images/crossriver.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"delta","name":"Delta","zone":"South South","image":"assets/state-images/delta.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"ebonyi","name":"Ebonyi","zone":"South East","image":"assets/state-images/ebonyi.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"edo","name":"Edo","zone":"South South","image":"assets/state-images/edo.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"ekiti","name":"Ekiti","zone":"South West","image":"assets/state-images/ekiti.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"enugu","name":"Enugu","zone":"South East","image":"assets/state-images/enugu.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"fct","name":"FCT","zone":"North Central","image":"assets/state-images/fct.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"gombe","name":"Gombe","zone":"North East","image":"assets/state-images/gombe.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"imo","name":"Imo","zone":"South East","image":"assets/state-images/imo.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"jigawa","name":"Jigawa","zone":"North West","image":"assets/state-images/jigawa.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"kaduna","name":"Kaduna","zone":"North West","image":"assets/state-images/kaduna.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"kano","name":"Kano","zone":"North West","image":"assets/state-images/kano.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"katsina","name":"Katsina","zone":"North West","image":"assets/state-images/katsina.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"kebbi","name":"Kebbi","zone":"North West","image":"assets/state-images/kebbi.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"kogi","name":"Kogi","zone":"North Central","image":"assets/state-images/kogi.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"kwara","name":"Kwara","zone":"North Central","image":"assets/state-images/kwara.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"lagos","name":"Lagos","zone":"South West","image":"assets/state-images/lagos.jpg","availableProfile":true,"summary":"Interactive profile available: demographics, environment, spending, human development, WASH, energy, ICT and conflict trends."},{"slug":"nasarawa","name":"Nasarawa","zone":"North Central","image":"assets/state-images/nasarawa.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"niger","name":"Niger","zone":"North Central","image":"assets/state-images/niger.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"ogun","name":"Ogun","zone":"South West","image":"assets/state-images/ogun.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"ondo","name":"Ondo","zone":"South West","image":"assets/state-images/ondo.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"osun","name":"Osun","zone":"South West","image":"assets/state-images/osun.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"oyo","name":"Oyo","zone":"South West","image":"assets/state-images/oyo.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"plateau","name":"Plateau","zone":"North Central","image":"assets/state-images/plateau.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"rivers","name":"Rivers","zone":"South South","image":"assets/state-images/rivers.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"sokoto","name":"Sokoto","zone":"North West","image":"assets/state-images/sokoto.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"taraba","name":"Taraba","zone":"North East","image":"assets/state-images/taraba.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"yobe","name":"Yobe","zone":"North East","image":"assets/state-images/yobe.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."},{"slug":"zamfara","name":"Zamfara","zone":"North West","image":"assets/state-images/zamfara.jpg","availableProfile":false,"summary":"View state profile indicators, maps and development insights."}];
fetch('data/states.json').then(r=>r.json()).then(data=>{states=data;render();}).catch(()=>{states=fallbackStates;render();});
function render(){
 if(!grid) return;
 const q=(search.value||'').toLowerCase();
 const z=zone.value; const t=type.value;
 const filtered=states.filter(s=>s.name.toLowerCase().includes(q)).filter(s=>z==='all'||s.zone===z).filter(s=>t==='all'||s.availableProfile);
 grid.innerHTML=filtered.map(s=>`<article class="state-card"><img src="${imageFor(s)}" alt="${s.name} state image" loading="lazy" onerror="this.onerror=null;this.src='${placeholderFor(s)}';"><div class="body"><span class="pill">${s.zone}</span><h3>${s.name}</h3><p>${s.summary}</p><div class="card-action">${s.availableProfile?`<a class="open" href="lagos.html">View profile →</a>`:`<span class="soon">Profile coming soon</span>`}</div></div></article>`).join('');
 renderMap(filtered);
}
[search,zone,type].forEach(el=>el&&el.addEventListener('input',render));
browseButtons.forEach(btn=>btn.addEventListener('click',()=>{
 browseButtons.forEach(b=>b.classList.remove('active'));
 btn.classList.add('active');
 const view=btn.dataset.browseView;
 grid&&grid.classList.toggle('hidden',view!=='cards');
 stateMap&&stateMap.classList.toggle('hidden',view!=='map');
 if(view==='map'){ initNigeriaMap(); renderMap(states.filter(s=>s.name.toLowerCase().includes((search.value||'').toLowerCase())).filter(s=>zone.value==='all'||s.zone===zone.value).filter(s=>type.value==='all'||s.availableProfile)); setTimeout(()=>nigeriaMap&&nigeriaMap.invalidateSize(),80); }
}));



/* Final override: GeoJSON-based Nigeria state map with real SVG paths generated from data/nigeria-states.geojson. */
(function(){
  const zoneColors={'North Central':'#2f80ed','North East':'#00a99d','North West':'#f36f21','South East':'#f2b705','South South':'#7a5c3e','South West':'#0052cc'};
  const zoneAbbr={'North Central':'NC','North East':'NE','North West':'NW','South East':'SE','South South':'SS','South West':'SW'};
  let geojsonData=null;
  let countryOutline=null;
  let geojsonLoading=false;
  function slugify(v){return String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,'').replace(/^federalcapitalterritory$/,'fct');}
  function getState(slug){const all=states&&states.length?states:fallbackStates; return all.find(s=>s.slug===slug)||null;}
  function esc(v){return String(v||'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}
  function geometryCoords(geom){
    if(!geom) return [];
    if(geom.type==='Polygon') return geom.coordinates;
    if(geom.type==='MultiPolygon') return geom.coordinates.flat();
    return [];
  }
  function boundsFor(fc){
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    (fc.features||[]).forEach(f=>geometryCoords(f.geometry).forEach(ring=>ring.forEach(p=>{minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]);})));
    return {minX,minY,maxX,maxY,w:maxX-minX,h:maxY-minY};
  }
  function mergedBounds(){
    const b1=boundsFor(geojsonData);
    const b2=countryOutline?boundsFor(countryOutline):b1;
    const minX=Math.min(b1.minX,b2.minX), minY=Math.min(b1.minY,b2.minY), maxX=Math.max(b1.maxX,b2.maxX), maxY=Math.max(b1.maxY,b2.maxY);
    return {minX,minY,maxX,maxY,w:maxX-minX,h:maxY-minY};
  }
  function project(p,b){
    const pad=34, W=820, H=620;
    const s=Math.min((W-pad*2)/b.w,(H-pad*2)/b.h);
    const ox=(W-b.w*s)/2, oy=(H-b.h*s)/2;
    return [ox+(p[0]-b.minX)*s, oy+(b.maxY-p[1])*s];
  }
  function pathForGeometry(geom,b){
    return geometryCoords(geom).map(ring=>ring.map((p,i)=>{const [x,y]=project(p,b); return `${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`;}).join(' ')+' Z').join(' ');
  }
  function featureCenter(f,b){
    const centroid=f.properties&&f.properties.centroid;
    if(Array.isArray(centroid)){const [x,y]=project(centroid,b); return [x,y];}
    const rings=geometryCoords(f.geometry); let sx=0,sy=0,n=0;
    rings.forEach(r=>r.forEach(p=>{const q=project(p,b); sx+=q[0]; sy+=q[1]; n++;}));
    return n?[sx/n,sy/n]:[410,310];
  }
  function labelFor(name){return String(name||'').replace('Cross River','Cross R.').replace('Akwa Ibom','Akwa I.').replace('Nasarawa','Nasar.');}
  function makeGeoSvg(list){
    const canvas=document.getElementById('stateMapCanvas');
    if(!canvas) return;
    const selected=new Set((list||[]).map(s=>s.slug));
    if(!geojsonData){
      canvas.innerHTML='<div class="geo-map-loading"><b>Loading Nigeria GeoJSON map…</b><span>State boundaries are being prepared.</span></div>';
      loadGeoJSON();
      return;
    }
    const b=mergedBounds();
    const outlineFeature=countryOutline && countryOutline.features && countryOutline.features[0];
    const outlinePath=outlineFeature?pathForGeometry(outlineFeature.geometry,b):'';
    const paths=(geojsonData.features||[]).map(f=>{
      const rawSlug=f.properties&&f.properties.slug || f.properties&&f.properties.name;
      const slug=slugify(rawSlug);
      const s=getState(slug) || {name:f.properties&&f.properties.name || rawSlug, zone:'', availableProfile:false, slug};
      const visible=selected.size===0 || selected.has(slug);
      const color=zoneColors[s.zone]||'#98a2b3';
      const href=s.availableProfile?profileLink(s):'#states';
      const title=s.availableProfile?`Open ${s.name} profile`:`${s.name} profile coming soon`;
      const d=pathForGeometry(f.geometry,b);
      return `<a href="${href}" class="geo-state-link ${visible?'':'dimmed'} ${s.availableProfile?'active':''}" aria-label="${esc(title)}" data-state="${esc(s.name)}" data-zone="${esc(s.zone)}"><path class="geo-state" d="${d}" fill="${color}"><title>${esc(s.name)} — ${esc(s.zone)}</title></path></a>`;
    }).join('');
    const labels=(geojsonData.features||[]).map(f=>{
      const slug=slugify(f.properties&&f.properties.slug || f.properties&&f.properties.name);
      const s=getState(slug); if(!s) return '';
      const [x,y]=featureCenter(f,b);
      const visible=selected.size===0 || selected.has(slug);
      return `<g class="geo-label ${visible?'':'dimmed'}"><text x="${x.toFixed(1)}" y="${y.toFixed(1)}">${esc(labelFor(s.name))}</text><text class="abbr" x="${x.toFixed(1)}" y="${(y+10).toFixed(1)}">${esc(zoneAbbr[s.zone]||'')}</text></g>`;
    }).join('');
    canvas.className='real-map-canvas geojson-map-canvas';
    canvas.innerHTML=`<div class="geo-map-toolbar"><b>Interactive Nigeria map</b><span>Hover states. Click Lagos to open the active profile.</span></div><svg class="geojson-nigeria-map" viewBox="0 0 820 620" role="img" aria-label="Interactive GeoJSON map of Nigerian states"><defs><clipPath id="nigeriaBoundaryClip"><path d="${outlinePath}"></path></clipPath></defs><path class="geo-country-base" d="${outlinePath}"></path><g clip-path="url(#nigeriaBoundaryClip)">${paths}</g><path class="geo-country-outline" d="${outlinePath}"></path><g class="geo-label-layer">${labels}</g></svg><div class="geo-map-legend"><span style="--c:#f36f21">North West</span><span style="--c:#00a99d">North East</span><span style="--c:#2f80ed">North Central</span><span style="--c:#f2b705">South East</span><span style="--c:#7a5c3e">South South</span><span style="--c:#0052cc">South West</span></div>`;
  }
  function loadGeoJSON(){
    if(geojsonData || geojsonLoading) return;
    geojsonLoading=true;
    Promise.all([fetch('data/nigeria-states.geojson'),fetch('data/nigeria-country-outline.geojson')])
      .then(rs=>{if(!rs[0].ok||!rs[1].ok) throw new Error('GeoJSON not found'); return Promise.all(rs.map(r=>r.json()));})
      .then(([statesData,countryData])=>{geojsonData=statesData; countryOutline=countryData; geojsonLoading=false; renderMap(states&&states.length?states:fallbackStates);})
      .catch(()=>{geojsonLoading=false; const canvas=document.getElementById('stateMapCanvas'); if(canvas) canvas.innerHTML='<div class="geo-map-loading"><b>GeoJSON map unavailable</b><span>Please serve this project through a local web server so GeoJSON can load.</span></div>';});
  }
  window.initNigeriaMap=function(){const canvas=document.getElementById('stateMapCanvas'); if(!canvas) return; canvas.className='real-map-canvas geojson-map-canvas'; loadGeoJSON();};
  window.renderMap=function(list){makeGeoSvg(list&&list.length?list:(states&&states.length?states:fallbackStates));};
})();
