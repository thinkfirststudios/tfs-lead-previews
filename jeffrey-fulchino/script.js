/* FULCHINO spec mockup — shared behaviour. No dependencies. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Condensing header ---- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (nav) nav.classList.toggle("is-condensed", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var burger = document.querySelector(".burger");
  var menu = document.querySelector(".mobile-menu");
  if (burger && menu) {
    var setMenu = function (open) {
      menu.classList.toggle("is-open", open);
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", function () { setMenu(!menu.classList.contains("is-open")); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* ---- Scroll reveals with stagger ---- */
  var groups = document.querySelectorAll("[data-stagger]");
  groups.forEach(function (g) {
    var step = parseInt(g.getAttribute("data-stagger"), 10) || 100;
    g.querySelectorAll(":scope > .reveal").forEach(function (el, i) { el.style.setProperty("--d", i * step + "ms"); });
  });
  var reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduce) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- Count-up: ONLY elements with data-count (the confirmed start year). Licence number never counts. ---- */
  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var end = parseInt(el.getAttribute("data-count"), 10);
    var start = parseInt(el.getAttribute("data-from") || "0", 10);
    if (reduce || isNaN(end)) { el.textContent = end; return; }
    var dur = 1600, t0 = null;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (end - start) * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { var el = en.target; setTimeout(function () { runCount(el); }, parseInt(el.getAttribute("data-delay") || "0", 10)); cio.unobserve(el); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---- Hero parallax ---- */
  var media = document.querySelector("[data-parallax]");
  if (media && !reduce) {
    var ticking = false;
    var par = function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) media.style.transform = "translate3d(0," + (y * 0.18).toFixed(1) + "px,0) scale(1.02)";
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { requestAnimationFrame(par); ticking = true; } }, { passive: true });
    par();
  }

  /* ---- Listing carousel ---- */
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var viewport = root.querySelector(".carousel__viewport");
    var track = root.querySelector(".carousel__track");
    var cards = Array.prototype.slice.call(track.children);
    var dotsWrap = root.querySelector(".dots");
    var idx = Math.min(1, cards.length - 1);
    cards.forEach(function (c, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show sample card " + (i + 1));
      b.addEventListener("click", function () { go(i); });
      dotsWrap.appendChild(b);
      c.addEventListener("click", function () { if (i !== idx) go(i); });
    });
    function go(i) {
      idx = (i + cards.length) % cards.length;
      var card = cards[idx];
      var offset = card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2;
      track.style.transform = "translate3d(" + (-offset) + "px,0,0)";
      cards.forEach(function (c, n) {
        c.classList.toggle("is-active", n === idx);
        c.setAttribute("aria-hidden", n === idx ? "false" : "true");
      });
      dotsWrap.querySelectorAll("button").forEach(function (d, n) { d.setAttribute("aria-current", n === idx ? "true" : "false"); });
    }
    root.querySelector("[data-prev]").addEventListener("click", function () { go(idx - 1); });
    root.querySelector("[data-next]").addEventListener("click", function () { go(idx + 1); });
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); }
    });
    var sx = null;
    viewport.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
      sx = null;
    });
    window.addEventListener("resize", function () { go(idx); });
    window.addEventListener("load", function () { go(idx); });
    go(idx);
  });

  /* ---- Insights filter (category view) ---- */
  var filterBar = document.querySelector("[data-filters]");
  if (filterBar) {
    filterBar.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      var cat = b.getAttribute("data-cat");
      filterBar.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      document.querySelectorAll("[data-post-cat]").forEach(function (p) {
        p.hidden = !(cat === "all" || p.getAttribute("data-post-cat").indexOf(cat) > -1);
      });
    });
  }

  /* ---- Mock forms: not connected ---- */
  document.querySelectorAll("form[data-mock]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = f.querySelector(".form__msg") || f.parentNode.querySelector(".form__msg");
      if (msg) msg.textContent = "Mockup only — this form is not connected yet. A real version routes to Jeffrey, and a person follows up.";
    });
  });

  var yr = document.querySelectorAll("[data-year]");
  yr.forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* ---- Reveal fail-safe ----
   Previews, embeds, link thumbnails and screenshot tools never scroll, so content that
   waits for scroll would render as blank white space. Show everything in those cases. */
(function () {
  var SEL = ".reveal", CLS = "is-in";
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
