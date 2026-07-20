console.log('%c🍪  You found the crumbs.', 'font-size:20px;font-weight:bold;color:#8B5A2B;');
console.log('%cIf you can read this, you can probably read code too. We\'re hiring: thecookiefactory.co.za/careers.html', 'font-size:13px;color:#6b6b6b;');

document.addEventListener('DOMContentLoaded', () => {

  /* ─── Nav scroll behaviour ───────────────────────── */
  const nav = document.getElementById('nav');
  const isHeroNav = nav && nav.dataset.hero === 'true';

  const syncNav = () => {
    if (!nav) return;
    if (!isHeroNav || window.scrollY > 40) {
      nav.classList.add('nav-solid');
    } else {
      nav.classList.remove('nav-solid');
    }
  };
  window.addEventListener('scroll', syncNav, { passive: true });
  syncNav();

  /* ─── Mobile menu ────────────────────────────────── */
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobile-nav');

  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(link =>
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      })
    );
  }

  /* ─── Active nav link ────────────────────────────── */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[href]').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('is-active');
  });

  /* ─── Scroll reveal ──────────────────────────────── */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  /* ─── Back to top ───────────────────────────────── */
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ─── Stockist Finder ───────────────────────────── */
  const stockistGrid = document.getElementById('stockist-grid');
  if (stockistGrid) {
    const stockistSearch = document.getElementById('stockist-search');
    const stockistFilter = document.getElementById('stockist-group-filter');
    const stockistCount = document.getElementById('stockist-count');
    const stockistEmpty = document.getElementById('stockist-empty');

    const GROUP_COLORS = {
      'SPAR': 'bg-green-100 text-green-800',
      'Pick n Pay': 'bg-blue-100 text-blue-800',
      'OK Foods': 'bg-orange-100 text-orange-800',
      'Fuel & Convenience': 'bg-yellow-100 text-yellow-800',
      'Specialist & Independent': 'bg-purple-100 text-purple-800',
    };

    let allStockists = [];

    function renderStockists(list) {
      if (list.length === 0) {
        stockistGrid.innerHTML = '';
        stockistEmpty.classList.remove('hidden');
        stockistCount.textContent = 'No stores found';
        return;
      }
      stockistEmpty.classList.add('hidden');
      stockistCount.textContent = list.length === 1 ? '1 store' : list.length + ' stores';
      stockistGrid.innerHTML = list.map(function(s) {
        const badge = GROUP_COLORS[s.retailerGroup] || 'bg-gray-100 text-gray-700';
        const country = s.country !== 'South Africa' ? ' · ' + s.country : '';
        return '<div class="bg-white border border-warm-border rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col gap-4">' +
          '<div class="flex items-start justify-between gap-3">' +
          '<div class="flex-1 min-w-0">' +
          '<p class="font-semibold text-gray-900 text-sm leading-snug">' + s.storeName + '</p>' +
          '<p class="text-gray-400 text-xs mt-1">' + s.townOrSuburb + country + '</p>' +
          '</div>' +
          '<span class="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ' + badge + ' leading-none whitespace-nowrap">' + s.retailerGroup + '</span>' +
          '</div>' +
          '<a href="' + s.googleMapsSearchUrl + '" target="_blank" rel="noopener" class="flex items-center gap-2 text-xs font-semibold text-brand hover:text-brand-dark transition-colors mt-auto">' +
          '<i data-lucide="navigation" class="w-3.5 h-3.5"></i>' +
          'Get Directions' +
          '</a>' +
          '</div>';
      }).join('');
      if (window.lucide) lucide.createIcons();
    }

    function filterStockists() {
      const q = stockistSearch.value.toLowerCase().trim();
      const group = stockistFilter.value;
      if (!q && !group) {
        stockistGrid.innerHTML = '';
        stockistEmpty.classList.add('hidden');
        stockistCount.textContent = '';
        return;
      }
      const result = allStockists.filter(function(s) {
        const matchGroup = !group || s.retailerGroup === group;
        const matchQ = !q ||
          s.storeName.toLowerCase().includes(q) ||
          s.townOrSuburb.toLowerCase().includes(q) ||
          (s.suburb || '').toLowerCase().includes(q) ||
          s.province.toLowerCase().includes(q);
        return matchGroup && matchQ;
      });
      renderStockists(result);
    }

    function initStockists(data) {
      allStockists = data.sort(function(a, b) { return a.storeName.localeCompare(b.storeName); });
      stockistCount.textContent = '';
      stockistGrid.innerHTML = '';
      stockistEmpty.classList.add('hidden');
      stockistSearch.addEventListener('input', filterStockists);
      stockistFilter.addEventListener('change', filterStockists);
    }

    if (window.STOCKISTS_DATA) {
      initStockists(window.STOCKISTS_DATA);
    } else {
      fetch('assets/data/stockists.json')
        .then(function(r) { return r.json(); })
        .then(initStockists)
        .catch(function() {
          stockistGrid.innerHTML = '<p class="text-gray-400 text-sm col-span-3 py-8">Could not load stockist data. Please try again later.</p>';
        });
    }
  }

  /* ─── CV file picker ────────────────────────────── */
  var cvInput = document.getElementById('cv_file');
  if (cvInput) {
    var cvSelected = document.getElementById('cv-selected');
    var cvFilename = document.getElementById('cv-filename');
    var cvLabel = document.getElementById('cv-label');
    var cvClear = document.getElementById('cv-clear');

    cvInput.addEventListener('change', function() {
      if (cvInput.files && cvInput.files[0]) {
        var name = cvInput.files[0].name;
        cvFilename.textContent = name;
        cvLabel.textContent = 'CV selected';
        cvSelected.classList.remove('hidden');
        cvSelected.classList.add('flex');
      }
    });

    cvClear.addEventListener('click', function() {
      cvInput.value = '';
      cvSelected.classList.add('hidden');
      cvSelected.classList.remove('flex');
      cvLabel.textContent = 'Click to select your CV';
    });
  }

  /* ─── Mailto forms ───────────────────────────────── */
  document.querySelectorAll('form[data-to]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const to = form.dataset.to;
      const subject = form.dataset.subject || 'Website Enquiry — The Cookie Factory';
      const fields = [...form.querySelectorAll('[name]')].filter(function(f) {
        return f.type !== 'file';
      });
      var body = fields.map(f => f.name.replace(/_/g, ' ') + ': ' + f.value).join('\r\n\r\n');
      var cvFile = form.querySelector('input[type="file"]');
      if (cvFile && cvFile.files && cvFile.files[0]) {
        body += '\r\n\r\nCV filename (please attach to this email): ' + cvFile.files[0].name;
      }
      location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  });

  /* ─── Easter eggs ────────────────────────────────── */
  var EGG_TOTAL = 3;

  var toastQueue = [];
  var toastShowing = false;

  function showToast(message, duration) {
    toastQueue.push({ message: message, duration: duration || 3200 });
    processToastQueue();
  }

  function processToastQueue() {
    if (toastShowing || toastQueue.length === 0) return;
    toastShowing = true;
    var item = toastQueue.shift();
    var toast = document.createElement('div');
    toast.className = 'egg-toast';
    toast.textContent = item.message;
    document.body.appendChild(toast);
    requestAnimationFrame(function() { toast.classList.add('visible'); });
    setTimeout(function() {
      toast.classList.remove('visible');
      setTimeout(function() {
        toast.remove();
        toastShowing = false;
        processToastQueue();
      }, 350);
    }, item.duration);
  }

  function unlockEgg(id) {
    var found = [];
    try { found = JSON.parse(localStorage.getItem('cf_eggs_found') || '[]'); } catch (e) { found = []; }
    if (found.indexOf(id) !== -1) return;
    found.push(id);
    try { localStorage.setItem('cf_eggs_found', JSON.stringify(found)); } catch (e) { /* ignore */ }
    showToast('🍪 Easter egg found! (' + found.length + '/' + EGG_TOTAL + ')');
  }

  /* Footer copyright click — founding fact reveal */
  var copyrightTextEl = document.querySelector('.copyright-text');
  if (copyrightTextEl) {
    var originalCopyrightText = copyrightTextEl.textContent;
    var copyrightP = copyrightTextEl.closest('p');
    copyrightP.style.cursor = 'pointer';
    copyrightP.addEventListener('click', function() {
      copyrightTextEl.textContent = 'Est. 2002 · Diep River · still baking fresh biscuits today 🍪';
      unlockEgg('footer-click');
      setTimeout(function() { copyrightTextEl.textContent = originalCopyrightText; }, 3200);
    });
  }

  /* Crumb link shouldn't trigger the footer-click reveal above it */
  document.querySelectorAll('.egg-crumb-link').forEach(function(crumb) {
    crumb.addEventListener('click', function(e) { e.stopPropagation(); });
  });

  /* Tab-away title swap */
  var originalTitle = document.title;
  var titleEggFound = false;
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      document.title = 'Come back! 🍪';
      if (!titleEggFound) { titleEggFound = true; unlockEgg('tab-title'); }
    } else {
      document.title = originalTitle;
    }
  });

  /* Secret recipe page visit */
  if (page === 'secret-recipe.html') {
    unlockEgg('secret-recipe');
  }

});
