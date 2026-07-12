/* ════════════════════════════════════════════════════════
   MUEVET+ · LA MEDIDA — interacción (vanilla, sin dependencias)
   ════════════════════════════════════════════════════════ */
(() => {
  'use strict';
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
  document.querySelectorAll('.reveal, .mvt-plus').forEach(el => io.observe(el));

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
