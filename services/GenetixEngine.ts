import { Entity, GameConfig } from "../types";

// --- CORE CLASSES ---

class Entidad implements Entity {
    posX: number;
    posY: number;
    vida: number;

    constructor(x: number, y: number) {
        this.posX = x;
        this.posY = y;
        this.vida = 100;
    }

    getPosX() { return this.posX; }
    getPosY() { return this.posY; }
    setPosX(x: number) { this.posX = x; }
    setPosY(y: number) { this.posY = y; }
    getVida() { return this.vida; }
    
    setVida(vida: number) {
        if (vida < 0) this.vida = 0;
        else if (vida > 100) this.vida = 100;
        else this.vida = vida;
    }

    modificarVida(cantidad: number) {
        this.setVida(this.vida + cantidad);
    }

    getDistancia(otraEntidad: Entity) {
        let dx = this.posX - otraEntidad.getPosX();
        let dy = this.posY - otraEntidad.getPosY();
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class Obstaculo extends Entidad {}

class Aliado extends Entidad {
    Escapa(listaEnemigos: Enemigo[], ALTO: number, ANCHO: number, grid: (Entity | null)[][]) {
        let enemigo: Enemigo | null = null;
        let distanciaMinima = Number.MAX_VALUE;

        for (let e of listaEnemigos) {
            let d = this.getDistancia(e);
            if (d < distanciaMinima) {
                distanciaMinima = d;
                enemigo = e;
            }
        }

        if (distanciaMinima > 3 || enemigo === null) return;

        let menorDistancia = 0;
        let mejorVx = 0;
        let mejorVy = 0;

        const DIRECCION_Y = [-1, -1, -1, 0, 0, 1, 1, 1];
        const DIRECCION_X = [-1, 0, 1, -1, 1, -1, 0, 1];

        for (let i = 0; i < 8; i++) {
            let nuevaX = this.getPosX() + DIRECCION_X[i];
            let nuevaY = this.getPosY() + DIRECCION_Y[i];

            if (MisFunciones.posicionValida(nuevaX, nuevaY, ALTO, ANCHO, grid)) {
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
            grid[this.posY][this.posX] = null; 
            this.setPosX(this.getPosX() + mejorVx);
            this.setPosY(this.getPosY() + mejorVy);
            grid[this.posY][this.posX] = this;
        }
    }
}

class Enemigo extends Entidad {
    Persigue(listaAliados: Aliado[], ALTO: number, ANCHO: number, grid: (Entity | null)[][]) {
        let objetivo: Aliado | null = null;
        let distanciaMinima = Number.MAX_VALUE;

        for (let a of listaAliados) {
            let d = this.getDistancia(a);
            if (d < distanciaMinima) {
                distanciaMinima = d;
                objetivo = a;
            }
        }

        if (objetivo === null) return;

        let mayorDistancia = Number.MAX_VALUE;
        let mejorVx = 0;
        let mejorVy = 0;

        const DIRECCION_Y = [-1, -1, -1, 0, 0, 1, 1, 1];
        const DIRECCION_X = [-1, 0, 1, -1, 1, -1, 0, 1];

        for (let i = 0; i < 8; i++) {
            let nuevaX = this.getPosX() + DIRECCION_X[i];
            let nuevaY = this.getPosY() + DIRECCION_Y[i];

            if (MisFunciones.posicionValida(nuevaX, nuevaY, ALTO, ANCHO, grid)) {
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

class Curandero extends Entidad {
    Cura(listaAliados: Aliado[], ALTO: number, ANCHO: number, grid: (Entity | null)[][]) {
        let aliadoMasHerido: Aliado | null = null;
        let menorVida = Number.MAX_VALUE;
        let distanciaAliadoMasHerido = Number.MAX_VALUE;

        for (let aliado of listaAliados) {
            let distancia = this.getDistancia(aliado);
            if (distancia <= 10 && aliado.getVida() < menorVida) {
                menorVida = aliado.getVida();
                aliadoMasHerido = aliado;
                distanciaAliadoMasHerido = distancia;
            }
        }

        if (aliadoMasHerido === null) return;

        if (distanciaAliadoMasHerido <= 1) {
            aliadoMasHerido.modificarVida(50);
            return;
        }

        let mayorDistancia = Number.MAX_VALUE;
        let mejorVx = 0;
        let mejorVy = 0;

        const DIRECCION_Y = [-1, -1, -1, 0, 0, 1, 1, 1];
        const DIRECCION_X = [-1, 0, 1, -1, 1, -1, 0, 1];

        for (let i = 0; i < 8; i++) {
            let nuevaX = this.getPosX() + DIRECCION_X[i];
            let nuevaY = this.getPosY() + DIRECCION_Y[i];

            if (MisFunciones.posicionValida(nuevaX, nuevaY, ALTO, ANCHO, grid)) {
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

const MisFunciones = {
    posicionValida: (xDestino: number, yDestino: number, ALTO: number, ANCHO: number, grid: (Entity | null)[][]) => {
        if ((xDestino < 0 || xDestino >= ANCHO) || (yDestino < 0 || yDestino >= ALTO)) {
            return false;
        }
        if (grid[yDestino][xDestino] !== null) {
            return false;
        }
        return true;
    },

    detectarYResolverColisiones: (listaEnemigos: Enemigo[], listaAliados: Aliado[]) => {
        let evento = null;
        
        for (let enemigo of listaEnemigos) {
            for (let aliado of listaAliados) {
                let diferenciaX = Math.abs(enemigo.getPosX() - aliado.getPosX());
                let diferenciaY = Math.abs(enemigo.getPosY() - aliado.getPosY());
                
                if ((diferenciaX === 0 && diferenciaY === 0) || 
                    (diferenciaX <= 1 && diferenciaY <= 1 && (diferenciaX + diferenciaY) <= 2)) {
                    
                    enemigo.modificarVida(-25);
                    aliado.modificarVida(-35);
                    evento = "Hostiles atacando fuerzas aliadas. Daño recibido.";
                }
            }
        }
        return evento;
    },

    limpiarMuertos: (listaEnemigos: Enemigo[], listaAliados: Aliado[], grid: (Entity | null)[][]) => {
        for (let i = listaEnemigos.length - 1; i >= 0; i--) {
            if (listaEnemigos[i].getVida() <= 0) {
                let e = listaEnemigos[i];
                if (grid[e.posY][e.posX] === e) grid[e.posY][e.posX] = null;
                listaEnemigos.splice(i, 1);
            }
        }

        for (let i = listaAliados.length - 1; i >= 0; i--) {
            if (listaAliados[i].getVida() <= 0) {
                let a = listaAliados[i];
                if (grid[a.posY][a.posX] === a) grid[a.posY][a.posX] = null;
                listaAliados.splice(i, 1);
            }
        }
    }
};

// --- GAME ENGINE WRAPPER ---

export class GenetixEngine {
    ANCHO = 75;
    ALTO = 25;
    CELL_SIZE = 20;

    grid: (Entity | null)[][] = [];
    listas = {
        obstaculos: [] as Obstaculo[],
        enemigos: [] as Enemigo[],
        aliados: [] as Aliado[],
        curanderos: [] as Curandero[]
    };

    constructor() {
        this.reset();
    }

    reset() {
        this.grid = Array(this.ALTO).fill(null).map(() => Array(this.ANCHO).fill(null));
        this.listas = {
            obstaculos: [],
            enemigos: [],
            aliados: [],
            curanderos: []
        };
    }

    init(config: GameConfig) {
        this.reset();
        this.spawnEntities(Obstaculo, config.entityCounts.obstacles, this.listas.obstaculos);
        this.spawnEntities(Enemigo, config.entityCounts.enemies, this.listas.enemigos);
        this.spawnEntities(Aliado, config.entityCounts.allies, this.listas.aliados);
        this.spawnEntities(Curandero, config.entityCounts.healers, this.listas.curanderos);
    }

    spawnEntities(Clase: any, cantidad: number, listaDestino: any[]) {
        let count = 0;
        let attempts = 0;
        while (count < cantidad && attempts < 10000) {
            attempts++;
            let x = Math.floor(Math.random() * this.ANCHO);
            let y = Math.floor(Math.random() * this.ALTO);
            
            if (this.grid[y][x] === null) {
                let entidad = new Clase(x, y);
                listaDestino.push(entidad);
                this.grid[y][x] = entidad;
                count++;
            }
        }
    }

    update(): string | null {
        // 1. Enemigos persiguen
        for (let e of this.listas.enemigos) {
            e.Persigue(this.listas.aliados, this.ALTO, this.ANCHO, this.grid);
        }

        // 2. Aliados escapan
        for (let a of this.listas.aliados) {
            a.Escapa(this.listas.enemigos, this.ALTO, this.ANCHO, this.grid);
        }

        // 3. Curanderos curan
        for (let c of this.listas.curanderos) {
            c.Cura(this.listas.aliados, this.ALTO, this.ANCHO, this.grid);
        }

        // 4. Colisiones
        let evento = MisFunciones.detectarYResolverColisiones(this.listas.enemigos, this.listas.aliados);

        // 5. Limpiar Muertos
        MisFunciones.limpiarMuertos(this.listas.enemigos, this.listas.aliados, this.grid);
        
        return evento;
    }

    draw(ctx: CanvasRenderingContext2D, config: GameConfig) {
        // Clear
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Grid Lines (Subtle)
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 0.5;
        // Optimization: Don't draw grid every frame if static background is used, but here we draw entities.

        const drawEntity = (entidad: Entity, color: string, type: string) => {
            let x = entidad.getPosX() * this.CELL_SIZE;
            let y = entidad.getPosY() * this.CELL_SIZE;
            
            ctx.fillStyle = color;
            ctx.shadowBlur = 0;

            if (type === 'obstaculo') {
                ctx.fillStyle = '#f59e0b'; // Amber
                ctx.fillRect(x + 2, y + 2, 16, 16);
            } else if (type === 'aliado') {
                ctx.fillStyle = '#10b981'; // Emerald
                ctx.beginPath();
                ctx.arc(x + 10, y + 10, 6, 0, Math.PI * 2);
                ctx.fill();
            } else if (type === 'enemigo') {
                ctx.strokeStyle = '#ef4444'; // Red
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x + 4, y + 4);
                ctx.lineTo(x + 16, y + 16);
                ctx.moveTo(x + 16, y + 4);
                ctx.lineTo(x + 4, y + 16);
                ctx.stroke();
            } else if (type === 'curandero') {
                ctx.fillStyle = '#3b82f6'; // Blue
                ctx.fillRect(x + 8, y + 4, 4, 12);
                ctx.fillRect(x + 4, y + 8, 12, 4);
            }

            // Health Bars
            if (config.showHealthBars && type !== 'obstaculo') {
                const hp = entidad.getVida();
                const barWidth = 16;
                const hpWidth = (hp / 100) * barWidth;
                
                // Bg
                ctx.fillStyle = '#333';
                ctx.fillRect(x + 2, y - 4, barWidth, 3);
                
                // Fg
                ctx.fillStyle = hp > 50 ? '#10b981' : hp > 25 ? '#eab308' : '#ef4444';
                ctx.fillRect(x + 2, y - 4, hpWidth, 3);
            }
        };

        this.listas.obstaculos.forEach(o => drawEntity(o, '', 'obstaculo'));
        this.listas.aliados.forEach(a => drawEntity(a, '', 'aliado'));
        this.listas.enemigos.forEach(e => drawEntity(e, '', 'enemigo'));
        this.listas.curanderos.forEach(c => drawEntity(c, '', 'curandero'));
    }

    getStats() {
        return {
            allies: this.listas.aliados.length,
            enemies: this.listas.enemigos.length,
            healers: this.listas.curanderos.length,
            obstacles: this.listas.obstaculos.length
        };
    }

    checkWin() {
        if (this.listas.aliados.length === 0 && this.listas.enemigos.length === 0) return 'DRAW';
        if (this.listas.aliados.length === 0) return 'ENEMIES_WIN';
        if (this.listas.enemigos.length === 0) return 'ALLIES_WIN';
        return null;
    }
}