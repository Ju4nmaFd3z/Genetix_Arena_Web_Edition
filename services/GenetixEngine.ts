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
    
    // Radiation mechanics
    falloutTicks = 0;
    MAX_FALLOUT = 40; // approx 8-10 seconds at 200ms

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
        this.falloutTicks = 0;
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

    // New Mechanic: Omega Protocol
    executeOmegaProtocol(): string[] {
        // 1. Heal all remaining allies
        this.listas.aliados.forEach(a => a.setVida(100));

        // 2. Destroy 80% of enemies
        const totalEnemies = this.listas.enemigos.length;
        const toDestroy = Math.floor(totalEnemies * 0.8);
        
        // Shuffle and slice to pick random victims
        const shuffled = [...this.listas.enemigos].sort(() => 0.5 - Math.random());
        const victims = shuffled.slice(0, toDestroy);

        victims.forEach(v => {
            v.setVida(0); // Mark for death
        });

        // Trigger Fallout
        this.falloutTicks = this.MAX_FALLOUT;

        // Clean up immediately
        MisFunciones.limpiarMuertos(this.listas.enemigos, this.listas.aliados, this.grid);

        return [
            `PROTOCOLO OMEGA EJECUTADO. ${toDestroy} HOSTILES ELIMINADOS. PRECAUCIÓN: NIEBLA RADIACTIVA.`,
            `PROTOCOLO OMEGA: NANOBOTS DE REPARACIÓN ACTIVADOS. INTEGRIDAD DE FLOTA ALIADA RESTAURADA AL 100%.`
        ];
    }

    update(): string | null {
        let evento: string | null = null;

        // Fallout Logic (Aggressive & Fast)
        if (this.falloutTicks > 0) {
            this.falloutTicks--;
            
            // 1. Enemy Damage (Severe Radiation Poisoning)
            // 70% chance per tick to damage enemies
            if (Math.random() > 0.3) {
                this.listas.enemigos.forEach(e => {
                     // Each enemy takes -5 HP
                    if (Math.random() > 0.4) e.modificarVida(-5); 
                });
            }

            // 2. Ally Damage (Residual Fallout - Friendly Fire)
            // 30% chance per tick to damage allies (Lower than before)
            if (Math.random() > 0.7) {
                this.listas.aliados.forEach(a => {
                    if (Math.random() > 0.7) a.modificarVida(-1); 
                });
            }

            if (this.falloutTicks % 15 === 0) {
                evento = "¡ALERTA! DAÑO ESTRUCTURAL POR RADIACIÓN.";
            }
        }

        // 1. Enemigos persiguen
        for (let e of this.listas.enemigos) {
            // Radiation Slowdown: Enemies struggle to move in fog
            // 60% chance to skip turn if fallout is active
            if (this.falloutTicks > 0 && Math.random() < 0.6) continue;

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
        let eventoColision = MisFunciones.detectarYResolverColisiones(this.listas.enemigos, this.listas.aliados);
        if (eventoColision) evento = eventoColision;

        // 5. Limpiar Muertos
        MisFunciones.limpiarMuertos(this.listas.enemigos, this.listas.aliados, this.grid);
        
        return evento;
    }

    draw(ctx: CanvasRenderingContext2D, config: GameConfig) {
        // Clear frame
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw Radiation Fog (Background) if active
        if (this.falloutTicks > 0) {
            const opacity = (this.falloutTicks / this.MAX_FALLOUT) * 0.4; // Max 0.4 opacity
            ctx.fillStyle = `rgba(255, 140, 0, ${opacity})`;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }

        const drawEntity = (entidad: Entity, color: string, type: string) => {
            // Calculate center of the cell for geometric drawing
            let cx = entidad.getPosX() * this.CELL_SIZE + (this.CELL_SIZE / 2);
            let cy = entidad.getPosY() * this.CELL_SIZE + (this.CELL_SIZE / 2);
            
            ctx.shadowBlur = 0;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            if (type === 'obstaculo') {
                // Structure: Tech Box with diagonal support
                const size = 16;
                const half = size / 2;
                
                ctx.fillStyle = 'rgba(245, 158, 11, 0.15)'; // Low opacity amber fill
                ctx.strokeStyle = '#f59e0b'; // Amber stroke
                ctx.lineWidth = 1;

                // Main Box
                ctx.fillRect(cx - half, cy - half, size, size);
                ctx.strokeRect(cx - half, cy - half, size, size);
                
                // Diagonal Detail
                ctx.beginPath();
                ctx.moveTo(cx - half, cy + half);
                ctx.lineTo(cx + half, cy - half);
                ctx.stroke();

            } else if (type === 'aliado') {
                // Ally: Tactical Drone Unit (Circle with Core)
                ctx.fillStyle = '#10b981'; // Emerald
                ctx.strokeStyle = '#10b981';
                
                // Inner Core
                ctx.beginPath();
                ctx.arc(cx, cy, 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Outer Shield Ring
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
                ctx.stroke();

            } else if (type === 'enemigo') {
                // Enemy: Aggressive Hunter (Razor Star)
                ctx.fillStyle = '#dc2626'; // Stronger Crimson Red
                ctx.strokeStyle = '#7f1d1d'; // Dark Blood Outline
                ctx.lineWidth = 1;
                
                const outer = 8.5;
                const inner = 2.5; // Very pinched center = sharp blades
                
                // Draw Sharp Star Shape
                ctx.beginPath();
                for(let i = 0; i < 8; i++) {
                    const radius = i % 2 === 0 ? outer : inner;
                    const angle = i * Math.PI / 4;
                    const x = cx + Math.cos(angle) * radius;
                    const y = cy + Math.sin(angle) * radius;
                    if(i===0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Core: Sharp Diamond (Deadly Eye)
                ctx.fillStyle = '#050505'; // Black
                ctx.beginPath();
                ctx.moveTo(cx, cy - 1.5);
                ctx.lineTo(cx + 1.5, cy);
                ctx.lineTo(cx, cy + 1.5);
                ctx.lineTo(cx - 1.5, cy);
                ctx.fill();

            } else if (type === 'curandero') {
                // Healer: Synaptic Medical Cross (Floating Segments)
                // "Less brute, more polished"
                ctx.shadowColor = '#3b82f6';
                ctx.shadowBlur = 4; // Soft glow to indicate energy
                ctx.fillStyle = '#3b82f6';
        
                const gap = 2; // Space from center
                const armLen = 5;
                const armWidth = 3;
        
                // Top Arm
                ctx.fillRect(cx - armWidth/2, cy - gap - armLen, armWidth, armLen);
                // Bottom Arm
                ctx.fillRect(cx - armWidth/2, cy + gap, armWidth, armLen);
                // Left Arm
                ctx.fillRect(cx - gap - armLen, cy - armWidth/2, armLen, armWidth);
                // Right Arm
                ctx.fillRect(cx + gap, cy - armWidth/2, armLen, armWidth);
        
                // Core (clean white dot)
                ctx.shadowBlur = 0; // Reset shadow for sharp core
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
                ctx.fill();
                
                // Faint Ring to unify the floating parts
                ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(cx, cy, 6, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Health Bars (HUD)
            if (config.showHealthBars && type !== 'obstaculo' && type !== 'curandero') {
                const hp = entidad.getVida();
                const barWidth = 14;
                const hpWidth = (hp / 100) * barWidth;
                const barY = cy - 10;
                
                // Background Bar
                ctx.fillStyle = '#111';
                ctx.fillRect(cx - barWidth/2, barY, barWidth, 3);
                
                // Health Level
                ctx.fillStyle = hp > 50 ? '#10b981' : hp > 25 ? '#f59e0b' : '#ef4444';
                ctx.fillRect(cx - barWidth/2, barY, hpWidth, 3);
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