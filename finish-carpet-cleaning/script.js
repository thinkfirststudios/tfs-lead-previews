/* ============================================================
   Finish Carpet Cleaning — interactions

   LANGUAGE MODEL: / is English, /es/ is Spanish — two real documents.
   The toggle NAVIGATES between them and remembers the choice; it is
   never a JavaScript text swap. Every user-facing string below is
   looked up from I18N[lang] so both pages behave identically in their
   own language.

   The before/after sliders are the product. Touch, mouse and keyboard
   all drive the same setter, and the auto-nudge that signals
   interactivity is suppressed under prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  var LANG = document.documentElement.lang === 'es' ? 'es' : 'en';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var I18N = {
    en: {
      open: 'Open menu', close: 'Close menu',
      required: 'Please complete the highlighted fields.',
      badPhone: 'Please enter a valid phone number.',
      consent: 'Please agree to be contacted about your request.',
      sent: 'Thank you — demo form, nothing is submitted yet.'
    },
    es: {
      open: 'Abrir menú', close: 'Cerrar menú',
      required: 'Complete los campos marcados.',
      badPhone: 'Ingrese un teléfono válido.',
      consent: 'Acepte que le contactemos sobre su solicitud.',
      sent: 'Gracias — formulario de demostración, todavía no se envía nada.'
    }
  };
  var t = I18N[LANG];

  /* ---------- language toggle: real navigation ---------- */
  (function initLang() {
    var TO = LANG === 'en' ? { es: 'es/index.html', en: null } : { en: '../index.html', es: null };
    Array.prototype.forEach.call(document.querySelectorAll('.lang-btn'), function (b) {
      var target = b.getAttribute('data-lang');
      b.addEventListener('click', function () {
        try { localStorage.setItem('fcc-lang', target); } catch (e) {}
        if (target !== LANG && TO[target]) window.location.href = TO[target];
      });
    });
    var stored, already;
    try { stored = localStorage.getItem('fcc-lang'); } catch (e) { stored = null; }
    try { already = sessionStorage.getItem('fcc-lang-redirected'); } catch (e) { already = '1'; }
    if (stored && stored !== LANG && !already && TO[stored]) {
      try { sessionStorage.setItem('fcc-lang-redirected', '1'); } catch (e) {}
      window.location.replace(TO[stored]);
    }
  })();

  /* ---------- condensing header ---------- */
  var head = document.getElementById('siteHead');
  window.addEventListener('scroll', function () {
    window.requestAnimationFrame(function () {
      if (head) head.classList.toggle('scrolled', window.scrollY > 24);
    });
  }, { passive: true });

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? t.close : t.open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
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

  /* ---------- before / after sliders ---------- */
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
      dragging = true; ba.setPointerCapture(e.pointerId); fromEvent(e);
    });
    ba.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
    ba.addEventListener('pointerup', function () { dragging = false; });
    ba.addEventListener('pointercancel', function () { dragging = false; });
    if (range) range.addEventListener('input', function () { set(Number(range.value)); });
    set(50);

    /* a small nudge on first view signals the handle is draggable —
       suppressed entirely under reduced motion */
    if (!reduce && ba.id === 'heroBa' && 'IntersectionObserver' in window) {
      var nudged = false;
      var nio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting || nudged) return;
          nudged = true; nio.disconnect();
          var start = null;
          function step(ts) {
            if (start === null) start = ts;
            var p = Math.min((ts - start) / 1400, 1);
            // ease out to 62%, then settle back to 50%
            var v = p < .5 ? 50 + 12 * (p / .5) : 62 - 12 * ((p - .5) / .5);
            set(v);
            if (p < 1) window.requestAnimationFrame(step);
          }
          window.requestAnimationFrame(step);
        });
      }, { threshold: 0.4 });
      nio.observe(ba);
    }
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

  /* ---------- service cards tick the matching box in the quote form ---------- */
  (function initServiceLinks() {
    var map = {
      carpet: 'svcCarpet', upholstery: 'svcUpholstery', tile: 'svcTile',
      repair: 'svcRepair', stretching: 'svcStretching'
    };
    Array.prototype.forEach.call(document.querySelectorAll('.svc-quote'), function (b) {
      b.addEventListener('click', function () {
        var box = document.getElementById(map[b.getAttribute('data-service')]);
        if (box) box.checked = true;
        var target = document.getElementById('quote');
        if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      });
    });
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
    var form = document.getElementById('quoteForm');
    if (!form) return;
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = false;
      Array.prototype.forEach.call(form.querySelectorAll('input[required]:not([type=checkbox])'), function (f) {
        var empty = !f.value.trim();
        f.classList.toggle('invalid', empty);
        if (empty) bad = true;
      });
      var tel = form.querySelector('input[type="tel"]');
      if (!bad && tel && tel.value.replace(/\D/g, '').length < 10) {
        tel.classList.add('invalid');
        status.textContent = t.badPhone;
        return;
      }
      if (bad) { status.textContent = t.required; return; }
      var consent = form.querySelector('input[name="consent"]');
      if (consent && !consent.checked) { status.textContent = t.consent; return; }
      status.textContent = t.sent;
      form.reset();
    });
  })();

  /* ---------- year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
