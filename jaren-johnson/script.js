/* [CONFIRM NAME] — spec mockup interactions. No framework, no build step. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Condensing sticky header ---------- */
  var hdr = document.querySelector(".hdr");
  function onScrollHeader() {
    if (!hdr) return;
    hdr.classList.toggle("is-condensed", window.scrollY > 40);
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = doc.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      if (hdr) hdr.classList.toggle("is-condensed", open || window.scrollY > 40);
    });
    document.querySelectorAll(".mnav a").forEach(function (a) {
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

  /* ---------- Scroll reveals with stagger ---------- */
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var step = parseInt(group.getAttribute("data-stagger"), 10) || 90;
    group.querySelectorAll(":scope > .reveal, :scope > * > .reveal").forEach(function (el, i) {
      el.style.setProperty("--d", i * step + "ms");
    });
  });
  var reveals = document.querySelectorAll(".reveal");
  reveals.forEach(function (el) { el.classList.add("reveal-ready"); });
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero parallax (transform only) ---------- */
  var media = document.querySelector(".hero__media");
  if (media && !reduce) {
    var ticking = false;
    var update = function () {
      var y = Math.min(window.scrollY, window.innerHeight * 1.2);
      media.style.transform = "translate3d(0," + (y * 0.28).toFixed(1) + "px,0)";
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }

  /* ---------- Carousel: dots, active (raised) card, swipe track ---------- */
  document.querySelectorAll("[data-carousel]").forEach(function (car) {
    var track = car.querySelector(".car-track");
    var cards = Array.prototype.slice.call(car.querySelectorAll(".pcard"));
    var dots = Array.prototype.slice.call(car.querySelectorAll(".car-dots button"));
    var desktop = window.matchMedia("(min-width: 960px)");
    function setActive(i) {
      cards.forEach(function (c, n) { c.classList.toggle("is-active", n === i); });
      dots.forEach(function (d, n) { d.setAttribute("aria-current", n === i ? "true" : "false"); });
    }
    dots.forEach(function (d, i) {
      d.addEventListener("click", function () {
        setActive(i);
        if (!desktop.matches) {
          var card = cards[i];
          track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2, behavior: reduce ? "auto" : "smooth" });
        }
      });
    });
    var raf = 0;
    track.addEventListener("scroll", function () {
      if (desktop.matches) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var mid = track.scrollLeft + track.clientWidth / 2, best = 0, dist = Infinity;
        cards.forEach(function (c, n) {
          var d = Math.abs(c.offsetLeft + c.clientWidth / 2 - mid);
          if (d < dist) { dist = d; best = n; }
        });
        setActive(best);
      });
    }, { passive: true });
    cards.forEach(function (c, i) {
      c.addEventListener("mouseenter", function () { if (desktop.matches) setActive(i); });
      c.addEventListener("focusin", function () { setActive(i); });
    });
    car.addEventListener("keydown", function (e) {
      var cur = cards.findIndex(function (c) { return c.classList.contains("is-active"); });
      if (e.key === "ArrowRight") { dots[Math.min(cur + 1, dots.length - 1)].click(); }
      if (e.key === "ArrowLeft") { dots[Math.max(cur - 1, 0)].click(); }
    });
    setActive(1);
    if (!desktop.matches) requestAnimationFrame(function () { dots[0] && dots[0].click(); });
  });

  /* ---------- Search bar: mobile "More filters" disclosure ---------- */
  document.querySelectorAll(".sbar__more-toggle").forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (panel) panel.classList.toggle("is-open", open);
    });
  });

  /* ---------- Hero pill field → hands off to the floating search bar ---------- */
  var pill = document.querySelector("[data-hero-pill]");
  if (pill) {
    pill.addEventListener("submit", function (e) {
      var target = document.getElementById("search");
      if (!target) return; // no-JS / sub-page: normal GET to contact page
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      var first = target.querySelector("select");
      setTimeout(function () { first && first.focus({ preventScroll: true }); }, reduce ? 0 : 600);
      try { sessionStorage.setItem("heroNote", pill.querySelector("input").value || ""); } catch (err) {}
    });
  }

  /* Search form: carry hero note along (front-end only — NOT an MLS feed) */
  document.querySelectorAll("[data-search]").forEach(function (form) {
    form.addEventListener("submit", function () {
      var note = "";
      try { note = sessionStorage.getItem("heroNote") || ""; } catch (err) {}
      if (note) {
        var h = document.createElement("input");
        h.type = "hidden"; h.name = "note"; h.value = note;
        form.appendChild(h);
      }
    });
  });

  /* ---------- Contact page: prefill from search query ---------- */
  var enquiry = document.getElementById("enquiry");
  if (enquiry && window.URLSearchParams) {
    var q = new URLSearchParams(window.location.search);
    var parts = [];
    if (q.get("area")) parts.push("Area: " + q.get("area"));
    if (q.get("type")) parts.push("Property type: " + q.get("type"));
    if (q.get("price")) parts.push("Price: " + q.get("price"));
    if (q.get("note")) parts.push("Notes: " + q.get("note"));
    if (q.get("address")) parts.push("Home-value request for: " + q.get("address"));
    var msg = enquiry.querySelector("textarea");
    if (parts.length && msg) {
      msg.value = "Search enquiry\n" + parts.join("\n");
      var buying = enquiry.querySelector('input[value="' + (q.get("address") ? "Selling" : "Buying") + '"]');
      if (buying) buying.checked = true;
    }
  }

  /* ---------- Demo forms (not wired to any mailbox) ---------- */
  document.querySelectorAll("[data-demo-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form-status");
      if (status) status.textContent = "Mockup only — this form is not connected. Destination mailbox is [CONFIRM correct destination mailbox].";
    });
  });

  /* ---------- Year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
