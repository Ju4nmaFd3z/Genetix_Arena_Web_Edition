import React, { useState, useEffect, useRef, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import ControlPanel from './components/ControlPanel';
import ConsoleLog from './components/ConsoleLog';
import { GenetixEngine } from './services/GenetixEngine';
import { GameConfig, GameStats, LogEntry } from './types';
import { Heart, ShieldAlert, Cross, Box, ArrowLeft, Trophy, AlertTriangle, RefreshCw } from 'lucide-react';

// Default Config
const DEFAULT_CONFIG: GameConfig = {
    renderSpeed: 200,
    showHealthBars: true,
    entityCounts: {
        allies: 75,
        enemies: 75,
        healers: 5,
        obstacles: 50
    }
};

const App: React.FC = () => {
    const [view, setView] = useState<'landing' | 'game'>('landing');
    const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
    const [stats, setStats] = useState<GameStats>({ allies: 0, enemies: 0, healers: 0, obstacles: 0 });
    const [logs, setLogs] = useState<LogEntry[]>([]);
    
    // States for logic
    const [isRunning, setIsRunning] = useState(false);
    const [hasStarted, setHasStarted] = useState(false); // New state to track if game ever ran
    const [gameResult, setGameResult] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<GenetixEngine>(new GenetixEngine());
    const lastTickRef = useRef<number>(0);
    const animationFrameRef = useRef<number>(0);

    // Logger Utility
    const addLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
        const newLog: LogEntry = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString('es-ES', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
            message: msg,
            type
        };
        setLogs(prev => [...prev.slice(-49), newLog]); // Keep last 50
    }, []);

    // Initialize/Start Game
    const startGame = () => {
        engineRef.current.init(config);
        setStats(engineRef.current.getStats());
        setLogs([]);
        setGameResult(null);
        setHasStarted(true);
        addLog("Secuencia de simulación iniciada.", "system");
        addLog(`Entidades desplegadas: ${config.entityCounts.allies} Aliados, ${config.entityCounts.enemies} Enemigos.`, "info");
        setIsRunning(true);
    };

    // The Game Loop
    const loop = (timestamp: number) => {
        if (!isRunning) return;

        const engine = engineRef.current;
        const ctx = canvasRef.current?.getContext('2d');

        if (!ctx) return;

        // Logic Update Throttle
        if (timestamp - lastTickRef.current > config.renderSpeed) {
            
            // 1. Update Logic
            const event = engine.update();
            if (event) addLog(event, 'combat');

            // 2. Check Win
            const result = engine.checkWin();
            if (result) {
                setGameResult(result);
                setIsRunning(false);
                addLog(`SIMULACIÓN FINALIZADA. RESULTADO: ${result}`, 'system');
            }

            // 3. Update Visuals
            engine.draw(ctx, config);
            
            // 4. Update Stats State
            setStats(engine.getStats());

            lastTickRef.current = timestamp;
        }

        // Keep loop alive
        animationFrameRef.current = requestAnimationFrame(loop);
    };

    // React to running state
    useEffect(() => {
        if (isRunning) {
            animationFrameRef.current = requestAnimationFrame(loop);
        } else {
            cancelAnimationFrame(animationFrameRef.current);
            // Draw one last frame even if paused to update visuals
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) engineRef.current.draw(ctx, config);
        }
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [isRunning, config]);

    // Handle Reset
    const handleReset = () => {
        setIsRunning(false);
        setTimeout(() => {
            startGame();
        }, 50);
    };

    if (view === 'landing') {
        return <LandingPage onStart={() => {
            setView('game');
            // We don't auto-start here to let user see the "Iniciar" button context in panel, 
            // or we can auto-start. Per request "when no game has executed yet, button be Start".
            // Let's set initial state ready but not running to demonstrate the button logic, 
            // OR strictly follow flow. Let's start it immediately for better UX, 
            // but set hasStarted to true.
            startGame(); 
        }} />;
    }

    return (
        <div className="h-screen bg-space-black text-space-text font-sans flex flex-col md:flex-row overflow-hidden">
            
            {/* LEFT: Game Viewport */}
            <div className="flex-1 flex flex-col h-full relative order-2 md:order-1">
                
                {/* Header */}
                <header className="h-14 md:h-16 border-b border-space-border flex items-center justify-between px-4 md:px-6 bg-space-black z-20 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('landing')} className="text-gray-500 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold tracking-tighter text-white">GENETIX<span className="font-thin text-gray-400">ARENA</span></h1>
                            <span className="text-[10px] uppercase tracking-widest text-space-ally flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-space-ally animate-pulse' : 'bg-yellow-500'}`}></span>
                                {isRunning ? 'SISTEMA EN LÍNEA' : 'SISTEMA EN ESPERA'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Canvas Area */}
                <div className="flex-1 bg-space-dark relative flex items-center justify-center p-2 md:p-4 overflow-hidden">
                    {/* Decorative Grid Background */}
                    <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-10 pointer-events-none"></div>
                    
                    <div className="relative border border-space-border shadow-2xl shadow-black bg-black w-full max-w-[95%] aspect-[3/1]">
                        {/* Corner Accents */}
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-space-ally"></div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-space-ally"></div>
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-space-ally"></div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-space-ally"></div>
                        
                        <canvas 
                            ref={canvasRef} 
                            width={1500} 
                            height={500}
                            className="w-full h-full object-contain block"
                        />
                    </div>

                    {/* Modal Result Overlay */}
                    {gameResult && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                            <div className="bg-space-panel border border-space-border p-8 md:p-12 max-w-lg text-center shadow-2xl transform scale-100">
                                <div className="mb-6 flex justify-center">
                                    {gameResult === 'DRAW' ? (
                                        <AlertTriangle size={64} className="text-yellow-500" />
                                    ) : (
                                        <Trophy size={64} className={gameResult === 'ALLIES_WIN' ? 'text-space-ally' : 'text-space-enemy'} />
                                    )}
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter text-white mb-2">SIMULACIÓN FINALIZADA</h2>
                                <p className={`text-xl font-mono mb-8 uppercase tracking-widest ${
                                    gameResult === 'ALLIES_WIN' ? 'text-space-ally' : 
                                    gameResult === 'ENEMIES_WIN' ? 'text-space-enemy' : 'text-yellow-500'
                                }`}>
                                    {gameResult === 'ALLIES_WIN' ? 'VICTORIA ALIADA' : 
                                     gameResult === 'ENEMIES_WIN' ? 'VICTORIA ENEMIGA' : 'EMPATE TÁCTICO'}
                                </p>
                                <button 
                                    onClick={handleReset}
                                    className="bg-white text-black px-8 py-3 font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <RefreshCw size={16} /> Reiniciar Sistema
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Console */}
                <ConsoleLog logs={logs} />
            </div>

            {/* RIGHT: Dashboard Sidebar */}
            <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-space-border bg-space-black flex flex-col h-[35vh] md:h-full z-30 order-1 md:order-2 shrink-0">
                
                {/* Stats Header */}
                <div className="p-4 border-b border-space-border bg-space-panel">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-3 text-center md:text-left">TELEMETRÍA EN VIVO</span>
                    <div className="grid grid-cols-2 gap-2">
                        {/* Stat Card */}
                        <div className="bg-space-dark p-2 md:p-3 border border-space-border/50 flex flex-col justify-center">
                            <div className="text-space-ally flex items-center gap-1.5 mb-1 text-[10px] md:text-xs font-bold truncate">
                                <ShieldAlert size={12} className="shrink-0"/> ALIADOS
                            </div>
                            <div className="text-xl md:text-2xl font-mono text-white leading-none">{stats.allies}</div>
                        </div>

                        <div className="bg-space-dark p-2 md:p-3 border border-space-border/50 flex flex-col justify-center">
                            <div className="text-space-enemy flex items-center gap-1.5 mb-1 text-[10px] md:text-xs font-bold truncate">
                                <Cross size={12} className="rotate-45 shrink-0"/> ENEMIGOS
                            </div>
                            <div className="text-xl md:text-2xl font-mono text-white leading-none">{stats.enemies}</div>
                        </div>

                        <div className="bg-space-dark p-2 md:p-3 border border-space-border/50 flex flex-col justify-center">
                            <div className="text-space-healer flex items-center gap-1.5 mb-1 text-[10px] md:text-xs font-bold truncate">
                                <Heart size={12} className="shrink-0"/> CURANDEROS
                            </div>
                            <div className="text-xl md:text-2xl font-mono text-white leading-none">{stats.healers}</div>
                        </div>

                        <div className="bg-space-dark p-2 md:p-3 border border-space-border/50 flex flex-col justify-center">
                            <div className="text-space-obstacle flex items-center gap-1.5 mb-1 text-[10px] md:text-xs font-bold truncate">
                                <Box size={12} className="shrink-0"/> OBSTÁCULOS
                            </div>
                            <div className="text-xl md:text-2xl font-mono text-white leading-none">{stats.obstacles}</div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex-1 overflow-y-auto">
                    <ControlPanel 
                        config={config} 
                        isRunning={isRunning} 
                        hasStarted={hasStarted}
                        setConfig={setConfig} 
                        onTogglePause={() => setIsRunning(!isRunning)}
                        onReset={handleReset}
                        onStart={startGame}
                        onSetDefaults={() => setConfig(DEFAULT_CONFIG)}
                    />
                </div>
            </aside>
        </div>
    );
};

export default App;