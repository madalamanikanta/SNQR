/* =========================================================
   SNQR Research — final unified JS (Index / Category / Division)
   (patched for paper-page navigation + editors ribbon spacing)
   + Division-level descriptions (divisionDescriptions support)
   ========================================================= */

/* ---------- Tiny CSS injected here (layout only; no theme colors touched) ---------- */
(function injectCSS(){
  const css = `
  /* --- Editors ribbon: continuous text loop (no pills) --- */
  .editors-bar{ overflow:hidden; }
  .editors-marquee{ position:relative; height:100%; overflow:hidden!important; }
  #editorsList, #editorsListClone{
    position:absolute; top:50%; transform:translateY(-50%);
    display:flex; list-style:none; margin:0; padding:0 14px; gap:24px; /* spacing added */
    white-space:nowrap; will-change:transform;
  }
  .editors-item{
    padding:0 16px;
    border-right:1px solid var(--snqr-border);   /* subtle divider */
    line-height:1.15;
  }
  .editors-item:last-child{ border-right:none }
  .editors-link{ font-weight:700; text-decoration:none }
  .editors-link:hover{ text-decoration:underline }
  .editors-item .meta{ margin-left:8px; color:var(--snqr-subtle); font-size:.9rem }

  /* --- Latest rail: hide scrollbar --- */
  .ticker{ scrollbar-width:none } .ticker::-webkit-scrollbar{ display:none }

  /* --- Typeahead (desktop) --- */
  .typeahead{
    position:absolute; top:100%; margin-top:8px; z-index:1200;
    border:1px solid var(--snqr-border); border-radius:12px;
    background:rgba(12,10,22,.96); box-shadow:var(--shadow-1);
    max-height:360px; overflow:auto; min-width:260px;
  }
  .typeahead__list{ list-style:none; margin:0; padding:6px }
  .typeahead__item{ padding:.55rem .65rem; border-radius:10px; cursor:pointer }
  .typeahead__item:hover,.typeahead__item.is-active{ background:rgba(255,255,255,.06) }
  .ta-title{ font-weight:700; margin-bottom:2px }
  .ta-meta{ color:var(--snqr-subtle); font-size:.88rem }
  .typeahead__more{ padding:.55rem .65rem; color:var(--snqr-subtle) }

  /* --- Pager --- */
  .pager{ display:flex; gap:12px; align-items:center; justify-content:center; margin-top:14px }
  .pager__btn{ border:1px solid var(--snqr-border); background:transparent; color:#fff; border-radius:999px; padding:8px 14px; cursor:pointer }
  .pager__btn[disabled]{ opacity:.5; cursor:not-allowed }
  .pager__label{ color:var(--snqr-subtle) }

  /* --- Desktop topbar: search occupies remaining width --- */
  .snqr-topbar{ display:flex; gap:10px }
  .snqr-topbar .search{ flex:1 1 auto; min-width:180px; position:relative }
  .snqr-topbar .search input[type="search"]{ width:100% }

  /* --- Mega panels (clickable, on top) --- */
  .mega{
    position:absolute; top:calc(100% + 8px); left:0; right:auto;
    min-width:520px; max-width:70vw; display:none; padding:14px;
    border-radius:14px; box-shadow:var(--shadow-1);
    background:rgba(12,10,22,.96); border:1px solid var(--snqr-border);
    z-index:1500; pointer-events:auto; opacity:0; transition:opacity .12s ease-out;
  }
  .mega.is-open{ display:block; opacity:1 }
  .mega__title{ margin:.2rem 0 .6rem; font-weight:800; font-size:1rem }
  .mega__chips{ display:flex; flex-wrap:wrap; gap:8px }
  .mega__chips a{ display:inline-block; padding:.38rem .65rem; border:1px solid var(--snqr-border); border-radius:999px; white-space:nowrap; font-weight:600 }
  .mega__chips a:hover{ background:rgba(255,255,255,.08) }

  /* --- Profile (circle initials + hover) --- */
  .profile{ position:relative }
  .profile__btn{ display:flex; align-items:center; gap:8px; padding:6px 10px; border:1px solid var(--snqr-border); border-radius:999px; background:transparent; color:#fff }
  .profile__avatar{ width:28px; height:28px; border-radius:50%; border:1px solid var(--snqr-border); object-fit:cover; background:#222; display:grid; place-items:center; font-weight:800 }
  .profile__menu{ position:absolute; right:0; top:calc(100% + 8px); min-width:220px; display:none; background: rgba(12,10,22,.96); border:1px solid var(--snqr-border); border-radius:12px; box-shadow: var(--shadow-1); padding:6px; z-index:1600 }
  .profile:hover .profile__menu{ display:block }
  .profile__menu a, .profile__menu button{ display:flex; width:100%; gap:10px; align-items:center; padding:.5rem .6rem; border-radius:10px; border:1px solid transparent; background:transparent; color:#fff; cursor:pointer }
  .profile__menu a:hover, .profile__menu button:hover{ background: rgba(255,255,255,.06) }

  /* --- Mobile header tweaks --- */
  .snqr-mobile-btn{ display:none; align-items:center; justify-content:center; width:38px; height:38px; border-radius:10px; border:1px solid var(--snqr-border); background:transparent; color:#fff; cursor:pointer }
  @media (max-width: 720px){
    .snqr-mobile-btn{ display:flex }
    .snqr-topbar .sort-inline{ display:flex; min-width:92px }
    .snqr-topbar .search{ display:none } /* overlay search will handle mobile */
    .brand{ position:absolute; left:50%; transform:translateX(-50%); z-index:1 }
  }

  /* --- Drawer (3 dots) --- */
  .drawer{ position:fixed; inset:0; display:none; z-index:3000 }
  .drawer.is-open{ display:block }
  .drawer__scrim{ position:absolute; inset:0; background:rgba(0,0,0,.45); backdrop-filter:blur(2px) }
  .drawer__panel{ position:absolute; right:0; top:0; height:100%; width:min(380px,86vw); background:rgba(12,10,22,.96); border-left:1px solid var(--snqr-border); box-shadow:var(--shadow-2); padding:14px; overflow:auto; display:flex; flex-direction:column; gap:14px }
  .drawer__title{ margin:.1rem 0 .6rem; font-size:1.05rem; font-weight:800 }
  .drawer__section{ border-top:1px solid var(--snqr-border); padding-top:10px; margin-top:2px }
  .drawer__row{ display:flex; align-items:center; justify-content:space-between; gap:8px; padding:.4rem .2rem; font-weight:800; cursor:pointer }
  .drawer__chips{ display:none; flex-wrap:wrap; gap:8px; margin:6px 0 0 }
  .drawer__chips.is-open{ display:flex }
  .drawer__chips a{ display:inline-block; padding:.38rem .65rem; border:1px solid var(--snqr-border); border-radius:999px }

  /* --- Mobile search overlay --- */
  .search-ov{ position:fixed; inset:0; display:none; z-index:3200 }
  .search-ov.is-open{ display:block }
  .search-ov__scrim{ position:absolute; inset:0; background:rgba(0,0,0,.5); backdrop-filter:blur(2px) }
  .search-ov__panel{ position:absolute; left:50%; transform:translateX(-50%); top:10px; width:min(720px,94vw); background:rgba(12,10,22,.98); border:1px solid var(--snqr-border); border-radius:14px; box-shadow:var(--shadow-2); padding:10px }
  .search-ov__row{ display:flex; gap:8px; align-items:center }
  .search-ov__row input{ flex:1; padding:10px 12px; border-radius:999px; border:1px solid var(--snqr-border); background:rgba(255,255,255,.06); color:#fff; outline:none }
  .search-ov__close{ width:38px; height:38px; border-radius:10px; border:1px solid var(--snqr-border); background:transparent; color:#fff; display:flex; align-items:center; justify-content:center }
  .search-ov__list{ max-height:60vh; overflow:auto; margin-top:8px }
  .search-ov__item{ padding:.55rem .65rem; border-radius:10px; cursor:pointer }
  .search-ov__item:hover{ background:rgba(255,255,255,.06) }
  `;
  const s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
})();

/* ---------- Utilities ---------- */
const DISPLAY_CAT = { flagship: 'Standard SNQR Research', signature: 'SNQR Signature', lab: 'SNQR Quant & Quantum Lab' };
const MEGA_EXIT_DELAY_MS = 220;
const TYPEAHEAD_DEBOUNCE_MS = 120;
const TYPEAHEAD_MAX = 8;
const TICKER_V_SPEED = 32;
const EDITORS_SPEED = 24;  // px/sec
const GRID_SKELETON_COUNT = 6;

const $  = (s, ctx=document)=>ctx.querySelector(s);
const $$ = (s, ctx=document)=>Array.from(ctx.querySelectorAll(s));
const fmtDate = d => { const t=new Date(d); return Number.isNaN(+t)?'':t.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'2-digit'}) };
const escapeHtml = s => (s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[m]));
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const highlight = (text,q)=> !q ? escapeHtml(text||'') : escapeHtml(text||'').replace(new RegExp(`(${reEsc(q)})`,'ig'),'<mark>$1</mark>');
const normalize = str => (str||'').toLowerCase().replace(/[\u2122™®©]/g,'').replace(/&/g,'and').replace(/[^a-z0-9]+/g,'').trim();
const initials = (name)=> (name||'').replace(/[^a-zA-Z ]/g,'').trim().split(/[\s-]+/).map(w=>w[0]||'').join('').slice(0,3).toUpperCase() || 'G';

/* ---------- NEW: division description helpers ---------- */
const normalizeLoose = s => String(s||'').toLowerCase()
  .replace(/[\u2122™®©]/g,'')
  .replace(/&/g,'and')
  .replace(/[^a-z0-9]+/g,' ')
  .trim();

/** Resolve a division description from category data.
 *  Supports keys: divisionDescriptions OR "division descriptions".
 *  Tolerant to ™/® symbols and spacing differences in division names.
 */
function getDivisionDescription(catObj, divisionDisplayName){
  if (!catObj || !divisionDisplayName) return '';
  const maps = [
    catObj.divisionDescriptions,
    catObj['division descriptions']
  ].filter(Boolean);
  if (!maps.length) return '';

  const want = normalizeLoose(divisionDisplayName);

  for (const map of maps){
    // 1) Exact key
    if (map[divisionDisplayName]) return String(map[divisionDisplayName]);

    // 2) Tolerant match
    for (const [k, v] of Object.entries(map)){
      if (normalizeLoose(k) === want) return String(v);
    }
  }
  return '';
}

/* ---------- Data & state ---------- */
const DATA  = { cats:[], pubs:[], catSlugFromName:new Map(), catNameFromSlug:new Map() };
const STATE = { pageType:document.body.dataset.page||'core', cat:null, division:'', format:'', q:'', sort:'newest', page:1, perPage:6, typeaheadActiveIndex:-1 };
const USER  = { isAuthed:false, name:'', email:'', avatar:'', favorites:new Set() };

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', async ()=>{
  const qs = new URLSearchParams(location.search);
  if (qs.has('cat'))      STATE.cat = qs.get('cat');
  if (qs.has('division')) STATE.division = decodeURIComponent(qs.get('division'));
  if (qs.has('q'))        STATE.q = qs.get('q');
  if (qs.has('sort'))     STATE.sort = qs.get('sort');
  if (qs.has('format'))   STATE.format = qs.get('format');
  if (qs.has('page'))     STATE.page = Math.max(1, parseInt(qs.get('page'),10)||1);

  try { await loadData(); } catch(e){ console.error(e); showDataError(e); return; }
  STATE.cat = slugifyCat(STATE.cat) || STATE.cat;

  hydrateHeader();
  buildMegaPanelsProximity();
  installMobileDrawer();
  installMobileSearchOverlay();
  installTypeahead();

  /* >>> key fix: do NOT enable soft-nav on the paper page <<< */
  const isPaper = (STATE.pageType||'').toLowerCase()==='paper';
  if (!isPaper) enableSoftNav();

  updateActiveNav();

  if (STATE.pageType === 'core') renderCoreTiles();
  else if (STATE.pageType === 'category'){ STATE.cat=(STATE.cat||'flagship').toLowerCase(); renderCategoryPage(); }
  else if (STATE.pageType === 'division'){ STATE.cat=(STATE.cat||'flagship').toLowerCase(); if(!STATE.division){ const c=DATA.cats.find(x=>x.slug===STATE.cat); STATE.division=(c?.divisions?.[0])||''; } renderDivisionPage(); }
  
  buildEditorsBarInfinity();
  await buildTickerContinuous();
  document.addEventListener('DOMContentLoaded', async ()=>{
  const qs = new URLSearchParams(location.search);
  if (qs.has('cat'))      STATE.cat = qs.get('cat');
  if (qs.has('division')) STATE.division = decodeURIComponent(qs.get('division'));
  if (qs.has('q'))        STATE.q = qs.get('q');
  if (qs.has('sort'))     STATE.sort = qs.get('sort');
  if (qs.has('format'))   STATE.format = qs.get('format');
  if (qs.has('page'))     STATE.page = Math.max(1, parseInt(qs.get('page'),10)||1);

  try {
    await loadData();
    await loadArticles();              // <<< NEW: fetch articles.json too
  } catch(e){ console.error(e); showDataError(e); return; }

  STATE.cat = slugifyCat(STATE.cat) || STATE.cat;

  hydrateHeader();
  buildMegaPanelsProximity();
  installMobileDrawer();
  installMobileSearchOverlay();
  installTypeahead();

  const isPaper = (STATE.pageType||'').toLowerCase()==='paper';
  if (!isPaper) enableSoftNav();

  updateActiveNav();

  if (STATE.pageType === 'core') renderCoreTiles();
  else if (STATE.pageType === 'category'){ STATE.cat=(STATE.cat||'flagship').toLowerCase(); renderCategoryPage(); }
  else if (STATE.pageType === 'division'){ STATE.cat=(STATE.cat||'flagship').toLowerCase(); if(!STATE.division){ const c=DATA.cats.find(x=>x.slug===STATE.cat); STATE.division=(c?.divisions?.[0])||''; } renderDivisionPage(); }

  buildEditorsBarInfinity();
  await buildTickerContinuous();

  // <<< NEW: hydrate Articles block and/or Articles directory, if present
  initArticlesBlock();
  renderArticlesDirectory();
});

});

/* ---------- Data loader (keeps your working paths) ---------- */
const withVersion = p => p + (p.includes('?')?'&':'?') + 'v=' + Math.floor(Date.now()/60000);
async function fetchFirst(paths){
  let lastErr;
  for (const p of paths){
    try{
      const r = await fetch(withVersion(p), { cache:'no-store' });
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      return await r.json();
    }catch(e){ lastErr=e; }
  }
  throw lastErr || new Error('All JSON paths failed');
}
async function loadData(){
  if (location.protocol==='file:') throw new Error('Serve via local web server. (file:// blocks fetch)');
  const catsRaw = await fetchFirst(['./data/categories.json','data/categories.json','./data/category.json','data/category.json','/research/data/categories.json','/research/data/category.json']);
  const pubsRaw = await fetchFirst(['./data/publications.json','data/publications.json','./data/publication.json','data/publication.json','/research/data/publications.json','/research/data/publication.json']);
  const cats = catsRaw?.categories || catsRaw?.data?.categories || catsRaw;
  const pubs = pubsRaw?.publications || pubsRaw?.publication || pubsRaw?.data || pubsRaw?.items || pubsRaw;
  if(!Array.isArray(cats)||!Array.isArray(pubs)) throw new Error('Malformed JSON: arrays missing.');
  DATA.cats = cats.map(c=>({ ...c, slug:(c.slug||normalize(c.name)).toLowerCase() }));
  DATA.catSlugFromName.clear(); DATA.catNameFromSlug.clear();
  for (const c of DATA.cats){
    DATA.catSlugFromName.set(normalize(c.name), c.slug);
    DATA.catSlugFromName.set(normalize(c.slug), c.slug);
    DATA.catNameFromSlug.set(c.slug, c.name);
  }
  DATA.pubs = pubs.map(p=>({ ...p, catSlug: slugifyCat(p.cat||p.catSlug), divisionNorm: normalize(p.division) }));
}
function slugifyCat(val){ if (!val) return ''; const k=normalize(val); return DATA.catSlugFromName.get(k) || val.toLowerCase(); }

/* ---------- Error UI ---------- */
function showDataError(err){
  const main=document.createElement('main'); main.className='layout';
  main.innerHTML=`<section class="result"><div class="glass" style="padding:16px">
    <h3 style="margin:.2rem 0 .6rem">We couldn’t load SNQR Research data.</h3>
    <p style="color:#b9b9c8;margin:.2rem 0 1rem">Use a local server and keep JSON at <code>./data/categories.json</code> and <code>./data/publications.json</code>.</p>
    <pre style="white-space:pre-wrap;background:rgba(255,255,255,.04);padding:.6rem;border-radius:8px;border:1px solid rgba(255,255,255,.08)">${escapeHtml(String(err))}</pre>
  </div></section>`;
  document.body.appendChild(main);
}

/* ---------- Header / nav ---------- */
function hydrateHeader(){
  // make brand logo non-clickable
  const brand = document.querySelector('.brand');
  if (brand){ brand.removeAttribute('href'); brand.style.cursor='default'; }

  // nav labels + hrefs
  $$('[data-catlink]').forEach(a=>{
    const slug=a.getAttribute('data-catlink');
    a.textContent = DISPLAY_CAT[slug] || slug;
    a.href = `./category.html?cat=${encodeURIComponent(slug)}`;
  });

  // profile initials
  try{ const fav=JSON.parse(localStorage.getItem('snqr_guest_favs')||'[]'); USER.favorites=new Set(fav); }catch{}
  const avatar=$('#profileAvatar'); const nameEl=$('#profileName');
  const name = USER.isAuthed ? (USER.name||'User') : 'Guest';
  if (nameEl) nameEl.textContent = name;
  if (avatar){
    if (USER.avatar){ avatar.src=USER.avatar; avatar.alt=name; }
    else { avatar.removeAttribute('src'); avatar.alt=name; avatar.textContent = initials(name); avatar.style.display='grid'; }
  }
  buildProfileMenu();

  // search + sort
  $('#q') && ($('#q').value = STATE.q || '');
  $('#sortTop') && ($('#sortTop').value = STATE.sort || 'newest');

  $('#btnSearch')?.addEventListener('click', ()=>{ doSearchFromTopbar(); });
  $('#q')?.addEventListener('keydown', e=>{ if(handleTypeaheadKeys(e)) return; if(e.key==='Enter'){ e.preventDefault(); doSearchFromTopbar(); } });
  $('#sortTop')?.addEventListener('change', e=>{ STATE.sort=e.target.value; if(STATE.pageType!=='core'){ STATE.page=1; renderGrid(); renderPager(); } buildEditorsBarInfinity(true); buildTickerContinuous(true); });
}
function buildProfileMenu(){
  const menu=$('#profileMenu'); if(!menu) return; menu.innerHTML='';
  const logged=!!USER.isAuthed;
  const makeItem=(label,href)=>{ const a=document.createElement('a'); a.href=href||'#'; a.textContent=label; a.addEventListener('click',e=>{ if(href==='#'){ e.preventDefault(); } }); return a; };
  if (!logged){
    menu.appendChild(makeItem('Log in','/login.html'));
    menu.appendChild(makeItem('Sign up','/signup.html'));
  }else{
    menu.appendChild(makeItem('Profile','/account.html'));
    menu.appendChild(makeItem('Log out','/logout.html'));
  }
  // also open on click in addition to :hover
  $('#btnProfile')?.addEventListener('click', (e)=>{
    e.stopPropagation(); const open=!menu.classList.contains('is-open'); menu.classList.toggle('is-open', open); document.addEventListener('click', function onDoc(ev){ if(!menu.contains(ev.target) && !$('#btnProfile').contains(ev.target)){ menu.classList.remove('is-open'); document.removeEventListener('click', onDoc); } });
  });
}
function doSearchFromTopbar(){
  const q = ($('#q')?.value || '').trim();
  if (STATE.pageType === 'core'){
    window.location.href = `./category.html?cat=all&q=${encodeURIComponent(q)}&sort=${encodeURIComponent(STATE.sort||'newest')}`;
    return;
  }
  STATE.q=q; STATE.cat='all'; STATE.page=1;
  pushQS(); renderGrid(); renderPager(); buildEditorsBarInfinity(true); buildTickerContinuous(true); hideTypeahead(); updateActiveNav();
}
function updateActiveNav(){
  $$('[data-catlink]').forEach(a=> a.classList.remove('is-active'));
  const slug=(STATE.cat||'').toLowerCase();
  if(['flagship','signature','lab'].includes(slug)){ $(`[data-catlink="${slug}"]`)?.classList.add('is-active'); }
}

/* ---------- Desktop mega panels (proximity + click; fully clickable) ---------- */
function buildMegaPanelsProximity(){
  const nav=$('.nav'); if(!nav) return;
  DATA.cats.forEach(c=>{
    const el=$(`#mega-${c.slug}`); if(!el) return;
    el.innerHTML=`<div class="mega__title">${DISPLAY_CAT[c.slug]||c.name}</div>
      <div class="mega__chips">
        ${(c.divisions||[]).map(d=>`<a href="./division.html?cat=${c.slug}&division=${encodeURIComponent(d)}">${d}</a>`).join('')}
      </div>`;
  });

  const triggers=['flagship','signature','lab'].map(slug=>{
    const trigger=$(`[data-catlink="${slug}"]`);
    const panel=$(`#mega-${slug}`);
    if(!trigger||!panel) return null;
    const place=()=>{
      const r=trigger.getBoundingClientRect(); const n=nav.getBoundingClientRect();
      const left=Math.max(10, r.left - n.left); panel.style.left=left+'px';
    };
    place(); window.addEventListener('resize', place);
    return{slug,trigger,panel,hideTimer:null};
  }).filter(Boolean);

  const openOnly=t=>{ triggers.forEach(x=> x.panel.classList.toggle('is-open', x===t)); };
  const closeAll=()=> triggers.forEach(x=> x.panel.classList.remove('is-open'));

  triggers.forEach(t=>{
    const scheduleClose = ()=>{ t.hideTimer=setTimeout(()=> openOnly(null), MEGA_EXIT_DELAY_MS); };
    const cancelClose   = ()=>{ if(t.hideTimer){ clearTimeout(t.hideTimer); t.hideTimer=null; } };

    t.trigger.addEventListener('mouseenter', ()=>{ cancelClose(); openOnly(t); });
    t.trigger.addEventListener('focus',      ()=>{ cancelClose(); openOnly(t); });
    t.trigger.addEventListener('mouseleave', scheduleClose);
    t.panel.addEventListener('mouseenter', cancelClose);
    t.panel.addEventListener('mouseleave', scheduleClose);

    // >>> key fix: on the paper page, let clicks navigate (no preventDefault)
    t.trigger.addEventListener('click', (e)=>{
      if ((document.body.dataset.page||'').toLowerCase()==='paper') return;
      e.preventDefault();
      const on=!t.panel.classList.contains('is-open'); closeAll(); if(on) openOnly(t);
    });
  });

  const R=48; // proximity radius enlarged
  document.addEventListener('mousemove', (e)=>{
    let opened=false;
    for(const t of triggers){
      const pr=t.panel.getBoundingClientRect();
      const inPanel = e.clientX>=pr.left && e.clientX<=pr.right && e.clientY>=pr.top && e.clientY<=pr.bottom;
      if(inPanel){ openOnly(t); return; }
    }
    for(const t of triggers){
      const r=t.trigger.getBoundingClientRect();
      const inX=e.clientX>=(r.left-R)&&e.clientX<=(r.right+R);
      const inY=e.clientY>=(r.top-R)&&e.clientY<=(r.bottom+R);
      if(inX&&inY){ openOnly(t); opened=true; break; }
    }
    if(!opened) closeAll();
  });
}

/* ---------- Typeahead (desktop) ---------- */
let taTimer=null;
function installTypeahead(){
  const holder=$('.search'); if(!holder) return;
  let box=$('#typeahead'); if(!box){ box=document.createElement('div'); box.id='typeahead'; box.className='typeahead'; holder.appendChild(box); }
  const input=$('#q');
  function positionBox(){ if(!box||!input) return; const pr=holder.getBoundingClientRect(); const r=input.getBoundingClientRect(); box.style.left=(r.left-pr.left)+'px'; box.style.width=r.width+'px'; }
  positionBox(); window.addEventListener('resize', positionBox);
  if(input){ input.setAttribute('role','combobox'); input.setAttribute('aria-autocomplete','list'); input.setAttribute('aria-expanded','false'); input.setAttribute('aria-controls','typeahead'); input.addEventListener('input', e=>{ const q=(e.target.value||'').trim(); clearTimeout(taTimer); taTimer=setTimeout(()=>{ renderTypeahead(q); positionBox(); }, TYPEAHEAD_DEBOUNCE_MS); }); }
  document.addEventListener('click', (e)=>{ if(!box.contains(e.target) && e.target!==input) hideTypeahead(); });
}
function renderTypeahead(q){
  const box=$('#typeahead'); const input=$('#q'); if(!box||!input) return; if(!q){ hideTypeahead(); return; }
  const needle=q.toLowerCase();
  const rows = DATA.pubs.map(p=>{ const t=(p.title||'').toLowerCase(); const d=(p.deck||'').toLowerCase(); const v=(p.division||'').toLowerCase(); let score=-Infinity; if(t.startsWith(needle)) score=3; else if(t.includes(needle)) score=2; else if(d.includes(needle)||v.includes(needle)) score=1; return {p,score}; })
    .filter(x=>x.score>-Infinity)
    .sort((a,b)=> b.score-a.score || (new Date(b.p.publishDate)-new Date(a.p.publishDate)))
    .slice(0, TYPEAHEAD_MAX).map(x=>x.p);
  if(!rows.length){ hideTypeahead(); return; }
  box.innerHTML = `
    <ul class="typeahead__list" role="listbox">
      ${rows.map((p,i)=>`
        <li class="typeahead__item" role="option" data-index="${i}" data-url="${p.url||'#'}">
          <div class="ta-title">${highlight(p.title, q)}</div>
          <div class="ta-meta">${p.division||''} • <span class="badge">${DISPLAY_CAT[p.catSlug]||p.catSlug}</span> • ${fmtDate(p.publishDate)}</div>
        </li>`).join('')}
      <li class="typeahead__more" role="option" data-index="-1">View all results for “${escapeHtml(q)}”</li>
    </ul>`;
  input.setAttribute('aria-expanded','true'); STATE.typeaheadActiveIndex=-1;
  $$('.typeahead__item').forEach(li=>{ li.addEventListener('mouseenter', ()=> setActiveTypeahead(parseInt(li.dataset.index,10))); li.addEventListener('mouseleave', ()=> setActiveTypeahead(-1)); li.addEventListener('click', ()=> window.location.href = li.dataset.url || '#'); });
  $('.typeahead__more')?.addEventListener('click', ()=>{ if(STATE.pageType==='core') window.location.href=`./category.html?cat=all&q=${encodeURIComponent(q)}&sort=${encodeURIComponent(STATE.sort||'newest')}`; else { STATE.q=q; STATE.cat='all'; STATE.page=1; pushQS(); renderGrid(); renderPager(); buildEditorsBarInfinity(true); buildTickerContinuous(true); hideTypeahead(); updateActiveNav(); } });
}
function hideTypeahead(){ const b=$('#typeahead'), i=$('#q'); if(!b) return; b.innerHTML=''; i?.setAttribute('aria-expanded','false'); STATE.typeaheadActiveIndex=-1; }
function setActiveTypeahead(idx){ STATE.typeaheadActiveIndex=idx; $$('.typeahead__item').forEach(li=> li.classList.toggle('is-active', parseInt(li.dataset.index,10)===idx)); }
function handleTypeaheadKeys(e){ const box=$('#typeahead'); const list=$('.typeahead__list'); if(!box||!list||!box.innerHTML.trim()) return false; const items=$$('.typeahead__item'); if(e.key==='ArrowDown'){ e.preventDefault(); let i=STATE.typeaheadActiveIndex+1; if(i>=items.length) i=-1; setActiveTypeahead(i); return true; } if(e.key==='ArrowUp'){ e.preventDefault(); let i=STATE.typeaheadActiveIndex-1; if(i<-1) i=items.length-1; setActiveTypeahead(i); return true; } if(e.key==='Escape'){ hideTypeahead(); return true; } if(e.key==='Enter'){ e.preventDefault(); if(STATE.typeaheadActiveIndex>=0){ const li=items[STATE.typeaheadActiveIndex]; window.location.href=li?.dataset.url||'#'; } else { doSearchFromTopbar(); } return true; } return false; }

/* ---------- Core tiles ---------- */
function renderCoreTiles(){ const wrap=$('#tiles'); if(!wrap) return; wrap.innerHTML=''; DATA.cats.forEach(c=>{ const title=DISPLAY_CAT[c.slug]||c.name; const tile=document.createElement('article'); tile.className='tile glass'; tile.innerHTML=`<div class="tile__content"><div class="tile__header"><img src="${c.logo||''}" alt="" class="tile__logo" onerror="this.style.display='none'"/><h2 class="tile__title">${title}</h2></div><p class="tile__deck">${c.blurb||''}</p><a href="./category.html?cat=${c.slug}" class="btn btn--primary">Learn More</a></div><div class="tile__image" style="background-image:url('${c.tileImage||''}'); background-size:cover; background-position:center; min-height:180px"></div>`; wrap.appendChild(tile); }); }

/* ---------- Category / Division pages ---------- */
function renderCategoryPage(){
  const isAll=(STATE.cat==='all'); const cat=isAll?null:(DATA.cats.find(c=>c.slug===STATE.cat)||DATA.cats[0]);
  $('#heroKicker') && ($('#heroKicker').textContent='SNQR Research');
  $('#heroTitle')  && ($('#heroTitle').textContent= isAll ? 'All Research' : (DISPLAY_CAT[cat.slug]||cat.name));
  $('#heroDeck')   && ($('#heroDeck').textContent = isAll ? 'Search and filter across all categories and divisions.' : (cat.blurb||''));
  const hero=$('#heroImage'); const imgUrl=isAll?'':(cat.heroImage||''); if(hero){ if(imgUrl){ hero.classList.remove('is-loaded'); const im=new Image(); im.onload=()=> hero.classList.add('is-loaded'); im.src=imgUrl; hero.style.backgroundImage=`url("${imgUrl}")`; } else { hero.style.backgroundImage=''; hero.classList.add('is-loaded'); } }
  const chips=$('#divisionChips'); if(chips){ chips.innerHTML=''; const frag=document.createDocumentFragment(); if(!isAll){ const all=document.createElement('a'); all.className='chip'; all.textContent='All'; all.href=`./category.html?cat=${cat.slug}`; frag.appendChild(all); (cat.divisions||[]).forEach(name=>{ const a=document.createElement('a'); a.className='chip'; a.textContent=name; a.href=`./division.html?cat=${cat.slug}&division=${encodeURIComponent(name)}`; frag.appendChild(a); }); } else { DATA.cats.forEach(c=>{ const all=document.createElement('a'); all.className='chip'; all.textContent=(DISPLAY_CAT[c.slug]||c.name); all.href=`./category.html?cat=${c.slug}`; frag.appendChild(all); }); } chips.appendChild(frag); }
  const sel=$('#fDivision'); if(sel){ const divs=isAll?[]:(cat.divisions||[]); sel.innerHTML = isAll?`<option value="">All</option>`:`<option value="">All</option>${divs.map(d=>`<option>${d}</option>`).join('')}`; sel.disabled = isAll; sel.onchange=e=>{ const v=e.target.value||''; if(!v){ window.location.href=`./category.html?cat=${isAll?'all':cat.slug}`; return; } window.location.href=`./division.html?cat=${cat.slug}&division=${encodeURIComponent(v)}`; } }
  $('#fFormat')?.addEventListener('change', e=>{ STATE.format=e.target.value||''; STATE.page=1; pushQS(); renderGrid(); renderPager(); });
  $('#btnClear')?.addEventListener('click', ()=>{ STATE.q=''; $('#q')&&($('#q').value=''); STATE.division=''; $('#fDivision')&&($('#fDivision').value=''); STATE.format=''; $('#fFormat')&&($('#fFormat').value=''); STATE.sort='newest'; $('#sortTop')&&($('#sortTop').value='newest'); STATE.page=1; pushQS(); renderGrid(); renderPager(); buildEditorsBarInfinity(true); buildTickerContinuous(true); hideTypeahead(); updateActiveNav(); });
  $('#btnShare')?.addEventListener('click', shareLink); $('#btnSave')?.addEventListener('click', saveCurrentView);
  $('#btnMore') && ($('#btnMore').style.display='none'); renderGrid(); renderPager(); updateActiveNav();
}
function renderDivisionPage(){
  const cat=DATA.cats.find(c=>c.slug===STATE.cat)||DATA.cats[0];
  const rawDiv=STATE.division||'';

  // Resolve display name tolerant to ™/® and spacing
  const divisionDisplayName =
    (cat?.divisions||[]).find(d => normalizeLoose(d) === normalizeLoose(rawDiv)) || rawDiv;

  $('#heroKicker') && ($('#heroKicker').textContent = DISPLAY_CAT[cat.slug]||cat.name);
  $('#heroTitle')  && ($('#heroTitle').textContent  = divisionDisplayName || 'Division');

  // NEW: use per-division description with graceful fallback
  const divDesc = getDivisionDescription(cat, divisionDisplayName)
               || `Research stream under ${DISPLAY_CAT[cat.slug]||cat.name}.`;
  $('#heroDeck')   && ($('#heroDeck').textContent   = divDesc);

  const hero=$('#heroImage'); const imgUrl=cat.heroImage||''; if(hero){ if(imgUrl){ hero.classList.remove('is-loaded'); const im=new Image(); im.onload=()=> hero.classList.add('is-loaded'); im.src=imgUrl; hero.style.backgroundImage=`url("${imgUrl}")`; } else { hero.style.backgroundImage=''; hero.classList.add('is-loaded'); } }
  const chips=$('#divisionChips'); if(chips){ chips.innerHTML=''; const frag=document.createDocumentFragment(); const all=document.createElement('a'); all.className='chip'; all.textContent='All'; all.href=`./category.html?cat=${cat.slug}`; frag.appendChild(all); (cat.divisions||[]).forEach(name=>{ const a=document.createElement('a'); a.className='chip'+(normalize(name)===normalize(divisionDisplayName)?' is-active':''); a.textContent=name; a.href=`./division.html?cat=${cat.slug}&division=${encodeURIComponent(name)}`; frag.appendChild(a); }); chips.appendChild(frag); }
  const sel=$('#fDivision'); if(sel){ sel.disabled=false; sel.innerHTML = `<option value="">All</option>${(cat.divisions||[]).map(d=>`<option ${normalize(d)===normalize(divisionDisplayName)?'selected':''}>${d}</option>`).join('')}`; sel.onchange=e=>{ const v=e.target.value||''; if(!v){ window.location.href=`./category.html?cat=${cat.slug}`; return; } window.location.href=`./division.html?cat=${cat.slug}&division=${encodeURIComponent(v)}`; } }
  $('#fFormat')?.addEventListener('change', e=>{ STATE.format=e.target.value||''; STATE.page=1; pushQS(); renderGrid(); renderPager(); });
  $('#btnClear')?.addEventListener('click', ()=>{ STATE.q=''; $('#q')&&($('#q').value=''); STATE.format=''; $('#fFormat')&&($('#fFormat').value=''); STATE.sort='newest'; $('#sortTop')&&($('#sortTop').value='newest'); STATE.page=1; pushQS(); renderGrid(); renderPager(); buildEditorsBarInfinity(true); buildTickerContinuous(true); hideTypeahead(); updateActiveNav(); });
  $('#btnShare')?.addEventListener('click', shareLink); $('#btnSave')?.addEventListener('click', saveCurrentView);
  $('#btnMore') && ($('#btnMore').style.display='none'); renderGrid(); renderPager(); updateActiveNav();
}

/* ---------- Grid + Pager ---------- */
let _lastFilteredCount=0;
function renderGrid(){
  showGridSkeleton(GRID_SKELETON_COUNT);
  let rows; if((STATE.q&&STATE.q.trim().length)||STATE.cat==='all') rows=DATA.pubs.slice(); else rows=DATA.pubs.filter(p=>p.catSlug===STATE.cat);
  if(!STATE.q||!STATE.q.trim().length){ if(STATE.pageType==='division') rows=rows.filter(p=> p.divisionNorm===normalize(STATE.division)); else if(STATE.division) rows=rows.filter(p=> p.divisionNorm===normalize(STATE.division)); }
  if(STATE.q&&STATE.q.trim().length) rows=filterByQuery(rows, STATE.q);
  if(STATE.format) rows=rows.filter(p=>p.format===STATE.format);
  rows=applySort(rows, STATE.sort); _lastFilteredCount=rows.length;
  const start=(STATE.page-1)*STATE.perPage; const end=STATE.page*STATE.perPage; const slice=rows.slice(start,end);
  const grid=$('#grid'); if(!grid) return; grid.innerHTML=''; const frag=document.createDocumentFragment(); slice.forEach(p=> frag.appendChild(card(p))); grid.appendChild(frag);
  if(!rows.length) grid.innerHTML = `<div class="card glass" style="padding:1rem"><p>No matches. Try clearing filters or changing your search.</p></div>`;
}
function renderPager(){ const result=$('.result'); if(!result) return; let pager=$('#pager'); if(!pager){ pager=document.createElement('div'); pager.id='pager'; pager.className='pager'; result.appendChild(pager); } const totalPages=Math.max(1, Math.ceil(_lastFilteredCount/STATE.perPage)); if(STATE.page>totalPages) STATE.page=totalPages; pager.innerHTML = `<button class="pager__btn" id="pgPrev" ${STATE.page<=1?'disabled':''}>Previous</button><span class="pager__label">Page ${STATE.page} / ${totalPages}</span><button class="pager__btn" id="pgNext" ${STATE.page>=totalPages?'disabled':''}>Next</button>`; $('#pgPrev')?.addEventListener('click', ()=> goToPage(STATE.page-1)); $('#pgNext')?.addEventListener('click', ()=> goToPage(STATE.page+1)); }
function goToPage(n){ const totalPages=Math.max(1, Math.ceil(_lastFilteredCount/STATE.perPage)); STATE.page=Math.min(Math.max(1,n),totalPages); pushQS(); renderGrid(); renderPager(); }
function card(p){ const isFav=USER.favorites.has(p.id); const el=document.createElement('article'); el.className='card glass'; el.setAttribute('aria-labelledby',`t-${p.id}`); el.innerHTML = `<button class="heart ${isFav?'is-active':''}" data-id="${p.id}" aria-pressed="${isFav}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.716-4.368-9.428-7.08C-1.14 12.37.322 8.2 3.6 7.6 5.7 7.2 7.3 8.3 8 9.3c.7-1 2.3-2.1 4.4-1.7 3.278.6 4.74 4.77.972 6.32C18.716 16.632 12 21 12 21z"/></svg></button><div class="card__media" role="img" aria-label="cover image" style="background-image:url('${p.image||''}');background-size:cover;background-position:center;"></div><div class="card__body"><h3 id="t-${p.id}" class="card__title">${p.title}</h3><p class="card__deck">${p.deck||''}</p><div class="card__meta"><span>${fmtDate(p.publishDate)}</span><span>•</span><span>${p.format||'—'}</span><span>•</span><span class="badge">${p.division||''}</span><span>•</span><span>${p.id||p.researchCode||''}</span></div></div><div class="card__footer"><a href="${p.url||'#'}" class="btn btn--outline btn-read" data-id="${p.id}">Read</a>${p.pdf?`<a href="${p.pdf}" class="pill">PDF</a>`:''}</div>`; el.querySelector('.heart')?.addEventListener('click',(e)=>{ e.preventDefault(); e.stopPropagation(); const btn=e.currentTarget; const active=btn.classList.toggle('is-active'); btn.setAttribute('aria-pressed', active?'true':'false'); if(active) USER.favorites.add(p.id); else USER.favorites.delete(p.id); localStorage.setItem('snqr_guest_favs', JSON.stringify([...USER.favorites])); }); return el; }

/* ---------- Search & sort ---------- */
function filterByQuery(rows, q){ const needle=(q||'').toLowerCase(); if(!needle) return rows; return rows.filter(p => (p.title||'').toLowerCase().includes(needle) || (p.deck||'').toLowerCase().includes(needle) || (p.researchCode||p.id||'').toLowerCase().includes(needle) || (p.division||'').toLowerCase().includes(needle) || (p.catSlug||'').toLowerCase().includes(needle)); }
function applySort(rows, mode){ const r=rows.slice(); switch(mode){ case 'newest': r.sort((a,b)=> new Date(b.publishDate)-new Date(a.publishDate)); break; case 'mostread': r.sort((a,b)=> (b.views||0)-(a.views||0)); break; case 'editors': r.sort((a,b)=> (b.editorsPick?1:0)-(a.editorsPick?1:0)); break; } return r; }

/* ---------- Latest Research: continuous vertical loop with proximity pause ---------- */
let tickerRAF=null, tickerPaused=false, tickerIdleTimer=null, cursor={x:-1,y:-1};
async function buildTickerContinuous(rebuild=false){ const rail=$('.ticker'); const ul=$('#latestTicker'); if(!rail||!ul) return; if(rebuild&&tickerRAF){ cancelAnimationFrame(tickerRAF); tickerRAF=null; } ul.innerHTML=''; const items=applySort(DATA.pubs.slice(), STATE.sort); items.forEach(p=>{ const li=document.createElement('li'); li.innerHTML = `<h4 class="title"><a href="${p.url||'#'}">${p.title}</a></h4><div class="meta"><span>${fmtDate(p.publishDate)}</span><span>•</span><span>${p.id||''}</span><span>•</span><span class="badge">${p.catSlug}</span></div>`; ul.appendChild(li); }); ul.innerHTML+=ul.innerHTML; rail.scrollTop=0; let last=performance.now(); const idleResume=()=>{ clearTimeout(tickerIdleTimer); tickerIdleTimer=setTimeout(()=> tickerPaused=false, 1600); }; function proximityPause(){ if(cursor.x<0) return; const r=rail.getBoundingClientRect(); const pad=40; const near=(cursor.x>=r.left-pad && cursor.x<=r.right+pad && cursor.y>=r.top-pad && cursor.y<=r.bottom+pad); tickerPaused=near; } function step(ts){ proximityPause(); if(tickerPaused){ last=ts; tickerRAF=requestAnimationFrame(step); return; } const dt=(ts-last)/1000; last=ts; rail.scrollTop += TICKER_V_SPEED * dt; const half=Math.floor(ul.scrollHeight/2); if(rail.scrollTop>=half){ rail.scrollTop -= half; } tickerRAF=requestAnimationFrame(step); } tickerRAF=requestAnimationFrame(step); const pauseManual=()=>{ tickerPaused=true; idleResume(); }; rail.addEventListener('wheel', pauseManual, { passive:true }); rail.addEventListener('touchstart', ()=>{ tickerPaused=true; }, { passive:true }); rail.addEventListener('touchend', idleResume, { passive:true }); rail.addEventListener('mouseenter', ()=> tickerPaused=true); rail.addEventListener('mouseleave', ()=> tickerPaused=false); document.addEventListener('mousemove', (e)=>{ cursor.x=e.clientX; cursor.y=e.clientY; }, { passive:true }); }

/* ---------- Editors’ Picks: horizontal text-only infinity (titles are links) ---------- */
let editorsRAF=null, editorsPaused=false;
function buildEditorsBarInfinity(rebuild=false){ const marquee=$('#editorsMarquee'); const ul=$('#editorsList'); if(!ul||!marquee) return; if(rebuild&&editorsRAF){ cancelAnimationFrame(editorsRAF); editorsRAF=null; } $('#editorsListClone')?.remove(); ul.innerHTML=''; const picks=DATA.pubs.filter(p=>p.editorsPick); if(!picks.length){ marquee.style.display='none'; return; } marquee.style.display='block'; picks.forEach(p=>{ const li=document.createElement('li'); li.className='editors-item'; li.innerHTML = `<a class="editors-link" href="${p.url||'#'}">${escapeHtml(p.title)}</a><span class="meta">• ${fmtDate(p.publishDate)} • ${p.id||''}</span>`; ul.appendChild(li); }); const clone=ul.cloneNode(true); clone.id='editorsListClone'; marquee.appendChild(clone); let x=0; const width=()=>ul.scrollWidth; function step(){ if(!marquee.isConnected) return; if(!editorsPaused){ x -= EDITORS_SPEED / 60; const w=width(); if(-x>=w){ x+=w; } ul.style.transform=`translateX(${x}px)`; clone.style.transform=`translateX(${x+w}px)`; } editorsRAF=requestAnimationFrame(step); } marquee.addEventListener('mouseenter', ()=> editorsPaused=true); marquee.addEventListener('mouseleave', ()=> editorsPaused=false); document.addEventListener('visibilitychange', ()=>{ editorsPaused=(document.visibilityState!=='visible'); }); requestAnimationFrame(step); }

/* ---------- Saved views (local only) ---------- */
const SAVED_KEY='snqr_saved_views';
function saveCurrentView(){ const view={ name: prompt('Name this view:') || ('View ' + new Date().toLocaleString()), when: Date.now(), state:{...STATE} }; const saved=getSaved(); saved.unshift(view); setSaved(saved); renderSavedMenu(); }
function renderSavedMenu(){ const menu=$('#savedViewsMenu'); if(!menu) return; menu.innerHTML=''; const container=document.createElement('div'); container.style.padding='.4rem'; const search=document.createElement('input'); search.type='search'; search.placeholder='Search saved…'; search.style.width='100%'; search.style.padding='8px 10px'; search.style.borderRadius='8px'; search.style.border='1px solid var(--snqr-border)'; container.appendChild(search); menu.appendChild(container); const list=document.createElement('div'); list.style.maxHeight='320px'; list.style.overflow='auto'; menu.appendChild(list); function load(){ const q=(search.value||'').toLowerCase(); const saved=getSaved(); list.innerHTML=''; if(!saved.length){ list.innerHTML=`<div style="padding:.6rem;color:#b9b9c8">No saved views yet.</div>`; return; } saved.filter(v=>(v.name||'').toLowerCase().includes(q)).slice(0,50).forEach(v=>{ const b=document.createElement('button'); b.className='btn btn--ghost'; b.style.width='100%'; b.style.marginTop='.4rem'; b.textContent=v.name; b.addEventListener('click', ()=>{ Object.assign(STATE, v.state||{}); reflectHeaderInputs(); pushQS(); if(STATE.pageType==='category') renderCategoryPage(); if(STATE.pageType==='division') renderDivisionPage(); buildEditorsBarInfinity(true); buildTickerContinuous(true); $('#savedViewsMenu').classList.remove('is-open'); updateActiveNav(); }); list.appendChild(b); }); } search.addEventListener('input', load); load(); }
function renderSavedMenuInto(container){ container.innerHTML=''; const wrap=document.createElement('div'); wrap.style.padding='.4rem'; const search=document.createElement('input'); search.type='search'; search.placeholder='Search saved…'; search.style.width='100%'; search.style.padding='8px 10px'; search.style.borderRadius='8px'; search.style.border='1px solid var(--snqr-border)'; wrap.appendChild(search); const list=document.createElement('div'); list.style.maxHeight='320px'; list.style.overflow='auto'; container.appendChild(wrap); container.appendChild(list); function load(){ const saved=getSaved(); const q=(search.value||'').toLowerCase(); list.innerHTML=''; if(!saved.length){ list.innerHTML=`<div style="padding:.6rem;color:#b9b9c8">No saved views yet.</div>`; return; } saved.filter(v=>(v.name||'').toLowerCase().includes(q)).slice(0,50).forEach(v=>{ const b=document.createElement('button'); b.className='btn btn--ghost'; b.style.width='100%'; b.style.marginTop='.4rem'; b.textContent=v.name; b.addEventListener('click', ()=>{ Object.assign(STATE, v.state||{}); reflectHeaderInputs(); pushQS(); if(STATE.pageType==='category') renderCategoryPage(); if(STATE.pageType==='division') renderDivisionPage(); buildEditorsBarInfinity(true); buildTickerContinuous(true); document.querySelector('.drawer')?.classList.remove('is-open'); document.body.style.overflow=''; }); list.appendChild(b); }); } search.addEventListener('input', load); load(); }
function getSaved(){ try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); } catch { return []; } }
function setSaved(list){ localStorage.setItem(SAVED_KEY, JSON.stringify(list)); }
function reflectHeaderInputs(){ $('#q')&&($('#q').value = STATE.q || ''); $('#sortTop')&&($('#sortTop').value = STATE.sort || 'newest'); }

/* ---------- Soft navigation ---------- */
function enableSoftNav(){
  // guard: never intercept on paper page
  if ((document.body.dataset.page||'').toLowerCase()==='paper') return;

  document.addEventListener('click', (e)=>{
    const a=e.target.closest('a'); if(!a) return;
    const href=a.getAttribute('href'); if(!href) return;
    const url=new URL(href, location.href);
    if(url.pathname.endsWith('category.html')){
      e.preventDefault();
      softGoCategory((url.searchParams.get('cat')||'flagship').toLowerCase(), true);
    } else if(url.pathname.endsWith('division.html')){
      e.preventDefault();
      softGoDivision((url.searchParams.get('cat')||'flagship').toLowerCase(), decodeURIComponent(url.searchParams.get('division')||''), true);
    }
  });

  window.addEventListener('popstate', ()=>{
    if(document.body.dataset.page==='core') return;
    const qs=new URLSearchParams(location.search);
    const path=location.pathname;
    if(path.endsWith('category.html')){
      STATE.pageType='category'; document.body.dataset.page='category';
      STATE.cat=slugifyCat((qs.get('cat')||'flagship'));
      STATE.division=qs.get('division')||''; STATE.q=qs.get('q')||'';
      STATE.sort=qs.get('sort')||'newest'; STATE.page=Math.max(1, parseInt(qs.get('page')||'1',10));
      renderCategoryPage(); buildEditorsBarInfinity(true); buildTickerContinuous(true); reflectHeaderInputs(); updateActiveNav();
    }
    if(path.endsWith('division.html')){
      STATE.pageType='division'; document.body.dataset.page='division';
      STATE.cat=slugifyCat((qs.get('cat')||'flagship'));
      STATE.division=decodeURIComponent(qs.get('division')||''); STATE.q=qs.get('q')||'';
      STATE.sort=qs.get('sort')||'newest'; STATE.page=Math.max(1, parseInt(qs.get('page')||'1',10));
      renderDivisionPage(); buildEditorsBarInfinity(true); buildTickerContinuous(true); reflectHeaderInputs(); updateActiveNav();
    }
  });
}
function softGoCategory(cat, reset=false){
  if(document.body.dataset.page==='core' || (document.body.dataset.page||'').toLowerCase()==='paper'){
    window.location.href=`./category.html?cat=${cat}`; return;
  }
  STATE.pageType='category'; document.body.dataset.page='category';
  STATE.cat=slugifyCat(cat); STATE.page=1;
  if(reset){ STATE.q=''; STATE.division=''; STATE.format=''; reflectHeaderInputs(); }
  history.pushState(null,'', `category.html?cat=${encodeURIComponent(STATE.cat)}&page=${STATE.page}`);
  renderCategoryPage(); buildEditorsBarInfinity(true); buildTickerContinuous(true); hideTypeahead(); updateActiveNav();
}
function softGoDivision(cat, division, reset=false){
  if(document.body.dataset.page==='core' || (document.body.dataset.page||'').toLowerCase()==='paper'){
    window.location.href=`./division.html?cat=${cat}&division=${encodeURIComponent(division)}`; return;
  }
  STATE.pageType='division'; document.body.dataset.page='division';
  STATE.cat=slugifyCat(cat); STATE.division=division; STATE.page=1;
  if(reset){ STATE.q=''; STATE.format=''; reflectHeaderInputs(); }
  history.pushState(null,'', `division.html?cat=${encodeURIComponent(STATE.cat)}&division=${encodeURIComponent(STATE.division)}&page=${STATE.page}`);
  renderDivisionPage(); buildEditorsBarInfinity(true); buildTickerContinuous(true); hideTypeahead(); updateActiveNav();
}

/* ---------- Shareable URL ---------- */
function shareLink(){ const url=pushQS(true); navigator.clipboard.writeText(url).then(()=> alert('Link copied to clipboard.')); }
function pushQS(returnUrl=false){
  const params=new URLSearchParams();
  if(STATE.cat) params.set('cat', STATE.cat);
  if(STATE.division) params.set('division', STATE.division);
  if(STATE.q) params.set('q', STATE.q);
  if(STATE.format) params.set('format', STATE.format);
  if(STATE.sort&&STATE.sort!=='newest') params.set('sort', STATE.sort);
  if(STATE.page&&STATE.page!==1) params.set('page', String(STATE.page));
  const s=params.toString(); const url=s?`?${s}`:location.pathname;
  if(returnUrl) return location.origin + location.pathname + (s?`?${s}`:'');
  history.replaceState(null,'', url);
}

/* ---------- UI helpers ---------- */
function showGridSkeleton(n=GRID_SKELETON_COUNT){
  const grid=$('#grid'); if(!grid) return; grid.innerHTML='';
  const frag=document.createDocumentFragment();
  for(let i=0;i<n;i++){
    const sk=document.createElement('article'); sk.className='card glass skeleton';
    sk.innerHTML = `<div class="card__media skeleton__block"></div><div class="card__body"><div class="skeleton__line"></div><div class="skeleton__line skeleton__line--short"></div><div class="card__meta"><span class="skeleton__chip"></span><span class="skeleton__chip"></span></div></div>`;
    frag.appendChild(sk);
  }
  grid.appendChild(frag);
}

/* ---------- Mobile drawer (3 dots) with category → division chips ---------- */
function installMobileDrawer(){
  const right=$('.snqr-topbar .topbar__right'); if(!right) return;
  const searchBtn=document.createElement('button'); searchBtn.className='snqr-mobile-btn'; searchBtn.title='Search'; searchBtn.setAttribute('aria-label','Search'); searchBtn.innerHTML=`<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M16 16l5 5" stroke="currentColor" stroke-width="1.6"/></svg>`; right.insertBefore(searchBtn, right.firstChild);
  const moreBtn=document.createElement('button'); moreBtn.className='snqr-mobile-btn'; moreBtn.title='Menu'; moreBtn.setAttribute('aria-label','Menu'); moreBtn.innerHTML=`<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/></svg>`; right.insertBefore(moreBtn, searchBtn.nextSibling);
  let drawer=document.querySelector('.drawer'); if(!drawer){ drawer=document.createElement('div'); drawer.className='drawer'; drawer.innerHTML=`<div class="drawer__scrim" tabindex="-1"></div><aside class="drawer__panel" role="dialog" aria-modal="true" aria-label="Menu"><h3 class="drawer__title">Browse</h3><div class="drawer__section" id="drawerCats"></div><div class="drawer__section"><div style="font-weight:700;margin-bottom:.25rem">Saved Views</div><div id="drawerSavedMenu" class="menu is-open"></div></div><div class="drawer__section"><a class="btn btn--ghost" href="./category.html?cat=all">Browse all research</a></div></aside>`; document.body.appendChild(drawer); }
  const scrim=drawer.querySelector('.drawer__scrim'); const panel=drawer.querySelector('.drawer__panel'); const savedC=drawer.querySelector('#drawerSavedMenu'); const catsC=drawer.querySelector('#drawerCats');
  function buildCatRows(){ catsC.innerHTML=''; DATA.cats.forEach(c=>{ const row=document.createElement('div'); row.className='drawer__row'; row.innerHTML=`<span>${DISPLAY_CAT[c.slug]||c.name}</span><span>▾</span>`; const chips=document.createElement('div'); chips.className='drawer__chips'; chips.innerHTML = `<a href="./category.html?cat=${c.slug}">All</a> ` + (c.divisions||[]).map(d=>`<a href="./division.html?cat=${c.slug}&division=${encodeURIComponent(d)}">${d}</a>`).join(' '); catsC.appendChild(row); catsC.appendChild(chips); row.addEventListener('click', ()=>{ chips.classList.toggle('is-open'); }); chips.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=>{ closeDrawer(); })); row.querySelector('span').addEventListener('click', (ev)=>{ ev.stopPropagation(); chips.classList.toggle('is-open'); }); row.addEventListener('dblclick', ()=>{ window.location.href=`./category.html?cat=${c.slug}`; closeDrawer(); }); }); }
  function openDrawer(){ drawer.classList.add('is-open'); document.body.style.overflow='hidden'; renderSavedMenuInto(savedC); buildCatRows(); panel.focus?.(); }
  function closeDrawer(){ drawer.classList.remove('is-open'); document.body.style.overflow=''; }
  moreBtn.addEventListener('click', openDrawer); scrim.addEventListener('click', closeDrawer); document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeDrawer(); });
  searchBtn.addEventListener('click', ()=>{ openSearchOverlay(); });
}

/* ---------- Mobile full-screen search overlay ---------- */
const installMobileSearchOverlay = () => {
  if (document.querySelector('.search-ov')) return;

  const wrap = document.createElement('div');
  wrap.className = 'search-ov';
  wrap.innerHTML = `
    <div class="search-ov__scrim"></div>
    <div class="search-ov__panel">
      <div class="search-ov__row">
        <input id="qMobile" type="search" placeholder="Search SNQR research…" />
        <button class="search-ov__close" id="qMobileClose" aria-label="Close">✕</button>
      </div>
      <div id="qMobileList" class="search-ov__list"></div>
    </div>
  `;
  document.body.appendChild(wrap);

  const scrim    = wrap.querySelector('.search-ov__scrim');
  const input    = wrap.querySelector('#qMobile');
  const list     = wrap.querySelector('#qMobileList');
  const btnClose = wrap.querySelector('#qMobileClose');

  const close = () => {
    wrap.classList.remove('is-open');
    document.body.style.overflow = '';
    list.innerHTML = '';
    input.value = '';
  };

  const open = () => {
    wrap.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    input.focus();
  };

  window.openSearchOverlay = open;

  scrim.addEventListener('click', close);
  btnClose.addEventListener('click', close);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = (input.value || '').trim();
      if (!q) return;

      if (document.body.dataset.page === 'core') {
        window.location.href = `./category.html?cat=all&q=${encodeURIComponent(q)}`;
      } else {
        STATE.q   = q;
        STATE.cat = 'all';
        STATE.page = 1;
        pushQS();
        renderGrid();
        renderPager?.();
        buildEditorsBar?.();
        buildTickerContinuous?.(true);
      }
      close();
    }
  });

  input.addEventListener('input', () => {
    const q = (input.value || '').trim();
    list.innerHTML = '';
    if (!q) return;

    const qLower = q.toLowerCase();
    const rows = DATA.pubs
      .filter(p =>
        (p.title || '').toLowerCase().includes(qLower) ||
        (p.deck  || '').toLowerCase().includes(qLower)
      )
      .slice(0, 20);

    rows.forEach((p) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'search-ov__item';
      item.innerHTML = `
        <div class="search-ov__t">${highlight(p.title, q)}</div>
        <div class="search-ov__m">${fmtDate(p.publishDate)} • ${p.id || ''} • <span class="badge">${p.catSlug}</span></div>
      `;
      item.addEventListener('click', () => {
        window.location.href = p.url || '#';
        close();
      });
      list.appendChild(item);
    });
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      open();
    }
  });
};
/* ---------- Suggestion wizard (inline) ---------- */
function installSuggestionWizard(){
  const box = document.getElementById('sugWizard');
  if (!box) return;

  const form  = box.querySelector('#wizForm');
  const name  = box.querySelector('#wizName');
  const email = box.querySelector('#wizEmail');
  const idea  = box.querySelector('#wizIdea');
  const count = box.querySelector('#wizCount');
  const msg   = box.querySelector('#wizMsg');

  const MIN = 100, MAX = 1000;

  const updateCount = () => {
    const n = idea.value.length;
    count.textContent = n;
    const ok = n >= MIN && n <= MAX;
    idea.setCustomValidity(ok ? '' : `Idea must be ${MIN}-${MAX} characters.`);
  };

  idea.addEventListener('input', updateCount);
  updateCount();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    updateCount();
    if (!form.reportValidity()) return;

    msg.textContent = 'Sending…';
    try{
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          name:   (name.value  || '').trim(),
          email:  (email.value || '').trim(),
          message:(idea.value  || '').trim()
        })
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      msg.textContent = 'Thanks — check your email for a copy.';
      form.reset();
      updateCount();
    }catch(err){
      console.error('[SNQR] Suggest failed:', err);
      msg.textContent = 'Could not submit. Please try again.';
    }
  });
}
installSuggestionWizard();

/* ---------- END ---------- */
function wireProfile(){
  if(!roots.profileBtn || !roots.profileMenu) return;
  const btn = roots.profileBtn, menu = roots.profileMenu;
  let openTimer, closeTimer;

  const show = () => {
    clearTimeout(closeTimer);
    if (!menu.hidden) return;
    menu.hidden = false;
    requestAnimationFrame(() => { menu.classList.add('is-open'); });
  };
  const hide = () => {
    clearTimeout(openTimer);
    if (menu.hidden) return;
    menu.classList.remove('is-open');
    setTimeout(() => { menu.hidden = true; }, 180);
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden ? show() : hide();
  });

  btn.addEventListener('mouseenter', () => {
    clearTimeout(closeTimer);
    openTimer = setTimeout(show, 150);
  });
  btn.addEventListener('mouseleave', () => {
    clearTimeout(openTimer);
    closeTimer = setTimeout(() => {
      if (!menu.matches(':hover')) hide();
    }, 250);
  });
  menu.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  menu.addEventListener('mouseleave', () => { closeTimer = setTimeout(hide, 200); });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== btn) hide();
  });
}
/* ---------- Articles reel (continuous, with sub-pixel accumulator) ---------- */
let reelRAF = null, reelPaused = false, reelIdleTimer = null;
function buildArticlesReelContinuous(pub, rebuild=false){
  const rail = S.rail = $('#articlesList');
  if (!rail) return;

  // reset previous loop if rebuilding
  if (rebuild && reelRAF){ cancelAnimationFrame(reelRAF); reelRAF = null; }
  rail.style.scrollBehavior = 'auto';          // ensure no CSS smooth scroll
  rail.innerHTML = '';                          // fresh mount

  // Build one copy of items
  const rows = getArticlesFor(pub.id);
  const reel = document.createElement('div');
  reel.className = 'reel-track';
  reel.id = 'articlesReel';

  if (!rows.length){
    reel.innerHTML = `
      <div class="article-item">
        <div class="article-dot"></div>
        <div>
          <div class="article-title">No articles yet</div>
          <div class="article-meta">This research has no published articles.</div>
        </div>
      </div>`;
  } else {
    rows.forEach(a=>{
      const item = document.createElement('div');
      item.className = 'article-item';
      item.innerHTML = `
        <div class="article-dot"></div>
        <div>
          <h4 class="article-title"><a href="${a.url||'#'}">${escapeHtml(a.title||'')}</a></h4>
          <div class="article-meta">${fmtDate(a.date)} • ${escapeHtml(pub.title||'')}</div>
        </div>`;
      reel.appendChild(item);
    });
  }

  // Duplicate once for seamless wrap
  rail.appendChild(reel);
  rail.appendChild(reel.cloneNode(true));
  S.reel = reel;
  rail.scrollTop = 0;

  // Proximity + manual pause (same semantics as Latest)
  const idleResume = ()=>{ clearTimeout(reelIdleTimer); reelIdleTimer = setTimeout(()=> (reelPaused=false), CONF.idleResumeMs); };
  const proximityPause = ()=>{
    if (S.cursor.x < 0) return;
    const r = rail.getBoundingClientRect(), pad = CONF.proximityPad;
    reelPaused = (S.cursor.x >= r.left-pad && S.cursor.x <= r.right+pad && S.cursor.y >= r.top-pad && S.cursor.y <= r.bottom+pad);
  };

  // --- Smooth, constant motion with sub-pixel carry ---
  let last = performance.now();
  let carry = 0;                          // <<— fractional pixels carried forward
  S.bottomHold = 0;

  function step(ts){
    proximityPause();
    if (reelPaused || S.paused){
      last = ts;
      reelRAF = requestAnimationFrame(step);
      return;
    }

    const dt = (ts - last) / 1000;        // seconds
    last = ts;

    // advance by px/sec, accumulate sub-pixels so we don't lose motion
    let advance = CONF.vSpeed * dt + carry;
    const whole = advance >= 1 ? Math.floor(advance) : 0;
    carry = advance - whole;

    if (whole > 0) {
      rail.scrollTop += whole;
    }

    // Seamless wrap after one copy height
    const half = reel.scrollHeight;       // height of the first copy
    const atBottom = rail.scrollTop >= (half - rail.clientHeight - 1);

    if (atBottom){
      S.bottomHold += dt * 1000;
      if (S.bottomHold >= CONF.bottomWrapHoldMs){
        rail.scrollTop -= half;           // wrap by subtracting first-copy height
        S.bottomHold = 0;
      }
    }

    reelRAF = requestAnimationFrame(step);
  }
  reelRAF = requestAnimationFrame(step);

  // Manual interactions pause + resume
  const pauseManual = ()=>{ reelPaused = true; idleResume(); };
  rail.addEventListener('wheel',      pauseManual, { passive:true });
  rail.addEventListener('touchstart', ()=>{ reelPaused = true; }, { passive:true });
  rail.addEventListener('touchend',   idleResume,   { passive:true });
  rail.addEventListener('mouseenter', ()=>{ reelPaused = true; });
  rail.addEventListener('mouseleave', ()=>{ reelPaused = false; });

  // Track mouse position for proximity pause & tab visibility
  document.addEventListener('mousemove', (e)=>{ S.cursor.x=e.clientX; S.cursor.y=e.clientY; }, { passive:true });
  document.addEventListener('visibilitychange', ()=>{ S.paused = (document.visibilityState !== 'visible'); });
}

/* ===================== SNQR Articles: Continuous Reel + 10s Parent Rotate (v7) ===================== */
(function SNQR_ArticlesReel(){
  const $ = (sel, root=document) => root.querySelector(sel);

  // Reuse your site helpers if present; otherwise light fallbacks
  const fetchFirst = (typeof window.fetchFirst === 'function')
    ? window.fetchFirst
    : async (paths)=>{ for(const p of paths){ try{ const r=await fetch(p,{cache:'no-store'}); if(r.ok) return r.json(); }catch{} } throw new Error('All paths failed'); };

  const DATA = (function(){ if(!window.DATA) window.DATA={}; return window.DATA; })();
  const escapeHtml = (s='') => String(s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[m]));
  const fmtDate = (iso)=>{ if(!iso) return ''; try{ return new Date(iso).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'2-digit'});}catch{ return iso; } };

  /* ---------- Config (overridable via data-* on #articlesBlock) ---------- */
  const CONF = {
    parentRotateMs: 10000,        // flip parent every 10s
    vSpeed: 18,                   // px/sec vertical auto-scroll
    idleResumeMs: 1600,           // resume after user stops interacting
    proximityPad: 40,             // px around rail for proximity pause
    bottomHoldMs: 900             // brief dwell at the very bottom before wrap
  };

  /* ---------- Data ---------- */
  const ARTICLES = { list: [], byPub: new Map() };
  const getArticlesFor = (pubId)=> (ARTICLES.byPub.get(pubId)||[]).slice();

  async function loadPubsIfNeeded(){
    if (Array.isArray(DATA.pubs) && DATA.pubs.length) return;
    try{
      const raw = await fetchFirst(['./data/publications.json','data/publications.json','/research/data/publications.json','/publications.json']);
      DATA.pubs = Array.isArray(raw) ? raw : (raw?.publications || []);
    }catch{}
  }
  async function loadArticles(){
    try{
      const raw = await fetchFirst([
        './data/articles.json','data/articles.json',
        './data/article.json','data/article.json',
        '/research/data/articles.json','/research/data/article.json','/articles.json'
      ]);
      const arr = Array.isArray(raw) ? raw : (raw?.articles || raw?.data || []);
      if (!Array.isArray(arr)) return;
      ARTICLES.list = arr;
      ARTICLES.byPub.clear();
      for (const a of arr){
        const pid = a.publicationId || a.pubId || a.parent || '';
        if (!pid) continue;
        if (!ARTICLES.byPub.has(pid)) ARTICLES.byPub.set(pid, []);
        ARTICLES.byPub.get(pid).push(a);
      }
      // honor publication.articleIds ordering if provided
      (DATA.pubs||[]).forEach(p=>{
        const pile = ARTICLES.byPub.get(p.id) || [];
        if (Array.isArray(p.articleIds) && p.articleIds.length){
          const map = new Map(pile.map(x=>[x.articleId, x]));
          ARTICLES.byPub.set(p.id, p.articleIds.map(id => map.get(id)).filter(Boolean));
        }
      });
    }catch{}
  }

  /* ---------- State ---------- */
  const S = {
    parents: [],
    idx: 0,
    parentTimer: null,

    rail: null,          // #articlesList
    track: null,         // first copy (we append a clone for seamless wrap)
    baseHeight: 0,       // height of one copy
    raf: null, last: 0, carry: 0,
    paused: false, bottomHold: 0,
    cursor: { x:-1, y:-1 },
    idleTimer: null
  };

  /* ---------- Renderers ---------- */
  function renderParent(p){
    const box = $('#articlesParentCard');
    if (!box) return;
    box.innerHTML = `
      <div class="card__media" role="img" aria-label="cover image" style="background-image:url('${p.image||''}')"></div>
      <div class="card__body">
        <h3 class="card__title">${escapeHtml(p.title||'')}</h3>
        <div class="card__meta">
          <span>${fmtDate(p.publishDate)}</span><span>•</span>
          <span>${p.format||'—'}</span><span>•</span>
          <span class="badge">${escapeHtml(p.division||'')}</span><span>•</span>
          <span>${p.id||''}</span>
        </div>
      </div>
      <div class="card__footer">
        <a href="${p.url||'#'}" class="btn btn--outline">Read</a>
      </div>`;
  }

  function buildReelFor(pub){
    const rail = S.rail = $('#articlesList');
    if (!rail) return;
    rail.style.scrollBehavior = 'auto';     // never fight rAF ticks
    rail.innerHTML = '';

    const items = getArticlesFor(pub.id);
    const track = document.createElement('div');
    track.className = 'reel-track';

    if (!items.length){
      track.innerHTML = `
        <div class="article-item">
          <div class="article-dot"></div>
          <div>
            <div class="article-title">No articles yet</div>
            <div class="article-meta">This research has no published articles.</div>
          </div>
        </div>`;
    } else {
      track.innerHTML = items.map(a => `
        <div class="article-item">
          <div class="article-dot"></div>
          <div>
            <h4 class="article-title"><a href="${a.url||'#'}">${escapeHtml(a.title||'')}</a></h4>
            <div class="article-meta">${fmtDate(a.date)} • ${escapeHtml(pub.title||'')}</div>
          </div>
        </div>`).join('');
    }

    // duplicate once for seamless loop
    rail.appendChild(track);
    rail.appendChild(track.cloneNode(true));
    S.track = track;
    rail.scrollTop = 0;

    // measure one copy height once layout is ready
    requestAnimationFrame(()=>{ S.baseHeight = Math.max(1, Math.round(S.track.scrollHeight)); });
    attachReelHandlers(rail);
    startReel();  // (re)start continuous movement
  }

  function rotateTo(idx, manual){
    if (!S.parents.length) return;
    S.idx = (idx % S.parents.length + S.parents.length) % S.parents.length;
    const pub = S.parents[S.idx];
    renderParent(pub);
    buildReelFor(pub);
    if (manual) startParentRotation();   // reset cadence after clicks
  }

  /* ---------- Animations ---------- */
  function startParentRotation(){
    clearInterval(S.parentTimer);
    S.parentTimer = setInterval(()=>{ if(!S.paused) rotateTo(S.idx+1,false); }, CONF.parentRotateMs);
  }

  function startReel(){
    cancelAnimationFrame(S.raf);
    S.last = performance.now();
    S.carry = 0;
    S.bottomHold = 0;

    const step = (ts)=>{
      const dt = (ts - S.last) / 1000;     // seconds
      S.last = ts;

      // pause when user nearby / interacting / tab hidden
      if (S.paused){ S.raf = requestAnimationFrame(step); return; }

      // constant speed with sub-pixel accumulator
      let advance = CONF.vSpeed * dt + S.carry;
      const whole = advance >= 1 ? Math.floor(advance) : 0;
      S.carry = advance - whole;
      if (whole) S.rail.scrollTop += whole;

      // seamless wrap after passing one copy
      const one = S.track.scrollHeight;
      const atBottom = S.rail.scrollTop >= (one - S.rail.clientHeight - 1);
      if (atBottom){
        S.bottomHold += dt*1000;
        if (S.bottomHold >= CONF.bottomHoldMs){
          S.rail.scrollTop -= one;  // wrap by subtracting first-copy height
          S.bottomHold = 0;
        }
      }
      S.raf = requestAnimationFrame(step);
    };
    S.raf = requestAnimationFrame(step);
  }

  function attachReelHandlers(rail){
    const idleResume = ()=>{
      clearTimeout(S.idleTimer);
      S.idleTimer = setTimeout(()=>{ S.paused = false; }, CONF.idleResumeMs);
    };
    const pauseManual = ()=>{ S.paused = true; idleResume(); };
    rail.addEventListener('wheel', pauseManual, { passive:true });
    rail.addEventListener('touchstart', ()=>{ S.paused = true; }, { passive:true });
    rail.addEventListener('touchend', idleResume, { passive:true });
    rail.addEventListener('mouseenter', ()=>{ S.paused = true; });
    rail.addEventListener('mouseleave', ()=>{ S.paused = false; });

    document.addEventListener('mousemove', (e)=>{ S.cursor.x=e.clientX; S.cursor.y=e.clientY; }, { passive:true });
    document.addEventListener('visibilitychange', ()=>{ S.paused = (document.visibilityState!=='visible'); });

    // proximity pause (same semantics as Latest ticker)
    const prox = ()=>{
      if (S.cursor.x < 0) return;
      const r = rail.getBoundingClientRect(), pad = CONF.proximityPad;
      const near = (S.cursor.x>=r.left-pad && S.cursor.x<=r.right+pad && S.cursor.y>=r.top-pad && S.cursor.y<=r.bottom+pad);
      S.paused = near;
    };
    // check proximity once per frame
    (function loopProx(){
      prox(); requestAnimationFrame(loopProx);
    })();
  }

  /* ---------- Init ---------- */
  async function init(){
    const host = $('#articlesBlock');
    if (!host) return;

    // allow per-page overrides via data-*
    if (host.dataset.parentRotateMs) CONF.parentRotateMs = parseInt(host.dataset.parentRotateMs,10) || CONF.parentRotateMs;
    if (host.dataset.articleScrollSpeed) CONF.vSpeed = parseFloat(host.dataset.articleScrollSpeed) || CONF.vSpeed;
    if (host.dataset.articleIdleResumeMs) CONF.idleResumeMs = parseInt(host.dataset.articleIdleResumeMs,10) || CONF.idleResumeMs;

    await loadPubsIfNeeded();
    await loadArticles();

    S.parents = (DATA.pubs||[]).filter(p => p && p.hasArticles && getArticlesFor(p.id).length);
    if (!S.parents.length){ host.style.display='none'; return; }

    $('#articlesPrev')?.addEventListener('click', ()=> rotateTo(S.idx-1, true));
    $('#articlesNext')?.addEventListener('click', ()=> rotateTo(S.idx+1, true));

    rotateTo(0, true);
    startParentRotation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }
})();
