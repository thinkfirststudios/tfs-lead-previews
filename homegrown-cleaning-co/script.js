/* ============================================================
   Homegrown Cleaning Co. — interactions
   Light by design. The two things that actually convert — the tel:
   link and the sms: link — work with JavaScript switched off. JS only
   adds the reveals, the accordion, and the "Ask about this" deep-link
   that pre-selects a service in the estimate form.
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

  /* ---------- emergency urgency nudge ----------
     Selecting "Emergency" surfaces a call prompt, because for this trade a
     typed form is the slower path and pretending otherwise costs the job. */
  (function initUrgency() {
    var sel = document.getElementById('urgency');
    var nudge = document.getElementById('urgentNudge');
    if (!sel || !nudge) return;
    function sync() { nudge.classList.toggle('show', sel.value === 'emergency'); }
    sel.addEventListener('change', sync);
    sync();
  })();

  /* ---------- service request form (demo only) ---------- */
  (function initForm() {
    var form = document.getElementById('estForm');
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

  /* ---------- service cards pre-select the estimate form ---------- */
  (function initAsk() {
    var field = document.getElementById('serviceField');
    Array.prototype.forEach.call(document.querySelectorAll('.svc-ask'), function (b) {
      b.addEventListener('click', function () {
        if (field) field.value = b.getAttribute('data-service') || '';
        var target = document.getElementById('estimate');
        if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      });
    });
  })();

  /* ---------- year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
