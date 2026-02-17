export interface GameConfig {
    renderSpeed: number;
    showHealthBars: boolean;
    entityCounts: {
        allies: number;
        enemies: number;
        healers: number;
        obstacles: number;
    };
}

export interface GameStats {
    allies: number;
    enemies: number;
    healers: number;
    obstacles: number;
}

export interface LogEntry {
    id: number;
    timestamp: string;
    message: string;
    type: 'info' | 'combat' | 'system';
}

// Logic Types aligned with original Java/JS structure
export interface Entity {
    posX: number;
    posY: number;
    vida: number;
    getPosX: () => number;
    getPosY: () => number;
    setPosX: (x: number) => void;
    setPosY: (y: number) => void;
    getVida: () => number;
    setVida: (v: number) => void;
    modificarVida: (v: number) => void;
    getDistancia: (e: Entity) => number;
}
