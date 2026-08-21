/* ============================================================
   Jet Painting — interactions
   Two pieces carry this page: the services matrix (an ARIA disclosure
   set, so it works as a stacked accordion on a phone without ever
   becoming a side-scrolling table) and the capability ribbon, which
   highlights the row you are currently reading.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- condensing header + hero parallax ---------- */
  var head = document.getElementById('siteHead');
  var heroImg = document.getElementById('heroImg');
  if (heroImg && !reduce) heroImg.style.transform = 'scale(1.07)';

  function onScroll() {
    if (head) head.classList.toggle('scrolled', window.scrollY > 26);
    if (heroImg && !reduce) {
      var y = Math.min(window.scrollY, 800);
      heroImg.style.transform = 'translate3d(0,' + (y * 0.16) + 'px,0) scale(1.07)';
    }
  }
  window.addEventListener('scroll', function () {
    window.requestAnimationFrame(onScroll);
  }, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Open menu');
      }
    });
  }

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  }

  /* ---------- before / after comparison ----------
     The "after" image is a full-size overlay clipped with inset(), so both
     photos stay in register at every position. Pointer drag moves it; a
     visually-hidden range input gives the same control to the keyboard. */
  Array.prototype.forEach.call(document.querySelectorAll('.ba'), function (ba) {
    var wrap = ba.querySelector('.after-wrap');
    var handle = ba.querySelector('.ba-handle');
    var range = ba.querySelector('.ba-range');
    if (!wrap || !handle) return;

    function set(pct) {
      pct = Math.max(0, Math.min(100, pct));
      wrap.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      handle.style.left = pct + '%';
      if (range && Number(range.value) !== Math.round(pct)) range.value = Math.round(pct);
    }
    function fromEvent(e) {
      var r = ba.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      set((x / r.width) * 100);
    }

    var dragging = false;
    ba.addEventListener('pointerdown', function (e) {
      if (e.target === range) return;
      dragging = true;
      ba.setPointerCapture(e.pointerId);
      fromEvent(e);
    });
    ba.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
    ba.addEventListener('pointerup', function () { dragging = false; });
    ba.addEventListener('pointercancel', function () { dragging = false; });
    if (range) range.addEventListener('input', function () { set(Number(range.value)); });

    set(50);
  });

  /* ---------- gallery filter ---------- */
  (function initFilter() {
    var btns = document.querySelectorAll('.f-btn');
    var items = document.querySelectorAll('.g-item');
    if (!btns.length) return;
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        Array.prototype.forEach.call(btns, function (x) {
          x.classList.toggle('is-on', x === b);
          x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
        });
        Array.prototype.forEach.call(items, function (it) {
          it.classList.toggle('hide', f !== 'all' && it.getAttribute('data-cat') !== f);
        });
      });
    });
  })();

  /* ---------- services matrix (disclosure rows) ---------- */
  (function initMatrix() {
    var rows = Array.prototype.slice.call(document.querySelectorAll('.mx-btn'));
    rows.forEach(function (btn, i) {
      var drawer = document.getElementById(btn.getAttribute('aria-controls'));
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        if (drawer) drawer.hidden = open;
      });
      btn.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        rows[(i + d + rows.length) % rows.length].focus();
      });
    });

    // Deep links from the ribbon open the matching row rather than just scrolling to it.
    function openFromHash() {
      var id = window.location.hash.replace('#', '');
      if (!id) return;
      var row = document.getElementById(id);
      if (!row || !row.classList.contains('mx-row')) return;
      var btn = row.querySelector('.mx-btn');
      if (btn && btn.getAttribute('aria-expanded') !== 'true') btn.click();
    }
    window.addEventListener('hashchange', openFromHash);
    openFromHash();
  })();

  /* ---------- capability ribbon: highlight the row in view ---------- */
  (function initRibbon() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.ribbon a'));
    var rows = Array.prototype.slice.call(document.querySelectorAll('.mx-row'));
    if (!links.length || !rows.length || !('IntersectionObserver' in window)) return;
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        links.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    rows.forEach(function (r) { ro.observe(r); });
  })();

  /* ---------- FAQ accordion ---------- */
  (function initAcc() {
    var btns = Array.prototype.slice.call(document.querySelectorAll('.acc-btn'));
    btns.forEach(function (b, i) {
      var panel = document.getElementById(b.getAttribute('aria-controls'));
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') === 'true';
        b.setAttribute('aria-expanded', open ? 'false' : 'true');
        if (panel) panel.hidden = open;
      });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        btns[(i + d + btns.length) % btns.length].focus();
      });
    });
  })();

  /* ---------- quote form (demo only) ---------- */
  (function initForm() {
    var form = document.querySelector('.form');
    if (!form) return;
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = false;
      Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (f) {
        var empty = !f.value.trim();
        f.classList.toggle('invalid', empty);
        if (empty) bad = true;
      });
      var tel = form.querySelector('input[type="tel"]');
      if (!bad && tel && tel.value.replace(/\D/g, '').length < 10) {
        tel.classList.add('invalid');
        status.textContent = 'Enter a valid phone number.';
        return;
      }
      if (bad) { status.textContent = 'Complete the highlighted fields.'; return; }
      status.textContent = 'Thanks — demo form, nothing is submitted yet.';
      form.reset();
    });
  })();

  /* ---------- count-up (only where a real number exists) ---------- */
  (function initCount() {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
      return;
    }
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        co.unobserve(el);
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (isNaN(target)) return;
        var start = null;
        function tick(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / 900, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) window.requestAnimationFrame(tick);
        }
        window.requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { co.observe(el); });
  })();

  /* ---------- year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
