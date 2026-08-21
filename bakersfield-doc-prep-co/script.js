/* ============================================================================
   Bakersfield Doc Prep Co. — interactions
   Shared by all four pages.

   Deliberately minimal. This audience is stressed, often on an older phone,
   and here to find out two things: what it costs, and whether this person can
   help them. Nothing in this file gets in the way of either.

   The one piece of real behaviour is a guard on the contact form: it asks
   people NOT to send case details, and if the message looks like case
   details it says so before sending. Communications with a Legal Document
   Assistant are not privileged, and a form that quietly accepts a paragraph
   about someone's criminal history or custody dispute is doing them a
   disservice.

   The disclaimer bar is plain markup on every page. It does not depend on
   this file, cannot be dismissed, and has no JavaScript attached to it —
   that is deliberate. A required disclosure should never be able to fail
   because a script didn't load.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
     Contact form — demo only, with a case-detail guard
     -------------------------------------------------------------------------- */
  (function initForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var status = document.getElementById('contactStatus');
    if (!status) return;

    /* Words that suggest someone is about to tell us about their case rather
       than which documents they need. Not exhaustive, and not a filter — it
       is a prompt to keep the message short. */
    var CASE_HINT = /\b(case number|docket|my ex|custody|convicted|conviction|arrested|charge[sd]?|felony|misdemean|restraining|eviction notice|social security|ssn)\b/i;

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

      if (bad) {
        status.textContent = 'Please complete the highlighted fields.';
        status.classList.add('err');
        return;
      }

      var msg = form.querySelector('textarea');
      if (msg && CASE_HINT.test(msg.value)) {
        status.textContent = 'Please keep this to which documents you need — messages here are not privileged, so it is better to discuss the details by phone.';
        status.classList.add('err');
        msg.focus();
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
