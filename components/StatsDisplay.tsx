import React, { useRef } from 'react';
import { DetailedStats } from '../types';
import { Clock, Swords, ShieldAlert, Heart, Percent, Skull, Camera, Trophy, AlertTriangle } from 'lucide-react';
import html2canvas from 'html2canvas';

interface StatsDisplayProps {
    stats: DetailedStats;
    missionId?: string;
    gameResult?: string | null;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats, missionId = '00000', gameResult }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDownloadImage = async () => {
        if (!cardRef.current) return;

        try {
            // Create a canvas from the element
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: '#08090a', // Match the background color
                scale: 2, // Higher resolution
                logging: false,
                useCORS: true, // If there are any external images
                scrollY: -window.scrollY, // Fix for potential cropping due to scroll
                onclone: (clonedDoc) => {
                    // Ensure the cloned element has the correct background and padding if needed
                    const element = clonedDoc.querySelector('[data-capture-target]') as HTMLElement;
                    if (element) {
                        element.style.padding = '40px';
                        element.style.backgroundColor = '#08090a';
                        // Force a fixed width for the capture to prevent layout shifts/wrapping on small screens
                        element.style.width = '600px';
                        element.style.maxWidth = 'none'; // Override any max-width
                        element.style.boxSizing = 'border-box';

                        // Show the capture-only dots
                        const captureDots = element.querySelector('.capture-only-dots') as HTMLElement;
                        if (captureDots) {
                            captureDots.style.display = 'flex';
                        }
                    }
                }
            });

            // Convert to blob
            canvas.toBlob((blob) => {
                if (!blob) return;

                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `GENETIX_REPORT_${missionId}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 'image/png');

        } catch (error) {
            console.error('Error generating image:', error);
        }
    };

    const isVictory = gameResult === 'ALLIES_WIN';
    const isDraw = gameResult === 'DRAW';

    let resultText = 'MISIÓN FALLIDA';
    let resultColorClass = 'bg-red-900/10 border-red-500/30 text-red-400';
    let ResultIcon = AlertTriangle;

    if (isVictory) {
        resultText = 'MISIÓN COMPLETADA';
        resultColorClass = 'bg-emerald-900/10 border-emerald-500/30 text-emerald-400';
        ResultIcon = Trophy;
    } else if (isDraw) {
        resultText = 'ESTANCAMIENTO';
        resultColorClass = 'bg-yellow-900/10 border-yellow-500/30 text-yellow-400';
        ResultIcon = AlertTriangle;
    }

    return (
        <div className="w-full" ref={cardRef} data-capture-target>
            <div className="bg-[#08090a] border border-[#222529] p-4 rounded-sm shadow-2xl relative overflow-hidden">

                {/* Header Row */}
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">DETAILED_ANALYTICS_V3.5</span>
                        <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase">// MISSION: {missionId}</span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        <div className="flex gap-1" data-html2canvas-ignore>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                        <button
                            onClick={handleDownloadImage}
                            className="text-emerald-500 hover:text-white transition-colors flex items-center gap-1 group bg-emerald-500/10 px-2 py-1 rounded hover:bg-emerald-500/20"
                            title="Descargar Imagen del Reporte"
                            data-html2canvas-ignore
                        >
                            <Camera size={14} />
                            <span className="text-[9px] font-bold uppercase tracking-wider hidden sm:block">CAPTURAR</span>
                        </button>
                        {/* Dots for capture only - visible when button is hidden */}
                        <div className="hidden gap-1 capture-only-dots">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Game Result Banner */}
                {gameResult && (
                    <div className={`mb-6 p-4 border flex items-center justify-center gap-3 rounded-sm ${resultColorClass}`}>
                        <ResultIcon size={24} className="shrink-0" />
                        <span className="text-xl font-black tracking-[0.2em] uppercase drop-shadow-lg leading-none pt-1 whitespace-nowrap">
                            {resultText}
                        </span>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 relative z-10 mb-6">
                    {/* Survival Rate - Highlighted */}
                    <div className="col-span-2 bg-[#111316] p-4 border border-white/5 flex items-center justify-between rounded-sm">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Percent size={18} />
                            <span className="text-[10px] uppercase tracking-widest font-bold pt-0.5">TASA_SUPERVIVENCIA</span>
                        </div>
                        <div className="text-4xl font-mono text-white drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">{stats.survivalRate}</div>
                    </div>

                    {/* Lifespans */}
                    <div className="bg-[#111316] p-4 border border-white/5 flex flex-col items-center justify-center gap-2 rounded-sm text-center">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Clock size={14} />
                            <span className="text-[9px] uppercase tracking-wider font-bold pt-0.5">VIDA_MEDIA_ALI</span>
                        </div>
                        <div className="text-2xl font-mono text-space-ally">{stats.averageAllyLifespan} <span className="text-[9px] opacity-50 ml-1">TICKS</span></div>
                    </div>

                    <div className="bg-[#111316] p-4 border border-white/5 flex flex-col items-center justify-center gap-2 rounded-sm text-center">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Skull size={14} />
                            <span className="text-[9px] uppercase tracking-wider font-bold pt-0.5">VIDA_MEDIA_ENE</span>
                        </div>
                        <div className="text-2xl font-mono text-space-enemy">{stats.averageEnemyLifespan} <span className="text-[9px] opacity-50 ml-1">TICKS</span></div>
                    </div>

                    {/* Damage Stats */}
                    <div className="bg-[#111316] p-4 border border-white/5 flex flex-col items-center justify-center gap-2 rounded-sm text-center">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Swords size={14} />
                            <span className="text-[9px] uppercase tracking-wider font-bold pt-0.5">DAÑO_INFLIGIDO</span>
                        </div>
                        <div className="text-2xl font-mono text-white">{stats.totalDamageDealtByAllies.toLocaleString()}</div>
                    </div>

                    <div className="bg-[#111316] p-4 border border-white/5 flex flex-col items-center justify-center gap-2 rounded-sm text-center">
                        <div className="flex items-center gap-2 text-gray-400">
                            <ShieldAlert size={14} />
                            <span className="text-[9px] uppercase tracking-wider font-bold pt-0.5">DAÑO_RECIBIDO</span>
                        </div>
                        <div className="text-2xl font-mono text-white">{stats.totalDamageDealtByEnemies.toLocaleString()}</div>
                    </div>

                    {/* Healing */}
                    <div className="col-span-2 bg-[#111316] p-4 border border-white/5 flex items-center justify-between rounded-sm">
                        <div className="flex items-center gap-2 text-space-healer">
                            <Heart size={18} />
                            <span className="text-[10px] uppercase tracking-widest font-bold pt-0.5">CURACIÓN_TOTAL</span>
                        </div>
                        <div className="text-3xl font-mono text-white">{stats.totalHealingDone.toLocaleString()} <span className="text-[10px] opacity-50 ml-1">HP</span></div>
                    </div>
                </div>

                {/* Footer Data */}
                <div className="flex justify-between items-center pt-4 border-t border-white/10 text-[8px] text-white/20 font-mono tracking-[0.2em] uppercase">
                    <span>SECURE_DATA_LINK_ENCRYPTED</span>
                    <span>V.3.5.0_STABLE</span>
                </div>
            </div>
        </div>
    );
};

export default StatsDisplay;
