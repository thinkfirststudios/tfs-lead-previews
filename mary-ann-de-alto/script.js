/* Mary Ann De Alto — spec mockup interactions (no framework) */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Condensing sticky header ---------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-condensed", window.scrollY > 40);
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Mobile menu ---------- */
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

  /* ---------- Scroll reveals with stagger ---------- */
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var step = parseInt(group.getAttribute("data-stagger"), 10) || 100;
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.classList.add("reveal");
      child.style.setProperty("--d", i * step + "ms");
    });
  });
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Count-up (only the confirmed 27+ figure) ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduce) { el.textContent = target; return; }
    var start = null, dur = 1600;
    function frame(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(frame);
    }
    el.textContent = "0";
    requestAnimationFrame(frame);
  }
  if (counters.length) {
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { cio.observe(c); });
    }
  }

  /* ---------- Hero parallax ---------- */
  var parallax = document.querySelectorAll("[data-parallax]");
  if (parallax.length && !reduce) {
    var ticking = false;
    function applyParallax() {
      var y = window.scrollY;
      parallax.forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.25;
        if (y < window.innerHeight * 1.3) el.style.transform = "translate3d(0," + (y * speed).toFixed(1) + "px,0)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(applyParallax); ticking = true; }
    }, { passive: true });
    applyParallax();
  }

  /* ---------- Search card: Buy / Rent fork ---------- */
  var card = document.querySelector(".search-card");
  if (card) {
    var segBtns = card.querySelectorAll(".seg button");
    var price = card.querySelector("#s-price");
    var note = document.querySelector(".search-result");
    var buyPrices = ["Any price", "Set a purchase range"];
    var rentPrices = ["Any monthly rent", "Set a monthly range"];
    function setMode(mode) {
      card.setAttribute("data-mode", mode);
      segBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-mode") === mode ? "true" : "false"); });
      if (price) {
        var opts = mode === "rent" ? rentPrices : buyPrices;
        price.innerHTML = opts.map(function (o) { return "<option>" + o + "</option>"; }).join("");
      }
    }
    segBtns.forEach(function (b) {
      b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); });
    });
    card.addEventListener("submit", function (e) {
      e.preventDefault();
      var mode = card.getAttribute("data-mode") || "buy";
      if (note) {
        note.hidden = false;
        note.querySelector("[data-mode-text]").textContent = mode === "rent" ? "rentals" : "homes for sale";
      }
      var dest = document.getElementById(mode === "rent" ? "rent" : "listings");
      if (dest) setTimeout(function () { dest.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }, 900);
    });
  }

  /* ---------- Carousel with dots ---------- */
  document.querySelectorAll(".carousel").forEach(function (car) {
    var track = car.querySelector(".carousel__track");
    var dotsWrap = car.querySelector(".dots");
    var prev = car.querySelector("[data-prev]");
    var next = car.querySelector("[data-next]");
    if (!track || !dotsWrap) return;
    function perView() {
      var first = track.children[0];
      if (!first) return 1;
      return Math.max(1, Math.round(track.clientWidth / first.getBoundingClientRect().width));
    }
    function pages() { return Math.max(1, Math.ceil(track.children.length / perView())); }
    function buildDots() {
      var n = pages();
      dotsWrap.innerHTML = "";
      for (var i = 0; i < n; i++) {
        var d = document.createElement("button");
        d.type = "button";
        d.setAttribute("aria-label", "Go to slide group " + (i + 1));
        (function (idx) { d.addEventListener("click", function () { goTo(idx); }); })(i);
        dotsWrap.appendChild(d);
      }
      update();
    }
    function current() {
      var max = track.scrollWidth - track.clientWidth;
      if (max <= 0) return 0;
      return Math.round((track.scrollLeft / max) * (pages() - 1));
    }
    function goTo(i) {
      var n = pages();
      i = (i + n) % n;
      var card0 = track.children[i * perView()];
      if (card0) track.scrollTo({ left: card0.offsetLeft - track.offsetLeft - 4, behavior: reduce ? "auto" : "smooth" });
    }
    function update() {
      var c = current();
      Array.prototype.forEach.call(dotsWrap.children, function (d, i) { d.setAttribute("aria-current", i === c ? "true" : "false"); });
    }
    track.addEventListener("scroll", function () { window.requestAnimationFrame(update); }, { passive: true });
    if (prev) prev.addEventListener("click", function () { goTo(current() - 1); });
    if (next) next.addEventListener("click", function () { goTo(current() + 1); });
    window.addEventListener("resize", buildDots);
    buildDots();
  });

  /* ---------- Process tabs ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (wrap) {
    var tabs = wrap.querySelectorAll("[role='tab']");
    var bar = wrap.querySelector(".tabs__bar");
    function moveBar(tab) {
      if (!bar) return;
      bar.style.width = tab.offsetWidth + "px";
      bar.style.transform = "translateX(" + tab.offsetLeft + "px)";
      bar.classList.toggle("is-lease", tab.getAttribute("data-accent") === "steel");
    }
    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) {
          panel.hidden = !on;
          if (on) { panel.classList.remove("is-entering"); void panel.offsetWidth; panel.classList.add("is-entering"); }
        }
      });
      moveBar(tab);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!dir) return;
        var nt = tabs[(i + dir + tabs.length) % tabs.length];
        nt.focus(); select(nt);
      });
    });
    var initial = wrap.querySelector("[aria-selected='true']") || tabs[0];
    if (initial) { moveBar(initial); window.addEventListener("resize", function () { moveBar(wrap.querySelector("[aria-selected='true']")); }); }
  });

  /* ---------- Mockup forms (no data is sent) ---------- */
  document.querySelectorAll("form[data-mock]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = f.querySelector(".form-msg");
      if (msg) {
        msg.hidden = false;
        msg.textContent = "Mockup only — this form is not connected yet. On the live site, Mary Ann follows up personally. [CONFIRM form routing + CRM]";
      }
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
