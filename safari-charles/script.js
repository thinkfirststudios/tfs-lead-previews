/* Safari Homes Group · Legacy Builders Realty — spec mockup interactions */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Condensing sticky header ---- */
  var header = document.querySelector(".header");
  var mcta = document.querySelector(".mcta");
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-condensed", y > 24);
    if (mcta) {
      var nearFooter = (window.innerHeight + y) > (document.body.scrollHeight - 140);
      mcta.classList.toggle("is-hidden", nearFooter);
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile drawer ---- */
  var drawer = document.querySelector(".drawer");
  var openBtn = document.querySelector(".menu-btn");
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    if (openBtn) openBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { var f = drawer.querySelector("a,button"); if (f) f.focus(); }
  }
  if (openBtn) openBtn.addEventListener("click", function () { setDrawer(true); });
  if (drawer) {
    drawer.querySelectorAll("[data-close], .drawer__panel a").forEach(function (el) {
      el.addEventListener("click", function () { setDrawer(false); });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setDrawer(false); });
  }

  /* ---- Hand-drawn underline ---- */
  document.querySelectorAll(".stroke-word").forEach(function (el) {
    requestAnimationFrame(function () { el.classList.add("is-drawn"); });
  });

  /* ---- Scroll reveals with stagger ---- */
  var groups = document.querySelectorAll("[data-stagger]");
  groups.forEach(function (g) {
    var step = parseInt(g.getAttribute("data-stagger"), 10) || 90;
    g.querySelectorAll(":scope > [data-reveal], :scope > [data-pop]").forEach(function (child, i) {
      child.style.setProperty("--d", (i * step) + "ms");
    });
  });
  var watched = document.querySelectorAll("[data-reveal], [data-pop], .doors__rule, .steps");
  function revealAll() { watched.forEach(function (el) { el.classList.add("is-in"); }); }
  /* Fail-safe: previews, embeds, link thumbnails and screenshot tools never scroll,
     so hidden-until-scrolled content would render as blank white space. Show everything there. */
  var inFrame = false;
  try { inFrame = window.self !== window.top; } catch (e) { inFrame = true; }
  if (inFrame || navigator.webdriver) { reduce = true; }
  var userScrolled = false;
  window.addEventListener("scroll", function () { userScrolled = true; }, { passive: true, once: true });
  setTimeout(function () { if (!userScrolled) revealAll(); }, 2500);
  window.addEventListener("beforeprint", revealAll);
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    watched.forEach(function (el) { io.observe(el); });
  } else {
    watched.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---- Count-up (wired, dormant: no confirmed figures exist yet) ----
     Usage once a figure is confirmed: <span data-count="120" data-suffix="+">120+</span> */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = parseFloat(el.getAttribute("data-count")), suf = el.getAttribute("data-suffix") || "";
        if (isNaN(end)) return;
        var t0 = null;
        function tick(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1400, 1), e = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * e).toLocaleString() + suf;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---- Hero parallax ---- */
  var media = document.querySelector(".hero__media");
  if (media && !reduce) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) media.style.transform = "translate3d(0," + (y * 0.12).toFixed(1) + "px,0)";
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- Carousels ---- */
  document.querySelectorAll("[data-carousel]").forEach(function (c) {
    var track = c.querySelector(".carousel__track");
    var prev = c.querySelector("[data-prev]");
    var next = c.querySelector("[data-next]");
    if (!track) return;
    function stepSize() {
      var item = track.firstElementChild;
      return item ? item.getBoundingClientRect().width + 20 : 300;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    }
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -stepSize(), behavior: reduce ? "auto" : "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: stepSize(), behavior: reduce ? "auto" : "smooth" }); });
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* ---- Favourite hearts ---- */
  document.querySelectorAll(".heart").forEach(function (h) {
    h.addEventListener("click", function () {
      var on = h.getAttribute("aria-pressed") === "true";
      h.setAttribute("aria-pressed", on ? "false" : "true");
    });
  });

  /* ---- Toast ---- */
  var toast = document.createElement("div");
  toast.className = "toast"; toast.setAttribute("role", "status");
  document.body.appendChild(toast);
  var tt;
  function say(msg) {
    toast.textContent = msg; toast.classList.add("is-on");
    clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("is-on"); }, 4200);
  }

  /* ---- Search: front-end routing only until a rental feed is confirmed ---- */
  var search = document.querySelector("[data-search]");
  if (search) {
    search.addEventListener("submit", function (e) {
      e.preventDefault();
      var loc = search.querySelector("[name=location]");
      var target = document.getElementById("rentals");
      if (target) target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      say("Mockup: search routes to rentals / area pages until a rental feed is confirmed" + (loc && loc.value ? " (" + loc.options[loc.selectedIndex].text + ")" : "") + ".");
    });
  }

  /* ---- Demo forms ---- */
  document.querySelectorAll("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var s = f.querySelector(".form-status");
      if (s) s.textContent = "Mockup only — no enquiry was sent. Form routing to be connected at build.";
      say("Mockup only — no enquiry was sent.");
    });
  });

  /* ---- Year ---- */
  document.querySelectorAll("[data-year]").forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();
