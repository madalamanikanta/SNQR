/* SNQR 3-Step Wizard (shared). Linear flow + validation. */
(function(){
  'use strict';

  var step = 1;

  document.addEventListener('DOMContentLoaded', function(){
    // Wire the bulb button to open modal (works even if data-attrs are blocked)
    var btn = document.getElementById('btnIdea');
    if (btn) btn.addEventListener('click', function(){
      var el = document.getElementById('ideaModal');
      if (!el) return;
      if (window.bootstrap && bootstrap.Modal){
        bootstrap.Modal.getOrCreateInstance(el).show();
      }
    });

    var modalEl = document.getElementById('ideaModal');
    if (!modalEl) return;

    modalEl.addEventListener('shown.bs.modal', function(){
      step = 1; showStep(1); updateDots();
      // reset fields
      setValue('wizName',''); setValue('wizEmail',''); setValue('wizOrg','');
      setValue('wizTitle',''); setValue('wizDesc',''); setChecked('wizAccept', false);
      updateCount(); toggleNext1(); toggleNext2(); toggleSubmit();
    });

    onClick('wizBack', function(){ if (step>1){ step--; showStep(step); updateDots(); } });
    onClick('wizNext1', function(){ if (validStep1()){ step=2; showStep(2); updateDots(); } });
    onClick('wizNext2', function(){ if (validStep2()){ step=3; showStep(3); updateDots(); } });
    onClick('wizSubmit', function(){ if (validStep3()){ try{ bootstrap.Modal.getInstance(modalEl).hide(); }catch(e){} alert('Thank you! Your idea has been submitted.'); } });

    // Live validation
    addInput('wizName',  toggleNext1);
    addInput('wizEmail', toggleNext1);
    addInput('wizTitle', toggleNext2);
    addInput('wizDesc',  function(){ updateCount(); toggleNext2(); });
    addChange('wizAccept', toggleSubmit);
  });

  // ---- view
  function showStep(n){
    toggleClass('wizStep1', n===1);
    toggleClass('wizStep2', n===2);
    toggleClass('wizStep3', n===3);
    byId('wizBack').disabled = (n===1);
    setVis('wizNext1', n===1);
    setVis('wizNext2', n===2);
    setVis('wizSubmit', n===3);
  }
  function updateDots(){
    setActive('wizDot1', step>=1);
    setActive('wizDot2', step>=2);
    setActive('wizDot3', step>=3);
  }

  // ---- validation
  function validStep1(){
    var name  = val('wizName').trim();
    var email = val('wizEmail').trim();
    var okN = name.length>1;
    var okE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    markBad('wizName', !okN); markBad('wizEmail', !okE);
    return okN && okE;
  }
  function validStep2(){
    var title = val('wizTitle').trim();
    var desc  = val('wizDesc').trim();
    var okT = title.length>=5, okD = desc.length>=100;
    markBad('wizTitle', !okT); markBad('wizDesc', !okD);
    return okT && okD;
  }
  function validStep3(){ return byId('wizAccept') && byId('wizAccept').checked; }

  function toggleNext1(){ setDisabled('wizNext1', !validStep1()); }
  function toggleNext2(){ setDisabled('wizNext2', !validStep2()); }
  function toggleSubmit(){ setDisabled('wizSubmit', !validStep3()); }
  function updateCount(){ var el = byId('wizDescCount'); if (el) el.textContent = String(val('wizDesc').length); }

  // ---- dom utils
  function byId(id){ return document.getElementById(id); }
  function onClick(id, fn){ var el=byId(id); if (el) el.addEventListener('click', fn); }
  function addInput(id, fn){ var el=byId(id); if (el) el.addEventListener('input', fn); }
  function addChange(id, fn){ var el=byId(id); if (el) el.addEventListener('change', fn); }
  function val(id){ var el=byId(id); return el? String(el.value||'') : ''; }
  function setValue(id,v){ var el=byId(id); if (el) el.value=v; }
  function setChecked(id,v){ var el=byId(id); if (el) el.checked=!!v; }
  function toggleClass(id,on){ var el=byId(id); if (!el) return; el.classList.toggle('d-none', !on); }
  function setVis(id,on){ var el=byId(id); if (!el) return; el.classList.toggle('d-none', !on); }
  function setActive(id,on){ var el=byId(id); if (!el) return; el.classList.toggle('active', !!on); }
  function markBad(id,b){ var el=byId(id); if (!el) return; el.classList.toggle('is-invalid', !!b); }
  function setDisabled(id,b){ var el=byId(id); if (!el) return; el.disabled = !!b; }
})();
