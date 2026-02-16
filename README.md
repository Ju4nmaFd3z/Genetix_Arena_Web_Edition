# 🧬 GENETIX ARENA | Web Edition v3.3

![Version](https://img.shields.io/badge/Version-3.3--Stable-indigo)
![Tech](https://img.shields.io/badge/Tech-JS%20ES6+%20%7C%20Canvas%202D-green)
![Design](https://img.shields.io/badge/Design-Deep%20Space%20Tactical-blue)

> **Plataforma de simulación autónoma de combate basada en algoritmos de comportamiento de enjambre.**  
> Una migración de alta fidelidad desde Java puro a una arquitectura web moderna, bajo una interfaz de grado corporativo inspirada en sistemas HUD militares y dashboards tácticos de alta gama.

---

## 📋 Descripción del Sistema

**Genetix Arena v3.3** es un entorno de simulación táctica donde entidades con Inteligencia Artificial (IA) interactúan en tiempo real dentro de un grid de 75x25. El proyecto representa una **migración estricta** de la lógica de programación orientada a objetos (POO) de Java a JavaScript funcional y ES6+, garantizando paridad matemática absoluta con el motor original.

### Comportamiento de Entidades (IA):
- **Aliados (Green Ops):** Protocolos de evasión. Detectan amenazas y buscan rutas de escape optimizadas.
- **Enemigos (Hostiles):** Algoritmos de caza. Persiguen a los aliados mediante cálculo de distancia euclidiana en tiempo real.
- **Curanderos (Med-Units):** Priorización de objetivos heridos y soporte logístico dentro de un radio de acción específico.

---

## ✨ Características de la Versión 3.3

### 🖥️ Interfaz Táctica (HUD)
- **Diseño "Airy" Profesional:** Layout optimizado con amplios márgenes y espaciado ("White Space") para evitar la fatiga visual y mejorar la legibilidad de datos.
- **Bento Grid Layout:** Organización de información en paneles modulares e independientes (Telemetría, Comandos, Consola).
- **Modo Cine (Expand/Reduce):** Funcionalidad inmersiva que permite ocultar el panel de datos para maximizar la vista del dron a pantalla completa.
- **Responsive Adaptive Core:** Rediseño total de la rejilla para dispositivos móviles, transformando el dashboard en una interfaz vertical fluida sin solapamiento de elementos.

### ⚙️ Motor de Simulación y Renderizado
- **Dual-Engine Rendering:** 
    - *Neon Pulse:* Efectos de brillo (bloom) y sombras dinámicas aceleradas por GPU.
    - *Wireframe Mode:* Renderizado plano de baja latencia para máxima eficiencia energética en dispositivos antiguos.
- **Simulation Loop:** Sincronización mediante `requestAnimationFrame` para emular el comportamiento de hilos (`Threads`) del código Java original.
- **Telemetría Dinámica:** Barras de estado y contadores vinculados directamente a las instancias de la clase `Entidad`.

---

## 🔧 Paridad Técnica (Java Port)

Se ha respetado escrupulosamente la lógica matemática del repositorio original para garantizar resultados idénticos:

| Métrica | Valor Lógico | Observaciones |
| :--- | :--- | :--- |
| **Daño Hostil** | -35 Vida | Los aliados son más vulnerables al contacto. |
| **Daño Aliado** | -25 Vida | Los enemigos tienen una mayor resistencia base. |
| **Protocolo de Salud** | `distancia <= 1` | Curación estricta (no permite diagonales por distancia euclidiana 1.41). |
| **Detección de Colisión** | `(dx + dy) <= 2` | Lógica permisiva que permite el combate en diagonal. |
| **Frecuencia de Tick** | 50ms - 400ms | Control variable del loop de procesamiento. |

---

## 🚀 Despliegue e Instalación

Este simulador es **Vanilla JS** puro. No requiere Node.js, compiladores ni dependencias externas.

1.  **Clonar:**
    ```bash
    git clone https://github.com/Ju4nmaFd3z/Genetix_Arena_Web_Edition.git
    ```
2.  **Ejecutar:** 
    Simplemente abre `index.html` en cualquier navegador moderno.
    *Para la mejor experiencia visual, se recomienda utilizar navegadores basados en Chromium.*

---

## 📂 Estructura del Proyecto

```text
GenetixArenaWeb/
│
├── index.html        # Punto de entrada. Estructura SPA y Canvas.
├── favicon.svg
├── README.md
├── documentation/
│   └── analisis_desigualdad.txt
├── css/
│   └── style.css     # Estilos CSS3, animaciones y diseño Glassmorphism.
└── js/
    └── app.js        # Lógica del juego, Clases (Entidades) y Controlador UI.
```

---

## ✒️ Autor y Créditos

**Juanma Fdez**  
*Desarrollador Full Stack (In-Progress) & Arquitecto de Sistemas Genetix.*

- [🌐 Portfolio Profesional](https://juanma-dev-portfolio.vercel.app/)
- [☕ Repositorio Java Original](https://github.com/Ju4nmaFd3z/Genetix_Arena.git)
- [🛠️ Repositorio JS (Versión Actual)](https://github.com/Ju4nmaFd3z/Genetix_Arena_Web_Edition.git)

---

## 📄 Licencia

Este software se distribuye bajo la **Licencia MIT**. Siéntete libre de auditar el código, clonarlo o escalarlo, siempre mencionando la autoría original del proyecto.