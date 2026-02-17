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
| **Responsividad** | Parcial (media queries) | Mobile-first grid | Experiencia uniforme móvil |
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
│  ├─ App.tsx (Orquestador, game loop)                     │
│  ├─ LandingPage.tsx (UI de landing)                      │
│  ├─ ControlPanel.tsx (Panel de control)                  │
│  └─ ConsoleLog.tsx (Consola de logs)                     │
│                                                          │
│  Lógica de Negocio (TypeScript Vanilla)                  │
│  ├─ GenetixEngine.ts (Motor de IA)                       │
│  ├─ types.ts (Definiciones TS)                           │
│  └─ MisFunciones.ts (Utilidades)                         │
│                                                          │
│  Estilos (Tailwind CSS)                                  │
│  ├─ Utility classes                                      │
│  ├─ Custom theme (space-*)                               │
│  └─ Responsive defaults (mobile-first)                   │
│                                                          │
│  Tooling (Vite)                                          │
│  ├─ Dev server + HMR                                     │
│  ├─ TypeScript compilation                               │
│  ├─ Code splitting                                       │
│  └─ Production bundling                                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Características:**
- ✅ Tipado estático → errores en compile-time
- ✅ Modular → fácil de testear y mantener
- ✅ React Hooks → state management automático
- ✅ Fully responsive → mobile-first
- ✅ Build tooling profesional → optimizado para producción
- ⚠️ Dependencias externas (pero estándar en industria)

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
2. **Monolítico:** 1000+ líneas en un único `app.js` → difícil de navegar
3. **State Manual:** Control manual del DOM con `getElementById()` y `innerHTML`
4. **Sin Hot Reload:** Cambios requieren F5 (refresh manual)
5. **Dependencias Implícitas:** Difícil saber qué depende de qué
6. **Testing Difícil:** No modular → casi imposible unit test

---

## Arquitectura Actual (v3.5)

### Estructura de Archivos

```
GenetixArenaWeb_v3.5/
│
├── index.html                      # HTML minimal + CDN Tailwind/React
├── index.tsx                       # React root entry
├── index.css                       # Estilos globales (minimal)
│
├── App.tsx                         # Componente raíz
│   ├─ State management (useState)
│   ├─ Game loop orchestration
│   └─ Composición de componentes
│
├── components/
│   ├─ LandingPage.tsx             # UI de landing
│   ├─ ControlPanel.tsx            # Panel de control (sliders, botones)
│   └─ ConsoleLog.tsx              # Consola de eventos
│
├── services/
│   └─ GenetixEngine.ts            # Motor de IA (lógica pura)
│
├── types.ts                        # Definiciones TypeScript
│
├── package.json                    # Dependencias npm
├── tsconfig.json                   # Configuración TS
├── vite.config.ts                  # Configuración Vite
│
└── tailwind.config.js              # Configuración Tailwind (theme)
```

### Separación de Responsabilidades

```
┌─────────────────────────────────────────────────────────┐
│                      React Components                   │
│                  (UI Layer)                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  App.tsx                                                │
│  ├─ Maneja estado global (isRunning, config, stats)     │
│  ├─ Orquesta game loop (requestAnimationFrame)          │
│  └─ Renderiza layout principal                          │
│                                                         │
│  LandingPage.tsx                                        │
│  ├─ Componente "ruta" landing                           │
│  ├─ Modales informativos                                │
│  └─ Entrada de usuario                                  │
│                                                         │
│  ControlPanel.tsx                                       │
│  ├─ Sliders (entidades, velocidad)                      │
│  ├─ Toggles (barras de vida)                            │
│  └─ Botones de control                                  │
│                                                         │
│  ConsoleLog.tsx                                         │
│  ├─ Renderiza log entries                               │
│  └─ Auto-scroll al final                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
              ↕ Props, Callbacks
┌─────────────────────────────────────────────────────────┐
│              TypeScript Core Logic                      │
│                (Business Logic Layer)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  GenetixEngine.ts                                       │
│  ├─ Clases: Entidad, Aliado, Enemigo, Curandero         │
│  ├─ Grid state (75x25 array)                            │
│  ├─ Métodos: init(), update(), draw(), checkWin()       │
│  └─ Utilidades: posicionValida(), colisiones, etc.      │
│                                                         │
│  types.ts                                               │
│  ├─ GameConfig                                          │
│  ├─ GameStats                                           │
│  ├─ LogEntry                                            │
│  └─ Entity interface                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
             ↕ Instancia, llamadas a métodos
┌─────────────────────────────────────────────────────────┐
│                   Rendering (Canvas)                    │
│                  (Presentation Layer)                   │
├─────────────────────────────────────────────────────────┤
│  <canvas> element                                       │
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
    ├─ useState: view, config, stats, logs, isRunning, gameResult
    ├─ useRef: canvasRef, engineRef, lastTickRef, animationFrameRef
    ├─ useCallback: addLog()
    ├─ useEffect: sincroniza RAF loop con estado
    └─ Renderiza: LandingPage O (Canvas + ControlPanel + ConsoleLog)
    
    ↓
LandingPage.tsx (si view === 'landing')
    ├─ Muestra hero section
    ├─ Tres modales informativos
    └─ CTA button → onStart() → setView('game')
    
    ↓
Game View (si view === 'game')
    ├─ Canvas (1500x500)
    ├─ Right Sidebar con ControlPanel.tsx
    │   ├─ Permite modificar config (sliders)
    │   ├─ Controles de pausa/reinicio
    │   └─ Feedback en vivo (stats)
    ├─ Bottom Console con ConsoleLog.tsx
    │   └─ Muestra eventos en orden temporal
    └─ Modal de resultado (victoria/derrota)
    
    ↓
Game Loop (useEffect)
    ├─ const loop = (timestamp) => {
    │   if (isRunning) {
    │     engine.update()              ← GenetixEngine
    │     engine.draw(ctx, config)
    │     setStats(...)                ← Sincroniza con React
    │   }
    │   requestAnimationFrame(loop)
    │ }
    └─ Cleanup: cancelAnimationFrame()
    
    ↓
Cuando game ends
    ├─ engine.checkWin() retorna resultado
    ├─ setGameResult(result)
    └─ Modal overlay muestra VICTORIA/DERROTA
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

**Problema:** Mezcla de concerns. Difícil entender flujo.

### v3.5: Separado por Responsabilidad

```
App.tsx (Orquestador)
├─ Maneja estado de la app (view, config, logs, etc.)
├─ Controla game loop (requestAnimationFrame)
├─ Sincroniza React ↔ Canvas
└─ Composición de componentes

LandingPage.tsx (UI de bienvenida)
├─ Renderiza página inicial
├─ Modales informativos
└─ CTA de inicio

ControlPanel.tsx (UI de control)
├─ Sliders de parámetros
├─ Toggles de opciones
└─ Botones de acción

ConsoleLog.tsx (UI de logs)
├─ Renderiza historial de eventos
└─ Auto-scroll

GenetixEngine.ts (Lógica pura)
├─ Clases (Entidad, Aliado, Enemigo, Curandero)
├─ Métodos (init, update, draw, checkWin)
├─ Utilidades (posicionValida, colisiones)
└─ CERO acceso a React/DOM

types.ts (Contratos)
├─ GameConfig interface
├─ GameStats interface
├─ LogEntry interface
└─ Entity interface
```

**Beneficio:** Cada archivo tiene una responsabilidad clara. Fácil de testear.

---

## Patrones y Convenciones

### 1. React Hooks Utilizados

#### **useState** - State Management

```typescript
const [isRunning, setIsRunning] = useState(false);
const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
const [logs, setLogs] = useState<LogEntry[]>([]);
```

#### **useRef** - Persist Values Across Renders

```typescript
const canvasRef = useRef<HTMLCanvasElement>(null);
const engineRef = useRef<GenetixEngine>(new GenetixEngine());
const lastTickRef = useRef<number>(0);
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
    animationFrameRef.current = requestAnimationFrame(loop);
  }
  return () => cancelAnimationFrame(animationFrameRef.current);
}, [isRunning, config]);
```

### 2. TypeScript Interfaces

Todo tiene un tipo bien definido:

```typescript
interface GameConfig {
  renderSpeed: number;
  showHealthBars: boolean;
  entityCounts: { allies: number; enemies: number; ... };
}

interface Entity {
  posX: number;
  posY: number;
  vida: number;
  getDistancia(e: Entity): number;
  // etc.
}
```

**Beneficio:** Autocompletado en IDE, errores en compile-time.

### 3. Props Drilling vs Context

Actualmente usamos **props drilling** (pasar props de componente en componente). Para apps más grandes, se podría usar **React Context** o **Zustand** para global state.

```typescript
// Actual (props drilling)
<ControlPanel 
  config={config}
  isRunning={isRunning}
  setConfig={setConfig}
  onTogglePause={...}
  {...}
/>

// Alternativa con Context
<GameContext.Provider value={{ config, isRunning, ... }}>
  <ControlPanel />  {/* Accede directamente a context */}
</GameContext.Provider>
```

### 4. Tailwind CSS Utilities

En lugar de clases CSS custom, usamos Tailwind:

```typescript
<div className="flex items-center gap-2 p-4 bg-space-dark border border-space-border">
  // flex, items-center, gap-2, p-4, bg-space-dark, border, border-space-border
</div>
```

**Ventajas:**
- Consistencia visual
- Rápido prototipado
- Responsive built-in (`md:`, `lg:`, etc.)
- Dark mode support

### 5. Custom Tailwind Theme

Define colores y fuentes:

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      space: {
        black: '#050505',
        dark: '#0a0a0a',
        ally: '#10b981',
        enemy: '#ef4444',
        // ...
      }
    },
    fontFamily: {
      mono: ['JetBrains Mono', 'monospace'],
    }
  }
}
```

Uso: `className="text-space-ally font-mono"`

---

## Mejoras Clave

### 1. Tipado Estático (TypeScript)

**Antes (v3.3):**
```javascript
// Podría fallar en runtime
entity.posX = "invalid";  // ✅ Sin error (dinámico)
entity.getDistancia(null); // ✅ Sin error hasta runtime
```

**Después (v3.5):**
```typescript
entity.posX = "invalid";  // ❌ Error de compilación (Type 'string' is not assignable to type 'number')
entity.getDistancia(null); // ❌ Error de compilación (Argument of type 'null' is not assignable to type 'Entity')
```

### 2. Modularidad

**Antes:** 1000+ líneas en un archivo  
**Después:** 5-6 archivos pequeños, cada uno con responsabilidad clara

```
GenetixEngine.ts      ~350 líneas (lógica pura)
App.tsx              ~200 líneas (orquestador)
ControlPanel.tsx     ~150 líneas (UI control)
LandingPage.tsx      ~240 líneas (UI landing)
ConsoleLog.tsx       ~50  líneas (UI logs)
types.ts             ~30  líneas (tipos)
```

### 3. Hot Module Replacement (HMR)

**v3.3:** Cambio en archivo → F5 (refresh manual)  
**v3.5:** Cambio en archivo → auto-actualizacion en navegador (sin perder estado)

```bash
npm run dev  # Dev server con HMR activado
```

### 4. Build Optimization (Vite)

**v3.3:** Archivos servidos tal cual (desarrollo) o concatenados (producción)  
**v3.5:** 
- Tree-shaking (elimina código muerto)
- Code splitting (divide bundle en chunks)
- Minification (comprime)
- Source maps (debugging en producción)

```bash
npm run build  # Genera /dist optimizado
```

### 5. Responsividad

**v3.3:** Media queries manuales en CSS  
**v3.5:** Mobile-first con Tailwind

```typescript
// Stackea en móvil, lado a lado en desktop
<div className="flex flex-col md:flex-row">
  <main className="flex-1">...</main>
  <aside className="w-full md:w-80">...</aside>
</div>
```

### 6. Testing Ready

**v3.5** está preparado para testing:

```typescript
// GenetixEngine.ts es una clase pura, fácil de testear
const engine = new GenetixEngine();
engine.init(config);
const result = engine.update();
// Assert...

// Componentes React pueden usar React Testing Library
import { render, screen } from '@testing-library/react';
render(<ControlPanel {...props} />);
expect(screen.getByText(/PAUSAR/)).toBeInTheDocument();
```

---

## Guía para Contribuidores

### Configuración del Entorno

```bash
# 1. Clonar repo
git clone <repo_url>
cd GenetixArenaWeb

# 2. Instalar dependencias
npm install

# 3. Iniciar dev server
npm run dev

# 4. Abrir en navegador
# http://localhost:5173
```

### Convenciones de Código

#### TypeScript

```typescript
// ✅ Siempre especificar tipos
const countAllies = (entities: Entity[]): number => {
  return entities.length;
};

// ❌ Evitar 'any'
const countAllies = (entities: any): any => { ... };
```

#### React Components

```typescript
// ✅ Usar FC type con props interface
interface MyComponentProps {
  title: string;
  onClick: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => {
  return <button onClick={onClick}>{title}</button>;
};

// ❌ Sin tipos explícitos
const MyComponent = ({ title, onClick }) => { ... };
```

#### CSS (Tailwind)

```typescript
// ✅ Usar clases Tailwind
<div className="flex gap-2 p-4 bg-space-dark">

// ❌ Evitar estilos inline cuando sea posible
<div style={{ display: 'flex', gap: '8px' }}>
```

### Añadir una Nueva Característica

**Ejemplo:** Agregar botón "Export Results"

1. **Actualizar tipo** (`types.ts`):
```typescript
interface GameStats {
  allies: number;
  enemies: number;
  healers: number;
  obstacles: number;
  timestamp?: number;  // ← Agregar
}
```

2. **Actualizar lógica** (`GenetixEngine.ts`):
```typescript
getStats() {
  return {
    allies: this.listas.aliados.length,
    enemies: this.listas.enemigos.length,
    healers: this.listas.curanderos.length,
    obstacles: this.listas.obstaculos.length,
    timestamp: Date.now()  // ← Agregar
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

4. **Testing** (futura: `ControlPanel.test.tsx`):
```typescript
it('should export stats as JSON', () => {
  const { getByText } = render(<ControlPanel {...props} />);
  fireEvent.click(getByText(/EXPORTAR/));
  // Assert que se descargó el archivo
});
```

### Debugging

#### Chrome DevTools

1. **F12** → Sources tab
2. Los archivos TypeScript están disponibles (source maps)
3. Puedes setear breakpoints y inspeccionar variables

#### React DevTools Extension

```bash
# Instala extensión en Chrome
# Luego en DevTools → Components tab
# Inspecciona estado de componentes en tiempo real
```

#### Console Logging

```typescript
console.log('Engine state:', engineRef.current.getStats());
console.log('Config:', config);
console.log('Logs buffer:', logs);
```

---

## Conclusión

La migración de **v3.3 → v3.5** representa una evolución hacia una arquitectura profesional, mantenible y escalable. Aunque la lógica core (IA, colisiones, grid) permanece idéntica (paridad 1:1), la presentación y la estructura del código son significativamente más robustas.

### Resumen Comparativo

| Métrica | v3.3 | v3.5 |
| :--- | :--- | :--- |
| Líneas de código | ~1000+ | ~800 (distribuido) |
| Tipado | Dinámico | Estático (TS) |
| Componentes | 1 monolítico | 6 modulares |
| Build time | N/A | ~2s (dev), ~5s (prod) |
| HMR | No | Sí |
| Responsividad | Parcial | Full |
| Testing | Difícil | Fácil |
| Mantenibilidad | Baja | Alta |
| Escalabilidad | Limitada | Alta |

**v3.5 está listo para producción y futuro crecimiento.**

---

**Documentación:** Arquitectura v3.5  
**Última Actualización:** 2026  
**Autor:** Juanma Fernández
