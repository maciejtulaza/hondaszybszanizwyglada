(() => {
  /* ---------- Price from config.js ---------- */
  const cena = Number(window.OGLOSZENIE?.cena);
  if (cena > 0) {
    const txt = cena.toLocaleString('pl-PL').replace(/\s/g, ' '); // 56 999
    document.querySelectorAll('[data-price]').forEach(el => { el.textContent = txt; });
    document.title += ` · ${txt} zł`;
  }

  /* ---------- Mileage from config.js ---------- */
  const przebieg = Number(window.OGLOSZENIE?.przebieg);
  if (przebieg > 0) {
    const full = przebieg.toLocaleString('pl-PL').replace(/\s/g, ' '); // 113 000
    const short = Math.round(przebieg / 1000); // 113
    document.querySelectorAll('[data-przebieg]').forEach(el => {
      el.textContent = el.hasAttribute('data-short') ? `~${short} tys. km` : `~${full}`;
    });
  }

  const COUNT = 26;
  const pad = n => String(n).padStart(2, '0');
  const full = i => `img/${pad(i)}.jpg`;
  const thumb = i => `img/${pad(i)}-thumb.jpg`;

  /* ---------- Gallery ---------- */
  const gallery = document.getElementById('gallery');
  const VISIBLE = 13;
  for (let i = 1; i <= COUNT; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Zdjęcie ${i} z ${COUNT}`);
    b.innerHTML = `<img src="${i === 1 ? full(i) : thumb(i)}" alt="Honda Civic – zdjęcie ${i}" loading="lazy" decoding="async">`;
    if (i === VISIBLE) b.insertAdjacentHTML('beforeend', `<span class="more">+${COUNT - VISIBLE + 1}</span>`);
    b.addEventListener('click', () => {
      if (i === VISIBLE && gallery.classList.contains('is-collapsed')) return expand();
      openLb(i);
    });
    gallery.appendChild(b);
  }
  gallery.classList.add('is-collapsed');
  const toggle = document.createElement('button');
  toggle.className = 'btn btn--ghost gallery__toggle';
  toggle.textContent = `Pokaż wszystkie ${COUNT} zdjęć`;
  toggle.onclick = expand;
  gallery.after(toggle);
  function expand() {
    gallery.classList.remove('is-collapsed');
    gallery.querySelector('.more')?.remove();
    toggle.remove();
  }

  /* ---------- Lightbox ---------- */
  const lb = document.getElementById('lb');
  const lbImg = lb.querySelector('.lb__img');
  const lbCount = lb.querySelector('.lb__count');
  let cur = 1;
  function show(i) {
    cur = (i - 1 + COUNT) % COUNT + 1;
    lbImg.src = full(cur);
    lbCount.textContent = `${cur} / ${COUNT}`;
    [cur + 1, cur - 1].forEach(n => { const p = new Image(); p.src = full((n - 1 + COUNT) % COUNT + 1); });
  }
  function openLb(i) { show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; }
  lb.querySelector('.lb__close').onclick = closeLb;
  lb.querySelector('.lb__prev').onclick = e => { e.stopPropagation(); show(cur - 1); };
  lb.querySelector('.lb__next').onclick = e => { e.stopPropagation(); show(cur + 1); };
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  lbImg.addEventListener('click', () => show(cur + 1));
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') show(cur + 1);
    if (e.key === 'ArrowLeft') show(cur - 1);
  });
  let x0 = null;
  lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  /* ---------- Hero video ---------- */
  // Pick 1080p for large screens, 720p for phones; skip autoplay if user prefers reduced motion or saves data.
  const hv = document.getElementById('heroVideo');
  const saveData = navigator.connection?.saveData;
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && !saveData) {
    const hd = innerWidth >= 961 && innerWidth * devicePixelRatio > 1400;
    hv.src = hd ? hv.dataset.srcHd : hv.dataset.srcSd;
    hv.muted = true;
    hv.play().catch(() => {});
  }

  /* ---------- Full film (YouTube, with sound) ---------- */
  const film = document.getElementById('film');
  const frame = film.querySelector('.film__frame');
  document.getElementById('openFilm').addEventListener('click', () => {
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${frame.dataset.yt}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="Film – Honda Civic"></iframe>`;
    film.hidden = false; document.body.style.overflow = 'hidden'; hv.pause();
  });
  const closeFilm = () => { frame.innerHTML = ''; film.hidden = true; document.body.style.overflow = ''; hv.play?.().catch(() => {}); };
  film.querySelector('.lb__close').onclick = closeFilm;
  film.addEventListener('click', e => { if (e.target === film) closeFilm(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !film.hidden) closeFilm(); });

  /* ---------- Reveal on scroll ---------- */
  const els = document.querySelectorAll('.section .card, .hl, .stat, .contact');
  els.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
})();
