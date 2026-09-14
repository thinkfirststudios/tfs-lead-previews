/* Derek Quarles — spec mockup interactions. No framework, no build step. */
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

  /* ---- Mobile / overflow drawer ---- */
  var burger = document.querySelector(".burger");
  var drawer = document.getElementById("drawer");
  var scrim = document.querySelector(".scrim-bg");
  function setDrawer(open) {
    document.body.classList.toggle("drawer-open", open);
    if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
    if (drawer) drawer.setAttribute("aria-hidden", open ? "false" : "true");
    if (open && drawer) { var f = drawer.querySelector("a"); if (f) f.focus(); }
  }
  if (burger) burger.addEventListener("click", function (e) { e.preventDefault(); setDrawer(!document.body.classList.contains("drawer-open")); });
  document.querySelectorAll("[data-close-drawer]").forEach(function (el) {
    el.addEventListener("click", function (e) { if (el.getAttribute("href") === "#") e.preventDefault(); setDrawer(false); });
  });
  if (scrim) scrim.addEventListener("click", function () { setDrawer(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setDrawer(false); });

  /* ---- Scroll reveals with stagger ---- */
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var step = parseInt(group.getAttribute("data-stagger"), 10) || 90;
    Array.prototype.forEach.call(group.querySelectorAll(":scope > .reveal, :scope > li > .reveal, :scope > * > .reveal"), function (el, i) {
      el.style.setProperty("--d", (i * step) + "ms");
    });
    Array.prototype.forEach.call(group.children, function (el, i) {
      if (el.classList.contains("reveal")) el.style.setProperty("--d", (i * step) + "ms");
    });
  });
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- Count-up (wired but DORMANT: no confirmed figures exist on this site).
         Only elements carrying data-count AND data-confirmed="true" would animate. ---- */
  var counters = document.querySelectorAll('[data-count][data-confirmed="true"]');
  if (counters.length && !reduce && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = parseFloat(el.getAttribute("data-count")), t0 = null;
        function tick(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / 1400, 1), v = end * (1 - Math.pow(1 - p, 3));
          el.textContent = Math.round(v).toLocaleString();
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick); cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---- Hero / page-hero parallax (transform only) ---- */
  var par = document.querySelectorAll("[data-parallax]");
  var ticking = false;
  function parallax() {
    var y = window.scrollY;
    par.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      el.style.transform = "translate3d(0," + (y * 0.18).toFixed(1) + "px,0)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    onScrollHeader();
    if (!reduce && par.length && !ticking) { ticking = true; requestAnimationFrame(parallax); }
  }, { passive: true });
  onScrollHeader();

  /* ---- Property carousel ---- */
  document.querySelectorAll("[data-carousel]").forEach(function (car) {
    var track = car.querySelector(".track");
    var prev = car.querySelector("[data-prev]"), next = car.querySelector("[data-next]");
    if (!track) return;
    function step(dir) {
      var item = track.firstElementChild;
      var w = item ? item.getBoundingClientRect().width + 18 : 300;
      track.scrollBy({ left: dir * w, behavior: reduce ? "auto" : "smooth" });
    }
    if (prev) prev.addEventListener("click", function () { step(-1); });
    if (next) next.addEventListener("click", function () { step(1); });
  });

  /* ---- Guides collage: slow rotating front photo ---- */
  document.querySelectorAll("[data-collage]").forEach(function (col) {
    var figs = col.querySelectorAll("figure");
    if (figs.length < 2 || reduce) return;
    var i = 0;
    setInterval(function () {
      figs.forEach(function (f) { f.classList.remove("is-front"); });
      figs[i % figs.length].classList.add("is-front");
      i++;
    }, 3800);
  });

  /* ---- Search bar: front-end router until an IDX feed exists ---- */
  var search = document.getElementById("home-search");
  if (search) {
    search.addEventListener("submit", function (e) {
      e.preventDefault();
      var loc = search.querySelector("[name=location]").value;
      var type = search.querySelector("[name=type]").value;
      var base = search.getAttribute("data-base") || "";
      if (type === "multi") { window.location.href = base + "multi-family/index.html#enquiry"; return; }
      if (loc === "black-rock") { window.location.href = base + "neighborhoods/black-rock/index.html"; return; }
      window.location.href = base + "contact/index.html?looking=" + encodeURIComponent(type || "buy") + "&area=" + encodeURIComponent(loc || "");
    });
  }

  /* ---- Prefill contact selector from query string ---- */
  var params = new URLSearchParams(window.location.search);
  var intent = document.querySelector("select[name=intent]");
  if (intent && params.get("looking")) {
    var map = { multi: "multi", single: "buy", condo: "buy", land: "buy", commercial: "buy", buy: "buy" };
    intent.value = map[params.get("looking")] || "buy";
  }

  /* ---- Mockup forms: no submission endpoint yet ---- */
  document.querySelectorAll("form[data-mock]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var s = f.querySelector(".form-status");
      if (s) s.textContent = "Mockup only — this form is not connected yet. [CONFIRM form handler + where enquiries are delivered]";
    });
  });

  /* ---- FAQ: close siblings for a tidy accordion ---- */
  document.querySelectorAll(".faq").forEach(function (faq) {
    faq.querySelectorAll("details").forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        faq.querySelectorAll("details").forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  });

  var yr = document.querySelectorAll("[data-year]");
  yr.forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
