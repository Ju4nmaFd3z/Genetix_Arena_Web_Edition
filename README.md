# 🧬 GENETIX ARENA | Web Edition v3.5

![Version](https://img.shields.io/badge/Version-3.5--Stable-indigo)
![Tech](https://img.shields.io/badge/Tech-TypeScript%20%7C%20React%2019%20%7C%20Vite-blue)
![Design](https://img.shields.io/badge/Design-Space%20Tactical%20HUD-darkgreen)
![License](https://img.shields.io/badge/License-MIT-green)

> **Simulador táctico de combate autónomo con inteligencia artificial emergente.**
> Migración de alta fidelidad desde JavaScript vanilla a una arquitectura moderna con **TypeScript + React 19**, bajo una interfaz inspirada en dashboards militares y sistemas de control táctico.

---

## 📋 Descripción del Sistema

**Genetix Arena v3.5** es un entorno de simulación táctica que corre completamente en el navegador, donde entidades dotadas de IA heurística interactúan en tiempo real dentro de una grilla de 75×25 celdas. El proyecto mantiene **paridad lógica 1:1** con el motor original en Java, reimplementado en TypeScript puro con una interfaz React completamente rediseñada.

### Tipos de Entidades (IA Behaviors)

- **Aliados (Ops):** Protocolo de evasión reactiva. Detectan amenazas a ≤3 celdas y calculan vectores de escape optimizados.
- **Enemigos (Hostiles):** Algoritmo de persecución global sin límite de rango. Persiguen activamente al aliado más cercano mediante distancia euclidiana.
- **Curanderos (Med-Units):** Soporte logístico. Priorizan aliados con HP crítico dentro de radio 10. Curan (+50 HP) solo en adyacencia estricta (distancia ≤ 1.0).
- **Obstáculos:** Entidades estáticas que bloquean la navegación y alteran los vectores de movimiento.

---

## ✨ Características de la Versión 3.5

### 🖥️ Interfaz Táctica (HUD)

- **Diseño Responsive Completo:** Adaptación fluida desktop → móvil. Layout que se reorganiza dinámicamente sin perder funcionalidad.
- **Bento Grid Layout:** Panel de telemetría modular con tarjetas independientes (Estadísticas en vivo, Controles, Consola).
- **Visualización en Canvas 2D:** Renderizado directo sin librerías gráficas externas.
- **Sistema de Logs:** Consola de eventos con timestamps y colores contextuales por tipo.
- **Modal de Estadísticas Detalladas:** Panel expandible con métricas avanzadas de la simulación.

### 🎵 Sistema de Audio

- **5 pistas de audio independientes** (`.mp3`) para cada estado del juego:
  - `LandingTrack` → Pantalla de inicio
  - `BattleTrack` → Durante la simulación
  - `AlliesWinTrack` / `EnemiesWinTrack` / `DrawTrack` → Resultados
- **Control de Mute:** Toggle mute/unmute accesible desde la UI.
- **Fade automático** entre pistas al transicionar entre estados.

### 💥 Efectos Visuales Especiales

- **Signal Loss Effect:** Efecto de pérdida de señal con ruido estático, bloques de glitch y distorsión RGB al activar eventos críticos.
- **Explosión Nuclear (Nuke):** Efecto visual de detonación con partículas de impacto y coordenadas objetivo.
- **Transiciones de opacidad** suaves entre vistas (Landing → Game).
- **Animaciones CRT:** Efecto de parpadeo retro sobre la interfaz.

### ⚙️ Motor de Simulación

- **Game Loop basado en `requestAnimationFrame`:** Sincronización con el refresh rate del navegador para máxima fluidez.
- **Tickrate Variable:** Control de velocidad de simulación entre 50ms–500ms por frame.
- **Renderizado Dual Optimizado:**
  - Modo Normal: Renderizado limpio de baja latencia.
  - Con Health Bars: Barras de vida dinámicas con indicadores de color (🟢 Sano / 🟡 Herido / 🔴 Crítico).
- **Telemetría en Vivo:** Actualización de estadísticas sincronizada con el estado del motor.
- **Mission ID dinámico:** Identificador de misión único generado en cada sesión.

### 🎨 Stack Tecnológico

| Tecnología | Versión | Uso |
| :--- | :--- | :--- |
| **React** | 19.2.4 | UI (Hook-based components) |
| **TypeScript** | 5.8+ | Tipado estático y compilación segura |
| **Vite** | 6.2.0 | Dev server con HMR + bundling optimizado |
| **Tailwind CSS** | CDN v3 | Utility-first styling + tema personalizado |
| **Lucide React** | 0.574.0 | Iconografía SVG ligera |
| **Motor de IA** | Vanilla TS | Cero dependencias externas para el engine |

---

## 🔧 Paridad Técnica (Fidelidad del Port)

Se ha mantenido la equivalencia matemática completa con el sistema original:

| Métrica | Valor | Observaciones |
| :--- | :--- | :--- |
| **Daño Hostil** | -25 HP | Los enemigos reciben menos daño por colisión. |
| **Daño Aliado** | -35 HP | Los aliados reciben más daño por colisión. |
| **Curación (Med-Unit)** | distancia ≤ 1.0 | Euclidiana estricta. Diagonal (1.41) fuera de rango. |
| **Detección de Colisión** | (dx + dy) ≤ 2 | Permisiva en diagonal. Permite combate multidireccional. |
| **Frecuencia de Tick** | 50–500ms | Control variable del loop de actualización. |
| **Geometría del Grid** | 75×25 celdas | Mismo tamaño del mapa original. |
| **Rango de Curación** | 10 celdas | Radio de detección para Med-Units. |

---

## 🚀 Instalación y Ejecución

Este proyecto requiere **Node.js ≥ 18.0.0** y **npm ≥ 9.0.0**.

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Ju4nmaFd3z/Genetix_Arena_Web_Edition.git
cd Genetix_Arena_Web_Edition
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Modo Desarrollo

```bash
npm run dev
```

Se abrirá en `http://localhost:3000` con Hot Module Replacement (HMR) activo.

### 4. Compilación para Producción

```bash
npm run build
```

Genera el bundle optimizado en la carpeta `dist/`. Tamaño típico: ~100–150 KB (minificado + gzipped).

### 5. Preview de Build

```bash
npm run preview
```

Visualiza el build de producción en `http://localhost:4173`.

### 6. Linting

```bash
npm run lint
```

---

## 📁 Estructura del Proyecto

```
Genetix_Arena_Web_Edition/
│
├── index.html                    # Punto de entrada SPA. Tailwind CDN + fuentes Google.
├── index.tsx                     # ReactDOM root mount.
├── favicon.svg                   # Favicon de la aplicación.
│
├── App.tsx                       # Componente raíz. Game loop, estado global y audio.
├── types.ts                      # Definiciones de tipos TypeScript (GameConfig, Stats, etc.).
│
├── documentation/
│   ├── CHANGELOG_Y_QUICK_START.md     # Changelog v3.3→v3.5 + guía de inicio rápido.
│   ├── DOCUMENTACIÓN_v3.5.md          # Documentación técnica completa (800+ líneas).
│   └── GUÍA_ARQUITECTURA.md           # Arquitectura, comparativa v3.3 vs v3.5, patrones.
│
├── components/
│   ├── LandingPage.tsx           # Pantalla de inicio con 3 modales informativos.
│   ├── StatsDisplay.tsx          # Panel de estadísticas detalladas.
│   ├── RetroLCD.tsx              # Display LCD retro (estado de simulación).
│   ├── ControlPanel.tsx          # Panel de control: sliders, toggles y botones.
│   ├── ConsoleLog.tsx            # Consola de eventos en tiempo real.
│   └── SignalLossEffect.tsx      # Efecto visual de pérdida de señal / glitch.
│
├── services/
│   └── GenetixEngine.ts          # Motor de simulación (clases de IA, grid, colisiones).
│
├── public/tracks/
│   ├── LandingTrack.mp3
│   ├── BattleTrack.mp3
│   ├── AlliesWinTrack.mp3
│   ├── EnemiesWinTrack.mp3
│   └── DrawTrack.mp3
│
├── metadata.json                 # Metadatos del proyecto.
├── package.json                  # Dependencias y scripts npm.
├── eslint.config.js              # Configuración de ESLint.
├── tsconfig.json                 # Configuración de TypeScript.
├── vite.config.ts                # Configuración de Vite (puerto 3000, alias, env).
│
└── README.md                     # Este archivo.
```

---

## 🎮 Cómo Usar

### Landing Page
1. Lee los **3 modales informativos:**
   - **Misión:** Protocolo de IA y objetivos de cada facción.
   - **Telemetría:** Análisis del desequilibrio táctico.
   - **Sistema:** Especificaciones técnicas de la v3.5.
2. Activa el audio con el botón de mute (opcional).
3. Pulsa **"INICIAR SISTEMA"** para acceder a la simulación.

### Vista de Simulación

**Canvas (izquierda):** Visualización 75×25 de la grilla táctica en tiempo real.

**Panel derecho:**
- **Telemetría:** Contadores de entidades en vivo.
- **Sliders:** Configura cantidades antes de iniciar.
- **Speed control:** Ajusta tickrate entre 50ms (rápido) y 500ms (lento).
- **Toggle barras de vida:** Activa/desactiva indicadores de HP en canvas.
- **Botones:** Iniciar / Pausar / Reanudar / Reiniciar.

**Consola (abajo):** Registro de eventos con timestamps y colores por tipo.

### Parámetros Configurables

| Parámetro | Rango | Default | Nota |
| :--- | :--- | :--- | :--- |
| **Aliados** | 0–150 | 75 | Fuerzas propias |
| **Enemigos** | 0–150 | 75 | Fuerzas hostiles |
| **Curanderos** | 0–150 | 5 | Apoyo logístico |
| **Obstáculos** | 0–150 | 50 | Terreno estático |
| **Velocidad Sim** | 50–500ms | 200ms | Tickrate del game loop |
| **Barras de Vida** | On/Off | On | Indicadores HP en canvas |

> ⚠️ Los contadores de entidades solo son ajustables **antes de iniciar** o tras **reiniciar**. La velocidad y las barras de vida son ajustables en cualquier momento.

### Iconografía del Canvas

```
🟢 Círculo verde   =  Aliado (Op)
❌ Cruz roja       =  Enemigo (Hostile)
⚕️ Cruz azul       =  Curandero (Med-Unit)
🟧 Cuadrado amber  =  Obstáculo
```

#### Barras de Salud (Si está activado)

```
Verde    (#10b981) = 50–100% HP  →  Sano
Amarillo (#eab308) = 25–49% HP   →  Herido
Rojo     (#ef4444) = 0–24% HP    →  Crítico
```

### Consola de Logs

```
[14:30:15] Secuencia de simulación iniciada.         [🔵 system]
[14:30:15] Entidades desplegadas: 75 Aliados...      [⚪ info]
[14:30:16] Hostiles atacando fuerzas aliadas...      [🔴 combat]
[14:30:17] SIMULACIÓN FINALIZADA. RESULTADO: ...     [🔵 system]
```

---

## 📊 Análisis de Desigualdad (Balance)

El sistema presenta desequilibrio **intencional**. Las causas técnicas son:

### 1. Asimetría Ofensiva vs Reactiva
- Los **enemigos** tienen iniciativa global: persiguen sin límite de rango.
- Los **aliados** son puramente reactivos: solo evaden si la amenaza está a ≤3 celdas.

### 2. Limitación de Med-Units
- Rango de curación extremadamente restrictivo: distancia ≤ 1.0 (adyacencia estricta).
- Con 5 curanderos para 75 aliados → cobertura efectiva del 6.6%.

### 3. Diferencial de Resistencia
- **Daño a Aliados:** 35 HP por colisión.
- **Daño a Enemigos:** 25 HP por colisión.
- Diferencia del 40% en resistencia efectiva.

### Probabilidades Esperadas (config por defecto)

| Resultado | Probabilidad estimada |
| :--- | :--- |
| Victoria Aliada | ~15–20% |
| Victoria Enemiga | ~65–75% |
| Empate Táctico | ~10–15% |

> El desequilibrio es una característica de diseño, no un bug. Consulta el modal **"Telemetría"** en la landing page para el análisis completo.

### Consejos para Inclinar la Balanza (Aliados)
- Aumenta curanderos a 10–15 para mejorar la cobertura logística.
- Incrementa aliados a 100+ para superar con ventaja numérica.
- Añade más obstáculos (75+) para bloquear las rutas de persecución enemiga.

---

## 🛠️ Troubleshooting

| Problema | Solución |
| :--- | :--- |
| Canvas no renderiza | Usa un navegador moderno (Chrome 90+, Firefox 88+). |
| HMR no funciona | Reinicia `npm run dev`. |
| Build falla | Ejecuta `npm ci` para instalar versiones exactas del lock file. |
| Simulación muy lenta | **Reduce** la velocidad de tick a 50–100ms en el panel de control. |
| Simulación muy rápida | **Aumenta** la velocidad de tick a 400–500ms en el panel de control. |
| No hay sonido | Comprueba que el audio no esté silenciado con el toggle en la UI. |
| Parámetros no cambian | Los contadores de entidades solo se aplican al **reiniciar** la simulación. |

---

## 🔗 Referencias y Créditos

- **Autor:** Juanma Fernández
- **Portfolio:** [juanma-dev-portfolio.vercel.app](https://juanma-dev-portfolio.vercel.app/)
- **Repositorio Java Original:** [Genetix_Arena](https://github.com/Ju4nmaFd3z/Genetix_Arena.git)
- **Repositorio Web (v3.5):** [Genetix_Arena_Web_Edition](https://github.com/Ju4nmaFd3z/Genetix_Arena_Web_Edition.git)

---

## 📜 Licencia

Este software se distribuye bajo la **Licencia MIT**. Siéntete libre de auditar, clonar, modificar y escalar el código, siempre mencionando la autoría original.

---

## 📚 Documentación Adicional

¿Quieres entender cómo funciona el sistema por dentro? La carpeta `documentation/` contiene tres documentos que cubren el proyecto en profundidad:

| Documento | Qué encontrarás |
| :--- | :--- |
| [`CHANGELOG_Y_QUICK_START.md`](./documentation/CHANGELOG_Y_QUICK_START.md) | Qué cambió de v3.3 a v3.5, guía de inicio rápido y consejos de uso |
| [`DOCUMENTACIÓN_v3.5.md`](./documentation/DOCUMENTACIÓN_v3.5.md) | Referencia técnica completa: componentes, motor de IA, tipos, game loop, colisiones y optimizaciones |
| [`GUÍA_ARQUITECTURA.md`](./documentation/GUÍA_ARQUITECTURA.md) | Comparativa de arquitecturas, patrones utilizados y guía para contribuidores |

> Si es tu primera vez en el proyecto, empieza por el **Quick Start**. Si quieres contribuir o extender el código, la **Guía de Arquitectura** es tu punto de entrada.

---

**Versión:** 3.5 Stable | **Último Update:** 2026 | **Status:** ✅ Production Ready