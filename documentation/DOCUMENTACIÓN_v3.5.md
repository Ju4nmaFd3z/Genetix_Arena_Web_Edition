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
- **Estilos:** Tailwind CSS vía CDN con tema personalizado definido en `index.html`
- **Motor:** TypeScript vanilla (sin dependencias externas para el engine)

### Cambios respecto a v3.3

| Aspecto | v3.3 | v3.5 |
| :--- | :--- | :--- |
| **Lenguaje** | JavaScript ES6+ | TypeScript 5.8+ |
| **Framework** | Vanilla JS | React 19 + Hooks |
| **Build Tool** | (No especificado) | Vite 6.2 |
| **Estilos** | CSS3 custom | Tailwind CSS (CDN) |
| **Arquitectura** | Script único | Componentes modulares |
| **Tipado** | Dinámico | Estático (TS) |
| **Responsividad** | Parcial | Full (mobile-first) |
| **Icons** | SVG inline | Lucide React |
| **Audio** | Sin audio | 5 pistas MP3 con fade automático |
| **Efectos visuales** | Sin efectos | Signal Loss, Nuke, CRT |

---

## Arquitectura del Sistema

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                      App.tsx (Root)                         │
│      Gestiona estado global, game loop y sistema de audio   │
└─────────────────────────────────────────────────────────────┘
    │
    ├─► LandingPage.tsx (Vista inicial)
    │   ├─ Modal: PROTOCOLOS DE IA
    │   ├─ Modal: ANÁLISIS DE DESIGUALDAD
    │   └─ Modal: ESPECIFICACIONES TÉCNICAS
    │
    └─► Game View (Cuando inicia simulación)
        ├─► Canvas (Renderizado del Grid 75x25)
        │   └─ SignalLossEffect.tsx (overlay de glitch)
        │
        ├─► Right Sidebar (Dashboard)
        │   ├─ Telemetría en Vivo (Stats cards + StatsDisplay.tsx)
        │   └─ ControlPanel.tsx (RetroLCD + Sliders, toggles, botones)
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
│  │  ├─ getStats()            → Retorna conteos básicos      │
│  │  ├─ getDetailedStats()    → Retorna métricas avanzadas   │
│  │  └─ checkWin()            → Valida condición final       │
│  │                                                          │
│  └─ Utilities (dentro de GenetixEngine):                    │
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
  - `opacity: number` — Opacidad para transición suave entre vistas
  - `config: GameConfig` — Parámetros de simulación
  - `stats: GameStats` — Estadísticas básicas en vivo
  - `detailedStats: DetailedStats | null` — Estadísticas avanzadas (daño, curación, supervivencia)
  - `showStatsModal: boolean` — Visibilidad del modal de estadísticas detalladas
  - `logs: LogEntry[]` — Historial de eventos (máx. 50)
  - `isRunning: boolean` — Estado de pausa/ejecución
  - `hasStarted: boolean` — Si la simulación ha arrancado alguna vez
  - `gameResult: string | null` — Resultado final (si existe)
  - `missionId: string` — Identificador único de misión generado por sesión
  - `isMuted: boolean` — Estado del sistema de audio (por defecto `true`)
  - `isExploding: boolean` — Si el efecto de detonación nuclear está activo
  - `hasNukeBeenUsed: boolean` — Bloquea uso repetido del Nuke
  - `signalPhase: 'idle' | 'noise' | 'dark'` — Fase del efecto Signal Loss
  - `targetCoordinates: { x: number, y: number }[]` — Coordenadas visuales del Nuke
  - `showResultModal: boolean` — Visibilidad del modal de resultado final
  - `showFalloutGrain: boolean` — Overlay de grano post-detonación

- **Refs:**
  - `canvasRef` — Referencia al elemento `<canvas>`
  - `canvasWrapperRef` — Referencia al contenedor del canvas
  - `engineRef` — Instancia del GenetixEngine
  - `lastTickRef` — Timestamp del último tick
  - `animationFrameRef` — ID de requestAnimationFrame
  - `loopRef` — Ref al callback del loop para evitar stale closures en RAF
  - `landingAudioRef` — Audio de la landing page
  - `gameAudioRef` — Audio de batalla
  - `alliesWinAudioRef` — Audio de victoria aliada
  - `enemiesWinAudioRef` — Audio de victoria enemiga
  - `drawAudioRef` — Audio de empate
  - `activeFadeRef` — Ref del intervalo de fade activo
  - `isFirstRenderRef` — Evita efectos en el primer render
  - `prevEntityCountsRef` — Evita resets innecesarios al pausar

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
  - Canvas + `SignalLossEffect`, Sidebar con `StatsDisplay` + `ControlPanel`, `ConsoleLog` (si `view === 'game'`)

---

### 2. **LandingPage.tsx**

Página inicial con navegación y modales informativos.

- **Secciones (Modales):**
  - **Misión:** Descripción de protocolos de IA (Aliados, Enemigos, Med-Units, Obstáculos)
  - **Telemetría:** Análisis de desigualdad y causas del bias táctico
  - **Sistema:** Especificaciones técnicas v3.5

- **Props:**
  - `onStart: () => void` — Callback cuando el usuario inicia la simulación
  - `isMuted: boolean` — Estado del mute para mostrar en UI
  - `onToggleMute: () => void` — Callback de toggle de audio

---

### 3. **ControlPanel.tsx**

Panel de control lateral (right sidebar).

- **Secciones:**
  1. **RetroLCD:** Display de estado de la simulación (normal / warning / critical / success)
  2. **Comandos Principales:**
     - Si `!hasStarted`: Botón "INICIAR SIMULACIÓN"
     - Si `hasStarted`: Botones "PAUSA/REANUDAR" y "REINICIAR"
  3. **Parámetros de Entidades:**
     - Sliders para Aliados, Enemigos, Curanderos, Obstáculos
     - Rango: 0–150 entidades
     - Deshabilitados durante la ejecución activa
  4. **Opciones de Ejecución:**
     - Slider "VELOCIDAD SIM" (50–500ms)
     - Toggle "INTERFAZ HUD (SALUD)" — muestra/oculta barras de vida

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

### 5. **StatsDisplay.tsx**

Panel de estadísticas avanzadas, renderizado tanto inline en el sidebar como en el modal expandible.

- **Muestra:**
  - Vida media de aliados y enemigos
  - Daño total infligido por cada facción
  - Curación total realizada por Med-Units
  - Tasa de supervivencia aliada

- **Props:**
  - `stats: DetailedStats | null`

---

### 6. **RetroLCD.tsx**

Display estilo LCD retro que refleja el estado actual de la simulación.

- **Tipos de mensaje:** `'normal' | 'warning' | 'critical' | 'success'`
- **Uso:** Incrustado en `ControlPanel.tsx`

- **Props:**
  - `message: string`
  - `type?: 'normal' | 'warning' | 'critical' | 'success'`
  - `subMessage?: string`
  - `className?: string`

---

### 7. **SignalLossEffect.tsx**

Overlay visual de pérdida de señal activado en eventos críticos (Nuke, fin de simulación).

- **Fases:**
  - `'idle'` → Sin efecto
  - `'noise'` → Ruido estático + glitch + distorsión RGB
  - `'dark'` → Pantalla negra + alto contraste

- **Props:**
  - `phase: 'idle' | 'noise' | 'dark'`

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

  // Métricas para estadísticas detalladas
  private initialAllyCount: number = 0;
  private damageDealtAllies: number = 0;
  private damageDealtEnemies: number = 0;
  private healingDone: number = 0;
}
```

#### Métodos Principales

**`init(config: GameConfig)`**
- Reinicia el grid y las métricas
- Spawnea entidades según `config.entityCounts`
- Asigna posiciones aleatorias

**`update(): string | null`**
- Ejecuta lógica de IA para cada entidad
- Resuelve colisiones y aplica daño
- Limpia entidades muertas
- Retorna evento (log) si ocurrió combate

**`draw(ctx: CanvasRenderingContext2D, config: GameConfig)`**
- Renderiza todas las entidades en canvas
- Dibuja barras de vida si `config.showHealthBars === true`

**`getStats(): GameStats`**
- Retorna conteos de entidades vivas (aliados, enemigos, curanderos, obstáculos)

**`getDetailedStats(): DetailedStats`**
- Retorna métricas avanzadas: daño total, curación total, tasa de supervivencia

**`checkWin(): 'ALLIES_WIN' | 'ENEMIES_WIN' | 'DRAW' | null`**
- Valida condición de victoria al final de cada tick

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
    → Suma/resta vida (clamped 0–100)
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
2. Si distancia > 3, no actúa (reactivo)
3. Si distancia ≤ 3, evalúa las 8 direcciones
4. Elige la dirección que maximiza la distancia al enemigo
5. Se mueve si la posición destino es válida

**Lógica de Evasión:**
```
DIRECCIÓN_X = [-1,  0,  1, -1,  1, -1,  0,  1]
DIRECCIÓN_Y = [-1, -1, -1,  0,  0,  1,  1,  1]
             (NW)  (N) (NE) (W) (E) (SW)(S) (SE)

Para cada dirección:
  - Valida si está en grid y vacía
  - Calcula distancia al enemigo desde esa posición
  - Elige la que mayor distancia proporciona
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
2. Evalúa las 8 direcciones
3. Elige la dirección que minimiza la distancia al aliado
4. Se mueve si la posición destino es válida

**Agresividad:** A diferencia de los aliados, perseguirá indefinidamente sin restricción de rango.

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
2. Prioriza el de menor HP
3. Si distancia ≤ 1.0 → cura (+50 HP) y retorna
4. Si distancia > 1.0 → se acerca (mismo algoritmo que Enemigo)

**Limitación Crítica:** La curación requiere distancia euclidiana ≤ 1.0. Una posición diagonal (distancia = 1.41) queda fuera de rango.

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
  renderSpeed: number;        // 50–500ms
  showHealthBars: boolean;    // Toggle de barras de vida
  entityCounts: {
    allies: number;           // 0–150
    enemies: number;          // 0–150
    healers: number;          // 0–150
    obstacles: number;        // 0–150
  };
}

interface GameStats {
  allies: number;
  enemies: number;
  healers: number;
  obstacles: number;
}

interface DetailedStats {
  averageAllyLifespan: string;       // Vida media de aliados
  averageEnemyLifespan: string;      // Vida media de enemigos
  totalDamageDealtByAllies: number;  // Daño total infligido por aliados
  totalDamageDealtByEnemies: number; // Daño total infligido por enemigos
  totalHealingDone: number;          // Curación total realizada
  survivalRate: string;              // Tasa de supervivencia aliada (%)
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
    setDetailedStats(engine.getDetailedStats());

    // Reset timestamp
    lastTickRef.current = timestamp;
  }

  // Mantener loop activo
  animationFrameRef.current = requestAnimationFrame(loop);
};
```

> ℹ️ El callback del loop se almacena en `loopRef.current` para evitar stale closures: en cada render se sobreescribe la ref, garantizando que `requestAnimationFrame` siempre lea los valores más recientes de `isRunning`, `config`, etc.

### Renderizado en Canvas

```typescript
draw(ctx: CanvasRenderingContext2D, config: GameConfig) {
  // Limpiar canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const drawEntity = (entidad: Entity, type: string) => {
    let x = entidad.getPosX() * this.CELL_SIZE;
    let y = entidad.getPosY() * this.CELL_SIZE;

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
      ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + 16, y + 16);
      ctx.moveTo(x + 16, y + 4); ctx.lineTo(x + 4, y + 16);
      ctx.stroke();
    } else if (type === 'curandero') {
      ctx.fillStyle = '#3b82f6';  // Blue (cruz)
      ctx.fillRect(x + 8, y + 4, 4, 12);  // Vertical
      ctx.fillRect(x + 4, y + 8, 12, 4);  // Horizontal
    }

    // Barras de vida (opcional)
    if (config.showHealthBars && type !== 'obstaculo') {
      const hp = entidad.getVida();
      const hpWidth = (hp / 100) * 16;
      ctx.fillStyle = '#333';
      ctx.fillRect(x + 2, y - 4, 16, 3);
      ctx.fillStyle = hp > 50 ? '#10b981' : hp > 25 ? '#eab308' : '#ef4444';
      ctx.fillRect(x + 2, y - 4, hpWidth, 3);
    }
  };

  // Renderizar en orden: obstáculos → aliados → enemigos → curanderos
  this.listas.obstaculos.forEach(o => drawEntity(o, 'obstaculo'));
  this.listas.aliados.forEach(a => drawEntity(a, 'aliado'));
  this.listas.enemigos.forEach(e => drawEntity(e, 'enemigo'));
  this.listas.curanderos.forEach(c => drawEntity(c, 'curandero'));
}
```

### Dimensiones

- **Grid:** 75×25 celdas
- **Cell Size:** 20 píxeles
- **Canvas:** 1500×500 píxeles
- **Responsive:** Escalado con CSS (`width: 100%; height: 100%`)
- **Aspect ratio:** 3:1 (75×25)

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

**Características:** Reactivo · Greedy (optimización local) · Aversivo

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

**Características:** Activo · Agresivo · Sin límite de rango

### 3. Curanderos: Protocolo de Soporte

```
ENCONTRAR aliado_con_menor_HP en radio ≤ 10 celdas
SI (aliado_encontrado) ENTONCES
  distancia ← euclidiana(mi_posición, aliado)
  SI (distancia ≤ 1.0) ENTONCES
    CURAR aliado (+50 HP)
  SINO
    PERSEGUIR aliado (igual que Enemigo)
  FIN
FIN
```

**Características:** Soporte · Limitado (radio 10, curación ≤ 1.0) · Baja cobertura

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

### Tabla de Colisiones

| Escenario | dx | dy | (dx+dy) ≤ 2? | ¿Daño? |
| :--- | :--- | :--- | :--- | :--- |
| Misma celda | 0 | 0 | Sí (0) | ✅ |
| Adyacente (N/S/E/W) | 0 | 1 | Sí (1) | ✅ |
| Diagonal (NE/NW/SE/SW) | 1 | 1 | Sí (2) | ✅ |
| Separado 2 horizontal | 2 | 0 | No | ❌ |
| Separado 2 diagonal | 1 | 2 | No (3>2) | ❌ |

### Daño

- **Enemigo recibe:** −25 HP por colisión
- **Aliado recibe:** −35 HP por colisión (40% más vulnerable)

### Cleanup

```typescript
limpiarMuertos(
  listaEnemigos: Enemigo[],
  listaAliados: Aliado[],
  grid: (Entity | null)[][]
): void {
  // Se itera de atrás hacia adelante para no desincronizar índices
  for (let i = listaEnemigos.length - 1; i >= 0; i--) {
    if (listaEnemigos[i].getVida() <= 0) {
      let e = listaEnemigos[i];
      if (grid[e.posY][e.posX] === e) grid[e.posY][e.posX] = null;
      listaEnemigos.splice(i, 1);
    }
  }
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
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
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

> ℹ️ El script `build` ejecuta primero la compilación TypeScript (`tsc -b`) y luego el bundling de Vite. Tailwind **no es una dependencia npm**: se carga vía CDN desde `index.html`.

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

```typescript
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
```

> ℹ️ El dev server corre en el **puerto 3000** (no 5173, que es el puerto por defecto de Vite cuando no se especifica).

### **Tailwind Theme (Custom)**

El tema se define directamente en el bloque `<script>` de `index.html`:

```javascript
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
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
    }
  }
}
```

---

## Performance y Optimizaciones

### 1. Throttling del Game Loop

El loop solo actualiza lógica cada `renderSpeed` ms, sin bloquear el RAF:

```typescript
if (timestamp - lastTickRef.current > config.renderSpeed) {
  // Actualizar lógica y renderizar
}
```

### 2. `loopRef` para evitar stale closures

```typescript
const loopRef = useRef<(timestamp: number) => void>(() => {});
// Se sobreescribe en cada render, garantizando acceso a los últimos valores de estado
```

### 3. Canvas Rendering Optimizado

- Una sola llamada a `clearRect()` por frame
- Renderizado en orden fijo: obstáculos → aliados → enemigos → curanderos
- Barras de vida solo dibujadas si `config.showHealthBars === true`

### 4. Garbage Collection

- `limpiarMuertos()` itera de atrás hacia adelante para evitar desincronización de índices
- Libera referencias en el grid para permitir GC del motor JavaScript

### 5. Memory Management

- `ConsoleLog` mantiene máximo 50 logs en buffer (`slice(-49)`)
- Audio: un único `setInterval` activo para fade (`activeFadeRef`), cancelado antes de crear uno nuevo
- `prevEntityCountsRef` evita reiniciar la simulación cuando solo cambia el estado de pausa

### 6. React Optimization

- `useCallback` en `addLog` para evitar recreación en dependencias de `useEffect`
- `useRef` para canvas, engine, timestamps y audio: sin re-renders innecesarios
- Updates de estado solo en cambios significativos (tick completado)

### 7. Canvas Size

- **Width:** 1500px | **Height:** 500px
- Responsive via CSS (`width: 100%; height: 100%`)
- Aspect ratio 3:1 (75 celdas × 25 celdas × 20px/celda)

---

## Conclusión

Genetix Arena v3.5 combina la fidelidad lógica del motor original con una arquitectura moderna, modular y responsive. TypeScript garantiza seguridad de tipos en compile-time, React proporciona componentes con estado bien delimitado, y Vite ofrece un entorno de desarrollo de clase profesional.

El sistema es computacionalmente eficiente (game loop throttled, canvas directo, refs para evitar re-renders) mientras ofrece riqueza visual y flexibilidad de configuración.

---

**Documentación:** v3.5 Stable | **Última Actualización:** 2026 | **Autor:** Juanma Fernández
