/* Article Page Logic (v3)
   - Editors’ Picks ticker
   - Category display map (Standard SNQR Research / SNQR Signature / SNQR Quant & Quantum Lab)
   - Right-rail: title-only link + date (smaller)
   - Clean injected HTML (remove outer html/head/body; trim top gaps)
*/

const NOW_YEAR = new Date().getFullYear();
document.getElementById('yearNow').textContent = NOW_YEAR;

const qs = new URLSearchParams(location.search);
const paramPub = qs.get('pub') || '';
const paramArticle = qs.get('article') || '';

const CATEGORY_DISPLAY = {
  flagship: 'Standard SNQR Research',
  signature: 'SNQR Signature',
  lab: 'SNQR Quant & Quantum Lab'
};

const PATHS = {
  publications: [
    './publications.json','../data/publications.json','/research/data/publications.json','/publications.json'
  ],
  articles: [
    './articles.json','../data/articles.json','/research/data/articles.json','/articles.json'
  ],
  categories: [
    './categories.json','../data/categories.json','/research/data/categories.json','/categories.json'
  ]
};

async function fetchFirst(paths){
  for (const p of paths) {
    try { const r = await fetch(p, { cache:'no-store' }); if (r.ok) return r.json(); } catch {}
  }
  throw new Error('All data paths failed: ' + paths.join(', '));
}

const arr = (x, key) => Array.isArray(x) ? x : (x && Array.isArray(x[key]) ? x[key] : []);
const kebab = s => String(s||'').toLowerCase().replace(/[^\w\s-]/g,'').trim().replace(/\s+/g,'-');
const fmtDate = iso => { if(!iso) return ''; try{ return new Date(iso).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'2-digit'});}catch{ return iso; } };
const el = (t,c,h) => { const n=document.createElement(t); if(c) n.className=c; if(h!==undefined) n.innerHTML=h; return n; };
const text = (n,s) => { if(n && s!==undefined) n.textContent=s; };
const setTitle = t => { if(t) document.title = `${t} — SNQR Research`; };

function setMeta(name, content){
  if(!content) return;
  let m=document.querySelector(`meta[name="${name}"]`);
  if(!m){ m=el('meta'); m.setAttribute('name',name); document.head.appendChild(m); }
  m.setAttribute('content',content);
}
function setOG(prop, content){
  if(!content) return;
  let m=document.querySelector(`meta[property="${prop}"]`);
  if(!m){ m=el('meta'); m.setAttribute('property',prop); document.head.appendChild(m); }
  m.setAttribute('content',content);
}
const setCanonical = url => { const l=document.getElementById('canonicalLink'); if(l) l.href=url; };
const injectLdJson = obj => { const s=document.getElementById('ldJson'); if(s) s.textContent=JSON.stringify(obj,null,2); };

function displayCategory(cat){
  if (!cat) return '';
  const key = String(cat).toLowerCase();
  return CATEGORY_DISPLAY[key] || cat;
}

function prettyUrl(pub, art){
  const cat = pub.cat || pub.categorySlug || pub.category || 'research';
  const div = kebab(pub.division || pub.divisionName || '');
  const pslug = pub.slug || kebab(pub.title || pub.id || '');
  const aslug = art.slug || kebab(art.title || art.articleId || '');
  return `/research/${cat}/${div}/${pslug}/articles/${aslug}`;
}

function errorUI(err){
  const content=document.getElementById('contentCol');
  content.innerHTML = `
    <div class="alert alert-warning">
      <h2 class="h5 mb-2">Article not available</h2>
      <p class="mb-3">We couldn’t load this article. It may have been moved or the link is incorrect.</p>
      <a class="btn btn-primary btn-sm" href="/research/index.html">Back to Research Library</a>
    </div>`;
  document.getElementById('railCol').innerHTML='';
  console.error(err);
}

/* Remove <html>/<head>/<body> and trim leading gaps from injected HTML */
function cleanHtml(text){
  let t = text;
  const head = /<head[\s\S]*?<\/head>/i;
  const htmlOpen = /<!DOCTYPE[\s\S]*?>|<html[^>]*>/ig;
  const htmlClose = /<\/html>/ig;
  const bodyMatch = t.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) t = bodyMatch[1];
  t = t.replace(head,'').replace(htmlOpen,'').replace(htmlClose,'');
  return t.trim();
}

/* Editors’ Picks ticker — auto speed + pause on hover handled by CSS */
function buildTicker(pubs){
  const picks = pubs.filter(p => String(p.editorsPick).toLowerCase() === 'true' || p.editorsPick === true);
  if (!picks.length) return;

  const tickerEl = document.getElementById('editorsTicker');
  const track = document.getElementById('tickerTrack');
  const viewport = tickerEl?.querySelector('.ticker-viewport');
  if (!tickerEl || !track || !viewport) return;

  // Build once
  const frag = document.createDocumentFragment();
  picks.forEach(p => {
    const a = document.createElement('a');
    a.textContent = p.title;
    a.href = p.url || `/research/paper.html?pub=${encodeURIComponent(p.id)}`;
    const span = document.createElement('span');
    span.className = 'me-4';
    span.appendChild(a);
    frag.appendChild(span);
  });
  // duplicate for seamless loop
  track.appendChild(frag.cloneNode(true));
  track.appendChild(frag);

  // Reveal and offset header
  tickerEl.classList.remove('d-none');
  document.body.style.setProperty('--ticker-h','36px');

  // ---- Auto duration: keep ~40–60 px/sec depending on screen ----
  // Distance of the animation is 50% of the track’s total width (we animate -50%).
  const calcDuration = () => {
    // Force layout to get actual width
    const totalW = track.scrollWidth;
    const distancePx = totalW / 2; // because translateX(-50%)
    // Target speed (px per second): slower on desktop, a bit faster on mobile
const isMobile = window.matchMedia('(max-width: 576px)').matches;
const speedPx = isMobile ? 20 : 25;   // much slower
const seconds = Math.max(120, Math.min(480, distancePx / speedPx));  // slower min/max

    track.style.animationDuration = `${seconds.toFixed(0)}s`;
  };

  // Initial compute + recompute on resize (debounced)
  calcDuration();
  let rAF;
  const onResize = () => {
    cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(calcDuration);
  };
  window.addEventListener('resize', onResize, { passive: true });
}


(async function load(){
  try{
    const [pubsRaw, artsRaw, catsRaw] = await Promise.all([
      fetchFirst(PATHS.publications),
      fetchFirst(PATHS.articles),
      fetchFirst(PATHS.categories).catch(()=>({}))
    ]);
    const pubs = arr(pubsRaw,'publications');
    const arts = arr(artsRaw,'articles');
    const cats = arr(catsRaw,'categories');

    // Ticker
    buildTicker(pubs);

    // Resolve article
    let art = null;
    if (paramArticle) {
      art = arts.find(a => a.articleId === paramArticle && (!paramPub || a.publicationId === paramPub));
    }
    if (!art) {
      const path = location.pathname;
      art = arts.find(a => a.publicationId === paramPub && a.slug && path.includes(a.slug));
    }
    if (!art && arts.length === 1) art = arts[0];
    if (!art) throw new Error('Article not found in articles.json');

    // Resolve publication (or stub so page renders)
    let pub = pubs.find(p => p.id === (paramPub || art.publicationId));
    if (!pub) pub = pubs.find(p => p.slug && location.pathname.includes(p.slug));
    if (!pub) {
      pub = { id: art.publicationId, title:'Research', cat:'flagship', division:'', publishDate:art.date, image:art.image };
    }

    // Breadcrumbs
    const bc=document.getElementById('breadcrumbTrail');
    if (bc) {
      const catKey = pub.cat || pub.category || pub.categorySlug || 'flagship';
      const catDisp = displayCategory(pub.categoryName || catKey);
      const liCat=el('li','breadcrumb-item'); const aCat=el('a',null,catDisp);
      aCat.href=`/research/category.html?cat=${encodeURIComponent(catKey)}`; liCat.append(aCat);

      const liDiv=el('li','breadcrumb-item'); const aDiv=el('a',null,(pub.divisionName||pub.division||'Division'));
      aDiv.href=`/research/division.html?div=${encodeURIComponent(pub.division||'')}`; liDiv.append(aDiv);

      const liPub=el('li','breadcrumb-item'); const aPub=el('a',null,(pub.title||'Research'));
      aPub.href=`/research/paper.html?pub=${encodeURIComponent(pub.id)}`; liPub.append(aPub);

      const liArt=el('li','breadcrumb-item active'); liArt.textContent='Article';
      bc.append(liCat, liDiv, liPub, liArt);
    }

    // Hero
    const kicker = `${displayCategory(pub.categoryName||pub.cat||pub.category||'')} — ${(pub.divisionName||pub.division||'')}`.replace(/^ — $/,'');
    text(document.getElementById('articleKicker'), kicker);
    text(document.getElementById('articleTitle'), art.title || 'Untitled Article');
    text(document.getElementById('articleDeck'), art.deck || '');

    const metaWrap=document.getElementById('articleMeta'); metaWrap.innerHTML='';
    const pieces = [
      fmtDate(art.date), '•', 'Article', '•',
      `Part of ${pub.title||'Research'}`,
      (pub.division||pub.cat||pub.category) ? '•' : '',
      (pub.division && (pub.cat||pub.category)) ? `(${pub.division} / ${displayCategory(pub.cat||pub.category)})` : ''
    ];
    pieces.filter(Boolean).forEach(txt => metaWrap.appendChild(el('span', txt==='•'?'dot':'', txt==='•'?'':txt)));

    // Parent research card
    const parentCover=document.getElementById('parentCover');
    if (pub.image) { parentCover.src=pub.image; parentCover.alt=pub.title||''; parentCover.classList.remove('d-none'); }
    text(document.getElementById('parentCategoryBadge'), displayCategory(pub.categoryName||pub.cat||pub.category||''));
    text(document.getElementById('parentDivisionBadge'), pub.divisionName||pub.division||'');
    text(document.getElementById('parentTitle'), pub.title||'');
    text(document.getElementById('parentMeta'), fmtDate(pub.publishDate||pub.date||art.date||''));
    document.getElementById('parentLink').href = `/research/paper.html?pub=${encodeURIComponent(pub.id)}`;

    // Sibling list: title link ONLY + date below, compact
    const allSibs = arts.filter(a => a.publicationId === pub.id);
    const ordered = Array.isArray(pub.articleIds) && pub.articleIds.length
      ? pub.articleIds.map(id => allSibs.find(x => x && x.articleId === id)).filter(Boolean)
      : allSibs;

    const ul=document.getElementById('siblingArticlesList'); ul.innerHTML='';
    ordered.forEach(sib => {
      const li = el('li','list-group-item');
      if (sib.articleId === art.articleId) li.classList.add('active');

      const icon = el('i','fa-regular fa-file-lines file-ic');
      const wrap = el('div','flex-grow-1');
      const a = el('a','title-link'); a.href = sib.url || `/research/article.html?pub=${encodeURIComponent(pub.id)}&article=${encodeURIComponent(sib.articleId)}`;
      a.textContent = sib.title;
      const meta = el('div','meta', fmtDate(sib.date));

      wrap.append(a, meta);
      li.append(icon, wrap);
      ul.appendChild(li);
    });

    // Article body (cleaned for mobile spacing)
    if (!art.htmlPath) throw new Error('htmlPath missing on article');
    const resp = await fetch(art.htmlPath, { cache:'no-store' });
    if (!resp.ok) throw new Error('Failed to load article htmlPath: ' + art.htmlPath);
    const raw = await resp.text();
    document.getElementById('articleContent').innerHTML = cleanHtml(raw);

    // SEO
    const pretty = prettyUrl(pub, art);
    setCanonical(pretty);
    setTitle(art.title || pub.title);
    setMeta('description', (art.deck||'').substring(0,155));
    setOG('og:title', art.title||'');
    setOG('og:description', art.deck||'');
    setOG('og:image', art.ogImage || art.image || pub.image || '');
    setOG('og:url', pretty);
    injectLdJson({
      "@context":"https://schema.org","@type":"Article",
      "headline":art.title||'',"description":art.deck||'',
      "image":art.ogImage||art.image||pub.image||'',
      "datePublished":art.date||pub.publishDate||'',
      "dateModified":art.updated||art.date||'',
      "author":[{"@type":"Person","name":art.author||"SNQR Research"}],
      "mainEntityOfPage":{"@type":"WebPage","@id":pretty},
      "isPartOf":{"@type":"CreativeWorkSeries","name":pub.title||'',"url":`/research/paper.html?pub=${encodeURIComponent(pub.id)}`}
    });

    // Share/Save
    document.getElementById('shareBtn')?.addEventListener('click', async ()=>{
      try{ await navigator.share?.({ title: art.title, url: location.href }); }catch{ await navigator.clipboard.writeText(location.href); }
    });
    document.getElementById('saveBtn')?.addEventListener('click', ()=>{
      try{
        const key='snqr_saved_articles'; const saved=JSON.parse(localStorage.getItem(key)||'[]');
        const cur={ publicationId: pub.id, articleId: art.articleId, url: location.href, title: art.title };
        if (!saved.some(s=>s.articleId===cur.articleId && s.publicationId===cur.publicationId)){
          saved.push(cur); localStorage.setItem(key, JSON.stringify(saved));
        }
      }catch{}
    });

  } catch(err){ errorUI(err); }
})();
