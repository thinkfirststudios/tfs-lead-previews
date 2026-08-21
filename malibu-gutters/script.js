/* ============================================================
   Malibu Gutters — interactions
   Spanish-first bilingual site.

   LANGUAGE MODEL (important):
   Spanish and English are two real documents — / (es) and /en/ (en).
   The toggle NAVIGATES between them; it never swaps text in place.
   localStorage remembers the choice and is honoured once per tab
   so a returning English speaker landing on / gets sent to /en/.
   Every string below that is shown to a user is looked up from
   I18N[lang] rather than hard-coded, so the two pages behave the
   same in their own language.
   ============================================================ */
(function () {
  'use strict';

  var LANG = document.documentElement.lang === 'en' ? 'en' : 'es';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var I18N = {
    es: {
      open: 'Abrir menú',
      close: 'Cerrar menú',
      required: 'Complete los campos marcados.',
      badPhone: 'Ingrese un teléfono válido.',
      sent: 'Gracias. Formulario de demostración — todavía no se envía nada.'
    },
    en: {
      open: 'Open menu',
      close: 'Close menu',
      required: 'Please complete the highlighted fields.',
      badPhone: 'Please enter a valid phone number.',
      sent: 'Thank you. Demo form — nothing is submitted yet.'
    }
  };
  var t = I18N[LANG];

  /* ---------- language toggle: real navigation, not a text swap ---------- */
  (function initLang() {
    // Relative hops that work on file://, a GitHub Pages subpath, and a root domain.
    var TO = LANG === 'es' ? { en: 'en/index.html', es: null } : { es: '../index.html', en: null };

    var btns = document.querySelectorAll('.lang-btn');
    Array.prototype.forEach.call(btns, function (b) {
      var target = b.getAttribute('data-lang');
      b.addEventListener('click', function () {
        try { localStorage.setItem('mg-lang', target); } catch (e) {}
        if (target !== LANG && TO[target]) window.location.href = TO[target];
      });
    });

    // Honour a stored preference once per tab, so back-navigation still works.
    var stored;
    try { stored = localStorage.getItem('mg-lang'); } catch (e) { stored = null; }
    var already;
    try { already = sessionStorage.getItem('mg-lang-redirected'); } catch (e) { already = '1'; }
    if (stored && stored !== LANG && !already && TO[stored]) {
      try { sessionStorage.setItem('mg-lang-redirected', '1'); } catch (e) {}
      window.location.replace(TO[stored]);
    }
  })();

  /* ---------- condensing header ---------- */
  var head = document.getElementById('siteHead');
  var onScroll = function () {
    if (head) head.classList.toggle('scrolled', window.scrollY > 24);
    if (heroImg && !reduce) {
      var y = Math.min(window.scrollY, 700);
      heroImg.style.transform = 'translate3d(0,' + (y * 0.14) + 'px,0) scale(1.06)';
    }
  };

  /* ---------- hero parallax ---------- */
  var heroImg = document.getElementById('heroImg');
  if (heroImg && !reduce) heroImg.style.transform = 'scale(1.06)';
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
      burger.setAttribute('aria-label', open ? t.close : t.open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', t.open);
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

  /* ---------- gutter profile picker (ARIA tablist) ---------- */
  (function initProfiles() {
    var btns = Array.prototype.slice.call(document.querySelectorAll('.prof-btn'));
    var title = document.getElementById('pTitle');
    var desc = document.getElementById('pDesc');
    if (!btns.length || !title || !desc) return;

    // The EN page carries data-title-en / data-desc-en; the ES page uses the base pair.
    function field(btn, name) {
      return LANG === 'en'
        ? (btn.getAttribute('data-' + name + '-en') || btn.getAttribute('data-' + name))
        : btn.getAttribute('data-' + name);
    }

    function select(btn) {
      btns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });
      title.textContent = field(btn, 'title');
      desc.textContent = field(btn, 'desc');
    }

    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { select(b); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var next = btns[(i + d + btns.length) % btns.length];
        next.focus();
        select(next);
      });
    });
  })();

  /* ---------- gallery filter ---------- */
  (function initFilter() {
    var btns = document.querySelectorAll('.f-btn');
    var items = document.querySelectorAll('.g-item');
    if (!btns.length) return;
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        Array.prototype.forEach.call(btns, function (x) { x.classList.toggle('is-on', x === b); });
        Array.prototype.forEach.call(items, function (it) {
          it.classList.toggle('hide', f !== 'all' && it.getAttribute('data-cat') !== f);
        });
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

  /* ---------- estimate form (demo only) ---------- */
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
        status.textContent = t.badPhone;
        return;
      }
      if (bad) { status.textContent = t.required; return; }
      status.textContent = t.sent;
      form.reset();
    });
  })();

  /* ---------- year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
