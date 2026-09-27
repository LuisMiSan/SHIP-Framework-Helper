---
description: Delega una consulta de solo lectura a Gemini (gratis, usa la clave del proyecto)
argument-hint: "[--file <ruta>] [--model <id>] [--list-models] <pregunta>"
allowed-tools: Bash(node scripts/gemini.mjs:*)
---

Delega la consulta del usuario a Gemini a través de `scripts/gemini.mjs`, para no
gastar tokens de Claude en lectura y análisis masivo de archivos.

Petición del usuario:
$ARGUMENTS

## Cómo ejecutarlo

1. Si `$ARGUMENTS` está vacío, pregunta qué quiere consultar y para ahí.

2. Si no, haz **una sola** llamada Bash:

   ```bash
   node scripts/gemini.mjs [--model <id>] [--file <ruta>]... "<pregunta>"
   ```

   Pasa `--file` una vez por cada ruta. Una ruta puede ser un archivo o un
   directorio (un directorio se recorre solo, saltándose `node_modules`, `dist`
   y `.git`).

3. Si el usuario no indicó rutas pero la pregunta trata claramente de una parte
   del proyecto, elige tú las rutas mínimas que la respondan y dilo en una línea
   antes de ejecutar. Ante la duda, pasa un directorio en vez de adivinar
   archivos uno a uno.

4. Devuelve la respuesta de Gemini **tal cual**, y debajo añade dos o tres líneas
   con tu lectura: qué de eso es accionable y qué te parece dudoso. Gemini no ha
   ejecutado el código ni los tests, así que su respuesta es una hipótesis, no un
   hecho verificado. Dilo si el usuario va a actuar sobre ella.

5. **No releas los archivos que Gemini ya ha leído.** Eso anula el ahorro, que es
   el único motivo de que este comando exista. Si necesitas ver un archivo
   concreto para verificar algo, abre solo ese.

## Límites, para que no prometas de más

- **Es solo lectura.** El script no puede crear, modificar ni borrar archivos.
  Los cambios los aplicas tú después, con lo que Gemini haya averiguado.
- **Se niega a enviar posibles secretos** (`.env*`, credenciales, claves,
  `firebase-*config*.json`). Si el script lo bloquea, no busques la vuelta:
  enviar un archivo a Gemini es enviarlo a un servidor de Google.
- **Topes de tamaño:** 200 KB por archivo, 400 KB en total. Si se pasa, acota.
- **Cuota gratuita variable.** Google cambia los límites por modelo sin avisar.
  Si sale error de cuota, prueba otro modelo (`--list-models` los enumera; los
  `flash-lite` suelen tener el límite más alto).

## Cuándo usarlo y cuándo no

Úsalo cuando la consulta es **leer mucho y resumir**: barrer varios archivos,
mapear dónde se usa algo, buscar duplicación, resumir qué hace un módulo,
localizar candidatos a un bug.

No lo uses para decidir arquitectura, cambios en Firestore o autenticación, ni
para nada difícil de revertir. Ahí la respuesta la das tú: una hipótesis
plausible y falsa cuesta mucho más que los tokens que ahorra.
