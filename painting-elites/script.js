/* ============================================================
   Painting Elites — interactions
   The portfolio lightbox is the piece that matters: it is the thing
   their current one-pager cannot do, so it is fully keyboard-operable
   (Esc, arrow keys, focus restored to the tile that opened it).
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

  /* ---------- portfolio filter + lightbox ---------- */
  (function initPortfolio() {
    var grid = document.getElementById('pGrid');
    if (!grid) return;
    var items = Array.prototype.slice.call(grid.querySelectorAll('.p-item'));
    var fbtns = document.querySelectorAll('.f-btn');

    Array.prototype.forEach.call(fbtns, function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        Array.prototype.forEach.call(fbtns, function (x) {
          x.classList.toggle('is-on', x === b);
          x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
        });
        items.forEach(function (it) {
          it.classList.toggle('hide', f !== 'all' && it.getAttribute('data-cat') !== f);
        });
      });
    });

    var lb = document.getElementById('lb');
    var lbImg = document.getElementById('lbImg');
    var lbCap = document.getElementById('lbCap');
    if (!lb) return;
    var idx = 0;
    var opener = null;

    function visible() { return items.filter(function (i) { return !i.classList.contains('hide'); }); }

    function show(i) {
      var list = visible();
      if (!list.length) return;
      idx = (i + list.length) % list.length;
      var it = list[idx];
      var img = it.querySelector('img');
      lbImg.src = it.getAttribute('data-full') || img.src;
      lbImg.alt = img.alt;
      var cap = it.querySelector('.p-cap');
      lbCap.textContent = cap ? cap.textContent.replace(/\s+/g, ' ').trim() : '';
    }

    function open(it) {
      opener = it;
      show(visible().indexOf(it));
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      document.getElementById('lbClose').focus();
    }
    function close() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
      if (opener) opener.focus();
    }

    items.forEach(function (it) {
      it.addEventListener('click', function () { open(it); });
    });
    document.getElementById('lbClose').addEventListener('click', close);
    document.getElementById('lbPrev').addEventListener('click', function () { show(idx - 1); });
    document.getElementById('lbNext').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
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
        status.textContent = 'Please enter a valid phone number.';
        return;
      }
      if (bad) { status.textContent = 'Please complete the highlighted fields.'; return; }
      status.textContent = 'Thank you — demo form, nothing is submitted yet.';
      form.reset();
    });
  })();

  /* ---------- year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
