import React, { useState, useEffect, useRef, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import ControlPanel from './components/ControlPanel';
import ConsoleLog from './components/ConsoleLog';
import SignalLossEffect from './components/SignalLossEffect';
import { GenetixEngine } from './services/GenetixEngine';
import { GameConfig, GameStats, LogEntry, DetailedStats } from './types';
import { Heart, ShieldAlert, Cross, Box, AlertTriangle, Activity, Crosshair, BarChart2, X, Volume2, VolumeX, Skull } from 'lucide-react';
import StatsDisplay from './components/StatsDisplay';

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

// Result modal style definition
interface ResultStyle {
    borderColor: string;
    textColor: string;
    glow: string;
    title: string;
    icon: React.ReactNode;
    bgGradient: string;
    stamp: string;
    classification: string;
}

const App: React.FC = () => {
    const [view, setView] = useState<'landing' | 'game'>('landing');
    const [opacity, setOpacity] = useState(1); // State for transition opacity
    const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
    const [stats, setStats] = useState<GameStats>({ allies: 0, enemies: 0, healers: 0, obstacles: 0 });
    const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // States for logic
    const [isRunning, setIsRunning] = useState(false);
    const [hasStarted, setHasStarted] = useState(false); // New state to track if game ever ran
    const [gameResult, setGameResult] = useState<string | null>(null);
    const [missionId, setMissionId] = useState<string>('00000');

    // Explosion & Nuke State
    const [isExploding, setIsExploding] = useState(false);
    const [hasNukeBeenUsed, setHasNukeBeenUsed] = useState(false);
    const [signalPhase, setSignalPhase] = useState<'idle' | 'noise' | 'dark'>('idle');
    const [targetCoordinates, setTargetCoordinates] = useState<{ x: number, y: number }[]>([]);
    const [showResultModal, setShowResultModal] = useState(false);

    // Visual Fallback Tracking (Synced with engine ticks manually via loop or state)
    // We use a simple boolean here for the overlay grain, the color tint is in canvas
    const [showFalloutGrain, setShowFalloutGrain] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasWrapperRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<GenetixEngine>(new GenetixEngine());
    const lastTickRef = useRef<number>(0);
    const animationFrameRef = useRef<number>(0);
    // Indica que la partida terminó pero aún hay animaciones de muerte que completar.
    const isDrainingRef = useRef(false);

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
    // Registra la pista saliente del crossfade activo para poder pararla si se interrumpe
    const outgoingTrackRef = useRef<{ el: HTMLAudioElement; defaultVol: number } | null>(null);
    const isFirstRenderRef = useRef(true);
    const [isMuted, setIsMuted] = useState(true); // Default to muted
    // Espejo ref de `view` — permite leer la vista actual sin stale-closure en useEffects de audio
    const viewRef = useRef<'landing' | 'game'>('landing');

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
        setDetailedStats(engineRef.current.getDetailedStats());

        if (!autoTrigger) {
            setLogs([]); // Clear logs only on full manual reset
            // NO llamamos setGameResult(null) aquí en el path manual:
            // handleReset ya lo llama antes del setTimeout, lo que dispara
            // el useEffect de audio exactamente una vez. Llamarlo de nuevo
            // causaría un doble disparo que resetea currentTime=0 en la
            // pista de batalla mientras ya está sonando (salto audible).
        }

        // Important: We are ready, but NOT running yet
        isDrainingRef.current = false;
        setHasStarted(false);
        setIsRunning(false);
        setIsExploding(false);
        setHasNukeBeenUsed(false);
        setShowFalloutGrain(false);
        setTargetCoordinates([]);

        if (autoTrigger) {
            addLog(`Reconfiguración detectada. ${config.entityCounts.allies} Aliados vs ${config.entityCounts.enemies} Hostiles.`, "system");
        } else {
            // If we are resetting because of a config change (even if manual), use the "Reconfiguración" message
            // We can infer this if the previous entity counts don't match the current ones
            const prev = prevEntityCountsRef.current;
            const curr = config.entityCounts;
            const isConfigChange = prev.allies !== curr.allies || prev.enemies !== curr.enemies || prev.healers !== curr.healers || prev.obstacles !== curr.obstacles;

            if (isConfigChange) {
                addLog(`Reconfiguración manual detectada. ${curr.allies} Aliados vs ${curr.enemies} Hostiles.`, "system");
                // Update the ref so subsequent resets without changes show the standard message
                prevEntityCountsRef.current = curr;
            } else {
                addLog("Sistemas tácticos cargados. Esperando confirmación manual.", "system");
                addLog(`Unidades desplegadas: ${config.entityCounts.allies} Aliados, ${config.entityCounts.enemies} Enemigos.`, "info");
            }
        }

        // Force initial draw
        setTimeout(() => {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) engineRef.current.draw(ctx, config);
        }, 50);
    }, [config, addLog]);

    // 2. Actually Start the Loop (Triggered by button)
    const runSimulation = () => {
        // Re-inicializar el motor con la config actual para que cualquier cambio de
        // sliders previo al inicio quede aplicado desde el primer tick.
        engineRef.current.init(config);
        setStats(engineRef.current.getStats());
        setDetailedStats(engineRef.current.getDetailedStats());
        setTimeout(() => {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) engineRef.current.draw(ctx, config);
        }, 0);

        setLogs([]); // Limpiar logs previos al inicio
        setGameResult(null);
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
            // TRIGGER SIGNAL LOSS EFFECT
            // Phase 1: Digital Noise / Glitch (Sensor Overload)
            setSignalPhase('noise');

            // Phase 2: Dark / Blackout (Sensor Failure) - 600ms later
            setTimeout(() => setSignalPhase('dark'), 600);

            // Phase 3: Recovery (Fade out)
            setTimeout(() => setSignalPhase('idle'), 2500);

            // EXECUTE PROTOCOL FIRST (Eliminates 80%)
            const msgs = engineRef.current.executeOmegaProtocol();

            // CAPTURE REMAINING SURVIVORS for targeting
            const survivors = engineRef.current.listas.enemigos.map(e => ({ x: e.posX, y: e.posY }));

            // Visual Update immediately at the boom
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) engineRef.current.draw(ctx, config);

            setStats(engineRef.current.getStats());
            setDetailedStats(engineRef.current.getDetailedStats());
            setShowFalloutGrain(true);

            // Log messages
            setTimeout(() => { if (msgs[0]) addLog(msgs[0], "combat"); }, 2000);
            setTimeout(() => { if (msgs[1]) addLog(msgs[1], "combat"); }, 4000);

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
                setShowResultModal(true);
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
    // Modo "drain": cuando la partida termina, continúa solo para completar
    // las animaciones de muerte antes de detener el loop definitivamente.
    loopRef.current = (timestamp: number) => {
        if (!isRunning) return;

        const engine = engineRef.current;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        if (timestamp - lastTickRef.current > config.renderSpeed) {
            lastTickRef.current = timestamp;

            if (isDrainingRef.current) {
                // Solo avanzar efectos visuales, sin lógica de juego
                const stillAnimating = engine.tickEffects();
                engine.draw(ctx, config);
                if (!stillAnimating) {
                    isDrainingRef.current = false;
                    setIsRunning(false);
                    return; // No agendar siguiente frame
                }
            } else {
                const event = engine.update();
                if (event) addLog(event, 'combat');

                const result = engine.checkWin();
                if (result) {
                    setGameResult(result);
                    setShowResultModal(true);
                    setMissionId(Math.floor(Math.random() * 90000 + 10000).toString());
                    addLog(`SIMULACIÓN FINALIZADA. RESULTADO: ${result}`, 'system');
                    setStats(engine.getStats());
                    setDetailedStats(engine.getDetailedStats());
                    engine.draw(ctx, config);

                    if (engine.listas.efectos.length > 0) {
                        // Entrar en modo drain para que las animaciones de muerte terminen
                        isDrainingRef.current = true;
                    } else {
                        setIsRunning(false);
                        return;
                    }
                } else {
                    engine.draw(ctx, config);
                    setStats(engine.getStats());
                    setDetailedStats(engine.getDetailedStats());
                }
            }
        }

        animationFrameRef.current = requestAnimationFrame(loopRef.current);
    };

    // [GAME LOOP] - Start/Stop Loop based on isRunning
    useEffect(() => {
        if (isRunning) {
            animationFrameRef.current = requestAnimationFrame(loopRef.current);
        }
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [isRunning]);

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
    }, []);

    // [AUDIO SYSTEM] - Cancela el fade activo y, si habia crossfade a medias,
    // para y restaura la pista saliente para que no quede reproduciéndose sola.
    const stopFade = () => {
        if (activeFadeRef.current) {
            clearInterval(activeFadeRef.current);
            activeFadeRef.current = null;
        }
        if (outgoingTrackRef.current) {
            const { el, defaultVol } = outgoingTrackRef.current;
            el.pause();
            el.volume = defaultVol;
            outgoingTrackRef.current = null;
        }
    };

    // [AUDIO SYSTEM] - Fade de un solo elemento (mute/unmute suave).
    // Cancela cualquier fade en curso antes de iniciar el nuevo.
    const fadeVolume = (
        el: HTMLAudioElement,
        fromVol: number,
        toVol: number,
        durationMs: number,
        onDone?: () => void
    ) => {
        if (activeFadeRef.current) {
            clearInterval(activeFadeRef.current);
            activeFadeRef.current = null;
        }
        const STEPS = 30;
        const INTERVAL = durationMs / STEPS;
        let step = 0;
        el.volume = Math.max(0, Math.min(1, fromVol));
        activeFadeRef.current = setInterval(() => {
            step++;
            const t = step / STEPS;
            const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            el.volume = Math.max(0, Math.min(1, fromVol + (toVol - fromVol) * ease));
            if (step >= STEPS) {
                clearInterval(activeFadeRef.current!);
                activeFadeRef.current = null;
                el.volume = Math.max(0, Math.min(1, toVol));
                onDone?.();
            }
        }, INTERVAL);
    };

    // [AUDIO SYSTEM] - Crossfade entre dos pistas
    // Cancela siempre el fade anterior y garantiza que la pista saliente se pare al final.
    const crossfade = (
        outgoing: HTMLAudioElement,
        outgoingDefaultVol: number,
        incoming: HTMLAudioElement,
        incomingTargetVol: number,
        resetIncoming: boolean = false
    ) => {
        stopFade(); // Para el fade previo Y pausa la pista saliente anterior si habia una
        const STEPS = 60;
        const DURATION = 2000;
        const INTERVAL = DURATION / STEPS;
        const startVol = outgoing.volume;

        // Registrar pista saliente para que stopFade() la pare si se interrumpe
        outgoingTrackRef.current = { el: outgoing, defaultVol: outgoingDefaultVol };

        if (resetIncoming) incoming.currentTime = 0;
        incoming.volume = 0;
        incoming.play().catch(() => { });

        let step = 0;
        activeFadeRef.current = setInterval(() => {
            step++;
            const t = step / STEPS;
            const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            outgoing.volume = Math.max(0, startVol * (1 - ease));
            incoming.volume = Math.min(incomingTargetVol, incomingTargetVol * ease);
            if (step >= STEPS) {
                clearInterval(activeFadeRef.current!);
                activeFadeRef.current = null;
                outgoing.pause();
                outgoing.volume = outgoingDefaultVol;
                outgoingTrackRef.current = null;
            }
        }, INTERVAL);
    };

    // [AUDIO SYSTEM] - Guard: desbloquear AudioContext en iOS/Safari solo una vez
    const hasUnlockedRef = useRef(false);
    // Pista que debe estar sonando ahora mismo — fuente de verdad para transiciones
    const activeTrackRef = useRef<HTMLAudioElement | null>(null);

    // [AUDIO SYSTEM] - Volumen por defecto de cada pista (para restaurar tras pausar)
    const getDefaultVol = (el: HTMLAudioElement): number => {
        if (el === landingAudioRef.current) return VOL.landing;
        if (el === gameAudioRef.current) return VOL.battle;
        return VOL.result;
    };

    // [AUDIO SYSTEM] - Resuelve qué pista y volumen corresponden al estado dado
    const resolveTarget = (
        v: 'landing' | 'game',
        result: string | null
    ): { el: HTMLAudioElement; vol: number; reset: boolean } | null => {
        if (v === 'landing')
            return landingAudioRef.current
                ? { el: landingAudioRef.current, vol: VOL.landing, reset: false }
                : null;
        if (result === 'ALLIES_WIN' && alliesWinAudioRef.current)
            return { el: alliesWinAudioRef.current, vol: VOL.result, reset: true };
        if (result === 'ENEMIES_WIN' && enemiesWinAudioRef.current)
            return { el: enemiesWinAudioRef.current, vol: VOL.result, reset: true };
        if (result === 'DRAW' && drawAudioRef.current)
            return { el: drawAudioRef.current, vol: VOL.result, reset: true };
        return gameAudioRef.current
            ? { el: gameAudioRef.current, vol: VOL.battle, reset: false }
            : null;
    };

    // [AUDIO SYSTEM] - Botón mute/unmute
    // IMPORTANTE iOS/Safari: .play() debe llamarse síncronamente dentro del handler
    // del gesto del usuario. toggleMute ES ese gesto, así que aquí se inicia la pista
    // correcta directamente. El useEffect unificado se encarga de las transiciones
    // posteriores (cambio de vista, fin de partida, etc.).
    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);

        if (newMuted) {
            // Silenciar: parar todo de forma inmediata y limpia.
            stopFade();
            [landingAudioRef, gameAudioRef, alliesWinAudioRef, enemiesWinAudioRef, drawAudioRef]
                .forEach(r => {
                    if (r.current && !r.current.paused) {
                        r.current.pause();
                        r.current.volume = getDefaultVol(r.current);
                    }
                });
            activeTrackRef.current = null;
        } else {
            // Desmutar: pre-calentar TODAS las pistas en el gesto (iOS AudioContext unlock).
            //
            // En iOS cada <audio> necesita su propio .play() dentro de un gesto de usuario
            // para que el navegador le permita reproducirse programáticamente después.
            // Usamos play() + pause() SÍNCRONOS (sin .then()) para evitar la race condition
            // donde el callback async pausa una pista que ya arrancó de verdad.
            // volume=0 garantiza silencio durante el unlock.
            const target = resolveTarget(view, gameResult);

            if (!hasUnlockedRef.current) {
                hasUnlockedRef.current = true;
                [landingAudioRef, gameAudioRef, alliesWinAudioRef, enemiesWinAudioRef, drawAudioRef]
                    .forEach(r => {
                        if (r.current && r.current !== target?.el) {
                            r.current.volume = 0;
                            r.current.play().catch(() => { }); // unlock iOS — el catch cubre el AbortError
                            r.current.pause();                 // inmediato y síncrono: sin race condition
                            r.current.currentTime = 0;
                            r.current.volume = getDefaultVol(r.current);
                        }
                    });
            }

            // Iniciar la pista correcta síncronamente dentro del gesto.
            if (target) {
                stopFade();
                if (target.reset) target.el.currentTime = 0;
                target.el.volume = 0;
                target.el.play().catch(() => { });
                fadeVolume(target.el, 0, target.vol, 400);
                activeTrackRef.current = target.el;
            }
        }
    };

    // [AUDIO SYSTEM] - Efecto ÚNICO que sincroniza el audio con el estado de la aplicación.
    //
    // Reemplaza los tres efectos separados ([view], [gameResult], [isMuted]) para eliminar:
    //   • Race conditions entre efectos (p.ej. gameResult=null + view='landing' disparando
    //     en orden indeterminado y haciendo que la pista de batalla suene brevemente)
    //   • Estado divergente cuando isMuted=true (los efectos anteriores hacían `return`
    //     dejando pistas activas sin limpiar, que luego sonaban en contextos incorrectos)
    //
    // Invariante: al salir de este efecto, SOLO la pista correcta para (view, gameResult)
    // está reproduciéndose. Todas las demás están pausadas.
    useEffect(() => {
        // Primer render: el usuario aún no ha interactuado; el navegador bloquea autoplay.
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return;
        }

        // Mantener viewRef sincronizado (evita stale-closure en otros callbacks)
        viewRef.current = view;

        const allRefs = [landingAudioRef, gameAudioRef, alliesWinAudioRef, enemiesWinAudioRef, drawAudioRef];

        if (isMuted) {
            // toggleMute ya habrá pausado todo de forma imperativa; esto es limpieza
            // defensiva para cubrir cambios de estado (view/gameResult) mientras se está
            // silenciado, que de otro modo podrían dejar pistas reproduciéndose en segundo plano.
            stopFade();
            allRefs.forEach(r => r.current?.pause());
            activeTrackRef.current = null;
            return;
        }

        const target = resolveTarget(view, gameResult);
        if (!target) return;

        const prev = activeTrackRef.current;

        // Parar defensivamente solo las pistas que no son ni la entrante ni la saliente.
        // NO pausar prev aquí: si está sonando, lo gestionará el crossfade (fade out + pause
        // al finalizar). Pausarlo antes haría que !prev.paused sea siempre false y el
        // crossfade nunca se ejecutaría.
        allRefs.forEach(r => {
            if (r.current && r.current !== target.el && r.current !== prev && !r.current.paused) {
                r.current.pause();
                r.current.volume = getDefaultVol(r.current);
            }
        });

        if (prev === target.el) {
            // La pista correcta ya está activa; reanudar si por algún motivo estaba pausada.
            if (target.el.paused) target.el.play().catch(() => { });
            return;
        }

        // Registrar la nueva pista activa antes de la transición
        activeTrackRef.current = target.el;

        if (prev && !prev.paused) {
            // Transición con crossfade: la pista anterior aún sonaba
            if (target.reset) target.el.currentTime = 0;
            crossfade(prev, getDefaultVol(prev), target.el, target.vol, false);
        } else {
            // Sin pista previa activa: fade-in directo
            stopFade();
            if (target.reset) target.el.currentTime = 0;
            target.el.volume = 0;
            target.el.play().catch(() => { });
            fadeVolume(target.el, 0, target.vol, 800);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, gameResult, isMuted]);

    // Track if entity config has changed to force reset
    const [configChanged, setConfigChanged] = useState(false);

    // Auto-Restart on Entity Config Change - MODIFIED: Just set flag, don't auto-restart
    useEffect(() => {
        // Only trigger if entity counts have actually changed by reference
        if (config.entityCounts === prevEntityCountsRef.current) return;

        // Update ref for next comparison
        prevEntityCountsRef.current = config.entityCounts;

        if (view === 'game' && hasStarted) {
            setConfigChanged(true);
            setIsRunning(false); // Pause game
        }
    }, [config.entityCounts, view, hasStarted]);

    // Preview en tiempo real: cuando los sliders cambian antes de iniciar la partida,
    // reinicializar el motor silenciosamente para reflejar las nuevas unidades en el canvas.
    useEffect(() => {
        if (hasStarted || view !== 'game') return;
        engineRef.current.init(config);
        setStats(engineRef.current.getStats());
        setDetailedStats(engineRef.current.getDetailedStats());
        setTimeout(() => {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) engineRef.current.draw(ctx, config);
        }, 0);
        // Solo config.entityCounts como dependencia — es la única fuente de cambio en este path.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.entityCounts]);

    // Handle Reset (Go back to Ready state)
    const handleReset = () => {
        setIsRunning(false);
        setHasStarted(false);
        setShowResultModal(false);
        setIsExploding(false);
        setShowFalloutGrain(false);
        setConfigChanged(false);
        // Poner gameResult a null dispara el useEffect de audio que detiene las pistas
        // de resultado y reactiva la música de batalla si estamos en la vista de juego.
        setGameResult(null);
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

    const getResultStyles = (): ResultStyle => {
        switch (gameResult) {
            case 'ALLIES_WIN':
                return {
                    borderColor: 'border-space-ally',
                    textColor: 'text-space-ally',
                    glow: 'shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]',
                    title: 'OBJETIVO_CUMPLIDO',
                    icon: <ShieldAlert className="w-10 h-10 md:w-16 md:h-16 text-space-ally drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" />,
                    bgGradient: 'from-green-900/10 to-black',
                    stamp: 'CONFIRMADO',
                    classification: 'NIVEL_ALFA'
                };
            case 'ENEMIES_WIN':
                return {
                    borderColor: 'border-space-enemy',
                    textColor: 'text-space-enemy',
                    glow: 'shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)]',
                    title: 'MISIÓN_FALLIDA',
                    icon: <Skull className="w-10 h-10 md:w-16 md:h-16 text-space-enemy drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />,
                    bgGradient: 'from-red-900/10 to-black',
                    stamp: 'CRÍTICO',
                    classification: 'FALLO_SISTEMA'
                };
            default:
                return {
                    borderColor: 'border-yellow-500',
                    textColor: 'text-yellow-500',
                    glow: 'shadow-[0_0_50px_-12px_rgba(234,179,8,0.3)]',
                    title: 'ESTANCAMIENTO',
                    icon: <AlertTriangle className="w-10 h-10 md:w-16 md:h-16 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" />,
                    bgGradient: 'from-yellow-900/10 to-black',
                    stamp: 'DISPUTADO',
                    classification: 'ZONA_GRIS'
                };
        }
    };


    const getLCDMessage = () => {
        if (isExploding) return { msg: "ERR: OMEGA_PROTOCOL_ACTIVE", type: 'critical' as const, sub: "DETONATION_IMMINENT" };
        if (hasNukeBeenUsed && !gameResult) return { msg: "POST_DETONATION_STATUS", type: 'warning' as const, sub: "ATMOSPHERIC_FALLOUT_DETECTED" };

        if (gameResult === 'ALLIES_WIN') return { msg: "MISSION_SUCCESS", type: 'success' as const, sub: "ALL_OBJECTIVES_COMPLETED" };
        if (gameResult === 'ENEMIES_WIN') return { msg: "MISSION_FAILURE", type: 'critical' as const, sub: "SIGNAL_LOST_IN_SECTOR" };
        if (gameResult === 'DRAW') return { msg: "STALEMATE_DETECTED", type: 'warning' as const, sub: "MUTUAL_ELIMINATION_CONFIRMED" };

        if (isRunning) {
            if (stats.allies < 10 && stats.allies > 0) return { msg: "WARNING: ALLY_CRITICAL", type: 'warning' as const, sub: "REINFORCEMENTS_REQUIRED" };
            if (stats.enemies < 10 && stats.enemies > 0) return { msg: "HVT_NEAR_ELIMINATION", type: 'success' as const, sub: "MAINTAIN_FIRE_PRESSURE" };
            return { msg: "ENGAGEMENT_IN_PROGRESS", type: 'normal' as const, sub: "REALTIME_FEED_ACTIVE" };
        }
        if (hasStarted && !isRunning && !gameResult) return { msg: "SIMULATION_SUSPENDED", type: 'warning' as const, sub: "AWAITING_COMMAND_RESUME" };
        if (!hasStarted) return { msg: "READY_FOR_DEPLOYMENT", type: 'normal' as const, sub: "AWAITING_INITIALIZATION" };
        return { msg: "SYSTEM_IDLE", type: 'normal' as const, sub: "STANDBY_MODE" };
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
            <div className="min-h-[100dvh] md:h-[100dvh] bg-space-black text-space-text font-sans flex flex-col md:flex-row overflow-y-auto md:overflow-hidden relative">

                {/* LEFT: Game Viewport */}
                <div className="flex-1 flex flex-col h-auto md:h-full relative order-1 md:order-1 min-h-0">

                    {/* Header */}
                    <header className="h-12 md:h-16 border-b border-space-border flex items-center justify-between px-4 md:px-6 bg-space-black z-20 shrink-0 sticky top-0 md:static">
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
                    <div className="flex-1 bg-space-dark relative flex items-center justify-center p-2 md:p-4 overflow-hidden min-h-[300px] md:min-h-0">
                        {/* Decorative Grid Background */}
                        <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-10 pointer-events-none"></div>

                        <div ref={canvasWrapperRef}
                            className={`
                                relative border border-space-border shadow-2xl shadow-black bg-black w-full max-w-[98%] md:max-w-[95%] aspect-[3/1] 
                                ${isExploding ? 'animate-omega-sequence' : 'animate-idle-drift'}
                            `}
                            style={{
                                filter: signalPhase === 'noise' ? 'url(#signal-glitch) contrast(1.4) brightness(1.3) saturate(0.8)' :
                                    signalPhase === 'dark' ? 'url(#signal-glitch) contrast(2) brightness(0.2) grayscale(0.8)' :
                                        'none',
                                transition: signalPhase === 'idle' ? 'filter 1s ease-out' : 'filter 0.05s'
                            }}
                        >
                            <SignalLossEffect phase={signalPhase} />

                            {/* Fallout Noise Grain (Controlled by React for fading) */}
                            {/* The Orange Tint is handled by Canvas draw() method for better perf/blending */}
                            <div className={`absolute inset-0 z-10 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none transition-opacity duration-[8000ms] ease-out ${showFalloutGrain ? 'opacity-30' : 'opacity-0'}`}></div>

                            {/* Corner Accents */}
                            <div className="absolute -top-1 -left-1 w-3 h-3 md:w-4 md:h-4 border-t-2 border-l-2 border-space-ally"></div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 border-t-2 border-r-2 border-space-ally"></div>
                            <div className="absolute -bottom-1 -left-1 w-3 h-3 md:w-4 md:h-4 border-b-2 border-l-2 border-space-ally"></div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 border-b-2 border-r-2 border-space-ally"></div>

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

                                            {/* Reticles - NEW DESIGN */}
                                            {targetCoordinates.map((target, idx) => {
                                                // FIX: Ensure perfect square aspect ratio for the reticle container
                                                // We use a fixed percentage size relative to the canvas height to keep it consistent
                                                // Reduced from 5% to 3.5% for even tighter targeting
                                                const sizePercent = 3.5;

                                                return (
                                                    <div
                                                        key={idx}
                                                        className="absolute flex items-center justify-center pointer-events-none"
                                                        style={{
                                                            left: `${((target.x + 0.5) / 75) * 100}%`,
                                                            top: `${((target.y + 0.5) / 25) * 100}%`,
                                                            transform: 'translate(-50%, -50%)',
                                                            width: `${sizePercent}%`,
                                                            aspectRatio: '1/1', // Force square aspect ratio
                                                        }}
                                                    >
                                                        {/* 1. Corner Brackets (The "Box" look) */}
                                                        <div className="absolute inset-0 border-2 border-green-500/60 animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20"></div>

                                                        {/* Top Left */}
                                                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-green-400"></div>
                                                        {/* Top Right */}
                                                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-green-400"></div>
                                                        {/* Bottom Left */}
                                                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-green-400"></div>
                                                        {/* Bottom Right */}
                                                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-green-400"></div>

                                                        {/* 2. Center Crosshair */}
                                                        <div className="absolute w-full h-[1px] bg-green-500/30"></div>
                                                        <div className="absolute h-full w-[1px] bg-green-500/30"></div>
                                                        <div className="absolute w-1 h-1 bg-red-500 rounded-full shadow-[0_0_5px_#ef4444]"></div>

                                                        {/* 3. Rotating Elements (Square to avoid oval distortion) */}
                                                        <div className="absolute inset-1 border border-dashed border-green-500/30 rounded-full animate-[spin_4s_linear_infinite]"></div>

                                                        {/* 4. Data Label (Floating outside) */}
                                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 border border-green-500/50 px-1 py-0.5">
                                                            <div className="text-[6px] md:text-[8px] text-green-400 font-mono flex items-center gap-1">
                                                                <span className="animate-pulse">TARGET</span>
                                                                <span className="text-white font-bold">{idx.toString().padStart(3, '0')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Centered Locking Text - Military Style */}
                                            <div className="absolute bottom-4 md:bottom-8 left-0 right-0 flex justify-center items-end pointer-events-none">
                                                <div className="bg-black/90 border border-green-500/50 text-green-500 px-3 py-1.5 md:px-8 md:py-2 font-mono flex flex-col items-center gap-1 shadow-[0_0_15px_rgba(34,197,94,0.2)] origin-bottom max-w-[90%]">
                                                    <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-sm font-bold tracking-[0.1em] md:tracking-[0.2em]">
                                                        <Crosshair className="animate-spin-slow w-3 h-3 md:w-4 md:h-4" />
                                                        <span>TARGET ACQUISITION</span>
                                                        <Crosshair className="animate-spin-slow w-3 h-3 md:w-4 md:h-4" />
                                                    </div>
                                                    <div className="w-full h-[2px] bg-green-900 overflow-hidden">
                                                        <div className="h-full bg-green-500 w-full animate-[loading_2s_ease-in-out_infinite]"></div>
                                                    </div>
                                                    <div className="text-[6px] md:text-[8px] text-green-600 tracking-widest uppercase text-center">
                                                        Scanning sector 7-G // Threat Level: CRITICAL
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 5. Warning Text - Initial Phase */}
                                    {targetCoordinates.length === 0 && (
                                        <div className="absolute top-10 left-0 right-0 flex justify-center animate-text-lifecycle pointer-events-none">
                                            <div className="bg-red-600 text-black px-4 py-1 md:px-6 font-mono text-xs sm:text-sm md:text-xl font-bold tracking-[0.2em] md:tracking-[0.5em] border-2 border-black shadow-[0_0_10px_rgba(220,38,38,0.8)] transform -skew-x-12 max-w-[90%] text-center whitespace-nowrap overflow-hidden text-ellipsis">
                                                PROTOCOLO OMEGA INICIADO
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Console - Visible on all screens */}
                    <div className="block border-t border-space-border md:border-t-0">
                        <ConsoleLog logs={logs} />
                    </div>
                </div>

                {/* RIGHT: Dashboard Sidebar */}
                {/* Mobile: Auto height, Scrollable page. Desktop: Full height, Fixed width */}
                <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-space-border bg-space-black flex flex-col h-auto md:h-full z-30 order-2 md:order-2 shrink-0">

                    {/* Stats Header */}
                    <div className="p-4 border-b border-black/40 bg-[#08090a]">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]"></div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-300 font-bold">LIVE_TELEMETRY_FEED</span>
                            </div>
                            <button
                                onClick={() => setShowStatsModal(true)}
                                className="text-gray-400 hover:text-white transition-colors p-1.5 rounded bg-white/5 border border-white/10"
                                title="Ver Análisis Detallado"
                            >
                                <BarChart2 size={14} />
                            </button>
                        </div>

                        {/* Integrated Monitor Look */}
                        <div className="relative p-2 bg-[#16181b] border-2 border-[#2a2d31] rounded-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden">
                            {/* CRT Effect */}
                            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,0,0.06))] bg-[length:100%_2px,3px_100%] z-20"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-10"></div>

                            <div className="grid grid-cols-2 gap-2 relative z-0">
                                {/* Stat Card */}
                                <div className="bg-black/40 p-2 border border-white/5 flex flex-col">
                                    <div className="text-space-ally flex items-center gap-1.5 mb-1 text-[8px] font-bold uppercase tracking-tighter opacity-80">
                                        <ShieldAlert size={10} /> ALIADOS
                                    </div>
                                    <div className="text-xl font-mono text-white leading-none drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{stats.allies.toString().padStart(3, '0')}</div>
                                </div>

                                <div className="bg-black/40 p-2 border border-white/5 flex flex-col">
                                    <div className="text-space-enemy flex items-center gap-1.5 mb-1 text-[8px] font-bold uppercase tracking-tighter opacity-80">
                                        <Cross size={10} className="rotate-45" /> ENEMIGOS
                                    </div>
                                    <div className="text-xl font-mono text-white leading-none drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{stats.enemies.toString().padStart(3, '0')}</div>
                                </div>

                                <div className="bg-black/40 p-2 border border-white/5 flex flex-col">
                                    <div className="text-space-healer flex items-center gap-1.5 mb-1 text-[8px] font-bold uppercase tracking-tighter opacity-80">
                                        <Heart size={10} /> MÉDICOS
                                    </div>
                                    <div className="text-xl font-mono text-white leading-none drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{stats.healers.toString().padStart(3, '0')}</div>
                                </div>

                                <div className="bg-black/40 p-2 border border-white/5 flex flex-col">
                                    <div className="text-space-obstacle flex items-center gap-1.5 mb-1 text-[8px] font-bold uppercase tracking-tighter opacity-80">
                                        <Box size={10} /> BLOQUES
                                    </div>
                                    <div className="text-xl font-mono text-white leading-none drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{stats.obstacles.toString().padStart(3, '0')}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex-1 md:overflow-y-auto">
                        <ControlPanel
                            config={config}
                            isRunning={isRunning}
                            hasStarted={hasStarted}
                            isGameOver={!!gameResult}
                            isMuted={isMuted}
                            onToggleMute={toggleMute}
                            setConfig={setConfig}
                            onTogglePause={() => setIsRunning(!isRunning)}
                            onReset={handleReset}
                            onStart={runSimulation}
                            onSetDefaults={() => setConfig(DEFAULT_CONFIG)}
                            onAbort={() => {
                                // El efecto unificado [view, gameResult, isMuted] detectará
                                // el cambio de vista y hará crossfade a la pista de landing.
                                setGameResult(null);
                                setShowResultModal(false);
                                switchView('landing', () => setIsRunning(false));
                            }}
                            // New Props for Omega Protocol
                            // Omega Protocol se activa cuando quedan ≤3 aliados (umbral más robusto
                            // que exactamente 1, evita que la ventana se cierre si mueren en el mismo tick)
                            isEmergencyAvailable={stats.allies <= 3 && stats.enemies > 0}
                            isExploding={isExploding}
                            hasNukeBeenUsed={hasNukeBeenUsed}
                            onTriggerEmergency={handleOmegaProtocol}
                            lcdMessage={getLCDMessage()}
                            configChanged={configChanged}
                        />
                    </div>
                </aside>

                {/* Modal Result Overlay - MOVED HERE TO BE GLOBAL */}
                {showResultModal && gameResult && resultStyles && (
                    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-500 cursor-default">
                        <div className={`
                            relative bg-[#0a0b0d] border-2 ${resultStyles.borderColor} ${resultStyles.glow}
                            w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,1)] transform scale-95 md:scale-100 flex flex-col max-h-[95vh] overflow-hidden
                        `}>
                            {/* Tech Background Pattern */}
                            <div className={`absolute inset-0 bg-gradient-to-b ${resultStyles.bgGradient} opacity-30 pointer-events-none`}></div>
                            <div className="absolute inset-0 bg-grid-pattern bg-[length:30px_30px] opacity-5 pointer-events-none"></div>

                            {/* Tactical Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] rotate-[-25deg] select-none">
                                <div className="text-[140px] font-black tracking-tighter leading-none text-white">
                                    CLASSIFIED
                                </div>
                            </div>

                            {/* Classification Header Bar */}
                            <div className={`h-1.5 w-full bg-gradient-to-r ${resultStyles.borderColor.replace('border-', 'from-')}/50 via-transparent to-transparent opacity-50`}></div>

                            {/* Modal Header */}
                            <div className="bg-black/80 border-b border-white/5 p-3 md:p-5 flex justify-between items-center relative z-10 shrink-0">
                                <div className="flex flex-col min-w-0 mr-2">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${resultStyles.textColor.replace('text-', 'bg-')} animate-pulse shrink-0`}></div>
                                        <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-400 font-black truncate">DEBRIEFING_PROTOCOL</span>
                                    </div>
                                    <div className="text-[7px] md:text-[8px] text-gray-600 font-mono tracking-widest uppercase truncate">ENCRYPTED_CHANNEL_SECURE</div>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                    <div className="flex flex-col items-end mr-1 md:mr-2 hidden sm:flex">
                                        <div className="text-[9px] text-gray-500 font-mono">OP_ID: {missionId}</div>
                                        <div className="text-[7px] text-gray-600 font-mono uppercase">AUTH_LVL: {resultStyles.classification}</div>
                                    </div>
                                    <div className="h-6 md:h-8 w-[1px] bg-white/10 mx-1 hidden sm:block"></div>
                                    <button
                                        onClick={() => toggleMute()}
                                        className={`transition-colors p-2 rounded-sm flex items-center justify-center ${isMuted ? 'text-gray-600 hover:text-white' : 'text-space-ally hover:bg-space-ally/10'}`}
                                    >
                                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                    </button>
                                    <button
                                        onClick={() => setShowResultModal(false)}
                                        className="text-white bg-white/10 hover:bg-white/20 transition-colors p-2 rounded-sm flex items-center justify-center border border-white/10"
                                        aria-label="Close Modal"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-4 md:p-10 flex flex-col relative z-10 overflow-y-auto">
                                {/* Tactical Stamp */}
                                <div className={`absolute top-0 right-10 border-4 ${resultStyles.borderColor} ${resultStyles.textColor} px-4 py-2 font-black text-sm rotate-[12deg] opacity-20 border-double tracking-[0.3em] uppercase pointer-events-none select-none z-0`}>
                                    {resultStyles.stamp}
                                </div>

                                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 mb-6 md:mb-10 relative z-10">
                                    <div className="relative shrink-0">
                                        <div className={`absolute inset-0 blur-3xl ${resultStyles.textColor} opacity-10`}></div>
                                        <div className={`p-4 border border-white/10 bg-black/40 rounded-sm shadow-2xl`}>
                                            {resultStyles.icon}
                                        </div>
                                    </div>

                                    <div className="flex flex-col text-center md:text-left pt-2 min-w-0 flex-1">
                                        <h2 className={`text-base sm:text-xl md:text-2xl font-black tracking-tighter ${resultStyles.textColor} mb-2 drop-shadow-2xl uppercase italic leading-tight whitespace-nowrap overflow-hidden text-ellipsis`}>
                                            {resultStyles.title}
                                        </h2>
                                        <div className="flex items-center justify-center md:justify-start gap-3">
                                            <div className="h-[1px] w-8 bg-white/20"></div>
                                            <p className="text-gray-500 text-[10px] font-mono uppercase tracking-[0.4em] whitespace-nowrap">
                                                STATUS: {resultStyles.classification}
                                            </p>
                                            <div className="h-[1px] flex-1 bg-white/20 hidden md:block"></div>
                                        </div>
                                        <div className="mt-4 text-[9px] text-gray-600 font-mono tracking-widest uppercase">
                                            TIMESTAMP: {new Date().toISOString().replace('T', ' ').substring(0, 19)}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Report Grid - More Uniform */}
                                <div className="grid grid-cols-2 gap-2 md:gap-4 w-full mb-4 md:mb-8">
                                    <div className="bg-black/60 p-3 md:p-5 border border-white/5 relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-space-ally opacity-50"></div>
                                        <div className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-black mb-2">UNIDADES_ACTIVAS</div>
                                        <div className="flex items-baseline gap-2">
                                            <div className="text-2xl md:text-4xl font-mono text-space-ally leading-none tracking-tighter">{stats.allies.toString().padStart(3, '0')}</div>
                                            <div className="text-[10px] text-space-ally/40 font-bold uppercase">UNITS</div>
                                        </div>
                                    </div>
                                    <div className="bg-black/60 p-3 md:p-5 border border-white/5 relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-space-enemy opacity-50"></div>
                                        <div className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-black mb-2">HOSTILES_REST.</div>
                                        <div className="flex items-baseline gap-2">
                                            <div className="text-2xl md:text-4xl font-mono text-space-enemy leading-none tracking-tighter">{stats.enemies.toString().padStart(3, '0')}</div>
                                            <div className="text-[10px] text-space-enemy/40 font-bold uppercase">UNITS</div>
                                        </div>
                                    </div>
                                </div>

                                {detailedStats && (
                                    <div className="w-full space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="text-[9px] uppercase tracking-[0.5em] text-gray-600 font-black whitespace-nowrap">ANÁLISIS_POST_COMBATE</div>
                                            <div className="h-[1px] flex-1 bg-white/5"></div>
                                        </div>
                                        <div className="bg-black/20 p-2 border border-white/5">
                                            <StatsDisplay stats={detailedStats} missionId={missionId} gameResult={gameResult} />
                                        </div>
                                    </div>
                                )}

                                {/* Buttons removed as per user request */}
                            </div>

                            {/* Hazard Stripes Footer */}
                            <div className="h-3 w-full hazard-border opacity-20 mt-auto"></div>

                            {/* Scanline */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[20px] w-full animate-[scan_6s_linear_infinite] pointer-events-none opacity-10"></div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className="w-full h-full bg-space-black transition-opacity duration-500 ease-in-out"
            style={{ opacity: opacity }}
        >
            {/* Detailed Stats Modal */}
            {showStatsModal && detailedStats && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-space-panel border border-space-border w-full max-w-lg shadow-2xl relative">
                        <div className="flex justify-between items-center p-4 border-b border-space-border bg-black/40">
                            <div className="flex items-center gap-2 text-white">
                                <Activity size={16} className="text-space-ally" />
                                <span className="text-xs font-bold tracking-widest uppercase">ANÁLISIS TÁCTICO</span>
                            </div>
                            <button
                                onClick={() => setShowStatsModal(false)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-6">
                            <StatsDisplay stats={detailedStats} missionId={missionId} gameResult={gameResult} />
                        </div>

                        {/* Scanline */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[10px] w-full animate-[scan_4s_linear_infinite] pointer-events-none opacity-20"></div>
                    </div>
                </div>
            )}

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