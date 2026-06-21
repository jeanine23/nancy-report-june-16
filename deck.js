(function () {
  'use strict';

  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  const curEl = document.getElementById('cur');
  const totEl = document.getElementById('tot');
  const bar = document.getElementById('bar');
  totEl.textContent = total;

  /* ============ Counter animation ============ */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCount(el) {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const isFloat = target % 1 !== 0;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const v = target * easeOutCubic(t);
      el.textContent = prefix + (isFloat ? v.toFixed(2) : Math.floor(v).toLocaleString()) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + (isFloat ? target.toFixed(2) : target.toLocaleString()) + suffix;
    }
    requestAnimationFrame(tick);
  }

  /* ============ Slide navigation ============ */
  function go(n) {
    if (n < 1) n = 1;
    if (n > total) n = total;
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === n - 1);
    });
    curEl.textContent = n;
    bar.style.width = (n / total * 100) + '%';

    // animate counters in active slide once
    const active = slides[n - 1];
    active.querySelectorAll('[data-target]').forEach(el => {
      if (!el.dataset.counted) {
        el.dataset.counted = '1';
        // delay to match stagger
        const animIdx = parseInt(el.getAttribute('data-anim')) || 1;
        setTimeout(() => animateCount(el), 250 + animIdx * 150);
      }
    });

    const hash = '#' + n;
    if (location.hash !== hash) history.replaceState(null, '', hash);
  }

  function current() {
    const m = location.hash.match(/^#(\d+)/);
    const n = m ? parseInt(m[1], 10) : 1;
    return Math.min(Math.max(n, 1), total);
  }

  window.next = () => go(current() + 1);
  window.prev = () => go(current() - 1);

  /* ============ Keyboard ============ */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown' || e.key === 'j') {
      e.preventDefault(); window.next();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'k') {
      e.preventDefault(); window.prev();
    } else if (e.key === 'Home') {
      e.preventDefault(); go(1);
    } else if (e.key === 'End') {
      e.preventDefault(); go(total);
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    } else if (/^[0-9]$/.test(e.key)) {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= total) go(n);
    }
  });

  /* ============ Hash sync ============ */
  window.addEventListener('hashchange', () => go(current()));

  /* ============ Touch swipe ============ */
  let touchStartX = 0;
  document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) window.next();
      else window.prev();
    }
  }, { passive: true });

  /* ============ Init ============ */
  go(current());

})();
