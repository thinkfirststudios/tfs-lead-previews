// Used Phones (usedphones.com) — spec redesign mockup
// Models are the catalogue listed on their live site. Every price and trade-in value
// below is ILLUSTRATIVE — generated for the mockup, not UP's pricing. [CONFIRM pricing]

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ------------------------------------------------------------------
     Catalogue data — [brand, model, release year, tier]
  ------------------------------------------------------------------ */
  const RAW = [
    ['Apple', 'iPhone 7', 2016, 'base'], ['Apple', 'iPhone 7 Plus', 2016, 'plus'],
    ['Apple', 'iPhone 8', 2017, 'base'], ['Apple', 'iPhone 8 Plus', 2017, 'plus'],
    ['Apple', 'iPhone X', 2017, 'pro'], ['Apple', 'iPhone XR', 2018, 'base'],
    ['Apple', 'iPhone XS', 2018, 'pro'], ['Apple', 'iPhone XS Max', 2018, 'max'],
    ['Apple', 'iPhone 11', 2019, 'base'], ['Apple', 'iPhone 11 Pro', 2019, 'pro'], ['Apple', 'iPhone 11 Pro Max', 2019, 'max'],
    ['Apple', 'iPhone 12', 2020, 'base'], ['Apple', 'iPhone 12 Mini', 2020, 'lite'], ['Apple', 'iPhone 12 Pro', 2020, 'pro'], ['Apple', 'iPhone 12 Pro Max', 2020, 'max'],
    ['Apple', 'iPhone 13', 2021, 'base'], ['Apple', 'iPhone 13 Mini', 2021, 'lite'], ['Apple', 'iPhone 13 Pro', 2021, 'pro'], ['Apple', 'iPhone 13 Pro Max', 2021, 'max'],
    ['Apple', 'iPhone 14', 2022, 'base'], ['Apple', 'iPhone 14 Plus', 2022, 'plus'], ['Apple', 'iPhone 14 Pro', 2022, 'pro'], ['Apple', 'iPhone 14 Pro Max', 2022, 'max'],
    ['Apple', 'iPhone 15', 2023, 'base'], ['Apple', 'iPhone 15 Plus', 2023, 'plus'], ['Apple', 'iPhone 15 Pro', 2023, 'pro'], ['Apple', 'iPhone 15 Pro Max', 2023, 'max'],

    ['Google', 'Pixel 3', 2018, 'base'], ['Google', 'Pixel 3 XL', 2018, 'plus'],
    ['Google', 'Pixel 3a', 2019, 'lite'], ['Google', 'Pixel 3a XL', 2019, 'lite'],
    ['Google', 'Pixel 4', 2019, 'base'], ['Google', 'Pixel 4 XL', 2019, 'plus'],
    ['Google', 'Pixel 4a', 2020, 'lite'], ['Google', 'Pixel 5', 2020, 'base'],
    ['Google', 'Pixel 6', 2021, 'base'], ['Google', 'Pixel 6 Pro', 2021, 'pro'], ['Google', 'Pixel 6a', 2022, 'lite'],
    ['Google', 'Pixel 7', 2022, 'base'], ['Google', 'Pixel 7 Pro', 2022, 'pro'],
    ['Google', 'Pixel 8', 2023, 'base'], ['Google', 'Pixel 8 Pro', 2023, 'pro'],

    ['Samsung', 'Galaxy S8', 2017, 'base'], ['Samsung', 'Galaxy S8+', 2017, 'plus'],
    ['Samsung', 'Galaxy S9', 2018, 'base'], ['Samsung', 'Galaxy S9+', 2018, 'plus'],
    ['Samsung', 'Galaxy S10', 2019, 'base'], ['Samsung', 'Galaxy S10+', 2019, 'plus'], ['Samsung', 'Galaxy S10e', 2019, 'lite'],
    ['Samsung', 'Galaxy S20', 2020, 'base'], ['Samsung', 'Galaxy S20+', 2020, 'plus'], ['Samsung', 'Galaxy S20 Ultra', 2020, 'max'],
    ['Samsung', 'Galaxy S21', 2021, 'base'], ['Samsung', 'Galaxy S21+', 2021, 'plus'], ['Samsung', 'Galaxy S21 Ultra', 2021, 'max'],
    ['Samsung', 'Galaxy S22', 2022, 'base'], ['Samsung', 'Galaxy S22+', 2022, 'plus'], ['Samsung', 'Galaxy S22 Ultra', 2022, 'max'],
    ['Samsung', 'Galaxy S23', 2023, 'base'], ['Samsung', 'Galaxy S23+', 2023, 'plus'], ['Samsung', 'Galaxy S23 Ultra', 2023, 'max'],
    ['Samsung', 'Galaxy Note 8', 2017, 'plus'], ['Samsung', 'Galaxy Note 9', 2018, 'plus'],
    ['Samsung', 'Galaxy Note 10', 2019, 'plus'], ['Samsung', 'Galaxy Note 10+', 2019, 'max'],
    ['Samsung', 'Galaxy Note 20', 2020, 'plus'], ['Samsung', 'Galaxy Note 20 Ultra', 2020, 'max'],
    ['Samsung', 'Galaxy Z Fold 3', 2021, 'fold'], ['Samsung', 'Galaxy Z Fold 4', 2022, 'fold'], ['Samsung', 'Galaxy Z Fold 5', 2023, 'fold']
  ];

  const IMG = (id, w = 640) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;
  const PHOTOS = {
    Apple: { 2016: '1512054502232-10a0a035d672', 2017: '1512054502232-10a0a035d672', 2018: '1523206489230-c012c64b2b48', 2019: '1574944985070-8f3ebc6b79d2', 2020: '1605236453806-6ff36851218e', 2021: '1632661674596-df8be070a5c5', 2022: '1678685888221-cda773a3dcdb', 2023: '1580910051074-3eb694886505' },
    Google: ['1598327105666-5b89351aff97', '1556656793-08538906a9f8'],
    Samsung: ['1610945265064-0e34e5519bbf', '1598327105666-5b89351aff97', '1601784551446-20c9e07cdbdb']
  };

  const YEAR_BASE = { 2016: 89, 2017: 129, 2018: 179, 2019: 239, 2020: 309, 2021: 389, 2022: 479, 2023: 589 };
  const BRAND_FACTOR = { Apple: 1, Samsung: 0.88, Google: 0.78 };
  const TIER_FACTOR = { lite: 0.82, base: 1, plus: 1.12, pro: 1.22, max: 1.36, fold: 1.75 };
  const TIER_ORDER = { fold: 0, max: 1, pro: 2, plus: 3, base: 4, lite: 5 };
  const STORAGE_ADD = { 64: 0, 128: 0, 256: 50, 512: 110, 1024: 190 };

  const slugify = (s) => s.toLowerCase().replace(/\+/g, '-plus').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const roundPrice = (n) => Math.max(49, Math.round(n / 10) * 10 - 1);
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const storageLabel = (gb) => (gb >= 1024 ? gb / 1024 + 'TB' : gb + 'GB');

  function storagesFor(brand, year, tier) {
    if (year <= 2018) return [64, 256];
    if (brand === 'Apple' && year >= 2021 && (tier === 'pro' || tier === 'max')) return [128, 256, 512, 1024];
    if (tier === 'max' || tier === 'fold' || tier === 'pro') return [128, 256, 512];
    return [128, 256];
  }

  const MODELS = RAW.map(([brand, name, year, tier], i) => {
    const storages = storagesFor(brand, year, tier);
    const base = YEAR_BASE[year] * BRAND_FACTOR[brand] * TIER_FACTOR[tier];
    const photos = PHOTOS[brand];
    const photo = Array.isArray(photos) ? photos[i % photos.length] : photos[year];
    return {
      brand, name, year, tier, storages, photo,
      slug: slugify(name),
      priceFor: (gb) => roundPrice(base + (STORAGE_ADD[gb] || 0)),
      get from() { return this.priceFor(storages[0]); }
    };
  });
  const bySlug = (slug) => MODELS.find((m) => m.slug === slug);

  $$('[data-model-count]').forEach((el) => { el.textContent = MODELS.length; });

  /* ------------------------------------------------------------------
     Toast
  ------------------------------------------------------------------ */
  const toastEl = $('[data-toast]');
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    $('[data-toast-text]', toastEl).textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 3200);
  }

  /* ------------------------------------------------------------------
     Cart (demo)
  ------------------------------------------------------------------ */
  let cartCount = 0;
  function addToCart(name) {
    cartCount += 1;
    $$('[data-cart-count]').forEach((el) => {
      el.textContent = cartCount;
      el.classList.remove('bump');
      void el.offsetWidth;
      el.classList.add('bump');
      setTimeout(() => el.classList.remove('bump'), 250);
    });
    $$('[data-cart]').forEach((el) => el.setAttribute('aria-label', `Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`));
    toast(`${name} added to cart (demo)`);
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    e.preventDefault();
    addToCart(btn.getAttribute('data-add'));
  });

  /* ------------------------------------------------------------------
     Product card
  ------------------------------------------------------------------ */
  function cardHTML(m) {
    const minGb = storageLabel(m.storages[0]);
    return `
      <article class="card">
        <div class="card-media">
          <img src="${IMG(m.photo)}" width="640" height="480" loading="lazy" alt="Stock placeholder photo, not the actual ${m.name}">
          <span class="card-badges"><span class="badge badge-grade">A grade</span><span class="badge badge-stock">In stock</span></span>
          <span class="img-label">Stock photo</span>
        </div>
        <div class="card-body">
          <span class="card-brand">${m.brand}</span>
          <h3 class="card-title"><a href="product.html?m=${m.slug}">${m.name}</a></h3>
          <div class="card-specs"><span>${minGb}${m.storages.length > 1 ? '+' : ''}</span><span>Unlocked</span><span>Battery <span class="confirm">[CONFIRM]</span></span></div>
          <div class="card-price"><span class="from">from</span><span class="amount">${money(m.from)}</span><span class="confirm">Illustrative</span></div>
          <button class="btn btn-primary btn-sm btn-block" type="button" data-add="${m.name}">Add to cart</button>
        </div>
      </article>`;
  }

  /* ------------------------------------------------------------------
     Top picks carousel
  ------------------------------------------------------------------ */
  const picksTrack = $('[data-picks]');
  if (picksTrack) {
    const picks = ['iphone-13-pro', 'iphone-12', 'galaxy-s22-ultra', 'pixel-7', 'iphone-14-pro', 'iphone-11', 'galaxy-s21', 'galaxy-z-fold-4'];
    picksTrack.innerHTML = picks.map(bySlug).filter(Boolean).map(cardHTML).join('');
    const prev = $('[data-carousel-prev]');
    const next = $('[data-carousel-next]');
    const step = () => {
      const card = picksTrack.firstElementChild;
      return card ? card.getBoundingClientRect().width + 18 : 300;
    };
    const update = () => {
      const max = picksTrack.scrollWidth - picksTrack.clientWidth - 2;
      prev.disabled = picksTrack.scrollLeft <= 2;
      next.disabled = picksTrack.scrollLeft >= max;
    };
    prev.addEventListener('click', () => picksTrack.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => picksTrack.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
    picksTrack.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ------------------------------------------------------------------
     Catalogue + filters
  ------------------------------------------------------------------ */
  const grid = $('[data-grid]');
  if (grid) {
    const PAGE = window.matchMedia('(max-width: 520px)').matches ? 6 : 12;
    const state = { q: '', brand: 'all', storage: 'all', max: 1200, sort: 'newest', shown: PAGE };
    const countEl = $('[data-results-count]');
    const moreBtn = $('[data-load-more]');
    const qEl = $('[data-f-q]');
    const storageEl = $('[data-f-storage]');
    const priceEl = $('[data-f-price]');
    const priceOut = $('[data-f-price-out]');
    const sortEl = $('[data-f-sort]');
    const brandChips = $$('[data-f-brand] .chip');

    function filtered() {
      const q = state.q.trim().toLowerCase();
      let list = MODELS.filter((m) =>
        (state.brand === 'all' || m.brand === state.brand) &&
        (state.storage === 'all' || m.storages.includes(Number(state.storage))) &&
        m.from <= state.max &&
        (!q || `${m.brand} ${m.name}`.toLowerCase().includes(q))
      );
      if (state.sort === 'price-asc') list.sort((a, b) => a.from - b.from);
      else if (state.sort === 'price-desc') list.sort((a, b) => b.from - a.from);
      else list.sort((a, b) => b.year - a.year || TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);
      return list;
    }

    function render() {
      const list = filtered();
      countEl.textContent = list.length;
      grid.innerHTML = list.length
        ? list.slice(0, state.shown).map(cardHTML).join('')
        : '<p class="empty">No models match those filters. <button class="chip" type="button" data-f-reset>Reset filters</button></p>';
      moreBtn.hidden = list.length <= state.shown;
    }

    function setBrand(brand) {
      state.brand = brand;
      brandChips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.value === brand)));
    }

    function reset() {
      Object.assign(state, { q: '', storage: 'all', max: 1200, sort: 'newest', shown: PAGE });
      setBrand('all');
      qEl.value = ''; storageEl.value = 'all'; priceEl.value = 1200; sortEl.value = 'newest';
      priceOut.textContent = money(1200);
      render();
    }

    brandChips.forEach((chip) => chip.addEventListener('click', () => { setBrand(chip.dataset.value); state.shown = PAGE; render(); }));
    qEl.addEventListener('input', () => { state.q = qEl.value; state.shown = PAGE; render(); });
    storageEl.addEventListener('change', () => { state.storage = storageEl.value; state.shown = PAGE; render(); });
    priceEl.addEventListener('input', () => { state.max = Number(priceEl.value); priceOut.textContent = money(state.max); state.shown = PAGE; render(); });
    sortEl.addEventListener('change', () => { state.sort = sortEl.value; render(); });
    moreBtn.addEventListener('click', () => { state.shown += PAGE; render(); });
    document.addEventListener('click', (e) => { if (e.target.closest('[data-f-reset]')) reset(); });

    const filtersToggle = $('[data-filters-toggle]');
    const filtersPanel = $('#filters');
    filtersToggle.addEventListener('click', () => {
      const open = filtersPanel.classList.toggle('is-open');
      filtersToggle.setAttribute('aria-expanded', String(open));
    });

    $$('[data-brand-link]').forEach((a) => a.addEventListener('click', () => { setBrand(a.dataset.brandLink); state.shown = PAGE; render(); }));

    const headerSearch = $('[data-header-search]');
    if (headerSearch) {
      headerSearch.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = $('input', headerSearch).value;
        qEl.value = val; state.q = val; state.shown = PAGE;
        render();
        $('#search-panel').classList.remove('is-open');
        $('[data-search-toggle]').setAttribute('aria-expanded', 'false');
        $('#shop').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }

    render();
  }

  /* ------------------------------------------------------------------
     Trade-in valuation tool (demo calculation)
  ------------------------------------------------------------------ */
  const tool = $('[data-tool]');
  if (tool) {
    const form = $('[data-tool-form]', tool);
    const steps = $$('.tool-step', tool);
    const progress = $$('.tool-progress li', tool);
    const modelSel = $('[data-t-model]', tool);
    const storageWrap = $('[data-t-storage]', tool);
    const nextBtn = $('[data-t-next]', tool);
    const backBtn = $('[data-t-back]', tool);
    const errorEl = $('[data-t-error]', tool);
    let current = 1;

    const val = (name) => (form.querySelector(`input[name="${name}"]:checked`) || {}).value;

    $$('input[name="brand"]', form).forEach((r) => r.addEventListener('change', () => {
      const list = MODELS.filter((m) => m.brand === r.value).sort((a, b) => b.year - a.year || TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);
      modelSel.innerHTML = '<option value="">Choose your model</option>' + list.map((m) => `<option value="${m.slug}">${m.name}</option>`).join('');
      modelSel.disabled = false;
      errorEl.textContent = '';
    }));

    function buildStorage() {
      const m = bySlug(modelSel.value);
      const prev = val('storage');
      storageWrap.innerHTML = m.storages.map((gb) => `
        <div class="opt"><input type="radio" name="storage" id="ts-${gb}" value="${gb}" ${String(gb) === prev ? 'checked' : ''}>
        <label for="ts-${gb}"><strong>${storageLabel(gb)}</strong></label></div>`).join('');
    }

    function validate(step) {
      if (step === 1) {
        if (!val('brand')) return 'Choose a brand.';
        if (!modelSel.value) return 'Choose your model.';
      }
      if (step === 2 && !val('storage')) return 'Choose the storage size.';
      if (step === 3) {
        if (!val('power') || !val('screen') || !val('body') || !val('lock')) return 'Answer all four condition questions.';
      }
      return '';
    }

    function compute() {
      const m = bySlug(modelSel.value);
      const gb = Number(val('storage'));
      let v = m.priceFor(gb) * 0.42;
      if (val('power') === 'no') v *= 0.25;
      v *= { flawless: 1, light: 0.88, cracked: 0.55 }[val('screen')];
      v *= { flawless: 1, light: 0.92, damaged: 0.7 }[val('body')];
      v = Math.max(5, Math.round(v / 5) * 5);
      $('[data-r-device]', tool).textContent = `${m.name} · ${storageLabel(gb)}`;
      $('[data-r-range]', tool).textContent = `Indicative range ${money(Math.max(5, v * 0.92))} – ${money(v * 1.08)}`;
      $('[data-r-credit]', tool).lastChild.textContent = val('lock') === 'no'
        ? ' Turn off Find My / Google lock before shipping'
        : ' Instant credit toward your next UP phone';
      animateNumber($('[data-r-value]', tool), v, (n) => money(n));
    }

    function go(step) {
      current = step;
      steps.forEach((s) => s.classList.toggle('is-active', Number(s.dataset.step) === step));
      progress.forEach((li, i) => {
        li.classList.toggle('done', i + 1 < step);
        li.classList.toggle('current', i + 1 === step);
      });
      backBtn.hidden = step === 1;
      nextBtn.hidden = step === 4;
      nextBtn.firstChild.textContent = step === 3 ? 'See my value ' : 'Continue ';
      errorEl.textContent = '';
      const heading = $(`.tool-step[data-step="${step}"] h3, .tool-step[data-step="${step}"] .result-value`, tool);
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    }

    nextBtn.addEventListener('click', () => {
      const err = validate(current);
      if (err) { errorEl.textContent = err; return; }
      if (current === 1) buildStorage();
      if (current === 3) compute();
      go(current + 1);
    });
    backBtn.addEventListener('click', () => go(Math.max(1, current - 1)));
    form.addEventListener('submit', (e) => e.preventDefault());
    $('[data-t-lock]', tool).addEventListener('click', () => toast('Demo: this would email a quote and a shipping label'));
  }

  /* ------------------------------------------------------------------
     Number animation (count-up)
  ------------------------------------------------------------------ */
  function animateNumber(el, to, fmt = (n) => String(Math.round(n))) {
    if (reduceMotion) { el.textContent = fmt(to); return; }
    const start = performance.now();
    const dur = 1100;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(to * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------
     Scroll reveals + count-up stats
  ------------------------------------------------------------------ */
  const revealEls = $$('.reveal');
  const countEls = $$('[data-count]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));

    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateNumber(entry.target, Number(entry.target.dataset.count));
        cio.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    countEls.forEach((el) => { el.textContent = '0'; cio.observe(el); });
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ------------------------------------------------------------------
     Header: condense on scroll, mobile menu, search
  ------------------------------------------------------------------ */
  const header = $('.site-header');
  const nav = $('#site-nav');
  const menuBtn = $('[data-menu-toggle]');
  const onScroll = () => header && header.classList.toggle('is-condensed', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    if (!nav || !menuBtn) return;
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('use', menuBtn).setAttribute('href', open ? '#i-close' : '#i-menu');
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
    $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  }

  const searchBtn = $('[data-search-toggle]');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const panel = $('#search-panel');
      const open = panel.classList.toggle('is-open');
      searchBtn.setAttribute('aria-expanded', String(open));
      if (open) $('input', panel).focus();
    });
  }

  /* ------------------------------------------------------------------
     Hero slider + parallax
  ------------------------------------------------------------------ */
  const slides = $$('.hero-slide');
  const dots = $$('.hero-dots button');
  if (slides.length > 1) {
    let idx = 0;
    let timer;
    const show = (n) => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, i) => {
        const on = i === idx;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', String(!on));
        $$('a', s).forEach((a) => (on ? a.removeAttribute('tabindex') : a.setAttribute('tabindex', '-1')));
      });
      dots.forEach((d, i) => d.setAttribute('aria-selected', String(i === idx)));
    };
    const start = () => { if (!reduceMotion) { clearInterval(timer); timer = setInterval(() => show(idx + 1), 7000); } };
    const stop = () => clearInterval(timer);
    dots.forEach((d, i) => d.addEventListener('click', () => { show(i); start(); }));
    const hero = $('.hero');
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    hero.addEventListener('focusin', stop);
    hero.addEventListener('focusout', start);
    show(0);
    start();
  }

  const parallaxEls = $$('[data-parallax]');
  if (parallaxEls.length && !reduceMotion) {
    let ticking = false;
    const apply = () => {
      const y = window.scrollY;
      if (y < 900) parallaxEls.forEach((el) => { el.style.transform = `translate3d(0, ${(y * Number(el.dataset.parallax)).toFixed(1)}px, 0)`; });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(apply); ticking = true; } }, { passive: true });
  }

  /* ------------------------------------------------------------------
     Demo forms, notify buttons
  ------------------------------------------------------------------ */
  $$('[data-demo-form]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!f.checkValidity()) { f.reportValidity(); return; }
    const success = f.parentElement.querySelector('[data-form-success]');
    if (success) success.classList.add('is-visible');
    toast('Demo only — this form isn’t connected yet');
    f.reset();
  }));

  $$('[data-notify]').forEach((b) => b.addEventListener('click', () => toast(`Demo: we'd email you when ${b.dataset.notify} launch`)));

  /* ------------------------------------------------------------------
     Product page
  ------------------------------------------------------------------ */
  const pdp = $('[data-pdp]');
  if (pdp) {
    const params = new URLSearchParams(location.search);
    const m = bySlug(params.get('m')) || bySlug('iphone-13-pro');
    let gb = m.storages[0];

    document.title = `Used ${m.name} — Unlocked, A Grade, 90-Day Warranty | Used Phones (UP)`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', `Buy a certified refurbished ${m.name}: A grade, unlocked, tested by our Phone Doctors, with a 90-day warranty.`);

    $$('[data-p-name]').forEach((el) => { el.textContent = m.name; });
    $$('[data-p-brand]').forEach((el) => { el.textContent = m.brand; });
    $('[data-p-year]').textContent = m.year;

    const photos = [m.photo, ...new Set(MODELS.filter((x) => x.brand === m.brand && x.photo !== m.photo).map((x) => x.photo))].slice(0, 4);
    while (photos.length < 4) photos.push(photos[photos.length % Math.max(1, photos.length)]);
    const mainImg = $('[data-p-main]');
    const thumbs = $('[data-p-thumbs]');
    const setMain = (i) => {
      mainImg.src = IMG(photos[i], 1000);
      $$('button', thumbs).forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
    };
    thumbs.innerHTML = photos.map((p, i) => `<button type="button" aria-label="Photo ${i + 1}" aria-pressed="${i === 0}"><img src="${IMG(p, 200)}" width="200" height="200" alt=""></button>`).join('');
    $$('button', thumbs).forEach((b, i) => b.addEventListener('click', () => setMain(i)));
    mainImg.alt = `Stock placeholder photo, not the actual ${m.name} for sale`;
    setMain(0);

    const priceEl = $('[data-p-price]');
    const storageWrap = $('[data-p-storage]');
    const renderPrice = () => {
      priceEl.textContent = money(m.priceFor(gb));
      $('[data-p-storage-label]').textContent = storageLabel(gb);
      $$('button', storageWrap).forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.gb) === gb)));
    };
    storageWrap.innerHTML = m.storages.map((s) => `<button type="button" data-gb="${s}" aria-pressed="false">${storageLabel(s)}<small>${money(m.priceFor(s))}</small></button>`).join('');
    $$('button', storageWrap).forEach((b) => b.addEventListener('click', () => { gb = Number(b.dataset.gb); renderPrice(); }));
    renderPrice();

    const swatches = $$('[data-swatch]');
    swatches.forEach((s) => s.addEventListener('click', () => {
      swatches.forEach((x) => x.setAttribute('aria-pressed', String(x === s)));
      $('[data-p-colour]').textContent = s.dataset.swatch;
    }));

    $('[data-p-add]').addEventListener('click', () => addToCart(`${m.name} ${storageLabel(gb)}`));

    const bar = $('[data-battery-bar]');
    if (bar) requestAnimationFrame(() => { bar.style.width = bar.dataset.batteryBar + '%'; });
  }
})();
