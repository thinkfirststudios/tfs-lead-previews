/* ============================================================
   All Pool — interactions

   ┌──────────────────────────────────────────────────────────┐
   │  SEASON CONFIG — THIS IS THE ONLY THING YOU NEED TO EDIT │
   └──────────────────────────────────────────────────────────┘

   Change ONE line — the `mode` value below — and the whole site turns
   over: the banner at the top of the page, the hero subhead, the
   scheduler's month list, and the copy on the sticky bar at the bottom
   all follow it. No dates are written into the HTML anywhere.

   To switch the site over:

       var SEASON = { mode: 'closing-open',  ... }
                            ^^^^^^^^^^^^^^
       Replace 'closing-open' with one of:

         'closing-open'    Booking closings now (Sept–Nov). The default.
         'closing-full'    Closing calendar is full — take names for a
                           waitlist instead of appointments.
         'spring-opening'  Off-season / spring. Banner turns aqua and
                           points at the opening list.

   Everything else in this file is behaviour, not content.
   ============================================================ */

var SEASON = {
  mode: 'closing-open',

  'closing-open': {
    banner: 'Booking Sept–Nov closings now',
    bannerSub: 'Get on the calendar before the first freeze.',
    heroSub: 'Blow-out, winter chemicals, pump & filter, and cover installation — across Anne Arundel County and central Maryland.',
    ctaLabel: 'Book your closing',
    stickyLabel: 'Book Closing',
    months: ['September', 'October', 'November'],
    schedulerOn: true,
    spring: false
  },

  'closing-full': {
    banner: 'This season’s closing calendar is full',
    bannerSub: 'Add your name to the list — we’ll call if a slot opens.',
    heroSub: 'Closings are fully booked for this season. Join the list and we’ll be in touch as soon as something opens up.',
    ctaLabel: 'Join the waitlist',
    stickyLabel: 'Join Waitlist',
    months: [],
    schedulerOn: false,
    spring: false
  },

  'spring-opening': {
    banner: 'Spring opening bookings are open',
    bannerSub: 'Get the pool ready before the first warm weekend.',
    heroSub: 'Spring openings across Anne Arundel County and central Maryland. Get on the calendar early — the first warm weekend books out fast.',
    ctaLabel: 'Book your opening',
    stickyLabel: 'Book Opening',
    months: ['March', 'April', 'May'],
    schedulerOn: true,
    spring: true
  }
};

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cfg = SEASON[SEASON.mode] || SEASON['closing-open'];

  /* ---------- apply the season config everywhere it lands ---------- */
  (function applySeason() {
    function setText(id, val) {
      var el = document.getElementById(id);
      if (el && val) el.textContent = val;
    }
    setText('seasonBanner', cfg.banner);
    setText('seasonBannerSub', cfg.bannerSub);
    setText('heroSub', cfg.heroSub);
    setText('stickyBook', cfg.stickyLabel);

    Array.prototype.forEach.call(document.querySelectorAll('[data-season-cta]'), function (el) {
      el.textContent = cfg.ctaLabel;
    });

    var banner = document.getElementById('seasonBar');
    if (banner) banner.classList.toggle('spring', !!cfg.spring);

    // the scheduler reads its month list from the same config, so the two
    // can never disagree about which season it is
    var monthSel = document.getElementById('schedMonth');
    if (monthSel) {
      monthSel.innerHTML = '';
      cfg.months.forEach(function (m) {
        var o = document.createElement('option');
        o.textContent = m;
        monthSel.appendChild(o);
      });
    }
    var sched = document.getElementById('schedForm');
    var closed = document.getElementById('schedClosed');
    if (sched && closed) {
      sched.hidden = !cfg.schedulerOn;
      closed.hidden = !!cfg.schedulerOn;
    }
  })();

  /* ---------- dismissible banner, back on a new session ---------- */
  (function initBanner() {
    var bar = document.getElementById('seasonBar');
    var close = document.getElementById('seasonClose');
    if (!bar || !close) return;
    try {
      if (sessionStorage.getItem('ap-banner-dismissed')) bar.hidden = true;
    } catch (e) {}
    close.addEventListener('click', function () {
      bar.hidden = true;
      try { sessionStorage.setItem('ap-banner-dismissed', '1'); } catch (e) {}
    });
  })();

  /* ---------- condensing header ---------- */
  var head = document.getElementById('siteHead');
  var heroImg = document.getElementById('heroImg');
  if (heroImg && !reduce) heroImg.style.transform = 'scale(1.06)';
  function onScroll() {
    if (head) head.classList.toggle('scrolled', window.scrollY > 24);
    if (heroImg && !reduce) {
      var y = Math.min(window.scrollY, 700);
      heroImg.style.transform = 'translate3d(0,' + (y * 0.13) + 'px,0) scale(1.06)';
    }
  }
  window.addEventListener('scroll', function () { window.requestAnimationFrame(onScroll); }, { passive: true });
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

  /* ---------- slot chips ---------- */
  (function initSlots() {
    var slots = Array.prototype.slice.call(document.querySelectorAll('.slot'));
    slots.forEach(function (s) {
      s.addEventListener('click', function () {
        slots.forEach(function (x) { x.setAttribute('aria-pressed', x === s ? 'true' : 'false'); });
      });
    });
  })();

  /* ---------- scheduler (demo only — no slot here is a real booking) ---------- */
  (function initSched() {
    var form = document.getElementById('schedForm');
    if (!form) return;
    var status = form.querySelector('.sched-status');
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
        status.textContent = 'Please enter a valid phone number.';
        return;
      }
      if (bad) { status.textContent = 'Please complete the highlighted fields.'; return; }
      status.textContent = 'Demo only — this does not book an appointment. Call (443) 396-3888 to confirm a real slot.';
      form.reset();
    });
  })();

  /* ---------- spring list capture ---------- */
  (function initCapture() {
    var form = document.getElementById('captureForm');
    if (!form) return;
    var status = form.querySelector('.capture-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('input[type="email"]');
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
        status.textContent = 'Please enter a valid email address.';
        return;
      }
      status.textContent = 'Demo only — no list is connected yet.';
      form.reset();
    });
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

  /* ---------- year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
