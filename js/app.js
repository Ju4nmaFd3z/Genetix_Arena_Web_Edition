/**
 * GENETIX ARENA - WEB EDITION v4.2 (Big Zoom & Full Fill)
 * Autor : Juanma Fdez
 */

// --- CONFIGURACIÓN DE UI & ESTADO GLOBAL ---
const GAME_CONFIG = {
    renderSpeed: 200, 
    quality: 'neon', 
    
    // --- CAMBIOS PARA AGRANDAR EL TABLERO ---
    // Antes: 75x25 (Formato muy ancho) con celdas de 20px
    // Ahora: 36x20 (Formato 16:9) con celdas de 40px (EL DOBLE DE GRANDE)
    ALTO: 20,
    ANCHO: 36,
    CELL_SIZE: 40, // Zoom x2
    
    colors: {
        grid: 'rgba(75, 85, 99, 0.2)', 
        hud: '#3b82f6',                
        scanline: 'rgba(0, 0, 0, 0.1)' 
    }
};

// --- GESTOR DE ASSETS ---
const SPRITES = {
    aliado: new Image(),
    enemigo: new Image(),
    curandero: new Image(),
    obstaculo: new Image()
};

SPRITES.aliado.src = 'assets/aliado.png';     
SPRITES.enemigo.src = 'assets/enemigo.png';   
SPRITES.curandero.src = 'assets/medico.png'; 
SPRITES.obstaculo.src = 'assets/obstaculo.png'; 

let assetsLoaded = 0;
const totalAssets = Object.keys(SPRITES).length;

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
        barEnemigos: document.getElementById('bar-enemigos'),
        header: document.querySelector('.top-bar'),
        btnStart: document.getElementById('btn-start') 
    },
    screens: {
        landing: document.getElementById('landing-section'),
        game: document.getElementById('game-section')
    }
};

UI.elements.btnStart.disabled = true;
UI.elements.btnStart.innerText = "CARGANDO ASSETS...";

function checkAssetsLoaded() {
    assetsLoaded++;
    if (assetsLoaded === totalAssets) {
        UI.elements.btnStart.disabled = false;
        UI.elements.btnStart.innerHTML = 'EJECUTAR SIMULACIÓN <span class="btn-glare"></span>';
    }
}

Object.values(SPRITES).forEach(img => {
    img.onload = checkAssetsLoaded;
    img.onerror = () => { console.warn("Fallo asset: " + img.src); checkAssetsLoaded(); };
});

// --- ESTRUCTURAS ---
let grid = []; 
let listas = { obstaculos: [], enemigos: [], aliados: [], curanderos: [] };
let gameState = { running: false, paused: false, lastTime: 0, animFrame: null };

// --- AJUSTE AUTOMÁTICO DE RESOLUCIÓN ---
// Esto asegura que el canvas tenga el tamaño exacto del grid configurado
function ajustarResolucionCanvas() {
    UI.canvas.width = GAME_CONFIG.ANCHO * GAME_CONFIG.CELL_SIZE;
    UI.canvas.height = GAME_CONFIG.ALTO * GAME_CONFIG.CELL_SIZE;
}

// --- CLASES ---
class Entidad {
    constructor(x, y) {
        this.posX = x; this.posY = y; this.vida = 100; this.angle = 0; 
    }
    getPosX() { return this.posX; }
    getPosY() { return this.posY; }
    setPosX(x) { this.posX = x; }
    setPosY(y) { this.posY = y; }
    getVida() { return this.vida; }
    setVida(vida) { this.vida = (vida < 0) ? 0 : (vida > 100) ? 100 : vida; }
    modificarVida(cantidad) { this.setVida(this.vida + cantidad); }

    getDistancia(otraEntidad) {
        let dx = this.posX - otraEntidad.getPosX();
        let dy = this.posY - otraEntidad.getPosY();
        return Math.sqrt(dx * dx + dy * dy);
    }
    actualizarRotacion(dx, dy) {
        if (dx !== 0 || dy !== 0) this.angle = Math.atan2(dy, dx) + (Math.PI / 2);
    }
}

class Obstaculo extends Entidad { constructor(x, y) { super(x, y); } }
class Aliado extends Entidad {
    constructor(x, y) { super(x, y); }
    Escapa(lE, ALTO, ANCHO, lA, lO, lC) {
        let enemigo = null; let dMin = Number.MAX_VALUE;
        for (let e of lE) {
            let d = this.getDistancia(e);
            if (d < dMin) { dMin = d; enemigo = e; }
        }
        if (dMin > 3 || enemigo === null) return;
        let bestD = 0; let bx = 0; let by = 0;
        const DY = [-1, -1, -1, 0, 0, 1, 1, 1];
        const DX = [-1, 0, 1, -1, 1, -1, 0, 1];
        for (let i = 0; i < 8; i++) {
            let nx = this.posX + DX[i]; let ny = this.posY + DY[i];
            if (MisFunciones.posicionValida(nx, ny, ALTO, ANCHO)) {
                let temp = new Entidad(nx, ny);
                let dist = temp.getDistancia(enemigo);
                if (dist > bestD) { bestD = dist; bx = DX[i]; by = DY[i]; }
            }
        }
        if (bx !== 0 || by !== 0) {
            grid[this.posY][this.posX] = null; 
            this.posX += bx; this.posY += by;
            this.actualizarRotacion(bx, by);
            grid[this.posY][this.posX] = this;
        }
    }
}

class Enemigo extends Entidad {
    constructor(x, y) { super(x, y); }
    Persigue(lA, ALTO, ANCHO, lE, lO, lC) {
        let obj = null; let dMin = Number.MAX_VALUE;
        for (let a of lA) {
            let d = this.getDistancia(a);
            if (d < dMin) { dMin = d; obj = a; }
        }
        if (obj === null) return;
        let bestD = Number.MAX_VALUE; let bx = 0; let by = 0;
        const DY = [-1, -1, -1, 0, 0, 1, 1, 1];
        const DX = [-1, 0, 1, -1, 1, -1, 0, 1];
        for (let i = 0; i < 8; i++) {
            let nx = this.posX + DX[i]; let ny = this.posY + DY[i];
            if (MisFunciones.posicionValida(nx, ny, ALTO, ANCHO)) {
                let temp = new Entidad(nx, ny);
                let dist = temp.getDistancia(obj);
                if (dist < bestD) { bestD = dist; bx = DX[i]; by = DY[i]; }
            }
        }
        if (bx !== 0 || by !== 0) {
            grid[this.posY][this.posX] = null;
            this.posX += bx; this.posY += by;
            this.actualizarRotacion(bx, by);
            grid[this.posY][this.posX] = this;
        }
    }
}

class Curandero extends Entidad {
    constructor(x, y) { super(x, y); }
    Cura(lA, ALTO, ANCHO, lE, lO, lC) {
        let herido = null; let minVid = Number.MAX_VALUE; let dHerido = Number.MAX_VALUE;
        for (let a of lA) {
            let d = this.getDistancia(a);
            if (d <= 10 && a.getVida() < minVid) { minVid = a.getVida(); herido = a; dHerido = d; }
        }
        if (herido === null) return;
        if (dHerido <= 1) { herido.modificarVida(50); return; }
        let bestD = Number.MAX_VALUE; let bx = 0; let by = 0;
        const DY = [-1, -1, -1, 0, 0, 1, 1, 1];
        const DX = [-1, 0, 1, -1, 1, -1, 0, 1];
        for (let i = 0; i < 8; i++) {
            let nx = this.posX + DX[i]; let ny = this.posY + DY[i];
            if (MisFunciones.posicionValida(nx, ny, ALTO, ANCHO)) {
                let temp = new Entidad(nx, ny);
                let dist = temp.getDistancia(herido);
                if (dist < bestD) { bestD = dist; bx = DX[i]; by = DY[i]; }
            }
        }
        if (bx !== 0 || by !== 0) {
            grid[this.posY][this.posX] = null;
            this.posX += bx; this.posY += by;
            this.actualizarRotacion(bx, by);
            grid[this.posY][this.posX] = this;
        }
    }
}

const MisFunciones = {
    posicionValida: (x, y, ALTO, ANCHO) => {
        if (x < 0 || x >= ANCHO || y < 0 || y >= ALTO) return false;
        if (grid[y][x] !== null) return false;
        return true;
    },
    detectarYResolverColisiones: (lE, lA) => {
        let msg = "SISTEMA OK. SIN NOVEDADES.";
        for (let e of lE) {
            for (let a of lA) {
                let dx = Math.abs(e.posX - a.posX);
                let dy = Math.abs(e.posY - a.posY);
                if ((dx === 0 && dy === 0) || (dx <= 1 && dy <= 1 && (dx + dy) <= 2)) {
                    e.modificarVida(-25); a.modificarVida(-35); 
                    msg = "⚠️ CONTACTO HOSTIL :: DAÑO MASIVO";
                }
            }
        }
        return msg;
    },
    limpiarMuertos: (lE, lA) => {
        for (let i = lE.length - 1; i >= 0; i--) {
            if (lE[i].getVida() <= 0) {
                if (grid[lE[i].posY][lE[i].posX] === lE[i]) grid[lE[i].posY][lE[i].posX] = null;
                lE.splice(i, 1);
            }
        }
        for (let i = lA.length - 1; i >= 0; i--) {
            if (lA[i].getVida() <= 0) {
                if (grid[lA[i].posY][lA[i].posX] === lA[i]) grid[lA[i].posY][lA[i].posX] = null;
                lA.splice(i, 1);
            }
        }
    }
};

// --- RENDERIZADO VISUAL ---
function drawGrid(ctx) {
    ctx.fillStyle = GAME_CONFIG.colors.grid; 
    const halfCell = GAME_CONFIG.CELL_SIZE / 2;
    for (let y = 0; y < GAME_CONFIG.ALTO; y++) {
        for (let x = 0; x < GAME_CONFIG.ANCHO; x++) {
            let cx = x * GAME_CONFIG.CELL_SIZE + halfCell;
            let cy = y * GAME_CONFIG.CELL_SIZE + halfCell;
            ctx.fillRect(cx - 1, cy - 1, 2, 2);
        }
    }
}

function drawHudOverlay(ctx, width, height) {
    ctx.strokeStyle = GAME_CONFIG.colors.hud;
    ctx.lineWidth = 3; // Línea más gruesa al hacer zoom
    ctx.lineCap = 'square';
    ctx.globalAlpha = 0.8; 

    const margin = 2; const len = 50;   

    ctx.beginPath();
    ctx.moveTo(margin, margin + len); ctx.lineTo(margin, margin); ctx.lineTo(margin + len, margin);
    ctx.moveTo(width - margin - len, margin); ctx.lineTo(width - margin, margin); ctx.lineTo(width - margin, margin + len);
    ctx.moveTo(width - margin, height - margin - len); ctx.lineTo(width - margin, height - margin); ctx.lineTo(width - margin - len, height - margin);
    ctx.moveTo(margin + len, height - margin); ctx.lineTo(margin, height - margin); ctx.lineTo(margin, height - margin - len);
    ctx.stroke();
    ctx.globalAlpha = 1.0; 
}

function redibujarMapa() {
    UI.ctx.clearRect(0, 0, UI.canvas.width, UI.canvas.height);
    drawGrid(UI.ctx);

    const dibujarSprite = (entidad, img, colorGlow, esEstatico) => {
        let cx = entidad.posX * GAME_CONFIG.CELL_SIZE + (GAME_CONFIG.CELL_SIZE / 2);
        let cy = entidad.posY * GAME_CONFIG.CELL_SIZE + (GAME_CONFIG.CELL_SIZE / 2);
        let vidaPct = entidad.vida / 100;
        
        if (GAME_CONFIG.quality === 'neon') {
            UI.ctx.shadowBlur = 15; UI.ctx.shadowColor = colorGlow;
        } else {
            UI.ctx.shadowBlur = 0;
        }

        UI.ctx.globalAlpha = vidaPct < 0.3 ? 0.5 : 1.0;
        UI.ctx.save();
        UI.ctx.translate(cx, cy);
        if (!esEstatico) UI.ctx.rotate(entidad.angle);

        // Ajuste tamaño sprite (dejamos 4px de margen en la celda de 40px)
        let size = GAME_CONFIG.CELL_SIZE - 4; 
        
        if (img.complete && img.naturalHeight !== 0) {
            UI.ctx.drawImage(img, -size/2, -size/2, size, size);
        } else {
            UI.ctx.fillStyle = colorGlow;
            UI.ctx.fillRect(-size/2, -size/2, size, size);
        }
        UI.ctx.restore();

        // Barra de vida más grande
        if (vidaPct < 1.0 && !esEstatico) {
            UI.ctx.shadowBlur = 0;
            UI.ctx.fillStyle = "rgba(0,0,0,0.8)";
            UI.ctx.fillRect(cx - 10, cy - 14, 20, 3);
            UI.ctx.fillStyle = vidaPct < 0.4 ? "#ef4444" : "#10b981";
            UI.ctx.fillRect(cx - 10, cy - 14, 20 * vidaPct, 3);
        }
        UI.ctx.globalAlpha = 1.0;
        UI.ctx.shadowBlur = 0;
    };

    listas.obstaculos.forEach(o => dibujarSprite(o, SPRITES.obstaculo, '#f59e0b', true)); 
    listas.curanderos.forEach(c => dibujarSprite(c, SPRITES.curandero, '#3b82f6', false)); 
    listas.aliados.forEach(a => dibujarSprite(a, SPRITES.aliado, '#10b981', false));     
    listas.enemigos.forEach(e => dibujarSprite(e, SPRITES.enemigo, '#ef4444', false));   
    drawHudOverlay(UI.ctx, UI.canvas.width, UI.canvas.height);
}

// --- BUCLE PRINCIPAL ---
function gameLoop(timestamp) {
    if (!gameState.running) return;
    let elapsed = timestamp - gameState.lastTime;
    if (elapsed > GAME_CONFIG.renderSpeed) {
        if (!gameState.paused) {
            for (let e of listas.enemigos) e.Persigue(listas.aliados, GAME_CONFIG.ALTO, GAME_CONFIG.ANCHO, listas.enemigos, listas.obstaculos, listas.curanderos);
            for (let a of listas.aliados) a.Escapa(listas.enemigos, GAME_CONFIG.ALTO, GAME_CONFIG.ANCHO, listas.aliados, listas.obstaculos, listas.curanderos);
            for (let c of listas.curanderos) c.Cura(listas.aliados, GAME_CONFIG.ALTO, GAME_CONFIG.ANCHO, listas.enemigos, listas.obstaculos, listas.curanderos);
            
            let evento = MisFunciones.detectarYResolverColisiones(listas.enemigos, listas.aliados);
            if(evento !== "SISTEMA OK. SIN NOVEDADES.") UI.elements.msg.innerText = evento;
            
            MisFunciones.limpiarMuertos(listas.enemigos, listas.aliados);
            updateStats();
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
        if (grid[y][x] === null) {
            let entidad = new Clase(x, y);
            entidad.angle = Math.floor(Math.random() * 4) * (Math.PI / 2); 
            listaDestino.push(entidad);
            grid[y][x] = entidad;
            count++;
        }
    }
}

function initGame() {
    // 1. Ajustar tamaño físico del canvas antes de nada
    ajustarResolucionCanvas();

    grid = Array(GAME_CONFIG.ALTO).fill().map(() => Array(GAME_CONFIG.ANCHO).fill(null));
    listas = { obstaculos: [], enemigos: [], aliados: [], curanderos: [] };
    
    // --- REDUCCIÓN DE CANTIDADES ---
    // Al tener menos casillas, bajamos el número de entidades para que no se atasquen
    spawnEntities(Obstaculo, 30, listas.obstaculos); // Antes 50
    spawnEntities(Enemigo, 30, listas.enemigos);     // Antes 75
    spawnEntities(Aliado, 30, listas.aliados);       // Antes 75
    spawnEntities(Curandero, 3, listas.curanderos);  // Antes 5
    
    UI.elements.msg.innerText = "SIMULACIÓN INICIADA.";
    gameState.running = true;
    gameState.paused = false;
    gameState.lastTime = 0;
    updateStats();
    redibujarMapa(); 
    requestAnimationFrame(gameLoop);
}

function updateStats() {
    // Actualizamos las barras basándonos en el nuevo máximo (30 unidades)
    UI.elements.aliados.innerText = listas.aliados.length;
    UI.elements.enemigos.innerText = listas.enemigos.length;
    UI.elements.curanderos.innerText = listas.curanderos.length;
    UI.elements.obstaculos.innerText = listas.obstaculos.length;
    
    let pctAliados = (listas.aliados.length / 30) * 100;
    let pctEnemigos = (listas.enemigos.length / 30) * 100;
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
        endGame("¡Ganan los aliados!");
        UI.elements.msg.style.color = '#10b981';
    }
}

function endGame(msg) {
    gameState.running = false; gameState.paused = true;
    UI.elements.msg.innerText = msg;
    cancelAnimationFrame(gameState.animFrame);
    redibujarMapa(); 
}

// --- EVENT LISTENERS ---
UI.elements.btnStart.addEventListener('click', () => {
    let speedVal = document.getElementById('sim-speed').value;
    GAME_CONFIG.renderSpeed = parseInt(speedVal);
    GAME_CONFIG.quality = document.getElementById('render-quality').value;

    UI.elements.header.classList.add('hide-border');
    UI.elements.header.classList.add('show-expand');
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
    this.innerText = gameState.paused ? "REANUDAR" : "PAUSA / REANUDAR";
});

document.getElementById('btn-reload').addEventListener('click', () => {
    cancelAnimationFrame(gameState.animFrame);
    initGame();
    UI.elements.msg.innerText = "REINICIANDO...";
    UI.elements.msg.style.color = '#8A8A93';
});

document.getElementById('btn-exit').addEventListener('click', () => {
    gameState.running = false;
    cancelAnimationFrame(gameState.animFrame);
    UI.elements.header.classList.remove('hide-border');
    UI.elements.header.classList.remove('show-expand');
    UI.screens.game.classList.remove('active-section'); 
    UI.screens.game.classList.add('hidden-section');
    setTimeout(() => { 
        UI.screens.landing.classList.remove('hidden-section'); 
        UI.screens.landing.classList.add('active-section'); 
    }, 500);
});