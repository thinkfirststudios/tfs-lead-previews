/* Kim Burke — consolidation mockup interactions. No framework, no build step. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Condensing sticky header ---- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 40);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile menu ---- */
  var menuBtn = document.querySelector(".menu-btn");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".mobile-menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
        document.body.classList.remove("menu-open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.focus();
      }
    });
  }

  /* ---- Scroll reveals with stagger ---- */
  var groups = document.querySelectorAll("[data-stagger]");
  groups.forEach(function (g) {
    var step = parseInt(g.getAttribute("data-stagger"), 10) || 100;
    Array.prototype.forEach.call(g.querySelectorAll(":scope > .reveal, :scope > * > .reveal.stagger-child"), function (el, i) {
      el.style.setProperty("--d", i * step + "ms");
    });
  });

  var revealEls = document.querySelectorAll(".reveal, .draw");
  if (!("IntersectionObserver" in window) || reduce) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- Count-up (confirmed figures only) ---- */
  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = target + suffix; return; }
    var start = null, dur = 1600;
    function tick(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---- Hero: three-slide crossfade + counter + parallax ---- */
  var slides = document.querySelectorAll(".hero-slide");
  var countEl = document.querySelector("[data-hero-count]");
  var bar = document.querySelector(".hero-meta .bar i");
  var cur = 0;
  function show(i) {
    slides[cur].classList.remove("is-active");
    cur = i;
    slides[cur].classList.add("is-active");
    if (countEl) countEl.textContent = "0" + (cur + 1);
    if (bar && !reduce) { bar.classList.remove("run"); void bar.offsetWidth; bar.classList.add("run"); }
  }
  if (slides.length > 1) {
    if (bar && !reduce) bar.classList.add("run");
    if (!reduce) setInterval(function () { show((cur + 1) % slides.length); }, 6500);
  }

  var parallax = document.querySelectorAll("[data-parallax]");
  if (parallax.length && !reduce) {
    var ticking = false;
    var update = function () {
      parallax.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.25;
        el.style.transform = "translate3d(0," + (-r.top * speed).toFixed(1) + "px,0)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---- Carousels (featured properties) ---- */
  document.querySelectorAll("[data-carousel]").forEach(function (car) {
    var track = car.querySelector(".track");
    var prev = car.querySelector("[data-prev]");
    var next = car.querySelector("[data-next]");
    var dotsWrap = car.querySelector(".car-dots");
    if (!track) return;
    var cards = track.children;
    function stepW() { return cards[0] ? cards[0].getBoundingClientRect().width + 20 : track.clientWidth; }
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -stepW(), behavior: reduce ? "auto" : "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: stepW(), behavior: reduce ? "auto" : "smooth" }); });
    if (dotsWrap) {
      for (var i = 0; i < cards.length; i++) {
        (function (idx) {
          var b = document.createElement("button");
          b.type = "button";
          b.setAttribute("aria-label", "Go to card " + (idx + 1));
          b.addEventListener("click", function () { track.scrollTo({ left: idx * stepW(), behavior: reduce ? "auto" : "smooth" }); });
          dotsWrap.appendChild(b);
        })(i);
      }
      var mark = function () {
        var idx = Math.round(track.scrollLeft / stepW());
        Array.prototype.forEach.call(dotsWrap.children, function (d, j) { d.classList.toggle("on", j === idx); });
      };
      track.addEventListener("scroll", function () { requestAnimationFrame(mark); }, { passive: true });
      mark();
    }
  });

  /* ---- Marketing tiles: each opens a short panel ---- */
  document.querySelectorAll("[data-tiles]").forEach(function (wrap) {
    var panel = document.getElementById(wrap.getAttribute("data-tiles"));
    var tiles = wrap.querySelectorAll(".tile");
    tiles.forEach(function (t) {
      t.addEventListener("click", function () {
        tiles.forEach(function (o) { o.setAttribute("aria-expanded", "false"); });
        t.setAttribute("aria-expanded", "true");
        var tpl = document.getElementById(t.getAttribute("data-panel"));
        if (panel && tpl) {
          panel.style.opacity = 0;
          setTimeout(function () { panel.innerHTML = tpl.innerHTML; panel.style.opacity = 1; }, reduce ? 0 : 180);
        }
      });
    });
  });

  /* ---- Non-functional mockup forms ---- */
  document.querySelectorAll("form[data-mock]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var s = f.querySelector(".form-status");
      if (s) s.textContent = f.getAttribute("data-mock");
    });
  });

  /* ---- Footer year ---- */
  document.querySelectorAll("[data-year]").forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();

/* ---- Reveal fail-safe ----
   Previews, embeds, link thumbnails and screenshot tools never scroll, so content that
   waits for scroll would render as blank white space. Show everything in those cases. */
(function () {
  var SEL = ".reveal", CLS = "in";
  function revealAll() { document.querySelectorAll(SEL).forEach(function (el) { el.classList.add(CLS); }); }
  function start() {
    var inFrame = false;
    try { inFrame = window.self !== window.top; } catch (e) { inFrame = true; }
    if (inFrame || navigator.webdriver) { revealAll(); return; }
    var scrolled = false;
    window.addEventListener("scroll", function () { scrolled = true; }, { passive: true, once: true });
    setTimeout(function () { if (!scrolled) revealAll(); }, 2500);
    window.addEventListener("beforeprint", revealAll);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
