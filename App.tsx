import React, { useState, useEffect, useRef, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import ControlPanel from './components/ControlPanel';
import ConsoleLog from './components/ConsoleLog';
import { GenetixEngine } from './services/GenetixEngine';
import { GameConfig, GameStats, LogEntry } from './types';
import { Heart, ShieldAlert, Cross, Box, Trophy, AlertTriangle, RefreshCw, Activity, CheckCircle2, XCircle } from 'lucide-react';

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
    const [opacity, setOpacity] = useState(1); // State for transition opacity
    const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
    const [stats, setStats] = useState<GameStats>({ allies: 0, enemies: 0, healers: 0, obstacles: 0 });
    const [logs, setLogs] = useState<LogEntry[]>([]);
    
    // States for logic
    const [isRunning, setIsRunning] = useState(false);
    const [hasStarted, setHasStarted] = useState(false); // New state to track if game ever ran
    const [gameResult, setGameResult] = useState<string | null>(null);
    const [missionId, setMissionId] = useState<string>('00000');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<GenetixEngine>(new GenetixEngine());
    const lastTickRef = useRef<number>(0);
    const animationFrameRef = useRef<number>(0);
    
    // Ref to track previous entity counts to avoid unnecessary resets on other state changes (like Pause)
    const prevEntityCountsRef = useRef(config.entityCounts);

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

    // 1. Initialize Board (Setup without running)
    const initializeSystem = useCallback((autoTrigger = false) => {
        engineRef.current.init(config);
        setStats(engineRef.current.getStats());
        if (!autoTrigger) setLogs([]); // Clear logs only on full manual reset
        setGameResult(null);
        
        // Important: We are ready, but NOT running yet
        setHasStarted(false); 
        setIsRunning(false);
        
        if (autoTrigger) {
            addLog(`Reconfiguración detectada. ${config.entityCounts.allies} Aliados vs ${config.entityCounts.enemies} Hostiles.`, "system");
        } else {
            addLog("Sistemas tácticos cargados. Esperando confirmación manual.", "system");
            addLog(`Unidades desplegadas: ${config.entityCounts.allies} Aliados, ${config.entityCounts.enemies} Enemigos.`, "info");
        }

        // Force initial draw
        setTimeout(() => {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) engineRef.current.draw(ctx, config);
        }, 50);
    }, [config, addLog]);

    // 2. Actually Start the Loop (Triggered by button)
    const runSimulation = () => {
        setHasStarted(true);
        setIsRunning(true);
        addLog(">>> PROTOCOLO DE COMBATE INICIADO <<<", "combat");
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
                setMissionId(Math.floor(Math.random() * 90000 + 10000).toString());
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
    }, [isRunning, config]); // config dependency ensures redraw on toggle changes (health bars)

    // Auto-Restart on Entity Config Change
    useEffect(() => {
        // Only trigger if entity counts have actually changed by reference
        // This prevents the effect from running when pausing/resuming or changing view
        if (config.entityCounts === prevEntityCountsRef.current) return;
        
        // Update ref for next comparison
        prevEntityCountsRef.current = config.entityCounts;

        if (view === 'game') {
            const timer = setTimeout(() => {
                initializeSystem(true);
            }, 500); // 500ms debounce to wait for user to finish sliding
            return () => clearTimeout(timer);
        }
    }, [config.entityCounts, view, initializeSystem]);

    // Handle Reset (Go back to Ready state)
    const handleReset = () => {
        setIsRunning(false);
        setTimeout(() => {
            initializeSystem(false);
        }, 50);
    };

    // Handle View Transition
    const switchView = (targetView: 'landing' | 'game', callback?: () => void) => {
        setOpacity(0);
        setTimeout(() => {
            setView(targetView);
            if (callback) callback();
            setTimeout(() => setOpacity(1), 50);
        }, 500); // 500ms fade out duration
    };

    const getResultStyles = () => {
        switch (gameResult) {
            case 'ALLIES_WIN':
                return {
                    borderColor: 'border-space-ally',
                    textColor: 'text-space-ally',
                    glow: 'shadow-[0_0_50px_-12px_rgba(16,185,129,0.5)]',
                    title: 'VICTORIA ALIADA',
                    icon: <CheckCircle2 size={80} className="text-space-ally drop-shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-bounce" />,
                    bgGradient: 'from-green-900/20 to-black'
                };
            case 'ENEMIES_WIN':
                return {
                    borderColor: 'border-space-enemy',
                    textColor: 'text-space-enemy',
                    glow: 'shadow-[0_0_50px_-12px_rgba(239,68,68,0.5)]',
                    title: 'VICTORIA HOSTIL',
                    icon: <XCircle size={80} className="text-space-enemy drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />,
                    bgGradient: 'from-red-900/20 to-black'
                };
            default:
                return {
                    borderColor: 'border-yellow-500',
                    textColor: 'text-yellow-500',
                    glow: 'shadow-[0_0_50px_-12px_rgba(234,179,8,0.5)]',
                    title: 'EMPATE TÁCTICO',
                    icon: <AlertTriangle size={80} className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />,
                    bgGradient: 'from-yellow-900/20 to-black'
                };
        }
    };

    const renderContent = () => {
        if (view === 'landing') {
            return <LandingPage onStart={() => switchView('game', () => initializeSystem(false))} />;
        }

        const resultStyles = gameResult ? getResultStyles() : null;

        return (
            <div className="h-screen bg-space-black text-space-text font-sans flex flex-col md:flex-row overflow-hidden">
                
                {/* LEFT: Game Viewport */}
                <div className="flex-1 flex flex-col h-full relative order-2 md:order-1">
                    
                    {/* Header */}
                    <header className="h-14 md:h-16 border-b border-space-border flex items-center justify-between px-4 md:px-6 bg-space-black z-20 shrink-0">
                        <div className="flex items-center gap-4">
                            {/* Back arrow removed */}
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
                        {gameResult && resultStyles && (
                            <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
                                <div className={`
                                    relative bg-space-panel border-2 ${resultStyles.borderColor} ${resultStyles.glow}
                                    w-full max-w-md shadow-2xl transform scale-100 overflow-hidden
                                `}>
                                    {/* Tech Background Pattern in Modal */}
                                    <div className={`absolute inset-0 bg-gradient-to-b ${resultStyles.bgGradient} opacity-50 pointer-events-none`}></div>
                                    <div className="absolute inset-0 bg-grid-pattern bg-[length:20px_20px] opacity-10 pointer-events-none"></div>

                                    {/* Modal Header */}
                                    <div className={`bg-black/40 border-b ${resultStyles.borderColor} border-opacity-30 p-4 flex justify-between items-center relative z-10`}>
                                        <div className="flex items-center gap-2">
                                            <Activity size={16} className={resultStyles.textColor} />
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">REPORTE DE MISIÓN</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-mono">ID: {missionId}</div>
                                    </div>

                                    {/* Modal Content */}
                                    <div className="p-8 flex flex-col items-center text-center relative z-10">
                                        <div className="mb-6">
                                            {resultStyles.icon}
                                        </div>
                                        
                                        <h2 className={`text-3xl md:text-4xl font-bold tracking-tighter ${resultStyles.textColor} mb-2 drop-shadow-md`}>
                                            {resultStyles.title}
                                        </h2>
                                        <p className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-8">
                                            Ciclo de simulación completado
                                        </p>

                                        {/* Stats Report Grid */}
                                        <div className="grid grid-cols-2 gap-px bg-space-border w-full mb-8 border border-space-border">
                                            <div className="bg-space-dark p-3">
                                                <div className="text-[10px] text-gray-500 uppercase mb-1">Supervivientes</div>
                                                <div className="text-xl font-mono text-space-ally">{stats.allies}</div>
                                            </div>
                                            <div className="bg-space-dark p-3">
                                                <div className="text-[10px] text-gray-500 uppercase mb-1">Hostiles Rest.</div>
                                                <div className="text-xl font-mono text-space-enemy">{stats.enemies}</div>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={handleReset}
                                            className={`
                                                group w-full bg-white text-black py-4 font-bold uppercase tracking-[0.15em] text-xs
                                                hover:bg-gray-200 transition-all flex items-center justify-center gap-3 relative overflow-hidden
                                            `}
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> 
                                                REINICIAR SISTEMA
                                            </span>
                                        </button>
                                    </div>

                                    {/* Scanline */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[10px] w-full animate-[scan_4s_linear_infinite] pointer-events-none opacity-20"></div>
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
                            onStart={runSimulation}
                            onSetDefaults={() => setConfig(DEFAULT_CONFIG)}
                            onAbort={() => switchView('landing', () => setIsRunning(false))}
                        />
                    </div>
                </aside>
            </div>
        );
    };

    return (
        <div 
            className="w-full h-full bg-space-black transition-opacity duration-500 ease-in-out"
            style={{ opacity: opacity }}
        >
            <style>{`
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(1000%); }
                }
            `}</style>
            {renderContent()}
        </div>
    );
};

export default App;