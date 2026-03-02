import React from 'react';
import { DetailedStats } from '../types';
import { Clock, Swords, ShieldAlert, Heart, Percent, Skull } from 'lucide-react';

interface StatsDisplayProps {
    stats: DetailedStats;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 gap-1 w-full">
            {/* Survival Rate - Highlighted */}
            <div className="col-span-2 bg-space-dark p-2 border border-space-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-space-ally">
                    <Percent size={14} />
                    <span className="text-[9px] uppercase tracking-widest font-bold">SUPERVIVENCIA</span>
                </div>
                <div className="text-xl font-mono text-white">{stats.survivalRate}</div>
            </div>

            {/* Lifespans */}
            <div className="bg-space-dark p-2 border border-space-border flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
                    <Clock size={12} />
                    <span className="text-[8px] uppercase tracking-wider">VIDA (ALI)</span>
                </div>
                <div className="text-base font-mono text-space-ally">{stats.averageAllyLifespan} <span className="text-[9px] text-gray-500">t</span></div>
            </div>

            <div className="bg-space-dark p-2 border border-space-border flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
                    <Skull size={12} />
                    <span className="text-[8px] uppercase tracking-wider">VIDA (ENE)</span>
                </div>
                <div className="text-base font-mono text-space-enemy">{stats.averageEnemyLifespan} <span className="text-[9px] text-gray-500">t</span></div>
            </div>

            {/* Damage Stats */}
            <div className="bg-space-dark p-2 border border-space-border flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
                    <Swords size={12} />
                    <span className="text-[8px] uppercase tracking-wider">DAÑO</span>
                </div>
                <div className="text-base font-mono text-white">{stats.totalDamageDealtByAllies.toLocaleString()}</div>
            </div>

            <div className="bg-space-dark p-2 border border-space-border flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
                    <ShieldAlert size={12} />
                    <span className="text-[8px] uppercase tracking-wider">RECIBIDO</span>
                </div>
                <div className="text-base font-mono text-white">{stats.totalDamageDealtByEnemies.toLocaleString()}</div>
            </div>

            {/* Healing */}
            <div className="col-span-2 bg-space-dark p-2 border border-space-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-space-healer">
                    <Heart size={14} />
                    <span className="text-[9px] uppercase tracking-widest font-bold">CURACIÓN</span>
                </div>
                <div className="text-lg font-mono text-white">{stats.totalHealingDone.toLocaleString()} <span className="text-[9px] text-gray-500">HP</span></div>
            </div>
        </div>
    );
};

export default StatsDisplay;
