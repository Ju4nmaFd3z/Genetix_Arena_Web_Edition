import React from 'react';
import { DetailedStats } from '../types';
import { Clock, Swords, ShieldAlert, Heart, Percent, Skull } from 'lucide-react';

interface StatsDisplayProps {
    stats: DetailedStats;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Monitor Header */}
            <div className="flex items-center justify-between px-2 py-1 bg-[#08090a] border-l-2 border-emerald-500">
                <span className="text-[9px] font-bold text-emerald-500 tracking-widest uppercase">DETAILED_ANALYTICS_V3.5</span>
                <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-emerald-500/20"></div>
                    <div className="w-1 h-1 rounded-full bg-emerald-500/20"></div>
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
            </div>

            <div className="relative p-2 bg-[#111316] border-2 border-[#222529] rounded-sm shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] overflow-hidden">
                {/* CRT Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,0,0.06))] bg-[length:100%_2px,3px_100%] z-20"></div>

                <div className="grid grid-cols-2 gap-3 relative z-10">
                    {/* Survival Rate - Highlighted */}
                    <div className="col-span-2 bg-black/40 p-3 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Percent size={16} />
                            <span className="text-[10px] uppercase tracking-widest font-bold">TASA_SUPERVIVENCIA</span>
                        </div>
                        <div className="text-3xl font-mono text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">{stats.survivalRate}</div>
                    </div>

                    {/* Lifespans */}
                    <div className="bg-black/40 p-3 border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <Clock size={14} />
                            <span className="text-[8px] uppercase tracking-wider font-bold">VIDA_MEDIA_ALI</span>
                        </div>
                        <div className="text-xl font-mono text-space-ally">{stats.averageAllyLifespan} <span className="text-[8px] opacity-50">TICKS</span></div>
                    </div>

                    <div className="bg-black/40 p-3 border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <Skull size={14} />
                            <span className="text-[8px] uppercase tracking-wider font-bold">VIDA_MEDIA_ENE</span>
                        </div>
                        <div className="text-xl font-mono text-space-enemy">{stats.averageEnemyLifespan} <span className="text-[8px] opacity-50">TICKS</span></div>
                    </div>

                    {/* Damage Stats */}
                    <div className="bg-black/40 p-3 border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <Swords size={14} />
                            <span className="text-[8px] uppercase tracking-wider font-bold">DAÑO_INFLIGIDO</span>
                        </div>
                        <div className="text-xl font-mono text-white">{stats.totalDamageDealtByAllies.toLocaleString()}</div>
                    </div>

                    <div className="bg-black/40 p-3 border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <ShieldAlert size={14} />
                            <span className="text-[8px] uppercase tracking-wider font-bold">DAÑO_RECIBIDO</span>
                        </div>
                        <div className="text-xl font-mono text-white">{stats.totalDamageDealtByEnemies.toLocaleString()}</div>
                    </div>

                    {/* Healing */}
                    <div className="col-span-2 bg-black/40 p-3 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-space-healer">
                            <Heart size={16} />
                            <span className="text-[10px] uppercase tracking-widest font-bold">CURACIÓN_TOTAL</span>
                        </div>
                        <div className="text-2xl font-mono text-white">{stats.totalHealingDone.toLocaleString()} <span className="text-[10px] opacity-50">HP</span></div>
                    </div>
                </div>
            </div>

            {/* Footer Data */}
            <div className="flex justify-between items-center px-1 text-[7px] text-gray-600 font-bold tracking-[0.2em]">
                <span>SECURE_DATA_LINK_ENCRYPTED</span>
                <span>V.3.5.0_STABLE</span>
            </div>
        </div>
    );
};

export default StatsDisplay;
