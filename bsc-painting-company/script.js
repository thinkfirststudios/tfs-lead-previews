/* ============================================================
   BSC Painting Company — interactions
   Deliberately light. The primary conversion path on this page is an
   sms: link, which needs no JavaScript at all — so nothing here is
   load-bearing for booking a job.
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

  /* ---------- year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
