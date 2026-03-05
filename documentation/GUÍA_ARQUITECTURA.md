# 🏗️ GENETIX ARENA | GUÍA DE ARQUITECTURA Y MIGRACIÓN (v3.3 → v3.5)

## 📑 Tabla de Contenidos

1. [Visión General de la Migración](#visión-general-de-la-migración)
2. [Stack Tecnológico Comparativo](#stack-tecnológico-comparativo)
3. [Arquitectura Anterior (v3.3)](#arquitectura-anterior-v33)
4. [Arquitectura Actual (v3.5)](#arquitectura-actual-v35)
5. [Mapeo de Responsabilidades](#mapeo-de-responsabilidades)
6. [Patrones y Convenciones](#patrones-y-convenciones)
7. [Mejoras Clave](#mejoras-clave)
8. [Guía para Contribuidores](#guía-para-contribuidores)

---

## Visión General de la Migración

**Genetix Arena** ha evolucionado de una arquitectura monolítica JavaScript (v3.3) a una arquitectura modular TypeScript + React (v3.5).

| Aspecto           | v3.3          | v3.5                     | Beneficio                 |
| :---------------- | :------------ | :----------------------- | :------------------------ |
| **Tipado**        | Dinámico (JS) | Estático (TS)            | Errores en build-time     |
| **Modularidad**   | Monolítico    | 9 componentes            | Mantenibilidad            |
| **Build Tool**    | Sin build     | Vite 6.2                 | HMR, tree-shaking         |
| **UI State**      | Manual (DOM)  | React Hooks              | Sincronización automática |
| **Responsividad** | Parcial       | Mobile-first             | Experiencia uniforme      |
| **Audio**         | Sin audio     | 5 pistas + fade          | Inmersión                 |
| **Efectos**       | Sin efectos   | Signal Loss, Nuke, CRT   | Impacto visual            |
| **IA extras**     | Sin mecánicas | Omega Protocol + Fallout | Rejugabilidad             |

---

## Stack Tecnológico Comparativo

### v3.3 (JavaScript Vanilla)

```
index.html
css/style.css
js/app.js   ← TODO el código (~1000+ líneas)
  ├─ Clases (Entidad, Aliado, etc.)
  ├─ Engine (update, draw, collision)
  ├─ UI handlers
  └─ Game Loop (RAF)
```

**Problemas:**

- ❌ Tipado dinámico → errores en runtime
- ❌ Monolítico → difícil de testear
- ❌ State manual (DOM directo)
- ❌ Sin HMR
- ❌ Sin audio, sin efectos visuales

### v3.5 (TypeScript + React + Vite)

```
package.json (react, react-dom, lucide-react)
index.html  (CDN Tailwind + theme + Google Fonts)
index.tsx   (React root)
App.tsx     (orquestador)

components/
  LandingPage.tsx       ControlPanel.tsx
  ConsoleLog.tsx        StatsDisplay.tsx
  RetroLCD.tsx          SignalLossEffect.tsx

services/
  GenetixEngine.ts      (lógica pura, sin React)

types.ts
vite.config.ts          (puerto 3000)
```

---

## Arquitectura Anterior (v3.3)

### Flujo de Aplicación

```
index.html → [DOMContentLoaded] → app.js (scope global)
    ↓
Usuario click "Iniciar" → startGame() → engine.init(config)
    ↓
loop(timestamp)
  ├─ engine.update()  → lógica IA
  ├─ engine.draw(ctx) → canvas
  └─ updateUI()       → getElementById + innerHTML manual
    ↓
Repite hasta victoria/derrota
```

---

## Arquitectura Actual (v3.5)

### Estructura de Archivos

```
Genetix_Arena_Web_Edition/
│
├── index.html          # SPA entry. Tailwind CDN + custom theme + fuentes.
├── index.tsx           # ReactDOM.createRoot → <App />
├── favicon.svg
│
├── App.tsx             # Raíz. Estado global, game loop, audio, Omega Protocol.
├── types.ts            # GameConfig, GameStats, DetailedStats, LogEntry, Entity.
│
├── components/
│   ├── LandingPage.tsx      # Landing + 3 modales
│   ├── ControlPanel.tsx     # Panel de control completo + Nuke button
│   ├── ConsoleLog.tsx       # Log con auto-scroll
│   ├── StatsDisplay.tsx     # Stats detalladas
│   ├── RetroLCD.tsx         # Display LCD
│   └── SignalLossEffect.tsx # Overlay glitch
│
├── services/
│   └── GenetixEngine.ts    # Motor puro: IA, grid, colisiones, Omega, DeathAnim
│
├── public/tracks/          # 5 pistas MP3
├── documentation/          # 3 docs técnicos
├── package.json
├── tsconfig.json
├── eslint.config.js
└── vite.config.ts          # Puerto 3000
```

### Flujo de Aplicación

```
index.tsx
  └─ ReactDOM.createRoot → <App />

App.tsx
  ├─ useState: view, config, stats, logs, audio, Omega states...
  ├─ useRef: canvas, engine, RAF, audio refs, loopRef
  ├─ useCallback: addLog
  └─ useEffect: sincroniza RAF loop, audio por cambio de view/result

  ↓ view === 'landing'
LandingPage → onStart() → switchView('game') → initializeSystem()

  ↓ view === 'game'
Canvas + SignalLossEffect
Right Sidebar: StatsDisplay + ControlPanel (RetroLCD)
Bottom: ConsoleLog

Game Loop (loopRef + RAF)
  ├─ Throttle por config.renderSpeed
  ├─ engine.update()          ← GenetixEngine
  ├─ engine.draw(ctx, config) ← Canvas
  ├─ setStats(...)
  └─ setDetailedStats(...)

Omega Protocol (handleOmegaProtocol - setTimeout chain)
  ├─ T+3s: engine.executeOmegaProtocol()
  ├─ T+5s: HUD targeting
  └─ T+9s: reanuda loop
```

---

## Mapeo de Responsabilidades

```
App.tsx
├─ Estado de la app
├─ Game loop (RAF + loopRef pattern)
├─ Sistema de audio (5 refs + crossfade + iOS guard)
├─ Secuencia Omega Protocol (setTimeout chain)
└─ Composición de todos los componentes

LandingPage.tsx
└─ Pantalla de bienvenida + 3 modales + animación de fondo

ControlPanel.tsx
├─ RetroLCD (mensaje dinámico via lcdMessage prop)
├─ Sliders con validación y commit-on-release
├─ Detección de configChanged
├─ Botones: INICIAR / PAUSA / REANUDAR / REINICIAR / APLICAR CAMBIOS
├─ Botones: DEFAULTS / ABORT_OP
├─ Toggles: barras de vida / audio
└─ Omega Protocol button (4 estados: LOCKED / READY / DETONATING / DISCHARGED)

ConsoleLog.tsx     → eventos con timestamps + auto-scroll
StatsDisplay.tsx   → DetailedStats en formato HUD
RetroLCD.tsx       → display LCD (normal/warning/critical/success)
SignalLossEffect.tsx → overlay SVG glitch (idle/noise/dark)

GenetixEngine.ts (lógica pura, CERO acceso a React/DOM)
├─ Clases: Entidad, Aliado, Enemigo, Curandero, Obstaculo
├─ Clase interna: DeathAnim (animaciones de muerte en canvas)
├─ Objeto: MisFunciones.posicionValida()
├─ init · update · draw · checkWin
├─ executeOmegaProtocol(): heal aliados + destroy 80% enemigos + fallout
├─ Mecánica Fallout: daño radiación + ralentización enemigos
└─ getStats · getDetailedStats

types.ts
└─ GameConfig · GameStats · DetailedStats · LogEntry · Entity
```

---

## Patrones y Convenciones

### loopRef Pattern (evitar stale closures)

```typescript
// Problema sin loopRef:
useEffect(() => {
  const loop = (ts) => {
    // isRunning y config quedan "congelados" al valor del primer render
    // → stale closure bug
  };
  requestAnimationFrame(loop);
}, [isRunning]); // dependencias no suficiente

// Solución: loopRef
loopRef.current = (timestamp: number) => {
  // Lee isRunning, config, etc. siempre frescos
  // porque se sobreescribe en CADA render
};
// El RAF siempre llama a loopRef.current → siempre la versión actual
```

### commit-on-release en Sliders

```typescript
// onChange → solo actualiza localCounts (estado local, sin rerender pesado)
const handleLocalChange = (key, value) => {
  setLocalCounts((prev) => ({ ...prev, [key]: value }));
};

// onMouseUp / onTouchEnd → commit al config real
const commitEntityChanges = () => {
  setConfig((prev) => ({ ...prev, entityCounts: localCounts }));
};
```

### prevEntityCountsRef (evitar reset en pausa)

```typescript
// Sin esto, al pausar (isRunning = false) se dispararía el useEffect
// de entityCounts aunque los valores no cambiaron
useEffect(() => {
  if (config.entityCounts === prevEntityCountsRef.current) return; // misma referencia → ignorar
  prevEntityCountsRef.current = config.entityCounts;
  if (view === "game" && hasStarted) setConfigChanged(true);
}, [config.entityCounts]);
```

### Crossfade de Audio (race condition safe)

```typescript
const crossfade = (outgoing, outgoingDefaultVol, incoming, incomingTargetVol) => {
  stopFade(); // Cancela SIEMPRE el fade anterior antes de iniciar uno nuevo
  // 50 pasos · 2000ms · curva ease-in-out
  activeFadeRef.current = setInterval(() => { ... }, 40);
};
```

### Validación de Sliders

```typescript
// allies y enemies no pueden llegar a 0
if ((key === "allies" || key === "enemies") && value < 1) {
  finalValue = 1;
  // feedback visual: errorField → animate-shake
}
```

---

## Mejoras Clave

### Tipado

```typescript
// v3.3 - sin tipos
entity.posX = "invalid"; // ✅ sin error en runtime

// v3.5 - TypeScript strict
entity.posX = "invalid"; // ❌ Error de compilación: Type 'string' is not assignable to 'number'
```

### Modularidad

| Archivo                | Líneas aprox. | Responsabilidad |
| :--------------------- | :------------ | :-------------- |
| `GenetixEngine.ts`     | ~430          | Lógica pura     |
| `App.tsx`              | ~950          | Orquestador     |
| `ControlPanel.tsx`     | ~500          | UI de control   |
| `LandingPage.tsx`      | ~400          | UI de landing   |
| `SignalLossEffect.tsx` | ~80           | Efecto visual   |
| `StatsDisplay.tsx`     | ~60           | UI de métricas  |
| `ConsoleLog.tsx`       | ~50           | UI de logs      |
| `RetroLCD.tsx`         | ~40           | Display LCD     |
| `types.ts`             | ~45           | Contratos       |

### Nuevas Mecánicas (sin equivalente en v3.3)

| Feature           | Dónde                          | Descripción                                     |
| :---------------- | :----------------------------- | :---------------------------------------------- |
| Omega Protocol    | `App.tsx` + `GenetixEngine.ts` | Arma de emergencia con secuencia temporal       |
| Fallout/Radiación | `GenetixEngine.update()`       | Daño por radiación post-Nuke                    |
| DeathAnim         | `GenetixEngine.draw()`         | Animaciones de muerte en canvas                 |
| configChanged     | `App.tsx`                      | Detección de config cambiada con partida activa |
| commit-on-release | `ControlPanel.tsx`             | Sliders aplican config solo al soltar           |
| loopRef pattern   | `App.tsx`                      | Evita stale closures en RAF                     |
| crossfade audio   | `App.tsx`                      | Fade suave entre pistas                         |
| iOS audio unlock  | `App.tsx`                      | Compatibilidad Safari mobile                    |

---

## Guía para Contribuidores

### Setup

```bash
git clone https://github.com/Ju4nmaFd3z/Genetix_Arena_Web_Edition.git
cd Genetix_Arena_Web_Edition
npm install
npm run dev   # http://localhost:3000
```

### Convenciones

```typescript
// ✅ Tipos explícitos siempre
const getCount = (list: Entity[]): number => list.length;

// ✅ Props tipadas con interface
interface MyComponentProps { title: string; onClick: () => void; }
const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => ...

// ✅ Tailwind utility classes
<div className="flex gap-2 bg-space-dark p-4">

// ❌ Evitar estilos inline salvo para valores dinámicos
<div style={{ opacity: opacity }}>  // ✅ valor dinámico, justificado
<div style={{ display: 'flex' }}>   // ❌ usar className
```

### Añadir una Nueva Entidad

1. **types.ts:** Si necesita nuevas props, extiende `Entity`.
2. **GenetixEngine.ts:**
   - Crea la clase extendiendo `Entidad`.
   - Añade la lista en `listas`.
   - Añade spawn en `init()`.
   - Añade lógica en `update()`.
   - Añade renderizado en `draw()`.
3. **App.tsx / ControlPanel.tsx:** Añade slider y estado si es configurable.
4. **types.ts:** Actualiza `GameConfig.entityCounts` si el conteo es configurable.

### Debugging

```typescript
// Inspeccionar el engine desde la consola del navegador (en dev):
// engineRef.current es una Ref → no accesible directamente
// Añade temporalmente al window:
(window as any).engine = engineRef.current;

// Logs disponibles en estado de React:
// DevTools → Components → App → logs[]
```

### Testing (preparado pero no implementado)

```typescript
// GenetixEngine es una clase pura → fácil de testear con Vitest
import { GenetixEngine } from "./services/GenetixEngine";

test("init spawns correct entity counts", () => {
  const engine = new GenetixEngine();
  engine.init({
    renderSpeed: 200,
    showHealthBars: true,
    entityCounts: { allies: 10, enemies: 10, healers: 2, obstacles: 5 },
  });
  expect(engine.getStats().allies).toBe(10);
});

test("executeOmegaProtocol destroys ~80% enemies", () => {
  const engine = new GenetixEngine();
  engine.init({ ...config, entityCounts: { ...counts, enemies: 10 } });
  engine.executeOmegaProtocol();
  expect(engine.getStats().enemies).toBeLessThanOrEqual(2); // 20% survivors
});
```

---

## Resumen Comparativo

| Métrica          | v3.3               | v3.5                              |
| :--------------- | :----------------- | :-------------------------------- |
| Archivos         | 3                  | 15+                               |
| Líneas totales   | ~1000              | ~2500 (distribuido)               |
| Tipado           | Dinámico           | Estático (TS)                     |
| HMR              | No                 | Sí                                |
| Responsividad    | Parcial            | Full mobile-first                 |
| Audio            | No                 | 5 pistas + crossfade              |
| Efectos visuales | No                 | Signal Loss, Nuke, CRT, DeathAnim |
| Mecánicas extra  | No                 | Omega Protocol + Fallout          |
| Testing          | Difícil            | Preparado (Vitest)                |
| Deployment       | Archivos estáticos | Build optimizado Vite             |

---

**Documentación:** Arquitectura v3.5 | **Última Actualización:** 2026 | **Autor:** Juanma Fernández
