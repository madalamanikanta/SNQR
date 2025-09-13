     // 2) Animated Ticker
    const titles = [
      "How China’s Bond Diplomacy Is Shaping Markets",
      "AI Subsidies: The Next Frontier in Industrial Policy",
      "Global Capital Flows in the Panda Bound Era"
      // …add more SNQR Library titles here
    ];
    let idx = 0;
    const tickerText = document.getElementById('ticker-text');
    function updateTicker() {
      tickerText.style.opacity = 0;
      setTimeout(() => {
        tickerText.textContent = titles[idx];
        tickerText.style.opacity = 1;
        idx = (idx + 1) % titles.length;
      }, 500);
    }
    updateTicker();
    setInterval(updateTicker, 3000);
    // 4) Mobile sidebar toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav  = document.getElementById('nav-mobile');

  menuToggle.addEventListener('click', () => {
    // toggle the "open" class on your sidebar
    mobileNav.classList.toggle('open');
  });
function updateHeaderAuth() {
  const token = localStorage.getItem('token');
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const connectBtn = document.querySelector('.connect-btn');
  const loginBtn = document.querySelector('.login-btn');

  if (token && userData.name) {
    // User is logged in
    if (connectBtn) connectBtn.style.display = 'none';
    if (loginBtn) {
      loginBtn.textContent = `Welcome, ${userData.name}`;
      loginBtn.href = '#';
      loginBtn.style.cursor = 'default';
    }
  } else {
    // User is not logged in
    if (connectBtn) connectBtn.style.display = 'block';
    if (loginBtn) {
      loginBtn.textContent = 'Login';
      loginBtn.href = '/landing_page.html';
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Update header based on auth status
  updateHeaderAuth();
  // 1) Load & parse symbols_data.xlsx
  const resp = await fetch('symbols_data.xlsx');
  const buf  = await resp.arrayBuffer();
  const wb   = XLSX.read(buf, { type:'array' });
  const data = {};
  wb.SheetNames.forEach(name => {
    data[name] = XLSX.utils.sheet_to_json(wb.Sheets[name]);
  });

  // 2) Column definitions (first element is always the key for symbol/logo)
  const COLS = {
    All:            ['Symbol','Exchange','Price'],
    Stocks:         ['Symbol','Exchange','Price'],
    Commodities:    ['Symbol','Market','Price'],
    FuturesOptions: ['Symbol','Contract','Price'],
    Exchanges:      ['Symbol','Country','Price'],
    Economics:      ['Indicator','Country','Rate']
  };

  // 3) Element refs
  const modal      = document.getElementById('search-modal');
  const showBtn    = document.querySelector('.search-toggle');
  const closeBtn   = document.querySelector('.modal-close');
  const chips      = [...document.querySelectorAll('.chip')];
  const input      = document.querySelector('.search-input');
  const resultsDiv = document.querySelector('.results-container');

  // 4) Open / Close
  showBtn.onclick  = () => modal.classList.add('open');
  closeBtn.onclick = () => modal.classList.remove('open');
  modal.onclick    = e => { if(e.target===modal) modal.classList.remove('open'); };

  // 5) Render logic
  let currentCat = 'All';
  function renderResults() {
    const txt = input.value.trim().toLowerCase();
    let list = data[currentCat] || [];
    if (txt) {
      list = list.filter(it =>
        ((it.Symbol||'') + (it.Indicator||'')).toLowerCase().includes(txt) ||
        (it.Name||'').toLowerCase().includes(txt)
      );
    }
    const cols  = COLS[currentCat];
    const slice = list.slice(0,6);

    // Build table header
    let html = `<table class="search-table"><thead><tr>`;
    html += `<th></th>`;            // blank for symbol column
    cols.slice(1).forEach(key => {
      html += `<th>${key}</th>`;
    });
    html += `</tr></thead><tbody>`;

    // Build rows
    slice.forEach(item => {
      html += `<tr>`;
      // First column: logo + symbol + name
      html += `<td class="sym-col">
        <img src="${item.LogoURL||''}" alt="" />
        <div>
          <strong>${item[cols[0]]||''}</strong>
          <span class="name-text">${item.Name||item.Indicator||''}</span>
        </div>
      </td>`;
      // Other cols
      for (let i = 1; i < cols.length; i++) {
        const key = cols[i];
        const val = item[key] || '—';
        if (i === cols.length - 1) {
          // Price/Rate column with lock
          html += `<td class="price-cell"><i class="fas fa-lock"></i>${val}</td>`;
        } else {
          html += `<td>${val}</td>`;
        }
      }
      html += `</tr>`;
    });

    html += `</tbody></table>
      <div class="show-all">
        <a href="symbol-list.html?cat=${currentCat}">
          Show all ${list.length} →
        </a>
      </div>`;

    resultsDiv.innerHTML = html;
  }

  // 6) Wire up events
  input.addEventListener('input', renderResults);
  chips.forEach(chip => chip.onclick = () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentCat = chip.dataset.cat;
    input.value = '';
    renderResults();
  });

  resultsDiv.onclick = e => {
    if (e.target.closest('tr')) {
      alert('🔒 Please login to access full data.');
    }
  };

  // 7) Initial draw
  renderResults();
});
