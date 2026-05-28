let data={};
let radarMetrics=[];

const fallbackChartData={
 human:[['Multidimensional Poverty (%)',29.4,62.9,35.7,'2022'],['HDI',72.1,55.0,53.3,'2022'],['Life Expectancy at Birth',57.8,56.2,51.7,'2021']],
 health:[['Infant Mortality Rate',36,63,33,'2023-24'],['Maternal Mortality Rate',356,556,323,'2018'],['HIV Prevalence Rate',1.8,1.4,2.0,'2023'],['Health Facilities per 10K',1.6,1.6,1.9,'2022']],
 education:[['Literacy Rate (5yrs+)',92.8,63.2,76.9,'2020'],['Children Out of School',0.20,16.17,1.19,'2022'],['Schools per 10K',18.5,13.9,16.1,'2022']],
 labour:[['Un/under Employment',5.5,5.4,4.3,'2023'],['Informal Employment',76.3,92.2,85.3,'2023'],['Employment in Agriculture',1.2,32.5,18.9,'2023'],['Youth NEET',15.1,15.6,19.0,'2023']],
 wash:[['Improved Drinking Water',99.4,75.9,88.8,'2022'],['Time to Water Source >30min',4.0,25.2,7.4,'2022'],['Improved Sanitation Facilities',96.9,57.5,71.2,'2022'],['Combined WASH Access',26.9,14.4,17.2,'2022']],
 food:[['Food Security Pressure',17.01,82.28,19.68,'2024'],['Food Security Crisis',1.26,24.10,1.96,'2024'],['Food Security Emergency',0,0.99,0,'2024'],['Number of IDPs',0,4.07,0.02,'2023']],
 energy:[['Access to Electricity',98.7,63.7,66.7,'2020'],['Clean Cookstoves Usage',99.3,48.5,58.3,'2020'],['Low/No Access Areas',0,32.1,2.5,'2024'],['Monthly Diesel Expenditure (₦)',1.22,1.45,1.30,'2024']],
 ict:[['Internet Access Households',65.1,34.7,36.9,'2023'],['Phone Access Households',95.6,84.6,90.2,'2023'],['Road Density per 100km',146,10,10,'2022']]
};
const fallbackRadar=[
  {label:'HDI', value:72.1, year:'2022'},
  {label:'Literacy', value:92.8, year:'2020'},
  {label:'Electricity', value:98.7, year:'2020'},
  {label:'Internet', value:65.1, year:'2023'},
  {label:'Water', value:99.4, year:'2022'},
  {label:'Lower poverty', value:70.6, year:'2022'}
];

async function loadLagosCharts(){
  try{
    const response=await fetch('data/charts/lagos.json',{cache:'force-cache'});
    if(!response.ok) throw new Error('Chart JSON not available');
    const payload=await response.json();
    data=payload.groups || fallbackChartData;
    radarMetrics=payload.radar || fallbackRadar;
  }catch(error){
    data=fallbackChartData;
    radarMetrics=fallbackRadar;
  }
  drawAll();
  renderIndicatorTables();
}

function fmtValue(title,v){
  return title.includes('Out of School')||title.includes('Food')||title.includes('IDP')||title.includes('Diesel')?v+'M':(title.includes('HDI')?v:(v+'%'));
}
function card(title,a,b,c,year){
  const max=Math.max(a,b,c,1);
  const fmt=v=>fmtValue(title,v);
  const tip=`${title} (${year}) — Lagos: ${fmt(a)} | Nigeria: ${fmt(b)} | South West: ${fmt(c)}`;
  return `<article class="viz-card" data-tip="${tip}" data-year="${year}"><header><h3>${title}</h3><span class="year">${year}</span></header><div class="bars"><div class="bar-wrap"><div class="bar lagos" style="height:${(a/max)*135}px"><div class="bar-label">${fmt(a)}</div></div></div><div class="bar-wrap"><div class="bar ng" style="height:${(b/max)*135}px"><div class="bar-label">${fmt(b)}</div></div></div><div class="bar-wrap"><div class="bar sw" style="height:${(c/max)*135}px"><div class="bar-label">${fmt(c)}</div></div></div></div><div class="axis"><span>Lagos</span><span>Nigeria</span><span>SW</span></div></article>`;
}
function emptyYearCard(group,year){
  const label=group.replace(/[-_]/g,' ');
  return `<article class="viz-card empty-year-card"><header><h3>No ${label} indicators</h3><span class="year">${year}</span></header><p>No chart indicators in this group are tagged to ${year}. Choose All years to restore the full dashboard.</p></article>`;
}
function getSelectedYear(){return document.getElementById('yearFilter')?.value || 'all';}
function drawAll(){
  const selectedYear=getSelectedYear();
  document.querySelectorAll('[data-chart-group]').forEach(box=>{
    const group=box.dataset.chartGroup;
    const rows=(data[group]||[]).filter(r=>selectedYear==='all'||r[4]===selectedYear);
    box.innerHTML=rows.length ? rows.map(r=>card(...r)).join('') : emptyYearCard(group,selectedYear);
  });
  updateYearNote(selectedYear);
  drawScoreRadar(selectedYear);
}
function updateYearNote(year){
  const dash=document.querySelector('.dashboard.profile-v2');
  if(!dash)return;
  let note=document.querySelector('.year-filter-note');
  if(!note){note=document.createElement('div');note.className='year-filter-note';dash.prepend(note);}
  note.textContent=year==='all'?'Showing cached chart data from data/charts/lagos.json.':`Showing cached chart indicators tagged to ${year}. Static maps and headline cards remain visible.`;
  note.classList.toggle('show',year!=='all');
}
const yearFilter=document.getElementById('yearFilter');
yearFilter&&yearFilter.addEventListener('change',drawAll);

const floatTip=document.createElement('div');
floatTip.className='tooltip-floating';
document.body.appendChild(floatTip);
document.addEventListener('mouseover',e=>{
  const target=e.target.closest('[data-tip]');
  if(!target) return;
  floatTip.textContent=target.dataset.tip;
  floatTip.classList.add('show');
});
document.addEventListener('mousemove',e=>{
  const pad=16;
  const rect=floatTip.getBoundingClientRect();
  let x=e.clientX+pad;
  let y=e.clientY+pad;
  if(x+rect.width>window.innerWidth-10) x=e.clientX-rect.width-pad;
  if(y+rect.height>window.innerHeight-10) y=e.clientY-rect.height-pad;
  floatTip.style.left=x+'px';
  floatTip.style.top=y+'px';
});
document.addEventListener('mouseout',e=>{
  if(e.target.closest('[data-tip]')) floatTip.classList.remove('show');
});

const sectionLabels={
  'overview-group':'Overview','social-group':'People & services','economy-group':'Economy & infrastructure','security-group':'Security & sources','table-group':'Detailed indicators'
};
function setProfileSection(view, shouldScroll=true){
  const selected=view || 'overview-group';
  document.querySelectorAll('.profile-switch button').forEach(btn=>btn.classList.toggle('active', btn.dataset.view===selected));
  document.querySelectorAll('[data-group]').forEach(section=>section.classList.toggle('hidden', section.dataset.group!==selected));
  const crumb=document.getElementById('breadcrumbSection');
  if(crumb) crumb.textContent=sectionLabels[selected] || 'Overview';
  document.querySelectorAll('.profile-top-nav [data-jump-view]').forEach(link=>link.classList.toggle('is-current', link.dataset.jumpView===selected));
  if(shouldScroll) document.querySelector('.dashboard')?.scrollIntoView({behavior:'smooth',block:'start'});
}
document.querySelectorAll('.profile-switch button').forEach(btn=>btn.addEventListener('click',()=>setProfileSection(btn.dataset.view,true)));
document.querySelectorAll('[data-jump-view]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();setProfileSection(link.dataset.jumpView,true);}));
setProfileSection('overview-group',false);

function drawScoreRadar(selectedYear='all'){
  const svg=document.getElementById('scoreRadar');
  if(!svg) return;
  let metrics=selectedYear==='all'?radarMetrics:radarMetrics.filter(m=>m.year===selectedYear);
  if(metrics.length<3){
    svg.innerHTML=`<text x="160" y="142" text-anchor="middle" class="radar-centre">${selectedYear}</text><text x="160" y="172" text-anchor="middle" class="radar-label">Not enough radar metrics</text><text x="160" y="194" text-anchor="middle" class="radar-label">Choose All years</text>`;
    return;
  }
  const cx=160, cy=160, maxR=105, n=metrics.length;
  const point=(i,r)=>{ const a=(-Math.PI/2)+(i*2*Math.PI/n); return [cx+Math.cos(a)*r, cy+Math.sin(a)*r]; };
  let html='';
  [0.25,0.5,0.75,1].forEach(scale=>{html+=`<polygon class="radar-grid" points="${metrics.map((_,i)=>point(i,maxR*scale).join(',')).join(' ')}"/>`;});
  metrics.forEach((m,i)=>{const [x,y]=point(i,maxR); const [lx,ly]=point(i,maxR+30); html+=`<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/><text class="radar-label" x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle">${m.label}</text>`;});
  html+=`<polygon class="radar-poly" points="${metrics.map((m,i)=>point(i,maxR*Math.max(0,Math.min(100,m.value))/100).join(',')).join(' ')}"/>`;
  metrics.forEach((m,i)=>{ const [x,y]=point(i,maxR*m.value/100); html+=`<circle class="radar-node" cx="${x}" cy="${y}" r="4"><title>${m.label}: ${m.value.toFixed(1)} (${m.year})</title></circle>`; });
  html+=`<text x="160" y="160" text-anchor="middle" dominant-baseline="middle" class="radar-centre">Lagos</text>`;
  svg.innerHTML=html;
}

function renderIndicatorTables(){
  const holder=document.getElementById('indicatorTables');
  if(!holder) return;
  const names={human:'Human development',health:'Health system',education:'Education and skills',labour:'Labour market',wash:'WASH',food:'Food security',energy:'Energy',ict:'ICT and roads'};
  const rows=Object.entries(data).flatMap(([key,items])=>items.map(r=>({category:names[key]||key,indicator:r[0],lagos:r[1],nigeria:r[2],southwest:r[3],year:r[4]})));
  holder.innerHTML=`<article class="table-dashboard detailed-single-table"><table><caption>Lagos detailed profile indicators</caption><thead><tr><th>Theme</th><th>Indicator</th><th>Lagos</th><th>Nigeria</th><th>South West</th><th>Year</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.category}</td><td>${r.indicator}</td><td>${fmtValue(r.indicator,r.lagos)}</td><td>${fmtValue(r.indicator,r.nigeria)}</td><td>${fmtValue(r.indicator,r.southwest)}</td><td>${r.year}</td></tr>`).join('')}</tbody></table></article>`;
}

loadLagosCharts();
