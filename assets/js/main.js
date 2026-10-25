/* Port Angeles Counselor: minimal progressive enhancement. Site works without JS. */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); toggle.focus(); }
    });
  }

  // Header shadow on scroll
  var header = document.querySelector('.site-header');
  var zoomImg = document.querySelector('.approach-frame img');
  var approach = document.getElementById('approach');
  var ticking = false;
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
    // Gentle zoom-out on the sticky image as the approach section scrolls
    if (!reduce && zoomImg && approach) {
      var r = approach.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
      zoomImg.style.setProperty('--zoom', (1.08 - 0.08 * p).toFixed(4));
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Scroll reveal: FAIL-SAFE.
  // Content is visible by default. Elements are only hidden (.reveal-pending) when:
  // IntersectionObserver exists, motion is allowed, this is not an automated/headless
  // browser, and the element starts below the fold. Several independent paths reveal them.
  var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var automated = navigator.webdriver || /bot|crawl|spider|slurp|lighthouse|headless/i.test(navigator.userAgent);
  if (!reduce && !automated && 'IntersectionObserver' in window) {
    var pending = [];
    var show = function (el) { el.classList.remove('reveal-pending'); };
    var vh = window.innerHeight || document.documentElement.clientHeight;
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top > vh * 0.92) { el.classList.add('reveal-pending'); pending.push(el); }
    });
    try {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
      pending.forEach(function (el) { io.observe(el); });
    } catch (e) { pending.forEach(show); }
    // Fallback 1: on scroll, reveal anything that has entered or passed the viewport.
    var sweep = function () {
      var h = window.innerHeight;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top < h) { show(el); return false; }
        return true;
      });
      if (!pending.length) window.removeEventListener('scroll', sweep);
    };
    window.addEventListener('scroll', sweep, { passive: true });
    // Fallback 2: printing, or jumping via a link/hash, reveals everything.
    var showAll = function () { pending.forEach(show); pending = []; };
    window.addEventListener('beforeprint', showAll);
    window.addEventListener('hashchange', showAll);
  }

  // Active nav link
  var links = document.querySelectorAll('.site-nav a[href^="#"]');
  if ('IntersectionObserver' in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (a) { a.classList.remove('active'); a.removeAttribute('aria-current'); });
          map[en.target.id].classList.add('active'); map[en.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  // Open <details> notices when linked (footer links or #hash on load)
  function openFromHash(hash) {
    if (!hash) return;
    var el = document.getElementById(hash.replace('#', ''));
    if (el && el.tagName === 'DETAILS') { el.open = true; }
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function () { openFromHash(a.getAttribute('href')); });
  });
  openFromHash(location.hash);
  window.addEventListener('hashchange', function () { openFromHash(location.hash); });

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
