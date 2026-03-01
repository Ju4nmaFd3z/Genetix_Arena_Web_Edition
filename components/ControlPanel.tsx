import React, { useState, useEffect } from 'react';
import { GameConfig } from '../types';
import { Sliders, Activity, Eye, Play, Pause, RotateCcw, Power, Undo2, LogOut, Radiation, AlertOctagon, Skull, Lock } from 'lucide-react';

interface ControlPanelProps {
    config: GameConfig;
    isRunning: boolean;
    hasStarted: boolean;
    isGameOver: boolean;
    setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
    onTogglePause: () => void;
    onReset: () => void;
    onStart: () => void;
    onSetDefaults: () => void;
    onAbort: () => void;
    isEmergencyAvailable?: boolean;
    isExploding?: boolean;
    hasNukeBeenUsed?: boolean;
    onTriggerEmergency?: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, isRunning, hasStarted, isGameOver, setConfig, onTogglePause, onReset, onStart, onSetDefaults, onAbort, isEmergencyAvailable, isExploding, hasNukeBeenUsed, onTriggerEmergency }) => {

    // Local state for sliders to support update-on-release
    const [localCounts, setLocalCounts] = useState(config.entityCounts);

    // State for invalid interaction feedback (shaking the box or inputs)
    const [isShaking, setIsShaking] = useState(false);
    const [showDenied, setShowDenied] = useState(false);

    // New state for locked controls feedback
    const [lockedControlId, setLockedControlId] = useState<string | null>(null);

    // Track which input field is currently erroring
    const [errorField, setErrorField] = useState<string | null>(null);

    // Sync local state when config changes externally (e.g. Reset Defaults)
    useEffect(() => {
        setLocalCounts(config.entityCounts);
    }, [config.entityCounts]);

    const handleLocalChange = (key: keyof typeof config.entityCounts, value: number) => {
        let finalValue = value;

        // Validation: Allies and Enemies cannot be 0
        if ((key === 'allies' || key === 'enemies') && value < 1) {
            finalValue = 1;

            // Trigger visual feedback for this specific field
            setErrorField(key);
            setTimeout(() => setErrorField(null), 500);
        } else {
            // Cap maximum
            finalValue = Math.max(0, Math.min(200, value));
        }

        setLocalCounts(prev => ({
            ...prev,
            [key]: finalValue
        }));
    };

    // Commit changes to main config only on mouse/touch release
    const commitEntityChanges = () => {
        if (isExploding) {
            triggerLockedFeedback('sliders');
            // Revert local change to match actual config
            setLocalCounts(config.entityCounts);
            return;
        }
        setConfig(prev => ({
            ...prev,
            entityCounts: localCounts
        }));
    };

    const handleEmergencyClick = () => {
        if (!isRunning) return; // Prevent interaction if paused or not started
        if (isExploding || hasNukeBeenUsed) return; // Prevent interaction during explosion or if used

        if (isEmergencyAvailable && onTriggerEmergency) {
            onTriggerEmergency();
        } else {
            // Negative feedback
            setIsShaking(true);
            setShowDenied(true);
            setTimeout(() => setIsShaking(false), 500);
            setTimeout(() => setShowDenied(false), 2000);
        }
    };

    // Helper to wrap actions that are disabled during explosion
    const handleProtectedAction = (id: string, action: () => void) => {
        if (isExploding) {
            triggerLockedFeedback(id);
        } else {
            action();
        }
    };

    const triggerLockedFeedback = (id: string) => {
        setLockedControlId(id);
        setTimeout(() => setLockedControlId(null), 500);
    }

    const isLidOpen = (isEmergencyAvailable && !isExploding && isRunning) || hasNukeBeenUsed;

    return (
        <div className="bg-space-panel p-4 md:p-6 flex flex-col gap-6 font-mono text-sm h-full">
            <style>{`
                /* Custom Range Slider Styling */
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 12px;
                    width: 12px;
                    border-radius: 50%;
                    background: #ffffff;
                    cursor: pointer;
                    margin-top: -2px; 
                    box-shadow: 0 0 5px rgba(0,0,0,0.5);
                    transition: transform 0.1s;
                }
                input[type=range]:active::-webkit-slider-thumb {
                    transform: scale(1.2);
                }
                input[type=range]::-moz-range-thumb {
                    height: 12px;
                    width: 12px;
                    border: none;
                    border-radius: 50%;
                    background: #ffffff;
                    cursor: pointer;
                    box-shadow: 0 0 5px rgba(0,0,0,0.5);
                    transition: transform 0.1s;
                }
                input[type=range]:active::-moz-range-thumb {
                    transform: scale(1.2);
                }
                
                /* Hazard Stripes for Emergency Box */
                .hazard-stripes {
                    background-image: repeating-linear-gradient(
                        45deg,
                        #000,
                        #000 10px,
                        #111 10px,
                        #111 20px
                    );
                }
                .hazard-border {
                     background-image: repeating-linear-gradient(
                        -45deg,
                        #fbbf24,
                        #fbbf24 10px,
                        #000 10px,
                        #000 20px
                    );
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
                    20%, 40%, 60%, 80% { transform: translateX(6px); }
                }
                .animate-shake {
                    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                }
                
                .animate-error-flash {
                    animation: errorFlash 0.5s ease-in-out;
                }
                @keyframes errorFlash {
                    0%, 100% { color: inherit; }
                    50% { color: #ef4444; }
                }
            `}</style>

            {/* Main Controls */}
            <div className="flex flex-col gap-2">
                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">COMANDOS PRINCIPALES</div>

                {!hasStarted ? (
                    <button
                        onClick={onStart}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-wider text-xs transition-all animate-pulse"
                    >
                        <Power size={16} /> INICIAR SIMULACIÓN
                    </button>
                ) : isGameOver ? (
                    <button
                        onClick={onReset}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-wider text-xs transition-all"
                    >
                        <RotateCcw size={16} /> REINICIAR SISTEMA
                    </button>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => handleProtectedAction('pause', onTogglePause)}
                            className={`flex items-center justify-center gap-2 p-3 font-bold uppercase tracking-wider text-xs transition-all ${lockedControlId === 'pause' ? 'bg-red-900 border-red-500 text-white animate-shake' :
                                isRunning
                                    ? 'bg-transparent border border-space-border text-yellow-500 hover:border-yellow-500'
                                    : 'bg-white text-black hover:bg-gray-200'
                                }`}
                        >
                            {lockedControlId === 'pause' ? <><Lock size={14} /> LOCKED</> : isRunning ? <><Pause size={14} /> PAUSA</> : <><Play size={14} /> REANUDAR</>}
                        </button>
                        <button
                            onClick={() => handleProtectedAction('reset', onReset)}
                            className={`flex items-center justify-center gap-2 p-3 border font-bold uppercase tracking-wider text-xs transition-colors ${lockedControlId === 'reset' ? 'bg-red-900 border-red-500 text-white animate-shake' :
                                'bg-transparent border-space-border text-white hover:border-red-500 hover:text-red-500'
                                }`}
                        >
                            {lockedControlId === 'reset' ? <><Lock size={14} /> LOCKED</> : <><RotateCcw size={14} /> REINICIAR</>}
                        </button>
                    </div>
                )}
            </div>

            {/* Entity Config */}
            <div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4 border-b border-space-border pb-2">
                    <Sliders size={12} />
                    <span>PARÁMETROS {lockedControlId === 'sliders' ? <span className="text-red-500 animate-pulse font-bold ml-2">LOCKED</span> : '(REQ. REINICIO)'}</span>
                </div>

                <div className={`space-y-4 ${lockedControlId === 'sliders' ? 'opacity-50 animate-shake' : ''}`}>
                    {[
                        { label: 'ALIADOS', key: 'allies', color: 'text-space-ally' },
                        { label: 'ENEMIGOS', key: 'enemies', color: 'text-space-enemy' },
                        { label: 'CURANDEROS', key: 'healers', color: 'text-space-healer' },
                        { label: 'OBSTÁCULOS', key: 'obstacles', color: 'text-space-obstacle' }
                    ].map((item) => {
                        const isError = errorField === item.key;
                        return (
                            <div key={item.key} className={`flex flex-col gap-3 transition-colors duration-200 ${isError ? 'animate-shake' : ''}`}>
                                <div className="flex justify-between items-center">
                                    <span className={`${isError ? 'text-red-500' : item.color} font-bold text-xs transition-colors`}>{item.label}</span>
                                    <span className={`${isError ? 'text-red-500 font-bold' : 'text-gray-400'} text-xs transition-colors`}>
                                        {localCounts[item.key as keyof typeof config.entityCounts]}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="150"
                                    disabled={isRunning}
                                    value={localCounts[item.key as keyof typeof config.entityCounts]}
                                    onChange={(e) => handleLocalChange(item.key as keyof typeof config.entityCounts, parseInt(e.target.value))}
                                    onMouseUp={commitEntityChanges}
                                    onTouchEnd={commitEntityChanges}
                                    className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isRunning ? 'bg-gray-800' : isError ? 'bg-red-900' : 'bg-space-border'
                                        }`}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Simulation Options */}
            <div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4 border-b border-space-border pb-2">
                    <Activity size={12} />
                    <span>OPCIONES DE EJECUCIÓN</span>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="text-white text-xs">VELOCIDAD SIM</span>
                            <span className="text-gray-400 text-xs">{config.renderSpeed}ms</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="500"
                            step="10"
                            value={config.renderSpeed}
                            onChange={(e) => setConfig({ ...config, renderSpeed: parseInt(e.target.value) })}
                            className="w-full h-1 bg-space-border rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-white text-xs">
                            <Eye size={14} /> INTERFAZ HUD (SALUD)
                        </span>
                        <button
                            onClick={() => setConfig({ ...config, showHealthBars: !config.showHealthBars })}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${config.showHealthBars ? 'bg-white' : 'bg-space-dark border border-space-border'
                                }`}
                        >
                            <span
                                className={`inline-block h-3 w-3 transform rounded-full transition-transform duration-200 ${config.showHealthBars ? 'translate-x-5 bg-black' : 'translate-x-1 bg-gray-500'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* LAST RESORT - EMERGENCY PROTOCOL BUTTON */}
                    <div className="mt-4 relative group">
                        {/* Status Label */}
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-gray-600 mb-2">
                            <span className="flex items-center gap-1"><Radiation size={10} /> OMEGA PROTOCOL</span>
                            <span className={hasNukeBeenUsed ? "text-gray-600 font-bold" : isEmergencyAvailable && !isExploding && isRunning ? "text-red-500 animate-pulse font-bold" : "text-gray-700"}>
                                {hasNukeBeenUsed ? "PURGED" : isExploding ? "DETONATING..." : isEmergencyAvailable && isRunning ? "READY" : "LOCKED"}
                            </span>
                        </div>

                        {/* The Box Container */}
                        <div
                            className={`relative h-24 w-full bg-black border-2 ${hasNukeBeenUsed ? 'border-gray-800' : 'border-space-border'} overflow-visible select-none ${isShaking ? 'animate-shake' : ''}`}
                            onClick={((!isEmergencyAvailable || isExploding) && isRunning) ? handleEmergencyClick : undefined}
                        >
                            {/* Hazard Stripes Frame - VISIBLE IN ALL STATES */}
                            <div className={`absolute inset-0 border-[4px] border-transparent hazard-border pointer-events-none z-0 ${hasNukeBeenUsed ? 'opacity-30' : 'opacity-20'}`}></div>

                            {/* The Button Itself (Inside) */}
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                {hasNukeBeenUsed ? (
                                    /* DEPLETED STATE */
                                    <div className="w-16 h-16 rounded-full border-4 border-gray-800 bg-black flex items-center justify-center shadow-inner animate-in fade-in duration-700">
                                        <Skull size={24} className="text-gray-800" />
                                    </div>
                                ) : (
                                    /* ACTIVE STATE */
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent container click
                                            handleEmergencyClick();
                                        }}
                                        disabled={!isEmergencyAvailable || isExploding || !isRunning}
                                        className={`
                                            w-16 h-16 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.5)] border-4 border-red-900
                                            flex items-center justify-center transition-all duration-100 
                                            active:scale-90 active:shadow-none active:border-red-950
                                            ${isEmergencyAvailable && !isExploding && isRunning
                                                ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_20px_rgba(239,68,68,0.6)] cursor-pointer hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]'
                                                : 'bg-red-950 grayscale opacity-50 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        <Radiation size={24} className={isEmergencyAvailable || isExploding ? "text-black animate-spin-slow" : "text-red-900"} />
                                    </button>
                                )}
                            </div>

                            {/* THE GLASS LID */}
                            <div
                                className={`
                                    absolute -inset-[2px] bg-white/5 backdrop-blur-[2px] border border-white/10 z-20 
                                    transition-all duration-700 ease-in-out transform origin-top
                                    flex flex-col items-center justify-center shadow-inner
                                `}
                                style={{
                                    transform: isLidOpen ? 'perspective(500px) rotateX(100deg) translateY(-10px)' : 'perspective(500px) rotateX(0deg)',
                                    opacity: isLidOpen ? 0.3 : 1
                                }}
                            >
                                {/* Lid Details */}
                                <div className="absolute top-2 w-full flex justify-between px-2 opacity-50">
                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                </div>
                                <div className="absolute bottom-2 w-full flex justify-between px-2 opacity-50">
                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                </div>

                                <span className="text-[10px] font-bold text-white/30 border border-white/20 px-2 py-1 rounded tracking-widest uppercase text-center">
                                    IN CASE OF<br />EMERGENCY
                                </span>

                                {/* Reflection Glare */}
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                            </div>

                            {/* Access Denied Overlay (Feedback) */}
                            {showDenied && !hasNukeBeenUsed && (
                                <div className="absolute inset-0 z-30 flex items-center justify-center bg-red-500/20 backdrop-blur-sm animate-in fade-in duration-200">
                                    <div className="flex items-center gap-1 text-red-500 font-bold tracking-widest text-xs bg-black/80 px-2 py-1 border border-red-500">
                                        <AlertOctagon size={12} /> ACCESS DENIED
                                    </div>
                                </div>
                            )}

                            {/* Used Overlay Text */}
                            {hasNukeBeenUsed && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                                    <span className="text-gray-600 font-bold tracking-widest text-xs bg-black/50 px-2 border-y border-gray-800 -rotate-12">DISCHARGED</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions: Defaults & Abort */}
            <div className="mt-auto pt-4 border-t border-space-border flex flex-col gap-3">
                <button
                    onClick={() => handleProtectedAction('defaults', onSetDefaults)}
                    disabled={isRunning}
                    className={`w-full flex items-center justify-center gap-2 p-3 text-xs uppercase tracking-widest font-bold border border-dashed border-space-border text-gray-500 hover:text-white hover:border-white transition-all ${isRunning ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                    <Undo2 size={14} /> RESTABLECER VALORES
                </button>

                <button
                    onClick={onAbort}
                    className="w-full flex items-center justify-center gap-2 p-3 text-xs uppercase tracking-widest font-bold border border-red-900/30 text-red-900 hover:bg-red-900/10 hover:border-red-600 hover:text-red-500 transition-all"
                >
                    <LogOut size={14} /> ABORTAR MISIÓN
                </button>
            </div>

        </div>
    );
};

export default ControlPanel;