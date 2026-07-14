/* ════════════════════════════════════════════════════════
   MUEVET+ · LA MEDIDA — interacción (vanilla, sin dependencias)
   ════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  /* ── Recargar abre siempre arriba: sin restauración de scroll ni salto a ancla ── */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo(0, 0);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Coreografía de entrada del hero ── */
  document.body.classList.add('is-loaded');

  /* ── Reveals al hacer scroll ── */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal, .mvt-plus, .topo').forEach(el => io.observe(el));

  /* ── Nav: fondo al scrollear + ocultar al bajar, mostrar al subir ── */
  const nav = document.getElementById('nav');
  let lastY = window.scrollY;
  let navTick = false;
  const onNavScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    if (y > 320 && y > lastY + 6) nav.classList.add('is-hidden');
    else if (y < lastY - 6 || y <= 320) nav.classList.remove('is-hidden');
    lastY = y;
    navTick = false;
  };
  window.addEventListener('scroll', () => {
    if (!navTick) { navTick = true; requestAnimationFrame(onNavScroll); }
  }, { passive: true });

  /* ── Enlace activo en nav según sección visible ── */
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  const ioNav = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        navLinks.forEach(a =>
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
      }
    }
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => ioNav.observe(s));

  /* ── Regla lateral: cursor = progreso de scroll (desktop) ── */
  const cursor = document.getElementById('rulerCursor');
  if (cursor && !reduced) {
    let rTick = false;
    const moveCursor = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      cursor.style.transform = `translateY(${p * (window.innerHeight - 2)}px)`;
      rTick = false;
    };
    window.addEventListener('scroll', () => {
      if (!rTick) { rTick = true; requestAnimationFrame(moveCursor); }
    }, { passive: true });
    moveCursor();
  }

  /* ── Marquee RUN+++: velocidad base + reacción sutil al scroll ──
     El único latido experimental de la web. */
  const track = document.getElementById('marqueeTrack');
  if (track && !reduced) {
    let x = 0;
    let vel = 0;                    // aportación del scroll
    let prevY = window.scrollY;
    const BASE = 0.5;               // px/frame ≈ ritmo de trote
    let segW = 0;
    const measure = () => { segW = track.scrollWidth / 4; };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      vel += Math.min(Math.abs(y - prevY) * 0.06, 6);  // impulso limitado
      prevY = y;
    }, { passive: true });
    const loop = () => {
      vel *= 0.92;                  // frenada con inercia
      x -= BASE + vel;
      if (segW > 0 && -x >= segW) x += segW;
      track.style.transform = `translate3d(${x}px,0,0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ── CTA persistente móvil: visible tras el hero, oculto en cierre/footer ── */
  const sticky = document.getElementById('stickyCta');
  const hero = document.querySelector('.hero');
  const closing = document.querySelector('.closing');
  if (sticky && hero && closing) {
    let heroVisible = true, endVisible = false;
    const update = () => {
      const show = !heroVisible && !endVisible;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', String(!show));
      sticky.querySelector('a').tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; update(); },
      { threshold: 0.15 }).observe(hero);
    new IntersectionObserver(([e]) => { endVisible = e.isIntersecting; update(); },
      { threshold: 0.05 }).observe(closing);
  }

  /* ── Deriva sutil de las imágenes de capítulo (±14px, solo ≥768px) ── */
  const driftEls = [...document.querySelectorAll('[data-drift]')];
  if (driftEls.length && !reduced && window.matchMedia('(min-width:768px)').matches) {
    let dTick = false;
    const drift = () => {
      const vh = window.innerHeight;
      for (const el of driftEls) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -40 || r.top > vh + 40) continue;
        let p = (r.top + r.height / 2 - vh / 2) / (vh / 2);
        p = Math.max(-1, Math.min(1, p));
        el.style.transform = `translateY(${(-p * 14).toFixed(1)}px)`;
      }
      dTick = false;
    };
    window.addEventListener('scroll', () => {
      if (!dTick) { dTick = true; requestAnimationFrame(drift); }
    }, { passive: true });
    drift();
  }

  /* ── Tira RUN+++: flechas de teclado + deriva automática en desktop ── */
  const strip = document.getElementById('runStrip');
  if (strip) {
    const step = () => {
      const it = strip.querySelector('.strip-item');
      return it ? it.getBoundingClientRect().width + 20 : 320;
    };
    strip.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        strip.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * step(), behavior: reduced ? 'auto' : 'smooth' });
      }
    });
    if (!reduced && window.matchMedia('(min-width:1080px)').matches) {
      let paused = false, wasPaused = false, inView = false, dir = 1, last = 0;
      let pos = 0;
      ['pointerenter', 'focusin', 'touchstart'].forEach(ev =>
        strip.addEventListener(ev, () => { paused = true; strip.classList.remove('is-drifting'); }, { passive: true }));
      ['pointerleave', 'focusout'].forEach(ev =>
        strip.addEventListener(ev, () => { paused = false; }));
      new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: .2 }).observe(strip);
      const flow = (t) => {
        if (!last) last = t;
        const dt = Math.min(t - last, 50); last = t;
        if (inView && !paused) {
          if (wasPaused) pos = strip.scrollLeft;      // resincronizar tras interacción
          strip.classList.add('is-drifting');
          const max = strip.scrollWidth - strip.clientWidth;
          if (pos >= max - 1) dir = -1;
          else if (pos <= 1) dir = 1;
          pos = Math.max(0, Math.min(max, pos + dir * 20 * dt / 1000));
          strip.scrollLeft = pos;
        }
        wasPaused = paused || !inView;
        requestAnimationFrame(flow);
      };
      requestAnimationFrame(flow);
    }
  }

  /* ── Pila rotatoria de antropometría: cortina desde abajo, pausada fuera de viewport ── */
  const stackEl = document.getElementById('isakStack');
  if (stackEl) {
    const slides = [...stackEl.querySelectorAll('.stack-slide')];
    const dots = [...stackEl.querySelectorAll('.stack-dots i')];
    const cota = document.getElementById('stackCota');
    if (slides.length > 1 && !reduced) {
      let i = 0, timer = null;
      const rotate = () => {
        const prev = slides[i];
        i = (i + 1) % slides.length;
        const next = slides[i];
        prev.classList.add('is-under');
        prev.classList.remove('is-active');
        void next.offsetHeight;                       // reflow: la nueva parte de translateY(100%)
        next.classList.add('is-active');
        dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
        if (cota) cota.textContent = next.dataset.cota;
        setTimeout(() => prev.classList.remove('is-under'), 850);
      };
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !timer) timer = setInterval(rotate, 4500);
        else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
      }, { threshold: .3 }).observe(stackEl);
    }
  }

  /* ── Vídeo RUN+++: reproducir solo cuando es visible, respetando reduced-motion ── */
  const clip = document.getElementById('runClip');
  if (clip && !reduced) {
    const vio = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { clip.play().catch(() => {}); }
      else { clip.pause(); }
    }, { threshold: 0.25 });
    vio.observe(clip);
  }
})();
