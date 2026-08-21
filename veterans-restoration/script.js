/* ============================================================
   Veterans Restoration — interactions

   The 24/7 call bar is a plain tel: link in the markup and does not
   depend on this file at all. Nothing on the emergency path does.

   The triage block swaps its instruction card in place — no page load,
   no scroll hunt — because the reader is standing in water on a phone.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- triage content ----------
     Written out in full rather than fetched, so the card swaps instantly
     and works with no network. The Cleaning card is deliberately NOT
     written: the scope is undefined, and inventing emergency steps for a
     service we cannot describe would be guessing. */
  var TRIAGE = {
    water: {
      title: 'Water damage — do this now',
      steps: [
        'Shut the water off at the main. If you don’t know where it is, look for the valve where the supply enters the house or at the meter.',
        'Kill power to the affected areas <strong>only if the breaker is safe to reach</strong>. If you would have to stand in water to get there, don’t — wait for us or the utility.',
        'Do not use a household vacuum on standing water. It is not rated for it and it is an electrocution risk.',
        'Lift furniture legs onto foil or blocks so the stain doesn’t wick up into the frame.',
        'Pull rugs off wet carpet — the dyes transfer and the damage becomes permanent.',
        'Photograph everything <strong>before</strong> you move it. This is the record your claim will be built on.'
      ]
    },
    fire: {
      title: 'Fire damage — do this now',
      steps: [
        'Do not re-enter until the fire department has cleared the structure. Not for pets, not for documents, not for anything.',
        'Do not touch or wipe soot. It smears, and wiping drives it into the surface permanently.',
        'Do not run the HVAC. It pushes smoke and soot through the ducts into rooms the fire never reached.',
        'Do not attempt to clean electronics or textiles yourself — both need specialist handling to be salvageable.',
        'Keep the fire report. Your insurer will ask for it.',
        'Photograph what you can safely reach, from outside if necessary.'
      ]
    },
    mold: {
      title: 'Mold — do this now',
      steps: [
        'Do not disturb, scrub or bleach visible growth. Disturbing it aerosolises spores through the room.',
        'Shut off the HVAC so it isn’t circulating them through the rest of the building.',
        'Isolate the room and keep the door closed.',
        'Find and stop the moisture source — a leak, condensation, or a previous water event that never dried.',
        'Do not attempt DIY removal on a large area. Containment is the part people skip and it is the part that matters.',
        'Photograph the growth and anything wet nearby.'
      ]
    },
    cleaning: {
      title: 'Cleaning restoration',
      steps: null,
      pending: 'Emergency steps for this service are deliberately left unwritten. "Cleaning restoration" is stated in the source but its scope is undefined — it could mean contents cleaning, odour removal, post-construction cleanup or biohazard work, and those have completely different first steps. <strong>[CONFIRM scope first]</strong>, then real steps get written. Guessing here would be worse than a blank.'
    }
  };

  /* ---------- triage tabs ---------- */
  (function initTriage() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.tri-tab'));
    var card = document.getElementById('triCard');
    var title = document.getElementById('triTitle');
    var steps = document.getElementById('triSteps');
    if (!tabs.length || !card) return;

    function select(tab) {
      var type = tab.getAttribute('data-type');
      var data = TRIAGE[type];
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      card.setAttribute('data-type', type);
      card.setAttribute('aria-labelledby', tab.id);
      title.textContent = data.title;
      steps.innerHTML = '';
      if (data.steps) {
        data.steps.forEach(function (s, i) {
          var li = document.createElement('li');
          li.innerHTML = '<span class="tri-n">' + (i + 1) + '</span><span>' + s + '</span>';
          steps.appendChild(li);
        });
      } else {
        var li = document.createElement('li');
        li.innerHTML = '<span class="tri-n">?</span><span>' + data.pending + '</span>';
        steps.appendChild(li);
      }
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var next = tabs[(i + d + tabs.length) % tabs.length];
        next.focus(); select(next);
      });
    });
  })();

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

  /* ---------- "is this an emergency?" routes to the phone, not the form ---------- */
  (function initUrgent() {
    var sel = document.getElementById('urgentField');
    var nudge = document.getElementById('emergencyNudge');
    if (!sel || !nudge) return;
    function sync() { nudge.classList.toggle('show', sel.value === 'yes'); }
    sel.addEventListener('change', sync);
    sync();
  })();

  /* ---------- non-emergency form (demo only) ---------- */
  (function initForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
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
        status.textContent = 'Please enter a valid phone number.';
        return;
      }
      if (bad) { status.textContent = 'Please complete the highlighted fields.'; return; }
      status.textContent = 'Thank you — demo form, nothing is submitted yet.';
      form.reset();
    });
  })();

  /* ---------- year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
