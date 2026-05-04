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

  /* ─── Mailto forms ───────────────────────────────── */
  document.querySelectorAll('form[data-to]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const to = form.dataset.to;
      const subject = form.dataset.subject || 'Website Enquiry — The Cookie Factory';
      const body = [...form.querySelectorAll('[name]')]
        .map(f => `${f.name.replace(/_/g, ' ')}: ${f.value}`)
        .join('\r\n\r\n');
      location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  });

});
