# 📘 GENETIX ARENA v3.5 | DOCUMENTACIÓN TÉCNICA COMPLETA

## 📑 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Componentes React](#componentes-react)
4. [Motor de Simulación (GenetixEngine)](#motor-de-simulación)
5. [Protocolo Omega y Fallout](#protocolo-omega-y-fallout)
6. [Sistema de Tipos](#sistema-de-tipos)
7. [Game Loop y Renderizado](#game-loop-y-renderizado)
8. [Protocolos de IA](#protocolos-de-ia)
9. [Sistema de Colisiones](#sistema-de-colisiones)
10. [Sistema de Audio](#sistema-de-audio)
11. [Configuración del Proyecto](#configuración-del-proyecto)
12. [Performance y Optimizaciones](#performance-y-optimizaciones)

---

## Descripción General

**Genetix Arena v3.5** es un simulador táctico basado en navegador que modeliza el combate autónomo entre múltiples facciones de IA. La arquitectura combina:

- **Frontend:** React 19 con Hooks (componentes funcionales)
- **Tipado:** TypeScript 5.8+ para seguridad de tipos
- **Build:** Vite 6.2 para HMR y bundling ultrarrápido
- **Estilos:** Tailwind CSS vía CDN con tema personalizado definido en `index.html`
- **Motor:** TypeScript vanilla (sin dependencias externas para el engine)

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                      App.tsx (Root)                         │
│   Estado global · Game loop · Audio · Omega Protocol        │
└─────────────────────────────────────────────────────────────┘
    │
    ├─► LandingPage.tsx
    │   ├─ Modal: PROTOCOLOS DE IA
    │   ├─ Modal: ANÁLISIS DE DESIGUALDAD
    │   └─ Modal: ESPECIFICACIONES TÉCNICAS
    │
    └─► Game View
        ├─► Canvas (75×25 grid)
        │   └─ SignalLossEffect.tsx (overlay glitch)
        │
        ├─► Right Sidebar
        │   ├─ Telemetría en vivo + StatsDisplay.tsx
        │   └─ ControlPanel.tsx
        │       └─ RetroLCD.tsx (display dinámico)
        │
        └─► Bottom Console → ConsoleLog.tsx

┌─────────────────────────────────────────────────────────────┐
│              GenetixEngine.ts (Lógica Pura)                 │
│  Entidad · Aliado · Enemigo · Curandero · Obstaculo         │
│  DeathAnim · MisFunciones                                   │
│  init · update · draw · checkWin · executeOmegaProtocol     │
└─────────────────────────────────────────────────────────────┘
```

---

## Componentes React

### 1. App.tsx (Componente Raíz)

Gestiona todo el estado de la aplicación, el game loop, el sistema de audio y la secuencia del Omega Protocol.

**Estado:**

| Estado              | Tipo                          | Descripción                                   |
| :------------------ | :---------------------------- | :-------------------------------------------- |
| `view`              | `'landing' \| 'game'`         | Pantalla activa                               |
| `opacity`           | `number`                      | Opacidad para transición entre vistas         |
| `config`            | `GameConfig`                  | Parámetros de simulación                      |
| `stats`             | `GameStats`                   | Conteos en vivo de entidades                  |
| `detailedStats`     | `DetailedStats \| null`       | Métricas avanzadas de sesión                  |
| `showStatsModal`    | `boolean`                     | Modal de estadísticas expandido               |
| `logs`              | `LogEntry[]`                  | Buffer de eventos (máx. 50)                   |
| `isRunning`         | `boolean`                     | Si el game loop está activo                   |
| `hasStarted`        | `boolean`                     | Si la simulación arrancó alguna vez           |
| `gameResult`        | `string \| null`              | Resultado final (`ALLIES_WIN`, etc.)          |
| `missionId`         | `string`                      | ID único de misión generado por partida       |
| `isMuted`           | `boolean`                     | Estado del sistema de audio (default: `true`) |
| `isExploding`       | `boolean`                     | Si la secuencia Omega está activa             |
| `hasNukeBeenUsed`   | `boolean`                     | Bloquea uso repetido del Nuke                 |
| `signalPhase`       | `'idle' \| 'noise' \| 'dark'` | Fase del Signal Loss Effect                   |
| `targetCoordinates` | `{x,y}[]`                     | Posiciones del HUD de targeting post-Nuke     |
| `showResultModal`   | `boolean`                     | Modal de resultado final                      |
| `showFalloutGrain`  | `boolean`                     | Overlay de grano de fallout                   |
| `configChanged`     | `boolean`                     | Flag de cambio de config con partida activa   |

**Refs:**

| Ref                   | Tipo                             | Uso                                         |
| :-------------------- | :------------------------------- | :------------------------------------------ |
| `canvasRef`           | `HTMLCanvasElement`              | Elemento canvas                             |
| `canvasWrapperRef`    | `HTMLDivElement`                 | Contenedor del canvas                       |
| `engineRef`           | `GenetixEngine`                  | Instancia del motor                         |
| `lastTickRef`         | `number`                         | Timestamp del último tick                   |
| `animationFrameRef`   | `number`                         | ID del RAF activo                           |
| `loopRef`             | `(ts: number) => void`           | Callback del loop (evita stale closures)    |
| `landingAudioRef`     | `HTMLAudioElement`               | Pista de landing                            |
| `gameAudioRef`        | `HTMLAudioElement`               | Pista de batalla                            |
| `alliesWinAudioRef`   | `HTMLAudioElement`               | Pista de victoria aliada                    |
| `enemiesWinAudioRef`  | `HTMLAudioElement`               | Pista de victoria enemiga                   |
| `drawAudioRef`        | `HTMLAudioElement`               | Pista de empate                             |
| `activeFadeRef`       | `ReturnType<typeof setInterval>` | Intervalo de fade activo                    |
| `hasUnlockedRef`      | `boolean`                        | Guard iOS/Safari para desbloqueo de audio   |
| `isFirstRenderRef`    | `boolean`                        | Evita efectos en el primer render           |
| `prevEntityCountsRef` | `entityCounts`                   | Evita resets al pausar sin cambio de config |

**Funciones principales:**

```typescript
initializeSystem(autoTrigger?: boolean)
// Llama a engine.init(config), actualiza stats, limpia logs (si !autoTrigger),
// fuerza un primer draw() tras 50ms.

runSimulation()
// Marca hasStarted = true, isRunning = true.

handleOmegaProtocol()
// Orquesta la secuencia Omega mediante setTimeout:
//   T+0s:  pausa loop, inicia countdown en logs
//   T+3s:  activa SignalLossEffect (noise → dark → idle),
//          llama engine.executeOmegaProtocol(),
//          captura supervivientes para HUD de targeting
//   T+5s:  muestra targetCoordinates en canvas
//   T+9s:  reanuda loop (o muestra result modal si terminó)
//   T+12s: limpia showFalloutGrain

handleReset()
// Resetea todos los estados, gestiona música de resultado → batalla.

switchView(targetView, callback?)
// Transición suave con fade de opacidad (500ms).

getLCDMessage()
// Devuelve {msg, type, sub} dinámico para RetroLCD según el estado actual.

getResultStyles()
// Devuelve estilos y textos del modal de resultado
// según ALLIES_WIN / ENEMIES_WIN / DRAW.

stopFade()     // Cancela el setInterval de crossfade activo.
crossfade(outgoing, outgoingDefaultVol, incoming, incomingTargetVol)
// Crossfade suave con 50 pasos en 2s, curva ease-in-out.
toggleMute()   // Activa/desactiva el sistema de audio.
```

---

### 2. LandingPage.tsx

Página inicial con navegación y 3 modales informativos.

- **Modales:** Misión · Telemetría · Sistema
- **Props:** `onStart: () => void` · `isMuted: boolean` · `onToggleMute: () => void`
- Incluye animación CSS de entidades moviéndose en el fondo.

---

### 3. ControlPanel.tsx

Panel de control lateral con todos los controles de la simulación.

**Módulos del panel:**

- **MODULE 0: PRIMARY_DISPLAY_UNIT** — RetroLCD con mensaje dinámico. En landscape mobile, muestra también el Nuke button.
- **MODULE 1: MISSION_COMMAND** — Botones de control. Muestra INICIAR, PAUSA/REANUDAR + REINICIAR, o APLICAR CAMBIOS según el estado.
- **MODULE 2: ENTITY_LOADOUT_CONFIG** — Sliders de entidades con commit-on-release y validación (aliados/enemigos mínimo 1).
- **MODULE 3: EXEC_ENVIRONMENT_OPTS** — Slider de tickrate, toggle HUD, toggle audio, Nuke button.
- **MODULE 4: SYSTEM UTILITIES** — Botones DEFAULTS y ABORT_OP.

**Props:**

| Prop                    | Tipo                                   | Descripción                          |
| :---------------------- | :------------------------------------- | :----------------------------------- |
| `config`                | `GameConfig`                           | Configuración actual                 |
| `isRunning`             | `boolean`                              | Estado del loop                      |
| `hasStarted`            | `boolean`                              | Si arrancó alguna vez                |
| `isGameOver`            | `boolean`                              | Si hay resultado final               |
| `isMuted`               | `boolean`                              | Estado del audio                     |
| `onToggleMute`          | `() => void`                           | Callback de mute                     |
| `setConfig`             | `Dispatch<SetStateAction<GameConfig>>` | Actualiza config                     |
| `onTogglePause`         | `() => void`                           | Pausa / reanuda                      |
| `onReset`               | `() => void`                           | Reinicia                             |
| `onStart`               | `() => void`                           | Inicia                               |
| `onSetDefaults`         | `() => void`                           | Restaura DEFAULT_CONFIG              |
| `onAbort`               | `() => void`                           | Vuelve a landing page                |
| `isEmergencyAvailable?` | `boolean`                              | Habilita el botón Omega              |
| `isExploding?`          | `boolean`                              | Bloquea controles durante detonación |
| `hasNukeBeenUsed?`      | `boolean`                              | Estado "DISCHARGED" del Nuke         |
| `onTriggerEmergency?`   | `() => void`                           | Callback del Omega Protocol          |
| `lcdMessage?`           | `{msg, type, sub?}`                    | Mensaje para RetroLCD                |
| `configChanged?`        | `boolean`                              | Muestra botón "APLICAR CAMBIOS"      |

**Estados de los botones Nuke:**

| Estado     | Label                   | Condición                          |
| :--------- | :---------------------- | :--------------------------------- |
| LOCKED     | Sin label (gris)        | `allies > 3` o sim pausada         |
| READY      | "READY" (rojo pulsante) | `allies ≤ 3 && isRunning && !used` |
| DETONATING | "DETONATING..."         | `isExploding === true`             |
| DISCHARGED | "PURGED" (gris)         | `hasNukeBeenUsed === true`         |

---

### 4. ConsoleLog.tsx

Consola de eventos con auto-scroll, timestamps `HH:MM:SS` y colores contextuales.

- `combat` → rojo · `system` → cyan · `info` → gris
- **Props:** `logs: LogEntry[]`

---

### 5. StatsDisplay.tsx

Renderiza `DetailedStats` en formato tabla HUD. Usado tanto inline en el sidebar como en el modal expandible.

- **Props:** `stats: DetailedStats | null`

---

### 6. RetroLCD.tsx

Display estilo LCD retro con 4 tipos: `'normal' | 'warning' | 'critical' | 'success'`.

- **Props:** `message: string` · `type?: LCDType` · `subMessage?: string` · `className?: string`

---

### 7. SignalLossEffect.tsx

Overlay SVG de pérdida de señal. Se activa durante el Omega Protocol.

- `'idle'` → sin efecto
- `'noise'` → ruido estático + glitch + distorsión RGB
- `'dark'` → pantalla negra + alto contraste

- **Props:** `phase: 'idle' | 'noise' | 'dark'`

---

## Motor de Simulación

### GenetixEngine.ts

```typescript
export class GenetixEngine {
  ANCHO = 75;
  ALTO = 25;
  CELL_SIZE = 20;

  // Fallout / Radiation
  falloutTicks = 0;
  MAX_FALLOUT = 40; // ~8-10s a 200ms/tick

  // Stats tracking
  currentTick = 0;
  initialAllyCount = 0;
  totalAllyLifespan = 0;
  deadAlliesCount = 0;
  totalEnemyLifespan = 0;
  deadEnemiesCount = 0;
  damageDealtAllies = 0; // daño causado por el bando aliado (y radiación)
  damageDealtEnemies = 0; // daño causado por el bando enemigo
  healingDone = 0;

  grid: (Entity | null)[][];
  listas: {
    obstaculos: Obstaculo[];
    enemigos: Enemigo[];
    aliados: Aliado[];
    curanderos: Curandero[];
    efectos: DeathAnim[]; // animaciones de muerte
  };
}
```

**Métodos:**

`init(config)` — Llama a `reset()` y spawnea entidades (obstáculos → enemigos → aliados → curanderos). Registra `initialAllyCount`.

`update(): string | null` — Tick principal:

1. Incrementa `currentTick`, avanza y limpia `efectos` (DeathAnim).
2. Si `falloutTicks > 0`: aplica daño por radiación, decrementa contador.
3. Enemigos persiguen (con 60% de skip si fallout activo).
4. Aliados escapan · Curanderos curan.
5. Colisiones · Limpia muertos.
6. Retorna mensaje de evento o `null`.

`executeOmegaProtocol(): string[]` — Restaura aliados al 100% HP · Destruye el 80% de enemigos (aleatoriamente) · Activa `falloutTicks = MAX_FALLOUT` · Llama `limpiarMuertos()` · Retorna array de 2 mensajes de log.

`draw(ctx, config)` — Limpia canvas. Si `falloutTicks > 0`, dibuja capa naranja (`rgba(255,140,0,opacity)`). Renderiza `DeathAnim` (efectos). Renderiza entidades con gráficos vectoriales personalizados. Dibuja barras de vida si `config.showHealthBars`.

`getStats()` · `getDetailedStats()` · `checkWin()` — Sin cambios respecto a la versión base.

---

### Clase DeathAnim

Clase interna para animaciones de muerte en canvas.

```typescript
class DeathAnim {
  x: number;
  y: number;
  type: "aliado" | "enemigo";
  tick: number;
  maxTicks: number; // = 12
}
```

**Animación por tipo:**

| Tipo      | Efecto visual                                                                                       |
| :-------- | :-------------------------------------------------------------------------------------------------- |
| `aliado`  | Dos anillos concéntricos que se expanden con fade out (easing cúbico). "Señal perdida".             |
| `enemigo` | 4 brackets de esquina que se expanden + punto central que parpadea brevemente. "Purga del sistema". |

---

### Clases de Entidades

#### Entidad (Base)

```typescript
class Entidad implements Entity {
  posX: number;
  posY: number;
  vida: number;
  creationTick: number; // para calcular lifespan en stats

  getDistancia(e: Entity): number; // distancia euclidiana
  modificarVida(v: number): void; // clamped 0–100
}
```

#### Aliado — Protocolo de Evasión

Actúa solo si el enemigo más cercano está a ≤3 celdas. Evalúa 8 direcciones y elige la que **maximiza** la distancia al enemigo (greedy). Reactivo.

#### Enemigo — Protocolo de Persecución

Sin límite de rango. Evalúa 8 direcciones y elige la que **minimiza** la distancia al aliado más cercano (greedy). Activo. Durante fallout, 60% de probabilidad de perder el turno.

#### Curandero — Protocolo de Soporte

Busca el aliado con menor HP dentro de radio ≤10. Si la distancia es ≤1.0 → cura (+50 HP). Si no, se acerca. Callback `onHeal(amount)` acumula `healingDone` en el engine.

#### Obstaculo

Estático. Sin comportamiento. Solo ocupa celda en el grid.

---

### Objeto MisFunciones

Utilidad de validación de posición. Definido dentro de `GenetixEngine.ts`, no es un archivo separado.

```typescript
const MisFunciones = {
  posicionValida(xDestino, yDestino, ALTO, ANCHO, grid): boolean
  // false si está fuera de límites o la celda está ocupada
};
```

---

## Protocolo Omega y Fallout

### Flujo completo de la secuencia

```
App.tsx: handleOmegaProtocol()
│
├─ T+0s:  isRunning = false
│         isExploding = true
│         hasNukeBeenUsed = true
│         addLog("T-MINUS 3...")
│
├─ T+1s:  addLog("T-MINUS 2...")
├─ T+2s:  addLog("T-MINUS 1...")
│
├─ T+3s:  setSignalPhase('noise')
│         setTimeout → 'dark' (T+3.6s)
│         setTimeout → 'idle' (T+5.5s)
│         engine.executeOmegaProtocol()
│           ├─ Heal all allies → 100 HP
│           ├─ Destroy 80% enemies (random shuffle)
│           ├─ falloutTicks = MAX_FALLOUT
│           └─ limpiarMuertos()
│         Captura survivors → setTargetCoordinates (T+5s)
│         engine.draw() + setStats() + setDetailedStats()
│         setShowFalloutGrain(true)
│
├─ T+5s:  setTargetCoordinates(survivors) → HUD targeting en canvas
│
├─ T+9s:  isExploding = false
│         setTargetCoordinates([])
│         checkWin() → si terminó: result modal
│                    → si no: isRunning = true (reanuda loop)
│
└─ T+12s: setShowFalloutGrain(false)

GenetixEngine.ts: update() (durante fallout)
│
├─ falloutTicks > 0:
│   ├─ 70% prob → cada enemigo: 60% prob → -5 HP (damageDealtAllies += 5)
│   ├─ 30% prob → cada aliado: 30% prob → -1 HP (damageDealtEnemies += 1)
│   ├─ falloutTicks % 15 === 0 → log "DAÑO ESTRUCTURAL POR RADIACIÓN"
│   └─ Enemigos: 60% prob de perder el turno
│
└─ limpiarMuertos() → genera DeathAnim para cada muerte
```

---

## Sistema de Tipos

### types.ts

```typescript
interface GameConfig {
  renderSpeed: number; // 10–500ms
  showHealthBars: boolean;
  entityCounts: {
    allies: number; // 1–150 (mínimo 1)
    enemies: number; // 1–150 (mínimo 1)
    healers: number; // 0–150
    obstacles: number; // 0–150
  };
}

interface GameStats {
  allies: number;
  enemies: number;
  healers: number;
  obstacles: number;
}

interface DetailedStats {
  averageAllyLifespan: string; // en ticks, o "N/A"
  averageEnemyLifespan: string; // en ticks, o "N/A"
  totalDamageDealtByAllies: number; // daño causado por aliados (+radiación)
  totalDamageDealtByEnemies: number; // daño causado por enemigos (+daño residual)
  totalHealingDone: number;
  survivalRate: string; // % de aliados supervivientes
}

interface LogEntry {
  id: number;
  timestamp: string; // "HH:MM:SS"
  message: string;
  type: "info" | "combat" | "system";
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

### requestAnimationFrame + loopRef Pattern

```typescript
// loopRef.current se sobreescribe en CADA render de App.
// Esto garantiza que el RAF siempre ejecute la versión con los
// valores más recientes de isRunning, config, etc.
// Sin este patrón habría stale closure en las closures de useEffect.

loopRef.current = (timestamp: number) => {
  if (!isRunning) return;
  const ctx = canvasRef.current?.getContext("2d");
  if (!ctx) return;

  if (timestamp - lastTickRef.current > config.renderSpeed) {
    const event = engine.update();
    if (event) addLog(event, "combat");

    const result = engine.checkWin();
    if (result) {
      setGameResult(result);
      setShowResultModal(true);
      setMissionId(Math.floor(Math.random() * 90000 + 10000).toString());
      setIsRunning(false);
      addLog(`SIMULACIÓN FINALIZADA. RESULTADO: ${result}`, "system");
      engine.draw(ctx, config);
      setStats(engine.getStats());
      setDetailedStats(engine.getDetailedStats());
      return; // No agenda el siguiente frame
    }

    engine.draw(ctx, config);
    setStats(engine.getStats());
    setDetailedStats(engine.getDetailedStats());
    lastTickRef.current = timestamp;
  }

  animationFrameRef.current = requestAnimationFrame(loopRef.current);
};
```

### Canvas

- **Tamaño:** 1500×500px (75 × 25 × 20px/celda)
- **Responsive:** `width: 100%; height: 100%` vía CSS
- **Ratio:** 3:1
- **Orden de render:** obstáculos → animaciones de muerte → aliados → enemigos → curanderos

---

## Protocolos de IA

| Entidad   | Algoritmo                  | Rango      | Tipo     |
| :-------- | :------------------------- | :--------- | :------- |
| Aliado    | Greedy maximiza distancia  | ≤3 celdas  | Reactivo |
| Enemigo   | Greedy minimiza distancia  | Sin límite | Activo   |
| Curandero | Sigue al aliado más herido | ≤10 celdas | Soporte  |
| Obstaculo | Sin movimiento             | —          | Estático |

---

## Sistema de Colisiones

```typescript
detectarYResolverColisiones(): string | null
// Para cada par (enemigo, aliado):
//   if (dx === 0 && dy === 0) || (dx ≤ 1 && dy ≤ 1 && dx+dy ≤ 2):
//     enemigo.modificarVida(-25)   damageDealtAllies += 25
//     aliado.modificarVida(-35)    damageDealtEnemies += 35
```

| Escenario         | dx  | dy  | Daño         |
| :---------------- | :-- | :-- | :----------- |
| Misma celda       | 0   | 0   | ✅           |
| Adyacente N/S/E/W | 0   | 1   | ✅           |
| Diagonal          | 1   | 1   | ✅ (dx+dy=2) |
| Separados 2       | 2   | 0   | ❌           |

---

## Sistema de Audio

### Volúmenes por defecto

```typescript
const VOL = { landing: 0.5, battle: 0.4, result: 0.6 };
```

### Inicialización

5 `HTMLAudioElement` creados en `useEffect([], [])`. Cleanup en el return del efecto (pausa todos).

### Crossfade

- 50 pasos en 2000ms con curva ease-in-out: `ease = t < .5 ? 2t² : -1 + (4-2t)t`
- `activeFadeRef` cancela siempre el fade anterior antes de iniciar uno nuevo (evita race conditions).

### Desbloqueo iOS/Safari

Al primer click en mute, `hasUnlockedRef.current` se pone a `true` y se llama `play().catch()` + `pause()` síncronos en todos los elementos. Esto registra el gesto de usuario sin interferir con la pista correcta.

### Transiciones de estado

- `landing → game`: stop landing, play battle (inmediato sin fade).
- `game → landing`: crossfade battle → landing.
- `gameResult !== null`: stop battle, play resultado inmediato.
- `gameResult === null` (reset): stop resultado, restart battle desde el principio.

---

## Configuración del Proyecto

### package.json (scripts)

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint ."
}
```

> El script `build` ejecuta primero `tsc -b` (compilación TypeScript) y luego Vite. Tailwind **no es una dependencia npm**: se carga vía CDN en `index.html`.

### vite.config.ts

```typescript
server: { port: 3000, host: '0.0.0.0' }
```

### Tailwind Custom Theme (en index.html)

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        space: {
          ally: "#10b981",
          enemy: "#ef4444",
          healer: "#3b82f6",
          obstacle: "#f59e0b",
          // ...
        },
      },
    },
  },
};
```

---

## Performance y Optimizaciones

1. **RAF Throttling:** Solo actualiza lógica cada `config.renderSpeed` ms.
2. **loopRef Pattern:** Evita stale closures en el game loop.
3. **commit-on-release en sliders:** `setConfig` solo se llama en `onMouseUp` / `onTouchEnd`, no en cada movimiento.
4. **prevEntityCountsRef:** Evita resetear la simulación cuando cambia otro estado (como pausar).
5. **Canvas directo:** Sin librerías de renderizado intermedias.
6. **Garbage collection:** `limpiarMuertos()` itera de atrás hacia adelante para evitar desincronización de índices.
7. **Log buffer:** Máximo 50 entradas con `prev.slice(-49)`.
8. **activeFadeRef:** Un único `setInterval` de fade activo a la vez.
9. **useCallback en addLog:** Evita recreación en dependencias de `useEffect`.

---

**Documentación:** v3.5 | **Última Actualización:** 2026 | **Autor:** Juanma Fernández
