/* Cindy Slabaugh mockup — interactions. Content stays visible without JS (reveal hiding is gated on html.js). */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Condensing sticky header */
  var hdr = document.querySelector('.hdr');
  function onScrollHdr() { if (hdr) hdr.classList.toggle('is-condensed', window.scrollY > 24); }
  onScrollHdr();
  window.addEventListener('scroll', onScrollHdr, { passive: true });

  /* Mobile menu */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('site-nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
    });
  }

  /* Scroll reveals with stagger: children of [data-stagger] get incremental delays */
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    var step = parseInt(group.getAttribute('data-stagger'), 10) || 100;
    group.querySelectorAll('[data-reveal]').forEach(function (el, i) { el.style.setProperty('--d', (i * step) + 'ms'); });
  });
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Count-up — only elements with a numeric data-count attribute animate.
     Decade counts are [CONFIRM] placeholders and deliberately carry no data-count until Cindy confirms figures. */
  var counters = document.querySelectorAll('[data-count]');
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target + suffix; return; }
    var start = null, dur = 1400;
    function tick(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* Hero / page-head parallax (transform only) */
  var par = document.querySelectorAll('[data-parallax]');
  if (!reduce && par.length) {
    var ticking = false;
    function para() {
      par.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.25;
        el.style.transform = 'translate3d(0,' + (-r.top * speed).toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(para); ticking = true; } }, { passive: true });
    para();
  }

  /* Carousels: arrow buttons scroll the associated track by one card */
  document.querySelectorAll('[data-carousel]').forEach(function (car) {
    var track = car.querySelector('.track');
    var id = car.getAttribute('data-carousel');
    var btns = document.querySelectorAll('[data-for="' + id + '"]');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var card = track.firstElementChild;
        var gap = parseFloat(getComputedStyle(track).columnGap) || 22;
        var w = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
        track.scrollBy({ left: (b.getAttribute('data-dir') === 'prev' ? -w : w), behavior: reduce ? 'auto' : 'smooth' });
      });
    });
  });

  /* Mockup forms: never submit anywhere */
  document.querySelectorAll('form[data-mock]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = f.querySelector('.form-msg');
      if (!msg) { msg = document.createElement('p'); msg.className = 'form-msg note'; f.appendChild(msg); }
      msg.innerHTML = '<b>Mockup:</b> this form is not connected yet. On launch it routes to a working inbox <span class="cf">[CONFIRM working email]</span>.';
    });
  });

  /* Year */
  document.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();
