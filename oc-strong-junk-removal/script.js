/* ============================================================================
   OC Strong Junk Removal — interactions

   This file exists to serve one interaction: get photos off a phone and into
   a quote request with as little friction as possible.

   Two identical uploaders are wired by the same factory (hero + closing) so
   there is no second implementation to drift out of sync.

   The compression step is real, not decorative: a 12MP phone photo is often
   4–8 MB, and four of them on cell data is where this flow dies. Each file is
   drawn to a canvas at a bounded long edge and re-encoded, and the byte count
   shown to the user is measured, not claimed.

   Nothing here posts anywhere — there is no endpoint yet, and there is no
   phone number to SMS-forward to. Both are discovery-call questions.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var MAX_EDGE = 1600;   // px on the long edge — plenty to judge a pile by
  var QUALITY = 0.72;    // JPEG quality after downscale
  var MAX_FILES = 12;

  function kb(bytes) {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    return Math.max(1, Math.round(bytes / 1024)) + ' KB';
  }

  /* --------------------------------------------------------------------------
     Downscale one image file. Falls back to the original file if anything at
     all goes wrong — a working upload beats a clever one.
     -------------------------------------------------------------------------- */
  function compress(file, done) {
    if (!file.type || file.type.indexOf('image/') !== 0) { done(null); return; }
    if (!window.URL || !window.HTMLCanvasElement) { done({ url: null, blobSize: file.size, file: file }); return; }

    var url = URL.createObjectURL(file);
    var img = new Image();

    img.onload = function () {
      var w = img.naturalWidth, h = img.naturalHeight;
      var scale = Math.min(1, MAX_EDGE / Math.max(w, h));
      var cw = Math.max(1, Math.round(w * scale));
      var ch = Math.max(1, Math.round(h * scale));

      var canvas = document.createElement('canvas');
      canvas.width = cw; canvas.height = ch;
      try {
        canvas.getContext('2d').drawImage(img, 0, 0, cw, ch);
      } catch (e) {
        done({ url: url, blobSize: file.size, file: file });
        return;
      }

      var data;
      try { data = canvas.toDataURL('image/jpeg', QUALITY); }
      catch (e) { done({ url: url, blobSize: file.size, file: file }); return; }

      // base64 → bytes, minus padding. Measured, not estimated.
      var b64 = data.split(',')[1] || '';
      var pad = b64.slice(-2) === '==' ? 2 : (b64.slice(-1) === '=' ? 1 : 0);
      var bytes = Math.round(b64.length * 3 / 4) - pad;

      URL.revokeObjectURL(url);
      done({ url: data, blobSize: bytes, file: file });
    };

    img.onerror = function () {
      URL.revokeObjectURL(url);
      done({ url: null, blobSize: file.size, file: file });
    };

    img.src = url;
  }

  /* --------------------------------------------------------------------------
     Uploader factory
     -------------------------------------------------------------------------- */
  function makeUploader(ids) {
    var form = document.getElementById(ids.form);
    var drop = document.getElementById(ids.drop);
    var input = document.getElementById(ids.input);
    var thumbs = document.getElementById(ids.thumbs);
    var note = document.getElementById(ids.note);
    var follow = document.getElementById(ids.follow);
    var status = document.getElementById(ids.status);
    if (!form || !drop || !input || !thumbs) return null;

    var shots = [];   // { url, blobSize, file }

    function totals() {
      var before = 0, after = 0;
      shots.forEach(function (s) { before += s.file.size; after += s.blobSize; });
      return { before: before, after: after };
    }

    function render() {
      thumbs.innerHTML = '';

      shots.forEach(function (s, i) {
        var li = document.createElement('li');
        if (reduce) li.style.animation = 'none';

        if (s.url) {
          var im = document.createElement('img');
          im.src = s.url;
          im.alt = 'Photo ' + (i + 1) + ' attached to this quote request';
          li.appendChild(im);
        }

        var sz = document.createElement('span');
        sz.className = 'sz';
        sz.textContent = kb(s.blobSize);
        li.appendChild(sz);

        var rm = document.createElement('button');
        rm.type = 'button';
        rm.className = 'rm';
        rm.innerHTML = '&times;';
        rm.setAttribute('aria-label', 'Remove photo ' + (i + 1));
        rm.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation();
          shots.splice(i, 1);
          render();
        });
        li.appendChild(rm);

        thumbs.appendChild(li);
      });

      var any = shots.length > 0;
      drop.classList.toggle('armed', any);
      if (follow) follow.hidden = !any;

      if (note) {
        if (any) {
          var t = totals();
          note.hidden = false;
          note.innerHTML = shots.length + ' photo' + (shots.length === 1 ? '' : 's') +
            ' ready &mdash; resized in your browser before sending, <b>' +
            kb(t.before) + ' &rarr; ' + kb(t.after) + '</b>. Nothing has been sent yet.';
        } else {
          note.hidden = true;
          note.innerHTML = '';
        }
      }

      if (status) { status.textContent = ''; status.classList.remove('err'); }
    }

    function add(fileList) {
      var files = Array.prototype.slice.call(fileList || []);
      if (!files.length) return;

      var room = MAX_FILES - shots.length;
      if (room <= 0) {
        if (status) { status.textContent = 'That is as many photos as this form takes. Remove one to add another.'; status.classList.add('err'); }
        return;
      }
      files = files.slice(0, room);

      var pending = files.length;
      files.forEach(function (f) {
        compress(f, function (shot) {
          if (shot) shots.push(shot);
          pending -= 1;
          if (pending === 0) render();
        });
      });
    }

    input.addEventListener('change', function () { add(input.files); });

    /* drag and drop — desktop path */
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault(); e.stopPropagation();
        drop.classList.add('dragging');
      });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault(); e.stopPropagation();
        drop.classList.remove('dragging');
      });
    });
    drop.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) add(e.dataTransfer.files);
    });

    /* Demo submit. There is no endpoint and no number to forward to. */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!status) return;
      status.classList.remove('err');

      if (!shots.length) {
        status.textContent = 'Add at least one photo first — that is the whole idea.';
        status.classList.add('err');
        drop.focus();
        return;
      }

      var missing = false;
      Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (f) {
        if (f.offsetParent === null) return;           // not visible yet
        var empty = !f.value.trim();
        f.classList.toggle('invalid', empty);
        if (empty) missing = true;
      });

      if (missing) {
        status.textContent = 'We need a way to send the quote back, and the city.';
        status.classList.add('err');
        return;
      }

      status.textContent = 'Demo form — nothing is submitted. [CONFIRM form endpoint and where quotes should land.]';
    });

    return {
      open: function () { input.click(); },
      el: drop
    };
  }

  var heroUp = makeUploader({
    form: 'quoteForm', drop: 'drop', input: 'photoInput',
    thumbs: 'thumbs', note: 'compressNote', follow: 'followUp', status: 'formStatus'
  });

  makeUploader({
    form: 'quoteForm2', drop: 'drop2', input: 'photoInput2',
    thumbs: 'thumbs2', note: 'compressNote2', follow: 'followUp2', status: 'formStatus2'
  });

  /* --------------------------------------------------------------------------
     Sticky mini-uploader — appears once the hero dropzone leaves the viewport.
     This is the replacement for the click-to-call bar every competitor has.
     -------------------------------------------------------------------------- */
  (function initSticky() {
    var bar = document.getElementById('stickyUp');
    var hero = document.getElementById('uploader');
    var closing = document.getElementById('closing');
    if (!bar || !hero) return;

    function show(on) {
      bar.classList.toggle('show', on);
      bar.setAttribute('aria-hidden', on ? 'false' : 'true');
    }

    if (!('IntersectionObserver' in window)) { show(true); return; }

    var heroOut = false, closingIn = false;
    function sync() { show(heroOut && !closingIn); }

    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { heroOut = !en.isIntersecting; });
      sync();
    }, { threshold: 0, rootMargin: '-120px 0px 0px 0px' }).observe(hero);

    if (closing) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { closingIn = en.isIntersecting; });
        sync();
      }, { threshold: 0.18 }).observe(closing);
    }

    /* The sticky button opens the camera directly rather than scrolling to a
       box the user then has to tap a second time. */
    var btn = document.getElementById('suBtn');
    if (btn && heroUp) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        heroUp.open();
      });
    }
  })();

  /* --------------------------------------------------------------------------
     Header condense
     -------------------------------------------------------------------------- */
  (function initHead() {
    var head = document.getElementById('siteHead');
    if (!head) return;
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        head.classList.toggle('condensed', window.pageYOffset > 40);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* --------------------------------------------------------------------------
     Mobile nav
     -------------------------------------------------------------------------- */
  (function initNav() {
    var burger = document.getElementById('burger');
    var nav = document.getElementById('mobileNav');
    if (!burger || !nav) return;
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Open menu');
      }
    });
  })();

  /* --------------------------------------------------------------------------
     Scroll reveals
     -------------------------------------------------------------------------- */
  (function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (reduce || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(els, function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  })();

  /* --------------------------------------------------------------------------
     FAQ accordion
     -------------------------------------------------------------------------- */
  (function initAcc() {
    var btns = Array.prototype.slice.call(document.querySelectorAll('.acc-btn'));
    btns.forEach(function (b, i) {
      var panel = document.getElementById(b.getAttribute('aria-controls'));
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') === 'true';
        b.setAttribute('aria-expanded', open ? 'false' : 'true');
        if (panel) panel.hidden = open;
      });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        btns[(i + d + btns.length) % btns.length].focus();
      });
    });
  })();

  /* --------------------------------------------------------------------------
     Year
     -------------------------------------------------------------------------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

})();
