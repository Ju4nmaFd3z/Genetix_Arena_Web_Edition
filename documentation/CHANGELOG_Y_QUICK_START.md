# GENETIX ARENA | Changelog v3.3 → v3.5 & Quick Start Guide

## 📋 Changelog (v3.3 → v3.5)

### Major Changes

#### 🏗️ Arquitectura

- **v3.3:** Monolítico JavaScript vanilla (~1000+ líneas en `app.js`)
- **v3.5:** Modular TypeScript + React (9 componentes + 1 servicio)

#### 🔤 Lenguaje

- **v3.3:** JavaScript ES6+ (tipado dinámico)
- **v3.5:** TypeScript 5.8+ (tipado estático)

#### 🛠️ Build Tool

- **v3.3:** Vanilla (sin build process)
- **v3.5:** Vite 6.2 (dev server + bundling + HMR)

#### 🎨 Estilos

- **v3.3:** CSS3 custom (~500 líneas)
- **v3.5:** Tailwind CSS vía CDN (utility-first + custom theme en `index.html`)

#### 🖥️ Componentes

- **v3.3:**
  ```
  index.html (canvas + divs genéricos)
  app.js (TODO el código)
  ```
- **v3.5:**
  ```
  App.tsx              (orquestador principal, game loop, audio y Omega Protocol)
  LandingPage.tsx      (UI de landing con modales)
  ControlPanel.tsx     (panel de control: sliders, toggles, botones y Nuke)
  ConsoleLog.tsx       (consola de eventos en tiempo real)
  StatsDisplay.tsx     (panel de estadísticas detalladas)
  RetroLCD.tsx         (display LCD retro de estado)
  SignalLossEffect.tsx (efecto visual de pérdida de señal / glitch)
  GenetixEngine.ts     (motor de IA, Omega Protocol, DeathAnim)
  types.ts             (definiciones TypeScript)
  ```

#### 📱 Responsividad

- **v3.3:** Media queries manuales, responsive parcial
- **v3.5:** Mobile-first con Tailwind, **fully responsive** (desktop/tablet/móvil)

#### 📚 UI Enhancements

- **v3.3:**
  - Layout fijo
  - Interfaz básica
  - Sin modales informativos
  - Sin sistema de audio
  - Sin efectos visuales

- **v3.5:**
  - Layout adaptativo mobile-first
  - Interfaz profesional (HUD táctico)
  - 3 modales informativos (Misión, Telemetría, Sistema)
  - Landing page interactiva
  - Consola con timestamps y colores contextuales
  - Modal de estadísticas detalladas post-combate
  - Sistema de audio con 5 pistas y fade automático entre estados
  - Efectos visuales: Signal Loss, explosión nuclear, niebla radiactiva, animaciones CRT
  - Animaciones de muerte en canvas diferenciadas por facción
  - Display LCD retro con mensajes dinámicos de estado
  - Detección de cambio de configuración con confirmación

#### ⚡ Performance

- **v3.3:** Todas las entidades actualizadas cada frame (sin throttle)
- **v3.5:** Tickrate configurable (10–500ms) + RAF throttling + loopRef pattern (sin stale closures)

#### 📦 Dependencias

- **v3.3:** Cero dependencias (vanilla)
- **v3.5:** 3 dependencias de producción (`react`, `react-dom`, `lucide-react`) + devDependencies estándar

#### 🚀 Features Nuevas en v3.5

- ✅ Landing page profesional
- ✅ 3 modales informativos interactivos
- ✅ Consola de logs en tiempo real
- ✅ Configuración de parámetros en vivo con validación
- ✅ Toggle de barras de vida
- ✅ Modal de resultado final (VICTORIA / DERROTA / EMPATE)
- ✅ Modal de estadísticas detalladas (daño total, curación, tasa de supervivencia, lifespan medio)
- ✅ Sistema de audio con 5 pistas y crossfade ease-in-out
- ✅ Control de mute/unmute (con desbloqueo iOS/Safari)
- ✅ Signal Loss Effect (glitch, ruido estático, distorsión RGB)
- ✅ **Protocolo Omega (Nuke):** arma de último recurso con secuencia temporal, detonación y HUD de targeting
- ✅ **Mecánica de Fallout / Radiación:** daño por radiación post-detonación a enemigos y aliados
- ✅ **Animaciones de muerte en canvas:** anillos de onda (aliados) y brackets digitales (enemigos)
- ✅ **Detección de cambio de config:** pausa automática + botón "APLICAR CAMBIOS Y REINICIAR"
- ✅ **Validación de sliders:** aliados y enemigos tienen mínimo de 1 unidad
- ✅ **Botón DEFAULTS:** restaura configuración por defecto
- ✅ **Botón ABORT_OP:** vuelve a la landing page
- ✅ Mission ID dinámico generado en cada sesión
- ✅ HMR (hot reload) en desarrollo
- ✅ TypeScript strict mode
- ✅ Build optimizado para producción

---

## 🚀 Quick Start Guide

### Requisitos Previos

```bash
# Node.js >= 18.0.0
node --version

# npm >= 9.0.0
npm --version
```

### 1. Instalación

```bash
git clone https://github.com/Ju4nmaFd3z/Genetix_Arena_Web_Edition.git
cd Genetix_Arena_Web_Edition
npm install
```

### 2. Desarrollo

```bash
npm run dev
# → http://localhost:3000
```

### 3. Uso de la Aplicación

#### Landing Page

1. Lee los **3 modales informativos** (Misión, Telemetría, Sistema).
2. Activa el audio si lo deseas.
3. Click en **"INICIAR SISTEMA"**.

#### Game View

- **Canvas (izquierda):** Simulación 75×25 en tiempo real.
- **Panel Derecho:** Stats en vivo, sliders de configuración, controles y Omega Protocol.
- **Consola (abajo):** Registro de eventos con timestamps.

#### Parámetros Configurables

| Parámetro          | Rango    | Default | Nota                   |
| :----------------- | :------- | :------ | :--------------------- |
| **Aliados**        | 1–150    | 75      | Mínimo 1               |
| **Enemigos**       | 1–150    | 75      | Mínimo 1               |
| **Curanderos**     | 0–150    | 5       | Apoyo logístico        |
| **Obstáculos**     | 0–150    | 50      | Terreno estático       |
| **Velocidad Sim**  | 10–500ms | 200ms   | Tickrate del game loop |
| **Barras de Vida** | On/Off   | On      | Mostrar HP en canvas   |
| **Audio**          | On/Off   | Off     | Sistema de audio       |

> ⚠️ Si se modifican los sliders de entidades con la partida activa, aparecerá el botón **"APLICAR CAMBIOS Y REINICIAR"** para confirmar.

#### Controles del Panel

| Botón                           | Función                                   |
| :------------------------------ | :---------------------------------------- |
| **INICIAR SIMULACIÓN**          | Arranca la partida                        |
| **PAUSA / REANUDAR**            | Suspende o reanuda el loop                |
| **REINICIAR**                   | Resetea la simulación                     |
| **APLICAR CAMBIOS Y REINICIAR** | Confirma cambios de config y reinicia     |
| **DEFAULTS**                    | Restaura valores por defecto              |
| **ABORT_OP**                    | Vuelve a la landing page                  |
| **OMEGA PROTOCOL**              | Arma de último recurso (≤3 aliados vivos) |

#### Protocolo Omega (Nuke)

El botón **OMEGA PROTOCOL** se desbloquea cuando quedan ≤3 aliados vivos:

1. Se activa la cuenta atrás (T-3, T-2, T-1) en la consola.
2. **Detonación:** Signal Loss effect → detonación → HUD de targeting sobre supervivientes enemigos.
3. **Efectos:** destruye el 80% de enemigos + restaura aliados al 100% HP.
4. **Fallout (~40 ticks):** daño de radiación a enemigos (−5 HP, 70% prob/tick) y daño residual a aliados (−1 HP, 30% prob/tick). Los enemigos pierden el 60% de sus movimientos.
5. El botón queda en estado "DISCHARGED". Uso único por partida.

### 4. Interpretación de Resultados

#### Iconografía en Canvas

```
⬤ Círculo verde    = Aliado (doble anillo + núcleo)
✦ Estrella roja    = Enemigo (estrella 4 puntas)
✚ Cruz azul        = Curandero (cruz flotante + halo)
■ Cuadrado amber   = Obstáculo (caja con diagonal)
```

#### Barras de Salud

```
Verde   (#10b981) = 50–100% HP  →  Sano
Amarillo (#f59e0b) = 25–49% HP  →  Herido
Rojo    (#ef4444) = 0–24% HP    →  Crítico
```

#### Resultados Finales

```
ALLIES_WIN   = Los enemigos fueron eliminados (~15–20%)
ENEMIES_WIN  = Los aliados fueron eliminados (~65–75%)
DRAW         = Ambos eliminados simultáneamente (~10–15%)
```

### 5. Build para Producción

```bash
npm run build   # tsc -b && vite build → dist/
npm run preview # preview en http://localhost:4173
npm run lint    # ESLint
```

---

## 💡 Consejos de Uso

- **Para ganar como Aliados:** Sube curanderos a 10–15, aliados a 100+, obstáculos a 75+.
- **Velocidad máxima:** Tickrate a 10ms.
- **Análisis detallado:** Abre el modal de telemetría para ver daño total, curación y lifespan.
- **Omega Protocol:** Úsalo solo cuando sea inevitable; el fallout puede dañar también a tus aliados.

---

## 🛠️ Troubleshooting

| Problema                        | Solución                                                   |
| :------------------------------ | :--------------------------------------------------------- |
| Canvas no renderiza             | Usa Chrome 90+, Firefox 88+.                               |
| HMR no funciona                 | Reinicia `npm run dev`.                                    |
| Build falla                     | Ejecuta `npm ci`.                                          |
| Simulación muy lenta            | Reduce el tickrate a 10–100ms.                             |
| Simulación muy rápida           | Aumenta el tickrate a 400–500ms.                           |
| No hay sonido                   | Activa el toggle `SYSTEM_AUDIO_FEED`.                      |
| Parámetros no cambian           | Pausa la sim, edita y pulsa "APLICAR CAMBIOS Y REINICIAR". |
| Aliados/Enemigos se quedan en 1 | El mínimo es 1. Es una restricción de diseño.              |
| Omega Protocol bloqueado        | Requiere ≤3 aliados vivos y sim en marcha. Uso único.      |

---

## 📚 Documentación Completa

| Documento                 | Contenido                                        |
| :------------------------ | :----------------------------------------------- |
| **README.md**             | Resumen general, instalación, características    |
| **DOCUMENTACIÓN_v3.5.md** | Documentación técnica completa                   |
| **GUÍA_ARQUITECTURA.md**  | Arquitectura, comparativa v3.3 vs v3.5, patrones |
| **Este archivo**          | Changelog rápido + quick start                   |

---

## 🌐 Deployment

### Vercel

Conecta el repositorio → auto-detecta Vite → deploy automático.

### Netlify

```
Build command:     npm run build
Publish directory: dist
```

### GitHub Pages

En `vite.config.ts`, añade `base: '/Genetix_Arena_Web_Edition/'`, luego:

```bash
npm install --save-dev gh-pages
# añade "deploy": "npm run build && gh-pages -d dist" en package.json
npm run deploy
```

---

**Versión:** 3.5 Stable | **Última Actualización:** 2026 | **Status:** ✅ Production Ready
