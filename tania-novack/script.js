/* Tania Novack — mockup interactions. No framework, no build step.
   Content stays visible without JS: hiding only happens under html.js (set inline in <head>). */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lang = doc.getAttribute("lang") === "ru" ? "ru" : "en";

  /* ---------- Condensing sticky header ---------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-condensed", window.scrollY > 40);
  }

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".mobile-menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
        document.body.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
        burger.focus();
      }
    });
  }

  /* ---------- EN/RU toggle: animate pill, then navigate to the equivalent page ---------- */
  document.querySelectorAll(".lang-toggle a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (a.getAttribute("aria-current") === "true" || reduce) return;
      e.preventDefault();
      a.parentElement.classList.add("is-switching");
      setTimeout(function () { window.location.href = a.href; }, 320);
    });
  });

  /* ---------- Hero parallax (transform only) ---------- */
  var heroMedia = document.querySelector(".hero-media, .page-hero .hero-media");
  var ticking = false;
  function parallax() {
    if (!heroMedia || reduce) return;
    var y = window.scrollY;
    if (y < window.innerHeight * 1.2) heroMedia.style.transform = "translate3d(0," + (y * 0.18).toFixed(1) + "px,0)";
  }
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScrollHeader(); parallax(); ticking = false; });
  }, { passive: true });
  onScrollHeader();

  /* ---------- Fit the enormous outlined name to the hero width (desktop) ---------- */
  var nameEl = document.querySelector(".hero-name");
  function fitName() {
    if (!nameEl) return;
    if (window.innerWidth < 720) { nameEl.style.removeProperty("--name-size"); return; }
    var probe = document.createElement("span");
    probe.textContent = nameEl.getAttribute("data-text");
    probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;font-size:100px;letter-spacing:-.02em;text-transform:uppercase;font-weight:400;font-family:" + getComputedStyle(nameEl).fontFamily;
    document.body.appendChild(probe);
    var w = probe.getBoundingClientRect().width;
    probe.remove();
    var avail = nameEl.clientWidth - parseFloat(getComputedStyle(nameEl).paddingLeft) * 2;
    if (w > 0) nameEl.style.setProperty("--name-size", Math.floor((avail / w) * 100 * 0.99) + "px");
  }
  fitName();
  window.addEventListener("resize", fitName);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitName);

  /* ---------- Scroll reveals with stagger ---------- */
  // auto-stagger siblings inside [data-stagger] containers (~90ms apart)
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var gap = parseInt(group.getAttribute("data-stagger"), 10) || 90;
    var kids = group.querySelectorAll(":scope > [data-reveal]");
    kids.forEach(function (el, i) { el.style.setProperty("--d", i * gap + "ms"); });
  });

  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    if (reduce) { el.textContent = target; return; }
    var start = null, dur = 1100;
    el.textContent = "0";
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("is-in");
        el.querySelectorAll("[data-count]").forEach(countUp);
        if (el.hasAttribute("data-count")) countUp(el);
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll("[data-reveal], .desig-icon").forEach(function (el) { io.observe(el); });

    // Stat cards: spring in with a stagger once the hero is on screen, then drift
    var stats = document.querySelectorAll(".stat");
    if (stats.length) {
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          stats.forEach(function (card, i) {
            setTimeout(function () {
              card.classList.add("is-in");
              card.querySelectorAll("[data-count]").forEach(countUp);
              if (!reduce) setTimeout(function () { card.classList.add("drift"); }, 1000);
            }, reduce ? 0 : 450 + i * 140);
          });
          sio.disconnect();
        });
      }, { threshold: 0.05 });
      sio.observe(stats[0].parentElement);
    }
  } else {
    document.querySelectorAll("[data-reveal], .stat, .desig-icon").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Carousels ---------- */
  document.querySelectorAll("[data-carousel]").forEach(function (wrap) {
    var track = wrap.querySelector(".carousel");
    var prev = wrap.querySelector("[data-prev]");
    var next = wrap.querySelector("[data-next]");
    if (!track) return;
    function stepSize() {
      var item = track.firstElementChild;
      if (!item) return 300;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 18;
      return item.getBoundingClientRect().width + gap;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
      if (track.classList.contains("carousel--center")) {
        var mid = track.getBoundingClientRect().left + track.clientWidth / 2, best = null, bestD = Infinity;
        Array.prototype.forEach.call(track.children, function (c) {
          var r = c.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid);
          if (d < bestD) { bestD = d; best = c; }
        });
        Array.prototype.forEach.call(track.children, function (c) { c.classList.toggle("is-center", c === best); });
      }
    }
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -stepSize(), behavior: reduce ? "auto" : "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: stepSize(), behavior: reduce ? "auto" : "smooth" }); });
    track.addEventListener("scroll", function () { requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    // centre the middle listing card on load (desktop)
    if (track.classList.contains("carousel--center") && window.innerWidth >= 1100 && track.children[1]) {
      var c = track.children[1];
      track.scrollLeft = c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2;
    }
    update();
    // keyboard support
    track.setAttribute("tabindex", "0");
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); next && next.click(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev && prev.click(); }
    });
  });

  /* ---------- FAQ: one open at a time ---------- */
  document.querySelectorAll(".faq").forEach(function (faq) {
    var items = faq.querySelectorAll("details");
    items.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        items.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  });

  /* ---------- Mockup forms (no backend) ---------- */
  var msg = {
    en: "Mockup only — this form is not connected yet. Nothing was sent. A real person follows up once the site is live.",
    ru: "Это макет — форма пока не подключена, ничего не отправлено. После запуска сайта с вами свяжется живой человек."
  };
  document.querySelectorAll("form[data-mock]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = f.querySelector(".form-note");
      if (note) note.textContent = msg[lang];
    });
  });

  /* ---------- Year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
