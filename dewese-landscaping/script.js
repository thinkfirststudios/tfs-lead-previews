/* ============================================================================
   Dewese Landscaping — interactions

   One idea carries this file: the frequency choice made near the top of the
   page has to still be true at the bottom of it.

   Pick a frequency and it:
     • fills the card,
     • stores the choice for the next visit,
     • raises a summary chip that follows the reader down the page,
     • pre-selects the matching radio in the quote form,
     • and echoes back in the closing band.

   The one-time option is treated exactly like the other two. Nudging toward
   recurring is the design's job; hiding the alternative is not.

   The phone and text links are plain tel: / sms: in the markup and work with
   this file removed entirely.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'dewese-frequency';

  var COPY = {
    'one-time': {
      chip: 'One-time visit',
      echo: 'You picked a one-time visit — let’s get you a price for it.'
    },
    'bi-weekly': {
      chip: 'Bi-weekly service',
      echo: 'You picked bi-weekly — let’s get you a price.'
    },
    'weekly': {
      chip: 'Weekly service',
      echo: 'You picked weekly — let’s get you a price.'
    }
  };

  var DEFAULT_ECHO = 'One time or on a schedule — either way, it starts with a look at the property.';

  /* --------------------------------------------------------------------------
     Frequency selection
     -------------------------------------------------------------------------- */
  var cards = Array.prototype.slice.call(document.querySelectorAll('.fcard'));
  var chip = document.getElementById('freqChip');
  var chipText = document.getElementById('freqChipText');
  var chipClose = document.getElementById('freqChipClose');
  var echo = document.getElementById('finalEcho');
  var radios = Array.prototype.slice.call(document.querySelectorAll('#freqRadios input'));

  var chipDismissed = false;

  function select(freq, opts) {
    opts = opts || {};
    var copy = COPY[freq];
    if (!copy) return;

    cards.forEach(function (c) {
      c.setAttribute('aria-pressed', c.getAttribute('data-freq') === freq ? 'true' : 'false');
    });

    radios.forEach(function (r) { r.checked = (r.value === freq); });

    if (chipText) chipText.textContent = copy.chip;
    if (echo) echo.textContent = copy.echo;

    if (chip && !chipDismissed && !opts.silent) {
      chip.classList.add('show');
    }

    if (!opts.skipStore) {
      try { window.localStorage.setItem(KEY, freq); } catch (e) { /* private mode */ }
    }
  }

  cards.forEach(function (c) {
    c.addEventListener('click', function () { select(c.getAttribute('data-freq')); });
  });

  /* The form's own radios stay authoritative if someone changes them there. */
  radios.forEach(function (r) {
    r.addEventListener('change', function () {
      if (r.checked) select(r.value, { silent: true });
    });
  });

  if (chipClose && chip) {
    chipClose.addEventListener('click', function () {
      chipDismissed = true;
      chip.classList.remove('show');
    });
  }

  /* Restore a previous choice, but don't fire the chip until the reader has
     actually scrolled past the selector — a chip on page load is an ad. */
  (function restore() {
    var stored = null;
    try { stored = window.localStorage.getItem(KEY); } catch (e) { stored = null; }
    if (!stored || !COPY[stored]) {
      if (echo) echo.textContent = DEFAULT_ECHO;
      return;
    }
    select(stored, { silent: true, skipStore: true });
  })();

  /* Chip appears once the selector scrolls out of view, and only if a
     frequency is actually selected. */
  (function chipOnScroll() {
    var section = document.getElementById('plans');
    if (!section || !chip || !('IntersectionObserver' in window)) return;

    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var picked = cards.some(function (c) { return c.getAttribute('aria-pressed') === 'true'; });
        if (!en.isIntersecting && picked && !chipDismissed) {
          chip.classList.add('show');
        } else if (en.isIntersecting) {
          chip.classList.remove('show');
        }
      });
    }, { threshold: 0 }).observe(section);
  })();

  /* --------------------------------------------------------------------------
     Quote form — demo only
     -------------------------------------------------------------------------- */
  (function initForm() {
    var form = document.getElementById('quoteForm');
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
        status.textContent = 'That phone number looks short — we need a way to reach you.';
        status.classList.add('err');
        return;
      }

      if (bad) {
        status.textContent = 'Please complete the highlighted fields.';
        status.classList.add('err');
        return;
      }

      var picked = form.querySelector('input[name="services"]:checked');
      if (!picked) {
        status.textContent = 'Pick at least one service so we know what we are quoting.';
        status.classList.add('err');
        return;
      }

      status.textContent = 'Demo form — nothing is submitted. [CONFIRM form endpoint.]';
    });
  })();

  /* --------------------------------------------------------------------------
     Header condense
     -------------------------------------------------------------------------- */
  (function initHead() {
    var head = document.getElementById('siteHead');
    if (!head) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        head.classList.toggle('condensed', window.pageYOffset > 60);
        ticking = false;
      });
    }, { passive: true });
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
     Year
     -------------------------------------------------------------------------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

})();
