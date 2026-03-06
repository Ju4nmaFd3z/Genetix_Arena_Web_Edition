import React, { useState, useEffect } from 'react';
import { GameConfig } from '../types';
import { Eye, Play, Pause, RotateCcw, Power, Undo2, LogOut, Radiation, AlertOctagon, Skull, Lock, Volume2, VolumeX } from 'lucide-react';
import RetroLCD from './RetroLCD';

interface ControlPanelProps {
    config: GameConfig;
    isRunning: boolean;
    hasStarted: boolean;
    isGameOver: boolean;
    isMuted: boolean;
    onToggleMute: () => void;
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
    lcdMessage?: { msg: string, type: 'normal' | 'warning' | 'critical' | 'success', sub?: string };
    configChanged?: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
    config, isRunning, hasStarted, isGameOver, isMuted, onToggleMute, setConfig,
    onTogglePause, onReset, onStart, onSetDefaults, onAbort,
    isEmergencyAvailable, isExploding, hasNukeBeenUsed, onTriggerEmergency,
    lcdMessage, configChanged
}) => {

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
            finalValue = Math.max(0, Math.min(150, value));
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
        // Actualizar config siempre. Si la partida no ha empezado, un useEffect en App.tsx
        // refrescará el canvas silenciosamente. Si ya empezó, aparecerá el banner de reinicio.
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

    const renderNukeButton = (heightClass: string = "h-24") => (
        <div className="relative group h-full flex flex-col">
            {/* Status Label */}
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-gray-600 mb-2 shrink-0">
                <span className="flex items-center gap-1"><Radiation size={10} /> OMEGA PROTOCOL</span>
                <span className={hasNukeBeenUsed ? "text-gray-600 font-bold" : isEmergencyAvailable && !isExploding && isRunning ? "text-red-500 animate-pulse font-bold" : "text-gray-700"}>
                    {hasNukeBeenUsed ? "PURGED" : isExploding ? "DETONATING..." : isEmergencyAvailable && isRunning ? "READY" : "LOCKED"}
                </span>
            </div>

            {/* The Box Container */}
            <div
                className={`relative ${heightClass} w-full bg-black border-2 ${hasNukeBeenUsed ? 'border-gray-800' : 'border-space-border'} overflow-visible select-none ${isShaking ? 'animate-shake' : ''}`}
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
    );

    return (
        <div className="bg-[#08090a] p-4 md:p-6 flex flex-col gap-6 font-mono text-sm h-full border-r border-black/40 shadow-[inset_-10px_0_30px_rgba(0,0,0,0.5)] relative overflow-y-auto">
            {/* Industrial Background Texture */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]"></div>

            <style>{`
                /* Custom Range Slider Styling - Physical Fader Look */
                input[type=range] {
                    -webkit-appearance: none;
                    background: transparent;
                }
                input[type=range]::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 4px;
                    background: #000;
                    border-radius: 2px;
                    border: 1px solid #333;
                    box-shadow: inset 0 1px 3px rgba(0,0,0,0.8);
                }
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 24px;
                    width: 12px;
                    border-radius: 2px;
                    background: linear-gradient(to right, #444, #888, #444);
                    cursor: pointer;
                    margin-top: -10px; 
                    border: 1px solid #111;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.2);
                }
                input[type=range]:active::-webkit-slider-thumb {
                    background: linear-gradient(to right, #555, #aaa, #555);
                }
                
                /* Hazard Stripes */
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

                .console-module {
                    background: #111316;
                    border: 1px solid #222529;
                    border-bottom: 2px solid #000;
                    border-right: 2px solid #000;
                    box-shadow: inset 1px 1px 1px rgba(255,255,255,0.02);
                    position: relative;
                }

                .module-screw {
                    position: absolute;
                    width: 6px;
                    height: 6px;
                    background: #111;
                    border: 1px solid #444;
                    border-radius: 50%;
                    box-shadow: inset 0 1px 1px rgba(0,0,0,0.5);
                }
            `}</style>

            {/* MODULE 0: MAIN DISPLAY */}
            <div className="console-module p-3 md:p-2 rounded-sm">
                <div className="module-screw top-1 left-1"></div>
                <div className="module-screw top-1 right-1"></div>
                <div className="module-screw bottom-1 left-1"></div>
                <div className="module-screw bottom-1 right-1"></div>

                <div className="absolute -top-2 left-4 px-2 bg-[#16181b] text-[8px] text-gray-500 font-bold tracking-widest border border-[#2a2d31] z-10">PRIMARY_DISPLAY_UNIT</div>
                <div className="mt-2 md:mt-3 mb-0 landscape:mb-2 md:mb-1 flex flex-col landscape:flex-row landscape:gap-2 landscape:items-stretch md:landscape:flex-col md:landscape:gap-0 md:landscape:items-stretch">
                    <div className="w-full landscape:flex-1 md:landscape:w-full md:landscape:flex-none flex flex-col">
                        {/* Spacer for alignment with Nuke Button Label in Landscape Mobile */}
                        <div className="hidden landscape:flex md:landscape:hidden items-center justify-between text-[10px] uppercase tracking-[0.2em] text-transparent mb-2 shrink-0 select-none">
                            <span className="flex items-center gap-1"><Radiation size={10} /> ALIGN</span>
                        </div>
                        <RetroLCD
                            message={lcdMessage?.msg || "SYSTEM OFFLINE"}
                            type={lcdMessage?.type || 'normal'}
                            subMessage={lcdMessage?.sub}
                            className="flex-1"
                        />
                    </div>
                    {/* Nuke Button - Visible ONLY on Mobile Landscape */}
                    <div className="hidden landscape:block landscape:flex-1 md:landscape:hidden">
                        {renderNukeButton("flex-1 mt-1 mb-2")}
                    </div>
                </div>
            </div>

            {/* MODULE 1: MISSION COMMAND */}
            <div className="console-module p-4 rounded-sm">
                <div className="module-screw top-1 left-1"></div>
                <div className="module-screw top-1 right-1"></div>
                <div className="module-screw bottom-1 left-1"></div>
                <div className="module-screw bottom-1 right-1"></div>

                <div className="absolute -top-2 left-4 px-2 bg-[#16181b] text-[8px] text-gray-500 font-bold tracking-widest border border-[#2a2d31] z-10">MISSION_COMMAND_V3.5</div>
                <div className="mt-2 flex flex-col gap-3">
                    {!hasStarted && !configChanged ? (
                        <button
                            onClick={onStart}
                            className="w-full flex items-center justify-center gap-3 p-4 bg-[#e0e0e0] text-black hover:bg-white font-black uppercase tracking-widest text-xs transition-all shadow-[0_4px_0_#999] active:translate-y-[2px] active:shadow-[0_2px_0_#999] border-2 border-black/20 animate-pulse"
                        >
                            <Power size={18} /> INICIAR SIMULACIÓN
                        </button>
                    ) : isGameOver || configChanged ? (
                        <button
                            onClick={onReset}
                            className={`
                                w-full flex items-center justify-center gap-3 p-4 
                                font-black uppercase tracking-widest text-xs transition-all 
                                shadow-[0_4px_0_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(0,0,0,0.5)] 
                                border-2 
                                ${configChanged
                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/50 hover:bg-amber-500/20 hover:border-amber-400 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                    : 'bg-[#e0e0e0] text-black hover:bg-white border-black/20 shadow-[0_4px_0_#999] active:shadow-[0_2px_0_#999]'
                                }
                            `}
                        >
                            <RotateCcw size={18} className={configChanged ? "animate-spin-slow" : ""} />
                            {configChanged ? 'APLICAR CAMBIOS Y REINICIAR' : 'REINICIAR SISTEMA'}
                        </button>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleProtectedAction('pause', onTogglePause)}
                                className={`flex flex-row items-center justify-center gap-2 p-4 font-bold uppercase tracking-wider text-[10px] transition-all border-2 shadow-[0_4px_0_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(0,0,0,0.5)] ${lockedControlId === 'pause' ? 'bg-red-900 border-red-500 text-white animate-shake' :
                                    (isRunning || isExploding)
                                        ? 'bg-[#1a1a1a] border-[#333] text-amber-500 hover:border-amber-500/50'
                                        : 'bg-white text-black hover:bg-gray-200 border-gray-400'
                                    }`}
                            >
                                {lockedControlId === 'pause' ? <><Lock size={14} /> LOCKED</> : (isRunning || isExploding) ? <><Pause size={16} /> PAUSA</> : <><Play size={16} /> REANUDAR</>}
                            </button>
                            <button
                                onClick={() => handleProtectedAction('reset', onReset)}
                                className={`flex flex-row items-center justify-center gap-2 p-4 border-2 font-bold uppercase tracking-wider text-[10px] transition-all shadow-[0_4px_0_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(0,0,0,0.5)] ${lockedControlId === 'reset' ? 'bg-red-900 border-red-500 text-white animate-shake' :
                                    'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-red-500/50 hover:text-red-500'
                                    }`}
                            >
                                {lockedControlId === 'reset' ? <><Lock size={14} /> LOCKED</> : <><RotateCcw size={16} /> REINICIAR</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* MODULE 2: ENTITY PARAMETERS */}
            <div className="console-module p-4 rounded-sm">
                <div className="module-screw top-1 left-1"></div>
                <div className="module-screw top-1 right-1"></div>
                <div className="module-screw bottom-1 left-1"></div>
                <div className="module-screw bottom-1 right-1"></div>

                <div className="absolute -top-2 left-4 px-2 bg-[#16181b] text-[8px] text-gray-500 font-bold tracking-widest border border-[#2a2d31] z-10">ENTITY_LOADOUT_CONFIG</div>
                <div className={`space-y-4 ${lockedControlId === 'sliders' ? 'opacity-50 animate-shake' : ''}`}>
                    {[
                        { label: 'ALIADOS', key: 'allies', color: 'text-space-ally', led: 'bg-space-ally' },
                        { label: 'ENEMIGOS', key: 'enemies', color: 'text-space-enemy', led: 'bg-space-enemy' },
                        { label: 'CURANDEROS', key: 'healers', color: 'text-space-healer', led: 'bg-space-healer' },
                        { label: 'OBSTÁCULOS', key: 'obstacles', color: 'text-space-obstacle', led: 'bg-space-obstacle' }
                    ].map((item) => {
                        const isError = errorField === item.key;
                        return (
                            <div key={item.key} className={`flex flex-col gap-2 transition-colors duration-200 ${isError ? 'animate-shake' : ''}`}>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2">
                                        <div className={`w-1 h-1 rounded-full ${item.led} shadow-[0_0_4px_currentColor]`}></div>
                                        <span className={`${isError ? 'text-red-500' : 'text-gray-400'} font-bold text-[10px] transition-colors`}>{item.label}</span>
                                    </span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        disabled={isRunning}
                                        value={localCounts[item.key as keyof typeof config.entityCounts].toString().padStart(3, '0')}
                                        onChange={(e) => {
                                            // Allow only numbers
                                            const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                                            const val = parseInt(cleanVal);

                                            if (!isNaN(val)) {
                                                handleLocalChange(item.key as keyof typeof config.entityCounts, val);
                                            }
                                        }}
                                        onFocus={(e) => e.target.select()}
                                        onBlur={commitEntityChanges}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                commitEntityChanges();
                                                (e.target as HTMLInputElement).blur();
                                            }
                                        }}
                                        className={`${isError ? 'text-red-500 font-bold border-red-500' : 'text-white border-[#333] focus:border-gray-500'} text-[10px] font-mono bg-black px-1 border w-8 text-center outline-none transition-colors`}
                                    />
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
                                    className="w-full"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MODULE 3: EXECUTION OPTIONS */}
            <div className="console-module p-4 rounded-sm">
                <div className="module-screw top-1 left-1"></div>
                <div className="module-screw top-1 right-1"></div>
                <div className="module-screw bottom-1 left-1"></div>
                <div className="module-screw bottom-1 right-1"></div>

                <div className="absolute -top-2 left-4 px-2 bg-[#16181b] text-[8px] text-gray-500 font-bold tracking-widest border border-[#2a2d31] z-10">EXEC_ENVIRONMENT_OPTS</div>
                <div className="space-y-5">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-[10px] font-bold">TICK_RATE_MS</span>
                            <span className="text-white text-[10px] font-mono bg-black px-1 border border-[#333]">{config.renderSpeed.toString().padStart(3, '0')}</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="500"
                            step="10"
                            value={config.renderSpeed}
                            onChange={(e) => setConfig({ ...config, renderSpeed: parseInt(e.target.value) })}
                            className="w-full"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between bg-black/40 p-2 border border-[#222]">
                            <span className="flex items-center gap-2 text-gray-400 text-[10px] font-bold">
                                <Eye size={12} /> HUD_HEALTH_BARS
                            </span>
                            <button
                                onClick={() => setConfig({ ...config, showHealthBars: !config.showHealthBars })}
                                className={`relative inline-flex h-4 w-8 items-center rounded-sm transition-colors duration-200 focus:outline-none border border-[#333] ${config.showHealthBars ? 'bg-emerald-900/50' : 'bg-black'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-2.5 w-2.5 transform rounded-sm transition-transform duration-200 ${config.showHealthBars ? 'translate-x-4 bg-emerald-400 shadow-[0_0_5px_#34d399]' : 'translate-x-1 bg-[#222]'
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between bg-black/40 p-2 border border-[#222]">
                            <span className="flex items-center gap-2 text-gray-400 text-[10px] font-bold">
                                {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />} SYSTEM_AUDIO_FEED
                            </span>
                            <button
                                onClick={onToggleMute}
                                className={`relative inline-flex h-4 w-8 items-center rounded-sm transition-colors duration-200 focus:outline-none border border-[#333] ${!isMuted ? 'bg-emerald-900/50' : 'bg-black'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-2.5 w-2.5 transform rounded-sm transition-transform duration-200 ${!isMuted ? 'translate-x-4 bg-emerald-400 shadow-[0_0_5px_#34d399]' : 'translate-x-1 bg-[#222]'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* LAST RESORT - EMERGENCY PROTOCOL BUTTON */}
                    <div className="mt-2 landscape:hidden md:landscape:block">
                        {renderNukeButton("h-24")}
                    </div>
                </div>
            </div>

            {/* MODULE 4: SYSTEM UTILITIES */}
            <div className="mt-auto pt-4 pb-6 flex flex-col gap-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => handleProtectedAction('defaults', onSetDefaults)}
                        disabled={isRunning}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 text-[9px] uppercase tracking-widest font-bold border border-[#222] bg-[#121212] text-gray-500 hover:text-white hover:bg-[#1a1a1a] transition-all shadow-[0_2px_0_#000] active:translate-y-[1px] active:shadow-none ${isRunning ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                        <Undo2 size={12} /> DEFAULTS
                    </button>

                    <button
                        onClick={onAbort}
                        className="flex-1 flex items-center justify-center gap-2 p-3 text-[9px] uppercase tracking-widest font-bold border border-red-900/30 bg-[#1a0000] text-red-900 hover:bg-red-900/20 hover:border-red-600 hover:text-red-500 transition-all shadow-[0_2px_0_#000] active:translate-y-[1px] active:shadow-none"
                    >
                        <LogOut size={12} /> ABORT_OP
                    </button>
                </div>

                <div className="flex items-center justify-center gap-2 opacity-40">
                    <div className="h-[1px] flex-1 bg-gray-700"></div>
                    <div className="text-[7px] text-gray-400 font-bold tracking-[0.3em]">GENETIX_CORP_SECURE_LINK</div>
                    <div className="h-[1px] flex-1 bg-gray-700"></div>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;