# S.H.I.P. Framework Helper

App React 19 + Vite + TypeScript. Datos en Firebase/Firestore. IA vía `@google/genai` (Gemini).

- `src/App.tsx` — orquestador principal (el archivo más grande, 700+ líneas)
- `src/hooks/` — `useAppData`, `useProject`, `useAutoSave`
- `src/lib/` — `firebase.ts`, `firestoreService.ts`
- `src/components/` — UI
- `scripts/gemini.mjs` — consulta de solo lectura a Gemini, detrás del comando `/gemini`
- `npm run lint` = `tsc --noEmit`. Ejecútalo antes de dar por terminado un cambio.

## Presupuesto de tokens

El usuario trabaja con límite de uso. Ahorrar contexto es un requisito, no una preferencia.
El orden importa: lo de abajo está ordenado por cuánto ahorra.

### 1. Delega la lectura pesada

Si responder implica leer más de ~3 archivos, o barrer el repo buscando dónde se usa algo,
no lo leas en la conversación principal: ese contexto se reenvía en cada turno posterior
durante el resto de la sesión. Delega y quédate solo con la conclusión.

- **Subagente `Explore`** por defecto. Sirve para todo y no tiene requisitos.
- **`/gemini`** (`scripts/gemini.mjs`) cuando el usuario quiera gastar cuota de Gemini en
  vez de la suya: es gratis dentro de la capa gratuita de Google. Solo lectura, y se niega
  a enviar archivos que puedan contener secretos. Sugiérelo, no lo impongas: manda la
  petición a un servidor de Google, y eso lo decide el usuario.

Después de delegar, no releas los archivos que ya ha leído el subagente o Gemini: eso
anula el ahorro. Abre solo el archivo concreto que necesites verificar.

Va directo (sin delegar) cuando el usuario ya ha dicho el archivo, o cuando es un
archivo concreto y conocido.

### 2. No arrastres contexto muerto

Al cerrar una tarea, sugiere `/clear` antes de empezar la siguiente si no tienen relación.
Si la conversación es larga pero el tema continúa, sugiere `/compact`.

### 3. Elige el modelo según la tarea, y dilo

- Mecánico (renombrar, formatear, traducir strings, tests repetitivos, aplicar un patrón
  ya decidido) → sugiere `/model haiku`.
- Trabajo normal de desarrollo → `/model sonnet` es suficiente.
- Arquitectura, bugs no reproducibles, decisiones difíciles de revertir, seguridad,
  cualquier cosa que toque Firestore o autenticación → Opus. No propongas bajar de modelo
  aquí: una respuesta plausible y falsa cuesta mucho más que los tokens que ahorra.

Sugiere el cambio, no lo decidas por tu cuenta.

### 4. Sé breve por defecto

Responde lo que se ha preguntado. Sin resúmenes de lo que acabas de hacer, sin
reformular el plan, sin preámbulos. El diff es el registro.
No releas un archivo que acabas de editar para "verificar".

## Reglas del proyecto

- No toques `firestore.rules` ni nada de autenticación sin avisar antes: es la barrera de
  seguridad de los datos.
- Las claves de API van en `.env.local`, nunca en el código ni en un commit.
- El usuario no es técnico. Explica en castellano llano y evita jerga sin traducir.
