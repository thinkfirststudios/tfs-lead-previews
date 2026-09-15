/* Recovery Residence mockup — minimal, calm progressive enhancement.
   Everything on the page reads without this file. Nothing here moves on its own. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Gentle opacity-only reveal (~300ms). Only enabled when JS runs,
        IntersectionObserver exists and the visitor has not asked for reduced motion.
        Anything already on screen is marked visible in the same tick, so nothing flashes. */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    var vh = window.innerHeight || 800;
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh) el.classList.add("is-visible");
    });
    root.classList.add("js");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -5% 0px", threshold: 0.01 });
    items.forEach(function (el) { if (!el.classList.contains("is-visible")) io.observe(el); });
    /* Safety net: never leave content hidden (e.g. print, anchor jumps, odd browsers). */
    window.addEventListener("beforeprint", function () {
      items.forEach(function (el) { el.classList.add("is-visible"); });
    });
  }

  /* 2. Header condenses slightly on scroll — no colour change. */
  var header = document.querySelector(".site-header");
  if (header) {
    var ticking = false;
    var update = function () {
      header.classList.toggle("is-condensed", window.scrollY > 40);
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* 3. Close the mobile menu after choosing a link. */
  var menu = document.querySelector(".nav-menu");
  if (menu) {
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) menu.removeAttribute("open");
    });
  }

  /* 4. Enquiry forms — MOCKUP ONLY. Nothing is sent anywhere.
        Real form vendor must NOT be priced per lead (EKRA / patient brokering) — flag before choosing. */
  Array.prototype.forEach.call(document.querySelectorAll("form[data-mock-form]"), function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form-status");
      if (status) {
        status.textContent = "Mockup only — this enquiry was not sent. In the live site, a person replies within [CONFIRM turnaround].";
        status.focus();
      }
    });
  });

  /* 5. Print the professionals referral sheet. */
  Array.prototype.forEach.call(document.querySelectorAll("[data-print]"), function (btn) {
    btn.hidden = false;
    btn.addEventListener("click", function () { window.print(); });
  });

  /* 6. Footer year. */
  Array.prototype.forEach.call(document.querySelectorAll("[data-year]"), function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();

/* ---- Reveal fail-safe ----
   Previews, embeds, link thumbnails and screenshot tools never scroll, so content that
   waits for scroll would render as blank white space. Show everything in those cases. */
(function () {
  var SEL = ".reveal", CLS = "is-visible";
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
