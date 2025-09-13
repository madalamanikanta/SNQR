/* SNQR Research — Fixed Headers + Inline Summary + Sticky Left; Reader & Audio unchanged */

(function () {
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const esc = s => (s || "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
  const fmtDate = d => { const t=new Date(d||""); return Number.isNaN(+t)?"":t.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"2-digit"}); };
  const abs = p => (p?.startsWith("http") ? p : p?.startsWith("/") ? p : "/" + p);
  const DPR = Math.max(1, Math.min(4, window.devicePixelRatio || 1));
  const QUALITY = 1.8; // oversample for crispness
  const isMobile = () => window.innerWidth < 900;

  /* ---------- Paths & data ---------- */
  const RROOT = (() => {
    const i = location.pathname.indexOf("/research/");
    return i >= 0 ? location.pathname.slice(0, i + 10) : "/research/";
  })();
  const DATA_CANDIDATES = [
    RROOT + "data/publications.json",
    "./data/publications.json",
    "../data/publications.json",
    "/assets/research/publications.json",
    
  ];
  const ARTICLES_CANDIDATES = [
  RROOT + "data/articles.json",
  "./data/articles.json",
  "../data/articles.json",
  "/research/data/articles.json",
  "/data/articles.json"
];

  async function fetchFirst(paths){ for(const p of paths){ try{ const r=await fetch(p,{cache:"no-store"}); if(r.ok) return await r.json(); }catch{} } throw new Error("publications.json not found"); }
  async function exists(url){ try{ const r=await fetch(url,{method:"HEAD"}); return r.ok; }catch{ return false; } }
  function hydratePaths(pub){
    const id = String(pub.id || "").trim();
    const base = `/assets/research/${id}/`;
    pub.image   = pub.image   || `/assets/cover/${id}.png`;
    pub.reader  = pub.reader  || { type: "pdf", src: `${base}pdf/index.pdf` };
    pub.audio   = pub.audio   || { src: `${base}audio/index.mp3` };
    pub.summary = pub.summary || { pdf: `${base}summary/index.pdf`, pptx: `${base}summary/index.pptx` };
    return pub;
  }

  /* ---------- Global: freeze headers & progress bar ---------- */
  function freezeHeaders(){
    // candidates for the top scrolling titles bar and the main site header
    const scrollHeader = document.querySelector('#scrollHeader, .scroll-header, [data-role="scroll-header"]');
    const siteHeader   = document.querySelector('#siteHeader, .site-header, header.site-header') || document.querySelector('header');

    // create a slim progress bar above everything
    let bar = document.getElementById('pageProgress');
    if (!bar){
      bar = document.createElement('div');
      bar.id = 'pageProgress';
      bar.className = 'page-progress';
      document.body.appendChild(bar);
    }

    function apply(){
      const pbH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--progress-h')) || 3;

      let y = pbH; // top offset starts with progress bar height

      if (scrollHeader){
        scrollHeader.classList.add('scroll-header-fixed');
        scrollHeader.style.top = `${y}px`;
        y += scrollHeader.offsetHeight || 0;
      }
      if (siteHeader){
        siteHeader.classList.add('site-header-fixed');
        siteHeader.style.top = `${y}px`;
        y += siteHeader.offsetHeight || 0;
      }

      // push document content to avoid overlap
      document.body.style.paddingTop = `${y}px`;
      // update sticky top for left column
      document.documentElement.style.setProperty('--sticky-top', `${y + 16}px`);
    }

    function progress(){
      const doc = document.documentElement;
      const scrolled = (doc.scrollTop || document.body.scrollTop);
      const max = (doc.scrollHeight - doc.clientHeight) || 1;
      const pct = Math.min(100, Math.max(0, (scrolled / max) * 100));
      bar.style.width = `${pct}%`;
    }

    // initial
    apply(); progress();
    // on resize / orientation
    window.addEventListener('resize', debounce(apply, 120));
    window.addEventListener('orientationchange', debounce(apply, 120));
    // on scroll
    document.addEventListener('scroll', progress, { passive:true });
  }

  /* ---------- LEFT: hero ---------- */
  function renderHero(pub){
    document.title = `${pub.title || "Research"} — SNQR`;
    $("#paperTitle").textContent = pub.title || "";
    $("#paperDeck").textContent  = pub.deck  || "";
    $("#paperImage").style.backgroundImage = pub.image ? `url("${pub.image}")` : "";
    const cat = (pub.cat || pub.catSlug || "").toLowerCase();
    $("#paperKicker").textContent = cat==="signature" ? "SNQR Signature" : cat==="lab" ? "SNQR Quant & Quantum Lab" : "Standard SNQR Research";

    $("#paperMeta").innerHTML = [
      pub.division ? `<span class="badge">${esc(pub.division)}</span>` : "",
      pub.publishDate ? `<span>${fmtDate(pub.publishDate)}</span>` : "",
      pub.id ? `<span>•</span><span>${esc(pub.id)}</span>` : "",
      pub.format ? `<span>•</span><span>${esc(pub.format)}</span>` : ""
    ].filter(Boolean).join(" ");

    const details = $("#paperDetails");
    const kw  = Array.isArray(pub.keywords) ? pub.keywords.join(", ") : (pub.keywords || "");
    const jel = Array.isArray(pub.jelCodes) ? pub.jelCodes.join(", ") : (pub.jel || "");
    const parts=[];
    if (kw) parts.push(`<span class="pill"><span class="label">Keywords:</span><span>${esc(kw)}</span></span>`);
    if (jel) parts.push(`<span class="pill"><span class="label">JEL:</span><span>${esc(jel)}</span></span>`);
    if (pub.pages) parts.push(`<span class="pill"><span class="label">Pages:</span><span>${esc(String(pub.pages))}</span></span>`);
    if (pub.copyright) parts.push(`<span class="pill"><span class="label">©</span><span>${esc(pub.copyright)}</span></span>`);
    details.innerHTML = parts.join(" ");

    $("#btnShare").onclick = ()=> navigator.clipboard?.writeText(location.origin + (pub.url || location.pathname)).then(()=> alert("Link copied"));

    const fav = new Set(JSON.parse(localStorage.getItem("snqr_guest_favs")||"[]"));
    const heart=$("#btnHeart"), active=fav.has(pub.id);
    heart.classList.toggle("is-active", active); heart.setAttribute("aria-pressed", active?"true":"false");
    heart.onclick = ()=>{ const on=!fav.has(pub.id); if(on) fav.add(pub.id); else fav.delete(pub.id);
      localStorage.setItem("snqr_guest_favs", JSON.stringify([...fav]));
      heart.classList.toggle("is-active", on); heart.setAttribute("aria-pressed", on?"true":"false"); };
  }

  /* ---------- KT ---------- */
  function renderKT(pub){
    const list=$("#ktList"); list.innerHTML="";
    (pub.keyTakeaways?.length ? pub.keyTakeaways : [
      "Add 3–5 crisp, decision-relevant bullets.",
      "Keep to ~1–2 lines; plain language.",
      "Link deeper claims to Reader."
    ]).forEach(t=>{ const li=document.createElement("li"); li.textContent=t; list.appendChild(li); });
  }

  /* ---------- SUMMARY (INLINE for all screens) ---------- */
  const _sum = { url:null, width:0 };
  async function renderSummarySection(pub){
    const stack = $("#slidesStack");
    const hasPdf  = await exists(abs(pub.summary?.pdf || ""));
    const hasPptx = !hasPdf && (await exists(abs(pub.summary?.pptx || "")));

    // Hide any "Open Summary" button if present
    $("#summaryCTA")?.style && ($("#summaryCTA").style.display="none");

    if (!hasPdf && !hasPptx){ stack.closest(".summary").style.display="none"; return; }

    if (hasPdf){
      const url = abs(pub.summary.pdf);
      await renderInlinePDF(url, stack);
      let lastW = stack.clientWidth;
      window.addEventListener("resize", debounce(async ()=>{
        const w = stack.clientWidth;
        if (Math.abs(w - lastW) > 6){ lastW = w; await renderInlinePDF(url, stack); }
      }, 140));
    } else if (hasPptx && window.PPTXjs){
      stack.innerHTML = '<div id="pptxjs-inline"></div>';
      const viewer = new window.PPTXjs(); await viewer.load(abs(pub.summary.pptx), { slidesScale:"100%" }); await viewer.render($("#pptxjs-inline"));
      $$("#pptxjs-inline .slide").forEach(s=>{ s.classList.add("slide-img"); s.style.width="100%"; s.style.height="auto"; });
    }

    // After Summary mounts, set up sticky release (large screens)
    setupStickyRelease();
  }

  async function renderInlinePDF(url, stack){
    const cssW = Math.floor(stack.clientWidth || 1200);
    if (_sum.url === url && Math.abs(_sum.width - cssW) < 6) return;

    stack.innerHTML = "";
    const pdf = await pdfjsLib.getDocument(url).promise;
    _sum.url = url; _sum.width = cssW;

    for (let i=1; i<=pdf.numPages; i++){
      const page = await pdf.getPage(i);
      const v1 = page.getViewport({ scale: 1 });

      const fit = cssW / v1.width;                     // CSS scale to fit right column width
      const pxScale = Math.min(6, DPR * QUALITY) * fit; // oversample for crisp text
      const vp = page.getViewport({ scale: pxScale });

      const c = document.createElement("canvas");
      c.className = "slide-canvas";
      c.width  = Math.floor(vp.width);
      c.height = Math.floor(vp.height);
      c.style.width  = (v1.width * fit)  + "px";
      c.style.height = (v1.height * fit) + "px";
      c.style.maxWidth = "100%";

      await page.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
      stack.appendChild(c);
    }
  }

  /* ---------- Sticky-left release at Division row (desktop) ---------- */
  function setupStickyRelease(){
    if (window.innerWidth < 1181) return;
    const left = $(".legacy-left");
    if (!left) return;
    const stop = $("#divisionRow") || $("#divisionScroller") || $(".division-row") || document.body;

    function tick(){
      const rLeft = left.getBoundingClientRect();
      const rStop = stop.getBoundingClientRect();
      const shouldUnstick = rStop.top <= (rLeft.bottom + 24);
      left.classList.toggle("unstick", shouldUnstick);
    }
    tick();
    document.addEventListener("scroll", tick, { passive:true });
    window.addEventListener("resize", debounce(tick, 120));
  }

  /* ---------- Reader (unchanged) ---------- */
  let pageFlip = null;
  async function openReader(pub){
    const reader = pub.reader && pub.reader.src ? pub.reader : null; if (!reader) return;
    const wrap=$("#readerCanvas"); wrap.classList.add("is-open"); wrap.setAttribute("aria-hidden","false");
    const panel=$(".reader-panel"); if(panel?.requestFullscreen){ try{ await panel.requestFullscreen(); }catch{} }
    $("#canvasShare").onclick = ()=> navigator.clipboard?.writeText(location.href).then(()=> alert("Link copied"));
    $("#flipContainer").addEventListener("contextmenu", e=> e.preventDefault());
    const loading=$("#flipLoading"); loading.style.display="grid";
    try{
      const pdf = await pdfjsLib.getDocument(abs(reader.src)).promise;
      await initPageFlip(pdf);
    } finally { loading.style.display="none"; }
    $("#canvasPrev").onclick = ()=> pageFlip?.flipPrev();
    $("#canvasNext").onclick = ()=> pageFlip?.flipNext();
    $("#canvasClose").onclick = closeReader;

    let lastMode = flipMode();
    window.addEventListener("resize", debounce(async ()=>{
      const mode = flipMode();
      if (mode !== lastMode && $('#readerCanvas').classList.contains('is-open')) {
        const pdf = $("#readerCanvas")._pdf;
        if (pdf){ await initPageFlip(pdf); lastMode = mode; }
      }
    }, 160));
  }
  function flipMode(){ return isMobile() ? "single" : "dual"; }
  async function initPageFlip(pdf){
    const host=$("#flipContainer"); host.innerHTML="";
    $("#readerCanvas")._pdf = pdf;
    const viewW = window.innerWidth, viewH = window.innerHeight - 44, mode = flipMode();
    const pages=[];
    for(let i=1;i<=pdf.numPages;i++){
      const page = await pdf.getPage(i);
      const v1 = page.getViewport({ scale: 1 });
      const fitCSS = Math.min(viewW / v1.width, viewH / v1.height);
      const cssW = v1.width * fitCSS, cssH = v1.height * fitCSS;
      const scalePx = Math.min(6, DPR * QUALITY) * fitCSS;
      const vp = page.getViewport({ scale: scalePx });
      const c = document.createElement("canvas");
      c.width = Math.floor(vp.width); c.height = Math.floor(vp.height);
      c.style.width  = cssW + "px"; c.style.height = cssH + "px";
      await page.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
      const div=document.createElement("div"); div.className="page"; div.style.width=cssW+"px"; div.style.height=cssH+"px"; div.appendChild(c);
      host.appendChild(div); pages.push(div);
    }
    const width  = pages[0].offsetWidth, height = pages[0].offsetHeight;
    pageFlip = new St.PageFlip(host, { width, height, size:'fixed', showCover:(mode==='dual'), usePortrait:(mode==='single'), maxShadowOpacity:.35, mobileScrollSupport:true });
    pageFlip.loadFromHTML(pages);
    const snd=$("#flipSnd"); snd.volume=1.0; pageFlip.on("flip", ()=>{ try{ snd.currentTime=0; snd.play(); }catch{} });
  }
  function closeReader(){
    $("#readerCanvas").classList.remove("is-open"); $("#readerCanvas").setAttribute("aria-hidden","true");
    if(document.fullscreenElement && document.exitFullscreen){ try{ document.exitFullscreen(); }catch{} }
    pageFlip = null;
  }

  /* ---------- Audio dock (unchanged) ---------- */
  function wireAudio(pub){
    const btn=$("#audioCTA");
    if(!(pub.audio && pub.audio.src)){ btn.style.display='none'; return; }
    btn.style.display='flex';
    const dock=$("#audioDock"), player=$("#audioPlayer"), play=$("#audioPlay"),
          seek=$("#audioSeek"), cur=$("#audioCur"), tot=$("#audioTot"),
          cover=$("#audioCover"), title=$("#audioDockTitle");
    function fmt(t){ if(!isFinite(t)) return "0:00"; const m=Math.floor(t/60), s=Math.floor(t%60); return `${m}:${String(s).padStart(2,'0')}`; }
    btn.onclick = ()=>{
      cover.src = pub.image || "/assets/cover/default.png";
      title.textContent = pub.title || "Audio";
      player.src = abs(pub.audio.src);
      dock.hidden = false; player.play?.().catch(()=>{});
      play.innerHTML = '<i class="fa-solid fa-pause"></i>';
    };
    play.onclick = ()=>{
      if(player.paused){ player.play(); play.innerHTML='<i class="fa-solid fa-pause"></i>'; }
      else { player.pause(); play.innerHTML='<i class="fa-solid fa-play"></i>'; }
    };
    $("#audioClose").onclick = ()=>{ dock.hidden=true; player.pause?.(); };
    player.addEventListener("loadedmetadata", ()=>{ seek.max=(player.duration||0); tot.textContent=fmt(player.duration||0); });
    player.addEventListener("timeupdate", ()=>{ seek.value=player.currentTime; cur.textContent=fmt(player.currentTime); });
    seek.addEventListener("input", ()=>{ player.currentTime=Number(seek.value||0); });
  }

  /* ---------- Division row (LTR) ---------- */
  function fillDivision(pubs, pub){
    const scroller=$("#divisionScroller"); if(!scroller) return;
    scroller.innerHTML="";
    const norm = s => (s||"").toString().toLowerCase().replace(/[\u2122™®©]/g,"").replace(/[^a-z0-9]+/g," ").trim();
    const rows = pubs.filter(x=> x.id!==pub.id && norm(x.division)===norm(pub.division))
                     .sort((a,b)=> new Date(b.publishDate||0)-new Date(a.publishDate||0))
                     .slice(0,12);
    rows.forEach(r=>{
      const card=document.createElement("article");
      card.className="division-card";
      const img=r.image || `/assets/cover/${r.id}.png`;
      card.innerHTML = `
        <div class="division-card__media" style="background-image:url('${img}')"></div>
        <div class="division-card__body">
          <h4 class="division-card__title"><a href="${r.url || ('/research/paper.html?id='+encodeURIComponent(r.id))}">${esc(r.title)}</a></h4>
          <div class="card__meta"><span>${fmtDate(r.publishDate||0)}</span> • <span>${esc(r.format||'—')}</span></div>
        </div>`;
      scroller.appendChild(card);
    });
    const catKey=(pub.catSlug||pub.cat||"").toLowerCase();
    $("#divisionAll")?.setAttribute("href", `${RROOT}division.html?cat=${encodeURIComponent(catKey)}&division=${encodeURIComponent(pub.division||'')}`);
  }

  /* ---------- Latest (auto-scroll loop) ---------- */
  function fillLatest(pubs){
    const items=[...pubs].sort((a,b)=> new Date(b.publishDate||0)-new Date(a.publishDate||0)).slice(0,30);
    renderLatestInto($("#latestTickerDesktop"), items);
    renderLatestInto($("#latestTickerMobile"), items);
  }
  function renderLatestInto(container, items){
    if(!container) return;
    container.className='latest-cards'; container.innerHTML='';
    const list=[...items, ...items];
    list.forEach(p=>{
      const url = p.url || (`/research/paper.html?id=${encodeURIComponent(p.id||'')}`);
      const card=document.createElement('div');
      card.className='latest-card';
      card.innerHTML = `
        <div class="latest-card__title"><a href="${url}">${esc(p.title)}</a></div>
        <div class="latest-card__meta">
          <span>${fmtDate(p.publishDate||0)}</span>
          <span>•</span>
          <span>${esc(p.id||'')}</span>
          <span class="pill">${esc((p.cat||p.catSlug||'').toLowerCase())}</span>
        </div>`;
      container.appendChild(card);
    });
    const box = container.parentElement;
    let y=0, paused=false; const speed=.35;
    function H(){ let h=0; for(let i=0;i<items.length;i++) h += container.children[i].offsetHeight + 10; return h || 1000; }
    function step(){ if(!paused){ y+=speed; if(y>=H()) y=0; container.style.transform=`translateY(${-y}px)`; } req=requestAnimationFrame(step); }
    let req = requestAnimationFrame(step);
    const pause=()=>paused=true, resume=()=>paused=false;
    box.addEventListener('mouseenter', pause); box.addEventListener('mouseleave', resume);
    box.addEventListener('touchstart', pause, {passive:true}); box.addEventListener('touchend', resume);
    box.addEventListener('focusin', pause); box.addEventListener('focusout', resume);
  }
/* ---------- Articles box on paper page (only if hasArticles) ---------- */
async function renderArticlesForPaper(pub){
  try{
    if (!pub || !pub.hasArticles) return;                  // respect activation
    const host = document.getElementById('paperArticles');
    if (!host) return;

    const articlesData = await fetchFirst(ARTICLES_CANDIDATES);
    const articles = Array.isArray(articlesData?.articles) ? articlesData.articles
                    : Array.isArray(articlesData) ? articlesData : [];

    const rows = articles.filter(a => String(a.publicationId||"").toLowerCase() === String(pub.id||"").toLowerCase());
    if (!rows.length) return;

    // show section
    host.style.display = "";

    // Parent card (reuse look)
    fillArticlesParent(pub);

    // Article list (4 visible + smooth auto-scroll if more)
    fillArticlesList(pub, rows);
    initListAutoScroll(document.getElementById('articlesList'));
  }catch(e){
    console.error('Articles box render failed:', e);
  }
}

function fillArticlesParent(p){
  const box = document.getElementById('articlesParentCard');
  if (!box) return;
  const img = p.image || `/assets/cover/${p.id}.png`;
  box.innerHTML = `
    <div class="card__media" role="img" aria-label="cover image" style="background-image:url('${img}')"></div>
    <div class="card__body">
      <h3 class="card__title">${esc(p.title||'')}</h3>
      <div class="card__meta">
        <span>${fmtDate(p.publishDate||0)}</span><span>•</span>
        <span>${esc(p.format||'—')}</span><span>•</span>
        <span class="badge">${esc(p.division||'')}</span><span>•</span>
        <span>${esc(p.id||'')}</span>
      </div>
    </div>
    <div class="card__footer">
      <a href="${p.url || ('/research/paper.html?id='+encodeURIComponent(p.id||''))}" class="btn btn--outline">Read</a>
    </div>`;
}

function fillArticlesList(p, rows){
  const list = document.getElementById('articlesList'); if (!list) return;
  list.innerHTML = rows.map(a => `
    <div class="article-item">
      <div class="article-dot"></div>
      <div>
        <a class="article-title" href="${a.url || '#'}">${esc(a.title||'')}</a>
        <div class="article-meta">${fmtDate(a.date||p.publishDate||0)} • ${esc(p.title||'')}</div>
      </div>
    </div>`).join('');
}

/* Smooth auto-scroll (loop) when list exceeds its height; pause on hover */
function initListAutoScroll(el){
  if (!el) return;
  // Container styling already ensures a height cap via CSS in research.css
  const canScroll = el.scrollHeight > el.clientHeight + 1;
  if (!canScroll) return;
  let paused = false, pos = 0, speed = 1; // px per tick
  el.addEventListener('mouseenter', ()=> paused = true);
  el.addEventListener('mouseleave', ()=> paused = false);
  setInterval(() => {
    if (paused) return;
    pos = el.scrollTop + speed;
    if (pos + el.clientHeight + 2 >= el.scrollHeight){
      setTimeout(()=>{ el.scrollTop = 0; pos = 0; }, 800);
    } else {
      el.scrollTop = pos;
    }
  }, 60);
}

  /* ---------- Boot ---------- */
  async function boot(){
    freezeHeaders(); // keep headers and progress bar fixed

    const data = await fetchFirst(DATA_CANDIDATES);
    const pubs = data?.publications || data;
    const qs=new URLSearchParams(location.search);
    const wantId=(qs.get("id")||"").toLowerCase();
    let pub = pubs.find(p=> String(p.id||"").toLowerCase()===wantId) ||
              pubs.find(p=> (p.url||"")===location.pathname) ||
              (()=>{ const m=location.pathname.match(/(SNQR-\d{4}-\d{3})/i); return m && pubs.find(p=> String(p.id||"").toLowerCase()===m[1].toLowerCase()); })();
    if(!pub) throw new Error("No publication matched this path.");
    pub = hydratePaths(pub);

    renderHero(pub);
    renderKT(pub);
    await renderSummarySection(pub);

    $("#readerCTA").onclick = ()=> openReader(pub);
    wireAudio(pub);
    renderHero(pub);
renderKT(pub);
await renderSummarySection(pub);

// NEW: render Articles box for this paper (only if hasArticles)
await renderArticlesForPaper(pub);

$("#readerCTA").onclick = ()=> openReader(pub);
wireAudio(pub);
fillDivision(pubs, pub);
fillLatest(pubs);

    fillDivision(pubs, pub);
    fillLatest(pubs);

// In boot() (or after the header is rendered)
enableIdeaTooltip();

  }

  document.addEventListener("DOMContentLoaded", boot);

  function debounce(fn,ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }


})();
