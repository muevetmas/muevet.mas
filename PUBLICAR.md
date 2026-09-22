# Antes de publicar

GitHub Pages publica solo con cada push a `main`. Por eso **no se hace push
hasta que todo lo de esta lista esté hecho** y Víctor haya dicho «publica».

## Lo que hace Víctor

- [ ] **Apps Script:** añadir `'privacidad'` a la lista `cols` del script
      desplegado y volver a desplegar (ver `FORMULARIO.md`). Así el «Sí» de
      la casilla queda en la hoja como prueba del consentimiento.
- [ ] **Gestor:** revisión de `privacidad.html` y `aviso-legal.html`.
- [ ] **«Publica»** explícito en el chat.

## Lo que se comprueba antes del push

- [ ] Auditoría final con métricas antes/después a 375 y 1280: LCP, CLS,
      peso de la portada, contraste, zonas táctiles ≥ 44 px.
- [ ] Todos los enlaces: anclas, `mailto:`, WhatsApp, Instagram, privacidad y
      aviso legal desde las tres páginas; todas las rutas de `assets/`.
- [ ] `sitemap.xml` y `robots.txt` con las URLs y fechas correctas.
- [ ] `?v=` de CSS y JS con la fecha del deploy (GitHub Pages cachea).
- [ ] Envío real del cuestionario con la casilla marcada: fila en la hoja y
      email recibido.
- [ ] Vídeos con reduced-motion y Save-Data: póster + botón «Ver».
- [ ] Honestidad: sin precios, sin testimonios, sin promesas de resultado,
      sin datos de salud, sin nada de la app; MVT+ solo como «Próximamente».
- [ ] Push a `main` y comprobación de muevetmas.com en escritorio y en un
      móvil real.
