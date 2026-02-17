# 📘 GENETIX ARENA v3.5 | DOCUMENTACIÓN TÉCNICA COMPLETA

## 📑 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Componentes React](#componentes-react)
4. [Motor de Simulación (GenetixEngine)](#motor-de-simulación)
5. [Sistema de Tipos (TypeScript)](#sistema-de-tipos)
6. [Game Loop y Renderizado](#game-loop-y-renderizado)
7. [Protocolos de IA](#protocolos-de-ia)
8. [Sistema de Colisiones](#sistema-de-colisiones)
9. [Configuración del Proyecto](#configuración-del-proyecto)
10. [Performance y Optimizaciones](#performance-y-optimizaciones)

---

## Descripción General

**Genetix Arena v3.5** es un simulador táctico basado en navegador que modeliza el combate autónomo entre múltiples facciones de IA. La arquitectura moderna combina:

- **Frontend:** React 19 con Hooks (componentes funcionales)
- **Tipado:** TypeScript 5.8+ para seguridad de tipos
- **Build:** Vite 6.2 para HMR y bundling ultrarrápido
- **Estilos:** Tailwind CSS 3 con tema personalizado
- **Motor:** TypeScript vanilla (sin dependencias externas)

### Cambios respecto a v3.3

| Aspecto | v3.3 | v3.5 |
| :--- | :--- | :--- |
| **Lenguaje** | JavaScript ES6+ | TypeScript 5.8+ |
| **Framework** | Vanilla JS | React 19 + Hooks |
| **Build Tool** | (No especificado) | Vite 6.2 |
| **Estilos** | CSS3 custom | Tailwind CSS 3 |
| **Arquitectura** | Script único | Componentes modulares |
| **Tipado** | Dinámico | Estático (TS) |
| **Responsividad** | Parcial | Full (mobile-first) |
| **Icons** | SVG inline | Lucide React |

---

## Arquitectura del Sistema

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                      App.tsx (Root)                         │
│         Gestiona estado global y game loop principal         │
└─────────────────────────────────────────────────────────────┘
    │
    ├─► LandingPage.tsx (Vista inicial)
    │   ├─ Modal: PROTOCOLOS DE IA
    │   ├─ Modal: ANÁLISIS DE DESIGUALDAD
    │   └─ Modal: ESPECIFICACIONES TÉCNICAS
    │
    └─► Game View (Cuando inicia simulación)
        ├─► Canvas (Renderizado del Grid 75x25)
        │
        ├─► Right Sidebar (Dashboard)
        │   ├─ Telemetría en Vivo (Stats cards)
        │   └─ ControlPanel.tsx (Sliders, toggles, botones)
        │
        └─► Bottom Console (ConsoleLog.tsx)
            └─ Log entries con timestamps y colores contextuales

┌─────────────────────────────────────────────────────────────┐
│          GenetixEngine.ts (Lógica de Simulación)            │
│                                                             │
│  ├─ Grid: Array<Array<Entity | null>> (75x25)               │
│  ├─ Entities:                                               │
│  │  ├─ Entidad (base class)                                 │
│  │  ├─ Aliado (evasión)                                     │
│  │  ├─ Enemigo (persecución)                                │
│  │  ├─ Curandero (soporte)                                  │
│  │  └─ Obstaculo (estático)                                 │
│  │                                                          │
│  ├─ Methods:                                                │
│  │  ├─ init(config)          → Inicializa entidades         │
│  │  ├─ update()              → Tick de lógica               │
│  │  ├─ draw(ctx, config)     → Renderiza en canvas          │
│  │  ├─ getStats()            → Retorna conteos              │
│  │  └─ checkWin()            → Valida condición final       │
│  │                                                          │
│  └─ Utilities (MisFunciones):                               │
│     ├─ posicionValida()      → Validación de grid           │
│     ├─ detectarYResolverColisiones() → Damage application   │
│     └─ limpiarMuertos()      → Garbage collection           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Componentes React

### 1. **App.tsx** (Componente Raíz)

El corazón de la aplicación. Gestiona:

- **Estado Global:**
  - `view: 'landing' | 'game'` — Controla qué pantalla mostrar
  - `config: GameConfig` — Parámetros de simulación
  - `stats: GameStats` — Estadísticas en vivo
  - `logs: LogEntry[]` — Historial de eventos
  - `isRunning: boolean` — Estado de pausa/ejecución
  - `gameResult: string | null` — Resultado final (si existe)

- **Refs:**
  - `canvasRef` — Referencia al elemento `<canvas>`
  - `engineRef` — Instancia del GenetixEngine
  - `lastTickRef` — Timestamp del último tick
  - `animationFrameRef` — ID de requestAnimationFrame

- **Game Loop:**
  ```typescript
  const loop = (timestamp: number) => {
    if (!isRunning) return;
    
    if (timestamp - lastTickRef.current > config.renderSpeed) {
      const event = engine.update();        // 1. Lógica
      const result = engine.checkWin();    // 2. Validar victoria
      engine.draw(ctx, config);            // 3. Renderizar
      setStats(engine.getStats());         // 4. Actualizar UI
      lastTickRef.current = timestamp;
    }
    
    animationFrameRef.current = requestAnimationFrame(loop);
  };
  ```

- **Componentes Hijos:**
  - `LandingPage` (si `view === 'landing'`)
  - Canvas, Sidebar, ConsoleLog (si `view === 'game'`)

---

### 2. **LandingPage.tsx**

Página inicial con navegación y modales informativos.

- **Secciones (Modales):**
  - **Misión:** Descripción de IA protocols (Aliados, Enemigos, Med-Units, Obstáculos)
  - **Telemetría:** Análisis de desigualdad y causas del bias
  - **Sistema:** Especificaciones técnicas v3.5

- **Elementos:**
  - Nave superior con logo y botones de navegación
  - Main content: Hero section + CTA buttons
  - Footer: Créditos y status del sistema

- **Props:**
  - `onStart: () => void` — Callback cuando usuario inicia simulación

---

### 3. **ControlPanel.tsx**

Panel de control lateral (right sidebar).

- **Secciones:**
  1. **Comandos Principales:**
     - Si `!hasStarted`: Botón "INICIAR SIMULACIÓN"
     - Si `hasStarted`: Botones "PAUSA/REANUDAR" y "REINICIAR"

  2. **Parámetros de Entidades:**
     - Sliders para Aliados, Enemigos, Curanderos, Obstáculos
     - Rango: 0–150 entidades
     - Deshabilitados durante ejecución

  3. **Opciones de Ejecución:**
     - Slider "VELOCIDAD SIM" (50–500ms)
     - Toggle "INTERFAZ HUD (SALUD)" (muestra/oculta barras de vida)

- **Props:**
  - `config: GameConfig`
  - `isRunning: boolean`
  - `hasStarted: boolean`
  - `setConfig: (config: GameConfig) => void`
  - `onTogglePause: () => void`
  - `onReset: () => void`
  - `onStart: () => void`

---

### 4. **ConsoleLog.tsx**

Consola de eventos en tiempo real (bottom panel).

- **Características:**
  - Auto-scroll al último mensaje
  - Timestamps en formato `HH:MM:SS`
  - Colores contextuales por tipo:
    - 🔴 `combat` → Rojo (eventos de combate)
    - 🔵 `system` → Cyan (eventos del sistema)
    - ⚪ `info` → Gris (información general)
  - Máximo 50 logs en buffer (evita memory leak)

- **Props:**
  - `logs: LogEntry[]`

---

## Motor de Simulación

### GenetixEngine.ts

Clase principal que contiene toda la lógica de simulación.

```typescript
export class GenetixEngine {
  ANCHO = 75;
  ALTO = 25;
  CELL_SIZE = 20;
  
  grid: (Entity | null)[][] = [];
  listas = {
    obstaculos: Obstaculo[],
    enemigos: Enemigo[],
    aliados: Aliado[],
    curanderos: Curandero[]
  };
}
```

#### Métodos Principales

**`init(config: GameConfig)`**
- Reinicia el grid
- Spawned entidades según `config.entityCounts`
- Inicializa posiciones aleatorias

**`update(): string | null`**
- Ejecuta lógica de IA para cada entidad
- Resuelve colisiones
- Limpia entidades muertas
- Retorna evento (log) si ocurrió combate

**`draw(ctx: CanvasRenderingContext2D, config: GameConfig)`**
- Renderiza todas las entidades en canvas
- Dibuja barras de vida si `config.showHealthBars === true`

**`getStats(): GameStats`**
- Retorna conteos de entidades vivas

**`checkWin(): 'ALLIES_WIN' | 'ENEMIES_WIN' | 'DRAW' | null`**
- Valida condiciones de victoria

---

### Clases de Entidades

#### **Entidad** (Base Class)

```typescript
class Entidad implements Entity {
  posX: number;
  posY: number;
  vida: number = 100;
  
  getDistancia(otraEntidad: Entity): number
    → Calcula distancia euclidiana
  
  modificarVida(cantidad: number): void
    → Suma/resta vida (clamped 0-100)
}
```

#### **Aliado** (extends Entidad)

```typescript
class Aliado extends Entidad {
  Escapa(
    listaEnemigos: Enemigo[],
    ALTO: number,
    ANCHO: number,
    grid: (Entity | null)[][]
  ): void
}
```

**Protocolo:**
1. Encuentra el enemigo más cercano
2. Si distancia > 3, no hace nada (reactivo)
3. Si distancia ≤ 3, evalúa 8 direcciones
4. Elige dirección que maximiza distancia al enemigo
5. Move si hay posición válida

**Lógica de Evasión:**
```
DIRECCION_X = [-1,  0,  1, -1,  1, -1,  0,  1]
DIRECCION_Y = [-1, -1, -1,  0,  0,  1,  1,  1]
             (NW)  (N) (NE) (W) (E) (SW)(S) (SE)

Para cada dirección:
  - Valida si está en grid y vacía
  - Calcula distancia al enemigo desde esa posición
  - Elige la que mayor distancia le da
```

#### **Enemigo** (extends Entidad)

```typescript
class Enemigo extends Entidad {
  Persigue(
    listaAliados: Aliado[],
    ALTO: number,
    ANCHO: number,
    grid: (Entity | null)[][]
  ): void
}
```

**Protocolo:**
1. Encuentra el aliado más cercano (sin límite de rango)
2. Evalúa 8 direcciones
3. Elige dirección que **minimiza** distancia al aliado
4. Move si hay posición válida

**Agresividad:** A diferencia de aliados, no tiene restricción de rango. Perseguirá indefinidamente.

#### **Curandero** (extends Entidad)

```typescript
class Curandero extends Entidad {
  Cura(
    listaAliados: Aliado[],
    ALTO: number,
    ANCHO: number,
    grid: (Entity | null)[][]
  ): void
}
```

**Protocolo:**
1. Escanea aliados en radio ≤ 10 celdas
2. Prioriza el con menor HP
3. Si distancia ≤ 1.0: cura (+50 HP) y retorna
4. Si distancia > 1.0: se acerca moviéndose hacia el aliado
5. Movimiento idéntico al de enemigos (minimiza distancia)

**Limitación Crítica:** La curación requiere distancia euclidiana ≤ 1.0. Una posición diagonal (1.41) se considera fuera de rango.

#### **Obstaculo** (extends Entidad)

```typescript
class Obstaculo extends Entidad {}
```

Entidad estática. Solo ocupa espacio en el grid. Sin comportamiento.

---

## Sistema de Tipos (TypeScript)

### **types.ts**

```typescript
interface GameConfig {
  renderSpeed: number;        // 50-500ms
  showHealthBars: boolean;    // Toggle de barras de vida
  entityCounts: {
    allies: number;           // 0-150
    enemies: number;          // 0-150
    healers: number;          // 0-150
    obstacles: number;        // 0-150
  };
}

interface GameStats {
  allies: number;
  enemies: number;
  healers: number;
  obstacles: number;
}

interface LogEntry {
  id: number;
  timestamp: string;          // "HH:MM:SS"
  message: string;
  type: 'info' | 'combat' | 'system';
}

interface Entity {
  posX: number;
  posY: number;
  vida: number;
  getPosX(): number;
  getPosY(): number;
  setPosX(x: number): void;
  setPosY(y: number): void;
  getVida(): number;
  setVida(v: number): void;
  modificarVida(v: number): void;
  getDistancia(e: Entity): number;
}
```

---

## Game Loop y Renderizado

### requestAnimationFrame Loop

El game loop se implementa de la siguiente manera:

```typescript
const loop = (timestamp: number) => {
  if (!isRunning) return;
  
  const engine = engineRef.current;
  const ctx = canvasRef.current?.getContext('2d');
  
  if (!ctx) return;
  
  // Throttle basado en renderSpeed config
  if (timestamp - lastTickRef.current > config.renderSpeed) {
    
    // 1. Actualizar lógica
    const event = engine.update();
    if (event) addLog(event, 'combat');
    
    // 2. Validar condición de victoria
    const result = engine.checkWin();
    if (result) {
      setGameResult(result);
      setIsRunning(false);
      addLog(`SIMULACIÓN FINALIZADA. RESULTADO: ${result}`, 'system');
    }
    
    // 3. Renderizar en canvas
    engine.draw(ctx, config);
    
    // 4. Actualizar estadísticas en React
    setStats(engine.getStats());
    
    // Reset timestamp
    lastTickRef.current = timestamp;
  }
  
  // Mantener loop activo
  animationFrameRef.current = requestAnimationFrame(loop);
};
```

### Renderizado en Canvas

```typescript
draw(ctx: CanvasRenderingContext2D, config: GameConfig) {
  // Limpiar canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Dibujar función auxiliar
  const drawEntity = (entidad: Entity, type: string) => {
    let x = entidad.getPosX() * this.CELL_SIZE;
    let y = entidad.getPosY() * this.CELL_SIZE;
    
    // Renderizar según tipo
    if (type === 'obstaculo') {
      ctx.fillStyle = '#f59e0b';  // Amber
      ctx.fillRect(x + 2, y + 2, 16, 16);
    } else if (type === 'aliado') {
      ctx.fillStyle = '#10b981';  // Emerald (círculo)
      ctx.beginPath();
      ctx.arc(x + 10, y + 10, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'enemigo') {
      ctx.strokeStyle = '#ef4444';  // Red (X)
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 4);
      ctx.lineTo(x + 16, y + 16);
      ctx.moveTo(x + 16, y + 4);
      ctx.lineTo(x + 4, y + 16);
      ctx.stroke();
    } else if (type === 'curandero') {
      ctx.fillStyle = '#3b82f6';  // Blue (cruz)
      ctx.fillRect(x + 8, y + 4, 4, 12);   // Vertical
      ctx.fillRect(x + 4, y + 8, 12, 4);   // Horizontal
    }
    
    // Barras de vida (opcional)
    if (config.showHealthBars && type !== 'obstaculo') {
      const hp = entidad.getVida();
      const barWidth = 16;
      const hpWidth = (hp / 100) * barWidth;
      
      // Background
      ctx.fillStyle = '#333';
      ctx.fillRect(x + 2, y - 4, barWidth, 3);
      
      // Foreground (color según salud)
      ctx.fillStyle = hp > 50 ? '#10b981' 
                     : hp > 25 ? '#eab308' 
                     : '#ef4444';
      ctx.fillRect(x + 2, y - 4, hpWidth, 3);
    }
  };
  
  // Renderizar todas las entidades
  this.listas.obstaculos.forEach(o => drawEntity(o, 'obstaculo'));
  this.listas.aliados.forEach(a => drawEntity(a, 'aliado'));
  this.listas.enemigos.forEach(e => drawEntity(e, 'enemigo'));
  this.listas.curanderos.forEach(c => drawEntity(c, 'curandero'));
}
```

### Dimensiones

- **Grid:** 75×25 celdas
- **Cell Size:** 20 píxeles
- **Canvas:** 1500×500 píxeles (en código)
- **Responsive:** Se escala con CSS `width: 100%; height: 100%`

---

## Protocolos de IA

### 1. Aliados: Protocolo de Evasión

```
SI (enemigo_más_cercano_a ≤ 3 celdas) ENTONCES
  PARA cada dirección (8 direcciones) HACER
    SI (nueva_posición es válida) ENTONCES
      distancia ← euclidiana(nueva_posición, enemigo)
      SI (distancia > mejor_distancia) ENTONCES
        mejor_distancia ← distancia
        mejor_dirección ← dirección_actual
    FIN
  FIN
  MOVER en mejor_dirección
FIN
```

**Características:**
- Reactivo (solo actúa si hay peligro cercano)
- Greedy (optimización local, no global)
- Aversivo (huye del enemigo más cercano)

### 2. Enemigos: Protocolo de Persecución

```
ENCONTRAR aliado_más_cercano (en todo el mapa)
PARA cada dirección (8 direcciones) HACER
  SI (nueva_posición es válida) ENTONCES
    distancia ← euclidiana(nueva_posición, aliado)
    SI (distancia < mejor_distancia) ENTONCES
      mejor_distancia ← distancia
      mejor_dirección ← dirección_actual
  FIN
FIN
MOVER en mejor_dirección
```

**Características:**
- Activo (persigue sin parar)
- Agresivo (miniminimiza distancia)
- Sin límite de rango

### 3. Curanderos: Protocolo de Soporte

```
ENCONTRAR aliado_con_menor_HP en radio ≤ 10 celdas
SI (aliado_encontrado) ENTONCES
  distancia ← euclidiana(mi_posición, aliado)
  SI (distancia ≤ 1.0) ENTONCES
    CURAR aliado (+50 HP)
  SINO
    PERSEGUIR aliado (igual que enemigos)
  FIN
FIN
```

**Características:**
- Soporte (cura aliados)
- Limitado (radio 10, curación ≤1.0)
- Baja cobertura (5 para 75 aliados = 6.6%)

---

## Sistema de Colisiones

### Detección

```typescript
detectarYResolverColisiones(
  listaEnemigos: Enemigo[],
  listaAliados: Aliado[]
): string | null {
  for (let enemigo of listaEnemigos) {
    for (let aliado of listaAliados) {
      let diferenciaX = Math.abs(enemigo.posX - aliado.posX);
      let diferenciaY = Math.abs(enemigo.posY - aliado.posY);
      
      // Condición: misma celda O adyacencia (diagonal OK)
      if ((diferenciaX === 0 && diferenciaY === 0) || 
          (diferenciaX <= 1 && diferenciaY <= 1 && (diferenciaX + diferenciaY) <= 2)) {
        
        enemigo.modificarVida(-25);   // Enemigo recibe daño
        aliado.modificarVida(-35);    // Aliado recibe más daño
        
        return "Hostiles atacando fuerzas aliadas. Daño recibido.";
      }
    }
  }
  return null;
}
```

### Lógica de Colisión

| Escenario | diferenciaX | diferenciaY | (dx + dy) ≤ 2? | Ocurre Daño? |
| :--- | :--- | :--- | :--- | :--- |
| Misma celda | 0 | 0 | Sí (0) | ✅ |
| Adyacente (N/S/E/W) | 0 | 1 | Sí (1) | ✅ |
| Diagonal (NE/NW/SE/SW) | 1 | 1 | Sí (2) | ✅ |
| Separado 2 (ej. X=2, Y=0) | 2 | 0 | No (2>2) | ❌ |
| Separado 2 diagonal | 1 | 2 | No (3>2) | ❌ |

### Daño

- **Enemigo recibe:** 25 HP de daño
- **Aliado recibe:** 35 HP de daño (40% más vulnerable)

### Cleanup

```typescript
limpiarMuertos(
  listaEnemigos: Enemigo[],
  listaAliados: Aliado[],
  grid: (Entity | null)[][]
): void {
  // Remover muertos de enemigos (de atrás hacia adelante)
  for (let i = listaEnemigos.length - 1; i >= 0; i--) {
    if (listaEnemigos[i].getVida() <= 0) {
      let e = listaEnemigos[i];
      if (grid[e.posY][e.posX] === e) grid[e.posY][e.posX] = null;
      listaEnemigos.splice(i, 1);
    }
  }
  
  // Remover muertos de aliados (de atrás hacia adelante)
  for (let i = listaAliados.length - 1; i >= 0; i--) {
    if (listaAliados[i].getVida() <= 0) {
      let a = listaAliados[i];
      if (grid[a.posY][a.posX] === a) grid[a.posY][a.posX] = null;
      listaAliados.splice(i, 1);
    }
  }
}
```

---

## Configuración del Proyecto

### **package.json**

```json
{
  "name": "genetix-arena-v3.5",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",           // Inicia dev server con HMR
    "build": "vite build",   // Compila para producción
    "preview": "vite preview" // Preview del build
  },
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "lucide-react": "^0.574.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
```

### **tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  }
}
```

### **vite.config.ts**

Configuración estándar de Vite con plugin React:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
```

### **Tailwind Theme (Custom)**

```javascript
colors: {
  space: {
    black: '#050505',
    dark: '#0a0a0a',
    panel: '#111111',
    border: '#333333',
    text: '#e5e5e5',
    accent: '#ffffff',
    ally: '#10b981',      // Emerald
    enemy: '#ef4444',     // Red
    healer: '#3b82f6',    // Blue
    obstacle: '#f59e0b'   // Amber
  }
}
```

---

## Performance y Optimizaciones

### 1. Throttling del Game Loop

El loop solo actualiza lógica cada `renderSpeed` ms, no en cada frame de RAF.

```typescript
if (timestamp - lastTickRef.current > config.renderSpeed) {
  // Actualizar lógica
}
```

Esto permite control fino de velocidad de simulación sin dependencia de refresh rate.

### 2. Canvas Rendering Optimizado

- Una sola llamada a `clearRect()` por frame
- Dibuja entidades en orden: obstáculos → aliados → enemigos → curanderos
- Solo dibuja barras de vida si `config.showHealthBars === true`

### 3. Garbage Collection

- `limpiarMuertos()` elimina entidades de arrays por atrás hacia adelante
- Evita problemas de índices durante iteración
- Limpia referencias en el grid para garbage collection

### 4. Memory Management

- ConsoleLog mantiene máximo 50 logs en buffer
- Utiliza `.slice(-49)` para evitar memory leak
- Refs (`useRef`) para canvas, engine, timestamps evitan re-renders innecesarios

### 5. React Optimization

- Uso de `useCallback()` para `addLog()` evita recreación innecesaria
- `useRef()` para elementos que no necesitan re-render
- State updates solo en cambios significativos

### 6. Canvas Size

- **Width:** 1500px, **Height:** 500px
- Responsive mediante CSS (`width: 100%; height: 100%`)
- Aspect ratio mantenido: 3:1 (75 celdas ancho × 25 celdas alto)

---

## Conclusión

Genetix Arena v3.5 combina la fidelidad lógica del motor original (Java) con una arquitectura moderna y responsive. TypeScript garantiza seguridad de tipos, React proporciona componentes modulares, y Vite ofrece herramientas de desarrollo de clase mundial.

El sistema sigue siendo computacionalmente eficiente (game loop throttled, renderizado optimizado) mientras mantiene la riqueza visual y la flexibilidad de configuración que caracterizan a la plataforma.

---

**Documentación:** v3.5 Stable  
**Última Actualización:** 2026
