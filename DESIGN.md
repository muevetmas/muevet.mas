# MUEVET+ · Sistema visual de muevetmas.com

Rediseño de octubre de 2026. Describe lo que está construido en `index.html`,
`assets/css/main.css` y `assets/js/main.js`. Si cambias el sistema, cambia
también este documento.

## Idea

**De la noche al día.** «Deja de entrenar a ciegas» convertido en recorrido:
la portada es de noche (entrenar sin datos) y, al bajar, amanece (entrenar con
datos). Los fundidos oscuro ↔ claro son el argumento, no un adorno.
Referencias del cliente: dimenso.ai (portada con vídeo, vidrio, wordmark
gigante, comparador) y el vídeo de la app MUEVET+ (fondo blanco roto con
resplandor lima, tarjetas oscuras de vidrio, datos flotando).

## Color

| Token | Valor | Uso |
|---|---|---|
| `--night` | `#0A0A0A` | Fondo de noche: portada, RUN+, isla de COACH, pie |
| `--day` | `#F2F2EE` | Fondo de día: amanecer, comparador, Medir, cuestionario |
| `--ink` / `--ink-dim` | `#0B0B0C` / `#55564F` | Texto de día (6,6:1 el atenuado) |
| `--snow` / `--snow-dim` | `#F5F5F0` / `#A6A69F` | Texto de noche (7,9:1 el atenuado) |
| `--lime` / `--lime-2` | `#C8E000` / `#D9F21A` | La luz de la marca: botones, énfasis de noche, halos |
| `--lime-ink` | `#4A5600` | Lima legible sobre claro (iconos pequeños) |

- Cada sección declara su tono con `.tone-dark` o `.tone-day`, que fijan
  `--fg`, `--fg-dim` y `--line`.
- **De día el lima no se usa como color de texto** (no se lee): el énfasis va
  en negro con halo lima (`text-shadow` en tres capas), como en el vídeo.
- Fundidos: `.fade-n2d` (noche → día), `.fade-d2n` (día → noche),
  `.fade-n2a` (noche → fondo de la app). Gradientes de 8 paradas para que no
  haya bandas ni un gris sucio a mitad.

## Tipografía

- **Archivo** (variable, `wght` 100–900, `wdth` 62–125): titulares finos
  (380–430) en tipo frase; el énfasis sube a 700. Wordmark y RUN+ en
  `font-stretch:125%` y peso 800–900.
- **Inter**: texto. 16 px en móvil, `.lead` 18–21 px.
- **JetBrains Mono**: solo medidas y credenciales (×8, «Perímetro de brazo»,
  líneas de credencial).
- Escala de tamaños pequeños: 12 · 13,5 · 15 · 16 · 17 · 18 · 20 px.
  Titulares con `clamp()`: `.d1` 46–112 px, `.d2` 40–86 px, `.d3` 30–48 px.
- Interletraje de titulares entre −0,028 y −0,034 em.

## Componentes

- **Botón** `.btn`: píldora lima, texto negro Archivo 620, flecha que avanza
  3 px al pasar el ratón, `scale(.97)` al pulsar. Variantes `.btn-lg`,
  `.btn-sm`, `.btn-ink`, `.btn-block`. Un solo texto de acción en toda la web:
  «Empieza con tu valoración», con «Dos minutos. Te digo por dónde empezar.»
- **Vidrio** `.glass`: fondo 7 % blanco, `backdrop-filter: blur(18px)`,
  borde y brillo superior con `inset box-shadow`.
- **Tarjeta oscura** `.icard`: degradado `#1B1C1F → #111214`, radio 18 px,
  sombra desplazada. Sobre fondo claro, como las tarjetas del vídeo.
- **Isla** `.island`: bloque de noche con radio 26–44 px dentro de una
  sección de día (COACH).
- **Vídeos** `.clip-frame` + `.clip-poster` + `.clip-video` + `.clip-play`
  (+ `.clip-sound` en la app): póster propio primero, vídeo fundido encima al
  reproducir de verdad, `data-src` para cargar al acercarse.
- **Móvil 3D** `.phone`: marco de 48 px de radio con isla dinámica; gira
  hacia el visitante al entrar (`--ry`, `--rx`).
- **Comparador** `.cmp`: libreta pautada «Sin datos» / valoración «Con
  MUEVET+»; `--x` mueve el corte; el contenido de cada lado se recoloca para
  leerse entero en la parte visible. Teclado con un `input range` oculto.

## Movimiento

Curvas: `--ease-out: cubic-bezier(.23,1,.32,1)`,
`--ease-io: cubic-bezier(.77,0,.175,1)`, `--ease-drawer: cubic-bezier(.32,.72,0,1)`.

| Momento | Qué hace |
|---|---|
| Portada | Titular visible desde el primer fotograma (solo sube 18 px); «Mide. Analiza. Mejora.» se escribe; en escritorio el marco del vídeo sigue al ratón y el vídeo ilumina el fondo (canvas de 64×36 desenfocado) |
| Revelados | `[data-rv]`: opacidad + 22 px + desenfoque 8 px, escalonado 70 ms con `--i` |
| Manifiesto | Palabra a palabra con el scroll |
| Medir | Contadores ×8 ×5 ×2 (900 ms, una vez); la línea Mide → Analiza → Mejora se dibuja |
| COACH | El carril lima se llena y enciende el paso que se lee |
| RUN+ | Escena fija de 240 svh: el vídeo se ve a través de «RUN+», zoom al «+», se abre |
| App | El móvil gira hacia ti; datos flotando solo con la sección en pantalla |

Todo el movimiento ligado al scroll pasa por un único bucle `requestAnimationFrame`
y solo corre en las escenas cercanas a la pantalla.
**`prefers-reduced-motion` y Save-Data**: sin escenas, sin revelados, sin
descargas de vídeo (póster + «Ver»); RUN+ pasa a ser vídeo + texto.

## Reglas de contenido (del cliente)

Sin precios, testimonios, logos de clientes, cifras o resultados inventados,
promesas ni fechas. La app se escribe «la app MUEVET+» (nunca «MVT+») y solo
«Próximamente». Solo fotos y vídeos propios; una cota sobre una foto solo si
es exacta. El club es RUN+. Sin datos de salud en el cuestionario. Ningún push
a `main` sin el «publica» de Víctor.
