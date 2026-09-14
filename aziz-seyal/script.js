/* Aziz Seyal Team — spec mockup interactions. No dependencies. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Condensing sticky header ---- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-condensed", window.scrollY > 40);
  }
  onScrollHeader();

  /* ---- Mobile menu ---- */
  var burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = doc.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".mobile-menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        doc.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && doc.classList.contains("menu-open")) {
        doc.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
        burger.focus();
      }
    });
  }

  /* ---- Scroll reveals with stagger ---- */
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var step = parseInt(group.getAttribute("data-stagger"), 10) || 90;
    Array.prototype.forEach.call(group.querySelectorAll(":scope > [data-reveal]"), function (el, i) {
      el.style.setProperty("--d", i * step + "ms");
    });
  });
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- Count-up (confirmed figures only: elements carry data-count) ---- */
  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (reduce) { el.textContent = target; return; }
    var dur = 1200, start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---- Hero parallax (single held photo) ---- */
  var heroMedia = document.querySelector(".hero-media");
  var ticking = false;
  function parallax() {
    ticking = false;
    if (!heroMedia || reduce) return;
    var y = window.scrollY;
    if (y > window.innerHeight * 1.2) return;
    heroMedia.style.transform = "translate3d(0," + (y * 0.22).toFixed(1) + "px,0)";
  }

  window.addEventListener("scroll", function () {
    onScrollHeader();
    if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
  }, { passive: true });

  /* ---- Carousels (listings + insights) ---- */
  document.querySelectorAll("[data-carousel]").forEach(function (car) {
    var track = car.querySelector(".track");
    var prev = car.querySelector("[data-prev]");
    var next = car.querySelector("[data-next]");
    if (!track) return;
    function stepSize() {
      var item = track.firstElementChild;
      if (!item) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 18;
      return item.getBoundingClientRect().width + gap;
    }
    function update() {
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    }
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -stepSize(), behavior: reduce ? "auto" : "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: stepSize(), behavior: reduce ? "auto" : "smooth" }); });
    track.addEventListener("scroll", function () { requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* ---- Forms: mockup only, not connected ---- */
  document.querySelectorAll("form[data-mock]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = f.querySelector(".form-msg");
      if (msg) msg.textContent = "Mockup only — this form is not connected yet. On the live site a person follows up.";
    });
  });

  /* ---- Year ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
