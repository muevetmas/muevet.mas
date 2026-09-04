# Formulario de contacto — cómo recibir las respuestas

El formulario vive en la sección **¿Empezamos?** de `index.html`. La web es
estática (GitHub Pages no puede guardar datos), así que los envíos van a una
hoja de cálculo tuya mediante Google Apps Script: gratis, sin límite de
respuestas y sin depender de ningún servicio de terceros.

Mientras no pegues tu URL, el botón abre el DM de Instagram: nunca se pierde
un contacto.

## 1. Crear la hoja

1. Entra en [sheets.new](https://sheets.new) con la cuenta `info.muevetmas@gmail.com`.
2. Ponle nombre, por ejemplo **MUEVET+ · Solicitudes**.

## 2. Pegar el script

En esa hoja: **Extensiones → Apps Script**. Borra lo que haya y pega esto:

```javascript
const HOJA  = 'Respuestas';
const AVISO = 'info.muevetmas@gmail.com';

function doPost(e) {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const hoja  = libro.getSheetByName(HOJA) || libro.insertSheet(HOJA);
  const p = e.parameter;
  const cols = ['fecha','nombre','email','contacto','interes','punto',
                'objetivo','intentos','dias','cuando'];

  if (hoja.getLastRow() === 0) hoja.appendRow(cols);
  hoja.appendRow(cols.map(c => p[c] || ''));

  MailApp.sendEmail({
    to: AVISO,
    subject: 'MUEVET+ · ' + (p.nombre || 'Nueva solicitud') + ' — ' + (p.interes || ''),
    body: cols.map(c => c.toUpperCase() + ': ' + (p[c] || '—')).join('\n')
  });

  return ContentService.createTextOutput('ok');
}
```

Guarda (icono del disquete).

## 3. Publicarlo

1. Botón **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. *Ejecutar como*: **Yo**.
4. *Quién tiene acceso*: **Cualquier usuario** ← imprescindible, si no la web no
   podrá enviar nada.
5. **Implementar** → autoriza el acceso. Google avisará de que la app "no está
   verificada": es normal, es tuya. Pulsa *Configuración avanzada → Ir a
   (nombre del proyecto)*.
6. Copia la **URL de la aplicación web** (termina en `/exec`).

## 4. Conectarla a la web

En `assets/js/main.js`, busca `FORM_ENDPOINT` y pega la URL entre las comillas:

```javascript
const FORM_ENDPOINT = 'https://script.google.com/macros/s/AAAA..../exec';
```

## 5. Probarlo (no te saltes este paso)

Rellena el formulario en la web una vez y comprueba dos cosas:

- que aparece una fila nueva en la hoja,
- que te llega el email.

Por cómo funcionan las webs estáticas, el navegador no puede leer la respuesta
del script: la web da las gracias siempre, aunque el envío fallara. Por eso hay
que verificarlo una vez al conectarlo, y cada vez que cambies la
implementación.

## Cambiar las preguntas

Están en `index.html`, dentro de `<form id="applyForm">`. Si añades un campo,
recuerda añadir su `name` a la lista `cols` del script para que se guarde en la
hoja.
