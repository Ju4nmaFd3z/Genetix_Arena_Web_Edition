# 🧬 GENETIX ARENA | Web Edition

![Version](https://img.shields.io/badge/Version-3.0-blue)
![Tech](https://img.shields.io/badge/Tech-%20Canvas%20%7C%20CSS3-yellow)

> **Versión web moderna y fiel del simulador de combate estratégico "Genetix Arena".**  
> Migrado desde Java puro a JavaScript (ES6+) manteniendo la lógica exacta del motor original bajo una interfaz moderna inspirada en **Liquid Glass**.

---

## 📋 Descripción

**Genetix Arena Web** es una simulación de batalla autónoma donde distintas entidades (Aliados, Enemigos y Curanderos) interactúan en un mapa grid de 75x25. El proyecto no es solo una visualización, sino una **migración estricta** de la lógica de programación orientada a objetos de Java a JavaScript.

El objetivo es visualizar cómo se comporta la Inteligencia Artificial (IA) de las entidades:
- **Aliados:** Huyen de enemigos y buscan sobrevivir.
- **Enemigos:** Cazan aliados usando algoritmos de búsqueda de caminos.
- **Curanderos:** Priorizan y sanan a los aliados más heridos.

Todo esto renderizado en un **HTML5 Canvas** de alto rendimiento con efectos de neón y una interfaz de usuario minimalista y responsiva.

---

## ✨ Características Principales

### 🎨 Diseño & UI
- **Estética Liquid Glass:** Interfaz moderna con efectos de desenfoque (`backdrop-filter`), transparencias y sombras suaves.
- **Single Page Application (SPA):** Transiciones fluidas entre la Landing Page de configuración y la Arena de combate sin recargas.
- **Renderizado Dinámico:** Opción para alternar entre modo "Neon Glow" (alto detalle) y modo plano.

### ⚙️ Motor de Simulación (Core)
- **Grid System:** Mapa de 75x25 celdas con detección de colisiones en tiempo real.
- **IA de 8 Direcciones:** Las entidades evalúan las 8 casillas adyacentes para tomar la decisión óptima de movimiento (huida o persecución).
- **Game Loop Controlado:** Sistema de `requestAnimationFrame` sincronizado para emular la velocidad original de Java (`Thread.sleep`).

### 📊 Panel de Control
- Estadísticas en tiempo real con barras de progreso dinámicas.
- Controles de **Pausa**, **Reanudar** y **Reinicio** instantáneo.
- Configuración de velocidad de simulación (Lenta, Normal, Turbo).

---

## 🔧 Paridad con Java Original

La migración se ha realizado respetando escrupulosamente la lógica matemática del repositorio original en Java para garantizar el mismo resultado en la simulación:

| Lógica | Implementación |
| :--- | :--- |
| **Daño** | Enemigos reciben **25 de daño** / Aliados reciben **35 de daño** en cada colisión. |
| **Curación** | Estricta. Solo cura si `distancia <= 1` (No cura en diagonales, ya que la distancia es 1.41). |
| **Colisiones** | Permisiva. Ocurre si `(dx + dy) <= 2` (Permite daño en diagonales). |
| **Movimiento** | Algoritmo de evaluación de vector óptimo basado en distancia euclidiana. |

---

## 🚀 Instalación y Despliegue

Este proyecto no requiere dependencias de Node.js ni procesos de compilación. Es **Vanilla JS** puro.

### Ejecución Local
1. Clona el repositorio:
   ```bash
   git clone https://github.com/Ju4nmaFd3z/Genetix_Arena_Web_Edition.git
   ```
2. Abre la carpeta del proyecto.
3. Haz doble clic en el archivo `index.html` para abrirlo en tu navegador predeterminado.
   - *Recomendación:* Para una mejor experiencia con las rutas relativas y fuentes, usa una extensión como **Live Server** en VS Code.

---

## 📂 Estructura del Proyecto

```text
GenetixArenaWeb/
│
├── index.html        # Punto de entrada. Estructura SPA y Canvas.
├── favicon.svg
├── README.md
├── css/
│   └── style.css     # Estilos CSS3, animaciones y diseño Glassmorphism.
└── js/
    └── app.js        # Lógica del juego, Clases (Entidades) y Controlador UI.
```

---

## 🎮 Controles

1. **Landing Page:**
   - Selecciona la **Velocidad** de la simulación (Normal recomendado).
   - Elige el **Renderizado** (Neon recomendado para PC, Flat para móviles antiguos).
   - Haz clic en **INICIALIZAR COMBATE**.

2. **Arena:**
   - Observa la simulación automática.
   - Usa el botón **Pausar** para detener el tiempo y analizar posiciones.
   - Usa **Reiniciar** para generar un nuevo mapa aleatorio con las mismas configuraciones.

---

## ✒️ Autor

**Juanma Fdez**  
*Desarrollador Junior Full Stack (In-Progress) & Creador de Genetix Arena.*

- [Portfolio Web](https://tu-portfolio.com)
- [Repositorio Java Original](https://github.com/tu-usuario/genetix-java)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - eres libre de usarlo, modificarlo y distribuirlo mencionando al autor original.
