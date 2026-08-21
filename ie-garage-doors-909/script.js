/* ============================================================
   [BUSINESS NAME — CONFIRM] — interactions
   With no brand recall, the phone number is the product: it is a plain
   tel: link in the header, the hero, every repair chip, the emergency
   panel and the sticky bar, and none of that depends on JavaScript.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
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

  /* ---------- diagnostic chips: expand AND pre-fill the repair form ---------- */
  (function initDiag() {
    var btns = Array.prototype.slice.call(document.querySelectorAll('.sym-btn'));
    var field = document.getElementById('qSymptom');
    btns.forEach(function (b) {
      var panel = document.getElementById(b.getAttribute('aria-controls'));
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') === 'true';
        b.setAttribute('aria-expanded', open ? 'false' : 'true');
        if (panel) panel.hidden = open;
        if (!open && field) field.value = b.getAttribute('data-symptom') || '';
      });
    });
  })();

  /* ---------- urgency nudge ---------- */
  (function initUrgency() {
    var sel = document.getElementById('urgency');
    var nudge = document.getElementById('urgentNudge');
    if (!sel || !nudge) return;
    function sync() { nudge.classList.toggle('show', sel.value === 'emergency'); }
    sel.addEventListener('change', sync);
    sync();
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

  /* ---------- forms (demo only) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.form'), function (form) {
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
        if (status) status.textContent = 'Enter a valid phone number.';
        return;
      }
      if (bad) { if (status) status.textContent = 'Complete the highlighted fields.'; return; }
      if (status) status.textContent = 'Thanks — demo form, nothing is submitted yet.';
      form.reset();
    });
  });

  /* ---------- year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
