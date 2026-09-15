/* Laura Zafonte — spec mockup interactions. No framework, no build step. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = doc.getAttribute("data-root") || "";

  /* ---------- Condensing sticky header ---------- */
  var header = document.querySelector(".site-header");
  var mobileCta = document.querySelector(".mobile-cta");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-condensed", y > 24);
    if (mobileCta) {
      var nearFooter = (window.innerHeight + y) > (document.body.scrollHeight - 40);
      mobileCta.classList.toggle("is-hidden", nearFooter);
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { toggle.click(); toggle.focus(); }
    });
  }

  /* ---------- Scroll reveals with stagger ---------- */
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var step = parseInt(group.getAttribute("data-stagger"), 10) || 100;
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.classList.add("reveal");
      child.style.transitionDelay = (i * step) + "ms";
    });
  });
  var reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduced) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up (confirmed figures only) ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var from = parseFloat(el.getAttribute("data-from") || "0");
    if (reduced) { el.textContent = target; return; }
    var dur = 1400, start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (target - from) * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length) {
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { runCount(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { cio.observe(c); });
    }
  }

  /* ---------- Hero parallax ---------- */
  var parallax = document.querySelectorAll("[data-parallax]");
  if (parallax.length && !reduced) {
    var ticking = false;
    function applyParallax() {
      parallax.forEach(function (el) {
        var rect = el.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.25;
        el.style.transform = "translate3d(0," + (-rect.top * speed).toFixed(1) + "px,0)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(applyParallax); ticking = true; }
    }, { passive: true });
    applyParallax();
  }

  /* ---------- Carousels ---------- */
  document.querySelectorAll("[data-carousel]").forEach(function (wrap) {
    var track = wrap.querySelector(".carousel-track");
    var prev = wrap.querySelector("[data-prev]");
    var next = wrap.querySelector("[data-next]");
    var dotsWrap = wrap.querySelector(".carousel-dots");
    if (!track) return;
    var items = track.children;
    function stepSize() {
      var first = items[0];
      if (!first) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 18;
      return first.getBoundingClientRect().width + gap;
    }
    function perView() { return Math.max(1, Math.round(track.clientWidth / stepSize())); }
    function pages() { return Math.max(1, items.length - perView() + 1); }
    function current() { return Math.round(track.scrollLeft / stepSize()); }
    function go(i) { track.scrollTo({ left: i * stepSize(), behavior: reduced ? "auto" : "smooth" }); }
    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      for (var i = 0; i < pages(); i++) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Go to slide " + (i + 1));
        (function (n) { b.addEventListener("click", function () { go(n); }); })(i);
        dotsWrap.appendChild(b);
      }
      update();
    }
    function update() {
      var c = current();
      if (prev) prev.disabled = track.scrollLeft < 4;
      if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      if (dotsWrap) Array.prototype.forEach.call(dotsWrap.children, function (d, i) { d.setAttribute("aria-current", String(i === Math.min(c, pages() - 1))); });
    }
    if (prev) prev.addEventListener("click", function () { go(Math.max(0, current() - 1)); });
    if (next) next.addEventListener("click", function () { go(Math.min(pages() - 1, current() + 1)); });
    track.addEventListener("scroll", function () { requestAnimationFrame(update); }, { passive: true });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(Math.min(pages() - 1, current() + 1)); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(Math.max(0, current() - 1)); }
    });
    window.addEventListener("resize", buildDots);
    buildDots();
  });

  /* ---------- Building-first search ---------- */
  var search = document.getElementById("buildingSearch");
  if (search) {
    var out = document.getElementById("searchResult");
    search.addEventListener("submit", function (e) {
      e.preventDefault();
      var b = search.querySelector("[name=building]").value;
      var beds = search.querySelector("[name=beds]");
      var price = search.querySelector("[name=price]");
      var bedsTxt = beds.options[beds.selectedIndex].text;
      var priceTxt = price.options[price.selectedIndex].text;
      var map = {
        "broken-woods-dr": { label: "Broken Woods Dr", href: root + "buildings/broken-woods-dr/index.html" },
        "w-sample-rd": { label: "W Sample Rd", href: root + "buildings/w-sample-rd/index.html" },
        "all": { label: "All Coral Springs", href: root + "buildings/index.html" }
      };
      var dest = map[b] || map.all;
      out.innerHTML = "<strong>" + dest.label + "</strong> &middot; " + bedsTxt + " &middot; " + priceTxt +
        ". Live unit matching needs an IDX feed <span class=\"confirm\">[CONFIRM MLS/IDX access + vendor]</span> &mdash; opening the building guide&hellip;";
      setTimeout(function () { window.location.href = dest.href; }, reduced ? 200 : 1300);
    });
  }

  /* ---------- Seller dialog ---------- */
  var dialog = document.getElementById("sellerDialog");
  document.querySelectorAll("[data-open-seller]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      if (dialog && typeof dialog.showModal === "function") { e.preventDefault(); dialog.showModal(); }
    });
  });
  if (dialog) {
    dialog.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", function () { dialog.close(); }); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
  }

  /* ---------- Mockup forms (no data is sent) ---------- */
  document.querySelectorAll("form[data-mock]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = form.querySelector(".form-msg");
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (msg) msg.textContent = "Mockup only — nothing was sent. On launch this routes directly to Laura, not to a brokerage lead system.";
      form.reset();
    });
  });

  /* ---------- Year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
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
