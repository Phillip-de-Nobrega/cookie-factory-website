/* ============================================================
   The Cookie Factory — site behaviour
   No dependencies. Every icon on the site is inline SVG.
   ============================================================ */
console.log('%c🍪  You found the crumbs.', 'font-size:20px;font-weight:bold;color:#C8202D;');
console.log('%cIf you can read this, you can probably read code too. We\'re hiring: thecookiefactory.co.za/careers.html', 'font-size:13px;color:#715846;');

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine   = window.matchMedia('(pointer: fine)').matches;
  var page   = location.pathname.split('/').pop() || 'index.html';

  document.body.classList.add('pl');
  function markLoaded() { document.body.classList.add('loaded'); }
  if (document.readyState === 'complete') markLoaded();
  else window.addEventListener('load', markLoaded);

  /* ---- Nav: solidify on scroll ---- */
  var nav = document.getElementById('nav');
  var onHero = nav && nav.dataset.hero === 'true';
  function syncNav() {
    if (!nav) return;
    nav.classList.toggle('solid', !onHero || window.scrollY > 50);
  }
  window.addEventListener('scroll', syncNav, { passive: true });
  syncNav();

  /* ---- Mobile menu ---- */
  var burger = document.getElementById('burger');
  var mnav = document.getElementById('mnav');
  if (burger && mnav) {
    var openMenu = function () {
      mnav.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close menu');
    };
    var closeMenu = function () {
      mnav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
    };
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (mnav.classList.contains('open')) { closeMenu(); } else { openMenu(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mnav.classList.contains('open')) { closeMenu(); burger.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!mnav.classList.contains('open')) return;
      if (mnav.contains(e.target) || burger.contains(e.target)) return;
      closeMenu();
    });
    mnav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  /* ---- Active nav link ---- */
  document.querySelectorAll('[data-nav]').forEach(function (a) {
    var target = a.getAttribute('data-nav');
    var isCurrent = target === page;
    a.classList.toggle('active', isCurrent);
    if (isCurrent && a.classList.contains('navlink')) a.setAttribute('aria-current', 'page');
  });

  /* ---- Hero parallax ---- */
  var plate = document.getElementById('hero-plate');
  if (plate && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        plate.style.transform = 'translate3d(0,' + (Math.min(window.scrollY, window.innerHeight) * 0.26).toFixed(2) + 'px,0)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- Reveals, counters, rack fill --------------------------
     IntersectionObserver plus a scroll sweep and a timed backstop,
     so a fast flick or a deep link can never leave a section blank.
     ------------------------------------------------------------ */
  var pending = [].slice.call(document.querySelectorAll('.rv'));

  function activate(el) {
    el.classList.add('in');
    el.querySelectorAll('[data-count]').forEach(runCount);
    el.querySelectorAll('[data-rack]').forEach(function (r) { r.style.setProperty('--rack-fill', '100%'); });
    if (el.hasAttribute('data-rack')) el.style.setProperty('--rack-fill', '100%');
  }

  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { activate(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    pending.forEach(function (el) { io.observe(el); });
  } else {
    pending.forEach(activate);
    pending = [];
  }

  var sweeping = false;
  function sweep() {
    sweeping = false;
    if (!pending.length) return;
    pending = pending.filter(function (el) {
      if (el.classList.contains('in')) return false;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.94) {
        activate(el);
        if (io) io.unobserve(el);
        return false;
      }
      return true;
    });
  }
  window.addEventListener('scroll', function () {
    if (sweeping) return;
    sweeping = true;
    requestAnimationFrame(sweep);
  }, { passive: true });
  window.addEventListener('resize', sweep, { passive: true });
  sweep();
  setTimeout(sweep, 300);
  setTimeout(function () {
    document.querySelectorAll('.rv:not(.in)').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 1.4) activate(el);
    });
  }, 2600);

  function runCount(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    if (reduce) { el.textContent = target; return; }
    var dur = 1400, t0 = performance.now();
    (function tick(now) {
      var p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ---- 3D card tilt (pointer devices only) ---- */
  if (fine && !reduce) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      var raf = null;
      card.addEventListener('pointermove', function (ev) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var b = card.getBoundingClientRect();
          var px = (ev.clientX - b.left) / b.width - 0.5;
          var py = (ev.clientY - b.top) / b.height - 0.5;
          card.style.transform = 'perspective(900px) rotateY(' + (px * 7).toFixed(2) +
            'deg) rotateX(' + (-py * 7).toFixed(2) + 'deg) translateY(-6px)';
          raf = null;
        });
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }

  /* ---- Back to top ---- */
  var toTop = document.getElementById('back-to-top');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ---- Theme toggle ---- */
  var tt = document.getElementById('theme-toggle');
  if (tt) {
    tt.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      if (!cur) cur = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('cf_theme', next); } catch (e) { /* private mode */ }
    });
  }

  /* ---- Stockist finder --------------------------------------
     Shows every stockist by default. The previous build rendered an
     empty grid until you typed, which read as broken.
     ------------------------------------------------------------ */
  var sGrid = document.getElementById('stockist-grid');
  if (sGrid) {
    var sCount  = document.getElementById('stockist-count');
    var sEmpty  = document.getElementById('stockist-empty');
    var sSearch = document.getElementById('stockist-search');
    var sGroup  = document.getElementById('stockist-group');
    var all = [];

    var esc = function (s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    };

    var ARROW = '<svg width="13" height="9" viewBox="0 0 14 10" fill="none" aria-hidden="true">' +
      '<path d="M1 5h11M8.5 1.5 12 5l-3.5 3.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var render = function (list) {
      if (!list.length) {
        sGrid.innerHTML = '';
        if (sEmpty) sEmpty.hidden = false;
        if (sCount) sCount.textContent = 'No stores found';
        return;
      }
      if (sEmpty) sEmpty.hidden = true;
      if (sCount) sCount.textContent = list.length === 1 ? '1 store' : list.length + ' stores';
      sGrid.innerHTML = list.map(function (s) {
        var url = s.googleMapsSearchUrl ||
          ('https://www.google.com/maps/search/?api=1&query=' +
            encodeURIComponent([s.storeName, s.townOrSuburb, s.province].filter(Boolean).join(' ')));
        var place = esc(s.townOrSuburb || '') + (s.province === 'Namibia' ? ' · Namibia' : '');
        return '<li class="s-card">' +
          '<span class="s-tag">' + esc(s.retailerGroup) + '</span>' +
          '<b>' + esc(s.storeName) + '</b>' +
          '<small>' + place + '</small>' +
          '<a class="go" target="_blank" rel="noopener" href="' + esc(url) + '">' +
          'Get directions<span class="vh"> to ' + esc(s.storeName) + '</span> ' + ARROW + '</a>' +
          '</li>';
      }).join('');
    };

    var filterList = function () {
      var q = ((sSearch && sSearch.value) || '').toLowerCase().trim();
      var g = (sGroup && sGroup.value) || '';
      render(all.filter(function (s) {
        if (g && s.retailerGroup !== g) return false;
        if (!q) return true;
        return [s.storeName, s.townOrSuburb, s.suburb, s.province]
          .filter(Boolean).join(' ').toLowerCase().indexOf(q) !== -1;
      }));
    };

    var init = function (data) {
      all = (data || []).slice().sort(function (a, b) { return a.storeName.localeCompare(b.storeName); });
      if (sSearch) sSearch.addEventListener('input', filterList);
      if (sGroup) sGroup.addEventListener('change', filterList);
      filterList();
    };

    if (window.STOCKISTS_DATA) {
      init(window.STOCKISTS_DATA);
    } else {
      fetch('assets/data/stockists.json')
        .then(function (r) { return r.json(); })
        .then(init)
        .catch(function () {
          sGrid.innerHTML = '<li class="s-empty">Could not load the stockist list. ' +
            'Please <a href="contact.html">contact us</a> and we will point you to your nearest store.</li>';
        });
    }
  }

  /* ---- Mailto forms -----------------------------------------
     These open the visitor's email client. A very long order can
     exceed the URL length some clients accept, so warn first.
     ------------------------------------------------------------ */
  var MAILTO_SAFE = 1800;

  document.querySelectorAll('form[data-to]').forEach(function (form) {
    var warn = form.querySelector('.warn');

    var buildBody = function () {
      return [].slice.call(form.querySelectorAll('[name]'))
        .filter(function (f) { return f.value && f.value.trim(); })
        .map(function (f) {
          var label = f.id ? form.querySelector('label[for="' + f.id + '"]') : null;
          var name = label ? label.textContent.replace('*', '').trim() : f.name.replace(/_/g, ' ');
          return name + ': ' + f.value.trim();
        }).join('\r\n\r\n');
    };

    var buildUrl = function () {
      var subject = form.dataset.subject || 'Website Enquiry — The Cookie Factory';
      return 'mailto:' + form.dataset.to +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(buildBody());
    };

    if (warn) {
      form.addEventListener('input', function () {
        warn.classList.toggle('on', buildUrl().length > MAILTO_SAFE);
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      window.location.href = buildUrl();
    });
  });

  /* ---- Easter eggs ---- */
  var EGG_TOTAL = 3;
  var queue = [], showing = false;

  function toast(message) { queue.push(message); drain(); }
  function drain() {
    if (showing || !queue.length) return;
    showing = true;
    var el = document.createElement('div');
    el.className = 'egg-toast';
    el.setAttribute('role', 'status');
    el.textContent = queue.shift();
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('visible'); });
    setTimeout(function () {
      el.classList.remove('visible');
      setTimeout(function () { el.remove(); showing = false; drain(); }, 350);
    }, 3200);
  }
  function unlock(id) {
    var found = [];
    try { found = JSON.parse(localStorage.getItem('cf_eggs_found') || '[]'); } catch (e) { found = []; }
    if (found.indexOf(id) !== -1) return;
    found.push(id);
    try { localStorage.setItem('cf_eggs_found', JSON.stringify(found)); } catch (e) { /* ignore */ }
    toast('🍪 Easter egg found! (' + found.length + '/' + EGG_TOTAL + ')');
  }

  var copyright = document.querySelector('.copyright-line');
  if (copyright) {
    var original = copyright.textContent;
    copyright.addEventListener('click', function () {
      copyright.textContent = 'Est. 2002 · Diep River · still baking fresh biscuits today 🍪';
      unlock('footer-click');
      setTimeout(function () { copyright.textContent = original; }, 3200);
    });
  }

  var originalTitle = document.title;
  var titleEgg = false;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      document.title = 'Come back! 🍪';
      if (!titleEgg) { titleEgg = true; unlock('tab-title'); }
    } else {
      document.title = originalTitle;
    }
  });

  if (page === 'secret-recipe.html') unlock('secret-recipe');
})();
