/* Carol Ogelsby — personal site mockup. No framework, no build step. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');
  window.__carol = true;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealed = false;
  var hasScrolled = false;

  /* ---------------------------------------------------------------
     Fail-safe: never leave content hidden in previews, iframes,
     screenshot tools, link unfurls, print, or for idle visitors.
     --------------------------------------------------------------- */
  var inFrame = false;
  try { inFrame = window.self !== window.top; } catch (e) { inFrame = true; }
  var automated = !!(navigator && navigator.webdriver);

  var counters = [];
  function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function finishCounters() {
    counters.forEach(function (c) { c.done = true; c.el.textContent = fmt(c.value); });
  }

  function revealAll() {
    if (revealed) return;
    revealed = true;
    root.classList.add('reveal-all');
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
    document.querySelectorAll('.mission, .timeline').forEach(function (el) { el.classList.add('is-in'); });
    finishCounters();
    if (io) io.disconnect();
  }
  window.addEventListener('beforeprint', revealAll);

  /* ---------------------------------------------------------------
     Scroll reveals (stagger via data-stagger on a parent)
     --------------------------------------------------------------- */
  document.querySelectorAll('[data-stagger]').forEach(function (parent) {
    var step = parseInt(parent.getAttribute('data-stagger'), 10) || 90;
    parent.querySelectorAll(':scope > [data-reveal], :scope > * > [data-reveal]').forEach(function (el, i) {
      el.style.setProperty('--d', (i * step) + 'ms');
    });
  });
  document.querySelectorAll('.mission p').forEach(function (p) {
    if (p.dataset.split) return;
    p.dataset.split = '1';
    var words = p.textContent.trim().split(/\s+/);
    p.setAttribute('aria-label', p.textContent.trim());
    p.innerHTML = words.map(function (w, i) {
      return '<span class="w" aria-hidden="true" style="--i:' + i + '">' + w + '</span>';
    }).join(' ');
  });

  document.querySelectorAll('[data-count]').forEach(function (el) {
    counters.push({ el: el, value: parseFloat(el.getAttribute('data-count')), done: false });
  });

  function runCounter(c) {
    if (c.done) return;
    c.done = true;
    if (reduced || revealed) { c.el.textContent = fmt(c.value); return; }
    var start = null, dur = 1400;
    function tick(t) {
      if (revealed) { c.el.textContent = fmt(c.value); return; }
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      c.el.textContent = fmt(c.value * eased);
      if (p < 1) requestAnimationFrame(tick); else c.el.textContent = fmt(c.value);
    }
    requestAnimationFrame(tick);
  }

  var io = null;
  if (reduced || inFrame || automated || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('is-in');
        if (el.hasAttribute('data-count')) {
          counters.forEach(function (c) { if (c.el === el) runCounter(c); });
        }
        el.querySelectorAll && el.querySelectorAll('[data-count]').forEach(function (n) {
          counters.forEach(function (c) { if (c.el === n) runCounter(c); });
        });
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.querySelectorAll('[data-reveal], .mission, .timeline, [data-count]').forEach(function (el) { io.observe(el); });

    // Counters start at $0 only while they are genuinely waiting to animate.
    counters.forEach(function (c) {
      var r = c.el.getBoundingClientRect();
      if (r.top > window.innerHeight) c.el.textContent = fmt(0);
    });

    // Idle visitors and screenshot tools: reveal everything if no scroll within 2.5s.
    setTimeout(function () { if (!hasScrolled) revealAll(); }, 2500);
  }

  /* ---------------------------------------------------------------
     Header condense, mobile menu, sticky mobile bar
     --------------------------------------------------------------- */
  var header = document.querySelector('[data-header]');
  var mbar = document.querySelector('.mbar');
  var lastY = window.scrollY;

  function onScroll() {
    var y = window.scrollY;
    if (Math.abs(y - lastY) > 2) hasScrolled = true;
    if (header) header.classList.toggle('is-condensed', y > 24);
    if (mbar) {
      if (y < 400) mbar.classList.remove('is-shown');
      else if (y < lastY - 4) mbar.classList.add('is-shown');
      else if (y > lastY + 4) mbar.classList.remove('is-shown');
    }
    lastY = y;
    heroFrame();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  var menuBtn = document.querySelector('.menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.mobile-menu a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false'); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { document.body.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------------------------------------------------------------
     HERO — masked type: frosted glyphs over the photograph.
     The frosted layer is clipped to the letterforms and filled with a
     blurred copy of the same photograph, aligned pixel-for-pixel.
     On scroll the photo rises ~40px behind the fixed type.
     --------------------------------------------------------------- */
  var hero = document.querySelector('[data-hero]');
  var media = hero && hero.querySelector('.hero-media');
  var frost = hero && hero.querySelector('.hn-frost');
  var heroImg = hero && hero.querySelector('.hero-img-wrap img');
  var heroVisible = true;

  function blurredUrl(src) {
    if (!src) return '';
    try {
      var u = new URL(src);
      if (u.hostname.indexOf('unsplash.com') > -1) {
        var w = parseFloat(u.searchParams.get('w')), h = parseFloat(u.searchParams.get('h'));
        if (w && h && w > 1000) { u.searchParams.set('w', '1000'); u.searchParams.set('h', Math.round(h * 1000 / w)); }
        u.searchParams.set('blur', '90');
        u.searchParams.set('q', '50');
        return u.toString();
      }
    } catch (e) {}
    return '';
  }

  function heroFrame() {
    if (!hero || !media) return;
    var rect = hero.getBoundingClientRect();
    heroVisible = rect.bottom > 0;
    if (!heroVisible) return;
    if (!reduced) {
      var prog = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height * 0.6)));
      hero.style.setProperty('--rise', (prog * 40).toFixed(2));
      hero.style.setProperty('--py', (Math.max(0, -rect.top) * 0.12).toFixed(2));
    }
    alignFrost();
  }

  function alignFrost() {
    if (!frost || !heroImg || !frost.classList.contains('is-frosted')) return;
    var ir = heroImg.getBoundingClientRect();
    var fr = frost.getBoundingClientRect();
    var nw = heroImg.naturalWidth || 1600, nh = heroImg.naturalHeight || 1000;
    // replicate object-fit: cover + object-position from computed style
    var scale = Math.max(ir.width / nw, ir.height / nh);
    var w = nw * scale, h = nh * scale;
    var pos = getComputedStyle(heroImg).objectPosition.split(' ');
    var px = parseFloat(pos[0]) / 100, py = parseFloat(pos[1] || '50') / 100;
    if (isNaN(px)) px = 0.5; if (isNaN(py)) py = 0.5;
    var x = ir.left + (ir.width - w) * px - fr.left;
    var y = ir.top + (ir.height - h) * py - fr.top;
    frost.style.backgroundSize = '100% 100%, ' + w.toFixed(1) + 'px ' + h.toFixed(1) + 'px';
    frost.style.backgroundPosition = '0 0, ' + x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
  }

  function setupFrost() {
    if (!frost || !heroImg) return;
    var url = blurredUrl(heroImg.currentSrc || heroImg.src);
    if (!url) return;
    var pre = new Image();
    pre.onload = function () {
      frost.style.setProperty('--frost-img', 'url("' + url + '")');
      frost.classList.add('is-frosted');
      alignFrost();
    };
    pre.src = url;
  }

  if (hero) {
    if (heroImg && heroImg.complete) setupFrost();
    else if (heroImg) heroImg.addEventListener('load', setupFrost);
    window.addEventListener('resize', function () { setupFrost(); heroFrame(); });
    // keep glyph fill aligned with the 8s drift of the photograph
    if (!reduced) {
      (function loop() {
        if (heroVisible) alignFrost();
        requestAnimationFrame(loop);
      })();
    }
    heroFrame();
  }

  /* ---------------------------------------------------------------
     Record ledger filter
     --------------------------------------------------------------- */
  document.querySelectorAll('[data-filter-group]').forEach(function (group) {
    var table = document.getElementById(group.getAttribute('data-filter-group'));
    if (!table) return;
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      var f = btn.getAttribute('data-filter');
      group.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      table.querySelectorAll('tbody tr').forEach(function (tr) {
        var show = f === 'all' || tr.getAttribute('data-place') === f;
        tr.classList.toggle('is-filtered', !show);
        if (show) { tr.classList.add('is-in'); }
      });
      finishCounters();
    });
  });

  /* ---------------------------------------------------------------
     Mockup forms — nothing is sent
     --------------------------------------------------------------- */
  document.querySelectorAll('form[data-mock]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var s = form.querySelector('.form-status');
      if (s) s.textContent = 'Mockup only — no message has been sent.';
    });
  });

  /* FAQ: only one open at a time within a list */
  document.querySelectorAll('.faq-list').forEach(function (list) {
    list.addEventListener('toggle', function (e) {
      if (!e.target.open) return;
      list.querySelectorAll('details[open]').forEach(function (d) { if (d !== e.target) d.open = false; });
    }, true);
  });

  onScroll();
})();
