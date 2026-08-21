/* ============================================================================
   MS Accountability — interactions
   Shared by the home page and the catch-up bookkeeping page.

   The "how far behind are you?" selector is the one piece of real behaviour
   here. It exists because the honest answer to that question is the thing
   people are most anxious about, and every response it gives is written to
   normalise the answer rather than react to it — including "I don't know",
   which is a legitimate answer and a common one.

   Note what it does NOT do: it never quotes a price, never estimates a
   turnaround, and never implies a deadline. Sharon has not committed to
   those, so the site does not either.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------------------
     How far behind
     -------------------------------------------------------------------------- */
  var BEHIND = {
    '1-3': {
      title: 'A few months behind — the easy case',
      text: 'Short backlogs are usually a matter of catching the categorisation up and reconciling the period. Bring the statements for the months in question and the account access, and it is a defined piece of work. [CONFIRM typical scope and pricing for a short catch-up.]'
    },
    '3-12': {
      title: 'Most of a year — very common, still finite',
      text: 'This is the most common size of catch-up project. It usually means rebuilding month by month from the bank record, then closing each period out. Missing receipts along the way are normal and not a blocker. [CONFIRM typical scope and pricing.]'
    },
    'over': {
      title: 'Over a year — bigger, not different',
      text: 'The work is the same shape, there is just more of it, and it is usually sequenced so the periods with a deadline attached get finished first. If a tax deadline is driving this, say so on the first call — it changes the order things are done in. [CONFIRM scope, sequencing and pricing.]'
    },
    'unknown': {
      title: 'Not knowing is a completely normal answer',
      text: 'Plenty of people genuinely do not know how far back the last clean month was — that is part of what the first look is for. Bring whatever access and statements you have and the scope becomes clear quickly. [CONFIRM what she needs for an initial scoping look.]'
    }
  };

  (function initBehind() {
    var radios = Array.prototype.slice.call(document.querySelectorAll('input[name="behind"]'));
    var title = document.getElementById('behindTitle');
    var text = document.getElementById('behindText');
    if (!radios.length || !title || !text) return;

    radios.forEach(function (r) {
      r.addEventListener('change', function () {
        var d = BEHIND[r.value];
        if (!d) return;
        title.textContent = d.title;
        text.textContent = d.text;
      });
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
     Contact form — demo only.
     Deliberately refuses anything that looks like a credential.
     -------------------------------------------------------------------------- */
  (function initForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var status = document.getElementById('contactStatus');
    if (!status) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.classList.remove('err');

      var bad = false;
      Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (f) {
        var empty = !f.value.trim();
        f.classList.toggle('invalid', empty);
        if (empty) bad = true;
      });

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

      /* A light guard, because this is a bookkeeping site and people do it. */
      var msg = form.querySelector('textarea');
      if (msg && /password|routing number|account number|login/i.test(msg.value)) {
        status.textContent = 'Please don’t include account or login details here — we’ll set up secure access properly.';
        status.classList.add('err');
        return;
      }

      status.textContent = 'Demo form — nothing is submitted. [CONFIRM form endpoint.]';
      form.reset();
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
