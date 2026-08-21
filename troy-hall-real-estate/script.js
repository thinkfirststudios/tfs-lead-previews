/* ============================================================================
   Troy Hall Real Estate — interactions
   Shared by the home page and the property detail template.

   Notes worth keeping:

   • The listing filter hides cards with the `hidden` attribute rather than a
     class, so screen readers and keyboard order follow what's visible. The
     empty state appears when a status has nothing in it — a real condition
     for a solo agent, not a hypothetical.

   • The gallery swaps the main image source and its alt text together. A
     thumbnail strip that changes the picture but leaves stale alt text is a
     bug people rarely notice and screen reader users always do.

   • Nothing here submits. Every form is a demo until an endpoint exists.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------------------
     Header: transparent over the hero, solid once scrolled.
     The property template opts out by carrying .static-head in the markup.
     -------------------------------------------------------------------------- */
  (function initHead() {
    var head = document.getElementById('siteHead');
    if (!head || head.classList.contains('static-head')) return;

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        head.classList.toggle('solid', window.pageYOffset > 80);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* --------------------------------------------------------------------------
     Mobile nav
     -------------------------------------------------------------------------- */
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

  /* --------------------------------------------------------------------------
     Listing filter
     -------------------------------------------------------------------------- */
  (function initFilter() {
    var btns = Array.prototype.slice.call(document.querySelectorAll('.filters button'));
    var grid = document.getElementById('listingGrid');
    var empty = document.getElementById('emptyState');
    if (!btns.length || !grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.lcard'));

    function apply(filter) {
      var shown = 0;
      cards.forEach(function (c) {
        var match = filter === 'all' || c.getAttribute('data-status') === filter;
        c.hidden = !match;
        if (match) shown++;
      });
      btns.forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-filter') === filter ? 'true' : 'false');
      });
      if (empty) empty.hidden = shown !== 0;
    }

    btns.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-filter')); });
    });

    apply('all');
  })();

  /* --------------------------------------------------------------------------
     Property gallery
     -------------------------------------------------------------------------- */
  (function initGallery() {
    var main = document.getElementById('galMain');
    var strip = document.getElementById('galThumbs');
    if (!main || !strip) return;

    var thumbs = Array.prototype.slice.call(strip.querySelectorAll('button'));

    function show(btn) {
      main.src = btn.getAttribute('data-full');
      main.alt = btn.getAttribute('data-alt') || '';
      thumbs.forEach(function (t) { t.setAttribute('aria-current', t === btn ? 'true' : 'false'); });
    }

    thumbs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(t); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var next = thumbs[(i + d + thumbs.length) % thumbs.length];
        next.focus(); show(next);
      });
    });
  })();

  /* --------------------------------------------------------------------------
     Forms — all demo only
     -------------------------------------------------------------------------- */
  function wireForm(form, status, okMessage) {
    if (!form || !status) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
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
        status.textContent = 'That phone number looks short.';
        status.classList.add('err');
        return;
      }

      var mail = form.querySelector('input[type="email"][required]');
      if (!bad && mail && mail.value.indexOf('@') < 1) {
        mail.classList.add('invalid');
        status.textContent = 'That email address doesn’t look right.';
        status.classList.add('err');
        return;
      }

      if (bad) {
        status.textContent = 'Please complete the highlighted fields.';
        status.classList.add('err');
        return;
      }

      status.textContent = okMessage;
      form.reset();
    });
  }

  wireForm(document.getElementById('contactForm'), document.getElementById('contactStatus'),
    'Demo form — nothing is submitted. [CONFIRM form endpoint.]');

  wireForm(document.getElementById('valForm'), document.getElementById('valStatus'),
    'Demo form — nothing is submitted. A real CMA request would be followed up by a person. [CONFIRM endpoint.]');

  wireForm(document.getElementById('showingForm'), document.getElementById('showingStatus'),
    'Demo form — nothing is submitted. [CONFIRM endpoint.]');

  /* the two resource email captures share a shape */
  Array.prototype.forEach.call(document.querySelectorAll('form.capture'), function (f) {
    var status = f.parentNode.querySelector('.form-status');
    wireForm(f, status, 'Demo form — nothing is sent. [CONFIRM whether this asset exists.]');
  });

  /* --------------------------------------------------------------------------
     FAQ accordion
     -------------------------------------------------------------------------- */
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

  /* --------------------------------------------------------------------------
     Scroll reveals
     -------------------------------------------------------------------------- */
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

  /* --------------------------------------------------------------------------
     Year
     -------------------------------------------------------------------------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

})();
