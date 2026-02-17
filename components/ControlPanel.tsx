import React from 'react';
import { GameConfig } from '../types';
import { Sliders, Activity, Eye, Play, Pause, RotateCcw, Power, Undo2, LogOut } from 'lucide-react';

interface ControlPanelProps {
    config: GameConfig;
    isRunning: boolean;
    hasStarted: boolean;
    setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
    onTogglePause: () => void;
    onReset: () => void;
    onStart: () => void;
    onSetDefaults: () => void;
    onAbort: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, isRunning, hasStarted, setConfig, onTogglePause, onReset, onStart, onSetDefaults, onAbort }) => {
    
    const handleEntityChange = (key: keyof typeof config.entityCounts, value: number) => {
        setConfig(prev => ({
            ...prev,
            entityCounts: {
                ...prev.entityCounts,
                [key]: Math.max(0, Math.min(200, value))
            }
        }));
    };

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
                    margin-top: -2px; /* Adjusted from -3px to -2px to lower it further */
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
            `}</style>
            
            {/* Main Controls - Logic: If not started, Show Start. If started, show Pause/Reset */}
            <div className="flex flex-col gap-2">
                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">COMANDOS PRINCIPALES</div>
                
                {!hasStarted ? (
                    <button 
                        onClick={onStart}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-wider text-xs transition-all animate-pulse"
                    >
                        <Power size={16} /> INICIAR SIMULACIÓN
                    </button>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={onTogglePause}
                            className={`flex items-center justify-center gap-2 p-3 font-bold uppercase tracking-wider text-xs transition-all ${
                                isRunning 
                                ? 'bg-transparent border border-space-border text-yellow-500 hover:border-yellow-500' 
                                : 'bg-white text-black hover:bg-gray-200'
                            }`}
                        >
                            {isRunning ? <><Pause size={14} /> PAUSA</> : <><Play size={14} /> REANUDAR</>}
                        </button>
                        <button 
                            onClick={onReset}
                            className="flex items-center justify-center gap-2 p-3 bg-transparent border border-space-border text-white hover:border-red-500 hover:text-red-500 font-bold uppercase tracking-wider text-xs transition-colors"
                        >
                            <RotateCcw size={14} /> REINICIAR
                        </button>
                    </div>
                )}
            </div>

            {/* Entity Config */}
            <div>
                 <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4 border-b border-space-border pb-2">
                    <Sliders size={12} />
                    <span>PARÁMETROS (REQ. REINICIO)</span>
                </div>
                
                <div className="space-y-4">
                    {[
                        { label: 'ALIADOS', key: 'allies', color: 'text-space-ally' },
                        { label: 'ENEMIGOS', key: 'enemies', color: 'text-space-enemy' },
                        { label: 'CURANDEROS', key: 'healers', color: 'text-space-healer' },
                        { label: 'OBSTÁCULOS', key: 'obstacles', color: 'text-space-obstacle' }
                    ].map((item) => (
                        <div key={item.key} className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <span className={`${item.color} font-bold text-xs`}>{item.label}</span>
                                <span className="text-gray-400 text-xs">{config.entityCounts[item.key as keyof typeof config.entityCounts]}</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="150" 
                                disabled={isRunning}
                                value={config.entityCounts[item.key as keyof typeof config.entityCounts]} 
                                onChange={(e) => handleEntityChange(item.key as keyof typeof config.entityCounts, parseInt(e.target.value))}
                                className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isRunning ? 'bg-gray-800' : 'bg-space-border'}`}
                            />
                        </div>
                    ))}
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
                            onChange={(e) => setConfig({...config, renderSpeed: parseInt(e.target.value)})}
                            className="w-full h-1 bg-space-border rounded-lg appearance-none cursor-pointer"
                        />
                         <div className="flex justify-between text-[10px] text-gray-600">
                            <span>Rápido</span>
                            <span>Lento</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                         <span className="flex items-center gap-2 text-white text-xs">
                             <Eye size={14} /> INTERFAZ HUD (SALUD)
                         </span>
                         {/* Toggle Switch */}
                         <button 
                            onClick={() => setConfig({...config, showHealthBars: !config.showHealthBars})}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                                config.showHealthBars ? 'bg-white' : 'bg-space-dark border border-space-border'
                            }`}
                        >
                            <span
                                className={`inline-block h-3 w-3 transform rounded-full transition-transform duration-200 ${
                                    config.showHealthBars ? 'translate-x-5 bg-black' : 'translate-x-1 bg-gray-500'
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Actions: Defaults & Abort */}
            <div className="mt-auto pt-4 border-t border-space-border flex flex-col gap-3">
                <button
                    onClick={onSetDefaults}
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