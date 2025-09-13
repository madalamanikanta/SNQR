/* Shortcuts */
const $ = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
const ticket = () => `SNQR-${Math.floor(1000 + Math.random()*9000)}`;

const ROUTE = { connect:"connect@SNQRGlobal.com", office:"office@SNQRGlobal.com", hr:"hr@SNQRGlobal.com" };

/* Section reveal */
const io = new IntersectionObserver((es)=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('snqr-in'); io.unobserve(e.target);} }),{threshold:.16});
$$('.snqr-reveal').forEach(n=> io.observe(n));

/* FAQ */
$$('.snqr-faq-item').forEach(item=>{
  const head = $('.snqr-faq-head', item);
  const toggle = ()=>{
    const open = item.classList.contains('open');
    $$('.snqr-faq-item').forEach(i=>{ i.classList.remove('open'); $('.snqr-faq-head', i).setAttribute('aria-expanded','false'); });
    if(!open){ item.classList.add('open'); head.setAttribute('aria-expanded','true'); }
  };
  head.addEventListener('click', toggle);
  head.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); }});
});

/* Overlays */
const openOv = id => { const o=$('#'+id); o.classList.add('show'); o.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; $('.snqr-modal-close', o)?.focus(); };
const closeOv = id => { const o=$('#'+id); o.classList.remove('show'); o.setAttribute('aria-hidden','true'); document.body.style.overflow=''; };
$$('[data-close]').forEach(b=> b.addEventListener('click', ()=> closeOv(b.getAttribute('data-close'))));
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ ['ov-ai','ov-biz','ov-careers','ov-dispatch','ov-idea','ov-faq'].forEach(closeOv); }});

$('#openAI')?.addEventListener('click', ()=>{ resetAI(); openOv('ov-ai'); });
$('#openBiz')?.addEventListener('click', ()=>{ resetBiz(); openOv('ov-biz'); });
$('#openCareers')?.addEventListener('click', ()=>{ resetCareers(); openOv('ov-careers'); });
$('#openDispatch')?.addEventListener('click', ()=>{ resetDispatch(); openOv('ov-dispatch'); });
$('#openIdea')?.addEventListener('click', ()=>{ resetIdea(); openOv('ov-idea'); });
$('#openFaqAsk')?.addEventListener('click', ()=>{ resetFaq(); openOv('ov-faq'); });

/* ========== Wizard A: SNQR AI ========== */
const ai = { form:$('#form-ai'), steps: $$('#form-ai .snqr-step'), set(s){ this.steps.forEach(b=> b.hidden=(+b.dataset.step!==s)); $$('#steps-ai li').forEach(li=>{const n=+li.dataset.step; li.classList.toggle('active',n===s); li.classList.toggle('done',n<s);}); } };
function vAI1(){ const ok = ['#ai_name','#ai_org','#ai_role','#ai_email','#ai_tz'].map(s=>$(s).value.trim()).every(Boolean) && /\S+@\S+\.\S+/.test($('#ai_email').value.trim()); $('#ai_next1').disabled=!ok; return ok; }
function vAI2(){ const access=!!$('input[name="ai_access"]:checked', $('#ai_access')); const use=$('#ai_use').value.trim().length>=120; const sens=$$('input[name="ai_sens"]:checked').length>=1; $('#ai_next2').disabled=!(access&&use&&sens); return access&&use&&sens; }
function vAI3(){ const assets=$$('input[name="ai_assets"]:checked').length>=1; const geo=$$('input[name="ai_geo"]:checked').length>=1; const horizon=!!$('input[name="ai_horizon"]:checked'); const consent=$('#ai_consent').checked; $('#ai_submit').disabled=!(assets&&geo&&horizon&&consent); return assets&&geo&&horizon&&consent; }
['#ai_name','#ai_org','#ai_role','#ai_email','#ai_tz'].forEach(s=> $(s)?.addEventListener('input', vAI1));
$$('#ai_access input[name="ai_access"]').forEach(r=> r.addEventListener('change', ()=>{ r.parentElement.classList.add('active'); $$('#ai_access .snqr-chip').forEach(c=> c.classList.toggle('active', c.contains(r))); vAI2(); }));
$('#ai_use')?.addEventListener('input', vAI2);
$$('#ai_sens input[name="ai_sens"]').forEach(c=> c.addEventListener('change', ()=>{ c.parentElement.classList.toggle('active', c.checked); vAI2(); }));
['ai_assets','ai_geo','ai_horizon'].forEach(g=> $$('#'+g+' input').forEach(inp=> inp.addEventListener('change', ()=>{ if(inp.type==='checkbox'){ inp.parentElement.classList.toggle('active', inp.checked); } else { $$('#'+g+' input').forEach(sib=> sib.parentElement.classList.toggle('active', sib.checked)); } vAI3(); })));
$('#ai_consent')?.addEventListener('change', vAI3);
$('#ai_next1')?.addEventListener('click', ()=>{ if(vAI1()) ai.set(2); });
$('#ai_prev2')?.addEventListener('click', ()=> ai.set(1));
$('#ai_next2')?.addEventListener('click', ()=>{ if(vAI2()) ai.set(3); });
$('#ai_prev3')?.addEventListener('click', ()=> ai.set(2));
ai.form?.addEventListener('submit', e=>{
  e.preventDefault(); if(!vAI3()) return;
  console.log('AI →', ROUTE.connect, 'payload sent');
  ai.steps.forEach(b=> b.hidden=true); $('[data-success]', ai.form).hidden=false; $('#ai_ticket').textContent=ticket();
});
function resetAI(){ ai.form.reset(); $$('#form-ai .snqr-chip').forEach(c=>c.classList.remove('active')); $('[data-success]', ai.form).hidden=true; $('#ai_next1').disabled=true; $('#ai_next2').disabled=true; $('#ai_submit').disabled=true; ai.set(1); }

/* ========== Wizard B: Business Appointment ========== */
const bz = { form:$('#form-biz'), steps: $$('#form-biz .snqr-step'), set(s){ this.steps.forEach(b=> b.hidden=(+b.dataset.step!==s)); $$('#steps-biz li').forEach(li=>{const n=+li.dataset.step; li.classList.toggle('active',n===s); li.classList.toggle('done',n<s);}); } };
function vB1(){ const ok=$('#bz_name').value.trim() && /\S+@\S+\.\S+/.test($('#bz_email').value.trim()) && $('#bz_tz').value.trim(); $('#bz_next1').disabled=!ok; return ok; }
function vB2(){ const ok=$('#bz_org').value.trim() && $('#bz_role').value.trim(); $('#bz_next2').disabled=!ok; return ok; }
function vB3(){ const ok=$('#bz_expect').value.trim().length>=60 && $('#bz_consent').checked; $('#bz_submit').disabled=!ok; return ok; }
['#bz_name','#bz_email','#bz_tz'].forEach(s=> $(s)?.addEventListener('input', vB1));
['#bz_org','#bz_role'].forEach(s=> $(s)?.addEventListener('input', vB2));
$('#bz_expect')?.addEventListener('input', vB3); $('#bz_consent')?.addEventListener('change', vB3);
$('#bz_next1')?.addEventListener('click', ()=>{ if(vB1()) bz.set(2); });
$('#bz_prev2')?.addEventListener('click', ()=> bz.set(1));
$('#bz_next2')?.addEventListener('click', ()=>{ if(vB2()) bz.set(3); });
$('#bz_prev3')?.addEventListener('click', ()=> bz.set(2));
bz.form?.addEventListener('submit', e=>{
  e.preventDefault(); if(!vB3()) return;
  console.log('Biz →', ROUTE.office, 'payload sent');
  bz.steps.forEach(b=> b.hidden=true); $('[data-success]', bz.form).hidden=false; $('#bz_ticket').textContent=ticket();
});
function resetBiz(){ bz.form.reset(); $('[data-success]', bz.form).hidden=true; $('#bz_next1').disabled=true; $('#bz_next2').disabled=true; $('#bz_submit').disabled=true; bz.set(1); }

/* ========== Wizard C: Careers ========== */
const cr = { form:$('#form-careers'), steps: $$('#form-careers .snqr-step'), set(s){ this.steps.forEach(b=> b.hidden=(+b.dataset.step!==s)); $$('#steps-careers li').forEach(li=>{const n=+li.dataset.step; li.classList.toggle('active',n===s); li.classList.toggle('done',n<s);}); } };
function vC1(){ const ok=$('#cr_name').value.trim() && /\S+@\S+\.\S+/.test($('#cr_email').value.trim()) && $('#cr_tz').value.trim(); $('#cr_next1').disabled=!ok; return ok; }
function vC2(){ const f=$('#cr_resume').files[0]; let ok=false; if(f){ ok=/\.(pdf|doc|docx)$/i.test(f.name) && f.size<=10*1024*1024; } $('#cr_next2').disabled=!ok; return ok; }
function vC3(){ const ok=$('#cr_expect').value.trim().length>=60 && $('#cr_consent').checked; $('#cr_submit').disabled=!ok; return ok; }
['#cr_name','#cr_email','#cr_tz'].forEach(s=> $(s)?.addEventListener('input', vC1));
$('#cr_resume')?.addEventListener('change', vC2);
$('#cr_expect')?.addEventListener('input', vC3); $('#cr_consent')?.addEventListener('change', vC3);
$('#cr_next1')?.addEventListener('click', ()=>{ if(vC1()) cr.set(2); });
$('#cr_prev2')?.addEventListener('click', ()=> cr.set(1));
$('#cr_next2')?.addEventListener('click', ()=>{ if(vC2()) cr.set(3); });
$('#cr_prev3')?.addEventListener('click', ()=> cr.set(2));
cr.form?.addEventListener('submit', e=>{
  e.preventDefault(); if(!vC3()) return;
  console.log('Careers →', ROUTE.hr, 'payload sent');
  cr.steps.forEach(b=> b.hidden=true); $('[data-success]', cr.form).hidden=false; $('#cr_ticket').textContent=ticket();
});
function resetCareers(){ cr.form.reset(); $('[data-success]', cr.form).hidden=true; $('#cr_next1').disabled=true; $('#cr_next2').disabled=true; $('#cr_submit').disabled=true; cr.set(1); }

/* ========== Wizard D: Dispatch ========== */
const dp = { form:$('#form-dispatch'), steps: $$('#form-dispatch .snqr-step'), set(s){ this.steps.forEach(b=> b.hidden=(+b.dataset.step!==s)); $$('#steps-dispatch li').forEach(li=>{const n=+li.dataset.step; li.classList.toggle('active',n===s); li.classList.toggle('done',n<s);}); } };
function vD1(){ const ok=$('#dp_name').value.trim() && /\S+@\S+\.\S+/.test($('#dp_email').value.trim()) && $('#dp_tz').value.trim(); $('#dp_next1').disabled=!ok; return ok; }
function vD2(){ const r=$$('input[name="dp_research"]:checked').length>=1; const m=$$('input[name="dp_markets"]:checked').length>=1; const s=!!$('input[name="dp_study"]:checked'); $('#dp_next2').disabled=!(r&&m&&s); return r&&m&&s; }
function vD3(){ const ok=$('#dp_ack').checked && $('#dp_consent').checked; $('#dp_submit').disabled=!ok; return ok; }
['#dp_name','#dp_email','#dp_tz'].forEach(s=> $(s)?.addEventListener('input', vD1));
['dp_research','dp_markets','dp_study'].forEach(id=> $$('#'+id+' input').forEach(inp=> inp.addEventListener('change', ()=>{ if(inp.type==='checkbox'){ inp.parentElement.classList.toggle('active', inp.checked); } else { $$('#'+id+' input').forEach(sib=> sib.parentElement.classList.toggle('active', sib.checked)); } vD2(); })));
$('#dp_ack')?.addEventListener('change', vD3); $('#dp_consent')?.addEventListener('change', vD3);
$('#dp_next1')?.addEventListener('click', ()=>{ if(vD1()) dp.set(2); });
$('#dp_prev2')?.addEventListener('click', ()=> dp.set(1));
$('#dp_next2')?.addEventListener('click', ()=>{ if(vD2()) dp.set(3); });
$('#dp_prev3')?.addEventListener('click', ()=> dp.set(2));
dp.form?.addEventListener('submit', e=>{
  e.preventDefault(); if(!vD3()) return;
  console.log('Dispatch →', ROUTE.connect, 'payload sent');
  dp.steps.forEach(b=> b.hidden=true); $('[data-success]', dp.form).hidden=false; $('#dp_ticket').textContent=ticket();
});
function resetDispatch(){ dp.form.reset(); $$('#form-dispatch .snqr-chip').forEach(c=>c.classList.remove('active')); $('[data-success]', dp.form).hidden=true; $('#dp_next1').disabled=true; $('#dp_next2').disabled=true; $('#dp_submit').disabled=true; dp.set(1); }

/* ========== Wizard E: Idea ========== */
const idw = { form:$('#form-idea'), steps: $$('#form-idea .snqr-step'), set(s){ this.steps.forEach(b=> b.hidden=(+b.dataset.step!==s)); $$('#steps-idea li').forEach(li=>{const n=+li.dataset.step; li.classList.toggle('active',n===s); li.classList.toggle('done',n<s);}); } };
function vI1(){ const ok=$('#id_name').value.trim() && /\S+@\S+\.\S+/.test($('#id_email').value.trim()) && $('#id_tz').value.trim(); $('#id_next1').disabled=!ok; return ok; }
function vI2(){ const title=$('#id_title').value.trim().length>0; const domain=$$('input[name="id_domain"]:checked').length>=1; const len=$('#id_summary').value.trim().length; const summaryOk=len>=100 && len<=2000; const consent=$('#id_consent').checked; $('#id_submit').disabled=!(title&&domain&&summaryOk&&consent); return title&&domain&&summaryOk&&consent; }
['#id_name','#id_email','#id_tz'].forEach(s=> $(s)?.addEventListener('input', vI1));
$$('#id_domain input[name="id_domain"]').forEach(c=> c.addEventListener('change', ()=>{ c.parentElement.classList.toggle('active', c.checked); vI2(); }));
$('#id_title')?.addEventListener('input', vI2);
$('#id_summary')?.addEventListener('input', vI2);
$('#id_consent')?.addEventListener('change', vI2);
$('#id_next1')?.addEventListener('click', ()=>{ if(vI1()) idw.set(2); });
$('#id_prev2')?.addEventListener('click', ()=> idw.set(1));
idw.form?.addEventListener('submit', e=>{
  e.preventDefault(); if(!vI2()) return;
  console.log('Idea →', ROUTE.connect, 'payload sent');
  idw.steps.forEach(b=> b.hidden=true); $('[data-success]', idw.form).hidden=false; $('#id_ticket').textContent=ticket();
});
function resetIdea(){ idw.form.reset(); $$('#id_domain .snqr-chip').forEach(c=>c.classList.remove('active')); $('[data-success]', idw.form).hidden=true; $('#id_next1').disabled=true; $('#id_submit').disabled=true; idw.set(1); }

/* ========== Wizard F: Ask SNQR ========== */
const fq = { form:$('#form-faq'), steps: $$('#form-faq .snqr-step'), set(s){ this.steps.forEach(b=> b.hidden=(+b.dataset.step!==s)); $$('#steps-faq li').forEach(li=>{const n=+li.dataset.step; li.classList.toggle('active',n===s); li.classList.toggle('done',n<s);}); } };
function vF1(){ const sel=$('#fq_q input[name="fq_q"]:checked'); let ok=false; if(sel && sel.value==='Other'){ $('#fq_other_wrap').hidden=false; ok=$('#fq_other').value.trim().length>=100; } else if(sel){ $('#fq_other_wrap').hidden=true; ok=true; } $('#fq_next1').disabled=!ok; return ok; }
function vF2(){ const ok=/\S+@\S+\.\S+/.test($('#fq_email').value.trim()) && $('#fq_consent').checked; $('#fq_submit').disabled=!ok; return ok; }
$$('#fq_q input[name="fq_q"]').forEach(r=> r.addEventListener('change', vF1));
$('#fq_other')?.addEventListener('input', vF1);
$('#fq_next1')?.addEventListener('click', ()=>{ if(vF1()) fq.set(2); });
$('#fq_prev2')?.addEventListener('click', ()=> fq.set(1));
$('#fq_email')?.addEventListener('input', vF2);
$('#fq_consent')?.addEventListener('change', vF2);
fq.form?.addEventListener('submit', e=>{
  e.preventDefault(); if(!vF2()) return;
  console.log('FAQ →', ROUTE.connect, 'payload sent');
  fq.steps.forEach(b=> b.hidden=true); $('[data-success]', fq.form).hidden=false; $('#fq_ticket').textContent=ticket();
});
function resetFaq(){ fq.form.reset(); $$('#form-faq .snqr-chip').forEach(c=>c.classList.remove('active')); $('[data-success]', fq.form).hidden=true; $('#fq_next1').disabled=true; $('#fq_submit').disabled=true; $('#fq_other_wrap').hidden=true; fq.set(1); }
