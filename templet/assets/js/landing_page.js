// Ensure AOS is initialised (remove if already in global script)
  if (typeof AOS !== 'undefined') {
    AOS.init({ once: false, duration: 800, easing: 'ease-out-cubic' });
  }
//  Section 2
  // 1) Define slides
  const slides = [
    {
      bg:  '/templet/animation-slides/1a.png',
      img: '/templet/animation-slides/1b.png',
      title:'Global & Domestic Exchanges Tracked',
      desc: `We don’t just track markets, we monitor the structural pulse of exchanges across India, the US, China, and key global nodes. From NSE to NYSE, our coverage captures capital behaviour, sectoral divergence, and institutional velocity.`,
      btnText:'Learn More', btnLink:'#'
    },
    {
      bg:  '/templet/animation-slides/2a.png',
      img: '/templet/animation-slides/2b.png',
      title:'Strategic Commodity Ecosystems',
      desc: `Commodities are not mere tickers—they are geopolitical instruments. We cover energy, metals, agriculture, and emerging resources through price behavior, logistics friction, and cross-border trade signals.`,
      btnText:'Explore Commodities', btnLink:'#'
    },
    {
      bg:  '/templet/animation-slides/3a.png',
      img: '/templet/animation-slides/3b.png',
      title:'Style-Aligned Investment Frameworks',
      desc: `Our systems adapt to how capital is deployed—whether through momentum regimes, valuation cycles, or volatility trades. Strategy is not just modeled; it is mapped to user intent.`,
      btnText:'View Strategies', btnLink:'#'
    },
    {
      bg:  '/templet/animation-slides/4a.png',
      img: '/templet/animation-slides/4b.png',
      title:'Asset Class Periodicity Models',
      desc: `Markets move in layers. We decode equities, currencies, bonds, and derivatives across daily flows,  weekly inflections,  and macro phases aligning short-term signals with structural cycles.`,
      btnText:'Learn More', btnLink:'#'
    },
    {
      bg:  '/templet/animation-slides/5a.png',
      img: '/templet/animation-slides/5b.png',
      title:'Exchange-Derivative Diagnostics',
      desc: `From option chains to implied volatility surfaces, our derivative analysis reads the market’s own probability map. This is not noise trading,  it is informed asymmetry discovery.`,
      btnText:'Explore Commodities', btnLink:'#'
    },
    {
      bg:  '/templet/animation-slides/6a.png',
      img: '/templet/animation-slides/6b.png',
      title:'Sectoral & Ecosystem Reports',
      desc: `Sectors behave like organisms adapting to capital flows,  policy shifts, and demand transitions. We build ecosystem-grade reports that explain not just performance, but positioning.`,
      btnText:'View Strategies', btnLink:'#'
    },
    {
      bg:  '/templet/animation-slides/7a.png',
      img: '/templet/animation-slides/7b.png',
      title:'Macroeconomic System Modelling',
      desc: `We don’t publish economic stats we model them.  Fiscal rhythm, monetary stance,  credit pathways structured into dashboards that expose hidden interactions beneath the headline data.`,
      btnText:'Learn More', btnLink:'#'
    },
    {
      bg:  '/templet/animation-slides/8a.png',
      img: '/templet/animation-slides/8b.png',
      title:'Geo-Strategic & Policy Risk Intelligence',
      desc: `Markets do not operate in a vacuum. We map geopolitical tension, regulatory recalibration, and    global policy architecture to prepare decision-makers, not react to headlines.`,
      btnText:'Explore Commodities', btnLink:'#'
    },
    {
      bg:  '/templet/animation-slides/9a.png',
      img: '/templet/animation-slides/9b.png',
      title:'Tiered Research Access Retail to Institutional',
      desc: `Intelligence must be accessible without dilution. From full-stack institutional dashboards to simplified strategic briefs, our research is delivered with context-tiered precision.`,
      btnText:'View Strategies', btnLink:'#'
  },
    {
      bg:  '/templet/animation-slides/10a.png',
      img: '/templet/animation-slides/10b.png',
      title:'Quantum & Quantitative Intelligence Style',
      desc: `Our quant engine blends classical statistical inference with quantum-inspired modeling enabling faster convergence, deeper factor extraction, and uncertainty-mapped forecasts. We don’t chase predictions; we construct probability-informed clarity.`,
      btnText:'View Strategies', btnLink:'#'
    }
  ];

  // 2) Inject slides
  const container = document.getElementById('feature-slider');
  slides.forEach((s,i) => {
    const slide = document.createElement('div');
    slide.className = 'slide' + (i===0? ' active': '');
    slide.style.backgroundImage = `url('${s.bg}')`;
    slide.innerHTML = `
      <div class="text">
        <h2>${s.title}</h2>
        <p>${s.desc}</p>
        <button class="slide-btn" onclick="location.href='${s.btnLink}'">
          ${s.btnText}
        </button>
      </div>
      <div class="media">
        <img src="${s.img}" alt="${s.title}">
      </div>
    `;
    container.appendChild(slide);
  });

  // 3) Auto-rotate every 5s
  let current = 0;
  setInterval(() => {
    const all = container.querySelectorAll('.slide');
    all[current].classList.remove('active');
    current = (current + 1) % all.length;
    all[current].classList.add('active');
  }, 5000);


//   Section - 5:
  (function () {
    function initAOS() {
      if (window.AOS && typeof AOS.init === "function") {
        AOS.init({ once: false, duration: 800, easing: "ease-out-cubic" });
      }
    }

    if (!window.AOS) {
      // load AOS script dynamically once
      var aosScript = document.createElement("script");
      aosScript.src = "https://unpkg.com/aos@2.3.4/dist/aos.js";
      aosScript.onload = initAOS;
      document.head.appendChild(aosScript);
    } else {
      initAOS();
    }
  })();