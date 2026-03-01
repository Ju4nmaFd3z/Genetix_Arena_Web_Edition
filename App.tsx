import React, { useState, useEffect, useRef, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import ControlPanel from './components/ControlPanel';
import ConsoleLog from './components/ConsoleLog';
import { GenetixEngine } from './services/GenetixEngine';
import { GameConfig, GameStats, LogEntry } from './types';
import { Heart, ShieldAlert, Cross, Box, Trophy, AlertTriangle, RefreshCw, Activity, CheckCircle2, XCircle, Radiation, Target, Crosshair } from 'lucide-react';

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

// [AUDIO SYSTEM] - Volúmenes por defecto de cada pista
// Declarado fuera del componente para evitar recreación en cada render
const VOL = { landing: 0.5, battle: 0.4, result: 0.6 };

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

    // Explosion & Nuke State
    const [isExploding, setIsExploding] = useState(false);
    const [hasNukeBeenUsed, setHasNukeBeenUsed] = useState(false);
    const [targetCoordinates, setTargetCoordinates] = useState<{ x: number, y: number }[]>([]);

    // Visual Fallback Tracking (Synced with engine ticks manually via loop or state)
    // We use a simple boolean here for the overlay grain, the color tint is in canvas
    const [showFalloutGrain, setShowFalloutGrain] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<GenetixEngine>(new GenetixEngine());
    const lastTickRef = useRef<number>(0);
    const animationFrameRef = useRef<number>(0);

    // [GAME LOOP] - Ref para evitar stale closure en requestAnimationFrame.
    // loopRef.current se sobreescribe en cada render, así el RAF siempre
    // lee los valores más recientes de isRunning, config, etc.
    const loopRef = useRef<(timestamp: number) => void>(() => { });

    // [AUDIO SYSTEM] - Referencias para el sistema de sonido
    const landingAudioRef = useRef<HTMLAudioElement | null>(null);
    const gameAudioRef = useRef<HTMLAudioElement | null>(null);
    const alliesWinAudioRef = useRef<HTMLAudioElement | null>(null);
    const enemiesWinAudioRef = useRef<HTMLAudioElement | null>(null);
    const drawAudioRef = useRef<HTMLAudioElement | null>(null);
    const activeFadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isFirstRenderRef = useRef(true);
    const [isMuted, setIsMuted] = useState(true); // Default to muted

    // Ref to track previous entity counts to avoid unnecessary resets on other state changes (like Pause)
    const prevEntityCountsRef = useRef(config.entityCounts);

    // Logger Utility
    const addLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
        const newLog: LogEntry = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString('es-ES', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            message: msg,
            type
        };
        setLogs(prev => [...prev.slice(-49), newLog]); // Keep last 50
    }, []);

    // 1. Initialize Board (Setup without running)
    const initializeSystem = useCallback((autoTrigger = false) => {
        engineRef.current.init(config);
        setStats(engineRef.current.getStats());

        if (!autoTrigger) {
            setLogs([]); // Clear logs only on full manual reset
            setGameResult(null); // Clear result only on manual reset
        }

        // Important: We are ready, but NOT running yet
        setHasStarted(false);
        setIsRunning(false);
        setIsExploding(false);
        setHasNukeBeenUsed(false);
        setShowFalloutGrain(false);
        setTargetCoordinates([]);

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
        setGameResult(null); // Ensure result is cleared when starting
        setHasStarted(true);
        setIsRunning(true);
        addLog(">>> PROTOCOLO DE COMBATE INICIADO <<<", "combat");
    };

    // Trigger Omega Protocol with Animation Sequence
    const handleOmegaProtocol = () => {
        if (isExploding || hasNukeBeenUsed) return;

        // 1. Start Sequence: targeting and countdown (0s)
        setIsRunning(false);
        setIsExploding(true);
        setHasNukeBeenUsed(true);
        // Ensure targets are clear at start
        setTargetCoordinates([]);

        addLog("⚠ ALERTA: SECUENCIA OMEGA INICIADA. T-MINUS 3...", "system");

        // Sequence Countdown
        setTimeout(() => addLog("⚠ T-MINUS 2...", "system"), 1000);
        setTimeout(() => addLog("⚠ T-MINUS 1...", "system"), 2000);

        // 3. The "Boom" moment (3.0 seconds later)
        setTimeout(() => {
            // EXECUTE PROTOCOL FIRST (Eliminates 80%)
            const msgs = engineRef.current.executeOmegaProtocol();

            // CAPTURE REMAINING SURVIVORS for targeting
            const survivors = engineRef.current.listas.enemigos.map(e => ({ x: e.posX, y: e.posY }));

            // Visual Update immediately at the boom
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) engineRef.current.draw(ctx, config);

            setStats(engineRef.current.getStats());
            setShowFalloutGrain(true);

            // Log messages
            if (Array.isArray(msgs)) {
                setTimeout(() => { if (msgs[0]) addLog(msgs[0], "combat"); }, 2000);
                setTimeout(() => { if (msgs[1]) addLog(msgs[1], "combat"); }, 4000);
            }

            // 3.5. SHOW TARGETS (Delayed slightly after the boom flash starts fading)
            // T+5.0s (2s after boom)
            setTimeout(() => {
                setTargetCoordinates(survivors); // Show ALL remaining enemies
            }, 2000);

        }, 3000);

        // 4. Resume Game (Extended wait to allow reading logs)
        // Resume at 9s (6s after explosion)
        setTimeout(() => {
            setIsExploding(false);
            setTargetCoordinates([]); // Clear HUD

            // Check win condition immediately after dust settles
            const result = engineRef.current.checkWin();
            if (result) {
                setGameResult(result);
                setMissionId(Math.floor(Math.random() * 90000 + 10000).toString());
                addLog(`SIMULACIÓN FINALIZADA POST-DETONACIÓN.`, 'system');
            } else {
                setIsRunning(true); // Resume loop
            }
        }, 9000);

        // 5. Cleanup Fallout Grain
        setTimeout(() => {
            setShowFalloutGrain(false);
        }, 12000);
    };

    // [GAME LOOP] - Se asigna a loopRef.current en cada render.
    // Esto garantiza que el RAF siempre ejecute la versión actualizada
    // con los valores más recientes de isRunning y config (sin stale closure).
    loopRef.current = (timestamp: number) => {
        if (!isRunning) return;

        const engine = engineRef.current;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        if (timestamp - lastTickRef.current > config.renderSpeed) {

            const event = engine.update();
            if (event) addLog(event, 'combat');

            const result = engine.checkWin();
            if (result) {
                setGameResult(result);
                setMissionId(Math.floor(Math.random() * 90000 + 10000).toString());
                setIsRunning(false);
                addLog(`SIMULACIÓN FINALIZADA. RESULTADO: ${result}`, 'system');
                engine.draw(ctx, config);
                setStats(engine.getStats());
                return; // ← Corta aquí, no agenda el siguiente frame
            }

            engine.draw(ctx, config);
            setStats(engine.getStats());
            lastTickRef.current = timestamp;
        }

        animationFrameRef.current = requestAnimationFrame(loopRef.current);
    };

    // [AUDIO SYSTEM] - Inicializar pistas
    // NOTA: Archivos en /public/tracks/
    useEffect(() => {
        landingAudioRef.current = new Audio('/tracks/LandingTrack.mp3');
        landingAudioRef.current.loop = true;
        landingAudioRef.current.volume = VOL.landing;

        gameAudioRef.current = new Audio('/tracks/BattleTrack.mp3');
        gameAudioRef.current.loop = true;
        gameAudioRef.current.volume = VOL.battle;

        alliesWinAudioRef.current = new Audio('/tracks/AlliesWinTrack.mp3');
        alliesWinAudioRef.current.loop = false;
        alliesWinAudioRef.current.volume = VOL.result;

        enemiesWinAudioRef.current = new Audio('/tracks/EnemiesWinTrack.mp3');
        enemiesWinAudioRef.current.loop = false;
        enemiesWinAudioRef.current.volume = VOL.result;

        drawAudioRef.current = new Audio('/tracks/DrawTrack.mp3');
        drawAudioRef.current.loop = false;
        drawAudioRef.current.volume = VOL.result;

        return () => {
            stopFade();
            [landingAudioRef, gameAudioRef, alliesWinAudioRef, enemiesWinAudioRef, drawAudioRef]
                .forEach(r => r.current?.pause());
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps — Las referencias de audio son estables (useRef). Incluirlas causaría reinicializar el sistema de audio en cada render.

    // [AUDIO SYSTEM] - Cancela el fade activo (si lo hay)
    const stopFade = () => {
        if (activeFadeRef.current) {
            clearInterval(activeFadeRef.current);
            activeFadeRef.current = null;
        }
    };

    // [AUDIO SYSTEM] - Crossfade entre dos pistas
    // Cancela siempre el fade anterior antes de arrancar uno nuevo (evita race conditions)
    const crossfade = (
        outgoing: HTMLAudioElement,
        outgoingDefaultVol: number,
        incoming: HTMLAudioElement,
        incomingTargetVol: number
    ) => {
        stopFade();
        const STEPS = 30;
        const INTERVAL = 1500 / STEPS;
        const startVol = outgoing.volume; // Partir del volumen real actual

        incoming.currentTime = 0;
        incoming.volume = 0;
        incoming.play().catch(() => { });

        let step = 0;
        activeFadeRef.current = setInterval(() => {
            step++;
            const t = step / STEPS;
            outgoing.volume = Math.max(0, startVol * (1 - t));
            incoming.volume = Math.min(incomingTargetVol, incomingTargetVol * t);

            if (step >= STEPS) {
                stopFade();
                outgoing.pause();
                outgoing.volume = outgoingDefaultVol; // Restaurar para la próxima vez
            }
        }, INTERVAL);
    };

    // [AUDIO SYSTEM] - Botón mute
    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);

        if (newMuted) {
            stopFade();
            [landingAudioRef, gameAudioRef, alliesWinAudioRef, enemiesWinAudioRef, drawAudioRef]
                .forEach(r => r.current?.pause());
        } else {
            // Reanudar la pista que corresponde exactamente al estado actual
            if (view === 'landing') {
                landingAudioRef.current?.play().catch(() => { });
            } else if (gameResult === 'ALLIES_WIN') {
                alliesWinAudioRef.current?.play().catch(() => { });
            } else if (gameResult === 'ENEMIES_WIN') {
                enemiesWinAudioRef.current?.play().catch(() => { });
            } else if (gameResult !== null) {
                // Empate u otro resultado
                drawAudioRef.current?.play().catch(() => { });
            } else {
                gameAudioRef.current?.play().catch(() => { });
            }
        }
    };

    // [AUDIO SYSTEM] - Cambiar pista al cambiar de vista con crossfade
    useEffect(() => {
        // Saltar el primer render: sin interacción del usuario el navegador bloquea el play()
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return;
        }
        if (isMuted) return;

        const incoming = view === 'landing' ? landingAudioRef.current : gameAudioRef.current;
        const outgoing = view === 'landing' ? gameAudioRef.current : landingAudioRef.current;
        const incomingVol = view === 'landing' ? VOL.landing : VOL.battle;
        const outgoingDefVol = view === 'landing' ? VOL.battle : VOL.landing;

        if (!incoming || !outgoing) return;
        crossfade(outgoing, outgoingDefVol, incoming, incomingVol);
    }, [view]); // eslint-disable-line react-hooks/exhaustive-deps — crossfade y VOL son funciones/constantes estables declaradas fuera del ciclo de render. Incluir crossfade causaría un bucle infinito.

    // [AUDIO SYSTEM] - Pista de resultado: crossfade al aparecer tarjeta / limpieza al reiniciar
    useEffect(() => {
        if (isMuted) return;

        if (gameResult !== null) {
            // Seleccionar pista según resultado (cubre ALLIES_WIN, ENEMIES_WIN y cualquier otro = DRAW)
            const resultTrack =
                gameResult === 'ALLIES_WIN' ? alliesWinAudioRef.current :
                    gameResult === 'ENEMIES_WIN' ? enemiesWinAudioRef.current :
                        drawAudioRef.current;

            if (!resultTrack || !gameAudioRef.current) return;
            crossfade(gameAudioRef.current, VOL.battle, resultTrack, VOL.result);

        } else {
            // gameResult === null → reinicio
            // 1. Cancelar el fade en curso ANTES de tocar cualquier volumen
            stopFade();
            // 2. Parar pistas de resultado y restaurar sus volúmenes por defecto
            [alliesWinAudioRef, enemiesWinAudioRef, drawAudioRef].forEach(r => {
                r.current?.pause();
                if (r.current) {
                    r.current.currentTime = 0;
                    r.current.volume = VOL.result;
                }
            });
            // 3. Restaurar volumen de batalla, reiniciar desde el principio y reproducir
            if (gameAudioRef.current) {
                gameAudioRef.current.volume = VOL.battle;
                gameAudioRef.current.currentTime = 0;
                if (view === 'game') gameAudioRef.current.play().catch(() => { });
            }
        }
    }, [gameResult]); // eslint-disable-line react-hooks/exhaustive-deps — isMuted y view se leen como valores puntuales al dispararse el efecto, no como dependencias reactivas. Incluirlos causaría crossfades no deseados al pausar o cambiar vista.

    // React to running state
    useEffect(() => {
        if (isRunning) {
            animationFrameRef.current = requestAnimationFrame(loopRef.current);
        } else {
            cancelAnimationFrame(animationFrameRef.current);
            // Draw one last frame even if paused to update visuals
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) engineRef.current.draw(ctx, config);
        }
        return () => cancelAnimationFrame(animationFrameRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        // loopRef es un ref (referencia estable), no necesita estar en deps.
        // config se incluye para forzar redibujado cuando cambia showHealthBars.
    }, [isRunning, config]);

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
        setIsExploding(false);
        setShowFalloutGrain(false);
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
            return (
                <LandingPage
                    onStart={() => switchView('game', () => initializeSystem(false))}
                    isMuted={isMuted}
                    onToggleMute={toggleMute}
                />
            );
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

                        <div className={`
                            relative border border-space-border shadow-2xl shadow-black bg-black w-full max-w-[95%] aspect-[3/1] 
                            ${isExploding ? 'animate-omega-sequence' : 'animate-idle-drift'}
                        `}>
                            {/* Fallout Noise Grain (Controlled by React for fading) */}
                            {/* The Orange Tint is handled by Canvas draw() method for better perf/blending */}
                            <div className={`absolute inset-0 z-10 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none transition-opacity duration-[8000ms] ease-out ${showFalloutGrain ? 'opacity-30' : 'opacity-0'}`}></div>

                            {/* Corner Accents */}
                            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-space-ally"></div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-space-ally"></div>
                            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-space-ally"></div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-space-ally"></div>

                            <canvas
                                ref={canvasRef}
                                width={1500}
                                height={500}
                                className={`w-full h-full object-contain block transition-all duration-1000 ${showFalloutGrain ? 'sepia-[.2] contrast-110' : ''}`}
                            />

                            {/* OMEGA PROTOCOL EXPLOSION OVERLAY */}
                            {isExploding && (
                                <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none">
                                    {/* 1. Pre-Nuke: Red Siren Tint (0-3s) */}
                                    <div className="absolute inset-0 bg-red-600/20 animate-pulse mix-blend-overlay"></div>

                                    {/* 2. The Flash (3s-6s) */}
                                    <div className="absolute inset-0 bg-white animate-nuke-flash mix-blend-hard-light"></div>

                                    {/* 3. Shockwave Ring (3s) */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-[50px] h-[50px] rounded-full border-[50px] border-white animate-shockwave opacity-80"></div>
                                    </div>

                                    {/* 4. POST-NUKE TARGETING HUD (Appears at T+5s) */}
                                    {targetCoordinates.length > 0 && (
                                        <div className="absolute inset-0 z-50 animate-hud-cycle text-green-500 font-mono">
                                            {/* Green Night Vision Filter */}
                                            <div className="absolute inset-0 bg-green-900/10 mix-blend-overlay pointer-events-none"></div>

                                            {/* Scanlines for HUD */}
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,255,0,0.06),rgba(0,255,0,0.02),rgba(0,0,0,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none"></div>

                                            {/* Reticles */}
                                            {targetCoordinates.map((target, idx) => (
                                                <div
                                                    key={idx}
                                                    className="absolute w-20 h-20 flex items-center justify-center pointer-events-none"
                                                    style={{
                                                        // IMPORTANT: Adjusted logic to point to CENTER of cell
                                                        left: `${((target.x + 0.5) / 75) * 100}%`,
                                                        top: `${((target.y + 0.5) / 25) * 100}%`,
                                                        transform: 'translate(-50%, -50%)',
                                                    }}
                                                >
                                                    {/* Outer Ring Animation - Scale In */}
                                                    <div
                                                        className="absolute w-full h-full border border-green-500/20 rounded-full animate-[scale-in_0.3s_ease-out_forwards]"
                                                        style={{ animationDelay: `${idx * 0.05}s` }}
                                                    ></div>

                                                    {/* Spinning Dashed Ring (Slow) */}
                                                    <div className="absolute w-14 h-14 border border-dashed border-green-400/60 rounded-full animate-[spin_6s_linear_infinite]"></div>

                                                    {/* Inner Lock Ring (Rotating counter-clockwise Fast) */}
                                                    <div className="absolute w-10 h-10 border-t-2 border-b-2 border-green-500 rounded-full animate-[spin_3s_linear_infinite_reverse] shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>

                                                    {/* Center Target Point */}
                                                    <div className="absolute w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]"></div>

                                                    {/* Crosshair Lines */}
                                                    <div className="absolute w-full h-[1px] bg-green-500/20"></div>
                                                    <div className="absolute h-full w-[1px] bg-green-500/20"></div>

                                                    {/* Data Label */}
                                                    <div className="absolute top-1 left-12 bg-black/80 border border-green-500/50 p-1 backdrop-blur-sm min-w-[70px]">
                                                        <div className="text-[8px] text-green-400 font-mono flex justify-between items-center mb-0.5">
                                                            <span>LOCK</span>
                                                            <span className="text-red-500 font-bold animate-pulse">●</span>
                                                        </div>
                                                        <div className="text-[6px] text-green-600 font-mono tracking-wider">
                                                            ID: {idx.toString().padStart(3, '0')}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Centered Locking Text - Military Style */}
                                            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-end">
                                                <div className="bg-black/90 border border-green-500/50 text-green-500 px-8 py-2 font-mono flex flex-col items-center gap-1 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                                                    <div className="flex items-center gap-3 text-sm font-bold tracking-[0.2em]">
                                                        <Crosshair className="animate-spin-slow" size={16} />
                                                        <span>TARGET ACQUISITION</span>
                                                        <Crosshair className="animate-spin-slow" size={16} />
                                                    </div>
                                                    <div className="w-full h-[2px] bg-green-900 overflow-hidden">
                                                        <div className="h-full bg-green-500 w-full animate-[loading_2s_ease-in-out_infinite]"></div>
                                                    </div>
                                                    <div className="text-[8px] text-green-600 tracking-widest uppercase">
                                                        Scanning sector 7-G // Threat Level: CRITICAL
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 5. Warning Text - Initial Phase */}
                                    {targetCoordinates.length === 0 && (
                                        <div className="absolute top-10 left-0 right-0 flex justify-center animate-text-lifecycle">
                                            <div className="bg-red-600 text-black px-6 py-1 font-mono text-xl font-bold tracking-[0.5em] border-2 border-black shadow-[0_0_10px_rgba(220,38,38,0.8)] transform -skew-x-12">
                                                PROTOCOLO OMEGA INICIADO
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
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
                                        <div className="grid grid-cols-2 gap-px bg-space-border w-full border border-space-border">
                                            <div className="bg-space-dark p-3">
                                                <div className="text-[10px] text-gray-500 uppercase mb-1">Supervivientes</div>
                                                <div className="text-xl font-mono text-space-ally">{stats.allies}</div>
                                            </div>
                                            <div className="bg-space-dark p-3">
                                                <div className="text-[10px] text-gray-500 uppercase mb-1">Hostiles Rest.</div>
                                                <div className="text-xl font-mono text-space-enemy">{stats.enemies}</div>
                                            </div>
                                        </div>
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
                                    <ShieldAlert size={12} className="shrink-0" /> ALIADOS
                                </div>
                                <div className="text-xl md:text-2xl font-mono text-white leading-none">{stats.allies}</div>
                            </div>

                            <div className="bg-space-dark p-2 md:p-3 border border-space-border/50 flex flex-col justify-center">
                                <div className="text-space-enemy flex items-center gap-1.5 mb-1 text-[10px] md:text-xs font-bold truncate">
                                    <Cross size={12} className="rotate-45 shrink-0" /> ENEMIGOS
                                </div>
                                <div className="text-xl md:text-2xl font-mono text-white leading-none">{stats.enemies}</div>
                            </div>

                            <div className="bg-space-dark p-2 md:p-3 border border-space-border/50 flex flex-col justify-center">
                                <div className="text-space-healer flex items-center gap-1.5 mb-1 text-[10px] md:text-xs font-bold truncate">
                                    <Heart size={12} className="shrink-0" /> CURANDEROS
                                </div>
                                <div className="text-xl md:text-2xl font-mono text-white leading-none">{stats.healers}</div>
                            </div>

                            <div className="bg-space-dark p-2 md:p-3 border border-space-border/50 flex flex-col justify-center">
                                <div className="text-space-obstacle flex items-center gap-1.5 mb-1 text-[10px] md:text-xs font-bold truncate">
                                    <Box size={12} className="shrink-0" /> OBSTÁCULOS
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
                            isGameOver={!!gameResult}
                            setConfig={setConfig}
                            onTogglePause={() => setIsRunning(!isRunning)}
                            onReset={handleReset}
                            onStart={runSimulation}
                            onSetDefaults={() => setConfig(DEFAULT_CONFIG)}
                            onAbort={() => switchView('landing', () => setIsRunning(false))}
                            // New Props for Omega Protocol
                            // Omega Protocol se activa cuando quedan ≤3 aliados (umbral más robusto
                            // que exactamente 1, evita que la ventana se cierre si mueren en el mismo tick)
                            isEmergencyAvailable={stats.allies <= 3 && stats.enemies > 0}
                            isExploding={isExploding}
                            hasNukeBeenUsed={hasNukeBeenUsed}
                            onTriggerEmergency={handleOmegaProtocol}
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

                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0); }
                    100% { transform: translateX(100%); }
                }
                
                @keyframes nuke-flash {
                    0% { opacity: 0; background-color: #fff; }
                    20% { opacity: 1; background-color: #fff; }
                    100% { opacity: 0; }
                }

                @keyframes shockwave {
                    0% { transform: scale(0); opacity: 1; border-width: 100px; }
                    100% { transform: scale(4); opacity: 0; border-width: 0px; }
                }

                @keyframes omega-sequence {
                    /* CHARGING (0s - 3s) */
                    0% { transform: translate(0, 0); }
                    
                    /* Low Rumble */
                    5% { transform: translate(-1px, 1px); }
                    10% { transform: translate(1px, -1px); }
                    15% { transform: translate(-2px, 0); }
                    20% { transform: translate(2px, 0); }
                    25% { transform: translate(-1px, -1px); }
                    30% { transform: translate(1px, 1px); }
                    
                    /* Medium Rumble */
                    35% { transform: translate(-3px, 1px); }
                    40% { transform: translate(3px, -1px); }
                    45% { transform: translate(-3px, 0); }
                    50% { transform: translate(3px, 0); }
                    
                    /* High Rumble (Pre-ignition) */
                    55% { transform: translate(-5px, 2px); }
                    60% { transform: translate(5px, -2px); }
                    65% { transform: translate(-7px, 3px) rotate(-1deg); }
                    68% { transform: translate(7px, -3px) rotate(1deg); }
                    70% { transform: translate(-9px, 5px) rotate(-2deg) scale(0.98); } /* Compress */
                    72% { transform: translate(9px, -5px) rotate(2deg) scale(0.95); } /* Compress more */
                    74% { transform: translate(0, 0) scale(0.9); } /* Implode point */

                    /* DETONATION (3s mark = 75%) */
                    75% { transform: translate(-30px, 20px) rotate(-5deg) scale(1.1); }
                    
                    /* SHOCKWAVE */
                    76% { transform: translate(25px, -25px) rotate(5deg) scale(1.15); }
                    78% { transform: translate(-20px, 15px) rotate(-4deg) scale(1.1); }
                    80% { transform: translate(15px, -10px) rotate(4deg) scale(1.05); }
                    85% { transform: translate(-10px, 8px) rotate(-2deg) scale(1.02); }
                    90% { transform: translate(5px, -5px) rotate(1deg); }
                    95% { transform: translate(-2px, 2px); }
                    100% { transform: translate(0, 0); }
                }

                .animate-omega-sequence {
                    animation: omega-sequence 4s ease-in-out forwards;
                }

                @keyframes idle-drift {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(0.5px, 0.5px); }
                    50% { transform: translate(-0.5px, 0.5px); }
                    75% { transform: translate(0.5px, -0.5px); }
                }
                .animate-idle-drift {
                    animation: idle-drift 3s ease-in-out infinite;
                }

                @keyframes fade-out-delayed {
                    0% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }

                @keyframes text-lifecycle {
                    0% { opacity: 0; transform: translateY(-20px); }
                    10% { opacity: 1; transform: translateY(0); }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }

                .animate-text-lifecycle {
                    animation: text-lifecycle 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .animate-nuke-flash {
                    animation: nuke-flash 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                    animation-delay: 3s;
                }
                
                .animate-shockwave {
                    animation: shockwave 2s ease-out forwards;
                    animation-delay: 3s;
                }
                
                .animate-spin-slow {
                    animation: spin 10s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes scale-in {
                    0% { transform: scale(2); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }

                @keyframes hud-cycle {
                    0% { opacity: 0; }
                    10% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }
                .animate-hud-cycle {
                    animation: hud-cycle 4s ease-in-out forwards;
                }
            `}</style>
            {renderContent()}
        </div>
    );
};

export default App;