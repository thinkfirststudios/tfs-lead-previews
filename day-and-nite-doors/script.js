/* ============================================================
   Day & Nite Doors — interactions

   The style browser is the centrepiece. It is deliberately NOT a
   quoting engine: it changes an SVG illustration, writes the selection
   into the quote form, and never produces a price, a model number or
   an availability claim.

   Nothing on the emergency path depends on JavaScript — the phone
   number is a plain tel: link in the intercept strip, the header, the
   emergency panel, every diagnostic chip and the sticky bar.
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

  /* ---------- door style browser ---------- */
  (function initBrowser() {
    var slab = document.getElementById('doorSlab');
    if (!slab) return;

    var STYLE_LABEL = {
      raised: 'Raised panel', carriage: 'Carriage house',
      flush: 'Flush / modern', fullview: 'Full-view glass'
    };
    var MAT_LABEL = {
      steel: 'Steel', wood: 'Wood', composite: 'Wood composite', glass: 'Aluminium & glass'
    };
    var WIN_LABEL = { none: 'No windows', top: 'Top row', decorative: 'Decorative inserts' };
    var FINISH_LABEL = {
      '#F4F5F6': 'White', '#E3D9C6': 'Almond', '#C9B79A': 'Sandstone',
      '#B9803C': 'Oak', '#6B4526': 'Walnut', '#3A4149': 'Charcoal', '#1B1F23': 'Black'
    };

    var state = { style: 'raised', mat: 'steel', win: 'none', finish: '#F4F5F6' };

    var styleGroups = {
      raised: document.getElementById('sRaised'),
      carriage: document.getElementById('sCarriage'),
      flush: document.getElementById('sFlush'),
      fullview: document.getElementById('sFullview')
    };
    var winGroups = { top: document.getElementById('wTop'), decorative: document.getElementById('wDeco') };
    var grain = document.getElementById('woodGrain');
    var lines = document.getElementById('sectionLines');

    function render() {
      // style
      Object.keys(styleGroups).forEach(function (k) {
        if (styleGroups[k]) styleGroups[k].hidden = (k !== state.style);
      });
      // full-view glass covers the slab, so the plain section lines would read as noise
      if (lines) lines.hidden = (state.style === 'fullview');

      // material: wood and composite get the grain overlay; glass lightens the slab
      if (grain) grain.hidden = !(state.mat === 'wood' || state.mat === 'composite');
      var fill = state.finish;
      if (state.mat === 'glass') fill = '#C3D2DC';
      slab.setAttribute('fill', fill);

      // windows — suppressed on full-view, which is already all glass
      Object.keys(winGroups).forEach(function (k) {
        if (winGroups[k]) winGroups[k].hidden = !(k === state.win && state.style !== 'fullview');
      });

      // caption
      var t = document.getElementById('brTitle');
      var s = document.getElementById('brSpec');
      if (t) t.textContent = STYLE_LABEL[state.style];
      var winTxt = state.style === 'fullview' ? 'Glazed throughout' : WIN_LABEL[state.win];
      if (s) s.textContent = MAT_LABEL[state.mat] + ' · ' + winTxt + ' · ' + (FINISH_LABEL[state.finish] || 'Custom');

      // write the selection straight into the quote form — this is the only
      // thing the browser "produces". No price, no model, no availability.
      function setField(id, val) { var el = document.getElementById(id); if (el) el.value = val; }
      setField('qStyle', STYLE_LABEL[state.style]);
      setField('qMat', MAT_LABEL[state.mat]);
      setField('qWin', winTxt);
      setField('qFinish', FINISH_LABEL[state.finish] || 'Custom');
    }

    function wire(groupId, key, attr) {
      var group = document.getElementById(groupId);
      if (!group) return;
      var btns = Array.prototype.slice.call(group.querySelectorAll('button'));
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          state[key] = b.getAttribute(attr);
          btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          render();
        });
      });
    }
    wire('styleGroup', 'style', 'data-style');
    wire('matGroup', 'mat', 'data-mat');
    wire('winGroup', 'win', 'data-win');
    wire('finishGroup', 'finish', 'data-finish');

    var quoteBtn = document.getElementById('brQuote');
    if (quoteBtn) quoteBtn.addEventListener('click', function () { selectTab('new'); });

    render();
  })();

  /* ---------- before / after sliders ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.ba'), function (ba) {
    var wrap = ba.querySelector('.after-wrap');
    var handle = ba.querySelector('.ba-handle');
    var range = ba.querySelector('.ba-range');
    if (!wrap || !handle) return;
    function set(pct) {
      pct = Math.max(0, Math.min(100, pct));
      wrap.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      handle.style.left = pct + '%';
      if (range && Number(range.value) !== Math.round(pct)) range.value = Math.round(pct);
    }
    function fromEvent(e) {
      var r = ba.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      set((x / r.width) * 100);
    }
    var dragging = false;
    ba.addEventListener('pointerdown', function (e) {
      if (e.target === range) return;
      dragging = true; ba.setPointerCapture(e.pointerId); fromEvent(e);
    });
    ba.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
    ba.addEventListener('pointerup', function () { dragging = false; });
    ba.addEventListener('pointercancel', function () { dragging = false; });
    if (range) range.addEventListener('input', function () { set(Number(range.value)); });
    set(50);
  });

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
        if (!open && field) {
          field.value = b.getAttribute('data-symptom') || 'other';
          selectTab('repair');
        }
      });
    });
  })();

  /* ---------- quote form tabs ---------- */
  function selectTab(which) {
    var tabs = { 'new': document.getElementById('tab-new'), repair: document.getElementById('tab-repair') };
    var panels = { 'new': document.getElementById('panel-new'), repair: document.getElementById('panel-repair') };
    Object.keys(tabs).forEach(function (k) {
      var on = (k === which);
      if (tabs[k]) {
        tabs[k].setAttribute('aria-selected', on ? 'true' : 'false');
        tabs[k].tabIndex = on ? 0 : -1;
      }
      if (panels[k]) panels[k].hidden = !on;
    });
  }
  (function initTabs() {
    var list = ['new', 'repair'];
    list.forEach(function (k, i) {
      var tab = document.getElementById('tab-' + k);
      if (!tab) return;
      tab.addEventListener('click', function () { selectTab(k); });
      tab.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var next = list[(i + d + list.length) % list.length];
        selectTab(next);
        document.getElementById('tab-' + next).focus();
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
