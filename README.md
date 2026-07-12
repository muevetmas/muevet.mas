# MUEVET+ — web oficial

Dirección creativa: **LA MEDIDA** — precisión en la forma, humanidad en la voz.
HTML + CSS + JS vanilla · sin dependencias · GitHub Pages.

## Estructura
- `index.html` — toda la página (one-page)
- `assets/css/main.css` — tokens, componentes, sistema de movimiento
- `assets/js/main.js` — reveals, nav, regla, marquee, CTA móvil
- `assets/fonts` — Archivo, Inter y JetBrains Mono (variables, self-hosted, subset latino)
- `assets/img` — fotos (AVIF/WebP/JPG, 3 tamaños), OG, placeholder IG
- `assets/icons` — favicon, touch icon, logo

## Ediciones frecuentes
- **Vídeo RUN+++ (capítulo 02):** sustituye `assets/img/run-clip.webm`, `run-clip.mp4` y `run-poster.jpg`. Vertical 9:16, sin audio, ideal < 3 MB. Busca `VÍDEO RUN+++ — EDITABLE` en `index.html`.
- **Publicación destacada de Instagram:** en `index.html`, busca `PUBLICACIÓN DESTACADA — EDITABLE` y cambia el `src`/`alt` de esa imagen (formato 4:5, ej. 1080×1350).
- **Dominio propio:** añade fichero `CNAME` con el dominio, actualiza `sitemap.xml`, `robots.txt` y las metas OG (`og:image` con URL absoluta).

## Deploy
Push a `main` → Settings → Pages → Deploy from branch (`main`, `/root`).
