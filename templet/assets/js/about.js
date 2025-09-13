
    /* SNQR About Page JS — AOS init + mobile menu + safe motion */

(function () {
  // Mobile menu toggle (no layout shift)
  const toggle = document.getElementById('menu-toggle');
  const mobNav = document.getElementById('nav-mobile');
  if (toggle && mobNav) {
    toggle.addEventListener('click', () => {
      const isOpen = mobNav.hasAttribute('hidden') ? false : true;
      if (isOpen) {
        mobNav.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        mobNav.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  }

  // AOS with reduced motion respect (per AOS issue #611 + WCAG/MDN)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.AOS) {
    AOS.init({
      duration: reduce ? 0 : 900,
      easing: 'ease-out',
      once: false,
      offset: 60,
      disable: reduce // disables animations if user prefers reduced motion
    });
  }

  // Progressive enhancement: if JS disabled, sections are still fully visible.
})();
