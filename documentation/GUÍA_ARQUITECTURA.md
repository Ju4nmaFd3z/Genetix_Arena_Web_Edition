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

**Genetix Arena** ha evolucionado de una arquitectura monolítica JavaScript (v3.3) a una arquitectura modular TypeScript + React (v3.5). Este cambio se alinea con mejores prácticas modernas de desarrollo frontend:

### Motivaciones Principales

| Aspecto | v3.3 | v3.5 | Beneficio |
| :--- | :--- | :--- | :--- |
| **Tipado** | Dinámico (JS) | Estático (TS) | Detección de errores en build-time |
| **Modularidad** | Monolítico | Componentes React | Reusabilidad y mantenibilidad |
| **Build Tool** | Manual (HTTP) | Vite + bundling | HMR, tree-shaking, optimización |
| **UI State** | Manual (DOM) | React Hooks | Sincronización automática UI ↔ State |
| **Testing** | No formalizado | Preparado para Jest/Vitest | Confianza en refactoring |
| **Responsividad** | Parcial (media queries) | Mobile-first grid | Experiencia uniforme en móvil |
| **Deployment** | Vanilla files | Vite build optimizado | Menor tamaño, mejor caché |

---

## Stack Tecnológico Comparativo

### v3.3 (JavaScript Vanilla)

```
┌─────────────────────────────────────────────────┐
│            HTML5 + CSS3 + JavaScript ES6+       │
├─────────────────────────────────────────────────┤
│                                                 │
│  index.html                                     │
│  ├─ <canvas id="canvas">                        │
│  ├─ <div id="controls">                         │
│  └─ <div id="console">                          │
│                                                 │
│  CSS3 (Estilos custom)                          │
│  ├─ Animations                                  │
│  ├─ Grid layouts                                │
│  └─ Glassmorphism effects                       │
│                                                 │
│  app.js (Monolítico ~1000+ líneas)              │
│  ├─ Clases (Entidad, Aliado, etc.)              │
│  ├─ Engine (update, draw, collision)            │
│  ├─ UI handlers (clickeadores, listeners)       │
│  └─ Game Loop (requestAnimationFrame)           │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Características:**
- ✅ Cero dependencias (standalone)
- ✅ Inicio rápido (sin build process)
- ❌ Tipado dinámico → errores en runtime
- ❌ No modular → difícil de testear
- ❌ State management manual → propenso a bugs
- ❌ Responsive limitada
- ❌ Sin sistema de audio ni efectos visuales

### v3.5 (TypeScript + React + Vite)

```
┌──────────────────────────────────────────────────────────┐
│    TypeScript + React 19 + Vite + Tailwind + Lucide      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  package.json (npm ecosystem)                            │
│  ├─ react@19.2.4                                         │
│  ├─ react-dom@19.2.4                                     │
│  ├─ lucide-react@0.574.0                                 │
│  └─ @vitejs/plugin-react                                 │
│                                                          │
│  Componentes React (Modular)                             │
│  ├─ App.tsx           (Orquestador, game loop y audio)   │
│  ├─ LandingPage.tsx   (UI de landing)                    │
│  ├─ ControlPanel.tsx  (Panel de control)                 │
│  ├─ ConsoleLog.tsx    (Consola de logs)                  │
│  ├─ StatsDisplay.tsx  (Estadísticas detalladas)          │
│  ├─ RetroLCD.tsx      (Display de estado)                │
│  └─ SignalLossEffect.tsx (Efectos visuales de glitch)    │
│                                                          │
│  Lógica de Negocio (TypeScript Vanilla)                  │
│  ├─ GenetixEngine.ts  (Motor de IA + utilidades)         │
│  └─ types.ts          (Definiciones TS)                  │
│                                                          │
│  Estilos (Tailwind CSS via CDN)                          │
│  ├─ Utility classes                                      │
│  ├─ Custom theme (space-*) definido en index.html        │
│  └─ Responsive defaults (mobile-first)                   │
│                                                          │
│  Tooling (Vite)                                          │
│  ├─ Dev server + HMR (puerto 3000)                       │
│  ├─ TypeScript compilation (tsc -b)                      │
│  ├─ Code splitting                                       │
│  └─ Production bundling                                  │
│                                                          │
│  Assets                                                  │
│  └─ public/tracks/ (5 pistas MP3)                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Características:**
- ✅ Tipado estático → errores en compile-time
- ✅ Modular → fácil de testear y mantener
- ✅ React Hooks → state management automático
- ✅ Fully responsive → mobile-first
- ✅ Build tooling profesional → optimizado para producción
- ✅ Sistema de audio + efectos visuales avanzados
- ⚠️ Dependencias externas (estándar en la industria)

---

## Arquitectura Anterior (v3.3)

### Estructura de Archivos

```
GenetixArenaWeb_v3.3/
│
├── index.html              # Entrypoint único
├── css/
│   └── style.css          # Todos los estilos (1 archivo)
│
└── js/
    └── app.js             # TODO el código (~1000+ líneas)
        ├─ Clases JS (Entidad, Aliado, Enemigo, Curandero, Obstaculo)
        ├─ Engine (init, update, draw, checkWin)
        ├─ Event listeners (clickeadores)
        └─ Game loop (requestAnimationFrame)
```

### Flujo de Aplicación (v3.3)

```
index.html
    ↓
[DOMContentLoaded]
    ↓
app.js (script tag)
    ├─ Inicializa canvas
    ├─ Crea listeners
    ├─ Inicia game loop (requestAnimationFrame)
    └─ Todo ocurre en scope global

    ↓
Usuario hace click en "Iniciar"
    ↓
startGame() → engine.init(config)
    ↓
loop(timestamp)
    ├─ engine.update()        → actualizar lógica
    ├─ engine.draw(ctx)       → renderizar
    └─ updateUI()             → modificar DOM (manualmente)
    ↓
Continúa hasta victoria/derrota
```

### Problemas de v3.3

1. **Tipado Dinámico:** Errores como `entity.posX.toString()` no se detectan hasta runtime
2. **Monolítico:** 1000+ líneas en un único `app.js` → difícil de navegar y mantener
3. **State Manual:** Control directo del DOM con `getElementById()` e `innerHTML`
4. **Sin Hot Reload:** Cambios requieren F5 (refresh manual)
5. **Dependencias Implícitas:** Difícil saber qué depende de qué
6. **Testing Difícil:** No modular → casi imposible hacer unit tests

---

## Arquitectura Actual (v3.5)

### Estructura de Archivos

```
Genetix_Arena_Web_Edition/
│
├── index.html                      # HTML minimal + CDN Tailwind + fuentes Google
├── index.tsx                       # React root entry
├── favicon.svg                     # Favicon de la aplicación
│
├── App.tsx                         # Componente raíz
│   ├─ State management (useState)
│   ├─ Game loop orchestration (requestAnimationFrame + loopRef)
│   ├─ Sistema de audio (5 AudioRefs + fade automático)
│   └─ Composición de componentes
│
├── components/
│   ├─ LandingPage.tsx             # UI de landing con 3 modales
│   ├─ ControlPanel.tsx            # Panel de control (sliders, botones)
│   ├─ ConsoleLog.tsx              # Consola de eventos
│   ├─ StatsDisplay.tsx            # Panel de estadísticas detalladas
│   ├─ RetroLCD.tsx                # Display LCD de estado
│   └─ SignalLossEffect.tsx        # Overlay de glitch / Signal Loss
│
├── services/
│   └─ GenetixEngine.ts            # Motor de IA + utilidades
│
├── types.ts                        # Definiciones TypeScript
│
├── public/tracks/                  # Assets de audio
│   ├─ LandingTrack.mp3
│   ├─ BattleTrack.mp3
│   ├─ AlliesWinTrack.mp3
│   ├─ EnemiesWinTrack.mp3
│   └─ DrawTrack.mp3
│
├── metadata.json                   # Metadatos del proyecto
├── package.json                    # Dependencias npm
├── eslint.config.js                # Configuración de ESLint
├── tsconfig.json                   # Configuración TypeScript
└── vite.config.ts                  # Configuración Vite (puerto 3000, alias, env)
```

### Separación de Responsabilidades

```
┌─────────────────────────────────────────────────────────┐
│                      React Components                   │
│                    (UI Layer)                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  App.tsx                                                │
│  ├─ Estado global (view, config, stats, logs, audio...) │
│  ├─ Game loop (loopRef + requestAnimationFrame)         │
│  ├─ Sistema de audio (5 pistas, fade, mute)             │
│  └─ Layout principal                                    │
│                                                         │
│  LandingPage.tsx                                        │
│  ├─ Pantalla de bienvenida                              │
│  ├─ 3 modales informativos                              │
│  └─ CTA de inicio + toggle de mute                      │
│                                                         │
│  ControlPanel.tsx                                       │
│  ├─ RetroLCD (estado de simulación)                     │
│  ├─ Sliders (entidades, velocidad)                      │
│  ├─ Toggles (barras de vida)                            │
│  └─ Botones de control                                  │
│                                                         │
│  ConsoleLog.tsx                                         │
│  ├─ Renderiza log entries con timestamps                │
│  └─ Auto-scroll al final                                │
│                                                         │
│  StatsDisplay.tsx                                       │
│  └─ Estadísticas detalladas (daño, curación, etc.)      │
│                                                         │
│  RetroLCD.tsx                                           │
│  └─ Display LCD del estado actual                       │
│                                                         │
│  SignalLossEffect.tsx                                   │
│  └─ Overlay de glitch (noise / dark / idle)             │
│                                                         │
└─────────────────────────────────────────────────────────┘
              ↕ Props, Callbacks
┌─────────────────────────────────────────────────────────┐
│              TypeScript Core Logic                      │
│              (Business Logic Layer)                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  GenetixEngine.ts                                       │
│  ├─ Clases: Entidad, Aliado, Enemigo, Curandero         │
│  ├─ Grid state (75x25 array)                            │
│  ├─ Métodos: init(), update(), draw(), checkWin()       │
│  ├─ getDetailedStats() → DetailedStats                  │
│  └─ Utilidades: posicionValida(), colisiones, cleanup   │
│                                                         │
│  types.ts                                               │
│  ├─ GameConfig                                          │
│  ├─ GameStats                                           │
│  ├─ DetailedStats                                       │
│  ├─ LogEntry                                            │
│  └─ Entity interface                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
             ↕ Instancia, llamadas a métodos
┌─────────────────────────────────────────────────────────┐
│                   Rendering (Canvas)                    │
│                  (Presentation Layer)                   │
├─────────────────────────────────────────────────────────┤
│  <canvas> element (1500×500px)                          │
│  engine.draw(ctx, config) → renderiza entidades         │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Aplicación (v3.5)

```
index.html
    ↓
<script type="module" src="/index.tsx">
    ↓
index.tsx (React root)
    ├─ ReactDOM.createRoot()
    └─ root.render(<App />)

    ↓
App.tsx (componente raíz)
    ├─ useState: view, opacity, config, stats, detailedStats,
    │            logs, isRunning, hasStarted, gameResult,
    │            missionId, isMuted, isExploding, signalPhase...
    ├─ useRef: canvasRef, engineRef, lastTickRef, loopRef,
    │          landingAudioRef, gameAudioRef, ...
    ├─ useCallback: addLog()
    └─ useEffect: sincroniza RAF loop con estado

    ↓
LandingPage.tsx (si view === 'landing')
    ├─ Hero section + modales
    └─ CTA button → onStart() → transición a 'game'

    ↓
Game View (si view === 'game')
    ├─ Canvas (1500×500) + SignalLossEffect overlay
    ├─ Right Sidebar: StatsDisplay + ControlPanel
    ├─ Bottom Console: ConsoleLog
    └─ Modal de resultado (victoria/derrota/empate)

    ↓
Game Loop (loopRef + requestAnimationFrame)
    ├─ Throttle por config.renderSpeed
    ├─ engine.update()           ← GenetixEngine (lógica IA)
    ├─ engine.draw(ctx, config)  ← Canvas render
    ├─ setStats(...)             ← Sincroniza UI básica
    ├─ setDetailedStats(...)     ← Sincroniza métricas avanzadas
    └─ addLog(event, 'combat')   ← Registra eventos
```

---

## Mapeo de Responsabilidades

### v3.3: Monolítico (Todo en app.js)

```
app.js
├─ HTML DOM manipulation
├─ CSS class toggling
├─ Event listeners (onclick, onchange)
├─ Game state (variables globales)
├─ Entity classes & AI logic
├─ Rendering logic (canvas context)
├─ Game loop
└─ Collision detection
```

**Problema:** Mezcla total de concerns. Imposible testear partes aisladas.

### v3.5: Separado por Responsabilidad

```
App.tsx (Orquestador)
├─ Estado de la app (view, config, logs, audio, etc.)
├─ Game loop (requestAnimationFrame + loopRef)
├─ Sistema de audio (5 pistas + fade + mute)
└─ Composición de componentes

LandingPage.tsx (UI de bienvenida)
├─ Pantalla inicial
├─ 3 modales informativos
└─ CTA de inicio

ControlPanel.tsx (UI de control)
├─ RetroLCD de estado
├─ Sliders de parámetros
├─ Toggles de opciones
└─ Botones de acción

ConsoleLog.tsx (UI de logs)
├─ Renderiza historial de eventos
└─ Auto-scroll

StatsDisplay.tsx (UI de métricas)
└─ Estadísticas detalladas de sesión

RetroLCD.tsx (UI de estado)
└─ Display LCD de estado actual

SignalLossEffect.tsx (UI de efectos)
└─ Overlay de glitch y pérdida de señal

GenetixEngine.ts (Lógica pura)
├─ Clases (Entidad, Aliado, Enemigo, Curandero, Obstaculo)
├─ Métodos (init, update, draw, checkWin, getDetailedStats)
├─ Utilidades (posicionValida, colisiones, cleanup)
└─ CERO acceso a React/DOM

types.ts (Contratos)
├─ GameConfig interface
├─ GameStats interface
├─ DetailedStats interface
├─ LogEntry interface
└─ Entity interface
```

**Beneficio:** Cada archivo tiene una única responsabilidad. Fácil de testear, depurar y escalar.

---

## Patrones y Convenciones

### 1. React Hooks Utilizados

#### **useState** - State Management

```typescript
const [isRunning, setIsRunning] = useState(false);
const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
const [logs, setLogs] = useState<LogEntry[]>([]);
const [isMuted, setIsMuted] = useState(true);
```

#### **useRef** - Persist Values Across Renders

```typescript
const canvasRef = useRef<HTMLCanvasElement>(null);
const engineRef = useRef<GenetixEngine>(new GenetixEngine());
const lastTickRef = useRef<number>(0);
const loopRef = useRef<(timestamp: number) => void>(() => {});
const gameAudioRef = useRef<HTMLAudioElement | null>(null);
```

#### **useCallback** - Memoized Callbacks

```typescript
const addLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
  // Evita recreación innecesaria en dependencias de useEffect
}, []);
```

#### **useEffect** - Side Effects

```typescript
useEffect(() => {
  if (isRunning) {
    animationFrameRef.current = requestAnimationFrame(loopRef.current);
  }
  return () => cancelAnimationFrame(animationFrameRef.current);
}, [isRunning, config]);
```

### 2. loopRef Pattern (evitar stale closures)

El game loop usa `loopRef.current` en lugar de una función declarada directamente en el efecto. Se sobreescribe en cada render, garantizando que el RAF siempre acceda a los valores más recientes de estado:

```typescript
loopRef.current = (timestamp: number) => {
  // accede a isRunning, config, etc. actualizados
};
requestAnimationFrame(loopRef.current);
```

### 3. TypeScript Interfaces

Todo tiene tipo bien definido, sin `any`:

```typescript
interface GameConfig {
  renderSpeed: number;
  showHealthBars: boolean;
  entityCounts: { allies: number; enemies: number; ... };
}

interface DetailedStats {
  averageAllyLifespan: string;
  totalDamageDealtByAllies: number;
  totalHealingDone: number;
  survivalRate: string;
}
```

### 4. Props Drilling vs Context

Actualmente se usa **props drilling** (pasar props de componente en componente). Para apps más grandes, se podría migrar a **React Context** o **Zustand**:

```typescript
// Actual (props drilling)
<ControlPanel
  config={config}
  isRunning={isRunning}
  setConfig={setConfig}
  onTogglePause={...}
/>

// Alternativa con Context
<GameContext.Provider value={{ config, isRunning, ... }}>
  <ControlPanel />  {/* Accede directamente a context */}
</GameContext.Provider>
```

### 5. Tailwind CSS vía CDN

El tema personalizado se define en `index.html` (no en un `tailwind.config.js` separado, ya que Tailwind se carga desde CDN):

```javascript
// index.html
tailwind.config = {
  theme: {
    extend: {
      colors: { space: { ally: '#10b981', enemy: '#ef4444', ... } }
    }
  }
}
```

Uso en componentes: `className="text-space-ally font-mono bg-space-dark"`

---

## Mejoras Clave

### 1. Tipado Estático

**v3.3:**
```javascript
entity.posX = "invalid";   // ✅ Sin error (runtime)
entity.getDistancia(null); // ✅ Sin error hasta ejecución
```

**v3.5:**
```typescript
entity.posX = "invalid";   // ❌ Error de compilación
entity.getDistancia(null); // ❌ Error de compilación
```

### 2. Modularidad

**v3.3:** 1000+ líneas en un único archivo

**v3.5:** Archivos pequeños con responsabilidad única:
```
GenetixEngine.ts      ~350 líneas  (lógica pura)
App.tsx               ~350 líneas  (orquestador + audio)
LandingPage.tsx       ~240 líneas  (UI landing)
ControlPanel.tsx      ~150 líneas  (UI control)
SignalLossEffect.tsx   ~80 líneas  (efecto visual)
StatsDisplay.tsx       ~60 líneas  (estadísticas)
ConsoleLog.tsx         ~50 líneas  (UI logs)
RetroLCD.tsx           ~40 líneas  (display LCD)
types.ts               ~45 líneas  (tipos)
```

### 3. Hot Module Replacement (HMR)

**v3.3:** Cambio → F5 obligatorio

**v3.5:** Cambio → auto-actualización en navegador sin perder estado de simulación

### 4. Build Optimization (Vite)

**v3.5:** `npm run build` ejecuta primero `tsc -b` (compila TS) y luego Vite (tree-shaking, minificación, source maps, chunking).

### 5. Responsividad

**v3.5:** Mobile-first con Tailwind. Ejemplo:

```typescript
<div className="flex flex-col md:flex-row">
  <main className="flex-1">...</main>
  <aside className="w-full md:w-80">...</aside>
</div>
```

### 6. Nuevas Funcionalidades (sin equivalente en v3.3)

- Sistema de audio con 5 pistas y fade automático
- Efectos visuales: Signal Loss, Nuke, CRT flicker
- Estadísticas detalladas de sesión (`DetailedStats`)
- Mission ID por sesión
- Modal de resultado final animado

### 7. Testing Ready

```typescript
// GenetixEngine.ts es una clase pura, fácil de testear
const engine = new GenetixEngine();
engine.init(config);
engine.update();
expect(engine.getStats().allies).toBeLessThanOrEqual(75);

// Componentes React: usar React Testing Library
import { render, screen } from '@testing-library/react';
render(<ControlPanel {...props} />);
expect(screen.getByText(/INICIAR/)).toBeInTheDocument();
```

---

## Guía para Contribuidores

### Configuración del Entorno

```bash
# 1. Clonar repo
git clone https://github.com/Ju4nmaFd3z/Genetix_Arena_Web_Edition.git
cd Genetix_Arena_Web_Edition

# 2. Instalar dependencias
npm install

# 3. Iniciar dev server
npm run dev

# 4. Abrir en navegador
# http://localhost:3000
```

### Convenciones de Código

#### TypeScript

```typescript
// ✅ Siempre especificar tipos
const countAllies = (entities: Entity[]): number => entities.length;

// ❌ Evitar 'any'
const countAllies = (entities: any): any => { ... };
```

#### React Components

```typescript
// ✅ FC type con props interface
interface MyComponentProps {
  title: string;
  onClick: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => (
  <button onClick={onClick}>{title}</button>
);
```

#### CSS (Tailwind)

```typescript
// ✅ Clases Tailwind
<div className="flex gap-2 p-4 bg-space-dark">

// ❌ Evitar estilos inline cuando sea posible
<div style={{ display: 'flex', gap: '8px' }}>
```

### Añadir una Nueva Característica

**Ejemplo:** Añadir botón "Export Results"

1. **Actualizar tipo** (`types.ts`):
```typescript
interface DetailedStats {
  // ... campos existentes
  timestamp?: number; // ← Agregar
}
```

2. **Actualizar lógica** (`GenetixEngine.ts`):
```typescript
getDetailedStats(): DetailedStats {
  return {
    // ... campos existentes
    timestamp: Date.now()
  };
}
```

3. **Actualizar componente** (`ControlPanel.tsx`):
```typescript
const handleExport = () => {
  const data = JSON.stringify(stats);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'genetix-results.json';
  a.click();
};

return (
  <button onClick={handleExport} className="...">
    EXPORTAR RESULTADOS
  </button>
);
```

4. **Test** (futura implementación con Vitest):
```typescript
it('should export stats as JSON', () => {
  const { getByText } = render(<ControlPanel {...props} />);
  fireEvent.click(getByText(/EXPORTAR/));
  // Assert
});
```

### Debugging

#### Chrome DevTools

1. **F12** → Sources tab
2. Los archivos TypeScript están disponibles via source maps
3. Puedes setear breakpoints e inspeccionar variables de estado

#### React DevTools

Instala la extensión de Chrome, luego en DevTools → Components tab para inspeccionar el estado de cada componente en tiempo real.

#### Console Logging

```typescript
console.log('Engine stats:', engineRef.current.getStats());
console.log('Detailed stats:', engineRef.current.getDetailedStats());
console.log('Config:', config);
console.log('Logs buffer:', logs);
```

---

## Conclusión

La migración de **v3.3 → v3.5** representa una evolución hacia una arquitectura profesional, mantenible y escalable. La lógica core (IA, colisiones, grid) permanece intacta con paridad 1:1, pero la estructura del código, la experiencia de desarrollo y las capacidades visuales/sonoras son significativamente superiores.

### Resumen Comparativo

| Métrica | v3.3 | v3.5 |
| :--- | :--- | :--- |
| Líneas de código | ~1000+ | ~1350 (distribuido en 9 archivos) |
| Tipado | Dinámico | Estático (TS) |
| Componentes | 1 monolítico | 7 modulares + 1 servicio |
| Build time | N/A | ~2s (dev), ~5s (prod) |
| HMR | No | Sí (puerto 3000) |
| Responsividad | Parcial | Full (mobile-first) |
| Audio | No | 5 pistas con fade |
| Efectos visuales | No | Signal Loss, Nuke, CRT |
| Estadísticas | Básicas | Detalladas (DetailedStats) |
| Testing | Difícil | Preparado (Jest/Vitest) |
| Mantenibilidad | Baja | Alta |
| Escalabilidad | Limitada | Alta |

**v3.5 está listo para producción y preparado para futuro crecimiento.**

---

**Documentación:** Arquitectura v3.5 | **Última Actualización:** 2026 | **Autor:** Juanma Fernández
