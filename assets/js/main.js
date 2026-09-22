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
        /* Los 4 puntos del ISAK entran escalonados en vez de a la vez.
           El retardo se pone y se quita aqui, y no con transition-delay
           en CSS, porque .isak-item comparte esa transicion con su
           hover y quedaria pastoso al pasar el raton. */
        if (!reduced && e.target.classList.contains('isak-item')) {
          const i = [...e.target.parentElement.children].indexOf(e.target);
          if (i > 0) {
            const ms = i * 70;
            e.target.style.transitionDelay = ms + 'ms';
            setTimeout(() => { e.target.style.transitionDelay = ''; }, 1000 + ms);
          }
        }
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal, .mvt-plus, .topo').forEach(el => io.observe(el));

  /* Transición de sección: la línea superior se dibuja cuando el capítulo asoma
     (umbral 0: en móvil un capítulo mide varias pantallas y nunca llegaría al 18%) */
  const ioChapter = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      ioChapter.unobserve(e.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -25% 0px' });
  document.querySelectorAll('.chapter').forEach(el => ioChapter.observe(el));

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

  /* ── Marquee RUN+: velocidad base + reacción sutil al scroll ──
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

  /* ── Deriva sutil de las imágenes de capítulo (±10px, solo escritorio con puntero fino) ── */
  const driftEls = [...document.querySelectorAll('[data-drift]')];
  if (driftEls.length && !reduced && window.matchMedia('(min-width:1080px) and (hover:hover) and (pointer:fine)').matches) {
    let dTick = false;
    const drift = () => {
      const vh = window.innerHeight;
      for (const el of driftEls) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -40 || r.top > vh + 40) continue;
        let p = (r.top + r.height / 2 - vh / 2) / (vh / 2);
        p = Math.max(-1, Math.min(1, p));
        el.style.transform = `translateY(${(-p * 10).toFixed(1)}px)`;
      }
      dTick = false;
    };
    window.addEventListener('scroll', () => {
      if (!dTick) { dTick = true; requestAnimationFrame(drift); }
    }, { passive: true });
    drift();
  }

  /* ── Vídeo de medición del hero: póster propio primero, vídeo fundido encima.
     Autoarranca silencioso salvo con reduced-motion o Save-Data: entonces
     queda el póster y un botón para verlo. ── */
  const clip = document.getElementById('heroClip');
  if (clip) {
    const frame = document.getElementById('heroFrame');
    const play = document.getElementById('heroPlay');
    const saveData = !!(navigator.connection && navigator.connection.saveData);
    clip.addEventListener('playing', () => frame.classList.add('is-ready'), { once: true });
    if (!reduced && !saveData) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) clip.play().catch(() => { play.hidden = false; });
        else clip.pause();
      }, { threshold: 0.25 }).observe(clip);
    } else {
      clip.preload = 'none';
      play.hidden = false;
    }
    play.addEventListener('click', () => { play.hidden = true; clip.play().catch(() => {}); });
  }

  /* ── Contadores de cotas: de 0 al valor una sola vez, al entrar en pantalla.
     Con reduced-motion se dejan escritos. ── */
  const counters = [...document.querySelectorAll('[data-count]')];
  if (counters.length && !reduced) {
    const run = (el) => {
      const end = parseInt(el.dataset.count, 10);
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / 700);
        el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { cio.unobserve(e.target); setTimeout(() => run(e.target), 550); }
    }, { threshold: 0.5 });
    counters.forEach(el => { el.textContent = '0'; cio.observe(el); });
  }

  /* ── FAQ: apertura y cierre animados ──
     <details> oculta su contenido al instante al cerrar, asi que la
     altura la conduce WAAPI: hardware-accelerated, interrumpible y sin
     dependencias. Con reduced-motion se deja el comportamiento nativo. */
  document.querySelectorAll('.faq details').forEach((d) => {
    const summary = d.querySelector('summary');
    const body = d.querySelector('.faq-body');
    const inner = d.querySelector('.faq-inner');
    if (!summary || !body || !inner) return;

    let anim = null;

    summary.addEventListener('click', (e) => {
      if (reduced) return;
      e.preventDefault();

      const from = body.getBoundingClientRect().height;
      if (anim) anim.cancel();

      const opening = !d.open;
      if (opening) d.open = true;
      const to = opening ? inner.getBoundingClientRect().height : 0;

      anim = body.animate(
        [{ height: from + 'px' }, { height: to + 'px' }],
        { duration: 260, easing: 'cubic-bezier(.19, 1, .22, 1)' }
      );
      const current = anim;
      current.finished
        .then(() => {
          if (anim !== current) return;   // otra pulsacion tomo el relevo
          anim = null;
          if (!opening) d.open = false;
          body.style.height = '';
        })
        .catch(() => {});                 // cancelada al interrumpir: nada que hacer
    });
  });

  /* ▓▓ FORMULARIO — EDITABLE ▓▓
     Pega aqui la URL de tu app de Google Apps Script (termina en /exec).
     Mientras este vacia, el boton abre el DM de Instagram para no perder
     ningun contacto. */
  const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycby967xzDwrXaPFTkq5bqcqe8QCk191A_0UxeHpP8W0BaCLqIhHf3NlOyOo9Fk44uWxVWg/exec';

  const form = document.getElementById('applyForm');
  if (form) {
    const DM       = 'https://ig.me/m/muevet.mas';
    const deep     = document.getElementById('applyDeep');
    const deepIn   = document.getElementById('applyDeepIn');
    const status   = document.getElementById('applyStatus');
    const submit   = document.getElementById('applySubmit');
    const done     = document.getElementById('applyDone');
    const doneTitle= document.getElementById('applyDoneTitle');

    /* El bloque 03 solo aparece cuando aporta algo: para un analisis
       suelto de 30 EUR, cinco preguntas mas solo restan respuestas. */
    const syncDeep = () => {
      const sel = form.querySelector('input[name="interes"]:checked');
      const open = !!sel && sel.value !== 'Análisis ISAK';
      deep.classList.toggle('is-open', open);
      deepIn.inert = !open;
    };
    form.querySelectorAll('input[name="interes"]').forEach(r => r.addEventListener('change', syncDeep));

    /* Los CTA de Sistemas llegan con el producto ya marcado */
    document.querySelectorAll('[data-preset]').forEach(a => {
      a.addEventListener('click', () => {
        const r = form.querySelector(`input[name="interes"][value="${a.dataset.preset}"]`);
        if (r && !r.checked) { r.checked = true; syncDeep(); }
      });
    });

    const validate = () => {
      form.querySelectorAll('.is-error').forEach(el => el.classList.remove('is-error'));
      status.textContent = '';
      const falta = [];
      const nombre = form.elements.nombre;
      const email  = form.elements.email;
      if (!nombre.value.trim()) {
        nombre.closest('.field').classList.add('is-error'); falta.push('tu nombre');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        email.closest('.field').classList.add('is-error'); falta.push('un email válido');
      }
      [['interes', 'qué te interesa'], ['punto', 'de dónde partes']].forEach(([name, texto]) => {
        if (!form.querySelector(`input[name="${name}"]:checked`)) {
          form.querySelector(`input[name="${name}"]`).closest('.chips').classList.add('is-error');
          falta.push(texto);
        }
      });
      const priv = form.elements.privacidad;
      if (!priv.checked) {
        priv.closest('.check').classList.add('is-error'); falta.push('marcar la casilla de privacidad');
      }
      return falta;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const falta = validate();
      if (falta.length) {
        status.textContent = `FALTA ${falta.join('  ·  ')}`.toUpperCase();
        const primero = form.querySelector('.is-error input, .is-error textarea');
        if (primero) primero.focus({ preventScroll: false });
        return;
      }
      if (!FORM_ENDPOINT) {            // sin backend configurado: no perder el contacto
        window.open(DM, '_blank', 'noopener');
        return;
      }
      const etiqueta = submit.innerHTML;
      submit.disabled = true;
      submit.textContent = 'Enviando…';
      const datos = new URLSearchParams(new FormData(form));
      datos.append('fecha', new Date().toLocaleString('es-ES'));
      try {
        await fetch(FORM_ENDPOINT, { method: 'POST', mode: 'no-cors', body: datos });
        const nombre = form.elements.nombre.value.trim().split(/\s+/)[0];
        doneTitle.textContent = nombre ? `Gracias, ${nombre}.` : 'Gracias.';
        form.hidden = true;
        done.hidden = false;
        done.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      } catch {
        submit.disabled = false;
        submit.innerHTML = etiqueta;
        status.textContent = 'NO SE HA PODIDO ENVIAR  ·  ESCRÍBEME POR INSTAGRAM Y LO VEMOS';
      }
    });
  }

})();
