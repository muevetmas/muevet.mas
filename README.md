# MUEVET+ — web oficial

Dirección creativa: **LA MEDIDA** — precisión en la forma, humanidad en la voz.
HTML + CSS + JS vanilla · sin dependencias · GitHub Pages.

## Estructura
- `index.html` — toda la página (one-page)
- `assets/css/main.css` — tokens, componentes, sistema de movimiento
- `assets/js/main.js` — reveals, nav, regla, marquee, CTA móvil
- `assets/fonts` — Archivo, Inter y JetBrains Mono (variables, self-hosted, subset latino)
- `assets/img` — fotos propias (AVIF/WebP/JPG por tamaños), vídeo de medición y OG; `propias/` guarda los originales
- `assets/icons` — favicon, touch icon, logo

## Ediciones frecuentes
- **Vídeo del hero (medición):** sustituye `assets/img/hero/medir-clip.mp4` y los pósteres `medir-poster.avif` / `.jpg` (vertical 9:16, sin audio, ideal < 300 KB; el póster es un fotograma del vídeo). Busca `VÍDEO DE MEDICIÓN — EDITABLE` en `index.html`.
- **Dominio propio:** añade fichero `CNAME` con el dominio, actualiza `sitemap.xml`, `robots.txt` y las metas OG (`og:image` con URL absoluta).

## Deploy
Push a `main` → Settings → Pages → Deploy from branch (`main`, `/root`).
