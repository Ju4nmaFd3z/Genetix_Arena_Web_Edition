import React from 'react';
import { DetailedStats } from '../types';
import { Clock, Swords, ShieldAlert, Heart, Percent, Skull } from 'lucide-react';

interface StatsDisplayProps {
    stats: DetailedStats;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 gap-2 w-full">
            {/* Survival Rate - Highlighted */}
            <div className="col-span-2 bg-space-dark p-3 border border-space-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-space-ally">
                    <Percent size={16} />
                    <span className="text-[10px] uppercase tracking-widest font-bold">TASA DE SUPERVIVENCIA</span>
                </div>
                <div className="text-2xl font-mono text-white">{stats.survivalRate}</div>
            </div>

            {/* Lifespans */}
            <div className="bg-space-dark p-3 border border-space-border flex flex-col gap-1">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Clock size={14} />
                    <span className="text-[9px] uppercase tracking-wider">VIDA MEDIA (ALIADOS)</span>
                </div>
                <div className="text-lg font-mono text-space-ally">{stats.averageAllyLifespan} <span className="text-[10px] text-gray-500">ticks</span></div>
            </div>

            <div className="bg-space-dark p-3 border border-space-border flex flex-col gap-1">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Skull size={14} />
                    <span className="text-[9px] uppercase tracking-wider">VIDA MEDIA (ENEMIGOS)</span>
                </div>
                <div className="text-lg font-mono text-space-enemy">{stats.averageEnemyLifespan} <span className="text-[10px] text-gray-500">ticks</span></div>
            </div>

            {/* Damage Stats */}
            <div className="bg-space-dark p-3 border border-space-border flex flex-col gap-1">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Swords size={14} />
                    <span className="text-[9px] uppercase tracking-wider">DAÑO INFLIGIDO (ALI)</span>
                </div>
                <div className="text-lg font-mono text-white">{stats.totalDamageDealtByAllies.toLocaleString()}</div>
            </div>

            <div className="bg-space-dark p-3 border border-space-border flex flex-col gap-1">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <ShieldAlert size={14} />
                    <span className="text-[9px] uppercase tracking-wider">DAÑO RECIBIDO (ALI)</span>
                </div>
                <div className="text-lg font-mono text-white">{stats.totalDamageDealtByEnemies.toLocaleString()}</div>
            </div>

            {/* Healing */}
            <div className="col-span-2 bg-space-dark p-3 border border-space-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-space-healer">
                    <Heart size={16} />
                    <span className="text-[10px] uppercase tracking-widest font-bold">CURACIÓN TOTAL REALIZADA</span>
                </div>
                <div className="text-xl font-mono text-white">{stats.totalHealingDone.toLocaleString()} <span className="text-[10px] text-gray-500">HP</span></div>
            </div>
        </div>
    );
};

export default StatsDisplay;
