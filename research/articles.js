/* SNQR Articles (directory + rotating block). ES2019, no HTML tags. */
(function(){
  'use strict';

  var PATHS = {
    pubs: [
      './data/publications.json','data/publications.json','../data/publications.json',
      '/research/data/publications.json','/data/publications.json'
    ],
    arts: [
      './data/articles.json','data/articles.json','../data/articles.json',
      '/research/data/articles.json','/data/articles.json'
    ]
  };

  var ART_PAGE_SIZE = 8; // show 6–10 parents per page

  var STATE = {
    pubs: [], pubsById: new Map(),
    arts: [], artsByPub: new Map(),
    rotIdx: 0, rotTimer: null, rotPaused: false,
    parentsCache: [], page: 1, totalPages: 1
  };

  document.addEventListener('DOMContentLoaded', function(){
    // Hydrate ribbons if research.js is present (no-op if absent)
    if (typeof buildMegaPanelsProximity === 'function') buildMegaPanelsProximity();
    if (typeof buildEditorsBarInfinity === 'function') buildEditorsBarInfinity();
    if (typeof buildTickerContinuous === 'function') buildTickerContinuous();
    tryInit();
  });

  async function tryInit(){
    try{
      await loadData();
      renderArticlesDirectory();
      initArticlesBlock();
    }catch(e){
      console.error('[SNQR] Articles init failed', e);
      showInlineError('Could not load articles data. Check data paths and JSON validity.');
    }
  }

  // ---------- data ----------
  async function fetchFirst(paths){
    for (var i=0;i<paths.length;i++){
      var p = paths[i];
      try{
        var res = await fetch(p, { cache: 'no-store' });
        if (res.ok) { console.log('[SNQR] loaded', p); return res.json(); }
      }catch(_e){}
    }
    throw new Error('Fetch failed: ' + paths.join(' | '));
  }

  async function loadData(){
    var pubsJson = await fetchFirst(PATHS.pubs);
    var artsJson = await fetchFirst(PATHS.arts);

    var pubs = Array.isArray(pubsJson && pubsJson.publications) ? pubsJson.publications
             : Array.isArray(pubsJson) ? pubsJson : [];
    var arts = Array.isArray(artsJson && artsJson.articles) ? artsJson.articles
             : Array.isArray(artsJson) ? artsJson : [];

    STATE.pubs = pubs.slice(0);
    STATE.pubsById.clear();
    pubs.forEach(function(p){ STATE.pubsById.set(p.id, p); });

    STATE.arts = arts.slice(0);
    STATE.artsByPub.clear();
    arts.forEach(function(a){
      var pid = a.publicationId;
      if (!pid) return;
      if (!STATE.artsByPub.has(pid)) STATE.artsByPub.set(pid, []);
      STATE.artsByPub.get(pid).push(a);
    });

    // Respect order if publication lists articleIds
    STATE.pubs.forEach(function(p){
      if (Array.isArray(p.articleIds) && p.articleIds.length && STATE.artsByPub.has(p.id)){
        var idx = new Map(STATE.artsByPub.get(p.id).map(function(x){ return [x.articleId, x]; }));
        var ordered = p.articleIds.map(function(id){ return idx.get(id); }).filter(Boolean);
        STATE.artsByPub.set(p.id, ordered);
      }
    });
  }

  // ---------- directory (articles.html) ----------
  function renderArticlesDirectory(){
    if ((document.body.getAttribute('data-page')||'') !== 'articles-home') return;
    var wrap  = document.getElementById('articlesDirectory');
    var pTop  = document.getElementById('articlesPagerTop');
    var pBot  = document.getElementById('articlesPagerBottom') || document.getElementById('articlesPager');
    if (!wrap) return;

    var parents = STATE.pubs
      .filter(function(p){ return p.hasArticles && (getArts(p.id).length>0); })
      .sort(function(a,b){ return new Date(b.publishDate) - new Date(a.publishDate); });

    if (!parents.length){
      wrap.innerHTML = '<div class="glass p-3">No articles yet.</div>';
      if (pTop) pTop.innerHTML = '';
      if (pBot) pBot.innerHTML = '';
      return;
    }

    STATE.parentsCache = parents;
    STATE.totalPages = Math.max(1, Math.ceil(parents.length / ART_PAGE_SIZE));
    STATE.page = getPageFromURL() || 1;
    if (STATE.page > STATE.totalPages) STATE.page = STATE.totalPages;

    var start = (STATE.page - 1) * ART_PAGE_SIZE;
    var view = parents.slice(start, start + ART_PAGE_SIZE);

    wrap.innerHTML = view.map(renderParentGroup).join('');
    var htmlPager = buildPager(STATE.page, STATE.totalPages);
    if (pTop) pTop.innerHTML = htmlPager;
    if (pBot) pBot.innerHTML = htmlPager;
    initGroupAutoScroll();

  }

  function renderParentGroup(p){
    var items = getArts(p.id);
    var list = items.map(function(a){
      return '<li><a class="article-link" href="'+safe(a.url)+'">'+esc(a.title)+'</a><div class="article-meta">'+fmtDate(a.date)+'</div></li>';
    }).join('');

    return ''+
      '<section class="group glass">'+
        '<div class="group__head">'+
          '<a class="group__title" href="'+safe(p.url)+'">'+esc(p.title)+'</a>'+
          '<span class="group__meta">'+items.length+' article'+(items.length>1?'s':'')+'</span>'+
        '</div>'+
        '<ul class="group__list">'+list+'</ul>'+
      '</section>';
  }

  function buildPager(page, total){
    var qp = new URLSearchParams(location.search);
    function link(n){ qp.set('page', n); return '?'+qp.toString(); }

    var span = 3, from = Math.max(1, page-span), to = Math.min(total, from+6);
    var nums = '';
    for (var i=from;i<=to;i++){
      nums += (i===page)
        ? '<li class="page-item active"><span class="page-link">'+i+'</span></li>'
        : '<li class="page-item"><a class="page-link" href="'+link(i)+'">'+i+'</a></li>';
    }
    var prev = (page>1) ? '<a class="page-link" href="'+link(page-1)+'">Previous</a>' : '<span class="page-link">Previous</span>';
    var next = (page<total) ? '<a class="page-link" href="'+link(page+1)+'">Next</a>' : '<span class="page-link">Next</span>';

    return '<ul class="pagination justify-content-center">'+
              '<li class="page-item '+(page===1?'disabled':'')+'">'+prev+'</li>'+
              nums+
              '<li class="page-item '+(page===total?'disabled':'')+'">'+next+'</li>'+
           '</ul>';
  }

  // ---------- rotating block (index/category/division) ----------
  function initArticlesBlock(){
    var host = document.getElementById('articlesBlock');
    if (!host) return;

    var parents = STATE.pubs.filter(function(p){ return p.hasArticles && (getArts(p.id).length>0); });
    if (!parents.length){ host.style.display='none'; return; }

    var prev = document.getElementById('articlesPrev');
    var next = document.getElementById('articlesNext');
    if (prev) prev.addEventListener('click', function(){ rotate(host, -1, true); });
    if (next) next.addEventListener('click', function(){ rotate(host, +1, true); });

    host.addEventListener('mouseenter', function(){ STATE.rotPaused = true; });
    host.addEventListener('mouseleave', function(){ STATE.rotPaused = false; });
    document.addEventListener('visibilitychange', function(){ STATE.rotPaused = (document.visibilityState !== 'visible'); });

    host._parents = parents;
    STATE.rotIdx = 0;
    renderRotation(host, parents[0]);

    var every = Math.max(1000, parseInt(host.getAttribute('data-rotate')||'5000',10));
    clearInterval(STATE.rotTimer);
    STATE.rotTimer = setInterval(function(){ if(!STATE.rotPaused) rotate(host, +1, false); }, every);
  }

  function rotate(host, step, manual){
    var N = host._parents.length;
    STATE.rotIdx = (STATE.rotIdx + step + N) % N;
    renderRotation(host, host._parents[STATE.rotIdx]);
    if (manual){
      clearInterval(STATE.rotTimer);
      var every = Math.max(1000, parseInt(host.getAttribute('data-rotate')||'5000',10));
      STATE.rotTimer = setInterval(function(){ if(!STATE.rotPaused) rotate(host, +1, false); }, every);
    }
  }

  function renderRotation(host, pub){ renderParent(pub); renderList(pub); }

  function renderParent(p){
    var box = document.getElementById('articlesParentCard'); if (!box) return;
    box.innerHTML =
      '<div class="card__media" role="img" aria-label="cover image" style="background-image:url(\''+safe(p.image)+'\')"></div>'+
      '<div class="card__body">'+
        '<h3 class="card__title">'+esc(p.title||'')+'</h3>'+
        '<div class="card__meta">'+
          '<span>'+fmtDate(p.publishDate)+'</span><span>•</span>'+
          '<span>'+esc(p.format||'—')+'</span><span>•</span>'+
          '<span class="badge">'+esc(p.division||'')+'</span><span>•</span>'+
          '<span>'+esc(p.id||'')+'</span>'+
        '</div>'+
      '</div>'+
      '<div class="card__footer"><a href="'+safe(p.url)+'" class="btn btn--outline">Read</a></div>';
  }

  function renderList(p){
    var el = document.getElementById('articlesList'); if (!el) return;
    var rows = getArts(p.id);
    if (!rows.length){
      el.innerHTML = '<div class="article-item"><div class="article-dot"></div><div><div class="article-title">No articles yet</div><div class="article-meta">This research has no published articles.</div></div></div>';
      return;
    }
    el.innerHTML = rows.map(function(a){
      return '<div class="article-item">'+
               '<div class="article-dot"></div>'+
               '<div>'+
                 '<a class="article-title" href="'+safe(a.url)+'">'+esc(a.title)+'</a>'+
                 '<div class="article-meta">'+fmtDate(a.date)+' • '+esc(p.title)+'</div>'+
               '</div>'+
             '</div>';
    }).join('');
  }

  // ---------- helpers ----------
  function getArts(pubId){ return STATE.artsByPub.get(pubId) || []; }
  function esc(s){ return String(s||'').replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function safe(s){ return s ? String(s) : '#'; }
  function fmtDate(s){
    if (!s) return '';
    var d = new Date(s);
    if (isNaN(+d)) return esc(s);
    return d.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'2-digit' });
  }
  function getPageFromURL(){
    var n = parseInt(new URLSearchParams(location.search).get('page'), 10);
    return (isFinite(n) && n>0) ? n : 1;
  }
  function showInlineError(msg){
    var wrap = document.getElementById('articlesDirectory');
    if (wrap) wrap.innerHTML = '<div class="glass p-3">'+esc(msg)+'</div>';
  }

  
  /* ===== Auto-scroll for each parent group's list (Articles home) ===== */
function initGroupAutoScroll(){
  if ((document.body.getAttribute('data-page')||'') !== 'articles-home') return;

  var lists = document.querySelectorAll('.group__list');
  lists.forEach(function(el){
    // If content fits, skip
    if (el.scrollHeight <= el.clientHeight + 1) return;

    var paused = false, pos = 0, speed = 1; // px per tick
    var timer;

    el.addEventListener('mouseenter', function(){ paused = true; });
    el.addEventListener('mouseleave', function(){ paused = false; });

    function tick(){
      if (!paused){
        pos = el.scrollTop + speed;
        if (pos + el.clientHeight + 2 >= el.scrollHeight){
          // small delay at bottom, then reset
          setTimeout(function(){ el.scrollTop = 0; pos = 0; }, 800);
        }else{
          el.scrollTop = pos;
        }
      }
    }
    timer = setInterval(tick, 60); // ~16–20fps feel, low CPU
  });
}

})();
