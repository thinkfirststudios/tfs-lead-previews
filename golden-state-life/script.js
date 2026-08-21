/* ============================================================================
   Golden State Life — interactions

   The multi-step assessment is the only substantial thing in this file, and
   the two behaviours that matter most in it are both refusals:

   1. STATE GATING. If a visitor selects a state outside CA / OR / NV, the
      flow stops and says so. It does not collect their details "just in
      case". Soliciting insurance where a producer is unlicensed is the
      violation this page could most easily commit by accident, and it would
      commit it silently.

   2. NO PRICE, EVER. Nothing here computes, estimates, or displays a premium.
      The final screen hands off to a licensed agent and says plainly that
      this is not an application and does not bind coverage.

   Accessibility notes, because this is a compliance item for insurance sites:
   steps are fieldsets toggled by class, focus moves to the new step heading
   on each advance, the progress indicator is an aria-live region, and every
   control is reachable and operable from the keyboard.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var LICENSED = ['CA', 'OR', 'NV'];

  /* --------------------------------------------------------------------------
     Assessment
     -------------------------------------------------------------------------- */
  (function initAssess() {
    var form = document.getElementById('assessForm');
    if (!form) return;

    var steps = Array.prototype.slice.call(form.querySelectorAll('.step'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('#dots .dot'));
    var count = document.getElementById('stepCount');
    var prev = document.getElementById('prevBtn');
    var next = document.getElementById('nextBtn');
    var submit = document.getElementById('submitBtn');
    var status = document.getElementById('assessStatus');
    var oos = document.getElementById('oosPanel');

    var at = 0;
    var blocked = false;   // true once an out-of-state answer is given

    function paint(moveFocus) {
      steps.forEach(function (s, i) { s.classList.toggle('active', i === at); });

      dots.forEach(function (d, i) {
        d.classList.toggle('now', i === at);
        d.classList.toggle('done', i < at);
      });
      if (count) count.textContent = 'Step ' + (at + 1) + ' of ' + steps.length;

      if (prev) prev.hidden = at === 0;
      var last = at === steps.length - 1;
      if (next) next.hidden = last || blocked;
      if (submit) submit.hidden = !last || blocked;

      /* Move focus to the new step's heading — but only when the reader
         asked for a step change. Grabbing focus on first paint would yank
         the page around before anyone has done anything. */
      if (moveFocus) {
        var h = steps[at].querySelector('h3');
        if (h) {
          h.setAttribute('tabindex', '-1');
          h.focus({ preventScroll: true });
        }
      }
    }

    /* state gate */
    Array.prototype.forEach.call(form.querySelectorAll('input[name="state"]'), function (r) {
      r.addEventListener('change', function () {
        var licensed = LICENSED.indexOf(r.value) !== -1;
        blocked = !licensed;
        if (oos) oos.hidden = licensed;
        if (next) next.hidden = blocked;
        if (status) { status.textContent = ''; status.classList.remove('err'); }
      });
    });

    function stepValid() {
      var step = steps[at];

      /* a radio group on this step, if there is one, needs an answer */
      var radios = step.querySelectorAll('input[type="radio"]');
      if (radios.length) {
        var name = radios[0].name;
        var picked = step.querySelector('input[name="' + name + '"]:checked');
        if (!picked) {
          if (status) {
            status.textContent = 'Please choose one to continue.';
            status.classList.add('err');
          }
          return false;
        }
      }

      if (status) { status.textContent = ''; status.classList.remove('err'); }
      return true;
    }

    if (next) {
      next.addEventListener('click', function () {
        if (blocked) return;
        if (!stepValid()) return;
        if (at < steps.length - 1) { at++; paint(true); }
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        if (at > 0) { at--; blocked = false; if (oos) oos.hidden = true; paint(true); }
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!status) return;
      status.classList.remove('err');

      if (blocked) {
        status.textContent = 'We are only licensed in California, Oregon and Nevada.';
        status.classList.add('err');
        return;
      }

      var bad = false;
      Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (f) {
        var missing = f.type === 'checkbox' ? !f.checked : !f.value.trim();
        f.classList.toggle('invalid', missing);
        if (missing) bad = true;
      });

      var tel = form.querySelector('input[type="tel"]');
      if (!bad && tel && tel.value.replace(/\D/g, '').length < 10) {
        tel.classList.add('invalid');
        status.textContent = 'That phone number looks short.';
        status.classList.add('err');
        return;
      }

      if (bad) {
        status.textContent = 'Please complete the highlighted fields, including the consent box.';
        status.classList.add('err');
        return;
      }

      /* Deliberately not a price, not a quote, not an approval. */
      status.textContent = 'Demo form — nothing is submitted. In the live site this goes to a licensed agent, who reviews it and calls you. [CONFIRM form endpoint.]';
    });

    paint(false);
  })();

  /* --------------------------------------------------------------------------
     Hero starter — carries its three answers into the assessment
     -------------------------------------------------------------------------- */
  (function initStarter() {
    var starter = document.getElementById('starterForm');
    if (!starter) return;

    starter.addEventListener('submit', function (e) {
      e.preventDefault();

      var cov = document.getElementById('sCoverage');
      var term = document.getElementById('sTerm');
      var age = document.getElementById('sAge');

      var aCov = document.getElementById('aCoverage');
      if (cov && aCov && cov.value) {
        Array.prototype.forEach.call(aCov.options, function (o) {
          if (o.text === cov.value) aCov.value = o.value || o.text;
        });
      }

      if (term && term.value) {
        var years = term.value.replace(/\D/g, '');
        var t = document.querySelector('input[name="term"][value="' + years + '"]');
        if (t) t.checked = true;
      }

      if (age && age.value) {
        var map = { 'Under 30': 'u30', '30–39': '30s', '40–49': '40s', '50–59': '50s', '60 or over': '60+' };
        var key = map[age.value];
        if (key) {
          var a = document.querySelector('input[name="age"][value="' + key + '"]');
          if (a) a.checked = true;
        }
      }

      var target = document.getElementById('assessment');
      if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  })();

  /* --------------------------------------------------------------------------
     Contact form
     -------------------------------------------------------------------------- */
  (function initContact() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var status = document.getElementById('contactStatus');
    if (!status) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.classList.remove('err');

      var bad = false;
      Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (f) {
        var missing = f.type === 'checkbox' ? !f.checked : !f.value.trim();
        f.classList.toggle('invalid', missing);
        if (missing) bad = true;
      });

      var tel = form.querySelector('input[type="tel"]');
      if (!bad && tel && tel.value.replace(/\D/g, '').length < 10) {
        tel.classList.add('invalid');
        status.textContent = 'That phone number looks short.';
        status.classList.add('err');
        return;
      }

      if (bad) {
        status.textContent = 'Please complete the highlighted fields, including the consent box.';
        status.classList.add('err');
        return;
      }

      status.textContent = 'Demo form — nothing is submitted. [CONFIRM form endpoint.]';
      form.reset();
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
