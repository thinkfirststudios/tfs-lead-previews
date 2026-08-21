/* A.L. Windows & Doors Solutions — interactions
   Condensing header · hero parallax · scroll reveals
   · window & door style pickers (ARIA tablists, arrow-key navigable)
   · FAQ accordion · demo estimate forms
   NOTE: this business has no phone number, so there is no call CTA anywhere.
   All non-essential motion disabled under prefers-reduced-motion.
*/
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- condensing top bar + header ---------- */
  var head = document.getElementById('siteHead');
  function onScroll() {
    if (head) head.classList.toggle('scrolled', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  /* ---------- hero parallax ---------- */
  var heroImg = document.getElementById('heroImg');
  if (heroImg && !reduced) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          heroImg.style.transform = 'translate3d(0,' + (y * 0.16).toFixed(1) + 'px,0) scale(1.06)';
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- count-up ---------- */
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    if (!el.dataset.count || isNaN(target) || target <= 0) return;
    var suffix = el.dataset.suffix || '';
    if (reduced) { el.textContent = target + suffix; return; }
    var dur = 1300, start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  var nums = document.querySelectorAll('.cnt');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
    nums.forEach(countUp);
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });

    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); nio.unobserve(en.target); } });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { nio.observe(el); });
  }

  /* ---------- window & door style pickers ----------
     Each tile swaps the panel photo, heading and description. Built as a real
     ARIA tablist so it is keyboard operable, not just clickable. */
  function initPicker(tilesSel, imgId, titleId, descId) {
    var tiles = Array.prototype.slice.call(document.querySelectorAll(tilesSel));
    var img = document.getElementById(imgId);
    var title = document.getElementById(titleId);
    var desc = document.getElementById(descId);
    if (!tiles.length || !img) return;

    function select(tile) {
      tiles.forEach(function (t) {
        var on = t === tile;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      img.src = tile.dataset.img;
      img.alt = tile.dataset.alt || '';
      if (title) title.textContent = tile.dataset.title || '';
      if (desc) desc.textContent = tile.dataset.desc || '';
    }
    tiles.forEach(function (tile, i) {
      tile.addEventListener('click', function () { select(tile); });
      tile.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tiles[(i + 1) % tiles.length];
        else if (e.key === 'ArrowLeft') next = tiles[(i - 1 + tiles.length) % tiles.length];
        else if (e.key === 'Home') next = tiles[0];
        else if (e.key === 'End') next = tiles[tiles.length - 1];
        if (next) { e.preventDefault(); select(next); next.focus(); }
      });
    });
  }
  initPicker('#windows .tile', 'wImg', 'wTitle', 'wDesc');
  initPicker('#doors .tile', 'dImg', 'dTitle', 'dDesc');

  /* ---------- FAQ accordion ---------- */
  var accBtns = document.querySelectorAll('.acc-btn');
  accBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      accBtns.forEach(function (o) {
        if (o !== btn && o.getAttribute('aria-expanded') === 'true') {
          o.setAttribute('aria-expanded', 'false');
          var op = document.getElementById(o.getAttribute('aria-controls'));
          if (op) op.hidden = true;
        }
      });
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (panel) panel.hidden = open;
    });
  });
  var accList = Array.prototype.slice.call(accBtns);
  accList.forEach(function (btn, i) {
    btn.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowDown') next = accList[(i + 1) % accList.length];
      else if (e.key === 'ArrowUp') next = accList[(i - 1 + accList.length) % accList.length];
      if (next) { e.preventDefault(); next.focus(); }
    });
  });

  /* ---------- demo inspection form ---------- */
  document.querySelectorAll('.form, .quickform').forEach(function (form) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, firstBad = null;
      form.querySelectorAll('[required]').forEach(function (f) {
        var bad = !f.value.trim();
        f.classList.toggle('invalid', bad);
        f.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad) { ok = false; if (!firstBad) firstBad = f; }
      });
      if (!status) return;
      if (ok) {
        status.textContent = 'Thanks — your estimate request is ready. Demo only: this form needs an email address before it can send.';
      } else {
        status.textContent = 'Please complete the required fields so we can send your estimate.';
        if (firstBad) firstBad.focus();
      }
    });
  });
})();
