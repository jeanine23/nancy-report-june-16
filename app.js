(function () {
  'use strict';

  /* ============ Theme toggle ============ */
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('nancy-theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);

  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cur = root.getAttribute('data-theme');
      const next = cur === 'light' ? 'dark' : 'light';
      if (next === 'dark') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', 'light');
      localStorage.setItem('nancy-theme', next);
      btn.textContent = next === 'light' ? '☾' : '☀';
    });
    btn.textContent = (root.getAttribute('data-theme') === 'light') ? '☀' : '☾';
  });

  /* ============ Animated counters ============ */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCount(el, target, duration = 1800, prefix = '', suffix = '') {
    const start = performance.now();
    const isFloat = target % 1 !== 0;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const v = target * easeOutCubic(t);
      el.textContent = prefix + (isFloat ? v.toFixed(2) : Math.floor(v).toLocaleString()) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + (isFloat ? target.toFixed(2) : target.toLocaleString()) + suffix;
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.counted) {
        e.target.dataset.counted = '1';
        const target = parseFloat(e.target.dataset.target);
        const prefix = e.target.dataset.prefix || '';
        const suffix = e.target.dataset.suffix || '';
        const duration = parseInt(e.target.dataset.duration) || 1800;
        animateCount(e.target, target, duration, prefix, suffix);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

  /* ============ Reveal on scroll ============ */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ============ Tab system ============ */
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');

  function activate(id) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === id));
    panels.forEach(p => p.classList.toggle('active', p.id === 'panel-' + id));
    // re-trigger counters in newly-active panel
    document.querySelectorAll('#panel-' + id + ' [data-target]').forEach(el => {
      if (el.dataset.counted) {
        delete el.dataset.counted;
        counterObserver.unobserve(el);
        counterObserver.observe(el);
      }
    });
    if (history.replaceState) {
      const hash = '#' + id;
      if (location.hash !== hash) history.replaceState(null, '', hash);
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activate(tab.dataset.tab));
  });

  // hash routing on load
  const initialHash = (location.hash || '').replace('#', '');
  if (initialHash && document.getElementById('panel-' + initialHash)) {
    activate(initialHash);
    // scroll to channels section
    document.getElementById('channels')?.scrollIntoView({ behavior: 'smooth' });
  }

  /* ============ Creative cards → modal ============ */
  const modal = document.getElementById('modal');
  const modalBd = document.getElementById('modal-backdrop');
  const modalRank = document.getElementById('modal-rank');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalSpend = document.getElementById('modal-spend');
  const modalPurchase = document.getElementById('modal-purchase');
  const modalRoas = document.getElementById('modal-roas');

  document.querySelectorAll('.creative').forEach(card => {
    card.addEventListener('click', () => {
      const rank = card.dataset.rank;
      const channel = card.dataset.channel;
      const spend = card.dataset.spend;
      const purchase = card.dataset.purchase;
      const roas = card.dataset.roas;
      modalRank.textContent = `${channel} · Rank ${rank}`;
      modalTitle.textContent = `Top ${rank} Creative`;
      modalDesc.textContent = `One of the top-performing creatives this week on ${channel}, with ${purchase} purchases at $${spend} spend.`;
      modalSpend.textContent = '$' + parseFloat(spend).toLocaleString();
      modalPurchase.textContent = purchase;
      modalRoas.textContent = parseFloat(roas).toFixed(2) + 'x';
      modalBd.classList.add('open');
    });
  });

  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => modalBd.classList.remove('open'));
  });
  modalBd?.addEventListener('click', e => {
    if (e.target === modalBd) modalBd.classList.remove('open');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') modalBd?.classList.remove('open');
  });

  /* ============ Hero stat spotlight ============ */
  const heroStat = document.querySelector('.hero-stat');
  heroStat?.addEventListener('mousemove', e => {
    const r = heroStat.getBoundingClientRect();
    heroStat.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    heroStat.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });

  /* ============ Global spotlight (cursor light) ============ */
  const spotlight = document.querySelector('.spotlight');
  if (spotlight && window.matchMedia('(hover: hover)').matches) {
    document.body.classList.add('spotlight-on');
    let raf;
    document.addEventListener('mousemove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        spotlight.style.left = e.clientX + 'px';
        spotlight.style.top = e.clientY + 'px';
      });
    });
    document.addEventListener('mouseleave', () => document.body.classList.remove('spotlight-on'));
    document.addEventListener('mouseenter', () => document.body.classList.add('spotlight-on'));
  }

  /* ============ Plan list checkbox toggle ============ */
  document.querySelectorAll('.plan-list li').forEach(li => {
    li.addEventListener('click', () => {
      if (!li.classList.contains('static')) li.classList.toggle('done');
    });
  });

  /* ============ Konami easter egg ============ */
  const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;
  document.addEventListener('keydown', e => {
    if (e.key === sequence[pos]) {
      pos++;
      if (pos === sequence.length) {
        document.body.classList.toggle('party');
        pos = 0;
        const s = document.createElement('style');
        s.textContent = `body.party .blob{filter:blur(80px) hue-rotate(0deg);animation:drift 30s ease-in-out infinite, hue 6s linear infinite;}@keyframes hue{from{filter:blur(80px) hue-rotate(0deg)}to{filter:blur(80px) hue-rotate(360deg)}}`;
        document.head.appendChild(s);
      }
    } else {
      pos = 0;
    }
  });

  /* ============ Smooth nav links ============ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
