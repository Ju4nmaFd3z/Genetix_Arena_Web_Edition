# 🧬 GENETIX ARENA | Web Edition v3.5

![Version](https://img.shields.io/badge/Version-3.5--Stable-indigo)
![Tech](https://img.shields.io/badge/Tech-TypeScript%20%7C%20React%2019%20%7C%20Vite-blue)
![Design](https://img.shields.io/badge/Design-SpaceX%20Tactical%20HUD-darkgreen)

> **Simulador táctico de combate autónomo con inteligencia artificial emergente.**  
> Migración de alta fidelidad desde JavaScript vanilla a una arquitectura moderna con **TypeScript + React 19**, bajo una interfaz de grado empresarial inspirada en dashboards militares y sistemas de control de SpaceX.

---

## 📋 Descripción del Sistema

**Genetix Arena v3.5** es un entorno de simulación táctica donde entidades dotadas de IA heurística interactúan en tiempo real dentro de una grilla de 75×25 celdas. El proyecto mantiene **paridad lógica 1:1** con el motor original en Java, pero ahora implementado en TypeScript puro con una interfaz React completamente redeseñada.

### Tipos de Entidades (IA Behaviors):

- **Aliados (Ops):** Protocolo de evasión reactiva. Detectan amenazas a ≤3 celdas y calculan vectores de escape optimizados.
- **Enemigos (Hostiles):** Algoritmo de persecución global sin límite de rango. Persiguen activamente al aliado más cercano mediante distancia euclidiana.
- **Curanderos (Med-Units):** Soporte logístico. Priorizan aliados con HP crítico dentro de radio 10. Curan (+50 HP) solo en adyacencia estricta (distancia ≤ 1.0).
- **Obstáculos:** Entidades estáticas que bloquean navegación y alteran vectores de movimiento.

---

## ✨ Características de la Versión 3.5

### 🖥️ Interfaz Táctica (HUD Redeseñado)

- **Diseño Responsive Completo:** Adaptación fluida desktop → móvil. Layout que se reorganiza dinámicamente sin perder funcionalidad.
- **Bento Grid Layout:** Panel de telemetría modular con tarjetas independientes (Estadísticas en vivo, Controles, Consola).
- **Modo Cine (Expand/Reduce):** Interfaz secundaria colapsable para maximizar viewport de simulación.
- **Visualización en Canvas 2D:** Renderizado directo sin depender de librerías gráficas.
- **Sistema de Logs Táctil:** Consola de eventos con timestamps, colores contextuales y auto-scroll.

### ⚙️ Motor de Simulación

- **Game Loop basado en requestAnimationFrame:** Sincronización con el refresh rate del navegador para máxima fluidez.
- **Tickrate Variable:** Control de velocidad de simulación entre 50ms - 500ms por frame.
- **Renderizado Dual Optimizado:**
  - Modo Normal: Renderizado limpio de baja latencia.
  - Con Health Bars: Barras de vida dinámicas con indicadores de color (🟢 Sano / 🟡 Crítico / 🔴 Muerto).
- **Telemetría en Vivo:** Actualización de estadísticas sincronizada con el estado del motor.

### 🎨 Stack Tecnológico

- **Frontend:** React 19.2.4 (Hook-based components)
- **Lenguaje:** TypeScript 5.8+ (compilación segura de tipos)
- **Build Tool:** Vite 6.2.0 (desarrollo ultrarrápido + bundling optimizado)
- **Styling:** Tailwind CSS 3 (utility-first + custom theme)
- **Iconografía:** Lucide React 0.574.0 (SVG icons ligeros)
- **Lógica:** Vanilla TypeScript (cero dependencias externas para el motor)

---

## 🔧 Paridad Técnica (Fidelidad del Port)

Se ha mantenido escrupulosamente la equivalencia matemática del sistema original:

| Métrica | Valor | Observaciones |
| :--- | :--- | :--- |
| **Daño Hostil** | -25 HP | Los enemigos reciben menos daño por colisión. |
| **Daño Aliado** | -35 HP | Los aliados reciben más daño por colisión. |
| **Protocolo de Curación** | distancia ≤ 1.0 | Euclidiana estricta. Diagonal (1.41) queda fuera de rango. |
| **Detección de Colisión** | (dx + dy) ≤ 2 | Permisiva en diagonal. Permite combate multidireccional. |
| **Frecuencia de Tick** | 50–500ms | Control variable del loop de actualización. |
| **Geometría del Grid** | 75×25 celdas | Mismo tamaño del mapa original. |
| **Rango de Curación** | 10 celdas | Detección de aliado herido para Med-Units. |

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

Se abrirá automáticamente en `http://localhost:5173` con Hot Module Replacement (HMR).

### 4. Compilación para Producción

```bash
npm run build
```

Genera optimizado en carpeta `dist/`.

### 5. Preview de Build

```bash
npm run preview
```

---

## 📁 Estructura del Proyecto

```
GenetixArenaWeb/
│
├── index.html                    # Punto de entrada. SPA con Tailwind CDN.
├── index.tsx                     # ReactDOM root mount.
├── index.css                     # Estilos globales.
│
├── App.tsx                       # Componente principal. Maneja game loop y estado global.
├── types.ts                      # Definiciones de tipos TypeScript.
│
├── components/
│   ├── LandingPage.tsx          # Página de inicio con modales informativos.
│   ├── ControlPanel.tsx         # Panel de control (sliders, toggles, botones).
│   └── ConsoleLog.tsx           # Consola de logs en tiempo real.
│
├── services/
│   └── GenetixEngine.ts         # Motor de simulación (todas las clases de IA).
│
├── package.json                 # Dependencias y scripts.
├── tsconfig.json                # Configuración de TypeScript.
├── vite.config.ts               # Configuración de Vite.
├── tailwind.config.js           # Tema personalizado (colores, fuentes).
│
└── README.md                    # Este archivo.
```

---

## 🎮 Cómo Jugar / Usar

1. **Landing Page:** Lee los protocolos de IA, análisis de desigualdad y especificaciones técnicas.
2. **Iniciar Simulación:** Click en "INICIAR SISTEMA" o botón "INICIAR SIMULACIÓN" en el panel.
3. **Ajustar Parámetros:** (Antes de empezar) Modifica cantidades de entidades con los sliders.
4. **Controlar Velocidad:** Ajusta "VELOCIDAD SIM" entre rápido (50ms) y lento (500ms).
5. **Toggles Visuales:** Activa/desactiva barras de salud en HUD.
6. **Pausar/Reanudar:** Botones de control durante la simulación.
7. **Reiniciar:** Resetea el estado y reinicia con la misma config.
8. **Resultado:** Modal final indicará VICTORIA ALIADA / VICTORIA ENEMIGA / EMPATE.

---

## 📊 Análisis de Desigualdad (Balance)

El sistema presenta desequilibrio intencional. Las causas técnicas son:

### 1. Asimetría Ofensiva vs Reactiva
- Los **enemigos** poseen iniciativa global (persiguen sin límite de rango).
- Los **aliados** son puramente reactivos (solo escapan si amenaza ≤ 3 celdas).

### 2. Limitación de Med-Units (Healers)
- Protocolo de curación extremadamente restrictivo: distancia ≤ 1.0.
- Con 5 curanderos para 75 aliados, cobertura efectiva: 6.6%.

### 3. Diferencial de Resistencia
- **Daño a Aliados:** 35 HP (40% menos resistencia efectiva).
- **Daño a Enemigos:** 25 HP.

**Conclusión:** Los aliados requieren **superioridad numérica masiva** o **estrategia posicional** para prevalecer. El desequilibrio es una característica de diseño, no un bug.

---

## 🔗 Referencias y Créditos

- **Autor:** Juanma Fernández
- **Portfolio:** https://juanma-dev-portfolio.vercel.app/
- **Repositorio Java Original:** https://github.com/Ju4nmaFd3z/Genetix_Arena.git
- **Repositorio Web (v3.5):** https://github.com/Ju4nmaFd3z/Genetix_Arena_Web_Edition.git

---

## 📜 Licencia

Este software se distribuye bajo la **Licencia MIT**. Siéntete libre de auditar, clonar, modificar y escalar el código, siempre mencionando la autoría original.

---

## 🛠️ Troubleshooting

| Problema | Solución |
| :--- | :--- |
| Canvas no renderiza | Asegúrate de tener un navegador moderno (Chrome 90+, Firefox 88+). |
| HMR no funciona | Reinicia `npm run dev`. |
| Build falla | Ejecuta `npm ci` para instalar versiones exactas. |
| Rendimiento lento | Aumenta Tickrate (velocidad sim) en el panel de control. |

---

**Versión:** 3.5 Stable  
**Último Update:** 2026  
**Status:** ✅ Production Ready
