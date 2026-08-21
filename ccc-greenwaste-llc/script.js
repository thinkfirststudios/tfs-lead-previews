/* ============================================================================
   CCC Greenwaste LLC — interactions

   Three things matter here, in this order:

   1. THE OPEN/CLOSED INDICATOR. A yard with wrong hours on the internet gets
      someone loading a trailer and driving out to a locked gate. It is driven
      by the single HOURS block below and nothing else in the site hardcodes a
      time. Change it in one place and the bar, the message and the "opens
      Monday at 7AM" copy all follow.

   2. THE PATH CHOICE. Dumping and buying are opposite jobs. Choosing a path
      stores a preference and reorders the two tracks so the chosen audience
      leads. The other track is never hidden — it moves, it doesn't disappear.

   3. THE CALCULATOR. The main reason people buy bagged instead of bulk is not
      knowing how much to order. It computes volume only, never a price.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     HOURS — the one place opening times are defined.
     Confirmed from the lead data: Monday–Friday, 7AM–4PM.

     open/close are 24-hour decimal hours (7 = 7AM, 16 = 4PM).
     days: 0 = Sunday … 6 = Saturday. Absent day = closed.

     To add Saturday once confirmed:   6: { open: 8, close: 12 }
     To post a holiday closure, add the date to `closures` as 'YYYY-MM-DD'.
     ========================================================================== */
  var HOURS = {
    label: 'Mon–Fri 7AM–4PM',
    days: {
      1: { open: 7, close: 16 },   // Monday
      2: { open: 7, close: 16 },
      3: { open: 7, close: 16 },
      4: { open: 7, close: 16 },
      5: { open: 7, close: 16 }    // Friday
      // 6: Saturday — [CONFIRM]
      // 0: Sunday — closed
    },
    closures: []                   // e.g. '2026-12-25' — [CONFIRM holiday schedule]
  };

  var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function hourLabel(h) {
    var suffix = h >= 12 ? 'PM' : 'AM';
    var display = h % 12;
    if (display === 0) display = 12;
    var mins = Math.round((h - Math.floor(h)) * 60);
    return display + (mins ? ':' + (mins < 10 ? '0' : '') + mins : '') + suffix;
  }

  function isoDate(d) {
    return d.getFullYear() + '-' +
      ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
      ('0' + d.getDate()).slice(-2);
  }

  function openOn(d) {
    if (HOURS.closures.indexOf(isoDate(d)) !== -1) return null;
    return HOURS.days[d.getDay()] || null;
  }

  (function initStatus() {
    var wrap = document.getElementById('status');
    var text = document.getElementById('statusText');
    if (!wrap || !text) return;

    function paint() {
      var now = new Date();
      var today = openOn(now);
      var nowHours = now.getHours() + now.getMinutes() / 60;

      if (today && nowHours >= today.open && nowHours < today.close) {
        wrap.className = 'status open';
        text.textContent = 'Open now — closes at ' + hourLabel(today.close);
        return;
      }

      /* Not open. Find the next day that is — including later today. */
      if (today && nowHours < today.open) {
        wrap.className = 'status closed';
        text.textContent = 'Closed — opens today at ' + hourLabel(today.open);
        return;
      }

      var probe = new Date(now.getTime());
      for (var i = 1; i <= 7; i++) {
        probe.setDate(probe.getDate() + 1);
        var next = openOn(probe);
        if (next) {
          var when = (i === 1) ? 'tomorrow' : DAY_NAMES[probe.getDay()];
          wrap.className = 'status closed';
          text.textContent = 'Closed — opens ' + when + ' at ' + hourLabel(next.open);
          return;
        }
      }

      wrap.className = 'status closed';
      text.textContent = HOURS.label;
    }

    paint();
    /* Re-check every minute so a tab left open at 3:58PM doesn't lie at 4:05. */
    window.setInterval(paint, 60000);
  })();

  /* ==========================================================================
     Path choice — stores the preference and reorders the tracks
     ========================================================================== */
  (function initPaths() {
    var KEY = 'ccc-path';
    var note = document.getElementById('reorderNote');
    var noteText = document.getElementById('reorderText');
    var reset = document.getElementById('resetPath');
    var paths = Array.prototype.slice.call(document.querySelectorAll('.path'));

    var LABELS = {
      dump: 'Showing dumping first — you picked “I need to dump”.',
      supply: 'Showing materials first — you picked “I need materials”.'
    };

    function apply(path) {
      if (path === 'dump' || path === 'supply') {
        document.body.setAttribute('data-path', path);
        if (noteText) noteText.textContent = LABELS[path];
      } else {
        document.body.removeAttribute('data-path');
      }
      paths.forEach(function (p) {
        p.setAttribute('data-chosen', p.getAttribute('data-path') === path ? 'true' : 'false');
      });
    }

    var stored = null;
    try { stored = window.localStorage.getItem(KEY); } catch (e) { stored = null; }
    if (stored) apply(stored);

    paths.forEach(function (p) {
      p.addEventListener('click', function () {
        var path = p.getAttribute('data-path');
        try { window.localStorage.setItem(KEY, path); } catch (e) { /* private mode */ }
        apply(path);
      });
    });

    if (reset) {
      reset.addEventListener('click', function () {
        try { window.localStorage.removeItem(KEY); } catch (e) { /* no-op */ }
        apply(null);
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      });
    }
  })();

  /* ==========================================================================
     Cubic yard calculator
     yards = length(ft) × width(ft) × (depth_inches / 12) ÷ 27
     ========================================================================== */
  (function initCalc() {
    var L = document.getElementById('calcL');
    var W = document.getElementById('calcW');
    var D = document.getElementById('calcD');
    var M = document.getElementById('calcM');
    var out = document.getElementById('calcOut');
    var send = document.getElementById('calcSend');
    var presets = Array.prototype.slice.call(document.querySelectorAll('.presets button'));
    if (!L || !W || !D || !out) return;

    var yards = 0;

    function compute() {
      var l = parseFloat(L.value), w = parseFloat(W.value), d = parseFloat(D.value);
      if (!(l > 0) || !(w > 0) || !(d > 0)) {
        yards = 0;
        out.innerHTML = '&mdash;<small>Cubic yards</small>';
        return;
      }
      yards = (l * w * (d / 12)) / 27;
      var shown = yards < 1 ? yards.toFixed(2) : (yards < 10 ? yards.toFixed(1) : Math.round(yards));
      out.innerHTML = shown + '<small>Cubic yards</small>';
    }

    [L, W, D].forEach(function (el) { el.addEventListener('input', compute); });

    presets.forEach(function (b) {
      b.addEventListener('click', function () {
        D.value = b.getAttribute('data-depth');
        presets.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        compute();
      });
    });

    /* typing a custom depth clears the preset highlight — it isn't a preset any more */
    D.addEventListener('input', function () {
      presets.forEach(function (o) {
        o.setAttribute('aria-pressed', o.getAttribute('data-depth') === D.value ? 'true' : 'false');
      });
    });

    compute();

    if (send) {
      send.addEventListener('click', function () {
        var yardsField = document.getElementById('dYards');
        var matField = document.getElementById('dMaterial');
        if (yards > 0 && yardsField) {
          yardsField.value = yards < 10 ? yards.toFixed(1) : Math.round(yards);
        }
        if (M && matField) {
          Array.prototype.forEach.call(matField.options, function (o) {
            if (o.text === M.value) matField.value = o.value || o.text;
          });
        }
      });
    }
  })();

  /* ==========================================================================
     Delivery form — demo only
     ========================================================================== */
  (function initForm() {
    var form = document.getElementById('deliveryForm');
    if (!form) return;
    var status = document.getElementById('formStatus');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!status) return;
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
        status.textContent = 'That phone number looks short — we need a way to reach you about the drop.';
        status.classList.add('err');
        return;
      }

      if (bad) {
        status.textContent = 'Please complete the highlighted fields.';
        status.classList.add('err');
        return;
      }

      status.textContent = 'Demo form — nothing is submitted. [CONFIRM form endpoint.]';
      form.reset();
    });
  })();

  /* ==========================================================================
     Mobile nav
     ========================================================================== */
  (function initNav() {
    var burger = document.getElementById('burger');
    var nav = document.getElementById('mobileNav');
    if (!burger || !nav) return;
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
  })();

  /* ==========================================================================
     Scroll reveals
     ========================================================================== */
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

  /* ==========================================================================
     FAQ accordion
     ========================================================================== */
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

  /* ==========================================================================
     Year
     ========================================================================== */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

})();
