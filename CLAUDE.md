# S.H.I.P. Framework Helper

App React 19 + Vite + TypeScript. Datos en Firebase/Firestore. IA vía `@google/genai` (Gemini).

- `src/App.tsx` — orquestador principal (el archivo más grande, 700+ líneas)
- `src/hooks/` — `useAppData`, `useProject`, `useAutoSave`
- `src/lib/` — `firebase.ts`, `firestoreService.ts`
- `src/components/` — UI
- `npm run lint` = `tsc --noEmit`. Ejecútalo antes de dar por terminado un cambio.

## Presupuesto de tokens

El usuario trabaja con límite de uso. Ahorrar contexto es un requisito, no una preferencia.
El orden importa: lo de abajo está ordenado por cuánto ahorra.

### 1. Delega la lectura pesada a subagentes

Si responder implica leer más de ~3 archivos, o barrer el repo buscando dónde se usa algo,
lanza un subagente `Explore` y quédate solo con su conclusión. No leas 20 archivos en la
conversación principal: ese contexto se reenvía en cada turno posterior durante el resto
de la sesión.

Va directo (sin subagente) cuando el usuario ya ha dicho el archivo, o cuando es un
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
