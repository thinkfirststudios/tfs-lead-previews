/* ============================================================================
   Martha Rangel, Realtor — interactions
   Shared by both language documents.

   LANGUAGE MODEL — worth stating plainly because it is the part people get
   wrong: there is no runtime translation here. Spanish (/) and English
   (/en/) are two real documents with reciprocal hreflang, and the ES|EN
   control is a link, not a button. Nothing on the page is swapped by script.

   What this file does about language is only this: it remembers which
   document you chose, and — once per tab — offers to put you back on it. It
   never redirects silently more than once, because a page that keeps moving
   you is worse than one that doesn't remember you at all.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var LANG = document.documentElement.lang === 'en' ? 'en' : 'es';
  var KEY = 'mr-lang';
  var GUARD = 'mr-lang-checked';

  /* --------------------------------------------------------------------------
     Remember the reader's choice when they use the toggle.
     -------------------------------------------------------------------------- */
  (function initLang() {
    var links = document.querySelectorAll('[data-lang-link]');
    Array.prototype.forEach.call(links, function (a) {
      a.addEventListener('click', function () {
        try { window.localStorage.setItem(KEY, a.getAttribute('data-lang-link')); } catch (e) { /* private mode */ }
      });
    });

    /* Honour a stored preference at most once per tab. */
    var checked = null, stored = null;
    try {
      checked = window.sessionStorage.getItem(GUARD);
      stored = window.localStorage.getItem(KEY);
    } catch (e) { return; }

    if (checked) return;
    try { window.sessionStorage.setItem(GUARD, '1'); } catch (e) { /* no-op */ }

    if (!stored || stored === LANG) return;

    var target = stored === 'en' ? 'en/index.html' : '../index.html';
    /* Only move if the target actually differs from where we are. */
    if ((stored === 'en' && LANG === 'es') || (stored === 'es' && LANG === 'en')) {
      window.location.replace(target);
    }
  })();

  /* --------------------------------------------------------------------------
     Header condense
     -------------------------------------------------------------------------- */
  (function initHead() {
    var head = document.getElementById('siteHead');
    if (!head) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        head.classList.toggle('condensed', window.pageYOffset > 60);
        ticking = false;
      });
    }, { passive: true });
  })();

  /* --------------------------------------------------------------------------
     Mobile nav
     -------------------------------------------------------------------------- */
  (function initNav() {
    var burger = document.getElementById('burger');
    var nav = document.getElementById('mobileNav');
    if (!burger || !nav) return;

    var openLabel = burger.getAttribute('aria-label');
    var closeLabel = LANG === 'en' ? 'Close menu' : 'Cerrar menú';

    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? closeLabel : openLabel);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', openLabel);
      }
    });
  })();

  /* --------------------------------------------------------------------------
     FAQ accordion
     -------------------------------------------------------------------------- */
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

  /* --------------------------------------------------------------------------
     Contact form — demo only, messages in the page's own language
     -------------------------------------------------------------------------- */
  (function initForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var status = document.getElementById('contactStatus');
    if (!status) return;

    var MSG = LANG === 'en' ? {
      missing: 'Please complete the highlighted fields.',
      phone: 'That phone number looks short.',
      ok: 'Demo form — nothing is submitted. [CONFIRM form endpoint.]'
    } : {
      missing: 'Por favor complete los campos marcados.',
      phone: 'Ese número de teléfono parece incompleto.',
      ok: 'Formulario de muestra — no se envía nada. [CONFIRM form endpoint.]'
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.classList.remove('err');

      var bad = false;
      Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (f) {
        var empty = !f.value.trim();
        f.classList.toggle('invalid', empty);
        if (empty) bad = true;
      });

      var tel = form.querySelector('input[type="tel"]');
      if (!bad && tel && tel.value.replace(/\D/g, '').length < 10) {
        tel.classList.add('invalid');
        status.textContent = MSG.phone;
        status.classList.add('err');
        return;
      }

      if (bad) {
        status.textContent = MSG.missing;
        status.classList.add('err');
        return;
      }

      status.textContent = MSG.ok;
      form.reset();
    });
  })();

  /* --------------------------------------------------------------------------
     Scroll reveals
     -------------------------------------------------------------------------- */
  (function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (reduce || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(els, function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  })();

  /* --------------------------------------------------------------------------
     Year
     -------------------------------------------------------------------------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

})();
