/* The Honeywill Team — spec mockup interactions. No framework, no build step. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Condensing header ---------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-condensed", window.scrollY > 40);
  }

  /* ---------- Mobile drawer ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  var drawer = document.getElementById("drawer");
  function setMenu(open) {
    doc.classList.toggle("menu-open", open);
    if (menuBtn) menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (drawer) drawer.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (menuBtn && drawer) {
    menuBtn.addEventListener("click", function () { setMenu(!doc.classList.contains("menu-open")); });
    drawer.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* ---------- Stagger groups: [data-stagger="110"] > .reveal ---------- */
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var step = parseInt(group.getAttribute("data-stagger"), 10) || 100;
    var items = group.querySelectorAll(":scope > .reveal, :scope > .reveal-spring, :scope > li > .reveal");
    items.forEach(function (el, i) { el.style.setProperty("--d", i * step + "ms"); });
  });

  /* ---------- Scroll reveals ---------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-fade, .reveal-spring");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up (confirmed integers only: data-count) ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    if (reduce) { el.textContent = target; return; }
    var start = null, dur = 1400;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { countUp(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Hero parallax: photo and wordmark on separate planes ---------- */
  var heroMedia = document.querySelector(".hero-media");
  var wordmark = document.querySelector(".hero-wordmark span");
  var ticking = false;
  function parallax() {
    ticking = false;
    var y = window.scrollY;
    if (y > window.innerHeight * 1.2) return;
    if (heroMedia) heroMedia.style.transform = "translate3d(0," + (y * 0.22).toFixed(1) + "px,0)";
    if (wordmark) wordmark.style.transform = "translate3d(0," + Math.min(y * 0.04, 8).toFixed(2) * -1 + "px,0) translateX(" + Math.min(y * 0.02, 8).toFixed(2) + "px)";
  }
  window.addEventListener("scroll", function () {
    onScrollHeader();
    if (!reduce && !ticking) { ticking = true; requestAnimationFrame(parallax); }
  }, { passive: true });
  onScrollHeader();

  /* ---------- Centre-dominant carousel ---------- */
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var viewport = root.querySelector(".car-viewport");
    var track = root.querySelector(".car-track");
    var cards = Array.prototype.slice.call(track.children);
    var dotsWrap = root.querySelector(".car-dots");
    var idx = Math.min(1, cards.length - 1);
    var timer = null;
    var dots = cards.map(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show property " + (i + 1));
      b.addEventListener("click", function () { go(i); restart(); });
      if (dotsWrap) dotsWrap.appendChild(b);
      return b;
    });
    function go(i) {
      idx = (i + cards.length) % cards.length;
      var card = cards[idx];
      var offset = viewport.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2);
      track.style.transform = "translate3d(" + offset + "px,0,0)";
      cards.forEach(function (c, n) {
        c.classList.toggle("is-active", n === idx);
        c.setAttribute("aria-hidden", n === idx ? "false" : "true");
      });
      dots.forEach(function (d, n) { d.setAttribute("aria-current", n === idx ? "true" : "false"); });
    }
    function restart() {
      if (reduce) return;
      clearInterval(timer);
      timer = setInterval(function () { go(idx + 1); }, 6000);
    }
    var prev = root.querySelector("[data-prev]"), next = root.querySelector("[data-next]");
    if (prev) prev.addEventListener("click", function () { go(idx - 1); restart(); });
    if (next) next.addEventListener("click", function () { go(idx + 1); restart(); });
    cards.forEach(function (c, n) { c.addEventListener("click", function (e) { if (n !== idx) { e.preventDefault(); go(n); restart(); } }); });
    root.addEventListener("mouseenter", function () { clearInterval(timer); });
    root.addEventListener("mouseleave", restart);
    var sx = null;
    viewport.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
      sx = null;
    });
    window.addEventListener("resize", function () { go(idx); });
    go(idx);
    restart();
  });

  /* ---------- Mockup forms (not connected) ---------- */
  document.querySelectorAll("form[data-mock]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var s = f.querySelector(".form-status");
      if (s) s.textContent = "Mockup only — this form is not connected yet. On the live site a member of the team follows up personally.";
    });
  });
})();

/* ---- Reveal fail-safe ----
   Previews, embeds, link thumbnails and screenshot tools never scroll, so content that
   waits for scroll would render as blank white space. Show everything in those cases. */
(function () {
  var SEL = ".reveal, .reveal-fade, .reveal-spring", CLS = "is-in";
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
