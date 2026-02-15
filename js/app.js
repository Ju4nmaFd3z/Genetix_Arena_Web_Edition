/**
 * GENETIX ARENA WEB - STRICT JAVA PORT
 * Autor Original: Juanma Fdez
 * 
 * NOTA: Se ha mantenido la lógica EXACTA del Java.
 * - Daño: Aliados reciben 35, Enemigos 25.
 * - Curación: Solo distancia <= 1 (No cura en diagonales estrictas).
 * - Combate: Sí permite diagonales ((dx+dy) <= 2).
 */

// --- CONFIGURACIÓN DE UI & ESTADO GLOBAL ---
const GAME_CONFIG = {
    renderSpeed: 200, // Igual a Thread.sleep(200)
    ALTO: 25,
    ANCHO: 75,
    CELL_SIZE: 20
};

// Referencias UI
const UI = {
    canvas: document.getElementById('gameCanvas'),
    ctx: document.getElementById('gameCanvas').getContext('2d'),
    elements: {
        aliados: document.getElementById('count-aliados'),
        enemigos: document.getElementById('count-enemigos'),
        curanderos: document.getElementById('count-curanderos'),
        obstaculos: document.getElementById('count-obstaculos'),
        msg: document.getElementById('game-msg'),
        barAliados: document.getElementById('bar-aliados'),
        barEnemigos: document.getElementById('bar-enemigos')
    },
    screens: {
        landing: document.getElementById('landing-section'),
        game: document.getElementById('game-section')
    }
};

// --- ESTRUCTURAS DE DATOS ---
// Equivalente a String[][] mapa, pero guardando referencias a objetos
let grid = []; 
let listas = {
    obstaculos: [],
    enemigos: [],
    aliados: [],
    curanderos: []
};
let gameState = {
    running: false,
    paused: false,
    lastTime: 0,
    animFrame: null
};

// --- CLASES (EQUIVALENTES A TUS ARCHIVOS .JAVA) ---

// [Entidad.java]
class Entidad {
    constructor(x, y) {
        this.posX = x;
        this.posY = y;
        this.vida = 100;
    }

    getPosX() { return this.posX; }
    getPosY() { return this.posY; }
    setPosX(x) { this.posX = x; }
    setPosY(y) { this.posY = y; }
    
    getVida() { return this.vida; }
    
    setVida(vida) {
        if (vida < 0) this.vida = 0;
        else if (vida > 100) this.vida = 100;
        else this.vida = vida;
    }

    modificarVida(cantidad) {
        this.setVida(this.vida + cantidad);
    }

    // Fórmula exacta: sqrt((x2-x1)² + (y2-y1)²)
    getDistancia(otraEntidad) {
        let dx = this.posX - otraEntidad.getPosX();
        let dy = this.posY - otraEntidad.getPosY();
        return Math.sqrt(dx * dx + dy * dy);
    }
}

// [Obstaculo.java]
class Obstaculo extends Entidad {
    constructor(x, y) { super(x, y); }
}

// [Aliado.java]
class Aliado extends Entidad {
    constructor(x, y) { super(x, y); }

    // Implementación exacta de Aliado.java -> Escapa
    Escapa(listaEnemigos, ALTO, ANCHO, listaAliados, listaObstaculos, listaCuranderos) {
        let enemigo = null;
        let distanciaMinima = Number.MAX_VALUE;

        // 1. Encontrar enemigo más cercano
        for (let e of listaEnemigos) {
            let d = this.getDistancia(e);
            if (d < distanciaMinima) {
                distanciaMinima = d;
                enemigo = e;
            }
        }

        // 2. Solo huye si distanciaMinima > 3 no se cumple (es decir, <= 3) o enemigo es null
        // OJO: Tu código Java dice: if (distanciaMinima > 3 || enemigo == null) return;
        if (distanciaMinima > 3 || enemigo === null) return;

        let menorDistancia = 0; // Buscamos ALEJARNOS, así que buscaremos el valor más alto posible comparado con 0?
        // ESPERA, en tu Java: if (distancia > menorDistancia). Inicializas menorDistancia en 0.
        // Significa que buscas maximizar la distancia. Correcto.

        let mejorVx = 0;
        let mejorVy = 0;

        // Arrays estáticos de direcciones (Copiados de Java)
        const DIRECCION_Y = [-1, -1, -1, 0, 0, 1, 1, 1];
        const DIRECCION_X = [-1, 0, 1, -1, 1, -1, 0, 1];

        for (let i = 0; i < 8; i++) {
            let nuevaX = this.getPosX() + DIRECCION_X[i];
            let nuevaY = this.getPosY() + DIRECCION_Y[i];

            if (MisFunciones.posicionValida(nuevaX, nuevaY, ALTO, ANCHO, listaAliados, listaEnemigos, listaObstaculos, listaCuranderos)) {
                // Posición temporal simulada
                let posicionPrueba = new Entidad(nuevaX, nuevaY);
                let distancia = posicionPrueba.getDistancia(enemigo);

                if (distancia > menorDistancia) {
                    menorDistancia = distancia;
                    mejorVx = DIRECCION_X[i];
                    mejorVy = DIRECCION_Y[i];
                }
            }
        }

        if (mejorVx !== 0 || mejorVy !== 0) {
            // Actualizar Grid (necesario para JS visual)
            grid[this.posY][this.posX] = null; 
            this.setPosX(this.getPosX() + mejorVx);
            this.setPosY(this.getPosY() + mejorVy);
            grid[this.posY][this.posX] = this;
        }
    }
}

// [Enemigo.java]
class Enemigo extends Entidad {
    constructor(x, y) { super(x, y); }

    // Implementación exacta de Enemigo.java -> Persigue
    Persigue(listaAliados, ALTO, ANCHO, listaEnemigos, listaObstaculos, listaCuranderos) {
        let objetivo = null;
        let distanciaMinima = Number.MAX_VALUE;

        for (let a of listaAliados) {
            let d = this.getDistancia(a);
            if (d < distanciaMinima) {
                distanciaMinima = d;
                objetivo = a;
            }
        }

        if (objetivo === null) return;

        let mayorDistancia = Number.MAX_VALUE; // Buscamos MINIMIZAR la distancia
        let mejorVx = 0;
        let mejorVy = 0;

        const DIRECCION_Y = [-1, -1, -1, 0, 0, 1, 1, 1];
        const DIRECCION_X = [-1, 0, 1, -1, 1, -1, 0, 1];

        for (let i = 0; i < 8; i++) {
            let nuevaX = this.getPosX() + DIRECCION_X[i];
            let nuevaY = this.getPosY() + DIRECCION_Y[i];

            if (MisFunciones.posicionValida(nuevaX, nuevaY, ALTO, ANCHO, listaAliados, listaEnemigos, listaObstaculos, listaCuranderos)) {
                let posicionPrueba = new Entidad(nuevaX, nuevaY);
                let distancia = posicionPrueba.getDistancia(objetivo);

                if (distancia < mayorDistancia) {
                    mayorDistancia = distancia;
                    mejorVx = DIRECCION_X[i];
                    mejorVy = DIRECCION_Y[i];
                }
            }
        }

        if (mejorVx !== 0 || mejorVy !== 0) {
            grid[this.posY][this.posX] = null;
            this.setPosX(this.getPosX() + mejorVx);
            this.setPosY(this.getPosY() + mejorVy);
            grid[this.posY][this.posX] = this;
        }
    }
}

// [Curandero.java]
class Curandero extends Entidad {
    constructor(x, y) { super(x, y); }

    // Implementación exacta de Curandero.java -> Cura
    Cura(listaAliados, ALTO, ANCHO, listaEnemigos, listaObstaculos, listaCuranderos) {
        let aliadoMasHerido = null;
        let menorVida = Number.MAX_VALUE; // Integer.MAX_VALUE
        let distanciaAliadoMasHerido = Number.MAX_VALUE;

        for (let aliado of listaAliados) {
            let distancia = this.getDistancia(aliado);
            
            // "Si está dentro del rango (10) y tiene menos vida que los anteriores"
            // Nota: En Java usas (aliado.getVida() < menorVida). Es estricto.
            if (distancia <= 10 && aliado.getVida() < menorVida) {
                menorVida = aliado.getVida();
                aliadoMasHerido = aliado;
                distanciaAliadoMasHerido = distancia;
            }
        }

        if (aliadoMasHerido === null) return;

        // "Si el aliado está lo suficientemente cerca (<= 1), curarlo"
        // IMPORTANTE: Distancia euclidiana diagonal (1,1) es 1.41. 
        // 1.41 <= 1 es FALSO. Los curanderos en tu código Java NO curan en diagonal.
        if (distanciaAliadoMasHerido <= 1) {
            aliadoMasHerido.modificarVida(50);
            return; // Priorizar curación sobre movimiento
        }

        // Movimiento hacia el herido
        let mayorDistancia = Number.MAX_VALUE;
        let mejorVx = 0;
        let mejorVy = 0;

        const DIRECCION_Y = [-1, -1, -1, 0, 0, 1, 1, 1];
        const DIRECCION_X = [-1, 0, 1, -1, 1, -1, 0, 1];

        for (let i = 0; i < 8; i++) {
            let nuevaX = this.getPosX() + DIRECCION_X[i];
            let nuevaY = this.getPosY() + DIRECCION_Y[i];

            if (MisFunciones.posicionValida(nuevaX, nuevaY, ALTO, ANCHO, listaAliados, listaEnemigos, listaObstaculos, listaCuranderos)) {
                let posicionPrueba = new Entidad(nuevaX, nuevaY);
                let distancia = posicionPrueba.getDistancia(aliadoMasHerido);

                if (distancia < mayorDistancia) {
                    mayorDistancia = distancia;
                    mejorVx = DIRECCION_X[i];
                    mejorVy = DIRECCION_Y[i];
                }
            }
        }

        if (mejorVx !== 0 || mejorVy !== 0) {
            grid[this.posY][this.posX] = null;
            this.setPosX(this.getPosX() + mejorVx);
            this.setPosY(this.getPosY() + mejorVy);
            grid[this.posY][this.posX] = this;
        }
    }
}

// [MisFunciones.java]
const MisFunciones = {
    
    // Implementación usando el GRID para eficiencia, pero respetando la lógica de "casilla vacía"
    posicionValida: (xDestino, yDestino, ALTO, ANCHO, lA, lE, lO, lC) => {
        // Verificar límites
        if ((xDestino < 0 || xDestino >= ANCHO) || (yDestino < 0 || yDestino >= ALTO)) {
            return false;
        }
        
        // En Java recorres las listas. Aquí, si el GRID está sincronizado, es equivalente 
        // a verificar si grid[y][x] != null. Mantenemos el grid sincronizado siempre.
        if (grid[yDestino][xDestino] !== null) {
            return false;
        }
        
        return true;
    },

    detectarYResolverColisiones: (listaEnemigos, listaAliados) => {
        let evento = "Esperando contacto...";
        
        // Doble bucle EXACTO al Java
        for (let enemigo of listaEnemigos) {
            for (let aliado of listaAliados) {
                
                let diferenciaX = Math.abs(enemigo.getPosX() - aliado.getPosX());
                let diferenciaY = Math.abs(enemigo.getPosY() - aliado.getPosY());
                
                // Lógica de colisión EXACTA (Permite diagonales)
                // (0,0) -> Misma casilla (imposible por posicionValida, pero el check está ahí)
                // (0,1) o (1,0) -> Adyacente -> Suma 1 <= 2. TRUE
                // (1,1) -> Diagonal -> Suma 2 <= 2. TRUE.
                if ((diferenciaX === 0 && diferenciaY === 0) || 
                    (diferenciaX <= 1 && diferenciaY <= 1 && (diferenciaX + diferenciaY) <= 2)) {
                    
                    enemigo.modificarVida(-25);
                    aliado.modificarVida(-35); // Aliado recibe más daño (fiel al Java)
                    evento = "¡Enfrentamiento! Se están matando...";
                }
            }
        }
        return evento;
    },

    limpiarMuertos: (listaEnemigos, listaAliados) => {
        // Limpiar enemigos
        // En Java usas: for(int i=0... size) { remove(i); i--; }
        // En JS iterar hacia atrás es la forma segura de hacer lo mismo sin saltar índices
        for (let i = listaEnemigos.length - 1; i >= 0; i--) {
            if (listaEnemigos[i].getVida() <= 0) {
                // Limpiar referencia visual en grid
                let e = listaEnemigos[i];
                if (grid[e.posY][e.posX] === e) grid[e.posY][e.posX] = null;
                listaEnemigos.splice(i, 1);
            }
        }

        // Limpiar aliados
        for (let i = listaAliados.length - 1; i >= 0; i--) {
            if (listaAliados[i].getVida() <= 0) {
                let a = listaAliados[i];
                if (grid[a.posY][a.posX] === a) grid[a.posY][a.posX] = null;
                listaAliados.splice(i, 1);
            }
        }
    }
};

// --- RENDERIZADO VISUAL (CANVAS) ---
function redibujarMapa() {
    // Limpiar canvas
    UI.ctx.clearRect(0, 0, UI.canvas.width, UI.canvas.height);

    const dibujarEntidad = (entidad, color, tipo) => {
        let x = entidad.getPosX() * GAME_CONFIG.CELL_SIZE;
        let y = entidad.getPosY() * GAME_CONFIG.CELL_SIZE;
        let vidaPct = entidad.getVida() / 100;

        UI.ctx.fillStyle = color;
        // Efecto Neon simple
        UI.ctx.shadowBlur = 10; 
        UI.ctx.shadowColor = color;

        if (tipo === 'obstaculo') {
            UI.ctx.fillRect(x + 2, y + 2, 16, 16);
        } else if (tipo === 'aliado') {
            UI.ctx.globalAlpha = vidaPct < 0.3 ? 0.3 : vidaPct; // Feedback visual de daño
            UI.ctx.beginPath();
            UI.ctx.arc(x + 10, y + 10, 7, 0, Math.PI * 2);
            UI.ctx.fill();
        } else if (tipo === 'enemigo') {
            UI.ctx.globalAlpha = vidaPct < 0.3 ? 0.3 : vidaPct;
            // Dibujar X
            UI.ctx.lineWidth = 3;
            UI.ctx.strokeStyle = color;
            UI.ctx.beginPath();
            UI.ctx.moveTo(x + 4, y + 4);
            UI.ctx.lineTo(x + 16, y + 16);
            UI.ctx.moveTo(x + 16, y + 4);
            UI.ctx.lineTo(x + 4, y + 16);
            UI.ctx.stroke();
        } else if (tipo === 'curandero') {
            // Dibujar cruz +
            UI.ctx.fillRect(x + 8, y + 3, 4, 14);
            UI.ctx.fillRect(x + 3, y + 8, 14, 4);
        }

        UI.ctx.globalAlpha = 1.0;
        UI.ctx.shadowBlur = 0;
    };

    listas.obstaculos.forEach(o => dibujarEntidad(o, '#f59e0b', 'obstaculo')); // Amarillo
    listas.aliados.forEach(a => dibujarEntidad(a, '#10b981', 'aliado'));       // Verde
    listas.enemigos.forEach(e => dibujarEntidad(e, '#ef4444', 'enemigo'));     // Rojo
    listas.curanderos.forEach(c => dibujarEntidad(c, '#3b82f6', 'curandero')); // Azul
}

// --- BUCLE PRINCIPAL (App.java MAIN LOOP) ---
function gameLoop(timestamp) {
    if (!gameState.running) return;

    let elapsed = timestamp - gameState.lastTime;

    if (elapsed > GAME_CONFIG.renderSpeed) {
        if (!gameState.paused) {
            
            // 1. Enemigos persiguen
            for (let e of listas.enemigos) {
                e.Persigue(listas.aliados, GAME_CONFIG.ALTO, GAME_CONFIG.ANCHO, listas.enemigos, listas.obstaculos, listas.curanderos);
            }

            // 2. Aliados escapan
            for (let a of listas.aliados) {
                a.Escapa(listas.enemigos, GAME_CONFIG.ALTO, GAME_CONFIG.ANCHO, listas.aliados, listas.obstaculos, listas.curanderos);
            }

            // 3. Curanderos curan
            for (let c of listas.curanderos) {
                c.Cura(listas.aliados, GAME_CONFIG.ALTO, GAME_CONFIG.ANCHO, listas.enemigos, listas.obstaculos, listas.curanderos);
            }

            // 4. Colisiones
            let evento = MisFunciones.detectarYResolverColisiones(listas.enemigos, listas.aliados);
            if(evento !== "Esperando contacto...") UI.elements.msg.innerText = evento;

            // 5. Limpiar Muertos
            MisFunciones.limpiarMuertos(listas.enemigos, listas.aliados);

            // 6. Stats UI Update
            updateStats();

            // 7. Condiciones de victoria
            checkWinCondition();
        }
        
        redibujarMapa();
        gameState.lastTime = timestamp;
    }

    gameState.animFrame = requestAnimationFrame(gameLoop);
}

// --- SETUP & UTILS ---

function spawnEntities(Clase, cantidad, listaDestino) {
    let count = 0;
    while (count < cantidad) {
        let x = Math.floor(Math.random() * GAME_CONFIG.ANCHO);
        let y = Math.floor(Math.random() * GAME_CONFIG.ALTO);
        
        // MisFunciones.casillaVacia check (usando grid)
        if (grid[y][x] === null) {
            let entidad = new Clase(x, y);
            listaDestino.push(entidad);
            grid[y][x] = entidad;
            count++;
        }
    }
}

function initGame() {
    // Reset Grid
    grid = Array(GAME_CONFIG.ALTO).fill().map(() => Array(GAME_CONFIG.ANCHO).fill(null));
    listas = { obstaculos: [], enemigos: [], aliados: [], curanderos: [] };
    
    // Spawn exacto al Main de Java
    spawnEntities(Obstaculo, 50, listas.obstaculos);
    spawnEntities(Enemigo, 75, listas.enemigos);
    spawnEntities(Aliado, 75, listas.aliados);
    spawnEntities(Curandero, 5, listas.curanderos);
    
    UI.elements.msg.innerText = "Simulación inicializada.";
    gameState.running = true;
    gameState.paused = false;
    gameState.lastTime = 0;
    updateStats();
    
    requestAnimationFrame(gameLoop);
}

function updateStats() {
    UI.elements.aliados.innerText = listas.aliados.length;
    UI.elements.enemigos.innerText = listas.enemigos.length;
    UI.elements.curanderos.innerText = listas.curanderos.length;
    UI.elements.obstaculos.innerText = listas.obstaculos.length;
    
    let pctAliados = (listas.aliados.length / 75) * 100;
    let pctEnemigos = (listas.enemigos.length / 75) * 100;
    UI.elements.barAliados.style.width = `${pctAliados}%`;
    UI.elements.barEnemigos.style.width = `${pctEnemigos}%`;
}

function checkWinCondition() {
    if (listas.aliados.length === 0 && listas.enemigos.length === 0) {
        endGame("¡No queda nadie en pie! Empate");
    } else if (listas.aliados.length === 0) {
        endGame("¡Ganan los enemigos!");
        UI.elements.msg.style.color = '#ef4444';
    } else if (listas.enemigos.length === 0) {
        endGame("¡Ganan los aliados, a tope con la COPE!");
        UI.elements.msg.style.color = '#10b981';
    }
}

function endGame(msg) {
    gameState.running = false; // Detener loop lógico
    gameState.paused = true;
    UI.elements.msg.innerText = msg;
    cancelAnimationFrame(gameState.animFrame);
    redibujarMapa(); // Último frame estático
}

// --- EVENT LISTENERS UI ---
document.getElementById('btn-start').addEventListener('click', () => {
    // Leer config de selectores
    let speedVal = document.getElementById('sim-speed').value;
    GAME_CONFIG.renderSpeed = parseInt(speedVal);

    // Switch screens
    UI.screens.landing.classList.remove('active-section');
    UI.screens.landing.classList.add('hidden-section');
    setTimeout(() => {
        UI.screens.game.classList.remove('hidden-section');
        UI.screens.game.classList.add('active-section');
        initGame();
    }, 500);
});

document.getElementById('btn-pause').addEventListener('click', function() {
    gameState.paused = !gameState.paused;
    this.innerText = gameState.paused ? "Reanudar" : "Pausar";
});

document.getElementById('btn-reload').addEventListener('click', () => {
    cancelAnimationFrame(gameState.animFrame);
    initGame();
    UI.elements.msg.innerText = "Reiniciando...";
    UI.elements.msg.style.color = '#a1a1aa';
});

document.getElementById('btn-exit').addEventListener('click', () => {
    gameState.running = false;
    cancelAnimationFrame(gameState.animFrame);
    UI.screens.game.classList.remove('active-section');
    UI.screens.game.classList.add('hidden-section');
    setTimeout(() => {
        UI.screens.landing.classList.remove('hidden-section');
        UI.screens.landing.classList.add('active-section');
    }, 500);
});