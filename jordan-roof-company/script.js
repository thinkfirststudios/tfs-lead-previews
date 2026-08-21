/* Jordan Roof Company — interactions
   Condensing top bar + header · hero parallax · scroll reveals · count-up
   · shingle/tile comparator (drag on desktop, tap-toggle on mobile)
   · gallery filter · FAQ accordion · demo inspection form
   All non-essential motion disabled under prefers-reduced-motion.
*/
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- condensing top bar + header ---------- */
  var topbar = document.getElementById('topbar');
  var head = document.getElementById('siteHead');
  function onScroll() {
    var y = window.scrollY;
    if (topbar) topbar.classList.toggle('shrunk', y > 60);
    if (head) head.classList.toggle('scrolled', y > 12);
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

  /* ---------- shingle vs tile comparator ---------- */
  var cmp = document.querySelector('[data-cmp]');
  if (cmp) {
    var range = cmp.querySelector('.cmp-range');
    var sideB = cmp.querySelector('.cmp-b');
    var line = cmp.querySelector('.cmp-line');

    function paint(v) {
      if (sideB) sideB.style.clipPath = 'inset(0 0 0 ' + v + '%)';
      if (line) line.style.left = v + '%';
    }
    if (range) {
      paint(parseFloat(range.value));
      range.addEventListener('input', function () { paint(parseFloat(range.value)); });

      var dragging = false;
      function fromPointer(x) {
        var r = cmp.getBoundingClientRect();
        var v = Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100));
        range.value = v; paint(v);
      }
      cmp.addEventListener('pointerdown', function (e) {
        if (window.matchMedia('(max-width:1024px)').matches) return; // tap-toggle instead
        dragging = true; cmp.setPointerCapture(e.pointerId); fromPointer(e.clientX);
      });
      cmp.addEventListener('pointermove', function (e) { if (dragging) fromPointer(e.clientX); });
      ['pointerup', 'pointercancel'].forEach(function (ev) {
        cmp.addEventListener(ev, function () { dragging = false; });
      });
    }

    // mobile: tap-to-toggle between the two sides
    var cmpBtns = document.querySelectorAll('.cmp-btn');
    cmpBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        cmpBtns.forEach(function (b) { b.classList.toggle('is-on', b === btn); });
        cmp.classList.toggle('show-b', btn.dataset.side === 'b');
      });
    });
  }

  /* ---------- gallery filter ---------- */
  var fBtns = document.querySelectorAll('.f-btn');
  var gItems = document.querySelectorAll('#gGrid .g-item');
  fBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.f;
      fBtns.forEach(function (b) { b.classList.toggle('is-on', b === btn); });
      gItems.forEach(function (it) {
        it.classList.toggle('hide', f !== 'all' && it.dataset.cat !== f);
      });
    });
  });

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
  var form = document.querySelector('.form');
  if (form) {
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
        status.textContent = 'Thanks — your inspection request is ready. Demo only: this form still needs connecting to the office.';
      } else {
        status.textContent = 'Please add your name and phone so we can call you back.';
        if (firstBad) firstBad.focus();
      }
    });
  }
})();
