/* Denise Hoekstra — spec mockup interactions (no framework) */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Condensing sticky header + sticky mobile CTA */
  var header = document.querySelector('.site-header');
  var mcta = document.querySelector('.m-cta');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-condensed', y > 24);
    if (mcta) mcta.classList.toggle('show', y > 320);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = doc.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.mnav a').forEach(function (a) {
      a.addEventListener('click', function () {
        doc.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Staggered scroll reveals */
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    var step = parseInt(group.getAttribute('data-stagger'), 10) || 90;
    Array.prototype.forEach.call(group.querySelectorAll(':scope > .reveal, :scope .car-track > .reveal'), function (el, i) {
      el.style.transitionDelay = (i * step) + 'ms';
    });
  });
  var reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduce) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* Count-up — only elements carrying data-count (confirmed figures only) */
  var counters = document.querySelectorAll('[data-count]');
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (reduce) { el.textContent = target; return; }
    var start = null, dur = 1400;
    function tick(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* Hero parallax */
  var heroPhoto = document.querySelector('.hero-photo');
  if (heroPhoto && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < 1000) heroPhoto.style.transform = 'translate3d(0,' + (y * 0.18) + 'px,0)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* Carousels */
  document.querySelectorAll('[data-carousel]').forEach(function (car) {
    var track = car.querySelector('.car-track');
    var slides = track ? track.children : [];
    var prev = car.querySelector('[data-prev]');
    var next = car.querySelector('[data-next]');
    var i = 0;
    function perView() { return window.innerWidth >= 760 ? 2 : 1; }
    function update() {
      var max = Math.max(0, slides.length - perView());
      if (i > max) i = max;
      if (!slides.length) return;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      var offset = i * (slides[0].getBoundingClientRect().width + gap);
      track.style.transform = 'translate3d(' + (-offset) + 'px,0,0)';
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i >= max;
    }
    if (prev) prev.addEventListener('click', function () { i = Math.max(0, i - 1); update(); });
    if (next) next.addEventListener('click', function () { i = i + 1; update(); });
    window.addEventListener('resize', update);
    /* touch swipe */
    var sx = null;
    track.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) { i = dx < 0 ? i + 1 : Math.max(0, i - 1); update(); }
      sx = null;
    });
    update();
  });

  /* Property search — front-end only until an IDX feed exists [CONFIRM MLS/IDX] */
  var search = document.querySelector('[data-search]');
  if (search) {
    search.addEventListener('submit', function (e) {
      e.preventDefault();
      var loc = search.querySelector('[name="location"]').value;
      var base = search.getAttribute('data-base') || '';
      if (loc) { window.location.href = base + 'areas/' + loc + '/index.html'; }
      else { var c = document.getElementById('contact'); if (c) c.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
    });
  }

  /* Mock forms */
  document.querySelectorAll('form[data-mock]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = f.querySelector('.form-ok') || (f.parentNode && f.parentNode.querySelector('.form-ok'));
      if (ok) ok.classList.add('show');
    });
  });

  /* Insights category filter */
  var chips = document.querySelectorAll('[data-filter]');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function (e) {
      e.preventDefault();
      var cat = chip.getAttribute('data-filter');
      chips.forEach(function (c) { c.classList.toggle('active', c === chip); });
      document.querySelectorAll('[data-cat]').forEach(function (card) {
        card.hidden = !(cat === 'all' || card.getAttribute('data-cat') === cat);
      });
    });
  });

  var yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
