/* Utilities */
const EL = (s, r=document)=>r.querySelector(s);
const ELS = (s, r=document)=>Array.from(r.querySelectorAll(s));
const randTicket = () => `SNQR-${Math.floor(1000 + Math.random()*9000)}`;

/* Email routing (server will actually send; this is just the mapping) */
const ROUTE = {
  connect:"connect@SNQRGlobal.com",
  office: "office@SNQRGlobal.com",
  hr:     "hr@SNQRGlobal.com"
};

/* Reveal animations (prevents “mid-section” visual confusion) */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: .16 });
ELS('.reveal').forEach(n=> io.observe(n));

/* FAQ accordion */
ELS('.faq-item').forEach(item=>{
  const head = EL('.faq-head', item);
  const toggle = ()=>{
    const open = item.classList.contains('open');
    ELS('.faq-item').forEach(i=>{
      i.classList.remove('open');
      EL('.faq-head', i).setAttribute('aria-expanded','false');
    });
    if(!open){ item.classList.add('open'); head.setAttribute('aria-expanded','true'); }
  };
  head.addEventListener('click', toggle);
  head.addEventListener('keydown', e=>{
    if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); }
  });
});

/* Overlay open/close */
const openOverlay = id => {
  const o = EL('#'+id);
  o.classList.add('show'); o.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  EL('.modal-close', o)?.focus();
};
const closeOverlay = id => {
  const o = EL('#'+id);
  o.classList.remove('show'); o.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
};
ELS('[data-close]').forEach(b=> b.addEventListener('click', ()=> closeOverlay(b.getAttribute('data-close'))));
document.addEventListener('keydown', e=>{
  if(e.key==='Escape'){ ['overlayA','overlayB'].forEach(closeOverlay); }
});

/* Buttons to launch wizards */
EL('#openWizardA')?.addEventListener('click', ()=>{ resetWizardA(); openOverlay('overlayA'); });
EL('#openWizardB')?.addEventListener('click', ()=>{ resetWizardB(); openOverlay('overlayB'); });
EL('#openWizardA_2')?.addEventListener('click', ()=>{ resetWizardA(); openOverlay('overlayA'); });
EL('#openInvestorDispatch')?.addEventListener('click', ()=>{
  resetWizardA(); openOverlay('overlayA'); preselectEngagement('Investor Dispatch Access'); gotoStepA(2);
});

/* ---------- Wizard A (Quant Scan) ---------- */
const formA = EL('#formA');
const btnNext1 = EL('#a_next1');
const btnNext2 = EL('#a_next2');
const btnSubmitA = EL('#a_submit');
const stepBlocksA = ELS('#formA .step');

const setStepsUIA = s=>{
  ELS('#stepsA li').forEach(li=>{
    const n=+li.dataset.step;
    li.classList.toggle('active', n===s);
    li.classList.toggle('done', n<s);
  });
};
const gotoStepA = s=>{
  stepBlocksA.forEach(b=> b.hidden = (+b.dataset.step!==s));
  setStepsUIA(s);
};
const validateStep1A = ()=>{
  const ok = ['#a_name','#a_org','#a_role','#a_email','#a_tz']
    .map(sel=>EL(sel).value.trim()).every(Boolean)
    && /\S+@\S+\.\S+/.test(EL('#a_email').value.trim());
  btnNext1.disabled = !ok; return ok;
};
const validateStep2A = ()=>{
  const any = !!EL('input[name="engagement"]:checked', EL('#a_engagement'));
  btnNext2.disabled = !any; return any;
};
const groupChecked = name => ELS(`input[name="${name}"]`).some(i=>i.checked);
const validateStep3A = ()=>{
  const need = EL('#a_need').value.trim().length>0;
  const consent = EL('#a_consent').checked;
  const ok = groupChecked('assets') && groupChecked('geo') && groupChecked('horizon') && groupChecked('urgency') && need && consent;
  btnSubmitA.disabled = !ok; return ok;
};

/* Listeners — Step 1 */
['#a_name','#a_org','#a_role','#a_email','#a_tz'].forEach(sel=>{
  EL(sel)?.addEventListener('input', validateStep1A);
});
/* Step 2 */
ELS('#a_engagement input[name="engagement"]').forEach(r=>{
  r.addEventListener('change', ()=>{
    ELS('#a_engagement .chip').forEach(c=>c.classList.remove('active'));
    r.parentElement.classList.add('active');
    validateStep2A();
  });
});
/* Step 3 */
['assets','geo','horizon','urgency'].forEach(group=>{
  ELS(`input[name="${group}"]`).forEach(inp=>{
    inp.addEventListener('change', ()=>{
      if(inp.type==='checkbox'){ inp.parentElement.classList.toggle('active', inp.checked); }
      else { ELS(`input[name="${group}"]`).forEach(sib=> sib.parentElement.classList.toggle('active', sib.checked)); }
      validateStep3A();
    });
  });
});
EL('#a_need')?.addEventListener('input', validateStep3A);
EL('#a_consent')?.addEventListener('change', validateStep3A);

/* Nav */
btnNext1?.addEventListener('click', ()=>{ if(validateStep1A()) gotoStepA(2); });
EL('#a_prev2')?.addEventListener('click', ()=> gotoStepA(1));
btnNext2?.addEventListener('click', ()=>{ if(validateStep2A()) gotoStepA(3); });
EL('#a_prev3')?.addEventListener('click', ()=> gotoStepA(2));

/* Submit */
formA?.addEventListener('submit', e=>{
  e.preventDefault();
  if(!validateStep3A()) return;

  const payload = collectFormA();
  const routeTo = ROUTE.connect;  // all Wizard A requests → connect@
  console.log('Wizard A →', routeTo, payload);

  // Success UI
  stepBlocksA.forEach(b=> b.hidden = true);
  EL('[data-success]', formA).hidden = false;
  EL('#ticketA').textContent = randTicket();
});

/* Helpers */
function collectFormA(){
  const getVals = n => ELS(`input[name="${n}"]:checked`).map(i=>i.value);
  return {
    who:{
      name:EL('#a_name').value.trim(),
      org:EL('#a_org').value.trim(),
      role:EL('#a_role').value.trim(),
      email:EL('#a_email').value.trim(),
      tz:EL('#a_tz').value.trim()
    },
    engagement:(EL('input[name="engagement"]:checked')||{}).value || null,
    scope:{
      assets:getVals('assets'),
      geography:getVals('geo'),
      horizon:(EL('input[name="horizon"]:checked')||{}).value || null,
      urgency:(EL('input[name="urgency"]:checked')||{}).value || null,
      need:EL('#a_need').value.trim()
    }
  };
}
function resetWizardA(){
  formA.reset();
  ELS('#a_engagement .chip,[data-required-group] .chip,.choices .chip').forEach(c=>c.classList.remove('active'));
  EL('[data-success]', formA).hidden = true;
  btnNext1.disabled = true; btnNext2.disabled = true; EL('#a_submit').disabled = true;
  EL('#modalATitle').textContent = 'Request a Quant Scan';
  gotoStepA(1);
}
function preselectEngagement(label){
  const t = ELS('input[name="engagement"]').find(r=>r.value===label);
  if(t){
    t.checked = true;
    ELS('#a_engagement .chip').forEach(c=>c.classList.remove('active'));
    t.parentElement.classList.add('active');
    btnNext2.disabled = false;
    EL('#modalATitle').textContent = (label==='Investor Dispatch Access') ? 'Request Investor Dispatch Access' : 'Request a Quant Scan';
  }
}

/* ---------- Wizard B (Appointment) ---------- */
const formB = EL('#formB');
const btnNextB = EL('#b_next1');

const gotoStepB = s=>{
  ELS('#formB .step').forEach(b=> b.hidden = (+b.dataset.step!==s));
  ELS('#stepsB li').forEach(li=>{
    const n = +li.dataset.step;
    li.classList.toggle('active', n===s);
    li.classList.toggle('done', n<s);
  });
};

ELS('#b_purpose input[name="purpose"]').forEach(r=>{
  r.addEventListener('change', ()=>{
    ELS('#b_purpose .chip').forEach(c=>c.classList.remove('active'));
    r.parentElement.classList.add('active');
    btnNextB.disabled = !EL('#b_purpose input[name="purpose"]:checked');
  });
});
EL('#b_prev2')?.addEventListener('click', ()=> gotoStepB(1));
btnNextB?.addEventListener('click', ()=> gotoStepB(2));

formB?.addEventListener('submit', e=>{
  e.preventDefault();
  const purpose = (EL('#b_purpose input[name="purpose"]:checked')||{}).value || '';

  let routeTo = ROUTE.connect;
  if(['Partnership/RFP discussion','Press/editorial'].includes(purpose)) routeTo = ROUTE.office;
  if(purpose==='Careers conversation') routeTo = ROUTE.hr;

  console.log('Wizard B →', routeTo, { purpose });

  ELS('#formB .step').forEach(b=> b.hidden = true);
  EL('[data-success]', formB).hidden = false;
  EL('#ticketB').textContent = randTicket();
});

function resetWizardB(){
  formB.reset();
  ELS('#b_purpose .chip').forEach(c=>c.classList.remove('active'));
  EL('[data-success]', formB).hidden = true;
  btnNextB.disabled = true;
  gotoStepB(1);
}
