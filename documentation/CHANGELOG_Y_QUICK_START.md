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
- **v3.3:** Vanilla (sin build process, importa JS directo)
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
  App.tsx              (orquestador principal, game loop y audio)
  LandingPage.tsx      (UI de landing con modales)
  ControlPanel.tsx     (panel de control: sliders, toggles, botones)
  ConsoleLog.tsx       (consola de eventos en tiempo real)
  StatsDisplay.tsx     (panel de estadísticas detalladas)
  RetroLCD.tsx         (display LCD retro de estado)
  SignalLossEffect.tsx (efecto visual de pérdida de señal / glitch)
  GenetixEngine.ts     (motor de IA)
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

- **v3.5:**
  - Layout adaptativo
  - Interfaz profesional (HUD táctico)
  - 3 modales informativos (Misión, Telemetría, Sistema)
  - Landing page interactiva
  - Consola con timestamps y colores
  - Modal de estadísticas detalladas
  - Sistema de audio con 5 pistas y control de mute
  - Efectos visuales: Signal Loss, explosión nuclear, animaciones CRT

#### ⚡ Performance
- **v3.3:** Todas las entidades actualizadas cada frame (sin throttle)
- **v3.5:** Tickrate configurable (50–500ms) + RAF throttling

#### 📦 Dependencias
- **v3.3:** Cero dependencias (vanilla)
- **v3.5:** 3 dependencias de producción (`react`, `react-dom`, `lucide-react`) + devDependencies estándar

#### 🚀 Features Nuevas en v3.5
- ✅ Landing page profesional
- ✅ Modales informativos interactivos
- ✅ Consola de logs en tiempo real
- ✅ Configuración de parámetros en vivo (UI mejorada)
- ✅ Toggle de barras de vida
- ✅ Modal de resultado final (VICTORIA / DERROTA / EMPATE)
- ✅ Modal de estadísticas detalladas (daño total, curación, tasa de supervivencia)
- ✅ Sistema de audio con 5 pistas y fade automático entre estados
- ✅ Control de mute/unmute
- ✅ Effect de Signal Loss (glitch, ruido estático, distorsión RGB)
- ✅ Explosión nuclear (Nuke) con coordenadas objetivo
- ✅ Mission ID dinámico generado en cada sesión
- ✅ HMR (hot reload) en desarrollo
- ✅ TypeScript strict mode
- ✅ Fully responsive design
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
# Clonar repositorio
git clone https://github.com/Ju4nmaFd3z/Genetix_Arena_Web_Edition.git
cd Genetix_Arena_Web_Edition

# Instalar dependencias
npm install
```

### 2. Desarrollo

```bash
# Iniciar dev server con HMR
npm run dev

# Output esperado:
# ➜  Local:   http://localhost:3000/
# ➜  Press h + enter to show help
```

Abre en navegador: `http://localhost:3000`

### 3. Uso de la Aplicación

#### Landing Page
1. Lee los **3 modales informativos:**
   - **Misión:** Protocolo de IA de cada facción
   - **Telemetría:** Análisis del desequilibrio táctico
   - **Sistema:** Especificaciones técnicas v3.5

2. Activa el audio con el botón de mute (opcional).

3. Click en **"INICIAR SISTEMA"** para comenzar.

#### Game View
- **Canvas (izquierda):** Visualización 75×25 de la simulación
- **Panel Derecho:**
  - Stats (contadores en vivo + botón de estadísticas detalladas)
  - Sliders (configuración de entidades, deshabilitados durante la simulación)
  - Speed control (50–500ms)
  - Toggle de barras de vida
  - Botones (Iniciar / Pausar / Reanudar / Reiniciar)
- **Consola (abajo):** Registro de eventos en tiempo real

#### Parámetros Configurables

| Parámetro | Rango | Default | Nota |
| :--- | :--- | :--- | :--- |
| **Aliados** | 0–150 | 75 | Fuerzas propias |
| **Enemigos** | 0–150 | 75 | Fuerzas hostiles |
| **Curanderos** | 0–150 | 5 | Apoyo logístico |
| **Obstáculos** | 0–150 | 50 | Terreno estático |
| **Velocidad Sim** | 50–500ms | 200ms | Tickrate del game loop |
| **Barras de Vida** | On/Off | On | Mostrar HP en canvas |

> ⚠️ Los contadores de entidades solo son ajustables **antes de iniciar** o tras **reiniciar**. La velocidad y las barras de vida son ajustables en cualquier momento.

### 4. Interpretación de Resultados

#### Iconografía en Canvas

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

#### Consola de Logs

```
[14:30:15] Secuencia de simulación iniciada.              [🔵 system]
[14:30:15] Entidades desplegadas: 75 Aliados, 75...       [⚪ info]
[14:30:16] Hostiles atacando fuerzas aliadas...           [🔴 combat]
[14:30:17] SIMULACIÓN FINALIZADA. RESULTADO: ...          [🔵 system]
```

#### Resultados Finales

```
VICTORIA ALIADA   = Los enemigos fueron eliminados (~15–20% probabilidad)
VICTORIA ENEMIGA  = Los aliados fueron eliminados (~65–75% probabilidad)
EMPATE TÁCTICO    = Ambos bandos eliminados simultáneamente (~10–15% probabilidad)
```

### 5. Build para Producción

```bash
# Compilar TypeScript + bundling con Vite
npm run build

# Output: dist/ (lista para servir)
# Tamaño típico: ~100–150 KB (minificado + gzipped)
```

### 6. Preview del Build

```bash
# Visualizar cómo se verá en producción
npm run preview

# Abre: http://localhost:4173
```

---

## 💡 Consejos de Uso

### Para Ganar como Aliados

1. **Aumenta curanderos:** De 5 a 10–15 → mayor cobertura logística.
2. **Aumenta aliados:** De 75 a 100+ → superioridad numérica.
3. **Reduce enemigos:** De 75 a 50 → menos presión táctica.
4. **Aumenta obstáculos:** De 50 a 75+ → bloquea rutas de persecución.

### Para Entender el Desequilibrio

Abre el modal **"Telemetría"** en la landing page para el análisis completo de:
- Asimetría Ofensiva vs Reactiva
- Geometría Euclidiana (curación limitada a distancia ≤ 1.0)
- Diferencial de Resistencia (−35 HP aliados vs −25 HP enemigos)

El sistema está desequilibrado **intencionalmente**. No es un bug.

### Debug / Troubleshooting

| Problema | Solución |
| :--- | :--- |
| Canvas no renderiza | Usa un navegador moderno (Chrome 90+, Firefox 88+). |
| HMR no funciona | Reinicia `npm run dev`. |
| Build falla | Ejecuta `npm ci` para instalar versiones exactas del lock file. |
| Simulación muy lenta | **Reduce** el tickrate a 50–100ms en el panel de control. |
| Simulación muy rápida | **Aumenta** el tickrate a 400–500ms en el panel de control. |
| No hay sonido | Verifica que el mute esté desactivado con el toggle en la UI. |
| Parámetros no cambian | Los contadores de entidades solo aplican al **reiniciar**. |

---

## 📚 Documentación Completa

| Documento | Contenido |
| :--- | :--- |
| **README.md** | Resumen general, instalación, características |
| **DOCUMENTACIÓN_v3.5.md** | Documentación técnica completa (800+ líneas) |
| **GUÍA_ARQUITECTURA.md** | Arquitectura, comparativa v3.3 vs v3.5, patrones |
| **Este archivo** | Changelog rápido + quick start |

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev           # Inicia dev server en http://localhost:3000

# Build
npm run build         # Compila TypeScript + bundle a dist/
npm run preview       # Preview del build en http://localhost:4173

# Calidad de código
npm run lint          # Ejecuta ESLint sobre el proyecto

# Mantenimiento de dependencias
npm list              # Ver dependencias instaladas
npm outdated          # Ver actualizaciones disponibles
npm ci                # Instalar versiones exactas del lock file
```

---

## 🎓 Learning Resources

### TypeScript
- https://www.typescriptlang.org/docs/

### React 19
- https://react.dev/learn

### Vite
- https://vitejs.dev/guide/

### Tailwind CSS
- https://tailwindcss.com/docs

---

## 📞 Support / Contribuciones

### Reportar Issues
1. GitHub Issues: https://github.com/Ju4nmaFd3z/Genetix_Arena_Web_Edition/issues
2. Descripción clara del problema
3. Steps to reproduce
4. Screenshots si es relevante

### Contribuir
1. Fork del repo
2. Crea branch: `git checkout -b feature/nueva-feature`
3. Commit: `git commit -m "Add nueva-feature"`
4. Push: `git push origin feature/nueva-feature`
5. Pull Request

### Contacto Directo
- **Developer:** Juanma Fernández
- **Portfolio:** https://juanma-dev-portfolio.vercel.app/
- **Email:** juanmafr2007@gmail.com

---

## 📝 Licencia

MIT License. Libre para auditar, clonar, modificar y escalar.

Siempre menciona la autoría original del proyecto.

---

**Versión:** 3.5 Stable | **Última Actualización:** 2026 | **Status:** ✅ Production Ready
