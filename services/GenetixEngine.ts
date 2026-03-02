import { Entity, GameConfig, DetailedStats } from "../types";

// --- CORE CLASSES ---

class Entidad implements Entity {
    posX: number;
    posY: number;
    vida: number;
    creationTick: number;

    constructor(x: number, y: number, creationTick: number = 0) {
        this.posX = x;
        this.posY = y;
        this.vida = 100;
        this.creationTick = creationTick;
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
        const dx = this.posX - otraEntidad.getPosX();
        const dy = this.posY - otraEntidad.getPosY();
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class Obstaculo extends Entidad { }

class Aliado extends Entidad {
    Escapa(listaEnemigos: Enemigo[], ALTO: number, ANCHO: number, grid: (Entity | null)[][]) {
        let enemigo: Enemigo | null = null;
        let distanciaMinima = Number.MAX_VALUE;

        for (const e of listaEnemigos) {
            const d = this.getDistancia(e);
            if (d < distanciaMinima) {
                distanciaMinima = d;
                enemigo = e;
            }
        }

        if (distanciaMinima > 3 || enemigo === null) return;

        // Tracks the best escape distance found so far (we want to MAXIMIZE distance from enemy)
        let mejorDistanciaAlEjarse = 0;
        let mejorVx = 0;
        let mejorVy = 0;

        const DIRECCION_Y = [-1, -1, -1, 0, 0, 1, 1, 1];
        const DIRECCION_X = [-1, 0, 1, -1, 1, -1, 0, 1];

        for (let i = 0; i < 8; i++) {
            const nuevaX = this.getPosX() + DIRECCION_X[i];
            const nuevaY = this.getPosY() + DIRECCION_Y[i];

            if (MisFunciones.posicionValida(nuevaX, nuevaY, ALTO, ANCHO, grid)) {
                const posicionPrueba = new Entidad(nuevaX, nuevaY);
                const distancia = posicionPrueba.getDistancia(enemigo);

                if (distancia > mejorDistanciaAlEjarse) {
                    mejorDistanciaAlEjarse = distancia;
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

        for (const a of listaAliados) {
            const d = this.getDistancia(a);
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
            const nuevaX = this.getPosX() + DIRECCION_X[i];
            const nuevaY = this.getPosY() + DIRECCION_Y[i];

            if (MisFunciones.posicionValida(nuevaX, nuevaY, ALTO, ANCHO, grid)) {
                const posicionPrueba = new Entidad(nuevaX, nuevaY);
                const distancia = posicionPrueba.getDistancia(objetivo);

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
    Cura(listaAliados: Aliado[], ALTO: number, ANCHO: number, grid: (Entity | null)[][], onHeal: (amount: number) => void) {
        let aliadoMasHerido: Aliado | null = null;
        let menorVida = Number.MAX_VALUE;
        let distanciaAliadoMasHerido = Number.MAX_VALUE;

        for (const aliado of listaAliados) {
            const distancia = this.getDistancia(aliado);
            // Prefer ally with lowest HP within range; on HP tie, prefer the closer one
            if (distancia <= 10 && (
                aliado.getVida() < menorVida ||
                (aliado.getVida() === menorVida && distancia < distanciaAliadoMasHerido)
            )) {
                menorVida = aliado.getVida();
                aliadoMasHerido = aliado;
                distanciaAliadoMasHerido = distancia;
            }
        }

        if (aliadoMasHerido === null) return;

        if (distanciaAliadoMasHerido <= 1) {
            const oldHp = aliadoMasHerido.getVida();
            aliadoMasHerido.modificarVida(50);
            const healed = aliadoMasHerido.getVida() - oldHp;
            if (healed > 0) onHeal(healed);
            return;
        }

        // Tracks the minimum distance found so far (we want to APPROACH the injured ally)
        let menorDistanciaAlAliado = Number.MAX_VALUE;
        let mejorVx = 0;
        let mejorVy = 0;

        const DIRECCION_Y = [-1, -1, -1, 0, 0, 1, 1, 1];
        const DIRECCION_X = [-1, 0, 1, -1, 1, -1, 0, 1];

        for (let i = 0; i < 8; i++) {
            const nuevaX = this.getPosX() + DIRECCION_X[i];
            const nuevaY = this.getPosY() + DIRECCION_Y[i];

            if (MisFunciones.posicionValida(nuevaX, nuevaY, ALTO, ANCHO, grid)) {
                const posicionPrueba = new Entidad(nuevaX, nuevaY);
                const distancia = posicionPrueba.getDistancia(aliadoMasHerido);

                if (distancia < menorDistanciaAlAliado) {
                    menorDistanciaAlAliado = distancia;
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

// Visual Effect Class for Deaths
class DeathAnim {
    x: number;
    y: number;
    type: 'aliado' | 'enemigo';
    tick: number;
    maxTicks: number;

    constructor(x: number, y: number, type: 'aliado' | 'enemigo') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.tick = 0;
        this.maxTicks = 12; // Controls duration (12 ticks is smoother)
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

    // Stats Tracking
    currentTick = 0;
    totalAllyLifespan = 0;
    deadAlliesCount = 0;
    totalEnemyLifespan = 0;
    deadEnemiesCount = 0;
    damageDealtAllies = 0;
    damageDealtEnemies = 0;
    healingDone = 0;
    initialAllyCount = 0;

    grid: (Entity | null)[][] = [];
    listas = {
        obstaculos: [] as Obstaculo[],
        enemigos: [] as Enemigo[],
        aliados: [] as Aliado[],
        curanderos: [] as Curandero[],
        efectos: [] as DeathAnim[]
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
            curanderos: [],
            efectos: []
        };
        this.falloutTicks = 0;
        this.currentTick = 0;
        this.totalAllyLifespan = 0;
        this.deadAlliesCount = 0;
        this.totalEnemyLifespan = 0;
        this.deadEnemiesCount = 0;
        this.damageDealtAllies = 0;
        this.damageDealtEnemies = 0;
        this.healingDone = 0;
        this.initialAllyCount = 0;
    }

    init(config: GameConfig) {
        this.reset();
        this.initialAllyCount = config.entityCounts.allies;
        this.spawnEntities(Obstaculo, config.entityCounts.obstacles, this.listas.obstaculos);
        this.spawnEntities(Enemigo, config.entityCounts.enemies, this.listas.enemigos);
        this.spawnEntities(Aliado, config.entityCounts.allies, this.listas.aliados);
        this.spawnEntities(Curandero, config.entityCounts.healers, this.listas.curanderos);
    }

    spawnEntities<T extends Entidad>(Clase: new (x: number, y: number, tick: number) => T, cantidad: number, listaDestino: T[]) {
        let count = 0;
        let attempts = 0;
        while (count < cantidad && attempts < 10000) {
            attempts++;
            const x = Math.floor(Math.random() * this.ANCHO);
            const y = Math.floor(Math.random() * this.ALTO);

            if (this.grid[y][x] === null) {
                const entidad = new Clase(x, y, this.currentTick);
                listaDestino.push(entidad);
                this.grid[y][x] = entidad;
                count++;
            }
        }
    }

    // New Mechanic: Omega Protocol
    executeOmegaProtocol(): string[] {
        // 1. Heal all remaining allies
        this.listas.aliados.forEach(a => {
            const oldHp = a.getVida();
            a.setVida(100);
            this.healingDone += (100 - oldHp);
        });

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
        this.limpiarMuertos();

        return [
            `PROTOCOLO OMEGA EJECUTADO. ${toDestroy} HOSTILES ELIMINADOS. PRECAUCIÓN: NIEBLA RADIACTIVA.`,
            `PROTOCOLO OMEGA: NANOBOTS DE REPARACIÓN ACTIVADOS. INTEGRIDAD DE FLOTA ALIADA RESTAURADA AL 100%.`
        ];
    }

    detectarYResolverColisiones(): string | null {
        let evento = null;

        for (const enemigo of this.listas.enemigos) {
            for (const aliado of this.listas.aliados) {
                const diferenciaX = Math.abs(enemigo.getPosX() - aliado.getPosX());
                const diferenciaY = Math.abs(enemigo.getPosY() - aliado.getPosY());

                if ((diferenciaX === 0 && diferenciaY === 0) ||
                    (diferenciaX <= 1 && diferenciaY <= 1 && (diferenciaX + diferenciaY) <= 2)) {

                    enemigo.modificarVida(-25);
                    this.damageDealtAllies += 25;

                    aliado.modificarVida(-35);
                    this.damageDealtEnemies += 35;

                    evento = "Hostiles atacando fuerzas aliadas. Daño recibido.";
                }
            }
        }
        return evento;
    }

    limpiarMuertos() {
        for (let i = this.listas.enemigos.length - 1; i >= 0; i--) {
            if (this.listas.enemigos[i].getVida() <= 0) {
                let e = this.listas.enemigos[i];
                if (this.grid[e.posY][e.posX] === e) this.grid[e.posY][e.posX] = null;
                this.listas.efectos.push(new DeathAnim(e.posX, e.posY, 'enemigo')); // Add visual FX

                // Stats
                this.deadEnemiesCount++;
                this.totalEnemyLifespan += (this.currentTick - e.creationTick);

                this.listas.enemigos.splice(i, 1);
            }
        }

        for (let i = this.listas.aliados.length - 1; i >= 0; i--) {
            if (this.listas.aliados[i].getVida() <= 0) {
                let a = this.listas.aliados[i];
                if (this.grid[a.posY][a.posX] === a) this.grid[a.posY][a.posX] = null;
                this.listas.efectos.push(new DeathAnim(a.posX, a.posY, 'aliado')); // Add visual FX

                // Stats
                this.deadAlliesCount++;
                this.totalAllyLifespan += (this.currentTick - a.creationTick);

                this.listas.aliados.splice(i, 1);
            }
        }
    }

    update(): string | null {
        this.currentTick++;
        let evento: string | null = null;

        // Process Death Effects (Update Ticks)
        for (let i = this.listas.efectos.length - 1; i >= 0; i--) {
            this.listas.efectos[i].tick++;
            if (this.listas.efectos[i].tick >= this.listas.efectos[i].maxTicks) {
                this.listas.efectos.splice(i, 1);
            }
        }

        // Fallout Logic (Aggressive & Fast)
        if (this.falloutTicks > 0) {
            this.falloutTicks--;

            // 1. Enemy Damage (Severe Radiation Poisoning)
            // 70% chance per tick to damage enemies
            if (Math.random() > 0.3) {
                this.listas.enemigos.forEach(e => {
                    // Each enemy takes -5 HP
                    if (Math.random() > 0.4) {
                        e.modificarVida(-5);
                        this.damageDealtAllies += 5; // Count radiation as ally damage (system damage)
                    }
                });
            }

            // 2. Ally Damage (Residual Fallout - Friendly Fire)
            // 30% chance per tick to damage allies (Lower than before)
            if (Math.random() > 0.7) {
                this.listas.aliados.forEach(a => {
                    if (Math.random() > 0.7) {
                        a.modificarVida(-1);
                        this.damageDealtEnemies += 1; // Count as environmental damage against allies
                    }
                });
            }

            if (this.falloutTicks % 15 === 0) {
                evento = "¡ALERTA! DAÑO ESTRUCTURAL POR RADIACIÓN.";
            }
        }

        // 1. Enemigos persiguen
        for (const e of this.listas.enemigos) {
            // Radiation Slowdown: Enemies struggle to move in fog
            // 60% chance to skip turn if fallout is active
            if (this.falloutTicks > 0 && Math.random() < 0.6) continue;

            e.Persigue(this.listas.aliados, this.ALTO, this.ANCHO, this.grid);
        }

        // 2. Aliados escapan
        for (const a of this.listas.aliados) {
            a.Escapa(this.listas.enemigos, this.ALTO, this.ANCHO, this.grid);
        }

        // 3. Curanderos curan
        for (const c of this.listas.curanderos) {
            c.Cura(this.listas.aliados, this.ALTO, this.ANCHO, this.grid, (amount) => {
                this.healingDone += amount;
            });
        }

        // 4. Colisiones
        const eventoColision = this.detectarYResolverColisiones();
        if (eventoColision) evento = eventoColision;

        // 5. Limpiar Muertos (This triggers new DeathAnims)
        this.limpiarMuertos();

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

        // --- DRAW DEATH EFFECTS (Updated for Elegance) ---
        this.listas.efectos.forEach(fx => {
            const cx = fx.x * this.CELL_SIZE + (this.CELL_SIZE / 2);
            const cy = fx.y * this.CELL_SIZE + (this.CELL_SIZE / 2);
            const progress = fx.tick / fx.maxTicks; // 0.0 to 1.0
            const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease out for smooth motion

            ctx.save();

            if (fx.type === 'enemigo') {
                // Enemy: "System Purge" - Digital Brackets Expanding
                const opacity = 1 - easeOut;
                ctx.strokeStyle = `rgba(239, 68, 68, ${opacity})`;
                ctx.lineWidth = 1.5;

                const dist = 5 + (easeOut * 10); // Expands from 5px to 15px
                const len = 4; // Corner length

                // Top Left Bracket
                ctx.beginPath();
                ctx.moveTo(cx - dist, cy - dist + len);
                ctx.lineTo(cx - dist, cy - dist);
                ctx.lineTo(cx - dist + len, cy - dist);
                ctx.stroke();

                // Top Right Bracket
                ctx.beginPath();
                ctx.moveTo(cx + dist - len, cy - dist);
                ctx.lineTo(cx + dist, cy - dist);
                ctx.lineTo(cx + dist, cy - dist + len);
                ctx.stroke();

                // Bottom Left Bracket
                ctx.beginPath();
                ctx.moveTo(cx - dist, cy + dist - len);
                ctx.lineTo(cx - dist, cy + dist);
                ctx.lineTo(cx - dist + len, cy + dist);
                ctx.stroke();

                // Bottom Right Bracket
                ctx.beginPath();
                ctx.moveTo(cx + dist - len, cy + dist);
                ctx.lineTo(cx + dist, cy + dist);
                ctx.lineTo(cx + dist, cy + dist - len);
                ctx.stroke();

                // Core Glitch Dot (disappears very fast)
                if (progress < 0.2) {
                    ctx.fillStyle = `rgba(239, 68, 68, ${1 - (progress * 5)})`;
                    ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3);
                }

            } else {
                // Ally: "Signal Lost" - Thin, smooth emerald ripples
                const opacity = 1 - progress;
                ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
                ctx.lineWidth = 1;

                // Main Expanding Ring
                const maxRadius = this.CELL_SIZE * 0.9;
                const currentRadius = 3 + (easeOut * maxRadius);

                ctx.beginPath();
                ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
                ctx.stroke();

                // Secondary Echo Ring (Lagging behind slightly)
                if (progress > 0.1) {
                    const echoRadius = 2 + ((easeOut - 0.1) * maxRadius * 0.8);
                    ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.5})`;
                    ctx.beginPath();
                    ctx.arc(cx, cy, echoRadius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            ctx.restore();
        });


        const drawEntity = (entidad: Entity, color: string, type: string) => {
            // Calculate center of the cell for geometric drawing
            const cx = entidad.getPosX() * this.CELL_SIZE + (this.CELL_SIZE / 2);
            const cy = entidad.getPosY() * this.CELL_SIZE + (this.CELL_SIZE / 2);

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
                // Ally: Tactical Drone Unit (Matches Landing Page SVG exactly)
                // SVG Ref: Outer R=42, Stroke=12. Inner R=22.
                // Canvas Scale: Base size ~6.5px radius

                const outerRadius = 6.5;
                const strokeWidth = 1.85; // (12/42) * 6.5
                const innerRadius = 3.4;  // (22/42) * 6.5

                ctx.fillStyle = '#10b981'; // Emerald 500
                ctx.strokeStyle = '#10b981';

                // Inner Core
                ctx.beginPath();
                ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
                ctx.fill();

                // Outer Shield Ring
                ctx.lineWidth = strokeWidth;
                ctx.beginPath();
                ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
                ctx.stroke();

            } else if (type === 'enemigo') {
                // Enemy: Aggressive Hunter (Matches Landing Page SVG exactly)
                // SVG Ref: 4-pointed star. Outer R=10, Inner R=3.5.

                ctx.fillStyle = '#dc2626'; // Red 600
                ctx.strokeStyle = '#7f1d1d'; // Dark Blood Outline
                ctx.lineWidth = 1;

                const outer = 8.5;
                const inner = 3.0; // (3.5/10) * 8.5

                // Draw Sharp 4-Pointed Star
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    // Even indices are tips (outer), Odd indices are valleys (inner)
                    const radius = i % 2 === 0 ? outer : inner;
                    const angle = (i * Math.PI / 4) - (Math.PI / 2); // Rotate -90deg to point up
                    const x = cx + Math.cos(angle) * radius;
                    const y = cy + Math.sin(angle) * radius;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Core: Sharp Diamond (Deadly Eye)
                const coreSize = 1.3; // (1.5/10) * 8.5
                ctx.fillStyle = '#000000'; // Black
                ctx.beginPath();
                ctx.moveTo(cx, cy - coreSize);
                ctx.lineTo(cx + coreSize, cy);
                ctx.lineTo(cx, cy + coreSize);
                ctx.lineTo(cx - coreSize, cy);
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
                ctx.fillRect(cx - armWidth / 2, cy - gap - armLen, armWidth, armLen);
                // Bottom Arm
                ctx.fillRect(cx - armWidth / 2, cy + gap, armWidth, armLen);
                // Left Arm
                ctx.fillRect(cx - gap - armLen, cy - armWidth / 2, armLen, armWidth);
                // Right Arm
                ctx.fillRect(cx + gap, cy - armWidth / 2, armLen, armWidth);

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
                ctx.fillRect(cx - barWidth / 2, barY, barWidth, 3);

                // Health Level
                ctx.fillStyle = hp > 50 ? '#10b981' : hp > 25 ? '#f59e0b' : '#ef4444';
                ctx.fillRect(cx - barWidth / 2, barY, hpWidth, 3);
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

    getDetailedStats(): DetailedStats {
        const avgAllyLifespan = this.deadAlliesCount > 0
            ? (this.totalAllyLifespan / this.deadAlliesCount).toFixed(1)
            : "N/A";

        const avgEnemyLifespan = this.deadEnemiesCount > 0
            ? (this.totalEnemyLifespan / this.deadEnemiesCount).toFixed(1)
            : "N/A";

        const survivalRate = this.initialAllyCount > 0
            ? ((this.listas.aliados.length / this.initialAllyCount) * 100).toFixed(1) + "%"
            : "0%";

        return {
            averageAllyLifespan: avgAllyLifespan,
            averageEnemyLifespan: avgEnemyLifespan,
            totalDamageDealtByAllies: this.damageDealtAllies,
            totalDamageDealtByEnemies: this.damageDealtEnemies,
            totalHealingDone: this.healingDone,
            survivalRate: survivalRate
        };
    }

    checkWin() {
        if (this.listas.aliados.length === 0 && this.listas.enemigos.length === 0) return 'DRAW';
        if (this.listas.aliados.length === 0) return 'ENEMIES_WIN';
        if (this.listas.enemigos.length === 0) return 'ALLIES_WIN';
        return null;
    }
}