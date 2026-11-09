# SHIP Framework Helper (versión AI Studio) — Instrucciones para el agente

> Creado 2026-08-25. Normas duras en `C:\Users\USER\CLAUDE.md` y `~/.claude/CLAUDE.md`.

## 🔴 Antes de tocar nada: hay DOS repos SHIP
| Repo | Qué es | Stack |
|---|---|---|
| `C:\Users\USER\ship-framework` | **La versión de referencia.** Ya tiene su `CLAUDE.md` (161 líneas) con la lógica de negocio completa | Next.js |
| `C:\Users\USER\SHIP-Framework-Helper` (este) | Versión generada en **Google AI Studio** | Vite + React + **Firebase** + **Gemini** |

**Lee primero `ship-framework/CLAUDE.md`** — la estrategia y el encaje comercial están ahí,
no aquí. No dupliques la decisión: averigua cuál de los dos es el que se va a lanzar.

## Qué es
Lead magnet web de IA Division Madrid. El usuario audita su idea de negocio con IA
siguiendo el framework **S.H.I.P.** (Solve → Hypothesize → Implement → Persevere).
Al registrarse, se captura su contacto como potencial cliente.

```
Post en LinkedIn → lead entra → se registra (lead capturado) → usa la herramienta
→ recibe auditoría con IA → tiene un plan validado
→ PERO necesita construirlo → IA Division se lo ofrece
```

## Stack de ESTA versión
- **Vite + React + TypeScript** (`src/App.tsx`, `index.html`).
- **Firebase**: `firebase-applet-config.json`, `firebase-blueprint.json`, `firestore.rules`.
- **Gemini** — requiere `GEMINI_API_KEY` en `.env.local` (nunca commitear).
- Pide permiso de **micrófono** (`metadata.json` → `requestFramePermissions`).

## Incoherencias con el ecosistema (decidir antes de lanzar, no en caliente)
1. **Firebase** aquí vs **Supabase** en todo lo demás. Dos bases de datos que mantener.
2. **Gemini** aquí vs Claude / OpenRouter en el resto.
3. Los leads deberían acabar en el **cortex** (`POST /ingest/lead`, `source:` propio),
   no en un Firestore aislado — si no, el CRM central no los ve. **NO comprobado** si hoy
   los envía; verificar en `src/` antes de afirmarlo.

## Estado
Último commit: **08-may-2026** (`feat: Add tutorial functionality and UI`).
Revisar `firestore.rules` antes de cualquier despliegue: un lead magnet público con reglas
permisivas expone los datos de contacto capturados.
