/* ════════════════════════════════════════════════════════════════
   MUEVET+ · interacción (vanilla, sin dependencias)
   Escenas de scroll con un solo bucle rAF, vídeos diferidos,
   comparador, inclinación 3D y el cuestionario.
   ════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const d = document;
  const root = d.documentElement;
  const $ = (s, el = d) => el.querySelector(s);
  const $$ = (s, el = d) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  /* Recargar abre siempre arriba (sin restauración ni salto a ancla) */
  try {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (location.hash && !d.body.classList.contains('doc-page')) history.replaceState(null, '', location.pathname + location.search);
  } catch (e) { /* entornos con historial restringido */ }
  window.scrollTo(0, 0);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const isDesktop = () => innerWidth >= 1024;
  if (!reduced) root.classList.add('motion');

  /* ── Nav: vidrio al hacer scroll ── */
  const nav = $('#nav');
  const navGlass = () => nav && nav.classList.toggle('is-scrolled', scrollY > 24);
  navGlass();
  addEventListener('scroll', navGlass, { passive: true });

  /* ── Menú móvil ── */
  const toggle = $('#navToggle');
  const menu = $('#menu');
  if (toggle && menu) {
    const label = $('[data-label]', toggle);
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      label.textContent = open ? 'Cerrar menú' : 'Abrir menú';
      nav.classList.toggle('is-open', open);
      root.style.overflow = open ? 'hidden' : '';
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
      } else {
        menu.classList.remove('is-open');
        setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduced ? 0 : 260);
      }
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setOpen(false)));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); } });
    addEventListener('resize', () => { if (isDesktop() && toggle.getAttribute('aria-expanded') === 'true') setOpen(false); });
  }

  /* ── Enlace activo según la sección visible ── */
  const navLinks = $$('.nav-links a');
  const navTargets = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if (navTargets.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + e.target.id)));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navTargets.forEach((t) => io.observe(t));
  }

  /* ── Revelados: el contenido existe visible; solo se oculta si hay movimiento y observador ── */
  const rv = $$('[data-rv]');
  if (reduced || !('IntersectionObserver' in window)) {
    rv.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    rv.forEach((el) => io.observe(el));
  }

  /* ── Manifiesto: las palabras se encienden al leerlas ── */
  const manifest = $('[data-words]');
  let words = [];
  if (manifest && !reduced) {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(part)); return; }
            const s = d.createElement('span');
            s.className = 'w';
            s.textContent = part;
            frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(manifest);
    words = $$('.w', manifest);
    words.forEach((w) => { w.style.opacity = '.16'; });
  }

  /* ════ Escenas ligadas al scroll: un solo bucle rAF ════ */
  const scenes = [];
  const scene = (el, fn) => { if (el) scenes.push({ el, fn, on: true }); };
  let ticking = false;
  const frame = () => {
    ticking = false;
    const vh = innerHeight;
    for (const s of scenes) {
      if (!s.on) continue;
      s.fn(s.el.getBoundingClientRect(), vh);
    }
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };

  if (!reduced) {
    /* Portada: el wordmark sube más despacio que la página */
    const hero = $('#top');
    const mark = $('#heroMark');
    scene(hero, (r) => {
      const p = clamp(-r.top / r.height);
      if (mark) mark.style.transform = `translate(-50%, ${34 - p * 26}%)`;
    });

    /* Manifiesto palabra a palabra */
    if (manifest && words.length) {
      scene(manifest, (r, vh) => {
        const q = clamp((vh * 0.88 - r.top) / (r.height + vh * 0.38));
        const n = words.length;
        words.forEach((w, i) => { w.style.opacity = (0.16 + 0.84 * clamp(q * (n + 4) - i)).toFixed(3); });
      });
    }

    /* Foto pequeña de Medir: deriva suave */
    const phb = $('.ph-b');
    scene(phb, (r, vh) => {
      const p = clamp((vh - r.top) / (vh + r.height));
      phb.style.setProperty('--py', `${((0.5 - p) * 60).toFixed(1)}px`);
    });

    /* Mide → Analiza → Mejora: la línea se dibuja */
    const steps = $('#steps');
    const stepsFill = $('#stepsFill');
    if (stepsFill) stepsFill.style.setProperty('--sx', '0');
    scene(steps, (r, vh) => {
      if (stepsFill) stepsFill.style.setProperty('--sx', clamp((vh * 0.9 - r.top) / (vh * 0.5)).toFixed(3));
    });

    /* COACH: el carril se llena y enciende el paso que lees */
    const csteps = $('#csteps');
    const rail = $('#railFill');
    if (csteps) {
      csteps.classList.add('live');
      if (rail) rail.style.setProperty('--sy', '0');
      const items = $$('.cstep', csteps);
      scene(csteps, (r, vh) => {
        const q = clamp((vh * 0.6 - r.top) / r.height);
        if (rail) rail.style.setProperty('--sy', q.toFixed(3));
        const y = q * r.height;
        items.forEach((li) => li.classList.toggle('on', li.offsetTop <= y + 6));
      });
    }

    /* RUN+: el vídeo se ve a través de las letras; acercamos al «+» y se abre */
    const run = $('#corre');
    const mask = $('#runMask');
    const outline = $('#runOutline');
    const plus = $('#runPlus');
    const shade = $('#runShade');
    const copy = $('#runCopy');
    if (run && mask && plus) {
      const setOrigin = () => {
        mask.style.transform = 'none';
        const m = mask.getBoundingClientRect();
        const p = plus.getBoundingClientRect();
        mask.style.transformOrigin = `${(p.left + p.width / 2 - m.left).toFixed(1)}px ${(p.top + p.height * 0.52 - m.top).toFixed(1)}px`;
        if (outline) outline.style.transformOrigin = mask.style.transformOrigin;
      };
      setOrigin();
      addEventListener('resize', setOrigin);
      d.fonts && d.fonts.ready.then(setOrigin);
      scene(run, (r, vh) => {
        const p = clamp(-r.top / Math.max(1, r.height - vh));
        const z = easeOut(clamp(p / 0.62));
        const sc = `scale(${(1 + z * z * 7).toFixed(3)})`;
        const mo = (1 - clamp((p - 0.3) / 0.28)).toFixed(3);
        mask.style.transform = sc; mask.style.opacity = mo;
        if (outline) { outline.style.transform = sc; outline.style.opacity = (mo * (1 - clamp(p / 0.25))).toFixed(3); }
        const c = clamp((p - 0.5) / 0.2);
        shade.style.opacity = c.toFixed(3);
        copy.style.opacity = c.toFixed(3);
        copy.style.transform = `translateY(${((1 - c) * 28).toFixed(1)}px)`;
        copy.style.pointerEvents = c > 0.5 ? 'auto' : 'none';
      });
    }

    /* App: el móvil gira hacia ti al entrar */
    const phone = $('#phone');
    const device = $('#appDevice');
    let tiltX = 0, tiltY = 0;
    let appQ = 0;
    const setPhone = () => {
      if (!phone) return;
      const e = easeOut(appQ);
      phone.style.setProperty('--ry', `${(-24 + 20 * e + tiltX * 7).toFixed(2)}deg`);
      phone.style.setProperty('--rx', `${(12 - 9 * e - tiltY * 5).toFixed(2)}deg`);
    };
    scene(device, (r, vh) => { appQ = clamp((vh - r.top) / (vh * 0.85)); setPhone(); });
    if (fine && device) {
      device.addEventListener('pointermove', (e) => {
        const b = device.getBoundingClientRect();
        tiltX = ((e.clientX - b.left) / b.width - 0.5) * 2;
        tiltY = ((e.clientY - b.top) / b.height - 0.5) * 2;
        setPhone();
      });
      device.addEventListener('pointerleave', () => { tiltX = 0; tiltY = 0; setPhone(); });
    }

    /* Activar escenas solo cerca de pantalla */
    if ('IntersectionObserver' in window) {
      const sio = new IntersectionObserver((entries) => {
        entries.forEach((e) => { const s = scenes.find((x) => x.el === e.target); if (s) s.on = e.isIntersecting; });
        request();
      }, { rootMargin: '25% 0px 25% 0px' });
      scenes.forEach((s) => sio.observe(s.el));
    }
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request);
    request();

    /* Portada en escritorio: el marco del vídeo sigue al puntero */
    const heroMedia = $('#heroMedia');
    const heroFrame = $('.hero-frame');
    if (fine && hero && heroFrame) {
      hero.addEventListener('pointermove', (e) => {
        if (!isDesktop()) return;
        const x = e.clientX / innerWidth - 0.5;
        const y = e.clientY / innerHeight - 0.5;
        heroMedia.style.setProperty('--ry', `${(-13 + x * 10).toFixed(2)}deg`);
        heroMedia.style.setProperty('--rx', `${(5 - y * 8).toFixed(2)}deg`);
      });
      hero.addEventListener('pointerleave', () => { heroMedia.style.removeProperty('--ry'); heroMedia.style.removeProperty('--rx'); });
    }

    /* Datos que flotan en App: solo animan con la sección en pantalla */
    const app = $('#app');
    if (app && 'IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => app.classList.toggle('is-live', e.isIntersecting)).observe(app);
    }
  }

  /* ── Máquina de escribir de la portada ── */
  const type = $('#heroType');
  if (type && !reduced) {
    const text = type.dataset.text;
    type.textContent = '';
    let i = 0;
    const tick = () => {
      type.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, text[i - 1] === '.' ? 260 : 46);
    };
    setTimeout(tick, 700);
  }

  /* ════ Vídeos de marca: póster propio, vídeo fundido encima al reproducir de verdad.
     Autoarrancan en silencio salvo con reduced-motion o Save-Data (póster + «Ver»).
     Los que llevan data-src no se descargan hasta acercarse a pantalla. ════ */
  $$('.clip-frame').forEach((frame) => {
    const clip = $('.clip-video', frame);
    const play = $('.clip-play', frame);
    if (!clip) return;
    const load = () => {
      if (!clip.dataset.src) return;
      clip.src = clip.dataset.src;
      delete clip.dataset.src;
    };
    clip.addEventListener('playing', () => frame.classList.add('is-ready'), { once: true });
    if (!reduced && !saveData && 'IntersectionObserver' in window) {
      if (!clip.dataset.src) clip.preload = 'auto';
      else {
        const near = new IntersectionObserver(([e]) => {
          if (!e.isIntersecting) return;
          near.disconnect();
          clip.preload = 'auto';
          load();
        }, { rootMargin: '700px 0px' });
        near.observe(frame);
      }
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          load();
          clip.play().catch((err) => { if (err && err.name === 'NotAllowedError' && play) play.hidden = false; });
        } else clip.pause();
      }, { threshold: 0.25 }).observe(frame);
    } else {
      clip.preload = 'none';
      if (play) play.hidden = false;
    }
    if (play) play.addEventListener('click', () => { play.hidden = true; load(); clip.play().catch(() => {}); });

    /* Sonido (solo el vídeo de la app): al activarlo vuelve al principio.
       Al salir de pantalla se pausa y vuelve al silencio. */
    const sound = $('.clip-sound', frame);
    if (sound) {
      const setSound = (on) => {
        clip.muted = !on;
        sound.setAttribute('aria-pressed', String(on));
        sound.setAttribute('aria-label', on ? 'Silenciar' : 'Activar sonido');
      };
      sound.addEventListener('click', () => {
        const on = sound.getAttribute('aria-pressed') !== 'true';
        setSound(on);
        if (on) {
          if (play) play.hidden = true;
          load();
          clip.currentTime = 0;
          clip.play().catch(() => setSound(false));
        }
      });
      clip.addEventListener('pause', () => { if (!clip.muted && !clip.ended) setSound(false); });
    }
  });

  /* ── Resplandor de la portada (escritorio): el vídeo ilumina la habitación ── */
  const amb = $('#heroAmbient');
  const heroVideo = $('#heroVideo');
  if (amb && heroVideo && !reduced && !saveData && isDesktop()) {
    const ctx = amb.getContext('2d', { alpha: false });
    const poster = $('#top .clip-poster img');
    let heroOn = true, last = 0;
    const paint = (src, w, h) => {
      const sh = w * 36 / 64;
      ctx.drawImage(src, 0, Math.max(0, (h - sh) / 2), w, Math.min(h, sh), 0, 0, 64, 36);
    };
    const drawPoster = () => { if (poster.complete && poster.naturalWidth) paint(poster, poster.naturalWidth, poster.naturalHeight); };
    poster.complete ? drawPoster() : poster.addEventListener('load', drawPoster, { once: true });
    new IntersectionObserver(([e]) => { heroOn = e.isIntersecting; }).observe(amb);
    const loop = (t) => {
      if (heroOn && !heroVideo.paused && heroVideo.readyState >= 2 && t - last > 90) {
        paint(heroVideo, heroVideo.videoWidth, heroVideo.videoHeight);
        last = t;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ── Contadores ×8 ×5 ×2: de 0 al valor, una vez ── */
  const counters = $$('[data-count]');
  if (counters.length && !reduced && 'IntersectionObserver' in window) {
    const run = (el) => {
      const end = parseInt(el.dataset.count, 10);
      const t0 = performance.now();
      const step = (t) => {
        const p = clamp((t - t0) / 900);
        el.textContent = String(Math.round(end * easeOut(p)));
        if (p < 1) requestAnimationFrame(step);
      };
      el.textContent = '0';
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { cio.unobserve(e.target); setTimeout(() => run(e.target), 250); } });
    }, { threshold: 0.6 });
    counters.forEach((c) => cio.observe(c));
  }

  /* ── Comparador sin datos / con MUEVET+ ── */
  const cmp = $('#cmp');
  if (cmp) {
    const range = $('#cmpRange');
    let x = 50;
    const set = (v) => {
      x = clamp(v, 0, 100);
      cmp.style.setProperty('--x', `${x.toFixed(2)}%`);
      range.value = String(Math.round(x));
      range.setAttribute('aria-valuetext', `${Math.round(100 - x)} % sin datos, ${Math.round(x)} % con MUEVET+`);
    };
    const fromEvent = (e) => { const r = cmp.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100); };
    let dragging = false, pending = null;
    cmp.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      if (e.pointerType === 'mouse') {
        dragging = true; cmp.classList.add('is-drag'); cmp.setPointerCapture(e.pointerId); fromEvent(e);
      } else pending = { id: e.pointerId, x: e.clientX, y: e.clientY };
    });
    cmp.addEventListener('pointermove', (e) => {
      if (dragging) { fromEvent(e); return; }
      if (pending && e.pointerId === pending.id) {
        const dx = Math.abs(e.clientX - pending.x), dy = Math.abs(e.clientY - pending.y);
        if (dx > 6 && dx > dy) { dragging = true; cmp.classList.add('is-drag'); cmp.setPointerCapture(e.pointerId); fromEvent(e); pending = null; }
        else if (dy > 10) pending = null;
      }
    });
    const end = (e) => {
      if (pending && e.type === 'pointerup' && e.pointerId === pending.id) fromEvent(e);
      dragging = false; pending = null; cmp.classList.remove('is-drag');
    };
    cmp.addEventListener('pointerup', end);
    cmp.addEventListener('pointercancel', end);
    range.addEventListener('input', () => set(+range.value));
    set(50);
    /* Pista una sola vez: el asa se asoma a cada lado */
    if (!reduced && 'IntersectionObserver' in window) {
      const hint = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting || e.intersectionRatio < 0.6) return;
        hint.disconnect();
        const keys = [[0, 50], [600, 30], [1300, 70], [1900, 50]];
        const t0 = performance.now();
        const anim = (t) => {
          if (dragging) return;
          const el = t - t0;
          let k = 0;
          while (k < keys.length - 2 && el > keys[k + 1][0]) k++;
          const [ta, va] = keys[k], [tb, vb] = keys[k + 1];
          const p = clamp((el - ta) / (tb - ta));
          const s = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
          set(va + (vb - va) * s);
          if (el < keys[keys.length - 1][0]) requestAnimationFrame(anim);
        };
        setTimeout(() => requestAnimationFrame(anim), 400);
      }, { threshold: [0.6] });
      hint.observe(cmp);
    }
  }

  /* ── CTA fija en móvil: aparece tras la portada y se retira en el cuestionario ── */
  const sticky = $('#stickyCta');
  const heroEl = $('#top');
  const closing = $('#contacto');
  const footer = $('.foot');
  if (sticky && heroEl && closing && 'IntersectionObserver' in window) {
    let heroVisible = true, endVisible = false;
    const update = () => {
      const show = !heroVisible && !endVisible;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', String(!show));
      $('a', sticky).tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; update(); }, { threshold: 0.12 }).observe(heroEl);
    const ends = new Set();
    const eio = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? ends.add(e.target) : ends.delete(e.target)));
      endVisible = ends.size > 0; update();
    }, { threshold: 0.02 });
    eio.observe(closing);
    if (footer) eio.observe(footer);
    const runSec = $('#corre');
    if (runSec) eio.observe(runSec);
  }

  /* ════ Cuestionario → Google Apps Script → hoja + email ════ */
  const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycby967xzDwrXaPFTkq5bqcqe8QCk191A_0UxeHpP8W0BaCLqIhHf3NlOyOo9Fk44uWxVWg/exec';

  const form = $('#applyForm');
  if (form) {
    const DM = 'https://ig.me/m/muevet.mas';
    const deep = $('#applyDeep');
    const deepIn = $('#applyDeepIn');
    const status = $('#applyStatus');
    const submit = $('#applySubmit');
    const done = $('#applyDone');
    const doneTitle = $('#applyDoneTitle');

    /* El bloque 03 solo aparece cuando aporta algo: para un análisis suelto sobra */
    const syncDeep = () => {
      const sel = form.querySelector('input[name="interes"]:checked');
      const open = !!sel && sel.value !== 'Análisis ISAK';
      deep.classList.toggle('is-open', open);
      deepIn.inert = !open;
    };
    $$('input[name="interes"]', form).forEach((r) => r.addEventListener('change', syncDeep));

    /* Los botones de Medir y COACH llegan con el producto ya marcado */
    $$('[data-preset]').forEach((a) => {
      a.addEventListener('click', () => {
        const r = form.querySelector(`input[name="interes"][value="${a.dataset.preset}"]`);
        if (r && !r.checked) { r.checked = true; syncDeep(); }
      });
    });

    const validate = () => {
      $$('.is-error', form).forEach((el) => el.classList.remove('is-error'));
      status.textContent = '';
      const falta = [];
      const nombre = form.elements.nombre;
      const email = form.elements.email;
      if (!nombre.value.trim()) { nombre.closest('.field').classList.add('is-error'); falta.push('tu nombre'); }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { email.closest('.field').classList.add('is-error'); falta.push('un email válido'); }
      [['interes', 'qué te interesa'], ['punto', 'de dónde partes']].forEach(([name, texto]) => {
        if (!form.querySelector(`input[name="${name}"]:checked`)) {
          form.querySelector(`input[name="${name}"]`).closest('.chips').classList.add('is-error');
          falta.push(texto);
        }
      });
      const priv = form.elements.privacidad;
      if (!priv.checked) { priv.closest('.check').classList.add('is-error'); falta.push('marcar la casilla de privacidad'); }
      return falta;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const falta = validate();
      if (falta.length) {
        status.textContent = `Falta ${falta.join(' · ')}.`;
        const primero = form.querySelector('.is-error input, .is-error textarea');
        if (primero) primero.focus({ preventScroll: false });
        return;
      }
      if (!FORM_ENDPOINT) { window.open(DM, '_blank', 'noopener'); return; }
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
        status.textContent = 'No se ha podido enviar. Escríbeme por Instagram y lo vemos.';
      }
    });
  }
})();
