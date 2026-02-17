# GENETIX ARENA | Changelog v3.3 → v3.5 & Quick Start Guide

## 📋 Changelog (v3.3 → v3.5)

### Major Changes

#### 🏗️ Arquitectura
- **v3.3:** Monolítico JavaScript vanilla (~1000+ líneas en `app.js`)
- **v3.5:** Modular TypeScript + React (6 componentes + 1 servicio)

#### 🔤 Lenguaje
- **v3.3:** JavaScript ES6+ (tipado dinámico)
- **v3.5:** TypeScript 5.8+ (tipado estático)

#### 🛠️ Build Tool
- **v3.3:** Vanilla (sin build process, importa JS directo)
- **v3.5:** Vite 6.2 (dev server + bundling + HMR)

#### 🎨 Estilos
- **v3.3:** CSS3 custom (~500 líneas)
- **v3.5:** Tailwind CSS 3 (utility-first + custom theme)

#### 🖥️ Componentes
- **v3.3:** 
  ```
  index.html (canvas + divs genéricos)
  app.js (TODO el código)
  ```
- **v3.5:**
  ```
  App.tsx (orquestador principal)
  LandingPage.tsx (UI landing)
  ControlPanel.tsx (panel de control)
  ConsoleLog.tsx (consola de eventos)
  GenetixEngine.ts (motor de IA)
  types.ts (definiciones TS)
  ```

#### 📱 Responsividad
- **v3.3:** Media queries manuales, responsive parcial
- **v3.5:** Mobile-first con Tailwind, **fully responsive** (desktop/tablet/mobile)

#### 📚 UI Enhancements
- **v3.3:**
  - Layout fijo
  - Interfaz básica
  - Sin modales informativos
  
- **v3.5:**
  - Layout adaptive
  - Interfaz profesional (HUD táctica)
  - 3 modales informativos (Misión, Telemetría, Sistema)
  - Landing page interactiva
  - Consola con timestamps y colores

#### ⚡ Performance
- **v3.3:** Todas entidades actualizadas cada frame (sin throttle)
- **v3.5:** Tickrate configurable (50-500ms) + RAF throttling

#### 📦 Dependencias
- **v3.3:** Cero dependencias (vanilla)
- **v3.5:** 3 dependencias (react, react-dom, lucide-react) + devDependencies estándar

#### 🚀 Features Nuevas en v3.5
- ✅ Landing page profesional
- ✅ Modales informativos interactivos
- ✅ Consola de logs en tiempo real
- ✅ Configuración de parámetros en vivo (UI mejorada)
- ✅ Toggle de barras de vida (visual)
- ✅ Modal de resultado final (VICTORIA/DERROTA/EMPATE)
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

# Debería output algo como:
# ➜  Local:   http://localhost:5173/
# ➜  Press h + enter to show help
```

Abre en navegador: `http://localhost:5173`

### 3. Uso de la Aplicación

#### Landing Page
1. Lee los **3 modales informativos:**
   - **Misión:** Explicación de IA protocols
   - **Telemetría:** Análisis de desequilibrio (¿por qué enemigos ganan?)
   - **Sistema:** Especificaciones técnicas v3.5

2. Click en **"INICIAR SISTEMA"** para comenzar

#### Game View
- **Canvas (izquierda):** Visualización 75×25 de la simulación
- **Panel Derecho:** 
  - Stats (contadores en vivo)
  - Sliders (configuración de entidades)
  - Speed control (50-500ms)
  - Toggle de barras de vida
  - Botones (Pausar/Reanudar/Reiniciar)
- **Consola (abajo):** Registro de eventos en tiempo real

#### Parámetros Configurables

| Parámetro | Rango | Default | Nota |
| :--- | :--- | :--- | :--- |
| **Aliados** | 0–150 | 75 | Fuerzas propias |
| **Enemigos** | 0–150 | 75 | Fuerzas hostiles |
| **Curanderos** | 0–150 | 5 | Apoyo logístico |
| **Obstáculos** | 0–150 | 50 | Terreno |
| **Velocidad Sim** | 50–500ms | 200ms | Tickrate |
| **Barras de Vida** | On/Off | On | Mostrar HP |

**Nota:** Los parámetros se pueden cambiar ANTES de iniciar. Durante simulación, solo velocidad y barras son ajustables. Para cambiar cantidades, debes reiniciar.

### 4. Interpretación de Resultados

#### Iconografía en Canvas

```
🟢 Círculo verde  = Aliado (salud en barrita arriba)
❌ Cruz roja      = Enemigo hostil
⚕️ Cruz azul      = Curandero (Med-Unit)
🟧 Cuadrado amber = Obstáculo
```

#### Barras de Salud (si está activado)

```
verde  (#10b981) = 50–100% HP (sano)
yellow (#eab308) = 25–50% HP (herido)
red    (#ef4444) = 0–25% HP (crítico)
```

#### Consola de Logs

```
[14:30:15] Secuencia de simulación iniciada.              [🔵 system]
[14:30:15] Entidades desplegadas: 75 Aliados, 75...      [⚪ info]
[14:30:16] Hostiles atacando fuerzas aliadas...          [🔴 combat]
[14:30:17] SIMULACIÓN FINALIZADA. RESULTADO: ...         [🔵 system]
```

#### Resultados Finales

```
VICTORIA ALIADA   = Los enemigos fueron eliminados (~15-20% probabilidad)
VICTORIA ENEMIGA  = Los aliados fueron eliminados (~65-75% probabilidad)
EMPATE TÁCTICO    = Ambos bandos eliminados (~10-15% probabilidad)
```

### 5. Build para Producción

```bash
# Compilar TypeScript + bundling
npm run build

# Output: dist/ (carpeta lista para servir)
# Tamaño típico: ~100-150 KB (minificado + gzipped)
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

1. **Aumenta cantidad de curanderos:** De 5 a 10-15
   - Mayor cobertura de curación
   - Aliados logran mantenerse más tiempo

2. **Aumenta cantidad de aliados:** De 75 a 100+
   - Superioridad numérica > ofensiva enemiga

3. **Reduce enemigos:** De 75 a 50
   - Menos presión táctica

4. **Aumenta obstáculos:** De 50 a 75+
   - Usa el terreno para bloquear persecución enemiga

### Para Entender el Desequilibrio

Abre modal "Telemetría" en landing page. Lee la sección "ANÁLISIS DE DESIGUALDAD":
- Asimetría Ofensiva vs Reactiva
- Geometría Euclidiana (curación limitada)
- Diferencial de Resistencia

El sistema está balanceado INTENCIONALMENTE. No es un bug.

### Debug / Troubleshooting

#### ¿Por qué el juego va muy lento?
→ Aumenta "VELOCIDAD SIM" a 500ms. O reduce cantidad de entidades.

#### ¿Por qué el juego va muy rápido?
→ Reduce "VELOCIDAD SIM" a 50-100ms.

#### ¿Por qué no se ve bien en móvil?
→ La v3.5 está fully responsive. Intenta zooming out (Ctrl - en Firefox/Chrome).

#### ¿Puedo cambiar parámetros durante la partida?
→ Solo "VELOCIDAD SIM" y toggle de barras. Otros requieren reiniciar.

#### ¿Dónde veo los logs?
→ Consola abajo. Desplázate para ver histórico. Se guardan los últimos 50.

---

## 📚 Documentación Completa

Para profundizar, consulta los siguientes archivos:

| Documento | Contenido |
| :--- | :--- |
| **README.md** | Resumen general, instalación, características |
| **DOCUMENTACIÓN_v3.5.md** | Documentación técnica completa (800+ líneas) |
| **GUÍA_ARQUITECTURA.md** | Arquitectura, comparativa v3.3 vs v3.5, patrones |
| **ANÁLISIS_EQUILIBRIO_v3.5.md** | Deep dive en balance y desigualdad intencional |
| **Este archivo** | Changelog rápido + quick start |

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev           # Inicia dev server en http://localhost:5173

# Build
npm run build         # Compila a dist/
npm run preview       # Preview del build

# Linting / Format (opcional, si configuras)
# npm run lint
# npm run format

# Otros
npm list              # Ver dependencias instaladas
npm outdated          # Ver actualizaciones disponibles
npm update            # Actualizar dependencias menores
```

---

## 🌐 Deployment

### Vercel (Recomendado)

```bash
# 1. Conecta repo a Vercel
# 2. Vercel auto-detecta Vite
# 3. Deploy automático en push a main
```

### Netlify

```bash
# 1. Conecta repo
# 2. Build command: npm run build
# 3. Publish directory: dist
```

### GitHub Pages

```bash
# 1. En vite.config.ts, añade:
export default {
  base: '/Genetix_Arena_Web_Edition/',
  // ...
}

# 2. En package.json, añade script:
"deploy": "npm run build && gh-pages -d dist"

# 3. Ejecuta: npm run deploy
```

---

## 🎓 Learning Resources

### TypeScript
- https://www.typescriptlang.org/docs/
- https://www.typescripttutorial.net/

### React 19
- https://react.dev/ (oficial)
- React docs: https://react.dev/learn

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

## 🎉 ¡Listo para jugar!

```bash
npm install
npm run dev
# → Abre http://localhost:5173 en tu navegador
# → ¡Lee los modales informativos!
# → ¡Inicia la simulación!
```

**Versión:** 3.5 Stable  
**Última Actualización:** 2026  
**Status:** ✅ Production Ready

---

**¿Preguntas?** Consulta la documentación completa en los archivos `.md` incluidos.
