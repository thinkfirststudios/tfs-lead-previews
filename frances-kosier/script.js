/* Frances Kosier — spec mockup interactions. Content stays visible without JS (reveal hiding is gated on html.js). */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Condensing sticky header + mobile CTA visibility */
  var header = document.querySelector('.site-header');
  var mcta = document.querySelector('.mcta');
  var heroMedia = document.querySelector('.hero-media');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', y > 40);
    if (mcta) mcta.classList.toggle('show', y > 420);
    if (heroMedia && !reduce && y < window.innerHeight * 1.2) {
      heroMedia.style.transform = 'translate3d(0,' + (y * 0.28).toFixed(1) + 'px,0)';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = doc.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.mobile-menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        doc.classList.remove('menu-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { doc.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* Scroll reveals with stagger: children of [data-stagger] get --d delays */
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    var step = parseInt(group.getAttribute('data-stagger'), 10) || 90;
    Array.prototype.forEach.call(group.querySelectorAll(':scope > .reveal, :scope > * > .reveal'), function (el, i) {
      el.style.setProperty('--d', (i * step) + 'ms');
    });
  });
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* Count-up — ONLY for figures she has confirmed (data-confirmed="true").
     Every figure is currently [CONFIRM], so they sit static until she signs them off. */
  var counters = document.querySelectorAll('[data-count][data-confirmed="true"]');
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (reduce) { el.textContent = target; return; }
    var start = null, dur = 1400;
    function frame(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (counters.length && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* Carousels */
  document.querySelectorAll('.carousel').forEach(function (car) {
    var track = car.querySelector('.track');
    var prev = car.querySelector('[data-dir="prev"]');
    var next = car.querySelector('[data-dir="next"]');
    function step(dir) {
      var item = track.firstElementChild;
      var w = item ? item.getBoundingClientRect().width + 18 : track.clientWidth;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
  });

  /* Heart toggles */
  document.querySelectorAll('.heart').forEach(function (h) {
    h.addEventListener('click', function (e) {
      e.preventDefault();
      h.setAttribute('aria-pressed', h.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
  });

  /* Mockup forms — no submission */
  document.querySelectorAll('form[data-mock]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = f.querySelector('.form-msg');
      if (msg) { msg.hidden = false; }
    });
  });

  var yr = document.querySelectorAll('[data-year]');
  yr.forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
