/* ============================================================================
   Westcoast General Services — interactions

   Three things carry real weight here:

   1. The cubic yard calculator. It is the single most useful thing this page
      can give a homeowner, and it costs nothing to build. It computes volume
      only — never a price, because no material rate has been confirmed.

   2. The segmented Remove / Deliver / Both control on the quote form. The
      page's whole argument is that this company goes both directions, so the
      form has to ask which one rather than assuming removal like every junk
      hauler's form does.

   3. The calculator hands its result to the form. Working out "4.4 yards" and
      then having to retype it is exactly the kind of small friction that loses
      a lead.

   The phone number is a plain tel: link in the markup and does not depend on
   this file at all.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------------------
     Cubic yard calculator
     volume (yd³) = length(ft) × width(ft) × depth(ft) ÷ 27
     -------------------------------------------------------------------------- */
  (function initCalc() {
    var L = document.getElementById('calcL');
    var W = document.getElementById('calcW');
    var D = document.getElementById('calcD');
    var M = document.getElementById('calcM');
    var out = document.getElementById('calcOut');
    var send = document.getElementById('calcSend');
    if (!L || !W || !D || !out) return;

    var yards = 0;

    function compute() {
      var l = parseFloat(L.value);
      var w = parseFloat(W.value);
      var inches = parseFloat(D.value);

      if (!(l > 0) || !(w > 0) || !(inches > 0)) {
        yards = 0;
        out.innerHTML = '&mdash;<small>Cubic yards</small>';
        return;
      }

      yards = (l * w * (inches / 12)) / 27;

      // Round the way a materials yard would quote it, not to four decimals.
      var shown = yards < 1 ? yards.toFixed(2) : (yards < 10 ? yards.toFixed(1) : Math.round(yards));
      out.innerHTML = shown + '<small>Cubic yards</small>';
    }

    [L, W, D].forEach(function (el) {
      el.addEventListener('input', compute);
      el.addEventListener('change', compute);
    });
    compute();

    /* hand the number to the quote form rather than making them retype it */
    if (send) {
      send.addEventListener('click', function () {
        var yardsField = document.getElementById('dYards');
        var matField = document.getElementById('dMaterial');
        if (yards > 0 && yardsField) {
          yardsField.value = yards < 10 ? yards.toFixed(1) : Math.round(yards);
        }
        if (M && matField) {
          var want = M.value;
          Array.prototype.forEach.call(matField.options, function (o) {
            if (o.text === want) matField.value = o.value || o.text;
          });
        }
        setDirection('deliver');
      });
    }
  })();

  /* --------------------------------------------------------------------------
     Quote form direction control
     -------------------------------------------------------------------------- */
  var setDirection = (function () {
    var btns = Array.prototype.slice.call(document.querySelectorAll('.seg button'));
    var sets = {
      remove: document.getElementById('setRemove'),
      deliver: document.getElementById('setDeliver'),
      both: document.getElementById('setBoth')
    };

    function apply(dir) {
      btns.forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-dir') === dir ? 'true' : 'false');
      });
      if (sets.remove) sets.remove.hidden = !(dir === 'remove' || dir === 'both');
      if (sets.deliver) sets.deliver.hidden = !(dir === 'deliver' || dir === 'both');
      if (sets.both) sets.both.hidden = dir !== 'both';
    }

    btns.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-dir')); });
    });

    apply('remove');
    return apply;
  })();

  /* --------------------------------------------------------------------------
     Quote form — demo only, nothing is submitted
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
        status.textContent = 'That phone number looks short — we need a way to call you back.';
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
      setDirection('remove');
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
