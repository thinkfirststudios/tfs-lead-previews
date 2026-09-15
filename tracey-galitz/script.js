/* Tracey Galitz — spec mockup interactions.
   Content is visible without JS: reveal-hiding CSS only applies under html.js,
   and a fail-safe below reveals everything for previews, screenshots and print. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduce = !!(mq && mq.matches);
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Condensing header + mobile CTA (slides up after hero, hides on scroll-down) ---------- */
  var header = $('.site-header');
  var mcta = $('.mcta');
  var heroEl = $('.hero') || $('.phero');
  var lastY = window.scrollY || 0, ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    if (header) header.classList.toggle('scrolled', y > 30);
    if (mcta) {
      var heroBottom = heroEl ? heroEl.offsetHeight * 0.8 : 400;
      var goingUp = y < lastY;
      mcta.classList.toggle('show', y > heroBottom && (goingUp || y - lastY < 4));
    }
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = $('.burger');
  function setMenu(open) {
    doc.classList.toggle('menu-open', open);
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (burger) {
    burger.addEventListener('click', function () { setMenu(!doc.classList.contains('menu-open')); });
    $$('.mobile-menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- Hero four-season cross-dissolve (opacity only; autumn under reduced motion) ---------- */
  var plates = $$('.hero-plates img');
  var ticks = $$('.seasons-ticker li');
  if (plates.length > 1) {
    var idx = 0;
    plates.forEach(function (p, i) { if (p.classList.contains('on')) idx = i; });
    var show = function (i) {
      plates.forEach(function (p, k) { p.classList.toggle('on', k === i); });
      ticks.forEach(function (t, k) {
        t.classList.remove('on');
        if (k === i) { void t.offsetWidth; t.classList.add('on'); }
      });
    };
    if (!reduce) {
      /* start on the plate already shown in markup (autumn) so there is no load flash */
      show(idx);
      setInterval(function () {
        if (document.hidden) return;
        idx = (idx + 1) % plates.length; show(idx);
      }, 9000);
    } else {
      plates.forEach(function (p) { p.classList.toggle('on', p.classList.contains('autumn')); });
      ticks.forEach(function (t) { t.classList.toggle('on', t.getAttribute('data-season') === 'autumn'); });
    }
  }

  /* ---------- Scroll reveals with stagger ---------- */
  $$('[data-stagger]').forEach(function (group) {
    var step = parseInt(group.getAttribute('data-stagger'), 10) || 100;
    $$('.reveal', group).forEach(function (el, i) { el.style.setProperty('--d', (i * step) + 'ms'); });
  });
  var reveals = $$('.reveal');
  var io = null;
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-ups: ONLY figures marked data-confirmed="true". None are confirmed yet. ---------- */
  function finalValue(el) { el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || ''); }
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce || isNaN(target)) { finalValue(el); return; }
    var start = null, dur = 1600;
    function frame(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = $$('[data-count][data-confirmed="true"]');
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  } else { counters.forEach(finalValue); }
  window.__tgFinalCounts = function () { counters.forEach(finalValue); };

  /* ---------- Tabs (two-state track + contact two doors) ---------- */
  $$('[data-tabs]').forEach(function (wrap) {
    var tabs = $$('[role="tab"]', wrap);
    var list = $('[role="tablist"]', wrap);
    function activate(i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.setAttribute('tabindex', on ? '0' : '-1');
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (list) list.setAttribute('data-active', String(i));
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { activate(i); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          activate((i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length, true);
        }
      });
    });
    $$('[data-open-tab]').forEach(function (a) {
      a.addEventListener('click', function () {
        var n = parseInt(a.getAttribute('data-open-tab'), 10);
        var target = a.getAttribute('data-tab-group');
        if (!target || wrap.id === target) activate(n);
      });
    });
    /* hash like #contact-hr opens the second door */
    if (wrap.hasAttribute('data-hash-open') && location.hash === wrap.getAttribute('data-hash-open')) activate(1);
  });

  /* ---------- Carousels ---------- */
  $$('.carousel').forEach(function (car) {
    var track = $('.track', car);
    var prev = $('[data-dir="prev"]', car), next = $('[data-dir="next"]', car);
    if (!track) return;
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    }
    function step(dir) {
      var item = track.firstElementChild;
      var w = item ? item.getBoundingClientRect().width + 18 : track.clientWidth;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Hearts ---------- */
  $$('.heart').forEach(function (h) {
    h.addEventListener('click', function (e) {
      e.preventDefault();
      h.setAttribute('aria-pressed', h.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
  });

  /* ---------- Mock forms — nothing is submitted ---------- */
  $$('form[data-mock]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = $('.form-msg', f);
      if (msg) msg.hidden = false;
    });
  });

  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();

/* ---------- Reveal fail-safe ----------
   CRM iframe previews, thumbnails, screenshot tools and fast jumps never trigger the
   observer, so hidden-until-scrolled content would render as blank space. */
(function () {
  function revealAll() {
    var els = document.querySelectorAll('.reveal');
    for (var i = 0; i < els.length; i++) els[i].classList.add('in');
    if (window.__tgFinalCounts) window.__tgFinalCounts();
  }
  function start() {
    var inFrame = false;
    try { inFrame = window.self !== window.top; } catch (e) { inFrame = true; }
    if (inFrame || navigator.webdriver) { revealAll(); return; }
    var scrolled = false;
    window.addEventListener('scroll', function () { scrolled = true; }, { passive: true, once: true });
    setTimeout(function () { if (!scrolled) revealAll(); }, 2500);
    window.addEventListener('beforeprint', revealAll);
    window.addEventListener('hashchange', revealAll);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
