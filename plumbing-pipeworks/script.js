/* ============================================================
   Plumbing Pipeworks — interactions
   Three site-specific pieces: the symptom triage chips (which scroll to
   the right explainer AND pre-fill the booking form), the equipment rail
   progress indicator, and the bill-comparison widget — which computes a
   percentage difference and nothing else. It deliberately produces no
   gallons, no dollars and no savings estimate.
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
    var sel = document.getElementById('ptype');
    var nudge = document.getElementById('urgentNudge');
    if (!sel || !nudge) return;
    function sync() { nudge.classList.toggle('show', sel.value === 'emergency'); }
    sel.addEventListener('change', sync);
    sync();
  })();

  /* ---------- service request form (demo only) ---------- */
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

  /* ---------- symptom triage: scroll AND pre-fill the booking form ---------- */
  (function initTriage() {
    var wrap = document.getElementById('triage');
    var field = document.getElementById('symptomField');
    if (!wrap) return;
    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-symptom]');
      if (!btn) return;
      if (field) field.value = btn.getAttribute('data-symptom');
      var target = document.querySelector(btn.getAttribute('data-go'));
      if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  })();

  /* ---------- cutaway hotspots ---------- */
  (function initHotspots() {
    var map = {
      '1': '#method', '2': '#slab', '3': '#method', '4': '#irrigation', '5': '#method'
    };
    Array.prototype.forEach.call(document.querySelectorAll('.hotspot'), function (h) {
      function go() {
        var n = h.querySelector('text');
        var target = document.querySelector(map[n ? n.textContent.trim() : ''] || '#method');
        if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
      h.addEventListener('click', go);
      h.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
    });
  })();

  /* ---------- equipment rail progress ---------- */
  (function initRail() {
    var rail = document.getElementById('rail');
    var bar = document.getElementById('railBar');
    if (!rail || !bar) return;
    function sync() {
      var max = rail.scrollWidth - rail.clientWidth;
      var frac = rail.clientWidth / rail.scrollWidth;
      bar.style.width = Math.max(frac * 100, 8) + '%';
      var pct = max > 0 ? rail.scrollLeft / max : 0;
      bar.style.transform = 'translateX(' + (pct * (100 / Math.max(frac, .08) - 100)) + '%)';
    }
    rail.addEventListener('scroll', function () { window.requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  })();

  /* ---------- bill comparison ----------
     Percentage difference between two figures the visitor already has.
     No gallons, no dollars, no savings claim — the output is a prompt to
     book an inspection, never a quantified promise. */
  (function initBill() {
    var a = document.getElementById('billA');
    var b = document.getElementById('billB');
    var delta = document.getElementById('bwDelta');
    var msg = document.getElementById('bwMsg');
    if (!a || !b || !delta || !msg) return;

    function render() {
      var va = parseFloat(a.value), vb = parseFloat(b.value);
      if (isNaN(va) || isNaN(vb) || va <= 0) {
        delta.textContent = '—';
        delta.classList.remove('up');
        msg.textContent = 'Enter both figures to compare them.';
        return;
      }
      var pct = ((vb - va) / va) * 100;
      var sign = pct > 0 ? '+' : '';
      delta.textContent = sign + pct.toFixed(0) + '%';
      delta.classList.toggle('up', pct >= 25);
      if (pct >= 25) {
        msg.textContent = 'That is a large jump with no obvious explanation. Worth booking an inspection.';
      } else if (pct > 0) {
        msg.textContent = 'Higher, but within the range season and usage can account for. Worth watching the meter with everything off.';
      } else {
        msg.textContent = 'No increase between these two bills.';
      }
    }
    a.addEventListener('input', render);
    b.addEventListener('input', render);
  })();

  /* ---------- year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
