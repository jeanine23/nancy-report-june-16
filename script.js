(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  const curEl = document.getElementById('cur');
  const totEl = document.getElementById('tot');
  totEl.textContent = total;

  function go(n) {
    if (n < 1) n = 1;
    if (n > total) n = total;
    slides.forEach(s => s.classList.remove('active'));
    const target = slides[n - 1];
    target.classList.remove('active');
    void target.offsetWidth;
    target.classList.add('active');
    curEl.textContent = n;
    const hash = '#' + n;
    if (location.hash !== hash) {
      history.replaceState(null, '', hash);
    }
  }

  window.next = () => go(current() + 1);
  window.prev = () => go(current() - 1);

  function current() {
    const m = location.hash.match(/^#(\d+)/);
    return m ? parseInt(m[1], 10) : 1;
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown' || e.key === 'j') {
      e.preventDefault();
      window.next();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'k') {
      e.preventDefault();
      window.prev();
    } else if (e.key === 'Home') {
      e.preventDefault();
      go(1);
    } else if (e.key === 'End') {
      e.preventDefault();
      go(total);
    }
  });

  window.addEventListener('hashchange', () => go(current()));

  go(current());
})();
